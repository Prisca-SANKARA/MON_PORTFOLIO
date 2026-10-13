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

// Remplace profileData par un profil complet (venu de Firestore ou du cache
// local). fr/en sont VIDÉS avant : un champ effacé dans l'admin ne doit pas
// survivre via une ancienne valeur en mémoire.
function applyProfileData(profile) {
  ['fr', 'en'].forEach(lang => {
    Object.keys(profileData[lang]).forEach(k => delete profileData[lang][k]);
    Object.assign(profileData[lang], profile[lang] || {});
  });
  profileData.photo = profile.photo || '';
  profileData.cv = profile.cv || '';
  profileData.navName = profile.navName || '';
  profileData.displayName = profile.displayName || '';
  profileData.typed = { fr: [], en: [], ...(profile.typed || {}) };
  profileData.contact = { ...(profile.contact || {}) };
}

// Champ EN vide dans l'admin mais texte FR identique au texte par défaut du
// site → on reprend la traduction écrite à la main dans js/i18n.js plutôt que
// de la faire refaire (moins bien) par la traduction automatique.
function fillProfileEnglishDefaults() {
  if (typeof translations === 'undefined') return;
  const same = (a, b) => (a || '').replace(/\s+/g, ' ').trim() === (b || '').replace(/\s+/g, ' ').trim(); // ignore les espaces en trop
  Object.keys(profileData.fr).forEach(key => {
    if (!profileData.en[key] && same(profileData.fr[key], translations.fr?.[key]) && translations.en?.[key]) {
      profileData.en[key] = translations.en[key];
    }
  });
}

// Les textes du profil (data-i18n) sont appliqués par applyTranslations (i18n.js).
// Ici : photo, CV, nom, contact, année du copyright.
function applyProfileOverrides(lang = 'fr') {
  if (profileData.photo) {
    document.querySelectorAll('.hero-photo, .cercle-portrait img').forEach(img => {
      if (img.getAttribute('src') === profileData.photo) return;
      img.removeAttribute('srcset'); // sinon le navigateur garderait la photo par défaut
      img.src = profileData.photo;
    });
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
    const updated = el.innerHTML.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
    if (updated !== el.innerHTML) el.innerHTML = updated;
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
