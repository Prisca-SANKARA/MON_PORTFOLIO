/**
 * CHARGEMENT DYNAMIQUE DES DONNÉES DEPUIS FIRESTORE
 * ===================================================
 * Au chargement de la page, le site affiche d'abord les données statiques
 * (js/data/projects.js, experiences.js, articles.js) — donc jamais d'écran
 * vide même si Firestore est lent ou hors ligne.
 * Dès que Firestore répond, si des documents existent, ils REMPLACENT les
 * données statiques et la page se met à jour sans redémarrage.
 *
 * Ajouter/modifier/supprimer un projet, un article ou une expérience se
 * fait depuis /admin — jamais en touchant ce fichier ou les fichiers JS
 * de données statiques.
 *
 * Important : projectsData/articlesData/experiencesData sont déclarés en
 * `const` dans js/data/*.js (scripts classiques). On ne peut donc pas les
 * réassigner (`projectsData = ...` échouerait, et `window.projectsData = ...`
 * créerait une variable globale différente que les fonctions de rendu ne
 * liraient jamais). On MUTE l'objet existant en place avec Object.assign.
 */
import { firebaseConfig } from './firebase-config.js';
import { autoTranslateItems } from './data/auto-translate.js';

// ── Lecture Firestore par l'API REST (sans le SDK Firebase) ──────────────
// Le site public ne fait que LIRE des données publiques : une simple requête
// HTTP suffit. Le SDK Firebase (plusieurs centaines de Ko, ~1 s de calcul sur
// mobile) n'est plus chargé ici — seul /admin l'utilise, car il faut s'y connecter.
// Les règles Firestore s'appliquent pareil (lecture publique, écriture refusée).
const FIRESTORE_REST = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

// Convertit une valeur au format REST ({stringValue: "…"}, {arrayValue: …}…) en valeur JS
function fromFirestoreValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in v) return fromFirestoreFields(v.mapValue.fields);
  return null;
}
function fromFirestoreFields(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromFirestoreValue(v);
  return out;
}

// Tous les documents d'une collection, triés par le champ "order"
async function fetchCollection(name) {
  const docs = [];
  let pageToken = '';
  do {
    const res = await fetch(`${FIRESTORE_REST}/${name}?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`);
    if (!res.ok) throw new Error(`Firestore "${name}" : HTTP ${res.status}`);
    const json = await res.json();
    (json.documents || []).forEach(d => docs.push({ id: d.name.split('/').pop(), data: fromFirestoreFields(d.fields) }));
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

// Un document précis (null s'il n'existe pas)
async function fetchDocument(path) {
  const res = await fetch(`${FIRESTORE_REST}/${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore "${path}" : HTTP ${res.status}`);
  return fromFirestoreFields((await res.json()).fields);
}

function splitLang(doc, fields) {
  // Reconstruit un objet {fr:{...}, en:{...}} à partir d'un doc à champs suffixés _fr / _en
  const base = { ...doc };
  const fr = { ...base };
  const en = { ...base };
  fields.forEach(f => {
    fr[f] = doc[`${f}_fr`] ?? doc[f] ?? '';
    en[f] = doc[`${f}_en`] ?? doc[f] ?? '';
    delete fr[`${f}_en`]; delete en[`${f}_en`];
    delete fr[`${f}_fr`]; delete en[`${f}_fr`];
  });
  return { fr, en };
}

async function loadProjects() {
  const docs = await fetchCollection('projects');
  if (!docs.length) return null;
  const fr = [], en = [];
  docs.forEach(({ id, data }) => {
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'subtitle', 'description']);
    fr.push({ ...frItem, id });
    en.push({ ...enItem, id });
  });
  return { fr, en };
}

async function loadArticles() {
  const docs = await fetchCollection('articles');
  if (!docs.length) return null;
  const fr = [], en = [];
  docs.forEach(({ id, data }) => {
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'excerpt', 'category', 'date']);
    fr.push({ ...frItem, id });
    en.push({ ...enItem, id });
  });
  return { fr, en };
}

