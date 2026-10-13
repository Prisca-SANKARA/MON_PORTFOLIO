const translations = {
  fr: {
    "nav-title": "Ingénieure Informatique",
    "nav-sub": "DevSecOps · Cloud · Cybersécurité",
    "nav-home": "Accueil", "nav-about": "À propos", "nav-skills": "Compétences",
    "nav-portfolio": "Portfolio", "nav-experience": "Parcours",
    "nav-articles": "Articles", "nav-contact": "Contact",
    "download-cv": "Télécharger CV",
    "hero-tag": "👋 Bienvenue sur mon portfolio",
    "hero-line1": "Ingénieure informatique <br> DevSecOps <br> &",
    "hero-line2": "Full-Stack",
    "hero-iam": "Je suis",
    "hero-desc": "Ingénieure informatique diplômée, passionnée par le DevSecOps, la cybersécurité et le cloud.",
    "hero-btn1": "Voir mes projets", "hero-btn2": "Me contacter", "hero-btn3": "Télécharger CV",
    "about-tag": "Qui suis-je ?", "about-title": "Mon profil",
    "about-sub": "Ingénieure DevSecOps & Full-Stack",
    "about-p1": "Ingénieure informatique diplômée (Bac+5), avec une expérience pratique en développement logiciel et une orientation DevSecOps, cybersécurité et cloud AWS. J'ai récemment effectué mon stage de fin d'études chez Arcashield Cybersecurity à Casablanca, où j'ai conçu une plateforme SaaS de veille et de scoring de vulnérabilités CVE.",
    "about-p2": "Avant cela, deux stages terrain au Burkina Faso m'ont formée aux réalités du numérique en Afrique : chez Box Africa, j'ai mené un audit interne de l'entreprise et contribué à des solutions digitales concrètes ; chez Switch Maker, j'ai développé un agenda collaboratif temps réel (Angular, Spring Boot). Ces expériences ont forgé une approche pragmatique, orientée impact.",
    "about-p3": "Aujourd'hui, je recherche un poste où allier sécurité et développement (DevSecOps), sécurité applicative ou développement full-stack pour continuer à grandir techniquement au sein d'une équipe exigeante et engagée sur des problématiques concrètes.",
    "hero-badge1": "DevSecOps", "hero-badge2": "Cloud AWS",
    "location-badge1": "Casablanca, Maroc", "location-badge2": "",
    "available": "Disponible maintenant",
    "stat1": "Stages", "stat2": "Projets", "stat3": "Entreprises", "stat4": "Technologies",
    "learning": "(en apprentissage)",
    "skills-tag": "Expertise", "skills-title": "Mes compétences",
    "skills-sub": "Survolez une technologie pour en savoir plus",
    "portfolio-tag": "Réalisations", "portfolio-title": "Mes Projets",
    "filter-all": "Tous",
    "exp-tag": "Parcours", "exp-title": "Mon expérience",
    "articles-tag": "Blog & Réflexions", "articles-title": "Mes Articles",
    "articles-sub": "Partage de connaissances, retours d'expérience et vision tech africaine",
    "articles-more": "Voir tous mes articles sur LinkedIn",
    "contact-tag": "Contact", "contact-title": "Travaillons ensemble",
    "phone": "Téléphone", "location": "Localisation",
    "form-name": "Nom complet", "form-subject": "Sujet", "form-send": "Envoyer le message",
    "footer-desc": "Ingénieure Informatique — DevSecOps · Cloud · Cybersécurité",
    "footer-copy": "© 2026 SANKARA P. DJAMILATOU PRISCA. Tous droits réservés.",
    "footer-nav": "Navigation", "footer-links": "CV & Liens"
  },
  en: {
    "nav-title": "Computer Engineer",
    "nav-sub": "DevSecOps · Cloud · Cybersecurity",
    "nav-home": "Home", "nav-about": "About", "nav-skills": "Skills",
    "nav-portfolio": "Portfolio", "nav-experience": "Experience",
    "nav-articles": "Articles", "nav-contact": "Contact",
    "download-cv": "Download CV",
    "hero-tag": "👋 Welcome to my portfolio",
    "hero-line1": "IT Engineer <br> DevSecOps <br> &",
    "hero-line2": "Full-Stack",
    "hero-iam": "I am",
    "hero-desc": "Graduate IT engineer, passionate about DevSecOps, cybersecurity and the cloud.",
    "hero-btn1": "See my projects", "hero-btn2": "Contact me", "hero-btn3": "Download CV",
    "about-tag": "Who am I?", "about-title": "My profile",
    "about-sub": "DevSecOps & Full-Stack Engineer",
    "about-p1": "Graduate IT Engineer (Bac+5), with hands-on experience in software development and a DevSecOps, cybersecurity and AWS cloud orientation. I recently completed my graduate internship at Arcashield Cybersecurity in Casablanca, where I designed a SaaS platform for monitoring and scoring CVE vulnerabilities.",
    "about-p2": "Before that, two field internships in Burkina Faso trained me in the realities of digital in Africa: at Box Africa, I conducted an internal audit of the company and contributed to concrete digital solutions; at Switch Maker, I developed a collaborative real-time agenda (Angular, Spring Boot). These experiences have forged a pragmatic, impact-oriented approach.",
    "about-p3": "Today, I am looking for a position where I can combine security and development (DevSecOps), application security or full-stack development to continue to grow technically within a demanding and committed team on concrete issues.",
    "hero-badge1": "DevSecOps", "hero-badge2": "Cloud AWS",
    "location-badge1": "Casablanca, Morocco", "location-badge2": "",
    "available": "Available now",
    "stat1": "Internships", "stat2": "Projects", "stat3": "Companies", "stat4": "Technologies",
    "learning": "(learning)",
    "skills-tag": "Expertise", "skills-title": "My skills",
    "skills-sub": "Hover over a technology to learn more",
    "portfolio-tag": "Work", "portfolio-title": "My Projects",
    "filter-all": "All",
    "exp-tag": "Journey", "exp-title": "My experience",
    "articles-tag": "Blog & Thoughts", "articles-title": "My Articles",
    "articles-sub": "Knowledge sharing, experience feedback and African tech vision",
    "articles-more": "See all my articles on LinkedIn",
    "contact-tag": "Contact", "contact-title": "Let's work together",
    "phone": "Phone", "location": "Location",
    "form-name": "Full name", "form-subject": "Subject", "form-send": "Send message",
    "footer-desc": "Computer Engineer — DevSecOps · Cloud · Cybersecurity",
    "footer-copy": "© 2026 SANKARA P. DJAMILATOU PRISCA. All rights reserved.",
    "footer-nav": "Navigation", "footer-links": "Resume & Links"
  }
};

