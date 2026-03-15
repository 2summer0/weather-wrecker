/**
 *
 * Structure:
 *  1. EVENT MANIFEST      — cover images + eventId mapping
 *  2. INLINE META CACHE   — fallback metadata when fetch() is unavailable (file://)
 *  3. LAYOUT ENGINE       — random position / rotation / size with viewport clamp
 *  4. CARD RENDERER       — builds .cover-card elements and places them on canvas
 *  5. Z-INDEX MANAGER     — tracks max z-index; click → bring to front
 *  6. PANEL CONTROLLER    — open / close drawer + load meta.json + render content
 */

/* ─────────────────────────────────────────────
   1. EVENT MANIFEST
   Map each cover image file to its eventId (= folder name in /assets/event/)
───────────────────────────────────────────── */
const EVENTS = [
  { id: 'danang', cover: 'assets/Danang.png', label: 'Da Nang' },
  { id: 'guam', cover: 'assets/Guam.png', label: 'Guam' },
  { id: 'gyeongju', cover: 'assets/Gyeongju.jpg', label: 'Gyeongju' },
  { id: 'Salzkammergut', cover: 'assets/Salzkammergut.mp4', label: 'Salzkammergut' },
  { id: 'hawaii', cover: 'assets/Hwaii.jpg', label: 'Hawaii' },
  { id: 'jeju Island', cover: 'assets/jeju.mp4', label: 'Jeju Island' },
  { id: 'melbourne', cover: 'assets/Melbourne.png', label: 'Melbourne' },
  { id: 'queenstown', cover: 'assets/Queenstown.png', label: 'Queenstown' },
  { id: 'tekapo', cover: 'assets/Tekapo.mp4', label: 'Lake Tekapo' },
  { id: 'yeosu and suncheon', cover: 'assets/Yeosu and Suncheon.jpg', label: 'Yeosu & Suncheon' },
  { id: 'nose', cover: 'assets/nose.png', label: 'Nose' },
  { id: 'dear', cover: 'assets/dear.png', label: 'dear' },
  { id: 'sun', cover: 'assets/sun.png', label: 'Out of office' },
];

