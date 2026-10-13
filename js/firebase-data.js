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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';
import { autoTranslateItems } from './data/auto-translate.js';

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn('[portfolio] Firebase init a échoué, fallback sur les données statiques.', e);
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
  const snap = await getDocs(query(collection(db, 'projects'), orderBy('order', 'asc')));
  if (snap.empty) return null;
  const fr = [], en = [];
  snap.forEach(d => {
    const data = d.data();
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'subtitle', 'description']);
    fr.push({ ...frItem, id: d.id });
    en.push({ ...enItem, id: d.id });
  });
  return { fr, en };
}

async function loadArticles() {
  const snap = await getDocs(query(collection(db, 'articles'), orderBy('order', 'asc')));
  if (snap.empty) return null;
  const fr = [], en = [];
  snap.forEach(d => {
    const data = d.data();
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'excerpt', 'category', 'date']);
    fr.push({ ...frItem, id: d.id });
    en.push({ ...enItem, id: d.id });
  });
  return { fr, en };
}

async function loadExperiences() {
  const snap = await getDocs(query(collection(db, 'experiences'), orderBy('order', 'asc')));
  if (snap.empty) return null;
  const fr = [], en = [];
  snap.forEach(d => {
    const data = d.data();
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'description', 'location', 'period', 'duration']);
    frItem.highlights = data.highlights_fr || data.highlights || [];
    enItem.highlights = data.highlights_en || data.highlights || [];
    fr.push(frItem);
    en.push(enItem);
  });
  return { fr, en };
}

async function loadSkills() {
  const snap = await getDocs(query(collection(db, 'skills'), orderBy('order', 'asc')));
  if (snap.empty) return null;
  const fr = [], en = [];
  snap.forEach(d => {
    const data = d.data();
    const { fr: frItem, en: enItem } = splitLang(data, ['category', 'info']);
    fr.push({ ...frItem, id: d.id });
    en.push({ ...enItem, id: d.id });
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
  const snap = await getDoc(doc(db, 'settings', 'profile'));
  if (!snap.exists()) return null;
  const data = snap.data();
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
function saveToCache(name, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[name] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* stockage indisponible ou plein : on s'en passe */ }
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
  if (db) {
    const names = Object.keys(COLLECTIONS).filter(name => COLLECTIONS[name].present());
    const results = await Promise.allSettled(names.map(name => COLLECTIONS[name].load()));
    results.forEach((result, i) => {
      const name = names[i];
      if (result.status === 'rejected') {
        console.warn(`[portfolio] Échec chargement "${name}" depuis Firestore, version précédente conservée.`, result.reason);
        return;
      }
      const data = result.value;
      if (!data) return; // collection vide : on garde les données du code
      saveToCache(name, data);
      COLLECTIONS[name].apply(data);
      translationJobs.push(() => COLLECTIONS[name].translate(data));
    });
  }
  window.projectsReady = true; // la page projet peut afficher "introuvable" en connaissance de cause
  refreshCurrentPage();        // un seul rafraîchissement, une fois tout reçu
  runTranslationJobs();
}

document.addEventListener('DOMContentLoaded', refreshDynamicContent);
