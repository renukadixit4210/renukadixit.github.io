/* ══════════════════════════════════════
   RENUKA DIXIT — Interactive JS
══════════════════════════════════════ */

// ── CUSTOM CURSOR ──────────────────────
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mx = 0, my = 0;
let cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

// Smooth cursor lag
(function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animateCursor);
})();

// Scale cursor on interactive elements
document.querySelectorAll('a, button, .domain-card, .proj-row, .sk').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.6)');
  el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
});


// ── BACKGROUND PARTICLE CANVAS ─────────
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeBg() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

const nodes = [];
const NODE_COUNT = 60;

for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1
  });
}

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Move
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > bgCanvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > bgCanvas.height) n.vy *= -1;
  });

  // Connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 140) {
        bgCtx.beginPath();
        bgCtx.moveTo(nodes[i].x, nodes[i].y);
        bgCtx.lineTo(nodes[j].x, nodes[j].y);
        bgCtx.strokeStyle = `rgba(0,200,180,${0.12 * (1 - dist/140)})`;
        bgCtx.lineWidth = 0.6;
        bgCtx.stroke();
      }
    }
  }

  // Nodes
  nodes.forEach(n => {
    bgCtx.beginPath();
    bgCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    bgCtx.fillStyle = 'rgba(0,200,180,0.5)';
    bgCtx.fill();
  });

  requestAnimationFrame(drawBg);
}
drawBg();


// ── ANIMATED COUNTERS ──────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  let start = 0;
  const dur = 1600;
  const step = dur / target;
  const timer = setInterval(() => {
    start++;
    el.textContent = start;
    if (start >= target) clearInterval(timer);
  }, step);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      countObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.sc-num').forEach(el => countObserver.observe(el));


// ── SCROLL REVEAL ──────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.tl-item, .domain-card, .cert-item, .proj-row').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// ── SIDE NAV DOTS ──────────────────────
const sections = document.querySelectorAll('section[id]');
const dots = document.querySelectorAll('#side-nav .dot');

const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      dots.forEach(d => d.classList.remove('active'));
      const active = document.querySelector(`#side-nav a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => dotObserver.observe(s));


// ── NAVBAR SCROLL ──────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.borderBottomColor = window.scrollY > 40
    ? 'rgba(0,200,180,0.2)'
    : 'rgba(255,255,255,0.06)';
});


// ── TIMELINE FILTER ────────────────────
const tlBtns = document.querySelectorAll('.tl-btn');
const tlItems = document.querySelectorAll('.tl-item');

tlBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tlBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    tlItems.forEach(item => {
      if (tab === 'all' || item.dataset.type === tab) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});


// ── SKILL FILTER ───────────────────────
const sfBtns = document.querySelectorAll('.sf-btn');
const skills = document.querySelectorAll('.sk');

sfBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sfBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;

    skills.forEach(sk => {
      sk.classList.remove('active-cat', 'hidden');
      if (cat === 'all') {
        // all visible, no highlight
      } else if (sk.classList.contains(cat)) {
        sk.classList.add('active-cat');
      } else {
        sk.classList.add('hidden');
      }
    });
  });
});


// ── DNA HELIX CANVAS ───────────────────
const helixCanvas = document.getElementById('helix-canvas');
if (helixCanvas) {
  const hCtx = helixCanvas.getContext('2d');
  let helixT = 0;

  function drawHelix() {
    hCtx.clearRect(0, 0, 260, 400);
    const CX = 130;
    const amplitude = 70;
    const speed = 0.025;
    const pts = 80;
    const spacing = 400 / pts;

    // Draw two strands
    for (let strand = 0; strand < 2; strand++) {
      const phase = strand === 0 ? helixT : helixT + Math.PI;
      hCtx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const y = i * spacing;
        const x = CX + Math.sin(i * 0.25 + phase) * amplitude;
        if (i === 0) hCtx.moveTo(x, y);
        else hCtx.lineTo(x, y);
      }
      hCtx.strokeStyle = strand === 0 ? '#00c8b4' : 'rgba(59,130,246,0.8)';
      hCtx.lineWidth = 2.5;
      hCtx.shadowColor = strand === 0 ? '#00c8b4' : '#3b82f6';
      hCtx.shadowBlur = 8;
      hCtx.stroke();
      hCtx.shadowBlur = 0;
    }

    // Draw rungs (base pairs)
    for (let i = 0; i <= pts; i += 4) {
      const y = i * spacing;
      const x1 = CX + Math.sin(i * 0.25 + helixT) * amplitude;
      const x2 = CX + Math.sin(i * 0.25 + helixT + Math.PI) * amplitude;
      const depth = Math.sin(i * 0.25 + helixT);
      const alpha = 0.2 + 0.3 * Math.abs(depth);
      hCtx.beginPath();
      hCtx.moveTo(x1, y);
      hCtx.lineTo(x2, y);
      hCtx.strokeStyle = `rgba(0, 200, 180, ${alpha})`;
      hCtx.lineWidth = 1.2;
      hCtx.stroke();

      // Draw dots at rung ends
      [x1, x2].forEach((x, si) => {
        hCtx.beginPath();
        hCtx.arc(x, y, 2.5, 0, Math.PI * 2);
        hCtx.fillStyle = si === 0 ? '#00e5cc' : '#3b82f6';
        hCtx.shadowColor = si === 0 ? '#00e5cc' : '#3b82f6';
        hCtx.shadowBlur = 6;
        hCtx.fill();
        hCtx.shadowBlur = 0;
      });
    }

    helixT += speed;
    requestAnimationFrame(drawHelix);
  }
  drawHelix();
}


// ── SMOOTH SCROLL for internal links ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
