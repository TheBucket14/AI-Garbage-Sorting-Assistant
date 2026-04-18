// ===== SORTING KNOWLEDGE BASE (fast local answers) =====
const sortingDB = {
  // RECYCLING
  'newspaper': { bin: 'Recycling', label: 'label-blue', icon: '📰', tip: 'Dry newspapers and paper can always go in the recycling bin. Keep them away from moisture.' },
  'paper': { bin: 'Recycling', label: 'label-blue', icon: '📄', tip: 'Clean paper products are fully recyclable. Shredded paper may need to go in a sealed bag.' },
  'cardboard box': { bin: 'Recycling', label: 'label-blue', icon: '📦', tip: 'Flatten the box to save space. Remove any tape or foam inserts first.' },
  'cardboard': { bin: 'Recycling', label: 'label-blue', icon: '📦', tip: 'Flatten and break down cardboard before placing in the recycling bin.' },
  'glass bottle': { bin: 'Recycling', label: 'label-blue', icon: '🍾', tip: 'Rinse the bottle and remove the cap. Glass is 100% recyclable infinitely!' },
  'glass jar': { bin: 'Recycling', label: 'label-blue', icon: '🫙', tip: 'Empty and rinse the jar. Remove the metal lid — it can be recycled separately.' },
  'aluminium can': { bin: 'Recycling', label: 'label-blue', icon: '🥫', tip: 'Rinse the can. Aluminium is the most valuable recyclable material!' },
  'aluminum can': { bin: 'Recycling', label: 'label-blue', icon: '🥫', tip: 'Rinse the can. Aluminium is the most valuable recyclable material!' },
  'tin can': { bin: 'Recycling', label: 'label-blue', icon: '🥫', tip: 'Rinse and recycle. Remove the label if possible for better processing.' },
  'plastic bottle': { bin: 'Recycling', label: 'label-blue', icon: '🧴', tip: 'Rinse the bottle and remove the cap. Crush to save space. Most #1 and #2 plastics are widely accepted.' },
  'water bottle': { bin: 'Recycling', label: 'label-blue', icon: '🍼', tip: 'Rinse and recycle. PET plastic bottles are among the most recyclable items.' },
  'magazine': { bin: 'Recycling', label: 'label-blue', icon: '📖', tip: 'Glossy magazines are recyclable in most areas. Remove any free gifts or plastic wrapping first.' },
  'milk carton': { bin: 'Recycling', label: 'label-blue', icon: '🥛', tip: 'Rinse and flatten the carton. Many areas accept Tetra Pak in recycling.' },
  'cereal box': { bin: 'Recycling', label: 'label-blue', icon: '📦', tip: 'Flatten and recycle. Remove any plastic bags inside — those go in general waste.' },
  'steel can': { bin: 'Recycling', label: 'label-blue', icon: '🥫', tip: 'Rinse and recycle. Steel cans are fully recyclable and very valuable.' },

  // COMPOST
  'banana peel': { bin: 'Compost', label: 'label-green', icon: '🍌', tip: 'Banana peels break down quickly in compost, adding potassium to your pile.' },
  'apple core': { bin: 'Compost', label: 'label-green', icon: '🍎', tip: 'Fruit cores are great compost material. They break down in weeks.' },
  'coffee grounds': { bin: 'Compost', label: 'label-green', icon: '☕', tip: 'Coffee grounds and paper filters are both compostable and great for soil nitrogen.' },
  'tea bag': { bin: 'Compost', label: 'label-green', icon: '🍵', tip: 'Most tea bags are compostable, but check for plastic mesh bags — those go in general waste.' },
  'vegetable peels': { bin: 'Compost', label: 'label-green', icon: '🥕', tip: 'All raw vegetable scraps are excellent compost material — great nitrogen sources.' },
  'egg shells': { bin: 'Compost', label: 'label-green', icon: '🥚', tip: 'Eggshells add calcium to compost. Crush them for faster breakdown.' },
  'eggshells': { bin: 'Compost', label: 'label-green', icon: '🥚', tip: 'Eggshells add calcium to compost. Crush them for faster breakdown.' },
  'grass clippings': { bin: 'Compost', label: 'label-green', icon: '🌱', tip: 'A great green (nitrogen-rich) compost material. Mix with brown materials for balance.' },
  'leaves': { bin: 'Compost', label: 'label-green', icon: '🍂', tip: 'Dry leaves are perfect brown (carbon-rich) compost material. Shred them for faster composting.' },
  'food scraps': { bin: 'Compost', label: 'label-green', icon: '🥦', tip: 'Most raw fruit and vegetable scraps are excellent for compost.' },
  'bread': { bin: 'Compost', label: 'label-green', icon: '🍞', tip: 'Bread can be composted but may attract pests. Bury it in the center of your pile.' },

  // GENERAL WASTE
  'pizza box': { bin: 'General Waste', label: 'label-orange', icon: '🍕', tip: 'Greasy pizza boxes cannot be recycled. The oil contaminates recycling. Tip: tear off any clean sections and recycle those separately.' },
  'plastic bag': { bin: 'General Waste', label: 'label-orange', icon: '🛍️', tip: 'Soft plastics cannot go in the recycling bin as they tangle in machinery. Many supermarkets have soft plastic drop-off points.' },
  'styrofoam': { bin: 'General Waste', label: 'label-orange', icon: '📦', tip: 'Styrofoam/polystyrene is not accepted in most recycling programs. Check for local drop-off facilities.' },
  'nappies': { bin: 'General Waste', label: 'label-orange', icon: '👶', tip: 'Disposable nappies/diapers go in general waste. They cannot be recycled or composted.' },
  'diapers': { bin: 'General Waste', label: 'label-orange', icon: '👶', tip: 'Disposable diapers go in general waste. They cannot be recycled or composted.' },
  'crisp packet': { bin: 'General Waste', label: 'label-orange', icon: '🍟', tip: 'Most crisp and snack packets are made of mixed materials and cannot be recycled at home.' },
  'chips packet': { bin: 'General Waste', label: 'label-orange', icon: '🍟', tip: 'Mixed-material snack wrappers go in general waste. Some brands have take-back programs.' },
  'rubber': { bin: 'General Waste', label: 'label-orange', icon: '⭕', tip: 'Most rubber items go in general waste. Some specialist recyclers accept rubber.' },
  'cling wrap': { bin: 'General Waste', label: 'label-orange', icon: '🧻', tip: 'Plastic cling film is a soft plastic — it goes in general waste or soft-plastic drop-off.' },
  'broken mirror': { bin: 'General Waste', label: 'label-orange', icon: '🪞', tip: 'Wrap broken glass/mirror in newspaper before placing in general waste to avoid injuries.' },
  'used tissues': { bin: 'General Waste', label: 'label-orange', icon: '🤧', tip: 'Used tissues are contaminated and cannot be recycled. They go in general waste.' },
  'sanitary products': { bin: 'General Waste', label: 'label-orange', icon: '🚫', tip: 'All sanitary products go in general waste. Never flush them.' },

  // HAZARDOUS / SPECIAL
  'old batteries': { bin: 'Hazardous', label: 'label-red', icon: '🔋', tip: 'Batteries contain toxic chemicals and must NEVER go in general waste or recycling. Take to a battery drop-off point at most supermarkets or electronics stores.' },
  'batteries': { bin: 'Hazardous', label: 'label-red', icon: '🔋', tip: 'All batteries — AA, AAA, car batteries, lithium — must be taken to designated collection points.' },
  'old mobile phone': { bin: 'E-Waste (Hazardous)', label: 'label-red', icon: '📱', tip: 'Mobile phones contain valuable metals and hazardous materials. Return to a phone shop, e-waste facility, or manufacturer.' },
  'mobile phone': { bin: 'E-Waste (Hazardous)', label: 'label-red', icon: '📱', tip: 'Donate if working, or take to an e-waste collection point. Never bin a phone.' },
  'paint': { bin: 'Hazardous', label: 'label-red', icon: '🎨', tip: 'Liquid paint is hazardous. Take to a local hazardous waste collection. Dry, hardened paint can sometimes go in general waste.' },
  'paint can': { bin: 'Hazardous', label: 'label-red', icon: '🎨', tip: 'Take paint cans to a hazardous household waste facility. Check if local shops do take-back.' },
  'old medication': { bin: 'Hazardous', label: 'label-red', icon: '💊', tip: 'Return unused medicines to a pharmacy. Never flush them — they pollute waterways.' },
  'medication': { bin: 'Hazardous', label: 'label-red', icon: '💊', tip: 'Return to a pharmacy for safe disposal. This is free at most pharmacies.' },
  'chemicals': { bin: 'Hazardous', label: 'label-red', icon: '⚗️', tip: 'Household chemicals must go to a hazardous waste collection facility. Never pour down the drain.' },
  'pesticide': { bin: 'Hazardous', label: 'label-red', icon: '🧪', tip: 'Take pesticides to a household hazardous waste event or facility. Never bin or pour away.' },
  'motor oil': { bin: 'Hazardous', label: 'label-red', icon: '🛢️', tip: 'Take used motor oil to an auto shop or recycling center. 1L of oil can contaminate 1 million litres of water.' },
  'laptop': { bin: 'E-Waste (Hazardous)', label: 'label-red', icon: '💻', tip: 'Laptops contain lithium batteries and valuable metals. Take to an e-waste facility or manufacturer take-back scheme.' },
  'computer': { bin: 'E-Waste (Hazardous)', label: 'label-red', icon: '🖥️', tip: 'Take to an e-waste facility. Many manufacturers and retailers offer free take-back programs.' },
  'fluorescent bulb': { bin: 'Hazardous', label: 'label-red', icon: '💡', tip: 'Fluorescent bulbs contain mercury. Take to a designated drop-off point — many hardware stores accept them.' },
  'light bulb': { bin: 'Hazardous', label: 'label-yellow', icon: '💡', tip: 'LED and CFL bulbs go to designated collection points. Old incandescent bulbs can go in general waste.' },
  'thermometer': { bin: 'Hazardous', label: 'label-red', icon: '🌡️', tip: 'Mercury thermometers are hazardous. Take to a hazardous waste facility or pharmacy.' },
};

