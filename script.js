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


// ══════════════════════════════════════════════════════
// BIOLUMINESCENT NEURAL NETWORK — full background system
// Three node types · synaptic pulses · glow halos · depth
// ══════════════════════════════════════════════════════
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx    = bgCanvas.getContext('2d');

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  buildNetwork();
}

// ── Node types & palette ──────────────────────────────
// soma    = large cell body, gold, strong glow
// axon    = medium connector node, violet
// dendrite= small terminal, teal, fast pulse receiver
const PALETTES = {
  soma:     { core: '#f0b429', glow: 'rgba(240,180,41,{a})',     pulse: 'rgba(255,210,80,{a})' },
  axon:     { core: '#9b6fe0', glow: 'rgba(155,111,224,{a})',    pulse: 'rgba(190,150,255,{a})' },
  dendrite: { core: '#2dd4bf', glow: 'rgba(45,212,191,{a})',     pulse: 'rgba(100,240,220,{a})' },
};

// ── Pulse: a glowing dot travelling along a synapse ───
class Pulse {
  constructor(from, to) {
    this.from    = from;
    this.to      = to;
    this.t       = 0;                    // 0 → 1 progress
    this.speed   = 0.004 + Math.random() * 0.006;
    this.pal     = PALETTES[from.type];
    this.size    = 2 + Math.random() * 2;
    this.alive   = true;
  }
  update() {
    this.t += this.speed;
    if (this.t >= 1) { this.alive = false; }
  }
  draw(ctx) {
    const x = this.from.x + (this.to.x - this.from.x) * this.t;
    const y = this.from.y + (this.to.y - this.from.y) * this.t;
    // outer halo
    const g = ctx.createRadialGradient(x, y, 0, x, y, this.size * 5);
    g.addColorStop(0,   this.pal.pulse.replace('{a}', '0.6'));
    g.addColorStop(0.4, this.pal.pulse.replace('{a}', '0.2'));
    g.addColorStop(1,   this.pal.pulse.replace('{a}', '0'));
    ctx.beginPath();
    ctx.arc(x, y, this.size * 5, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // bright core
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.pal.core;
    ctx.shadowColor = this.pal.core;
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ── Node ─────────────────────────────────────────────
class NeuralNode {
  constructor(w, h) {
    const types  = ['soma','soma','axon','axon','axon','dendrite','dendrite','dendrite'];
    this.type    = types[Math.floor(Math.random() * types.length)];
    this.x       = Math.random() * w;
    this.y       = Math.random() * h;
    // depth layer 0..1 — affects size, speed, opacity
    this.depth   = Math.random();
    const speed  = (0.08 + Math.random() * 0.18) * (0.4 + this.depth * 0.6);
    const angle  = Math.random() * Math.PI * 2;
    this.vx      = Math.cos(angle) * speed;
    this.vy      = Math.sin(angle) * speed;
    // soma bigger, dendrite smaller
    const baseR  = this.type === 'soma' ? 4 : this.type === 'axon' ? 2.5 : 1.6;
    this.r       = baseR * (0.6 + this.depth * 0.7);
    this.pal     = PALETTES[this.type];
    // pulse firing timer
    this.fireTimer    = Math.random() * 200;
    this.fireInterval = 80 + Math.random() * 220;
    // ambient breathing phase
    this.phase   = Math.random() * Math.PI * 2;
    this.phaseSpeed = 0.01 + Math.random() * 0.015;
    this.connections = [];  // filled after network build
  }

  update(w, h, pulses, time) {
    this.x += this.vx;
    this.y += this.vy;
    // soft wrap — fade back in from opposite side
    if (this.x < -60)  this.x = w + 60;
    if (this.x > w+60) this.x = -60;
    if (this.y < -60)  this.y = h + 60;
    if (this.y > h+60) this.y = -60;

    this.phase += this.phaseSpeed;

    // fire synaptic pulse along a random connection
    this.fireTimer++;
    if (this.fireTimer > this.fireInterval && this.connections.length > 0) {
      this.fireTimer = 0;
      this.fireInterval = 80 + Math.random() * 220;
      const target = this.connections[Math.floor(Math.random() * this.connections.length)];
      pulses.push(new Pulse(this, target));
    }
  }

  draw(ctx) {
    const breath = 0.7 + 0.3 * Math.sin(this.phase);
    const alpha  = (0.25 + this.depth * 0.45) * breath;
    const gR     = this.r * (this.type === 'soma' ? 8 : 5);

    // outer ambient glow
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, gR);
    grd.addColorStop(0,   this.pal.glow.replace('{a}', (alpha * 0.55).toFixed(2)));
    grd.addColorStop(0.5, this.pal.glow.replace('{a}', (alpha * 0.15).toFixed(2)));
    grd.addColorStop(1,   this.pal.glow.replace('{a}', '0'));
    ctx.beginPath();
    ctx.arc(this.x, this.y, gR, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // core dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * breath, 0, Math.PI * 2);
    ctx.fillStyle   = this.pal.core;
    ctx.shadowColor = this.pal.core;
    ctx.shadowBlur  = this.type === 'soma' ? 14 : 7;
    ctx.globalAlpha = alpha + 0.3;
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }
}

// ── Synapse (connection line) ─────────────────────────
function drawSynapse(ctx, a, b, dist, maxDist) {
  const alpha = 0.04 + 0.18 * (1 - dist / maxDist);
  // depth-blend: closer nodes = slightly brighter line
  const depthAlpha = alpha * (0.5 + (a.depth + b.depth) * 0.5);

  // pick line color by dominant type
  let color;
  if (a.type === 'soma' || b.type === 'soma')
    color = `rgba(201,146,10,${depthAlpha.toFixed(3)})`;
  else if (a.type === 'dendrite' || b.type === 'dendrite')
    color = `rgba(45,212,191,${depthAlpha.toFixed(3)})`;
  else
    color = `rgba(155,111,224,${depthAlpha.toFixed(3)})`;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  // slight curve — like a real axon branching
  const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * 0;
  const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * 0;
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 0.6 + (1 - dist / maxDist) * 0.5;
  ctx.stroke();
}

// ── Network state ─────────────────────────────────────
let neuralNodes = [];
let pulses      = [];
const MAX_DIST  = 180;
const NODE_COUNT = 72;

function buildNetwork() {
  const w = bgCanvas.width, h = bgCanvas.height;
  neuralNodes = Array.from({ length: NODE_COUNT }, () => new NeuralNode(w, h));
  // pre-compute persistent connections (only connect nearby nodes)
  neuralNodes.forEach(node => {
    node.connections = neuralNodes.filter(other => {
      if (other === node) return false;
      const dx = node.x - other.x, dy = node.y - other.y;
      return Math.sqrt(dx*dx + dy*dy) < MAX_DIST;
    });
  });
  pulses = [];
}

resizeBg();
window.addEventListener('resize', resizeBg);

// ── Main draw loop ────────────────────────────────────
let bgTime = 0;
function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgTime++;

  // update nodes
  neuralNodes.forEach(n => n.update(bgCanvas.width, bgCanvas.height, pulses, bgTime));

  // draw synapses first (behind nodes)
  bgCtx.save();
  for (let i = 0; i < neuralNodes.length; i++) {
    for (let j = i + 1; j < neuralNodes.length; j++) {
      const a = neuralNodes[i], b = neuralNodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < MAX_DIST) drawSynapse(bgCtx, a, b, dist, MAX_DIST);
    }
  }
  bgCtx.restore();

  // draw nodes
  neuralNodes.forEach(n => n.draw(bgCtx));

  // update & draw pulses
  pulses = pulses.filter(p => p.alive);
  pulses.forEach(p => { p.update(); p.draw(bgCtx); });

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
    eCtx.strokeStyle = '#c9920a';
    eCtx.lineWidth   = 1.5;
    eCtx.shadowColor = '#c9920a';
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
    const W = 280, H = 420;
    hCtx.clearRect(0, 0, W, H);

    // subtle dark panel bg so helix isn't lost in neural network
    hCtx.fillStyle = 'rgba(5,6,10,0.55)';
    hCtx.fillRect(0, 0, W, H);

    const CX = W / 2, AMP = 80, PTS = 80, SPACING = H / PTS;

    // ── strands ──────────────────────────
    for (let strand = 0; strand < 2; strand++) {
      const phase = strand === 0 ? t : t + Math.PI;
      const color = strand === 0 ? '#c9920a' : '#9b6fe0';
      const glow  = strand === 0 ? '#c9920a' : '#9b6fe0';

      hCtx.beginPath();
      for (let i = 0; i <= PTS; i++) {
        const y = i * SPACING;
        const x = CX + Math.sin(i * 0.24 + phase) * AMP;
        i === 0 ? hCtx.moveTo(x, y) : hCtx.lineTo(x, y);
      }
      // outer glow pass
      hCtx.strokeStyle = color;
      hCtx.lineWidth   = 5;
      hCtx.globalAlpha = 0.15;
      hCtx.shadowColor = glow;
      hCtx.shadowBlur  = 20;
      hCtx.stroke();
      // crisp inner line
      hCtx.globalAlpha = 1;
      hCtx.lineWidth   = 2;
      hCtx.shadowBlur  = 12;
      hCtx.stroke();
      hCtx.shadowBlur  = 0;
    }

    // ── base pair rungs ───────────────────
    for (let i = 2; i <= PTS - 2; i += 4) {
      const y     = i * SPACING;
      const x1    = CX + Math.sin(i * 0.24 + t) * AMP;
      const x2    = CX + Math.sin(i * 0.24 + t + Math.PI) * AMP;
      const depth = Math.abs(Math.sin(i * 0.24 + t));
      const alpha = 0.25 + 0.45 * depth;

      // rung line — gradient from gold to violet
      const grad = hCtx.createLinearGradient(x1, y, x2, y);
      grad.addColorStop(0,   `rgba(240,180,41,${alpha})`);
      grad.addColorStop(0.5, `rgba(200,160,255,${alpha * 0.6})`);
      grad.addColorStop(1,   `rgba(155,111,224,${alpha})`);

      hCtx.beginPath();
      hCtx.moveTo(x1, y);
      hCtx.lineTo(x2, y);
      hCtx.strokeStyle = grad;
      hCtx.lineWidth   = 1.5;
      hCtx.shadowColor = '#c9920a';
      hCtx.shadowBlur  = depth > 0.5 ? 6 : 0;
      hCtx.stroke();
      hCtx.shadowBlur  = 0;

      // node dots — gold left, violet right
      [[x1, '#f0b429', 3.5], [x2, '#9b6fe0', 3.5]].forEach(([x, color, r]) => {
        // glow ring
        const g = hCtx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0,   color === '#f0b429' ? 'rgba(240,180,41,0.5)' : 'rgba(155,111,224,0.5)');
        g.addColorStop(1,   'rgba(0,0,0,0)');
        hCtx.beginPath();
        hCtx.arc(x, y, r * 4, 0, Math.PI * 2);
        hCtx.fillStyle = g;
        hCtx.fill();
        // solid core
        hCtx.beginPath();
        hCtx.arc(x, y, r, 0, Math.PI * 2);
        hCtx.fillStyle   = color;
        hCtx.shadowColor = color;
        hCtx.shadowBlur  = 10;
        hCtx.fill();
        hCtx.shadowBlur  = 0;
      });
    }

    t += 0.02;
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
