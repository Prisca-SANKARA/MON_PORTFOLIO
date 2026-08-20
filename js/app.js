// ── LOADER ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').style.display = 'none', 600);
    handleScrollAnimation();
  }, 1400);
});

// ── PROGRESS BAR ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const s = document.body.scrollTop || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.getElementById('progressBar').style.width = (s/h*100) + '%';
});

// ── CURSOR ───────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a,button,.project-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ── MOBILE MENU ──────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const menuIcon = document.getElementById('menuIcon');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  menuIcon.classList.toggle('active');
  const open = nav.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
document.querySelectorAll('.nav-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
      menuIcon.classList.remove('active');
      nav.classList.remove('active');
    }
  });
});

// ── ACTIVE NAV ───────────────────────────────────────────────
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-menu-item');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) link.classList.add('active');
  });
});

// ── THEME TOGGLE ─────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggle.addEventListener('click', () => {
  const t = document.documentElement.getAttribute('data-theme');
  const next = t === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeUI(next);
});

function updateThemeUI(theme) {
  const icon = themeToggle.querySelector('i');
  const lang = currentLang || 'fr';
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
    themeLabel.textContent = lang === 'fr' ? 'Mode clair' : 'Light mode';
  } else {
    icon.className = 'fas fa-moon';
    themeLabel.textContent = lang === 'fr' ? 'Mode sombre' : 'Dark mode';
  }
}

// ── PARTICLES ────────────────────────────────────────────────
if (window.innerWidth > 768) {
  particlesJS('particles-js', {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 800 } },
      color: { value: '#e63946' },
      shape: { type: 'circle' },
      opacity: { value: 0.4, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#e63946', opacity: 0.2, width: 1 },
      move: { enable: true, speed: 1.5, random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
      modes: { grab: { distance: 140, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}

// ── TYPED — initialized by i18n.js ──────────────────────────

// ── STATS COUNTER ────────────────────────────────────────────
// ── STATS DYNAMIQUES depuis projectsData ─────────────────────
// ── STATS DYNAMIQUES + COUNTER ───────────────────────────────
function updateDynamicStats() {
  if (typeof projectsData === 'undefined') return;
  const lang = currentLang || 'fr';
  const projects = projectsData[lang] || projectsData['fr'] || [];
  const totalProjects = projects.length;

  

  document.querySelectorAll('.stat-card').forEach(card => {
    const i18nKey = card.querySelector('[data-i18n]')?.getAttribute('data-i18n');
    const numEl = card.querySelector('.stat-number');
    if (!numEl) return;
    if (i18nKey === 'stat2') numEl.setAttribute('data-target', totalProjects);
  });
}

function animateCounter(el) {
  const target = +el.getAttribute('data-target');
  const step = Math.max(1, Math.ceil(target / 60));
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 25);
}

// ── SKILLS ANIMATION ─────────────────────────────────────────
function animateSkills() {
  document.querySelectorAll('.skill-progress-fill').forEach(bar => {
    bar.style.width = bar.getAttribute('data-width') + '%';
  });
}

// ── REVEAL ON SCROLL ─────────────────────────────────────────
let statsAnimated = false;
let skillsAnimated = false;

function elementInView(el, offset = 100) {
  return el.getBoundingClientRect().top <= window.innerHeight - offset;
}

function handleScrollAnimation() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (elementInView(el)) el.classList.add('active');
  });
  const about = document.querySelector('.about');
  if (!statsAnimated && about && elementInView(about, 200)) {
updateDynamicStats();
document.querySelectorAll('.stat-number').forEach(animateCounter);
    statsAnimated = true;
  }
  const skills = document.querySelector('.skills');
  if (!skillsAnimated && skills && elementInView(skills, 200)) {
    animateSkills();
    skillsAnimated = true;
  }
}
window.addEventListener('scroll', handleScrollAnimation);

// ── CONTACT FORM ─────────────────────────────────────────────
// 1. Crée un compte gratuit sur https://formspree.io (avec ton email).
// 2. Crée un nouveau formulaire → copie l'ID (ex: "xdorwkey").
// 3. Remplace "YOUR_FORM_ID" ci-dessous par cet ID.
// Tant que ce n'est pas fait, le formulaire ouvre ton logiciel mail (aucun message perdu).
const FORMSPREE_ID = 'YOUR_FORM_ID';
const CONTACT_EMAIL = 'djamilatoupriscasankara@gmail.com';

