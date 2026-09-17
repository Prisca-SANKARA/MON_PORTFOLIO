/**
 * Surcharges du profil (accueil/hero + à propos + sections + contact + pied
 * de page + photo + CV), éditables depuis /admin sans redéploiement. Vide
 * par défaut : tant que rien n'a été enregistré dans Firestore, le site
 * affiche le texte/la photo/le CV en dur dans index.html — jamais d'écran
 * vide ni de contenu manquant.
 */
const profileData = {
  fr: {}, en: {},
  photo: '', cv: '',
  navName: '', displayName: '',
  typed: { fr: [], en: [] },
  contact: {} // { email, phone, locationFr, locationEn, linkedinUrl, linkedinHandle, githubUrl, githubHandle }
};

function applyProfileOverrides(lang = 'fr') {
  const overrides = profileData[lang] || {};
  Object.keys(overrides).forEach(key => {
    const val = overrides[key];
    if (!val) return;
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => { el.innerHTML = val; });
  });

  if (profileData.photo) {
    document.querySelectorAll('.hero-photo, .cercle-portrait img').forEach(img => { img.src = profileData.photo; });
  }
  if (profileData.cv) {
    // "download" est ignoré par les navigateurs sur une URL cross-origin (Cloudinary) :
    // on ajoute target="_blank" pour qu'au pire le CV s'ouvre dans un nouvel onglet
    // plutôt que de faire quitter le portfolio.
    document.querySelectorAll('a[href*="CV_SANKARA"]').forEach(a => { a.href = profileData.cv; a.target = '_blank'; a.rel = 'noopener'; });
  }
  if (profileData.navName) {
    const el = document.getElementById('navName');
    if (el) el.innerHTML = profileData.navName;
  }
  if (profileData.displayName) {
    const el = document.getElementById('heroName');
    if (el) el.textContent = profileData.displayName;
  }

  applyContactOverrides();

  // Toujours l'année en cours dans le copyright, quel que soit le texte
  // enregistré (statique ou Firestore) — jamais à corriger à la main.
  document.querySelectorAll('[data-i18n="footer-copy"]').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
  });
}

function applyContactOverrides() {
  const c = profileData.contact || {};

  if (c.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href = 'mailto:' + c.email; });
    const p = document.getElementById('contactEmailText');
    if (p) p.textContent = c.email;
  }
  if (c.phone) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href = 'tel:' + c.phone.replace(/[^+\d]/g, ''); });
    const p = document.getElementById('contactPhoneText');
    if (p) p.textContent = c.phone;
  }
  const lang = document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'fr';
  const location = lang === 'en' ? c.locationEn : c.locationFr;
  if (location) {
    const p = document.getElementById('contactLocationText');
    if (p) p.textContent = location;
  }
  if (c.linkedinUrl) {
    document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => { a.href = c.linkedinUrl; });
  }
  if (c.linkedinHandle) {
    const p = document.getElementById('contactLinkedinHandle');
    if (p) p.textContent = c.linkedinHandle;
  }
  if (c.githubUrl) {
    document.querySelectorAll('a[href*="github.com"]').forEach(a => { a.href = c.githubUrl; });
  }
  if (c.githubHandle) {
    const p = document.getElementById('contactGithubHandle');
    if (p) p.textContent = c.githubHandle;
  }
}
