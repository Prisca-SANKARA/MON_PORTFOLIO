/**
 * Surcharges du profil (accueil/hero + à propos + photo + CV), éditables
 * depuis /admin sans redéploiement. Vide par défaut : tant que rien n'a été
 * enregistré dans Firestore, le site affiche le texte/la photo/le CV en dur
 * dans index.html — jamais d'écran vide ni de contenu manquant.
 */
const profileData = { fr: {}, en: {}, photo: '', cv: '' };

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
}