const tips = [
  '<strong>Rinse before you bin!</strong> Clean containers recycle much better and prevent contamination of the whole batch.',
  '<strong>Soft plastics</strong> don\'t go in the recycling bin — they jam sorting machines. Look for supermarket drop-off points.',
  '<strong>Pizza box dilemma?</strong> Tear off the clean top half to recycle it — the greasy bottom goes in general waste.',
  '<strong>Coffee cups</strong> are lined with plastic. Most aren\'t recyclable at home — check for specialist coffee cup bins.',
  '<strong>Batteries in landfill</strong> can cause fires. Always drop them off at collection points in supermarkets or electronics shops.',
  '<strong>Composting tip:</strong> Mix "browns" (leaves, cardboard) with "greens" (food scraps) for the best compost balance.',
  '<strong>E-waste</strong> contains gold, silver, copper, and other valuable materials. Always recycle electronics — never bin them.',
];

// ===== SCORE STATE =====
let scores = { recycled: 0, composted: 0, disposed: 0, total: 0 };
const recent = [];

function updateScore(bin) {
  scores.total++;
  if (bin.includes('Recycl')) scores.recycled++;
  else if (
    bin.includes('Compost') ||
    bin.includes('Organics') ||
    bin.includes('organic') ||
    bin.includes('wet')
  ) scores.composted++;
  else scores.disposed++;

  const eco = Math.min(99, scores.total * 7);
  document.getElementById('ecoScore').textContent = eco;
  document.getElementById('scoreSub').textContent = `${scores.total} item${scores.total !== 1 ? 's' : ''} sorted correctly!`;

  const tot = scores.total || 1;
  document.getElementById('bar1').style.width = Math.min(100, (scores.recycled / tot) * 100) + '%';
  document.getElementById('bar2').style.width = Math.min(100, (scores.composted / tot) * 100) + '%';
  document.getElementById('bar3').style.width = Math.min(100, (scores.disposed / tot) * 100) + '%';

  document.getElementById('ecoTip').innerHTML = tips[scores.total % tips.length];
}

