/* ══════════════════════════════════════
   RENUKA DIXIT — script.js v3
══════════════════════════════════════ */

// ── CUSTOM CURSOR ──────────────────────
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});
(function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animateCursor);
})();
document.querySelectorAll('a, button, .exp-card, .domain-card, .sk, .cert-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


// ── BACKGROUND CIRCUIT / NEURAL DOTS ───
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx    = bgCanvas.getContext('2d');

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

const nodes = Array.from({ length: 55 }, () => ({
  x:  Math.random() * window.innerWidth,
  y:  Math.random() * window.innerHeight,
  vx: (Math.random() - 0.5) * 0.35,
  vy: (Math.random() - 0.5) * 0.35,
  r:  Math.random() * 1.8 + 0.8,
}));

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > bgCanvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > bgCanvas.height) n.vy *= -1;
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx   = nodes[i].x - nodes[j].x;
      const dy   = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        bgCtx.beginPath();
        bgCtx.moveTo(nodes[i].x, nodes[i].y);
        bgCtx.lineTo(nodes[j].x, nodes[j].y);
        bgCtx.strokeStyle = `rgba(224,41,58,${0.1 * (1 - dist / 130)})`;
        bgCtx.lineWidth   = 0.5;
        bgCtx.stroke();
      }
    }
  }
  nodes.forEach(n => {
    bgCtx.beginPath();
    bgCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    bgCtx.fillStyle = 'rgba(224,41,58,0.45)';
    bgCtx.fill();
  });
  requestAnimationFrame(drawBg);
}
drawBg();


// ── ECG LINE (bottom of screen) ─────────
const ecgCanvas = document.getElementById('ecg-canvas');
if (ecgCanvas) {
  const eCtx = ecgCanvas.getContext('2d');
  let ecgOffset = 0;

  function resizeECG() {
    ecgCanvas.width  = ecgCanvas.parentElement.clientWidth;
    ecgCanvas.height = 80;
  }
  resizeECG();
  window.addEventListener('resize', resizeECG);

  function ecgShape(x) {
    const cycle = x % 200;
    if (cycle < 80)  return 0;
    if (cycle < 90)  return -(cycle - 80) * 1.5;
    if (cycle < 100) return -15 + (cycle - 90) * 5;
    if (cycle < 108) return 35 - (cycle - 100) * 7;
    if (cycle < 116) return -21 + (cycle - 108) * 4;
    if (cycle < 130) return 11 - (cycle - 116) * 1.5;
    return 0;
  }

  function drawECG() {
    eCtx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    eCtx.beginPath();
    const mid = ecgCanvas.height / 2;
    for (let px = 0; px <= ecgCanvas.width; px += 2) {
      const y = mid + ecgShape(px + ecgOffset) * 1.4;
      px === 0 ? eCtx.moveTo(px, y) : eCtx.lineTo(px, y);
    }
    eCtx.strokeStyle = '#e0293a';
    eCtx.lineWidth   = 1.5;
    eCtx.shadowColor = '#e0293a';
    eCtx.shadowBlur  = 6;
    eCtx.stroke();
    eCtx.shadowBlur  = 0;
    ecgOffset += 1.5;
    requestAnimationFrame(drawECG);
  }
  drawECG();
}


// ── ANIMATED COUNTERS ──────────────────
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.count);
    let cur = 0;
    const step = Math.ceil(1600 / target);
    const timer = setInterval(() => {
      cur++;
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, step);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.sc-num').forEach(el => countObserver.observe(el));


// ── SCROLL REVEAL ──────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 70);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });
document.querySelectorAll('.exp-card, .domain-card, .cert-item').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// ── NAVBAR SCROLL ──────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});


// ── SIDE NAV DOTS ──────────────────────
const sections = document.querySelectorAll('section[id]');
const dots     = document.querySelectorAll('#side-nav .dot');
const dotObs   = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    dots.forEach(d => d.classList.remove('active'));
    const act = document.querySelector(`#side-nav a[href="#${e.target.id}"]`);
    if (act) act.classList.add('active');
  });
}, { threshold: 0.4 });
sections.forEach(s => dotObs.observe(s));


