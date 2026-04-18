from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory


load_dotenv()

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = ROOT / "RTRP"
DATA_DIR = Path(__file__).resolve().parent / "data"
AREA_RULES_PATH = DATA_DIR / "area_rules.json"
BIN_LOCATIONS_PATH = DATA_DIR / "bin_locations.json"
ISSUES_PATH = DATA_DIR / "issues.json"


app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")


def _read_json(path: Path) -> Any:
  return json.loads(path.read_text(encoding="utf-8"))


def _norm(s: str) -> str:
  s = (s or "").strip().lower()
  # Normalize punctuation (commas, dots, etc.) so area matching works for
  # inputs like "Hyderabad, Telangana" vs "Hyderabad Telangana".
  s = re.sub(r"[^a-z0-9]+", " ", s)
  s = re.sub(r"\s+", " ", s).strip()
  return s


def _match_area(area_input: str, rules: Dict[str, Any]) -> Optional[Dict[str, Any]]:
  q = _norm(area_input)
  if not q:
    return None
  for a in rules.get("areas", []):
    for alias in a.get("aliases", []):
      al = _norm(alias)
      if not al:
        continue
      if q == al or q in al or al in q:
        return a
  return None


def _bin_key_from_category(bin_category: str) -> str:
  b = _norm(bin_category)
  if "recycl" in b:
    return "recycling"
  if "compost" in b or "organics" in b or "organic" in b or "wet" in b:
    return "organics"
  if "sanitary" in b:
    return "sanitary"
  if "e waste" in b or "ewaste" in b or "electronics" in b or "electronic" in b:
    return "ewaste"
  if "hazard" in b or "chemical" in b or "battery" in b:
    return "hazardous"
  if "general" in b or "garbage" in b or "residual" in b or "landfill" in b:
    return "general"
  return "general"


def _extract_first_json(text: str) -> Optional[Dict[str, Any]]:
  if not text:
    return None
  # Remove common markdown fences if present.
  cleaned = text.replace("```json", "```").strip()
  cleaned = cleaned.strip("` \n\t")
  try:
    obj = json.loads(cleaned)
    if isinstance(obj, dict):
      return obj
  except Exception:
    pass

  m = re.search(r"\{[\s\S]*\}", text)
  if not m:
    return None
  try:
    obj = json.loads(m.group(0))
    if isinstance(obj, dict):
      return obj
  except Exception:
    return None
  return None