function pushRecent(item, result) {
  recent.unshift({ item, result, ts: Date.now() });
  if (recent.length > 10) recent.length = 10;
  renderRecent();
}

function renderRecent() {
  const list = document.getElementById('recentItems');
  const empty = document.getElementById('recentEmpty');
  list.innerHTML = '';
  if (!recent.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  for (const r of recent) {
    const li = document.createElement('li');
    li.className = 'recent-item';
    li.innerHTML = `<div><strong>${escHtml(r.item)}</strong><div><span>${escHtml(r.result.bin || 'Unknown')}</span></div></div><div><span>${escHtml(r.result.binColor || '')}</span></div>`;
    list.appendChild(li);
  }
}

function getArea() {
  const el = document.getElementById('areaInput');
  return (el?.value || '').trim();
}

function setApiStatus(ok, text) {
  const dot = document.getElementById('apiStatusDot');
  const label = document.getElementById('apiStatusText');
  dot.classList.remove('ok', 'bad');
  dot.classList.add(ok ? 'ok' : 'bad');
  label.textContent = text;
}

// ===== CHAT ENGINE =====
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addMessage(text, 'user');
  showTyping();

  await delay(450 + Math.random() * 350);
  removeTyping();
  respondToItem(text);
}

async function submitImage() {
  const input = document.getElementById('imageInput');
  const file = input?.files?.[0];
  if (!file) {
    addMessage('Please choose an image first so I can identify the item.', 'bot', false);
    return;
  }

  addMessage(`Uploaded image: ${escHtml(file.name)}`, 'user', false);
  showTyping();

  let result;
  try {
    result = await identifyImage(file);
  } catch (err) {
    result = null;
  }

  removeTyping();
  if (!result) {
    addMessage('I could not identify that image. Try a clearer photo, or describe the item in the box below.', 'bot', true);
    return;
  }

  const itemLabel = result.item || file.name.replace(/\.[^/.]+$/, '');
  updateScore(result.bin || 'General Waste');
  const html = `
    I looked at the image and identified it as <strong>${escHtml(itemLabel)}</strong>:
    <div class="result-card">
      <div class="bin-label ${normalizeResultForLabel(result.bin)}">${escHtml(result.icon || '🗑️')} ${escHtml(result.bin || 'General Waste')}</div>
      <div class="tip">${escHtml(result.tip || 'Choose the bin recommendation above or type the item name for more detail.')}</div>
    </div>
  `;
  addMessage(html, 'bot', true);
  pushRecent(itemLabel, { bin: result.bin || 'General Waste' });
}

