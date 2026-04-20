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

# In-memory conversation history (simple dict keyed by session ID)
conversation_history = {}

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


def _ollama_call(query: str, area_name: Optional[str], area_bin_colors: Optional[Dict[str, str]]) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
  api_key = os.getenv("OLLAMA_API_KEY", "").strip()
  # Ollama typically runs locally, not requiring an API key
  # But we'll keep the key check for backward compatibility

  model = os.getenv("OLLAMA_MODEL", "llama2").strip()
  # Use local Ollama instance instead of cloud API
  url = "http://localhost:11434/api/generate"

  allowed_bins = ["Recycling", "Compost", "Organics", "General Waste", "Hazardous", "E-Waste", "Sanitary"]
  bin_color_hint = ""
  if area_name and area_bin_colors:
    # Hint the model about the local naming. We still compute final binColor server-side.
    keys = ", ".join(f"{k}={v}" for k, v in area_bin_colors.items())
    bin_color_hint = f"\nArea bin-color mapping (for context): {keys}\n"

  system = (
    "You are EcoSort AI, a garbage sorting assistant. Return ONLY valid JSON, no markdown.\n"
    + " | ".join(allowed_bins) + '\n'
    + (f"Area: {area_name}\n" if area_name else "")
    + bin_color_hint
    + f"What bin for: {query}?"
  )

  payload = {
    "model": model,
    "prompt": system,
    "stream": False,
  }

  # Local Ollama doesn't need authorization headers
  headers = {
    "content-type": "application/json",
  }

  try:
    r = requests.post(url, headers=headers, json=payload, timeout=120)
    if r.status_code >= 400:
      return None, f"Ollama API error: {r.status_code}"

    data = r.json()
    text = data.get("response", "")
    parsed = _extract_first_json(text)
    if not parsed:
      return None, "Failed to parse JSON from Ollama."
    return parsed, None
  except Exception as e:
    return None, f"Ollama error: {str(e)}"


def _ollama_chat(messages: list, area_name: Optional[str] = None) -> Tuple[Optional[str], Optional[str]]:
  """
  General-purpose chat using OpenAI-compatible API (works with Together AI, etc.)
  Messages should be a list of {"role": "user"/"assistant", "content": "..."} dicts.
  """
  # Use the local Ollama HTTP API (no API key required)
  model = os.getenv("OLLAMA_MODEL", "llama2").strip()
  url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")

  system = (
    "You are EcoSort AI, a helpful garbage sorting and sustainability assistant.\n"
    "Help with: bin types, waste disposal, eco-tips, local recycling rules.\n"
    "Be concise, friendly, and practical.\n"
    + (f"User's area: {area_name}\n" if area_name else "")
  )

  # Build conversation history as a single prompt
  prompt = system + "\n\n"
  for msg in messages:
    role = msg.get("role", "user")
    content = msg.get("content", "")
    if role == "user":
      prompt += f"User: {content}\n"
    else:
      prompt += f"Assistant: {content}\n"
  prompt += "Assistant:"

  payload = {
    "model": model,
    "prompt": prompt,
    "stream": False,
  }

  headers = {"content-type": "application/json"}

  try:
    r = requests.post(url, headers=headers, json=payload, timeout=120)
    if r.status_code >= 400:
      return None, f"Ollama API error: {r.status_code} - {r.text}"

    data = r.json()
    text = data.get("response", "")
    return text, None
  except Exception as e:
    return None, f"Error calling Ollama: {str(e)}"


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


@app.get("/api/health")
def health():
  # Don't require API key for health check
  return jsonify({"ok": True, "ollamaKeyConfigured": bool(os.getenv("OLLAMA_API_KEY", "").strip())})


@app.post("/api/chat")
def chat():
  """
  General chat endpoint with conversation history.
  Expects: {"message": "user message", "sessionId": "optional-session-id", "area": "optional-area"}
  """
  body = request.get_json(silent=True) or {}
  message = (body.get("message") or "").strip()
  session_id = (body.get("sessionId") or "default").strip()
  area = (body.get("area") or "").strip()

  if not message:
    return jsonify({"error": "Missing message."}), 400

  # Get or create conversation history for this session
  if session_id not in conversation_history:
    conversation_history[session_id] = []

  history = conversation_history[session_id]
  
  # Limit history to last 10 exchanges to avoid token bloat
  if len(history) > 20:
    history = history[-20:]
    conversation_history[session_id] = history

  # Add user message to history
  history.append({"role": "user", "content": message})

  # Call Claude with history
  response_text, err = _ollama_chat(history, area_name=area if area else None)

  if err or not response_text:
    return jsonify({
      "error": err or "Failed to get response from Claude",
      "response": "I'm having trouble connecting to my knowledge base right now. Try again in a moment!"
    }), 500

  # Add assistant response to history
  history.append({"role": "assistant", "content": response_text})

  return jsonify({
    "response": response_text,
    "sessionId": session_id
  })


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

  parsed, err = _ollama_call(query=query, area_name=area_name, area_bin_colors=area_bin_colors)
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


if __name__ == "__main__":
  host = os.getenv("FLASK_HOST", "127.0.0.1")
  port = int(os.getenv("FLASK_PORT", "5000"))
  debug = os.getenv("FLASK_DEBUG", "1").strip() not in ("0", "false", "False")
  app.run(host=host, port=port, debug=debug)