async function loadExperiences() {
  const docs = await fetchCollection('experiences');
  if (!docs.length) return null;
  const fr = [], en = [];
  docs.forEach(({ data }) => {
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'description', 'location', 'period', 'duration']);
    frItem.highlights = data.highlights_fr || data.highlights || [];
    enItem.highlights = data.highlights_en || data.highlights || [];
    fr.push(frItem);
    en.push(enItem);
  });
  return { fr, en };
}

async function loadSkills() {
  const docs = await fetchCollection('skills');
  if (!docs.length) return null;
  const fr = [], en = [];
  docs.forEach(({ id, data }) => {
    const { fr: frItem, en: enItem } = splitLang(data, ['category', 'info']);
    fr.push({ ...frItem, id });
    en.push({ ...enItem, id });
  });
  return { fr, en };
}

// Champs du document settings/profile → clés data-i18n correspondantes sur la page
const PROFILE_FIELD_TO_I18N_KEY = {
  hero_tag: 'hero-tag', hero_line1: 'hero-line1', hero_line2: 'hero-line2', hero_desc: 'hero-desc',
  hero_badge1: 'hero-badge1', hero_badge2: 'hero-badge2',
  nav_title: 'nav-title', nav_sub: 'nav-sub',
  about_tag: 'about-tag', about_title: 'about-title', about_sub: 'about-sub',
  about_p1: 'about-p1', about_p2: 'about-p2', about_p3: 'about-p3', available: 'available',
  location_badge1: 'location-badge1', location_badge2: 'location-badge2',
  stat1: 'stat1', stat2: 'stat2', stat3: 'stat3', stat4: 'stat4',
  skills_tag: 'skills-tag', skills_title: 'skills-title', skills_sub: 'skills-sub',
  portfolio_tag: 'portfolio-tag', portfolio_title: 'portfolio-title',
  exp_tag: 'exp-tag', exp_title: 'exp-title',
  articles_tag: 'articles-tag', articles_title: 'articles-title', articles_sub: 'articles-sub', articles_more: 'articles-more',
  contact_tag: 'contact-tag', contact_title: 'contact-title',
  footer_desc: 'footer-desc', footer_copy: 'footer-copy'
};
const PROFILE_FIELDS = Object.keys(PROFILE_FIELD_TO_I18N_KEY);

async function loadProfile() {
  const data = await fetchDocument('settings/profile');
  if (!data) return null;
  const fr = {}, en = {};
  PROFILE_FIELDS.forEach(field => {
    const key = PROFILE_FIELD_TO_I18N_KEY[field];
    if (data[`${field}_fr`]) fr[key] = data[`${field}_fr`];
    if (data[`${field}_en`]) en[key] = data[`${field}_en`];
  });
  return {
    fr, en,
    photo: data.photo || '', cv: data.cv || '',
    navName: data.nav_name || '', displayName: data.display_name || '',
    typed: {
      fr: (data.typed_fr || '').split('\n').map(s => s.trim()).filter(Boolean),
      en: (data.typed_en || '').split('\n').map(s => s.trim()).filter(Boolean)
    },
    contact: {
      email: data.contact_email || '', phone: data.contact_phone || '',
      locationFr: data.contact_location_fr || '', locationEn: data.contact_location_en || '',
      linkedinUrl: data.contact_linkedin_url || '', linkedinHandle: data.contact_linkedin_handle || '',
      githubUrl: data.contact_github_url || '', githubHandle: data.contact_github_handle || ''
    }
  };
}

// Garde la dernière réponse Firestore dans le navigateur : à la visite
// suivante, js/data/cached-data.js l'affiche immédiatement, sans repasser
// par l'ancien texte écrit en dur dans le code. Même clé que cached-data.js.
const CACHE_KEY = 'portfolioCache:v1';
// Renvoie true si les données ont changé depuis la version gardée en mémoire.
function saveToCache(name, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const fresh = JSON.stringify(data);
    if (JSON.stringify(cache[name]) === fresh) return false;
    cache[name] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return true;
  } catch { return true; /* stockage indisponible ou plein : on considère que c'est nouveau */ }
}

// Réapplique le rendu, quelle que soit la page où ce script est chargé :
// - page d'accueil : applyTranslations() re-render projets/articles/expériences + textes statiques
// - pages/project.html : render() (fonction locale à cette page) redessine la fiche projet
function currentLanguage() {
  return typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'fr');
}