/* ─────────────────────────────────────────────
   2. INLINE META CACHE
   Data is pre-loaded here as a fallback so the site works when opened
   directly via file:// (no server). fetch() still takes priority.
───────────────────────────────────────────── */
const META_CACHE = {
  'danang': {
    id: 'danang', title: 'Da Nang', country: 'Vietnam', date: '2024.00.00',
    description: '도착 첫 날 부터 시작된 열대성 호우로 빗물이 발목까지 잠겼고, 시내는 물바다가 되었다.',
    images: ['IMG_7119.JPG', 'IMG_7134.JPG'],
    videos: ['IMG_7114.mp4', 'IMG_7129.mp4', 'IMG_7131.mp4']
  },
  'guam': {
    id: 'guam', title: 'Guam', country: 'USA Territory', date: '2024',
    description: '태풍으로 인해 공항이 폐쇄되어 취소된 가족 여행',
    images: ['Screenshot 2026-02-26 at 3.04.33 pm.png', 'Screenshot 2026-02-26 at 3.07.39 pm.png']
  },
  'gyeongju': {
    id: 'gyeongju', title: 'Gyeongju', country: 'South Korea', date: '2024',
    description: 'The ancient capital of the Silla Kingdom — an open-air museum of royal tombs, Buddhist temples, and millennium-old pagodas.',
    images: ['IMG_0756.JPG', 'IMG_0977.JPG', 'IMG_1078.JPG', 'IMG_1102.JPG', 'IMG_1154.JPG', 'IMG_1155.JPG', 'IMG_1161.JPG', 'IMG_1170.JPG']
  },
  'Salzkammergut': {
    id: 'Salzkammergut', title: 'Salzkammergut', country: 'Austria', date: '2024', with: "엄마, 아빠, 서영",
    description: 'A fairy-tale Alpine village perched on a glassy lake. Hallstatt\'s pastel buildings and mirrored reflections belong to another era.',
    images: []
  },
  'hawaii': {
    id: 'hawaii', title: 'Hawaii', country: 'USA', date: '2024',
    description: 'The Aloha State — where volcanic peaks meet endless surf, and lush rainforests give way to white, black, and green sand beaches.',
    images: ['IMG_2147.JPG', 'IMG_2156.jpg', 'IMG_2169.jpg', 'IMG_2696.jpg'],
    videos: ['IMG_2808.mp4', 'IMG_2168.mp4', 'IMG_1671.mp4']
  },
  'jeju Island': {
    id: 'jeju Island', title: 'Jeju Island', country: 'South Korea', date: '2024',
    description: 'Korea\'s volcanic island escape — Hallasan crater, dramatic basalt coastlines, tangerine orchards, and the legendary haenyeo sea women.',
    videos: ['jeju.MP4']
  },
  'melbourne': {
    id: 'melbourne', title: 'Melbourne', country: 'Australia', date: '2024',
    description: 'Australia\'s cultural capital. Laneways dripping in street art, world-class coffee, and sweeping bay views. Melbourne rewards every curious wanderer.',
    images: ['IMG_6446.JPG', 'IMG_6449.JPG', 'IMG_6451.JPG', 'IMG_6466 2.jpg', 'IMG_6468 2.JPG']
  },
  'nose': {
    id: 'nose', title: 'Nose', country: 'Japan', date: '2024',
    description: 'A hidden gem in northern Osaka Prefecture. Ancient cedar forests, hillside temples, and rural silence far from the city crowds.',
    images: []
  },
  'queenstown': {
    id: 'queenstown', title: 'Queenstown', country: 'New Zealand', date: '2024',
    description: 'The adventure capital of the world, nestled beside Lake Wakatipu under the jagged Remarkables. Bungee jumps, ski fields, still-water reflections.',
    images: ['IMG_2253.JPG', 'IMG_2259.JPG', 'IMG_2271.JPG', 'IMG_2290.JPG']
  },
  'tekapo': {
    id: 'tekapo', title: 'Lake Tekapo', country: 'New Zealand', date: '2024',
    description: 'A turquoise glacial lake ringed by lupines and the Southern Alps. At night, Tekapo sits inside one of Earth\'s largest Dark Sky Reserves.',
    images: ['IMG_1284.JPG', 'IMG_1311.jpg', 'IMG_1320.jpg', 'IMG_1356.JPG', 'IMG_2036.JPG', 'IMG_2121.JPG', 'Screenshot 2026-02-26 at 3.30.59 pm.png'],
    videos: ['Tekapo.mp4']
  },
  'yeosu and suncheon': {
    id: 'yeosu and suncheon', title: 'Yeosu & Suncheon', country: 'South Korea', date: '2024',
    description: 'Yeosu\'s glittering night sea and cable cars meet Suncheon\'s vast reed-marshes — two Southern Korean gems best explored together.',
    images: ['IMG_3612.JPG', 'IMG_3841.JPG', 'IMG_4046.jpg', 'IMG_4567.JPG', 'IMG_4568.JPG', 'IMG_5399.JPG']
  },
};

/* ─────────────────────────────────────────────
   3. LAYOUT ENGINE
   Random organic scatter: each card gets a fully random position and
   aspect ratio (portrait or landscape). Rejection-sampled against all
   previously placed cards so the initial layout is overlap-free.
───────────────────────────────────────────── */

const rand = (min, max) => Math.random() * (max - min) + min;

/**
 * Compute AABB overlap area with an optional gap buffer on all sides.
 * Returns overlap area; 0 means the two rects are clear of each other.
 */
function aabbOverlap(a, b, gap = 0) {
  const ox = Math.min(a.left + a.width + gap, b.left + b.width + gap)
    - Math.max(a.left - gap, b.left - gap);
  const oy = Math.min(a.top + a.height + gap, b.top + b.height + gap)
    - Math.max(a.top - gap, b.top - gap);
  return (ox > 0 && oy > 0) ? ox * oy : 0;
}

/**
 * Generates a random, scatter-style position for one card.
 * Tries up to MAX_TRIES placements and picks the one with
 * the least overlap against all already-placed cards.
 *
 * @param {string} id          – event id
 * @param {number} total       – total number of cards
 * @param {Array}  placedRects – rects of cards already placed
 */
