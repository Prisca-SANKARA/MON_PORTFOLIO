/**
 * AFFICHAGE IMMÉDIAT DE LA DERNIÈRE VERSION CONNUE
 * =================================================
 * Le site affiche d'abord les données écrites dans le code (js/data/*.js),
 * puis Firestore les remplace dès qu'il répond. Pour qu'un visiteur qui est
 * déjà venu ne voie pas l'ancienne version défiler une seconde, on réapplique
 * ici — avant le premier rendu — la dernière réponse Firestore gardée dans
 * le navigateur par js/firebase-data.js (même clé de cache).
 *
 * À charger APRÈS les js/data/*.js et i18n.js présents sur la page, et AVANT
 * app.js / le script de rendu de la page (le premier rendu se fait au
 * DOMContentLoaded, donc après ce script).
 */
(function () {
  let cache = null;
  let translations = {};
  try {
    cache = JSON.parse(localStorage.getItem('portfolioCache:v1') || 'null');
    // Traductions FR → EN déjà obtenues lors d'une visite précédente
    // (même cache que js/data/auto-translate.js)
    translations = JSON.parse(localStorage.getItem('autoTranslateCache') || '{}');
  } catch { return; }
  if (!cache) return;

  // Complète les champs EN manquants avec les traductions déjà connues,
  // pour que la version anglaise ne passe pas non plus par l'ancien texte.
  function fillEnglish(frItems, enItems, fields, arrayFields = []) {
    enItems.forEach((en, i) => {
      const fr = frItems[i];
      if (!fr || !en) return;
      fields.forEach(f => {
        if (!en[f] && fr[f] && translations[fr[f]] && !/MYMEMORY WARNING/i.test(translations[fr[f]])) en[f] = translations[fr[f]];
      });
      arrayFields.forEach(f => {
        const frArr = fr[f] || [], enArr = en[f] || [];
        if (!enArr.length && frArr.length && frArr.every(t => translations[t])) {
          en[f] = frArr.map(t => translations[t]);
        }
      });
    });
  }

  if (cache.projects && typeof projectsData !== 'undefined') {
    fillEnglish(cache.projects.fr, cache.projects.en, ['title', 'subtitle', 'description']);
    Object.assign(projectsData, cache.projects);
  }
  if (cache.articles && typeof articlesData !== 'undefined') {
    fillEnglish(cache.articles.fr, cache.articles.en, ['title', 'excerpt', 'category', 'date']);
    Object.assign(articlesData, cache.articles);
  }
  if (cache.experiences && typeof experiencesData !== 'undefined') {
    fillEnglish(cache.experiences.fr, cache.experiences.en, ['title', 'description', 'location', 'period', 'duration'], ['highlights']);
    Object.assign(experiencesData, cache.experiences);
  }
  if (cache.skills && typeof skillsData !== 'undefined') {
    fillEnglish(cache.skills.fr, cache.skills.en, ['category', 'info']);
    Object.assign(skillsData, cache.skills);
  }
  if (cache.profile && typeof profileData !== 'undefined' && typeof applyProfileData === 'function') {
    applyProfileData(cache.profile);
    if (typeof fillProfileEnglishDefaults === 'function') fillProfileEnglishDefaults();
    fillEnglish([profileData.fr], [profileData.en], Object.keys(profileData.fr));
  }
})();
