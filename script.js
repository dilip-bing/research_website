const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const topbar      = document.querySelector('.topbar');
const heroPanel   = document.querySelector('.hero-panel');
const heroContent = document.querySelector('.hero-content');
const progressBar = document.getElementById('scrollProgressBar');

// ── Scroll progress bar ──────────────────────────────────────
if (!prefersReducedMotion && progressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── Topbar scroll state ─────────────────────────────────────
if (!prefersReducedMotion && topbar) {
  const updateTopbar = () => topbar.classList.toggle('scrolled', window.scrollY > 24);
  updateTopbar();
  window.addEventListener('scroll', updateTopbar, { passive: true });
}

// ── Reveal on scroll (single elements) ─────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i * 70, 240)}ms`;
  revealObserver.observe(el);
});

// ── Staggered children reveal ───────────────────────────────
const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');

      const children = entry.target.querySelectorAll(':scope > *');
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 80}ms`;
      });

      staggerObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
);

document.querySelectorAll('.research-grid, .exp-timeline').forEach((el) => {
  staggerObserver.observe(el);
});

// ── Hero panel entrance + parallax ─────────────────────────
if (!prefersReducedMotion && heroPanel) {
  window.requestAnimationFrame(() => heroPanel.classList.add('in'));

  let ticking = false;

  const updateMotion = () => {
    const s = window.scrollY;
    heroPanel.style.transform = `translate3d(0, ${Math.min(s * 0.05, 20)}px, 0)`;
    if (heroContent) heroContent.style.transform = `translate3d(0, ${-Math.min(s * 0.02, 10)}px, 0)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateMotion); ticking = true; }
  }, { passive: true });
}

// ── Counter animation ────────────────────────────────────────
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.count-up').forEach((el) => {
  counterObserver.observe(el);
});

function animateCounter(el) {
  if (prefersReducedMotion) return;
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1400;
  const start    = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = Math.floor(eased * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };

  el.textContent = '0' + suffix;
  requestAnimationFrame(step);
}

// ── Active nav highlighting on scroll ───────────────────────
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.remove('active'));
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
);

sections.forEach((s) => navObserver.observe(s));

// ── Magnetic buttons ─────────────────────────────────────────
if (!prefersReducedMotion) {
  document.querySelectorAll('.btn-primary').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.18;
      const y = (e.clientY - r.top  - r.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── Research terminal animation ─────────────────────────────
const rtermBody = document.getElementById('rtermBody');

const LOG_ENTRIES = [
  { tag: 'ACTIVE', cls: 'rt-active',  text: 'neuro-symbolic planner → IPC-2023 benchmarks running' },
  { tag: 'SUBMIT', cls: 'rt-submit',  text: 'NeurIPS 2026 paper → status: under review ✓' },
  { tag: 'BUILD ', cls: 'rt-build',   text: 'Memora RAG pipeline → 847 memory cards indexed' },
  { tag: 'PASS  ', cls: 'rt-pass',    text: 'LLM automation suite → UI accuracy: 94.2%' },
  { tag: 'TRAIN ', cls: 'rt-train',   text: 'PDDL repair model → epoch 14 / 20 complete' },
  { tag: 'OPEN  ', cls: 'rt-open',    text: 'LLM-native framework → open sourced on GitHub' },
  { tag: 'ACTIVE', cls: 'rt-active',  text: 'prompt stability eval → diff across 3 model versions' },
  { tag: 'BUILD ', cls: 'rt-build',   text: 'NL-to-test compiler → behavior tree XML verified' },
];

if (rtermBody && !prefersReducedMotion) {
  const MAX_LINES = 5;
  let entryIdx = 0;

  function getTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function addLine() {
    const entry = LOG_ENTRIES[entryIdx % LOG_ENTRIES.length];
    entryIdx++;

    const line = document.createElement('div');
    line.className = 'rterm-line';
    line.innerHTML =
      `<span class="rterm-time">${getTime()}</span>` +
      `<span class="rterm-tag ${entry.cls}">[${entry.tag}]</span>` +
      `<span class="rterm-text">${entry.text}</span>`;

    rtermBody.appendChild(line);

    // trim to MAX_LINES
    while (rtermBody.children.length > MAX_LINES) {
      rtermBody.removeChild(rtermBody.firstChild);
    }
  }

  // seed first few lines immediately
  addLine(); addLine(); addLine();

  // then keep adding every 2.4s
  setInterval(addLine, 2400);
}

// ── Particle constellation ───────────────────────────────────
if (!prefersReducedMotion) {
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const COUNT = 55;
    const CONNECT = 140;
    let particles = [];
    let rafId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const make = () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.4 + 0.4,
      op: Math.random() * 0.35 + 0.08,
      hue: Math.random() > 0.5 ? 165 : 210, // teal vs blue
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT) {
            const alpha = 0.07 * (1 - dist / CONNECT);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 215, 170, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 72%, ${p.op})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    particles = Array.from({ length: COUNT }, make);
    draw();

    // pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(rafId); }
      else draw();
    });
  }
}