function generateLayout(id, total, placedRects) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const PAD_TOP = 130;  // clearance for the scaled-down title
  const PAD_SIDE = 16;
  const PAD_BOT = 30;
  const SPACING = 14;   // minimum gap enforced between cards at placement

  const minW = Math.max(120, vw * 0.12);
  const maxW = Math.min(Math.max(190, vw * 0.23), vw * 0.30);

  const scale = (id === 'sun') ? 0.3 : 1.0;

  const MAX_TRIES = 600;
  let best = null;
  let bestScore = Infinity;

  for (let t = 0; t < MAX_TRIES; t++) {
    const width = rand(minW, maxW) * scale;
    // Allow both portrait AND landscape aspect ratios for organic variety
    const height = width * rand(0.62, 1.55);

    const maxL = Math.max(PAD_SIDE + 1, vw - width - PAD_SIDE);
    const maxT = Math.max(PAD_TOP + 1, vh - height - PAD_BOT);
    const left = rand(PAD_SIDE, maxL);
    const top = rand(PAD_TOP, maxT);

    const candidate = { left, top, width, height };

    // Score: total weighted overlap (with spacing buffer)
    let score = 0;
    const candArea = width * height;

    for (const p of placedRects) {
      const ov = aabbOverlap(candidate, p, SPACING);
      score += ov;
    }

    // Allow ≤ 15% overlap area compared to the candidate's area
    if (score <= candArea * 0.15) {
      return {
        left, top, width, height,
        rotation: rand(-35, 35),
        zIndex: Math.floor(rand(1, 51))
      };
    }
    if (score < bestScore) {
      bestScore = score;
      best = {
        left, top, width, height,
        rotation: rand(-35, 35),
        zIndex: Math.floor(rand(1, 51))
      };
    }
  }

  return best;
}

// Helper to determine if a card should be rotated initially
function shouldRotate(id) {
  return id === 'dear' || id === 'nose';
}


/* ─────────────────────────────────────────────
   3. CARD RENDERER
───────────────────────────────────────────── */
const canvas = document.getElementById('main-canvas');

// Debounced settle: called after image loads correct card heights
let _imgSettleTimer = null;
function scheduleImageSettle() {
  clearTimeout(_imgSettleTimer);
  _imgSettleTimer = setTimeout(() => settleCollisions(null, 25, true), 400);
}

function buildCards() {
  const placedRects = []; // tracks placed card rects for rejection sampling

  EVENTS.forEach((event, i) => {
    const layout = generateLayout(event.id, EVENTS.length, placedRects);
    // Register this card's footprint for subsequent placement checks
    placedRects.push({
      left: layout.left, top: layout.top,
      width: layout.width, height: layout.height
    });

    const card = document.createElement('div');
    card.className = 'cover-card';
    card.dataset.eventId = event.id;
    card.id = `card-${i}`;

    card.style.cssText = `
      left:     ${layout.left}px;
      top:      ${layout.top}px;
      width:    ${layout.width}px;
      height:   ${layout.height}px;
      z-index:  ${layout.zIndex};
      will-change: left, top, opacity, transform;
      touch-action: none;
    `;
    if (typeof revealObserver !== 'undefined') revealObserver.observe(card);

    // Inner element for rotation persistence
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    const rot = shouldRotate(event.id) ? rand(-35, 35) : 0;
    inner.style.setProperty('--rot', `${rot}deg`);


    const isVideoCover = /\.(mp4|webm|mov)$/i.test(event.cover);

    let mediaEl;

    if (isVideoCover) {
      const video = document.createElement('video');
      video.src = event.cover;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.className = 'card-media';
      video.setAttribute('aria-label', event.label);

      video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
          const ratio = video.videoWidth / video.videoHeight;
          const w = parseFloat(card.style.width) || card.offsetWidth;
          card.style.height = `${Math.round(w / ratio)}px`;
          scheduleImageSettle();
        }
      }, { once: true });

      mediaEl = video;
    } else {
      const img = document.createElement('img');
      img.src = event.cover;
      img.alt = event.label;
      img.loading = 'lazy';
      img.draggable = false;
      img.className = 'card-media';
      img.addEventListener('dragstart', e => e.preventDefault());

      img.addEventListener('load', () => {
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          const w = parseFloat(card.style.width) || card.offsetWidth;
          card.style.height = `${Math.round(w / ratio)}px`;
          scheduleImageSettle();
        }
      }, { once: true });

      mediaEl = img;
    }

    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = event.label;

    inner.appendChild(mediaEl);
    inner.appendChild(label);



    // Hover interaction: assign random tilt direction
    card.addEventListener('mouseenter', () => {
      const tilt = Math.random() < 0.5 ? 15 : -15;
      card.style.setProperty('--hover-rot', `${tilt}deg`);
    });

    card.appendChild(inner);

    // Attach interaction behavior
    attachDragAndClick(card, event);

    canvas.appendChild(card);
  });

  // Initial settle immediately after cards are in the DOM
  setTimeout(() => settleCollisions(null, 30, false), 80);
}