function previewSelectedImage() {
  const preview = document.getElementById('imagePreview');
  const input = document.getElementById('imageInput');
  const file = input?.files?.[0];
  if (!file) {
    preview.innerHTML = 'Select an image to preview your item.';
    return;
  }
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img src="${escAttr(url)}" alt="Selected item preview"><span>${escHtml(file.name)}</span>`;
}

async function identifyImage(file) {
  const form = new FormData();
  form.append('image', file);
  try {
    const res = await fetch('/api/sort-image', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Image endpoint failed');
    const data = await res.json();
    return data;
  } catch (err) {
    return detectImageFromFilename(file.name);
  }
}

function detectImageFromFilename(filename) {
  const label = filename.replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' ').trim();
  if (!label) {
    return {
      bin: 'General Waste',
      icon: '🗑️',
      tip: 'I could not read the image name. Try typing the item or choosing a clearer image.',
      item: filename,
    };
  }
  const query = label.toLowerCase();
  let result = sortingDB[query];
  if (!result) {
    const keys = Object.keys(sortingDB);
    const matched = keys.find(k => query.includes(k) || k.includes(query));
    if (matched) result = sortingDB[matched];
  }
  if (result) {
    return { ...result, item: label };
  }
  return {
    bin: 'General Waste',
    icon: '🗑️',
    tip: 'I could not identify the image definitively. Try typing the item name instead.',
    item: label,
  };
}

function quickAsk(item) {
  addMessage(item, 'user');
  showTyping();
  delay(350 + Math.random() * 250).then(() => {
    removeTyping();
    respondToItem(item);
  });
}

async function respondToItem(rawQuery) {
  const query = rawQuery.toLowerCase().trim();

  let result = sortingDB[query];
  if (!result) {
    const keys = Object.keys(sortingDB);
    const matched = keys.find(k => query.includes(k) || k.includes(query));
    if (matched) result = sortingDB[matched];
  }

  if (result) {
    updateScore(result.bin);
    const html = `
      Great question! Here's the result for <strong>${escHtml(rawQuery)}</strong>:
      <div class="result-card">
        <div class="bin-label ${result.label}">${result.icon} ${result.bin}</div>
        <div class="tip">${result.tip}</div>
      </div>
    `;
    addMessage(html, 'bot', true);
    pushRecent(rawQuery, { bin: result.bin });
    return;
  }

  await askServer(rawQuery);
}

function normalizeResultForLabel(bin) {
  const b = (bin || '').toLowerCase();
  if (b.includes('recycl')) return 'label-blue';
  if (b.includes('compost') || b.includes('organic')) return 'label-green';
  if (b.includes('hazard') || b.includes('e-waste') || b.includes('ewaste')) return 'label-red';
  return 'label-orange';
}

function sourcesHtml(sources) {
  if (!Array.isArray(sources) || !sources.length) return '';
  const items = sources
    .filter(s => s && s.url)
    .slice(0, 5)
    .map(s => `<li><a href="${escAttr(s.url)}" target="_blank" rel="noreferrer">${escHtml(s.title || s.url)}</a></li>`)
    .join('');
  return `<div class="bin-guide-sources"><h4>Sources</h4><ul>${items}</ul></div>`;
}

async function askServer(query) {
  showTyping();
  try {
    const res = await fetch('/api/sort', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, area: getArea() })
    });
    const data = await res.json().catch(() => null);
    removeTyping();

    if (!res.ok || !data) {
      setApiStatus(false, 'API error.');
      addMessage(`I couldn't look that up right now. Try again in a moment, or describe the item's material.`, 'bot', true);
      return;
    }

    setApiStatus(true, 'API reachable.');

    const label = normalizeResultForLabel(data.bin);
    if (data.bin) updateScore(data.bin);

    const binColorLine = data.binColor ? `<div class="tip"><strong>Bin color:</strong> ${escHtml(data.binColor)}</div>` : '';
    const groundedLine = data.grounded === false ? `<div class="tip"><em>Note:</em> This is generic guidance; local bin colors may differ.</div>` : '';

    const html = `
      Here's the result for <strong>${escHtml(query)}</strong>${data.areaMatched ? ` in <strong>${escHtml(data.areaMatched)}</strong>` : ''}:
      <div class="result-card">
        <div class="bin-label ${label}">${escHtml(data.icon || '🗑️')} ${escHtml(data.bin || 'Unknown')}</div>
        ${binColorLine}
        <div class="tip">${escHtml(data.tip || '')}</div>
        ${groundedLine}
      </div>
      ${sourcesHtml(data.sources)}
    `;
    addMessage(html, 'bot', true);

    pushRecent(query, data);
    if (data.areaGuide) renderBinGuide(data.areaGuide);
  } catch (e) {
    removeTyping();
    setApiStatus(false, 'API unreachable.');
    addMessage(`I couldn't reach the server right now. If you can, start the Flask backend and try again.`, 'bot', true);
  }
}

