// Map functionality for bin locations

let map;
let bins = [];
let markers = [];

// Bin color scheme
const BIN_COLORS = {
  'recycling': '#007bff',
  'organics': '#28a745',
  'general': '#6c757d',
  'hazardous': '#dc3545',
  'ewaste': '#6f42c1',
  'sanitary': '#e83e8c'
};

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

  // Add zoom event listener to scale icons
  map.on('zoom', updateMarkerSizes);
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
  const customIcon = createBinIcon(bin.types || ['general']);
  const marker = L.marker([bin.coordinates.lat, bin.coordinates.lon], { icon: customIcon }).addTo(map);
  marker.binData = bin; // Store bin data for later reference
  markers.push(marker);
  
  const popupContent = `
    <div class="bin-popup">
      <h3>${bin.name || 'Unnamed bin'}</h3>
      <p><strong>Types:</strong> ${bin.types.join(', ')}</p>
      <p><strong>Address:</strong> ${bin.address}</p>
      ${bin.hours ? `<p><strong>Hours:</strong> ${bin.hours}</p>` : ''}
      ${bin.phone ? `<p><strong>Phone:</strong> ${bin.phone}</p>` : ''}
      <p><strong>Notes:</strong> ${bin.notes}</p>
      <button onclick="selectBin('${bin.id}')">Report Issue</button>
    </div>
  `;
  marker.bindPopup(popupContent);
}

function createBinIcon(types) {
  // Get the primary bin type and corresponding color
  const primaryType = (types && types[0]) ? String(types[0]).toLowerCase() : 'general';
  const color = BIN_COLORS[primaryType] || BIN_COLORS['general'];
  
  // Get base size and scale based on zoom level
  const baseSize = 32;
  const zoom = map.getZoom();
  const scale = Math.max(0.6, Math.min(2, (zoom - 10) * 0.1 + 1));
  const size = Math.round(baseSize * scale);
  
  // Create SVG icon as a colored pin
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${size}" height="${size}">
      <!-- Pin shape -->
      <path d="M12 0C6.48 0 2 4.48 2 10c0 5.33 8.75 20 10 22 1.25-2 10-16.67 10-22 0-5.52-4.48-10-10-10z" 
            fill="${color}" stroke="white" stroke-width="0.5"/>
      <!-- Inner circle for visual appeal -->
      <circle cx="12" cy="10" r="3.5" fill="white" opacity="0.8"/>
    </svg>
  `;
  
  const iconSize = size;
  // Use URL-encoded SVG data URI (more robust than raw base64 in some browsers)
  const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgIcon.trim());
  return L.icon({
    iconUrl: svgData,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
    className: 'bin-marker'
  });
}

function updateMarkerSizes() {
  // Update all marker sizes based on new zoom level
  markers.forEach(marker => {
    const newIcon = createBinIcon(marker.binData.types);
    marker.setIcon(newIcon);
  });
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
        <!-- Bin name is optional now; we don't require it. Only types and coords are required. -->
        <select id="bin-types" multiple required>
          <option value="recycling">Recycling</option>
          <option value="organics">Organics</option>
          <option value="general">General</option>
          <option value="hazardous">Hazardous</option>
        </select>
        <input type="text" id="bin-address" placeholder="Looking up address…" disabled>
        <!-- Hours and phone removed to simplify the form -->
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
      // name optional — backend will fill a default if missing
      types: types,
      coordinates: { lat, lon },
      address: document.getElementById('bin-address').value,
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
    console.log('Add bin result:', response.status, result);
    if (response.ok && result && result.bin) {
      bins.push(result.bin);
      addBinMarker(result.bin);
      // Center map on new bin and open its popup so users see it immediately
      try {
        const lat = result.bin.coordinates.lat;
        const lon = result.bin.coordinates.lon;
        map.setView([lat, lon], Math.max(map.getZoom(), 15));
        // Find the marker we just added and open its popup
        const m = markers.find(pm => pm.binData && pm.binData.id === result.bin.id);
        if (m) {
          m.openPopup();
        }
      } catch (e) {
        console.warn('Could not center on new bin:', e);
      }
    } else {
      alert('Error adding bin: ' + (result && result.error ? result.error : 'Unknown error'));
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