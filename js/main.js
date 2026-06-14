/**
 * main.js — Portfolio page interactions, animations, rendering
 */
import { DataStore } from './projects.js';

/* ── Helpers ───────────────────────────────────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ── Toast ─────────────────────────────────────────────────── */
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${esc(msg)}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

/* ── Difficulty Badge HTML ─────────────────────────────────── */
function difficultyHTML(level) {
  if (!level) return '';
  const map = {
    'Beginner':     { dots: 1, cls: 'beginner',     label: 'Beginner' },
    'Intermediate': { dots: 2, cls: 'intermediate',  label: 'Intermediate' },
    'Advanced':     { dots: 3, cls: 'advanced',      label: 'Advanced' },
    'Expert':       { dots: 4, cls: 'expert',        label: 'Expert' },
  };
  const info = map[level] || map['Intermediate'];
  const dotsHtml = [1,2,3,4].map(i =>
    `<span class="difficulty-dot${i <= info.dots ? ' active' : ''}"></span>`
  ).join('');
  return `<div class="difficulty-badge difficulty-${info.cls}">
    <span class="difficulty-dots">${dotsHtml}</span>
    ${esc(info.label)}
  </div>`;
}

/* ── Google Drive Video Embed URL ──────────────────────────── */
function driveEmbedUrl(url) {
  if (!url) return '';
  // Convert share link to embed: https://drive.google.com/file/d/FILE_ID/view → embed
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  // If already an embed or other link, return as-is
  return url;
}

/* ── Populate meta from DataStore ──────────────────────────── */
function applyMeta() {
  const meta = DataStore.getMeta();
  const heroName = $('#hero-name');
  if (heroName) heroName.textContent = meta.name;
  const heroBio = $('#hero-bio');
  if (heroBio) heroBio.textContent = meta.bio;
  const aboutName = $('#about-name');
  if (aboutName) aboutName.textContent = meta.name + '.';
  const aboutBio = $('#about-bio');
  if (aboutBio) aboutBio.textContent = meta.bio;

  // Social links
  const links = {
    '#link-github':   meta.github,
    '#link-linkedin': meta.linkedin,
    '#link-twitter':  meta.twitter,
    '#link-email':    meta.email ? `mailto:${meta.email}` : '',
  };
  Object.entries(links).forEach(([sel, href]) => {
    const el = $(sel);
    if (el && href) { el.href = href; el.style.display = 'flex'; }
    else if (el)     { el.style.display = 'none'; }
  });

  // Footer
  const footerName = $('#footer-name');
  if (footerName) footerName.textContent = meta.name;

  // CV button
  const cvBtn = $('#cv-btn');
  if (cvBtn) {
    if (meta.cvUrl) {
      cvBtn.href = meta.cvUrl;
      cvBtn.style.display = '';
    } else {
      cvBtn.style.display = 'none';
    }
  }

  // Page title
  document.title = `${meta.name} — Portfolio`;

  // Apply Section Visibility
  applySectionVisibility();
}

/* ── Background Canvas (floating particles) ────────────────── */
function initCanvas() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const COLORS = ['rgba(0,200,83,', 'rgba(0,230,118,', 'rgba(105,240,174,'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    particles = Array.from({ length: 55 }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.8 + 0.4,
      vx:  (Math.random() - 0.5) * 0.25,
      vy:  (Math.random() - 0.5) * 0.25,
      c:   COLORS[Math.floor(Math.random() * COLORS.length)],
      a:   Math.random() * 0.35 + 0.05,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.a + ')';
      ctx.fill();
    });

    // Draw faint connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,200,83,${0.04 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  spawn();
  draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
}

/* ── Navbar ────────────────────────────────────────────────── */
function initNav() {
  const navbar = $('.navbar');
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveLink();
  });

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
  });

  // Close mobile menu on link click
  $$('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => mobileMenu?.classList.remove('open'));
  });

  // Smooth scroll for nav links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function updateActiveLink() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

/* ── Typewriter Effect ─────────────────────────────────────── */
function initTypewriter() {
  const el = $('.typewriter');
  if (!el) return;
  const phrases = [
    'Data Scientist 🔬',
    'ML Engineer 🤖',
    'Problem Solver 💡',
    'Python Developer 🐍',
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }
  tick();
}

/* ── Scroll Reveal ─────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ── Skills Rendering ──────────────────────────────────────── */
let activeSkillFilters = [];