function renderBinGuide(areaGuide) {
  const areaEl = document.getElementById('binGuideArea');
  const colorsEl = document.getElementById('binGuideColors');
  const sourcesEl = document.getElementById('binGuideSources');

  const name = areaGuide?.areaName || getArea() || 'Unknown area';
  areaEl.textContent = `Area: ${name}`;

  const colors = areaGuide?.binColors || {};
  const entries = Object.entries(colors);
  colorsEl.innerHTML = '';
  sourcesEl.innerHTML = '';

  if (!entries.length) {
    colorsEl.innerHTML = `<p class="muted">No bin color rules available for this area yet.</p>`;
  } else {
    for (const [binKey, colorName] of entries) {
      const row = document.createElement('div');
      row.className = 'bin-color-row';
      const swatchColor = cssColorFromName(colorName);
      row.innerHTML = `
        <div class="bin-color-left">
          <span class="bin-swatch" style="background:${escAttr(swatchColor)}"></span>
          <div>
            <div class="bin-color-name">${escHtml(colorName)}</div>
            <div class="bin-color-bin">${escHtml(prettyBinKey(binKey))}</div>
          </div>
        </div>
      `;
      colorsEl.appendChild(row);
    }
  }

  const sources = Array.isArray(areaGuide?.sources) ? areaGuide.sources : [];
  for (const s of sources.slice(0, 6)) {
    if (!s?.url) continue;
    const li = document.createElement('li');
    li.innerHTML = `<a href="${escAttr(s.url)}" target="_blank" rel="noreferrer">${escHtml(s.title || s.url)}</a>`;
    sourcesEl.appendChild(li);
  }
}