let currentLang = localStorage.getItem('lang') || 'fr';

// Remplace le contenu d'un élément SEULEMENT s'il change : réécrire un texte
// identique force le navigateur à tout recalculer et redessiner (coûteux sur
// mobile, et Google compte ce nouveau dessin comme un affichage tardif).
const lastHTML = new WeakMap();
function setHTML(el, html) {
  if (!el || lastHTML.get(el) === html) return;
  el.innerHTML = html;
  lastHTML.set(el, html);
}
// Même principe pour les listes (projets, parcours, articles, compétences)
const renderHTML = setHTML;

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);

  // Texte final de chaque élément : celui de l'admin (profil Firestore) s'il
  // existe, sinon le texte par défaut ci-dessus — écrit une seule fois.
  // (Un texte d'admin fait uniquement d'espaces = élément vidé, donc masqué.)
  const overrides = (typeof profileData !== 'undefined' && profileData[lang]) || {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const fromAdmin = overrides[key];
    if (fromAdmin) setHTML(el, fromAdmin.trim());
    else if (translations[lang] && translations[lang][key]) setHTML(el, translations[lang][key]);
  });

  initTyped(lang);

  // Re-render dynamic content
  if (typeof renderProjects === 'function') renderProjects(lang);
  if (typeof renderExperiences === 'function') renderExperiences(lang);
  if (typeof renderArticles === 'function') renderArticles(lang);
  if (typeof renderSkills === 'function') renderSkills(lang);
  if (typeof applyProfileOverrides === 'function') applyProfileOverrides(lang);

  // Le bouton affiche la langue vers laquelle on basculera au prochain clic
  const toggleLabel = document.getElementById('langToggleLabel');
  if (toggleLabel) toggleLabel.textContent = lang === 'fr' ? 'EN' : 'FR';

  // Libellés gérés par app.js (bouton thème, bouton menu)
  if (typeof updateThemeUI === 'function') updateThemeUI(document.documentElement.getAttribute('data-theme'));
  if (typeof updateMenuLabel === 'function') updateMenuLabel();

  // Prévient js/firebase-data.js (traduction automatique lancée seulement en anglais)
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

function initTyped(lang) {
  const fromProfile = typeof profileData !== 'undefined' && profileData.typed && profileData.typed[lang];
  const strings = (fromProfile && fromProfile.length) ? fromProfile : (lang === 'fr'
    ? ['Ingénieure Full-Stack', 'avec une orientation DevSecOps', 'cybersécurité', 'cloud']
    : ['Full-Stack Engineer', 'with a DevSecOps focus', 'cybersecurity', 'cloud']);

  // Textes inchangés → on laisse l'animation en cours (sinon elle redémarre à chaque rafraîchissement)
  const key = JSON.stringify(strings);
  if (window.typedInstance && window.typedKey === key) return;
  if (window.typedInstance) window.typedInstance.destroy();
  window.typedKey = key;

  // CDN Typed.js indisponible : on affiche simplement le premier texte
  if (typeof Typed !== 'function') {
    window.typedInstance = null;
    const el = document.getElementById('typed');
    if (el) el.textContent = strings[0];
    return;
  }

  window.typedInstance = new Typed('#typed', {
    strings,
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('langToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyTranslations(currentLang === 'fr' ? 'en' : 'fr');
    });
  }
  // Laisse d'abord le navigateur dessiner la page (le haut est déjà dans le HTML),
  // PUIS construit les listes (projets, compétences, parcours…). Sans ça, tout
  // était calculé avant le premier affichage : écran blanc plus long sur mobile.
  let started = false;
  const start = () => { if (!started) { started = true; applyTranslations(currentLang); } };
  requestAnimationFrame(() => setTimeout(start, 0));
  setTimeout(start, 250); // filet : onglet ouvert en arrière-plan (pas d'image dessinée)
});