/**
 * Reads a card's position from its inline styles (the target/final position,
 * not the visual interpolated position). This is correct even when CSS
 * transitions are running, because style.left always reflects the target.
 */
function getCardRect(el) {
  return {
    left: parseFloat(el.style.left) || 0,
    top: parseFloat(el.style.top) || 0,
    width: parseFloat(el.style.width) || el.offsetWidth,
    height: parseFloat(el.style.height) || el.offsetHeight,
  };
}

/**
 * Multi-pass collision resolver using center-to-center vector push (360°).
 *
 * For each overlapping pair:
 *  1. Compute the vector from card A’s centre to card B’s centre.
 *  2. Determine push magnitude from the minimum AABB overlap depth.
 *  3. Push A and B apart along that vector (50/50 split unless one is pinned).
 *  4. Clamp to viewport after every move.
 * Iterates until no overlaps remain or maxIter is reached.
 * Commits all positions to the DOM in one final pass.
 *
 * @param {Element|null} pinnedCard – card that must not move (the dragged one).
 * @param {number}  maxIter         – max iterations (10 for drag, 25 for settle).
 * @param {boolean} animate         – true = add .is-pushed CSS transition.
 */
function settleCollisions(pinnedCard, maxIter = 12, animate = false) {
  const allCards = Array.from(canvas.querySelectorAll('.cover-card'));
  const n = allCards.length;
  if (n < 2) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const GAP = 10; // minimum clearance between cards after settling

  // Mutable local snapshot — each iteration reads its own updated values
  const pos = allCards.map(el => ({ el, ...getCardRect(el) }));

  for (let iter = 0; iter < maxIter; iter++) {
    let anyOverlap = false;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos[i];
        const b = pos[j];

        const ox = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
        const oy = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
        if (ox <= 0 || oy <= 0) continue;

        // Allow ≤ 15% overlap of the smaller card's area
        const overlapAreaValue = ox * oy;
        const smallerArea = Math.min(a.width * a.height, b.width * b.height);
        if (overlapAreaValue <= smallerArea * 0.15) continue;

        anyOverlap = true;

        const aPinned = a.el === pinnedCard;
        const bPinned = b.el === pinnedCard;

        // ── Centre-to-centre push direction (360° vector) ────────────────
        let dx = (b.left + b.width / 2) - (a.left + a.width / 2);
        let dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 1) {
          // Perfectly coincident centres: use golden-angle spread to avoid
          // all cards collapsing in the same direction
          const angle = (i * 2.3999) % (Math.PI * 2);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
        } else {
          dx /= d;
          dy /= d;
        }

        // Push magnitude: smallest overlap axis depth + clearance gap
        const pen = Math.min(ox, oy) + GAP;
        const half = (aPinned || bPinned) ? pen : pen * 0.5;

        // Move A away from B (opposite to dx/dy), and B away from A
        if (!aPinned) {
          a.left = Math.max(0, Math.min(a.left - dx * half, vw - a.width));
          a.top = Math.max(0, Math.min(a.top - dy * half, vh - a.height));
        }
        if (!bPinned) {
          b.left = Math.max(0, Math.min(b.left + dx * half, vw - b.width));
          b.top = Math.max(0, Math.min(b.top + dy * half, vh - b.height));
        }
      }
    }

    if (!anyOverlap) break; // converged early
  }

  // Commit positions to DOM
  for (const p of pos) {
    if (p.el === pinnedCard) continue;
    const moved = Math.abs(p.left - (parseFloat(p.el.style.left) || 0)) > 0.5
      || Math.abs(p.top - (parseFloat(p.el.style.top) || 0)) > 0.5;
    if (!moved) continue;
    if (animate) p.el.classList.add('is-pushed');
    p.el.style.left = `${p.left}px`;
    p.el.style.top = `${p.top}px`;
    if (animate) {
      p.el.addEventListener('transitionend', () => p.el.classList.remove('is-pushed'), { once: true });
    }
  }
}