function prettyBinKey(k) {
  const map = {
    recycling: 'Recycling',
    organics: 'Organics / Compost',
    compost: 'Organics / Compost',
    general: 'General Waste',
    garbage: 'General Waste',
    landfill: 'General Waste',
    hazardous: 'Hazardous',
    ewaste: 'E-Waste',
    e_waste: 'E-Waste',
    glass: 'Glass',
    paper: 'Paper',
    plastic: 'Plastics'
  };
  const key = String(k || '').toLowerCase().replace(/[^a-z_]/g, '');
  return map[key] || k;
}

function cssColorFromName(name) {
  const n = String(name || '').toLowerCase();
  if (n.includes('blue')) return 'var(--blue)';
  if (n.includes('green')) return 'var(--green)';
  if (n.includes('orange')) return 'var(--orange)';
  if (n.includes('yellow')) return 'var(--yellow)';
  if (n.includes('red')) return 'var(--red)';
  if (n.includes('purple')) return '#b57bff';
  if (n.includes('brown')) return '#b07a3c';
  if (n.includes('black')) return '#111';
  if (n.includes('grey') || n.includes('gray')) return '#7c8790';
  return 'rgba(255,255,255,0.7)';
}

function addMessage(content, role, isHTML = false) {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'bot' ? '🤖' : '👤';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHTML) bubble.innerHTML = content;
  else bubble.textContent = content;
  div.appendChild(avatar);
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'typing-msg'; div.id = 'typingIndicator';
  div.innerHTML = `<div class="msg-avatar" style="background:rgba(111,207,58,0.15);border:1px solid rgba(111,207,58,0.3);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center">🤖</div><div class="typing-bubble"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function clearChat() {
  document.getElementById('messages').innerHTML = `
    <div class="msg bot">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">Chat cleared! What item would you like to sort next?</div>
    </div>`;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }

// ===== ANIMATED STATS =====
function animateCount(id, target, suffix = '', duration = 2000) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const val = Math.floor(p * target);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initInteractiveBackground(opts = {}) {
  const bg = document.getElementById('shape-bg');
  if (!bg) return;

  // Reduced motion: render static shapes.
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const shapeCount = opts.shapeCount ?? 10;
  const proximityPx = opts.proximityPx ?? 160;
  const colors = [
    'var(--green)',
    'var(--blue)',
    'var(--orange)',
    'var(--red)',
    'var(--lime)',
    'var(--yellow)'
  ];

  bg.innerHTML = '';
  const shapes = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const s of shapes) {
      s.x = Math.max(0, Math.min(w - s.size, s.x));
      s.y = Math.max(0, Math.min(h - s.size, s.y));
    }
  };

  for (let i = 0; i < shapeCount; i++) {
    const size = rand(18, 72);
    const type = pick(['circle', 'square', 'square', 'triangle']); // more squares/circles
    const el = document.createElement('div');
    el.className = `shape ${type}`;

    const color = pick(colors);
    // With more shapes, keep opacity lower to avoid visual clutter.
    const opacity = rand(0.04, 0.12);
    const baseScale = rand(0.9, 1.08);

    const x = rand(0, Math.max(1, window.innerWidth - size));
    const y = rand(0, Math.max(1, window.innerHeight - size));

    const vx = rand(-0.35, 0.35);
    const vy = rand(-0.25, 0.25);
    const rot = rand(0, 360);
    const baseRotSpeed = rand(-16, 16); // deg/sec
    const rotSpeed = baseRotSpeed;

    el.style.setProperty('--size', `${size}px`);
    el.style.setProperty('--opacity', opacity.toFixed(3));
    el.style.setProperty('--c', color);
    el.style.setProperty('--x', `${x.toFixed(2)}px`);
    el.style.setProperty('--y', `${y.toFixed(2)}px`);
    el.style.setProperty('--r', `${rot.toFixed(2)}deg`);
    el.style.setProperty('--s', baseScale.toFixed(3));

    bg.appendChild(el);

    shapes.push({
      el,
      type,
      size,
      x,
      y,
      vx,
      vy,
      baseVx: vx,
      baseVy: vy,
      rot,
      rotSpeed,
      baseRotSpeed,
      baseScale,
      opacity,
    });
  }

  // Position mouse; start at center so shapes respond immediately after first move.
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  window.addEventListener(
    'pointermove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    },
    { passive: true }
  );

  if (reduce) {
    window.addEventListener('resize', resize);
    return;
  }

  let last = performance.now();
  let rafId = 0;

  const tick = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000); // clamp for stability
    last = now;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const prox2 = proximityPx * proximityPx;

    for (const s of shapes) {
      // Drift
      s.x += s.vx;
      s.y += s.vy;

      // Bounce (use top-left coords)
      if (s.x <= 0) {
        s.x = 0;
        s.vx = Math.abs(s.vx);
      } else if (s.x >= w - s.size) {
        s.x = w - s.size;
        s.vx = -Math.abs(s.vx);
      }
      if (s.y <= 0) {
        s.y = 0;
        s.vy = Math.abs(s.vy);
      } else if (s.y >= h - s.size) {
        s.y = h - s.size;
        s.vy = -Math.abs(s.vy);
      }

      // Proximity interaction
      const cx = s.x + s.size / 2;
      const cy = s.y + s.size / 2;
      const dx = cx - mouseX;
      const dy = cy - mouseY;
      const d2 = dx * dx + dy * dy;

      let t = 0;
      if (d2 < prox2) {
        const d = Math.sqrt(d2) + 0.0001;
        t = 1 - d / proximityPx; // 0..1

        const nx = dx / d;
        const ny = dy / d;

        // Gentle attraction toward mouse.
        const strength = 22; // tune for subtle motion
        s.vx += -nx * t * strength * dt;
        s.vy += -ny * t * strength * dt;

        // Rotation and scale boost near cursor.
        s.rotSpeed = s.baseRotSpeed * (1 + t) + (t * 24 * (dx > 0 ? 1 : -1)) * dt * 0.4;
      } else {
        // Relax back to baseline drift.
        s.vx = s.vx * 0.985 + s.baseVx * 0.015;
        s.vy = s.vy * 0.985 + s.baseVy * 0.015;
        s.rotSpeed = s.rotSpeed * 0.98 + s.baseRotSpeed * 0.02;
      }

      s.rot += s.rotSpeed * dt;
      const scale = s.baseScale * (1 + t * 0.10);
      const opacity = Math.min(0.22, s.opacity + t * 0.12);

      s.el.style.setProperty('--x', `${s.x.toFixed(2)}px`);
      s.el.style.setProperty('--y', `${s.y.toFixed(2)}px`);
      s.el.style.setProperty('--r', `${s.rot.toFixed(2)}deg`);
      s.el.style.setProperty('--s', scale.toFixed(3));
      s.el.style.setProperty('--opacity', opacity.toFixed(3));
    }

    rafId = requestAnimationFrame(tick);
  };

  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(tick);

  // If needed later: return a cleanup function.
  return () => cancelAnimationFrame(rafId);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    animateCount('s1', 2143, '');
    animateCount('s2', 97, '%');
    animateCount('s3', 8, 't');
    animateCount('s4', 180, '+');
  }, 600);
  renderRecent();
  checkApiHealth();
  initInteractiveBackground({ shapeCount: 28, proximityPx: 170, subtle: true });
});

async function checkApiHealth() {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      setApiStatus(false, 'API error.');
      return;
    }
    if (!data.anthropicKeyConfigured) {
      setApiStatus(false, 'Backend running, API key not set.');
      return;
    }
    setApiStatus(true, 'Backend ready.');
  } catch {
    setApiStatus(false, 'Backend not running.');
  }
}

// Expose for inline onclick handlers (chips / button)
window.sendMessage = sendMessage;
window.quickAsk = quickAsk;
window.clearChat = clearChat;