function renderSkills(filterList = activeSkillFilters) {
  activeSkillFilters = filterList;
  const grid = $('#skills-grid');
  if (!grid) return;

  const allSkills = DataStore.getSkills();
  let skills = allSkills;
  if (activeSkillFilters.length > 0) {
    skills = allSkills.filter(s => s.level && activeSkillFilters.some(f => f.toLowerCase() === s.level.toLowerCase()));
  }

  const existingCards = $$('.skill-card', grid);

  const proceedWithRender = () => {
    if (skills.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;"><p>No skills match the selected filters.</p></div>`;
      return;
    }

    grid.innerHTML = skills.map((s, idx) => `
      <div class="skill-card fade-scale-in" style="animation-delay: ${idx * 40}ms; opacity: 0;">
        <div class="skill-icon">${esc(s.icon || '⚙️')}</div>
        <div class="skill-name">${esc(s.name)}</div>
        <div class="skill-level">${esc(s.level || '')}</div>
      </div>
    `).join('');

    initReveal();
  };

  if (existingCards.length > 0) {
    existingCards.forEach(c => {
      c.classList.remove('reveal', 'visible', 'fade-scale-in');
      c.classList.add('fade-scale-out');
      c.style.animationDelay = '0ms';
    });
    setTimeout(proceedWithRender, 250);
  } else {
    proceedWithRender();
  }
}

function renderSkillsFilters() {
  const container = $('#skills-filters');
  if (!container) return;
  const skills = DataStore.getSkills();
  // Extract all non-empty level values
  const allLevels = [...new Set(skills.map(s => s.level).filter(Boolean))].sort();

  const renderFilterButtons = () => {
    const isAllActive = activeSkillFilters.length === 0;
    container.innerHTML = `
      <button class="filter-btn${isAllActive ? ' active' : ''}" data-filter="all">All</button>
      ${allLevels.map(lvl => {
        const isActive = activeSkillFilters.includes(lvl);
        return `<button class="filter-btn${isActive ? ' active' : ''}" data-filter="${esc(lvl)}">${esc(lvl)}</button>`;
      }).join('')}
    `;
  };

  renderFilterButtons();

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;

    if (filter === 'all') {
      activeSkillFilters = [];
    } else {
      if (activeSkillFilters.includes(filter)) {
        activeSkillFilters = activeSkillFilters.filter(f => f !== filter);
      } else {
        activeSkillFilters.push(filter);
      }
    }

    renderFilterButtons();
    renderSkills(activeSkillFilters);
  });
}

/* ── Projects Rendering ────────────────────────────────────── */
let activeFilters = [];

