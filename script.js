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

// ── Memora chatbot (Local LLM Option A polling) ───────────────
(() => {
  const launcher = document.getElementById('memoraLauncher');
  const windowEl = document.getElementById('memoraWindow');
  const closeBtn = document.getElementById('memoraClose');
  const form = document.getElementById('memoraForm');
  const input = document.getElementById('memoraInput');
  const sendBtn = document.getElementById('memoraSend');
  const messages = document.getElementById('memoraMessages');

  if (!launcher || !windowEl || !closeBtn || !form || !input || !sendBtn || !messages) return;

  const MEMORA_API = {
    baseUrl: 'https://seen-figures-luis-adjusted.trycloudflare.com',
    apiKey: '4002cc5c4d9472f53cc066bfdd098e8c53ebeeddd45d40cc23c15087da2f0364',
    collection: 'documents',
    model: 'gemma4:e2b',
    pollIntervalMs: 1800,
    maxPollAttempts: 45,
    requestTimeoutMs: 15000,
  };

  const DILIP_MEMORY = {
    identity: {
      name: 'Dilip Kumar Thirukonda Chandrasekaran',
      location: 'New York, NY',
      email: 'tcdilip@engineer.com',
      phone: '(607) 624-9390',
      headline: 'AI Researcher and Engineer focused on neuro-symbolic planning, LLM automation, and intelligent systems',
    },
    links: {
      linkedin: 'https://linkedin.com/in/dilipkumartc',
      github: 'https://github.com/dilip-bing',
      portfolio: 'https://dilip-bing.github.io/portfolio/',
      paper_pdf: 'pdf/NeuroIPS_NeuroSymbolic_v3.pdf',
      resume_pdf: 'pdf/resume_dilip_kumar_tc_master.pdf',
      projects_page: 'https://dilip-bing.github.io/portfolio/',
    },
    education: [
      'MS in Computer Science (AI Track), Binghamton University, expected May 2027, GPA 3.67/4.00',
      'BE in Electronics and Communication Engineering, KLN College of Engineering, May 2019',
    ],
    research: {
      paper_title: 'Neuro-Symbolic Planning via Adversarial Repair and Compilation',
      venue_status: 'NeurIPS 2026, under review (preprint)',
      summary: 'Treats LLM hallucination in PDDL generation as a repair problem. Uses structured critic feedback loops to classify failures and regenerate valid plans, improving reliability over blind retry baselines.',
      highlights: [
        'Explores error classes such as syntax, predicate mismatch, missing objects, goal semantic mismatch, and unsolvable outputs',
        'Benchmarked across Blocksworld, Gripper, Logistics, and Ferry domains',
        'Strong critic quality is identified as a key factor for final plan correctness',
      ],
    },
    projects: [
      'Neuro-Symbolic Planning via Adversarial Repair and Compilation — https://github.com/dilip-bing/neuro_symbolic_planner',
      'LLM-Native Web Automation Framework — https://github.com/dilip-bing/job_marathon',
      'Resume Builder — https://github.com/dilip-bing/resume_builder',
      'NovaVO — https://github.com/dilip-bing/novavo',
      'Tavus API CVI Vercel — https://github.com/dilip-bing/tavus_api_cvi_vercel',
      'Gym Sync — https://github.com/dilip-bing/personal-project-body_food_habit_builder/tree/main/gym-sync',
    ],
    experience: [
      'Tech Lead at Zoho Corporation (Aug 2023 – Jul 2025): led TestLab product lifecycle with a team of 10; led automation architecture and quality programs.',
      'Software Engineer at Zoho (Sep 2021 – Aug 2023): Android, iOS, and web infrastructure; Kotlin, Swift/SwiftUI, React, MongoDB.',
      'Automation Engineer at Zoho (Jan 2020 – Sep 2021): built and scaled 10,000+ automated tests using Espresso, Appium, Selenium, XCTest and CI/CD.',
    ],
    technical_skills: [
      'Languages: Kotlin, Swift, Java, Python, JavaScript, TypeScript, Objective-C, SQL, C++, Shell/Bash, HTML/CSS',
      'AI/LLM: Claude AI, LangChain, prompt engineering, RAG, LLM agent design',
      'Testing/Automation: Espresso, UiAutomator, Kaspresso, XCTest, Appium, Selenium, GitHub Actions',
      'Platform/Tools: Android SDK, Jetpack, SwiftUI, React.js, MongoDB, MySQL, Docker, Jira, Agile',
    ],
    current_focus: [
      'LLM self-repair with compiler-guided loops',
      'Natural language to executable test suites',
      'Long-horizon context management in agentic systems',
      'Unified memory architecture for personalized AI',
      'Cross-modal automation using vision + language models',
      'Prompt stability across LLM version upgrades',
    ],
  };

  const llmChatHistory = [];
  let isChatOpen = false;
  let isLoading = false;

  const setWindow = (open) => {
    isChatOpen = open;
    windowEl.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  };

  const appendMessage = (text, role, extraClass = '') => {
    const node = document.createElement('div');
    node.className = `memora-msg ${role === 'user' ? 'memora-msg-user' : 'memora-msg-bot'} ${extraClass}`.trim();
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  };

  const setLoading = (value) => {
    isLoading = value;
    sendBtn.disabled = value;
    input.disabled = value;
  };

  const memoryContextText = () => {
    return [
      `Name: ${DILIP_MEMORY.identity.name}`,
      `Location: ${DILIP_MEMORY.identity.location}`,
      `Email: ${DILIP_MEMORY.identity.email}`,
      `Phone: ${DILIP_MEMORY.identity.phone}`,
      `Headline: ${DILIP_MEMORY.identity.headline}`,
      `Links: ${JSON.stringify(DILIP_MEMORY.links)}`,
      `Education: ${DILIP_MEMORY.education.join(' | ')}`,
      `Research: ${DILIP_MEMORY.research.paper_title}. ${DILIP_MEMORY.research.venue_status}. ${DILIP_MEMORY.research.summary}. Highlights: ${DILIP_MEMORY.research.highlights.join(' | ')}`,
      `Projects: ${DILIP_MEMORY.projects.join(' | ')}`,
      `Experience: ${DILIP_MEMORY.experience.join(' | ')}`,
      `Skills: ${DILIP_MEMORY.technical_skills.join(' | ')}`,
      `Current focus: ${DILIP_MEMORY.current_focus.join(' | ')}`,
    ].join('\n');
  };

  const fetchWithTimeout = async (url, options = {}, timeoutMs = MEMORA_API.requestTimeoutMs) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const fallbackAnswerFromMemory = (question) => {
    const q = question.toLowerCase();

    if (q.includes('project') || q.includes('github') || q.includes('repo')) {
      return `I can't reach the local LLM right now, but here are Dilip's key projects:\n- ${DILIP_MEMORY.projects.join('\n- ')}`;
    }
    if (q.includes('paper') || q.includes('research') || q.includes('neurips') || q.includes('publication')) {
      return `I can't reach the local LLM right now. Research snapshot:\n${DILIP_MEMORY.research.paper_title} (${DILIP_MEMORY.research.venue_status}). ${DILIP_MEMORY.research.summary}`;
    }
    if (q.includes('resume') || q.includes('experience') || q.includes('work') || q.includes('zoho')) {
      return `I can't reach the local LLM right now. Experience summary:\n- ${DILIP_MEMORY.experience.join('\n- ')}`;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('linkedin') || q.includes('portfolio')) {
      return `I can't reach the local LLM right now. You can still contact Dilip via:\n- Email: ${DILIP_MEMORY.identity.email}\n- LinkedIn: ${DILIP_MEMORY.links.linkedin}\n- GitHub: ${DILIP_MEMORY.links.github}\n- Portfolio: ${DILIP_MEMORY.links.portfolio}`;
    }

    return `I can't reach the local LLM right now, but here's a quick profile:\n${DILIP_MEMORY.identity.name} is an ${DILIP_MEMORY.identity.headline}. Current focus includes ${DILIP_MEMORY.current_focus.slice(0, 3).join(', ')}.`;
  };

  const submitQuery = async (userQuestion) => {
    const queryHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': MEMORA_API.apiKey,
    };

    const promptWithMemory =
      `You are Memora, a concise assistant about Dilip. ` +
      `Answer only from the provided memory and known profile data. ` +
      `If uncertain, say that you don't have that detail yet.\n\n` +
      `=== DILIP MEMORY ===\n${memoryContextText()}\n\n` +
      `=== USER QUESTION ===\n${userQuestion}`;

    const submitResponse = await fetchWithTimeout(`${MEMORA_API.baseUrl}/query`, {
      method: 'POST',
      headers: queryHeaders,
      body: JSON.stringify({
        question: promptWithMemory,
        collection: MEMORA_API.collection,
        thinking: true,
        model: MEMORA_API.model,
        chat_history: llmChatHistory,
      }),
    });

    if (!submitResponse.ok) {
      throw new Error(`Request failed (${submitResponse.status})`);
    }

    const submitJson = await submitResponse.json();
    if (!submitJson.task_id) {
      throw new Error('No task_id returned from local LLM API.');
    }

    let attempts = 0;
    while (attempts < MEMORA_API.maxPollAttempts) {
      attempts++;
      const poll = await fetchWithTimeout(`${MEMORA_API.baseUrl}/query/${submitJson.task_id}`, {
        method: 'GET',
        headers: { 'X-API-Key': MEMORA_API.apiKey },
      });

      if (!poll.ok) {
        throw new Error(`Polling failed (${poll.status})`);
      }

      const pollJson = await poll.json();
      if (pollJson.status === 'completed') {
        return pollJson.result?.answer || 'I could not generate an answer right now.';
      }

      if (pollJson.status === 'error') {
        throw new Error(pollJson.error || 'Local LLM returned an error.');
      }

      await new Promise((resolve) => setTimeout(resolve, MEMORA_API.pollIntervalMs));
    }

    throw new Error('Timed out waiting for local LLM response.');
  };

  launcher.addEventListener('click', () => setWindow(!isChatOpen));
  closeBtn.addEventListener('click', () => setWindow(false));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const userText = input.value.trim();
    if (!userText) return;

    input.value = '';
    appendMessage(userText, 'user');
    const pendingNode = appendMessage('Thinking...', 'bot', 'memora-msg-muted');

    setLoading(true);
    try {
      const answer = await submitQuery(userText);
      pendingNode.remove();
      appendMessage(answer, 'bot');

      llmChatHistory.push({ role: 'user', content: userText });
      llmChatHistory.push({ role: 'assistant', content: answer });
    } catch (err) {
      pendingNode.remove();
      const reason = err instanceof Error ? err.message : 'Unknown network error';
      appendMessage(`${fallbackAnswerFromMemory(userText)}\n\n(Reason: ${reason})`, 'bot');
    } finally {
      setLoading(false);
      input.focus();
    }
  });
})();