document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('.submit-btn');
  const status = document.getElementById('formStatus');
  const lang = currentLang || 'fr';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  const resetBtn = () => {
    btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${lang === 'fr' ? 'Envoyer le message' : 'Send message'}`;
    btn.disabled = false;
  };
  const showStatus = (text, ok) => {
    status.textContent = text;
    status.className = 'form-status ' + (ok ? 'success' : 'error');
    status.style.display = 'block';
    setTimeout(() => { status.style.display = 'none'; }, 6000);
  };

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;

  // Fallback: aucun ID Formspree configuré → on ouvre le logiciel mail
  if (FORMSPREE_ID === 'YOUR_FORM_ID') {
    const body = `${lang === 'fr' ? 'Nom' : 'Name'}: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;
    showStatus(lang === 'fr'
      ? '✉️ Votre logiciel mail s\'ouvre pour finaliser l\'envoi.'
      : '✉️ Your email app is opening to complete sending.', true);
    resetBtn();
    return;
  }

  // Envoi réel via Formspree
  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, _subject: subject, message })
    });
    if (res.ok) {
      showStatus(lang === 'fr'
        ? '✓ Message envoyé ! Je vous répondrai rapidement.'
        : '✓ Message sent! I will reply shortly.', true);
      e.target.reset();
    } else {
      throw new Error('send failed');
    }
  } catch (err) {
    showStatus(lang === 'fr'
      ? '✗ Erreur d\'envoi. Écrivez-moi à ' + CONTACT_EMAIL
      : '✗ Sending error. Please email me at ' + CONTACT_EMAIL, false);
  }
  resetBtn();
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── SCROLL INDICATOR ─────────────────────────────────────────
const scrollInd = document.querySelector('.scroll-indicator');
if (scrollInd) scrollInd.addEventListener('click', () => {
  document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
});

// ── TECH HOVER CARD ──────────────────────────────────────────
const techCard = document.getElementById('techCard');
const techCardName = document.getElementById('techCardName');
const techCardInfo = document.getElementById('techCardInfo');
const techCardLevel = document.getElementById('techCardLevel');
const techCardIcon = document.getElementById('techCardIcon');

// Délégation (pas de binding direct) : les .tech-item sont regénérés
// dynamiquement par renderSkills() à chaque changement de langue / chargement
// Firestore, donc on écoute sur le conteneur stable plutôt que sur chaque item.
const skillsSection = document.getElementById('skills');
let hoveredTechItem = null;
if (skillsSection) {
  skillsSection.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.tech-item');
    if (!item || item === hoveredTechItem) return;
    hoveredTechItem = item;

    const name = item.querySelector('span').textContent;
    const info = item.getAttribute('data-info') || '';
    const levelLabel = item.getAttribute('data-level-label') || '';
    const levelKey = item.getAttribute('data-level-key') || '';
    const icon = item.getAttribute('data-icon') || 'fas fa-code';

    techCardName.textContent = name;
    techCardInfo.textContent = info;
    techCardLevel.textContent = levelLabel;
    techCardIcon.className = icon;

    const color = (typeof LEVEL_COLORS !== 'undefined' && LEVEL_COLORS[levelKey]) || '#e63946';
    techCardLevel.style.background = color + '22';
    techCardLevel.style.color = color;
    techCard.classList.add('visible');
    moveCard(e);
  });

  skillsSection.addEventListener('mousemove', (e) => {
    if (e.target.closest('.tech-item')) moveCard(e);
  });

  skillsSection.addEventListener('mouseout', (e) => {
    const item = e.target.closest('.tech-item');
    if (!item) return;
    if (e.relatedTarget && item.contains(e.relatedTarget)) return;
    hoveredTechItem = null;
    techCard.classList.remove('visible');
  });
}

function moveCard(e) {
  const x = e.clientX + 16;
  const y = e.clientY - 20;
  const cardW = techCard.offsetWidth;
  const cardH = techCard.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  techCard.style.left = (x + cardW > vw ? x - cardW - 32 : x) + 'px';
  techCard.style.top  = (y + cardH > vh ? y - cardH : y) + 'px';
}
