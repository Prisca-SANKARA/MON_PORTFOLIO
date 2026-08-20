const translations = {
  fr: {
    "nav-title": "Ingénieure Informatique",
    "nav-sub": "DevSecOps · Cloud · Cybersécurité",
    "nav-home": "Accueil", "nav-about": "À propos", "nav-skills": "Compétences",
    "nav-portfolio": "Portfolio", "nav-experience": "Parcours",
    "nav-articles": "Articles", "nav-contact": "Contact",
    "download-cv": "Télécharger CV",
    "hero-tag": "👋 Bienvenue sur mon portfolio",
    "hero-line1": "Ingénieure informatique <br> DevSecOps",
    "hero-line2": "& Cloud · Africa Tech 🇧🇫",
    "hero-iam": "Je suis",
    "hero-desc": "Ingénieure informatique passionnée par le DevSecOps, la cybersécurité et le cloud.",
    "hero-btn1": "Voir mes projets", "hero-btn2": "Me contacter", "hero-btn3": "Télécharger CV",
    "about-tag": "Qui suis-je ?", "about-title": "Passionnée par l'innovation tech",
    "about-sub": "De la passion à l'expertise",
    "about-p1": "Ingénieure informatique en dernière année (Bac+5), passionnée par le <strong>DevSecOps</strong>, la <strong>cybersécurité</strong> et le <strong>cloud AWS</strong>. Actuellement en stage PFE chez <span class='highlight'>Arcashield Cybersecurity</span> à Casablanca.",
    "about-p2": "Deux stages terrain au Burkina Faso — <span class='highlight'>Box Africa</span> et Switch Maker — m'ont donné une vision concrète de la transformation digitale en Afrique.",
    "about-p3": "Mon objectif : devenir ingénieure DevSecOps de référence et contribuer au rayonnement technologique de l'Afrique.",
    "available": "Disponible Sept. 2026",
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
    "footer-copy": "© 2026 SANKARA P. DJAMILATOU PRISCA. Tous droits réservés."
  },
  en: {
    "nav-title": "Computer Engineer",
    "nav-sub": "DevSecOps · Cloud · Cybersecurity",
    "nav-home": "Home", "nav-about": "About", "nav-skills": "Skills",
    "nav-portfolio": "Portfolio", "nav-experience": "Experience",
    "nav-articles": "Articles", "nav-contact": "Contact",
    "download-cv": "Download CV",
    "hero-tag": "👋 Welcome to my portfolio",
    "hero-line1": "Computer Engineer <br> DevSecOps",
    "hero-line2": "& Cloud · Africa Tech 🇧🇫",
    "hero-iam": "I am",
    "hero-desc": "Final-year Computer Engineering student (Bac+5) passionate about DevSecOps, cybersecurity and cloud. Currently doing my internship at Arcashield Cybersecurity in Casablanca. 🚀",
    "hero-btn1": "See my projects", "hero-btn2": "Contact me", "hero-btn3": "Download CV",
    "about-tag": "Who am I?", "about-title": "Passionate about tech innovation",
    "about-sub": "From passion to expertise",
    "about-p1": "Final-year Computer Engineering student (Bac+5), passionate about <strong>DevSecOps</strong>, <strong>cybersecurity</strong> and <strong>AWS cloud</strong>. Currently interning at <span class='highlight'>Arcashield Cybersecurity</span> in Casablanca.",
    "about-p2": "Two internships in Burkina Faso — <span class='highlight'>Box Africa</span> and Switch Maker — gave me a concrete vision of digital transformation in Africa.",
    "about-p3": "My goal: become a reference DevSecOps engineer and contribute to Africa's technological influence. <strong>Always learning. Always building. 🇧🇫🚀</strong>",
    "available": "Available Sept. 2026",
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
    "footer-copy": "© 2026 SANKARA P. DJAMILATOU PRISCA. All rights reserved."
  }
};

let currentLang = localStorage.getItem('lang') || 'fr';

function applyTranslations(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update typed strings
  if (window.typedInstance) {
    window.typedInstance.destroy();
    initTyped(lang);
  }

  // Re-render dynamic content
  if (typeof renderProjects === 'function') renderProjects(lang);
  if (typeof renderExperiences === 'function') renderExperiences(lang);
  if (typeof renderArticles === 'function') renderArticles(lang);
  if (typeof renderSkills === 'function') renderSkills(lang);

  // Le bouton affiche la langue vers laquelle on basculera au prochain clic
  const toggleLabel = document.getElementById('langToggleLabel');
  if (toggleLabel) toggleLabel.textContent = lang === 'fr' ? 'EN' : 'FR';
}

function initTyped(lang) {
  const strings = lang === 'fr'
    ? ['Ingénieure Full-Stack', 'DevSecOps Enthusiast', 'Cloud & Cybersécurité', 'Africa Tech Vision 🇧🇫']
    : ['Full-Stack Engineer', 'DevSecOps Enthusiast', 'Cloud & Cybersecurity', 'Africa Tech Vision 🇧🇫'];

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
  applyTranslations(currentLang);
});
