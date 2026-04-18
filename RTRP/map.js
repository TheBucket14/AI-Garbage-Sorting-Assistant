// Map functionality for bin locations

let map;
let bins = [];

async function initMap() {
  // Initialize map centered on Hyderabad, India
  map = L.map('map').setView([17.3850, 78.4867], 13);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Load bins
  await loadBins();

  // Add click handler for adding bins
  map.on('click', onMapClick);
}

async function loadBins() {
  try {
    const response = await fetch('/api/bins');
    const data = await response.json();
    bins = data.bins || [];
    bins.forEach(addBinMarker);
  } catch (error) {
    console.error('Error loading bins:', error);
  }
}

function addBinMarker(bin) {
  const iconUrl = getBinIcon(bin.types);
  const customIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
  const marker = L.marker([bin.coordinates.lat, bin.coordinates.lon], { icon: customIcon }).addTo(map);
  const popupContent = `
    <div class="bin-popup">
      <h3>${bin.name}</h3>
      <p><strong>Types:</strong> ${bin.types.join(', ')}</p>
      <p><strong>Address:</strong> ${bin.address}</p>
      <p><strong>Hours:</strong> ${bin.hours}</p>
      <p><strong>Phone:</strong> ${bin.phone}</p>
      <p><strong>Notes:</strong> ${bin.notes}</p>
      <button onclick="selectBin('${bin.id}')">Report Issue</button>
    </div>
  `;
  marker.bindPopup(popupContent);
}

function getBinIcon(types) {
  if (types.includes('hazardous')) return 'https://cdn-icons-png.flaticon.com/512/190/190411.png'; // hazard icon
  if (types.includes('organics')) return 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png'; // leaf icon
  if (types.includes('recycling')) return 'https://cdn-icons-png.flaticon.com/512/1046/1046782.png'; // recycle icon
  return 'https://cdn-icons-png.flaticon.com/512/1046/1046783.png'; // general bin icon
}

function onMapClick(e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;
  showAddBinForm(lat, lon);
}

function showAddBinForm(lat, lon) {
  const form = document.createElement('div');
  form.className = 'modal';
  form.innerHTML = `
    <div class="modal-content">
      <h3>Add New Bin</h3>
      <form id="add-bin-form">
        <input type="text" id="bin-name" placeholder="Bin Name" required>
        <select id="bin-types" multiple required>
          <option value="recycling">Recycling</option>
          <option value="organics">Organics</option>
          <option value="general">General</option>
          <option value="hazardous">Hazardous</option>
        </select>
        <input type="text" id="bin-address" placeholder="Looking up address…" disabled>
        <input type="text" id="bin-hours" placeholder="Hours">
        <input type="text" id="bin-phone" placeholder="Phone">
        <textarea id="bin-notes" placeholder="Notes"></textarea>
        <button type="submit">Add Bin</button>
        <button type="button" onclick="closeModal()">Cancel</button>
      </form>
    </div>
  `;
  document.body.appendChild(form);

  const addressInput = document.getElementById('bin-address');
  reverseGeocode(lat, lon).then(address => {
    addressInput.disabled = false;
    if (address) {
      addressInput.value = address;
      addressInput.placeholder = 'Address';
    } else {
      addressInput.value = '';
      addressInput.placeholder = 'Address not found — enter manually';
    }
  }).catch(() => {
    addressInput.disabled = false;
    addressInput.value = '';
    addressInput.placeholder = 'Address not found — enter manually';
  });

  document.getElementById('add-bin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const types = Array.from(document.getElementById('bin-types').selectedOptions).map(o => o.value);
    const newBin = {
      name: document.getElementById('bin-name').value,
      types: types,
      coordinates: { lat, lon },
      address: document.getElementById('bin-address').value,
      hours: document.getElementById('bin-hours').value,
      phone: document.getElementById('bin-phone').value,
      notes: document.getElementById('bin-notes').value
    };
    await addBin(newBin);
    closeModal();
  });
}

async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18`);
    const data = await response.json();
    return data?.display_name || '';
  } catch (error) {
    console.warn('Reverse geocode failed', error);
    return '';
  }
}

async function addBin(binData) {
  try {
    const response = await fetch('/api/bins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(binData)
    });
    const result = await response.json();
    if (response.ok) {
      bins.push(result.bin);
      addBinMarker(result.bin);
    } else {
      alert('Error adding bin: ' + result.error);
    }
  } catch (error) {
    console.error('Error adding bin:', error);
  }
}

function selectBin(binId) {
  const bin = bins.find(b => b.id === binId);
  if (!bin) return;

  const form = document.createElement('div');
  form.className = 'modal';
  form.innerHTML = `
    <div class="modal-content">
      <h3>Report Issue for ${bin.name}</h3>
      <form id="report-issue-form">
        <select id="issue-type" required>
          <option value="full">Bin is full/overflowing</option>
          <option value="damaged">Bin is damaged</option>
          <option value="missing">Bin is missing</option>
        </select>
        <textarea id="issue-description" placeholder="Description"></textarea>
        <button type="submit">Report Issue</button>
        <button type="button" onclick="closeModal()">Cancel</button>
      </form>
    </div>
  `;
  document.body.appendChild(form);

  document.getElementById('report-issue-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const issueData = {
      binId: binId,
      issueType: document.getElementById('issue-type').value,
      description: document.getElementById('issue-description').value
    };
    await reportIssue(issueData);
    closeModal();
  });
}

async function reportIssue(issueData) {
  try {
    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    const result = await response.json();
    if (response.ok) {
      alert('Issue reported successfully');
    } else {
      alert('Error reporting issue: ' + result.error);
    }
  } catch (error) {
    console.error('Error reporting issue:', error);
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => modal.remove());
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', initMap);