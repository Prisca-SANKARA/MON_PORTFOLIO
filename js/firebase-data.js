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
  getFirestore, collection, getDocs, query, orderBy
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
    const { fr: frItem, en: enItem } = splitLang(data, ['title', 'excerpt', 'category']);
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

// Réapplique le rendu, quelle que soit la page où ce script est chargé :
// - page d'accueil : applyTranslations() re-render projets/articles/expériences + textes statiques
// - pages/project.html : render() (fonction locale à cette page) redessine la fiche projet
function refreshCurrentPage() {
  const lang = typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'fr');
  if (typeof applyTranslations === 'function') applyTranslations(lang);
  if (typeof render === 'function') render();
  if (typeof updateDynamicStats === 'function') updateDynamicStats();
  document.querySelectorAll('.stat-number').forEach(el => {
    if (typeof animateCounter === 'function') animateCounter(el);
  });
}

async function refreshDynamicContent() {
  if (!db) return;

  try {
    const projects = await loadProjects();
    if (projects && typeof projectsData !== 'undefined') {
      Object.assign(projectsData, projects);
      refreshCurrentPage();
      autoTranslateItems(projects.fr, projects.en, ['title', 'subtitle', 'description'])
        .then(changed => { if (changed) refreshCurrentPage(); });
    }
  } catch (e) { console.warn('[portfolio] Échec chargement projets Firestore, fallback statique conservé.', e); }

  try {
    const articles = await loadArticles();
    if (articles && typeof articlesData !== 'undefined') {
      Object.assign(articlesData, articles);
      refreshCurrentPage();
      autoTranslateItems(articles.fr, articles.en, ['title', 'excerpt', 'category'])
        .then(changed => { if (changed) refreshCurrentPage(); });
    }
  } catch (e) { console.warn('[portfolio] Échec chargement articles Firestore, fallback statique conservé.', e); }

  try {
    const experiences = await loadExperiences();
    if (experiences && typeof experiencesData !== 'undefined') {
      Object.assign(experiencesData, experiences);
      refreshCurrentPage();
      autoTranslateItems(experiences.fr, experiences.en, ['title', 'description', 'location', 'period', 'duration'], ['highlights'])
        .then(changed => { if (changed) refreshCurrentPage(); });
    }
  } catch (e) { console.warn('[portfolio] Échec chargement expériences Firestore, fallback statique conservé.', e); }

  try {
    const skills = await loadSkills();
    if (skills && typeof skillsData !== 'undefined') {
      Object.assign(skillsData, skills);
      refreshCurrentPage();
      autoTranslateItems(skills.fr, skills.en, ['category', 'info'])
        .then(changed => { if (changed) refreshCurrentPage(); });
    }
  } catch (e) { console.warn('[portfolio] Échec chargement compétences Firestore, fallback statique conservé.', e); }
}

document.addEventListener('DOMContentLoaded', refreshDynamicContent);