/**
 * Handles both dragging and clicking for a card.
 * - True click (movement ≤ threshold) → opens the detail panel.
 * - Drag → moves the card; settles all other cards with the MTV resolver.
 * - .is-dragging class keeps card visually unchanged during drag.
 */
function attachDragAndClick(card, event) {
  let isDragging = false;
  let rafId = null;
  let startX, startY;
  let initialLeft, initialTop;
  let pendingX = 0, pendingY = 0;
  const isMobile = () => window.innerWidth <= 767;
  const threshold = isMobile() ? 12 : 6;

  // Flag to avoid double-firing when both pointerup and click fire for the same tap
  let _handledByPointerUp = false;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;

    isDragging = false;
    _handledByPointerUp = false;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseFloat(card.style.left) || 0;
    initialTop = parseFloat(card.style.top) || 0;

    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!isDragging && Math.sqrt(dx * dx + dy * dy) > threshold) {
      isDragging = true;
      card.classList.add('is-dragging');
      canvas.classList.add('is-drag-active');
      bringToFront(card);
    }

    if (!isDragging) return;

    pendingX = dx;
    pendingY = dy;

    if (rafId) return; // throttle to one rAF per frame
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = parseFloat(card.style.width) || card.offsetWidth;
      const h = parseFloat(card.style.height) || card.offsetHeight;

      card.style.left = `${Math.max(0, Math.min(initialLeft + pendingX, vw - w))}px`;
      card.style.top = `${Math.max(0, Math.min(initialTop + pendingY, vh - h))}px`;

      // Settle other cards — no animation during drag for precise tracking
      settleCollisions(card, 10, false);
    });
  }

  function onPointerUp(e) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    try { card.releasePointerCapture(e.pointerId); } catch (_) {}
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerup', onPointerUp);
    card.removeEventListener('pointercancel', onPointerUp);
    card.classList.remove('is-dragging');
    canvas.classList.remove('is-drag-active');

    if (!isDragging) {
      _handledByPointerUp = true;
      bringToFront(card);
      onCardClick(card, event);
    } else {
      // After drop: run a final animated settle so cards glide into place
      requestAnimationFrame(() => settleCollisions(null, 20, true));
    }
  }

  // Fallback: `click` fires reliably on mobile even when pointerup is missed
  card.addEventListener('click', () => {
    if (isDragging || _handledByPointerUp) return;
    bringToFront(card);
    onCardClick(card, event);
  });

  card.addEventListener('pointerdown', onPointerDown);

}

/* ─────────────────────────────────────────────
   RESIZE HANDLER
   Re-clamp all card positions to viewport, then re-settle.
───────────────────────────────────────────── */
function onWindowResize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cards = canvas.querySelectorAll('.cover-card');
  cards.forEach(card => {
    const w = parseFloat(card.style.width) || card.offsetWidth;
    const h = parseFloat(card.style.height) || card.offsetHeight;
    card.style.left = `${Math.max(0, Math.min(parseFloat(card.style.left) || 0, vw - w))}px`;
    card.style.top = `${Math.max(0, Math.min(parseFloat(card.style.top) || 0, vh - h))}px`;
  });
  // Re-settle with animation after clamping
  settleCollisions(null, 20, true);
}

let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(onWindowResize, 200);
});

/* ─────────────────────────────────────────────
   4. Z-INDEX MANAGER
   On click: bring the clicked card to the very front.
───────────────────────────────────────────── */
let globalMaxZ = 100; // starts above any random z-index

function bringToFront(card) {
  globalMaxZ += 1;
  // 1) Set maximum z-index
  card.style.zIndex = String(globalMaxZ);

  // 2) Move to end of DOM (ensures visual layering and re-order)
  if (canvas && card.parentElement === canvas) {
    canvas.appendChild(card);
  }
}