// ── JOURNEY CARD FILTER ────────────────
document.querySelectorAll('.tl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tl-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.exp-card').forEach(card => {
      card.classList.toggle('hidden', tab !== 'all' && card.dataset.type !== tab);
    });
  });
});


// ── SKILL CLOUD FILTER ─────────────────
document.querySelectorAll('.sf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.sk').forEach(sk => {
      sk.classList.remove('active-cat', 'hidden');
      if (cat === 'all') return;
      if (sk.classList.contains(cat)) sk.classList.add('active-cat');
      else sk.classList.add('hidden');
    });
  });
});


// ── EXPANDABLE PANEL (slide-in) ────────
const epOverlay = document.getElementById('exp-panel-overlay');
const epPanel   = document.getElementById('ep-panel');
const epContent = document.getElementById('ep-content');
const epClose   = document.getElementById('ep-close');

function openPanel(templateId) {
  const tpl = document.getElementById(templateId);
  if (!tpl) return;
  epContent.innerHTML = '';
  epContent.appendChild(tpl.content.cloneNode(true));
  epPanel.scrollTop = 0;
  epOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  epOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.exp-card[data-id]').forEach(card => {
  card.addEventListener('click', () => openPanel(card.dataset.id));
});

epClose.addEventListener('click', closePanel);
epOverlay.addEventListener('click', e => {
  if (e.target === epOverlay) closePanel();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePanel();
});


// ── DNA HELIX CANVAS ───────────────────
const helixCanvas = document.getElementById('helix-canvas');
if (helixCanvas) {
  const hCtx = helixCanvas.getContext('2d');
  let t = 0;

  function drawHelix() {
    hCtx.clearRect(0, 0, 260, 400);
    const CX = 130, AMP = 72, PTS = 80, SPACING = 400 / PTS;

    for (let strand = 0; strand < 2; strand++) {
      const phase = strand === 0 ? t : t + Math.PI;
      hCtx.beginPath();
      for (let i = 0; i <= PTS; i++) {
        const y = i * SPACING;
        const x = CX + Math.sin(i * 0.24 + phase) * AMP;
        i === 0 ? hCtx.moveTo(x, y) : hCtx.lineTo(x, y);
      }
      hCtx.strokeStyle  = strand === 0 ? '#e0293a' : 'rgba(143,170,190,0.7)';
      hCtx.lineWidth    = 2;
      hCtx.shadowColor  = strand === 0 ? '#e0293a' : '#8faabe';
      hCtx.shadowBlur   = 8;
      hCtx.stroke();
      hCtx.shadowBlur   = 0;
    }

    // base pair rungs
    for (let i = 0; i <= PTS; i += 4) {
      const y  = i * SPACING;
      const x1 = CX + Math.sin(i * 0.24 + t) * AMP;
      const x2 = CX + Math.sin(i * 0.24 + t + Math.PI) * AMP;
      const depth = Math.sin(i * 0.24 + t);
      const alpha = 0.15 + 0.25 * Math.abs(depth);

      hCtx.beginPath();
      hCtx.moveTo(x1, y); hCtx.lineTo(x2, y);
      hCtx.strokeStyle = `rgba(224,41,58,${alpha})`;
      hCtx.lineWidth   = 1;
      hCtx.stroke();

      // node dots
      [[x1, '#e0293a'], [x2, '#8faabe']].forEach(([x, color]) => {
        hCtx.beginPath();
        hCtx.arc(x, y, 2.5, 0, Math.PI * 2);
        hCtx.fillStyle   = color;
        hCtx.shadowColor = color;
        hCtx.shadowBlur  = 5;
        hCtx.fill();
        hCtx.shadowBlur  = 0;
      });
    }

    t += 0.022;
    requestAnimationFrame(drawHelix);
  }
  drawHelix();
}


// ── SMOOTH SCROLL ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
