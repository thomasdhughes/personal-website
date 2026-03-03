// --- script.js ---

// ---------------------- CONSTANTS & GLOBALS ----------------------
const naics_industries = {
  211: "Oil and Gas Extraction",
  212: "Mining (except Oil and Gas)",
  213: "Support Activities for Mining",
  221: "Utilities",
  311: "Food Manufacturing",
  312: "Beverage and Tobacco Product Manufacturing",
  313: "Textile Mills",
  314: "Textile Product Mills",
  315: "Apparel Manufacturing",
  316: "Leather and Allied Product Manufacturing",
  321: "Wood Product Manufacturing",
  322: "Paper Manufacturing",
  323: "Printing and Related Support Activities",
  324: "Petroleum and Coal Products Manufacturing",
  325: "Chemical Manufacturing",
  326: "Plastics and Rubber Products Manufacturing",
  327: "Nonmetallic Mineral Product Manufacturing",
  331: "Primary Metal Manufacturing",
  332: "Fabricated Metal Product Manufacturing",
  333: "Machinery Manufacturing",
  334: "Computer and Electronic Product Manufacturing",
  335: "Electrical Equipment, Appliance, and Component Manufacturing",
  336: "Transportation Equipment Manufacturing",
  337: "Furniture and Related Product Manufacturing",
  339: "Miscellaneous Manufacturing",
  423: "Merchant Wholesalers, Durable Goods",
  424: "Merchant Wholesalers, Nondurable Goods",
  425: "Wholesale Electronic Markets and Agents and Brokers",
  441: "Motor Vehicle and Parts Dealers",
  444: "Building Material and Garden Equipment and Supplies Dealers",
  445: "Food and Beverage Stores",
  446: "Health and Personal Care Stores",
  447: "Gasoline Stations",
  448: "Clothing and Clothing Accessories Stores",
  452: "General Merchandise Stores",
  454: "Nonstore Retailers",
  481: "Air Transportation",
  482: "Rail Transportation",
  483: "Water Transportation",
  484: "Truck Transportation",
  485: "Transit and Ground Passenger Transportation",
  486: "Pipeline Transportation",
  491: "Postal Service",
  492: "Couriers and Messengers",
  493: "Warehousing and Storage",
  721: "Accommodation",
  722: "Food Services and Drinking Places"
};

const max_trucks_in_a_zone_by_industry = { 0: 2139, 211: 15, 212: 304, 213: 10, 221: 54, 311: 82, 312: 74, 313: 6, 314: 4, 315: 2, 316: 1, 321: 11, 322: 13, 323: 7, 324: 372, 325: 44, 326: 10, 327: 66, 331: 56, 332: 52, 333: 27, 334: 5, 335: 6, 336: 31, 337: 9, 339: 11, 423: 3, 424: 4, 425: 300, 441: 312, 444: 506, 445: 226, 446: 160, 447: 63, 448: 259, 452: 72, 454: 161, 481: 39, 482: 41, 483: 13, 484: 191, 485: 20, 486: 244, 491: 30, 492: 22, 493: 84, 721: 19, 722: 109 };

let currentIndustry = 0; // default industry code ("every industry")

// ---------------------- MAP INITIALISATION ----------------------
// NYC center point
const nycCoords = [40.7528, -73.95];

const map = L.map('map', {
  center: nycCoords,
  zoom: 11,
  zoomControl: false,
  minZoom: 10,
  maxZoom: 16,
  maxBounds: [
    [40.3, -74.4],
    [41.1, -73.5]
  ],
  maxBoundsViscosity: 1.0
});