def _anthropic_call(query: str, area_name: Optional[str], area_bin_colors: Optional[Dict[str, str]]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
  api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
  if not api_key:
    return None, "Missing ANTHROPIC_API_KEY."

  model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514").strip()
  url = "https://api.anthropic.com/v1/messages"

  allowed_bins = ["Recycling", "Compost", "Organics", "General Waste", "Hazardous", "E-Waste", "Sanitary"]
  bin_color_hint = ""
  if area_name and area_bin_colors:
    # Hint the model about the local naming. We still compute final binColor server-side.
    keys = ", ".join(f"{k}={v}" for k, v in area_bin_colors.items())
    bin_color_hint = f"\nArea bin-color mapping (for context): {keys}\n"

  system = (
    "You are EcoSort AI, a garbage sorting assistant.\n"
    "Your job: classify a single item into a waste category and give a short practical tip.\n"
    "Return ONLY valid JSON, no markdown, no extra text.\n"
    "Use this exact schema:\n"
    '{\"bin\":\"one of: ' + " | ".join(allowed_bins) + '\",'
    '\"icon\":\"single emoji\",'
    '\"tip\":\"1-2 short sentences\",'
    '\"grounding_note\":\"short note about whether this is locality-specific\"}\n'
    + (f"Area provided by user: {area_name}\n" if area_name else "Area provided by user: (none)\n")
    + bin_color_hint
    + "Rules:\n"
    "- If unsure, pick the safest category (Hazardous/E-Waste over general) and ask for material in the tip.\n"
    "- Do NOT invent citations or URLs.\n"
  )

  payload = {
    "model": model,
    "max_tokens": 700,
    "system": system,
    "messages": [{"role": "user", "content": f'What bin does \"{query}\" go in?'}],
  }

  headers = {
    "content-type": "application/json",
    "x-api-key": api_key,
    "anthropic-version": "2023-06-01",
  }

  r = requests.post(url, headers=headers, json=payload, timeout=30)
  if r.status_code >= 400:
    return None, f"Anthropic API error: {r.status_code} {r.text[:300]}"

  data = r.json()
  parts = data.get("content") or []
  text = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
  parsed = _extract_first_json(text)
  if not parsed:
    # One retry with stricter formatting instruction.
    payload_retry = dict(payload)
    payload_retry["system"] = system + (
      "\nIMPORTANT: Your entire output must be a single JSON object. "
      "No code fences, no commentary, no trailing commas.\n"
    )
    r2 = requests.post(url, headers=headers, json=payload_retry, timeout=30)
    if r2.status_code >= 400:
      return None, f"Anthropic API error (retry): {r2.status_code} {r2.text[:300]}"
    data2 = r2.json()
    parts2 = data2.get("content") or []
    text2 = "".join(p.get("text", "") for p in parts2 if isinstance(p, dict))
    parsed2 = _extract_first_json(text2)
    if not parsed2:
      return None, "Failed to parse JSON response from model."
    return parsed2, None
  return parsed, None


def _heuristic_sort(query: str) -> Dict[str, str]:
  """
  Keyword fallback when the LLM is unavailable.
  This keeps the UI functional and still returns correct *area bin colors*.
  """
  q = _norm(query)

  # Electronics
  if any(k in q for k in ["phone", "laptop", "computer", "electronics", "tablet", "charger", "e waste", "ewaste"]):
    return {
      "bin": "E-Waste",
      "icon": "📱",
      "tip": "Take electronics to an e-waste drop-off or manufacturer take-back. Remove batteries if possible.",
    }

  # Hazardous / special
  if any(k in q for k in ["battery", "batteries", "paint", "chemical", "chemicals", "medicine", "medication", "pesticide", "oil", "motor oil", "thermometer", "bulb"]):
    return {
      "bin": "Hazardous",
      "icon": "⚠️",
      "tip": "Hazardous items should go to a designated collection point. Check local drop-off rules for safe disposal.",
    }

  # Sanitary
  if any(k in q for k in ["diaper", "diapers", "nappy", "nappies", "sanitary", "tissue", "sanitary products"]):
    return {
      "bin": "Sanitary",
      "icon": "🚫",
      "tip": "Sanitary waste usually goes to a separate sanitary stream. Follow your local rules for collection and disposal.",
    }

  # Compost / organics
  if any(k in q for k in ["banana peel", "banana", "apple core", "apple", "coffee", "grounds", "tea bag", "vegetable", "peel", "eggshell", "eggshells", "grass clippings", "leaves", "food scraps", "bread"]):
    return {
      "bin": "Compost",
      "icon": "🌿",
      "tip": "Place food/yard organics in your compost/organics stream. Keep it free of plastics and liquids when possible.",
    }

  # Recycling
  if any(k in q for k in ["newspaper", "paper", "cardboard", "glass", "bottle", "jar", "can", "cans", "aluminium", "aluminum", "tin can", "metal", "magazine"]):
    return {
      "bin": "Recycling",
      "icon": "♻️",
      "tip": "Recycle accepted materials in your recycling bin. Empty and rinse containers; keep paper dry.",
    }

  return {
    "bin": "General Waste",
    "icon": "🗑️",
    "tip": "If it doesn't clearly fit recycling or compost, place it in general/residual waste. When in doubt, check your local waste guide.",
  }


@app.get("/")
def index():
  return send_from_directory(FRONTEND_DIR, "ai garbage sort assistant.html")


@app.get("/map")
def map_page():
  return send_from_directory(FRONTEND_DIR, "map.html")


@app.get("/api/health")
def health():
  ok = bool(os.getenv("ANTHROPIC_API_KEY", "").strip())
  return jsonify({"ok": True, "anthropicKeyConfigured": ok})


@app.post("/api/sort")
def sort_item():
  body = request.get_json(silent=True) or {}
  query = (body.get("query") or "").strip()
  area = (body.get("area") or "").strip()

  if not query:
    return jsonify({"error": "Missing query."}), 400

  rules = _read_json(AREA_RULES_PATH)
  area_rec = _match_area(area, rules) if area else None

  area_name = area_rec.get("name") if area_rec else None
  area_bin_colors = area_rec.get("binColors") if area_rec else None
  sources = area_rec.get("sources", []) if area_rec else []

  parsed, err = _anthropic_call(query=query, area_name=area_name, area_bin_colors=area_bin_colors)
  if err or not parsed:
    # Keep the app reliable: return a grounded color mapping even if LLM is down.
    heur = _heuristic_sort(query)
    bin_category = heur.get("bin", "General Waste")
    icon = heur.get("icon", "🗑️")
    tip = heur.get("tip", "")
  else:
    bin_category = (parsed.get("bin") or "").strip() or "General Waste"
    icon = (parsed.get("icon") or "🗑️").strip()
    tip = (parsed.get("tip") or "").strip()

  grounded = bool(area_rec)
  bin_key = _bin_key_from_category(bin_category)
  bin_color = None
  if area_rec and isinstance(area_bin_colors, dict):
    bin_color = area_bin_colors.get(bin_key) or area_bin_colors.get("general")

  area_guide = None
  if area_rec:
    area_guide = {
      "areaName": area_name,
      "binColors": area_bin_colors or {},
      "sources": sources,
    }

  return jsonify(
    {
      "bin": bin_category,
      "icon": icon,
      "tip": tip,
      "binColor": bin_color,
      "grounded": grounded,
      "areaMatched": area_name,
      "sources": sources if grounded else [],
      "areaGuide": area_guide,
    }
  )


@app.get("/api/bins")
def get_bins():
  bins_data = _read_json(BIN_LOCATIONS_PATH)
  return jsonify({"bins": bins_data.get("bins", [])})


@app.post("/api/bins")
def add_bin():
  body = request.get_json(silent=True) or {}
  required = ["name", "types", "coordinates"]
  if not all(k in body for k in required):
    return jsonify({"error": "Missing required fields: name, types, coordinates"}), 400
  
  bins_data = _read_json(BIN_LOCATIONS_PATH)
  new_id = f"bin_{len(bins_data.get('bins', [])) + 1:03d}"
  new_bin = {
    "id": new_id,
    "areaId": body.get("areaId", ""),
    "name": body["name"],
    "types": body["types"],
    "coordinates": body["coordinates"],
    "address": body.get("address", ""),
    "hours": body.get("hours", ""),
    "phone": body.get("phone", ""),
    "notes": body.get("notes", "")
  }
  bins_data["bins"].append(new_bin)
  BIN_LOCATIONS_PATH.write_text(json.dumps(bins_data, indent=2), encoding="utf-8")
  return jsonify({"message": "Bin added", "bin": new_bin})


@app.post("/api/issues")
def report_issue():
  body = request.get_json(silent=True) or {}
  required = ["binId", "issueType"]
  if not all(k in body for k in required):
    return jsonify({"error": "Missing required fields: binId, issueType"}), 400
  
  issues_data = _read_json(ISSUES_PATH)
  new_issue = {
    "id": f"issue_{len(issues_data.get('issues', [])) + 1:03d}",
    "binId": body["binId"],
    "issueType": body["issueType"],
    "description": body.get("description", ""),
    "timestamp": "2024-01-01T00:00:00Z"  # placeholder
  }
  issues_data["issues"].append(new_issue)
  ISSUES_PATH.write_text(json.dumps(issues_data, indent=2), encoding="utf-8")
  return jsonify({"message": "Issue reported", "issue": new_issue})


if __name__ == "__main__":
  host = os.getenv("FLASK_HOST", "127.0.0.1")
  port = int(os.getenv("FLASK_PORT", "5000"))
  debug = os.getenv("FLASK_DEBUG", "1").strip() not in ("0", "false", "False")
  app.run(host=host, port=port, debug=debug)