function renderProjects(filterList = activeFilters) {
  activeFilters = filterList;
  const grid = $('#projects-grid');
  if (!grid) return;

  const allProjects = DataStore.getProjects();
  let projects = allProjects;
  if (activeFilters.length > 0) {
    // Filter projects that match ANY active filters (OR selection)
    projects = allProjects.filter(p => 
      activeFilters.some(fTag => 
        p.tags && p.tags.some(pTag => pTag.toLowerCase() === fTag.toLowerCase())
      )
    );
  }

  const existingCards = $$('.project-card', grid);

  const proceedWithRender = () => {
    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="no-projects">
          <div class="no-projects-icon">📂</div>
          No projects found matching all selected filters.
        </div>`;
      return;
    }

    grid.innerHTML = projects.map((p, idx) => {
      const showDemo   = p.showDemo   !== false && p.demoUrl;
      const showGithub = p.showGithub !== false && p.githubUrl;
      const showVideo  = p.showVideo  === true  && p.videoUrl;

      return `
      <div class="project-card glass-card fade-scale-in" data-id="${esc(p.id)}" style="animation-delay: ${idx * 60}ms; opacity: 0;">
        <div class="project-image-wrap">
          ${p.imageUrl
            ? `<img class="project-image" src="${esc(p.imageUrl)}" alt="${esc(p.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'project-image-placeholder\\'>${esc(p.emoji || '🚀')}</div>'">`
            : `<div class="project-image-placeholder">${esc(p.emoji || '🚀')}</div>`}
          <div class="project-image-overlay">
            ${showDemo    ? `<a href="${esc(p.demoUrl)}"   class="btn btn-primary" target="_blank">🚀 Demo</a>` : ''}
            ${showGithub  ? `<a href="${esc(p.githubUrl)}" class="btn btn-outline" target="_blank">📂 Code</a>` : ''}
            ${showVideo   ? `<button class="btn btn-outline video-play-btn" data-video="${esc(p.videoUrl)}" data-title="${esc(p.title)}">▶ Video</button>` : ''}
          </div>
        </div>
        <div class="project-body">
          ${difficultyHTML(p.difficulty)}
          <div class="project-title">${esc(p.title)}</div>
          <div class="project-desc">${esc(p.description)}</div>
          <div class="project-tags">
            ${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>
          <div class="project-links">
            ${showDemo   ? `<a href="${esc(p.demoUrl)}"   class="project-link" target="_blank">🚀 Live Demo</a>` : ''}
            ${showGithub ? `<a href="${esc(p.githubUrl)}" class="project-link" target="_blank">📂 GitHub</a>`    : ''}
            ${showVideo  ? `<button class="project-link video-play-btn" data-video="${esc(p.videoUrl)}" data-title="${esc(p.title)}">▶ Video</button>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    $$('.video-play-btn', grid).forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openVideoModal(btn.dataset.video, btn.dataset.title);
      });
    });

    initReveal();
  };

  if (existingCards.length > 0) {
    existingCards.forEach(c => {
      c.classList.remove('reveal', 'visible', 'fade-scale-in');
      c.classList.add('fade-scale-out');
      c.style.animationDelay = '0ms';
    });
    setTimeout(proceedWithRender, 250);
  } else {
    proceedWithRender();
  }
}

function renderFilters() {
  const container = $('#project-filters');
  if (!container) return;
  const projects = DataStore.getProjects();
  
  const tagCounts = {};
  projects.forEach(p => {
    (p.tags || []).forEach(t => {
      const clean = t ? t.trim() : '';
      if (clean) {
        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      }
    });
  });
  
  const allTags = Object.keys(tagCounts).sort((a, b) => a.localeCompare(b));

  const renderFilterButtons = () => {
    const isAllActive = activeFilters.length === 0;
    container.innerHTML = `
      <button class="filter-btn${isAllActive ? ' active' : ''}" data-filter="all">All</button>
      ${allTags.map(t => {
        const isActive = activeFilters.includes(t);
        return `<button class="filter-btn${isActive ? ' active' : ''}" data-filter="${esc(t)}">${esc(t)} <span class="filter-count">(${tagCounts[t]})</span></button>`;
      }).join('')}
    `;
  };

  renderFilterButtons();

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;

    if (filter === 'all') {
      activeFilters = [];
    } else {
      if (activeFilters.includes(filter)) {
        activeFilters = activeFilters.filter(f => f !== filter);
      } else {
        activeFilters.push(filter);
      }
    }

    renderFilterButtons();
    renderProjects(activeFilters);
  });
}

/* ── Video Modal ───────────────────────────────────────────── */
function openVideoModal(url, title = 'Video') {
  const embedUrl = driveEmbedUrl(url);
  // Remove any existing modal
  const existing = $('#video-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'video-modal-overlay open';
  modal.id = 'video-modal';
  modal.innerHTML = `
    <div class="video-modal-card">
      <div class="video-modal-header">
        <div class="video-modal-title">▶ ${esc(title)}</div>
        <button class="modal-close" id="close-video-modal" aria-label="Close video">✕</button>
      </div>
      <div class="video-iframe-wrap">
        <iframe src="${esc(embedUrl)}" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  modal.querySelector('#close-video-modal').addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
}

/* ── Courses Rendering ─────────────────────────────────────── */
function renderCourses() {
  const grid = $('#courses-grid');
  if (!grid) return;
  const courses = DataStore.getCourses();

  if (courses.length === 0) {
    grid.innerHTML = `
      <div class="no-courses">
        <div class="no-courses-icon">📚</div>
        No courses yet. <a href="admin.html" style="color:var(--accent-2);">Add one via Admin ↗</a>
      </div>`;
    return;
  }

  grid.innerHTML = courses.map(c => `
    <div class="course-card glass-card reveal" data-id="${esc(c.id)}">
      <div class="course-body">
        <div class="course-icon">${esc(c.icon || '📚')}</div>
        <div class="course-title">${esc(c.title)}</div>
        <div class="course-provider">${esc(c.provider || '')}</div>
        <div class="course-desc">${esc(c.description || '')}</div>
        <div class="course-meta">
          <span class="course-date">${esc(c.date || '')}</span>
          ${c.url ? `<a href="${esc(c.url)}" class="course-link" target="_blank">🔗 View Certificate</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  initReveal();
}

/* ── Section Visibility ────────────────────────────────────── */
function applySectionVisibility() {
  const meta = DataStore.getMeta();
  const sections = meta.sections || {};

  Object.entries(sections).forEach(([key, visible]) => {
    const sectionEl = $('#' + key);
    if (!sectionEl) return;

    if (visible === false) {
      sectionEl.style.display = 'none';
      // Hide desktop nav item (parent li)
      const navLink = $(`.nav-links a[href="#${key}"]`);
      if (navLink && navLink.parentElement) {
        navLink.parentElement.style.display = 'none';
      }
      // Hide mobile nav link
      const mobEl = $(`#mobile-menu a[href="#${key}"]`);
      if (mobEl) mobEl.style.display = 'none';
    } else {
      sectionEl.style.display = '';
      const navLink = $(`.nav-links a[href="#${key}"]`);
      if (navLink && navLink.parentElement) {
        navLink.parentElement.style.display = '';
      }
      const mobEl = $(`#mobile-menu a[href="#${key}"]`);
      if (mobEl) mobEl.style.display = '';
    }
  });
}

/* ── Experience Rendering ──────────────────────────────────── */
function renderExperience() {
  const grid = $('#timeline-list');
  if (!grid) return;
  const experience = DataStore.getExperience();

  if (experience.length === 0) {
    grid.innerHTML = `
      <div class="no-experience" style="text-align:center; padding:40px; color:var(--text-muted);">
        No experience listed yet.
      </div>`;
    return;
  }

  grid.innerHTML = experience.map((e, idx) => `
    <div class="timeline-item reveal reveal-delay-${(idx % 3) + 1}" role="listitem">
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card glass-card">
        <div class="timeline-period">🗓️ ${esc(e.period)}</div>
        <div class="timeline-role">${esc(e.role)}</div>
        <div class="timeline-company">${esc(e.company)}</div>
        <div class="timeline-desc">
          ${esc(e.description || '')}
        </div>
      </div>
    </div>
  `).join('');

  initReveal();
}

/* ── Contact Form ──────────────────────────────────────────── */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const meta    = DataStore.getMeta();
    const name    = $('#contact-name')?.value;
    const message = $('#contact-message')?.value;
    if (meta.email) {
      window.location.href = `mailto:${meta.email}?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
    }
    showToast('Opening your email client… 📨');
    form.reset();
  });
}

/* ── Theme Toggling ────────────────────────────────────────── */
function initTheme() {
  const btn = $('#theme-toggle-btn');
  if (!btn) return;
  const currentTheme = localStorage.getItem('portfolio_theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    btn.textContent = '🌙';
  } else {
    document.body.classList.remove('light-theme');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('portfolio_theme', isLight ? 'light' : 'dark');
    btn.textContent = isLight ? '🌙' : '☀️';
  });
}

/* ── Profile Avatar Rendering ──────────────────────────────── */
function renderAvatar() {
  const meta = DataStore.getMeta();
  const wrap = $('.about-image-wrap');
  if (!wrap) return;

  const container = $('.about-avatar-placeholder', wrap) || $('.about-avatar-img', wrap);
  if (!container) return;

  if (meta.avatarUrl) {
    if (container.tagName !== 'IMG') {
      const img = document.createElement('img');
      img.className = 'about-avatar-img';
      img.alt = 'Profile avatar';
      img.src = meta.avatarUrl;
      img.onerror = () => {
        img.replaceWith(createPlaceholderAvatar());
      };
      container.replaceWith(img);
    } else {
      container.src = meta.avatarUrl;
    }
  } else {
    if (container.tagName === 'IMG') {
      container.replaceWith(createPlaceholderAvatar());
    }
  }
}

function createPlaceholderAvatar() {
  const d = document.createElement('div');
  d.className = 'about-avatar-placeholder';
  d.setAttribute('role', 'img');
  d.setAttribute('aria-label', 'Profile avatar');
  d.textContent = '👨‍💻';
  return d;
}

/* ── Google Analytics Integration ──────────────────────────── */
function initGoogleAnalytics() {
  const meta = DataStore.getMeta();
  const gaId = meta.googleAnalyticsId ? meta.googleAnalyticsId.trim() : '';
  if (!gaId) return;

  if ($('script[src*="googletagmanager.com"]')) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', gaId);
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for remote portfolio data to load
  await DataStore.loadRemoteData();

  // Initialize theme, GA, and avatar representation
  initTheme();
  initGoogleAnalytics();
  renderAvatar();

  applyMeta();
  initCanvas();
  initNav();
  initTypewriter();
  initReveal();
  renderSkills();
  renderSkillsFilters();
  renderExperience();
  renderFilters();
  renderProjects();
  renderCourses();
  initContactForm();
});