/* ─────────────────────────────────────────────
   5. PANEL CONTROLLER
───────────────────────────────────────────── */
const overlay = document.getElementById('panel-overlay');
const panel = document.getElementById('side-panel');
const panelBody = document.getElementById('panel-body');
const panelTitleEl = document.getElementById('panel-title');
const panelEyebrowEl = document.getElementById('panel-eyebrow');
const closeBtnEl = document.getElementById('panel-close-btn');

let currentEventId = null;

function openPanel() {
  // Re-measure title position each time panel opens (scroll may have moved it)
  updateMobilePanelOffset();
  overlay.classList.add('is-open');
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = ''; // canvas stays fixed, no body scroll needed
}

function closePanel() {
  overlay.classList.remove('is-open');
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  currentEventId = null;
}

overlay.addEventListener('click', closePanel);
closeBtnEl.addEventListener('click', closePanel);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanel();
});

/** Called when a card is clicked */
async function onCardClick(card, event) {
  // 1. Bring card to maximum z-index
  bringToFront(card);

  // 2. If same event already open, toggle closed
  if (currentEventId === event.id && panel.classList.contains('is-open')) {
    closePanel();
    return;
  }

  currentEventId = event.id;

  // 3. Show panel immediately with loading state
  panelTitleEl.textContent = event.label;
  panelEyebrowEl.textContent = 'Destination';
  panelBody.innerHTML = `
    <div class="panel-loading">
      <div class="spinner"></div>
      <span>Loading…</span>
    </div>
  `;
  openPanel();

  // 4. Try fetch first (works when served via HTTP), fall back to inline cache
  try {
    const metaUrl = `assets/event/${encodeURIComponent(event.id)}/meta.json`;
    const res = await fetch(metaUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const meta = await res.json();
    renderPanelContent(meta, event.id);
  } catch (_err) {
    // Fallback: use inline META_CACHE (works for file:// and offline)
    const cached = META_CACHE[event.id];
    if (cached) {
      renderPanelContent(cached, event.id);
    } else {
      panelBody.innerHTML = `<p class="panel-empty">No data available for this destination.</p>`;
    }
  }
}

/** Renders panel body from meta.json data */
function renderPanelContent(meta, eventId) {
  panelTitleEl.textContent = meta.title || eventId;
  panelEyebrowEl.textContent = meta.country || 'Destination';

  let html = '';

  // ── Meta chips (country + date)
  html += `<div class="panel-meta">`;
  if (meta.country) {
    html += `
      <span class="meta-chip">
        ${escHtml(meta.country)}
      </span>`;
  }

  if (meta.date) {
    html += `
      <span class="meta-chip">
        ${escHtml(meta.date)}
      </span>`;
  }

  html += `</div>`;

  // ── With
  if (meta.with) {
    html += `
    <div class="panel-meta-with">
      ${escHtml(meta.with)}
    </div>`;
  }

  // ── Description
  if (meta.description) {
    html += `<p class="panel-description">${escHtml(meta.description)}</p>`;
  }

  // ── Tags
  if (meta.tags && meta.tags.length) {
    html += `<div class="panel-tags">`;
    meta.tags.forEach(t => {
      html += `<span class="tag">${escHtml(t)}</span>`;
    });
    html += `</div>`;
  }

  // ── Gallery
  const images = meta.images || [];
  const videos = meta.videos || (meta.video ? [meta.video] : []);
  const hasMedia = images.length > 0 || videos.length > 0;

  if (hasMedia) {
    html += `<div class="panel-gallery">`;

    // Videos first
    videos.forEach(v => {
      const videoSrc = `assets/event/${encodeURIComponent(eventId)}/${encodeURIComponent(v)}`;
      const ext = v.split('.').pop().toLowerCase();

      let videoType = '';
      if (ext === 'mp4') videoType = 'video/mp4';
      else if (ext === 'webm') videoType = 'video/webm';
      else if (ext === 'mov') videoType = 'video/quicktime';

      html += `
    <div class="gallery-video-item">
      <video class="panel-video" controls muted playsinline preload="metadata">
        <source src="${videoSrc}" type="${videoType}">
        Your browser does not support the video tag.
      </video>
    </div>`;
    });

    // Images
    images.forEach(filename => {
      const src = `assets/event/${encodeURIComponent(eventId)}/${encodeURIComponent(filename)}`;
      html += `
    <div class="gallery-item">
      <img
        class="main-media"
        src="${src}"
        alt="${escHtml(filename)}"
        onload="this.classList.add('loaded')"
      />
    </div>`;
    });

    html += `</div>`;
  } else {
    html += `<p class="panel-empty">✦ More photos coming soon.</p>`;
  }

  panelBody.innerHTML = html;
  panelBody.scrollTop = 0;
}

/** Minimal XSS guard for injected content */
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

document.addEventListener("click", (e) => {
  const img = e.target.closest(".gallery-item img");
  if (!img) return;

  lightboxImg.src = img.currentSrc || img.src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
});

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}