function refreshCurrentPage() {
  if (typeof applyTranslations === 'function') applyTranslations(currentLanguage());
  if (typeof render === 'function') render();
  if (typeof updateDynamicStats === 'function') updateDynamicStats();
  // Compteurs : relancés seulement si la section "À propos" a déjà été vue (sinon
  // app.js les anime en arrivant dessus) et seulement si le chiffre a changé.
  if (typeof animateCounter === 'function' && (typeof statsAnimated === 'undefined' || statsAnimated)) {
    document.querySelectorAll('.stat-number').forEach(el => {
      if (el.textContent !== el.getAttribute('data-target')) animateCounter(el);
    });
  }
}

// ── Traduction automatique : uniquement quand le site est affiché en anglais ──
// Un visiteur qui reste en français ne déclenche aucun appel à l'API.
const translationJobs = [];
let translating = false;
async function runTranslationJobs() {
  if (translating || !translationJobs.length || currentLanguage() !== 'en') return;
  translating = true;
  const jobs = translationJobs.splice(0);
  const results = await Promise.all(jobs.map(job => job().catch(() => false)));
  translating = false;
  if (results.some(Boolean)) refreshCurrentPage();
}
document.addEventListener('langchange', e => { if (e.detail === 'en') runTranslationJobs(); });

// Chaque collection : où l'appliquer sur la page, et quels champs traduire.
// Une page ne charge que ce qu'elle affiche (la page projet ne lit que "projects").
const COLLECTIONS = {
  projects: {
    present: () => typeof projectsData !== 'undefined',
    load: loadProjects,
    apply: data => Object.assign(projectsData, data),
    translate: data => autoTranslateItems(data.fr, data.en, ['title', 'subtitle', 'description'])
  },
  articles: {
    present: () => typeof articlesData !== 'undefined',
    load: loadArticles,
    apply: data => Object.assign(articlesData, data),
    translate: data => autoTranslateItems(data.fr, data.en, ['title', 'excerpt', 'category', 'date'])
  },
  experiences: {
    present: () => typeof experiencesData !== 'undefined',
    load: loadExperiences,
    apply: data => Object.assign(experiencesData, data),
    translate: data => autoTranslateItems(data.fr, data.en, ['title', 'description', 'location', 'period', 'duration'], ['highlights'])
  },
  skills: {
    present: () => typeof skillsData !== 'undefined',
    load: loadSkills,
    apply: data => Object.assign(skillsData, data),
    translate: data => autoTranslateItems(data.fr, data.en, ['category', 'info'])
  },
  profile: {
    present: () => typeof profileData !== 'undefined',
    load: loadProfile,
    apply: data => { applyProfileData(data); fillProfileEnglishDefaults(); },
    translate: () => autoTranslateItems([profileData.fr], [profileData.en], Object.values(PROFILE_FIELD_TO_I18N_KEY))
  }
};

async function refreshDynamicContent() {
  const names = Object.keys(COLLECTIONS).filter(name => COLLECTIONS[name].present());
  const results = await Promise.allSettled(names.map(name => COLLECTIONS[name].load()));
  let changed = false;
  results.forEach((result, i) => {
    const name = names[i];
    if (result.status === 'rejected') {
      console.warn(`[portfolio] Échec chargement "${name}" depuis Firestore, version précédente conservée.`, result.reason);
      return;
    }
    const data = result.value;
    if (!data) return; // collection vide : on garde les données du code
    if (saveToCache(name, data)) changed = true;
    COLLECTIONS[name].apply(data);
    translationJobs.push(() => COLLECTIONS[name].translate(data));
  });
  window.projectsReady = true; // la page projet peut afficher "introuvable" en connaissance de cause
  // Rien de neuf depuis la dernière visite (déjà affiché depuis le cache) : on ne
  // redessine pas la page d'accueil — ce rafraîchissement inutile coûtait ~1 s sur
  // mobile et retardait l'affichage. La page projet, elle, doit sortir de "Chargement".
  if (changed || typeof render === 'function') refreshCurrentPage();
  runTranslationJobs();
}

// Script chargé en "async" : la page n'attend plus Firestore pour s'afficher.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshDynamicContent);
else refreshDynamicContent();