// Dark map view
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>, OpenStreetMap contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// ---------------------- GEOJSON ZONES ----------------------
let nycOpenDataLayer;
fetch('data/nyc-opendata.geojson')
  .then(res => {
    if (!res.ok) throw new Error("Fetch failed: " + res.status + " " + res.statusText);
    return res.json();
  })
  .then(data => {
    updateProgress(33);
    nycOpenDataLayer = L.geoJSON(data, {
      style: feature => ({
        fillColor: 'white',
        weight: 0.5,
        color: 'white',
        fillOpacity: 0.75
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${feature.properties.ntaname || 'Zone'}</strong>`);
      }
    }).addTo(map);
    checkIfReady();
  })
  .catch(err => {
    console.error("Error fetching GeoJSON:", err);
    alert("Failed to load GeoJSON: " + err.message);
  });

// ---------------------- TRUCK DATA & ANIMATION ----------------------
let truckData = [];
let maxValue = max_trucks_in_a_zone_by_industry[0];
let currentIndex = 240; // start at 4:00 AM
let animationInterval;
let paused = false;
const icons = { play: '▶', pause: '⏸' };
let loadingProgress = 0;

// Slider dragging state
let isDraggingSlider = false;
let wasPausedByUser = false;

function updateProgress(percent) {
  document.querySelector('.progress-fill').style.width = percent + '%';
}

// Load the initial truck data
fetch('data/every_industry.json')
  .then(res => res.json())
  .then(data => {
    updateProgress(66);
    truckData = data;
    // initialize slider once data length is known
    const slider = document.getElementById('time-slider');
    slider.max = truckData.length - 1;
    slider.value = currentIndex;
    computeMaxValue();
    checkIfReady();
  })
  .catch(err => console.error("Error loading truck data: ", err));

function computeMaxValue() {
  maxValue = max_trucks_in_a_zone_by_industry[currentIndustry];
}

// Map a truck count to a blue color
function getNeighborhoodColor(count, max) {
  if (max === 0) return 'white';
  const lightness = 100 - ((Math.min(count, max / 2) / (max / 2)) * 90);
  return `hsl(210, 100%, ${lightness}%)`;
}

function updateMap() {
  if ((paused && !isDraggingSlider) || !truckData.length) return;

  const record = truckData[currentIndex];
  const industryName = currentIndustry === 0 ? 'every industry' : naics_industries[currentIndustry].toLowerCase();

  document.getElementById('time-text').innerText = record.Time;

  document.getElementById('truck-number').textContent =
    record.Total.toLocaleString();

  document.getElementById('industry-select').value =
    currentIndustry.toString();

  if (nycOpenDataLayer) {
    nycOpenDataLayer.eachLayer(layer => {
      const feature = layer.feature;
      const neighborhood = feature.properties.ntaname;
      if (record[neighborhood] !== undefined) {
        const count = record[neighborhood];
        const newColor = getNeighborhoodColor(count, maxValue);
        layer.setStyle({ fillColor: newColor, color: newColor });
        layer.bindPopup(`<strong>${neighborhood}</strong><br>Active trucks: ${count.toLocaleString()}`);
      }
    });
  }

  // Sync slider if not dragging
  const slider = document.getElementById('time-slider');
  if (!isDraggingSlider) {
    slider.value = currentIndex;
  }

  // Advance to next minute
  if (!paused) {
    currentIndex = (currentIndex + 1) % truckData.length;
  }
}

function startAnimation() {
  animationInterval = setInterval(updateMap, 20);
}

// Pause/resume button
const pauseBtn = document.getElementById('pause-btn');
function updatePauseIcon() {
  pauseBtn.textContent = paused ? icons.play : icons.pause;
}
updatePauseIcon();
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  document.getElementById('info-box').classList.toggle('paused', paused);
  updatePauseIcon();   // keeps the symbol in sync
});

// ---------------------- LOADING ANIMATION (CANVAS DOTS & LINES) ----------------------
const loadingCanvas = document.querySelector('#loading-screen canvas');
let loadingAnimId; // holds the setInterval id

if (loadingCanvas) {
  const ctx = loadingCanvas.getContext('2d');
  const DOT_RADIUS = 10;
  const MAX_DOTS = 10;
  const dots = [];

  function sizeCanvas() {
    loadingCanvas.width = window.innerWidth;
    loadingCanvas.height = window.innerHeight;
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  // Make the lines grow out of the dots
  function animateLine(x1, y1, x2, y2, color, duration = 2000) {
    const start = performance.now();
    let prevT = 0;
    function draw(now) {
      const t = Math.min((now - start) / duration, 1);
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 4;
      ctx.strokeStyle = color; // blue

      ctx.beginPath();
      ctx.moveTo(x1 + (x2 - x1) * prevT, y1 + (y2 - y1) * prevT);
      ctx.lineTo(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      ctx.stroke();

      ctx.restore();
      prevT = t;
      if (t < 1) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /** Add a new dot and (optionally) draw a line to another dot */
  function addDot() {
    // Choose position
    const x = Math.random() * loadingCanvas.width;
    const y = Math.random() * loadingCanvas.height;
    const color = 'hsl(210, 100%, 30%)'; // standard shade of blue
    const newDot = { x, y, color, connections: 0 };

    // Decide which existing dot to connect to, following the rules:
    // 1. Prefer dots with zero connections  2. Fallback to nearest neighbour
    let targetDot = null;
    if (dots.length) {
      const unconnected = dots.filter(d => d.connections === 0);
      if (unconnected.length) {
        targetDot = unconnected[Math.floor(Math.random() * unconnected.length)];
      } else {
        let minDist = Infinity;
        dots.forEach(d => {
          const dist = Math.hypot(d.x - x, d.y - y);
          if (dist < minDist) {
            minDist = dist;
            targetDot = d;
          }
        });
      }
    }

    dots.push(newDot);
    if (dots.length > MAX_DOTS) dots.shift(); // keep to MAX_DOTS on screen

    // Draw line first (so dot sits on top visually)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    if (targetDot) {
      animateLine(targetDot.x, targetDot.y, x, y, color);
      targetDot.connections += 1;
      newDot.connections += 1;
    }

    let startTime = performance.now();
    function fadeInDot(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / 1000, 1); // 1 second fade in

      ctx.save();
      ctx.globalAlpha = 0.3 * t; // gradually increase opacity
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (t < 1) requestAnimationFrame(fadeInDot);
    }
    requestAnimationFrame(fadeInDot);
  }
  loadingAnimId = setInterval(addDot, 2000); // one dot+line every 0.5s
}

function stopLoadingAnimation() {
  if (loadingAnimId) clearInterval(loadingAnimId);
  if (loadingCanvas) {
    const ctx = loadingCanvas.getContext('2d');
    ctx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height);
  }
}

// ---------------------- APP STARTUP & LOADING-SCREEN TRANSITION ----------------------
let datasetsLoaded = 0;
function checkIfReady() {
  datasetsLoaded += 1;
  if (datasetsLoaded === 2) {
    updateProgress(100);
    setTimeout(() => startApp(), 500);
  }
}

function startApp() {
  // Stop network‑style loading animation
  stopLoadingAnimation();

  // Begin map animation
  startAnimation();

  // Fade out loading screen
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  setTimeout(() => loadingScreen.style.display = 'none', 1000);
}

// ---------------------- INDUSTRY SELECTOR & TIME SLIDER ----------------------
document.addEventListener('DOMContentLoaded', () => {
  const infoBox = document.getElementById('info-box');

  // --- Industry dropdown
  const selector = document.getElementById('industry-select');

  // helper span that lets us measure text widths
  const sizer = document.createElement('span');
  sizer.style.position = 'absolute';
  sizer.style.visibility = 'hidden';
  sizer.style.whiteSpace = 'pre';
  sizer.style.font = getComputedStyle(selector).font;
  document.body.appendChild(sizer);

  // updates <select> so it’s only as wide as the chosen label
  function fitSelect() {
    sizer.textContent = selector.options[selector.selectedIndex].text;
    selector.style.width = sizer.offsetWidth + 30 + 'px';   // 24 ≈ 4 px padding ×2 + 16 px arrow
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = '0';
  defaultOption.textContent = 'every industry';
  selector.appendChild(defaultOption);

  for (const code in naics_industries) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = naics_industries[code].toLowerCase();
    selector.appendChild(opt);
  }
  fitSelect();

  selector.value = '0';
  selector.addEventListener('change', e => {
    fitSelect();
    // ---- loading state ----
    paused = true;
    clearInterval(animationInterval);
    updatePauseIcon();          // now shows ▶
    pauseBtn.textContent = '';    // swap icon for spinner
    pauseBtn.classList.add('loading');
    pauseBtn.disabled = true;

    slider.disabled = true;     // lock the slider
    currentIndex = 0;
    slider.value = 0;
    updateMap();                // force 12:00 am on screen

    currentIndustry = +e.target.value;
    const path = currentIndustry === 0 ? 'data/every_industry.json' : `data/industry_minute_tables/${currentIndustry}.json`;
    fetch(path)
      .then(res => res.json())
      .then(data => {
        truckData = data;
        computeMaxValue();
        currentIndex = 0;
        // update slider range and value
        const slider = document.getElementById('time-slider');
        slider.max = truckData.length - 1;
        slider.value = currentIndex;
        updateMap();
        // ---- leave loading state ----
        pauseBtn.classList.remove('loading');
        pauseBtn.disabled = false;
        slider.disabled = false;

        paused = false;
        updatePauseIcon();
        startAnimation();

      })
      .catch(err => console.error("Error loading industry data:", err));
  });

  // --- Time slider behaviour
  const slider = document.getElementById('time-slider');
  slider.addEventListener('input', e => {
    if (!isDraggingSlider) {
      isDraggingSlider = true;
      wasPausedByUser = paused;
      if (!paused) {
        clearInterval(animationInterval);
        paused = true;
        document.getElementById('info-box').classList.add('paused');
      }
    }
    currentIndex = +e.target.value;
    updateMap();
  });

  slider.addEventListener('change', () => {
    if (!wasPausedByUser) {
      paused = false;
      document.getElementById('info-box').classList.remove('paused');
      startAnimation();
    }
    isDraggingSlider = false;
  });

  // --- “Tell me more” toggle ---
  const moreBtn = document.getElementById('more-btn');
  const morePanel = document.getElementById('more-panel');

  moreBtn.addEventListener('click', () => {
    const open = morePanel.classList.toggle('open');
    moreBtn.textContent = open ? 'Hide' : 'Tell me more';
  });

});