if (lightbox) {
  lightbox.addEventListener("click", closeLightbox);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});


/* ─────────────────────────────────────────────
   INIT & SCROLL INTERACTIONS
───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

function updateTitleTransition() {
  const homeSection = document.getElementById('home-section');
  const heroTitle = document.getElementById('hero-title');
  const homeEyebrow = document.getElementById('home-eyebrow');
  if (!homeSection || !heroTitle) return;

  if (heroTitle) {
    heroTitle.style.cursor = "pointer";

    heroTitle.addEventListener("click", () => {
      window.location.reload();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    const homeTitle = document.getElementById("home-title");

    if (homeTitle) {
      homeTitle.addEventListener("click", () => {
        window.location.reload();
      });
    }
  });


  requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    const transitionDistance = window.innerHeight * 1.3;
    const progress = Math.min(Math.max(scrollY / transitionDistance, 0), 1);

    const isMobile = window.innerWidth <= 768;

    const targetScale = 0.4;
    const scale = 1 + (targetScale - 1) * progress;

    // 첫 화면 시작 위치: 너무 과하지 않게 위로
    const startY = isMobile ? -80 : -28;

    // 스크롤 후 최종 위치: 기존보다 조금 더 아래로
    const vh = window.innerHeight;
    const topOffset = isMobile ? 30 : 50;
    const endY = -(vh / 2) + topOffset;

    const y = startY + (endY - startY) * progress;

    // title 이동 + 축소
    heroTitle.style.transform = `translateY(${y}px) scale(${scale})`;

    // eyebrow도 같이 이동
    if (homeEyebrow) {
      homeEyebrow.style.transform = `translateY(${y}px)`;

      // 초반에 서서히 사라지게
      const eyebrowOpacity = Math.max(1 - (progress * 3.2), 0);
      homeEyebrow.style.opacity = eyebrowOpacity;
    }
  });
}

window.addEventListener('scroll', updateTitleTransition, { passive: true });
window.addEventListener('resize', updateTitleTransition, { passive: true });
document.addEventListener('DOMContentLoaded', updateTitleTransition);
updateTitleTransition();

/* ─────────────────────────────────────────────
   MOBILE BOTTOM SHEET: dynamic top offset
   Measures the actual hero-title element bottom
   so the sheet starts just below the title text.
───────────────────────────────────────────── */
function updateMobilePanelOffset() {
  if (window.innerWidth > 767) return;

  // Use the actual title text element, NOT the wrapper (which is 100svh tall)
  const heroTitle = document.getElementById('hero-title');
  const MARGIN = 16; // gap between title bottom and panel top

  let titleBottom;
  if (heroTitle) {
    const rect = heroTitle.getBoundingClientRect();
    titleBottom = Math.round(rect.bottom) + MARGIN;
  } else {
    titleBottom = 100; // safe fallback
  }

  // Clamp: at least 60px from top, at most 40% of viewport
  titleBottom = Math.max(60, Math.min(titleBottom, Math.round(window.innerHeight * 0.4)));

  const panelH = window.innerHeight - titleBottom;
  document.documentElement.style.setProperty('--mobile-panel-top', `${titleBottom}px`);
  document.documentElement.style.setProperty('--mobile-panel-height', `${panelH}px`);
}

updateMobilePanelOffset();
window.addEventListener('resize', updateMobilePanelOffset, { passive: true });
window.addEventListener('scroll', updateMobilePanelOffset, { passive: true });

buildCards();
