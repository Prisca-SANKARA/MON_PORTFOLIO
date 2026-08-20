import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAILS } from '../js/firebase-config.js';
import { uploadImageToCloudinary } from '../js/cloudinary-upload.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginScreen = document.getElementById('loginScreen');
const appEl = document.getElementById('app');

// ── SLUG (pour des IDs Firestore stables et déterministes) ──────
function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Pages détail "sur mesure" (contenu riche non stocké dans Firestore) :
// leur lien ne doit pas être remplacé par le lien générique pages/project.html?id=...
const BESPOKE_DETAIL_PAGES = {
  'taskflow': 'pages/taskflow.html',
  'n8n-onboarding': 'pages/n8n-onboarding.html',
  'fasoartisans-landing': 'pages/fasoartisans-landing-detail.html'
};

// ── ÉDITEUR DE SECTIONS (page détail enrichie, mode "sections") ──
// Contenu volontairement non traduit FR/EN (comme les pages sur-mesure
// actuelles type taskflow.html, qui n'ont elles-mêmes pas de switch de langue).
const SECTION_TYPES = {
  stats:      { label: '📊 Chiffres clés',       itemLabel: 'chiffre',        fields: ['label', 'value', 'desc'] },
  gallery:    { label: '🖼️ Galerie photos',      itemLabel: 'photo',          fields: ['image', 'caption'] },
  features:   { label: '✨ Fonctionnalités',      itemLabel: 'fonctionnalité', fields: ['icon', 'title', 'desc'] },
  decisions:  { label: '🧭 Décisions techniques', itemLabel: 'décision',       fields: ['icon', 'title', 'text'] },
  challenges: { label: '⚡ Défis rencontrés',     itemLabel: 'défi',           fields: ['title', 'text', 'solution'] },
  lessons:    { label: '🎓 Ce que j\'ai appris',  itemLabel: 'leçon',          fields: ['text'] }
};
const FIELD_LABELS = {
  label: 'Libellé', value: 'Valeur', desc: 'Description', caption: 'Légende (optionnel)',
  icon: 'Icône (emoji)', title: 'Titre', text: 'Texte', solution: 'Solution ✅'
};

let currentSections = [];

function emptyItem(type) {
  const item = {};
  SECTION_TYPES[type].fields.forEach(f => item[f] = '');
  return item;
}

function esc(v) { return (v || '').toString().replace(/"/g, '&quot;'); }

function renderSectionItem(type, item, ii) {
  if (type === 'gallery') {
    return `<div class="section-item" data-item="${ii}">
      <button type="button" class="icon-btn danger section-item-remove" data-action="remove-item" title="Supprimer"><i class="fas fa-trash"></i></button>
      <div class="form-group">
        <label>Photo</label>
        <input type="file" accept="image/*" data-gallery-upload/>
        <div class="upload-progress hidden"><div class="bar"></div></div>
        ${item.image ? `<img src="${item.image}" class="img-preview"/>` : ''}
      </div>
      <div class="form-group">
        <label>${FIELD_LABELS.caption}</label>
        <input type="text" data-field="caption" value="${esc(item.caption)}"/>
      </div>
    </div>`;
  }
  const fields = SECTION_TYPES[type].fields;
  return `<div class="section-item" data-item="${ii}">
    <button type="button" class="icon-btn danger section-item-remove" data-action="remove-item" title="Supprimer"><i class="fas fa-trash"></i></button>
    <div class="grid-2">
      ${fields.map(f => `<div class="form-group"><label>${FIELD_LABELS[f] || f}</label>
        ${f === 'desc' || f === 'text'
          ? `<textarea rows="2" data-field="${f}">${item[f] || ''}</textarea>`
          : `<input type="text" data-field="${f}" value="${esc(item[f])}"/>`}
      </div>`).join('')}
    </div>
  </div>`;
}

function renderSectionsEditor() {
  const list = document.getElementById('p_sectionsList');
  list.innerHTML = currentSections.map((block, bi) => `
    <div class="section-block" data-block="${bi}">
      <div class="section-block-head">
        <span class="label">${SECTION_TYPES[block.type]?.label || block.type}</span>
        <div class="actions">
          <button type="button" class="icon-btn" data-action="move-up" title="Monter"><i class="fas fa-arrow-up"></i></button>
          <button type="button" class="icon-btn" data-action="move-down" title="Descendre"><i class="fas fa-arrow-down"></i></button>
          <button type="button" class="icon-btn danger" data-action="remove-block" title="Supprimer ce bloc"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-group">
        <label>Titre du bloc (optionnel)</label>
        <input type="text" data-heading value="${esc(block.heading)}" placeholder="${SECTION_TYPES[block.type]?.label || ''}"/>
      </div>
      ${(block.items || []).map((item, ii) => renderSectionItem(block.type, item, ii)).join('')}
      <button type="button" class="btn-ghost" data-action="add-item" style="font-size:.8rem"><i class="fas fa-plus"></i> Ajouter ${SECTION_TYPES[block.type]?.itemLabel || 'élément'}</button>
    </div>
  `).join('') || '<p style="color:#9aa3b8;font-size:.85rem">Aucun bloc pour le moment — choisis un type ci-dessus et clique "Ajouter un bloc".</p>';
}

function updateRichModeVisibility() {
  const mode = document.getElementById('p_richMode').value;
  document.getElementById('p_sectionsEditor').classList.toggle('hidden', mode !== 'sections');
  document.getElementById('p_htmlEditor').classList.toggle('hidden', mode !== 'html');
}
document.getElementById('p_richMode').addEventListener('change', updateRichModeVisibility);

document.getElementById('p_addSectionBtn').addEventListener('click', () => {
  const type = document.getElementById('p_sectionType').value;
  currentSections.push({ type, heading: '', items: [emptyItem(type)] });
  renderSectionsEditor();
});

// input : mise à jour en place, SANS re-render (pour ne pas perdre le focus/curseur pendant la frappe)
document.getElementById('p_sectionsEditor').addEventListener('input', (e) => {
  const blockEl = e.target.closest('.section-block');
  if (!blockEl) return;
  const bi = Number(blockEl.dataset.block);
  if (e.target.hasAttribute('data-heading')) {
    currentSections[bi].heading = e.target.value;
    return;
  }
  const itemEl = e.target.closest('.section-item');
  if (itemEl && e.target.dataset.field) {
    const ii = Number(itemEl.dataset.item);
    currentSections[bi].items[ii][e.target.dataset.field] = e.target.value;
  }
});

// clics : ajout/suppression/réordonnancement de blocs et d'éléments (re-render nécessaire)
document.getElementById('p_sectionsEditor').addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  const blockEl = e.target.closest('.section-block');
  const bi = Number(blockEl.dataset.block);
  if (action === 'remove-block') {
    currentSections.splice(bi, 1);
  } else if (action === 'move-up' && bi > 0) {
    [currentSections[bi - 1], currentSections[bi]] = [currentSections[bi], currentSections[bi - 1]];
  } else if (action === 'move-down' && bi < currentSections.length - 1) {
    [currentSections[bi], currentSections[bi + 1]] = [currentSections[bi + 1], currentSections[bi]];
  } else if (action === 'add-item') {
    currentSections[bi].items.push(emptyItem(currentSections[bi].type));
  } else if (action === 'remove-item') {
    const itemEl = e.target.closest('.section-item');
    currentSections[bi].items.splice(Number(itemEl.dataset.item), 1);
  }
  renderSectionsEditor();
});

// upload photo de galerie (Cloudinary)
document.getElementById('p_sectionsEditor').addEventListener('change', async (e) => {
  if (!e.target.matches('[data-gallery-upload]')) return;
  const file = e.target.files[0];
  if (!file) return;
  const itemEl = e.target.closest('.section-item');
  const blockEl = e.target.closest('.section-block');
  const bi = Number(blockEl.dataset.block), ii = Number(itemEl.dataset.item);
  const progress = itemEl.querySelector('.upload-progress');
  const bar = progress.querySelector('.bar');
  progress.classList.remove('hidden');
  try {
    const url = await uploadImageToCloudinary(file, (pct) => { bar.style.width = pct + '%'; });
    currentSections[bi].items[ii].image = url;
    renderSectionsEditor();
  } catch (err) {
    alert('Upload échoué : ' + err.message);
  }
});

// ── AUTH ─────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errEl.textContent = 'Connexion échouée : ' + (err.code || err.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

document.getElementById('forgotPasswordBtn').addEventListener('click', async () => {
  const errEl = document.getElementById('loginError');
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) { errEl.textContent = 'Renseigne ton email ci-dessus, puis clique à nouveau sur "Mot de passe oublié ?".'; return; }
  try {
    await sendPasswordResetEmail(auth, email);
    errEl.style.color = '#1d9e75';
    errEl.textContent = 'Email de réinitialisation envoyé à ' + email + ' (vérifie aussi les spams).';
  } catch (err) {
    errEl.style.color = '';
    errEl.textContent = 'Échec de l\'envoi : ' + (err.code || err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user && ADMIN_EMAILS.includes(user.email)) {
    loginScreen.classList.add('hidden');
    appEl.classList.remove('hidden');
    initCollections();
  } else {
    if (user) signOut(auth); // connecté mais pas autorisé
    loginScreen.classList.remove('hidden');
    appEl.classList.add('hidden');
  }
});

// ── TABS ─────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── TRADUCTION AUTOMATIQUE FR → EN ───────────────────────────
// Utilise l'API publique MyMemory (gratuite, sans clé). Résultat à relire
// et corriger si besoin, surtout pour le vocabulaire technique.
async function translateFrToEn(text) {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`);
    const json = await res.json();
    return json?.responseData?.translatedText || '';
  } catch {
    return '';
  }
}

function setBtnLoading(btn, loading) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<i class="fas fa-spinner fa-spin"></i> Traduction en cours...'
    : '<i class="fas fa-language"></i> Traduire FR → EN';
}

document.getElementById('p_translateBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setBtnLoading(btn, true);
  const title = document.getElementById('p_title_fr').value;
  const subtitle = document.getElementById('p_subtitle_fr').value;
  const desc = document.getElementById('p_description_fr').value;
  const [tEn, sEn, dEn] = await Promise.all([translateFrToEn(title), translateFrToEn(subtitle), translateFrToEn(desc)]);
  if (tEn) document.getElementById('p_title_en').value = tEn;
  if (sEn) document.getElementById('p_subtitle_en').value = sEn;
  if (dEn) document.getElementById('p_description_en').value = dEn;
  setBtnLoading(btn, false);
});

document.getElementById('a_translateBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setBtnLoading(btn, true);
  const title = document.getElementById('a_title_fr').value;
  const excerpt = document.getElementById('a_excerpt_fr').value;
  const category = document.getElementById('a_category_fr').value;
  const [tEn, exEn, cEn] = await Promise.all([translateFrToEn(title), translateFrToEn(excerpt), translateFrToEn(category)]);
  if (tEn) document.getElementById('a_title_en').value = tEn;
  if (exEn) document.getElementById('a_excerpt_en').value = exEn;
  if (cEn) document.getElementById('a_category_en').value = cEn;
  setBtnLoading(btn, false);
});

document.getElementById('e_translateBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setBtnLoading(btn, true);
  const title = document.getElementById('e_title_fr').value;
  const location = document.getElementById('e_location_fr').value;
  const period = document.getElementById('e_period_fr').value;
  const duration = document.getElementById('e_duration_fr').value;
  const desc = document.getElementById('e_description_fr').value;
  const highlightsRaw = document.getElementById('e_highlights_fr').value;
  const highlightLines = highlightsRaw.split('\n').map(s => s.trim()).filter(Boolean);

  const [tEn, lEn, perEn, durEn, dEn, ...hEn] = await Promise.all([
    translateFrToEn(title), translateFrToEn(location), translateFrToEn(period),
    translateFrToEn(duration), translateFrToEn(desc),
    ...highlightLines.map(translateFrToEn)
  ]);

  if (tEn) document.getElementById('e_title_en').value = tEn;
  if (lEn) document.getElementById('e_location_en').value = lEn;
  if (perEn) document.getElementById('e_period_en').value = perEn;
  if (durEn) document.getElementById('e_duration_en').value = durEn;
  if (dEn) document.getElementById('e_description_en').value = dEn;
  if (hEn.length) document.getElementById('e_highlights_en').value = hEn.filter(Boolean).join('\n');
  setBtnLoading(btn, false);
});

// ── MODAL HELPERS ────────────────────────────────────────────
document.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', () => document.getElementById(el.dataset.close).classList.add('hidden'));
});
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ── PROJECTS ─────────────────────────────────────────────────
const projectsCol = collection(db, 'projects');

// Le lien détail se déduit automatiquement du slug (pages/project.html?id=...),
// sauf pour les 3 pages "sur mesure" qui gardent leur propre fichier.
// Si l'utilisateur modifie ce champ à la main, on ne l'écrase plus.
const pIdInput = document.getElementById('p_id');
const pDetailInput = document.getElementById('p_detail');
function computeDetail(slug) {
  return BESPOKE_DETAIL_PAGES[slug] || (slug ? `pages/project.html?id=${slug}` : '');
}
pIdInput.addEventListener('input', () => {
  if (!pDetailInput.dataset.manual) pDetailInput.value = computeDetail(pIdInput.value.trim());
});
pDetailInput.addEventListener('input', () => { pDetailInput.dataset.manual = '1'; });

document.getElementById('newProjectBtn').addEventListener('click', () => {
  document.getElementById('projectForm').reset();
  document.getElementById('p_docId').value = '';
  delete pDetailInput.dataset.manual;
  document.getElementById('p_imagePreview').classList.add('hidden');
  document.getElementById('p_image').value = '';
  currentSections = [];
  document.getElementById('p_richMode').value = 'standard';
  document.getElementById('p_customHtml').value = '';
  updateRichModeVisibility();
  renderSectionsEditor();
  document.getElementById('projectModalTitle').textContent = 'Nouveau projet';
  openModal('projectModal');
});

document.getElementById('p_imageFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const progress = document.getElementById('p_uploadProgress');
  const bar = progress.querySelector('.bar');
  progress.classList.remove('hidden');
  try {
    const url = await uploadImageToCloudinary(file, (pct) => { bar.style.width = pct + '%'; });
    document.getElementById('p_image').value = url;
    const preview = document.getElementById('p_imagePreview');
    preview.src = url;
    preview.classList.remove('hidden');
  } catch (err) {
    alert('Upload échoué : ' + err.message);
  } finally {
    setTimeout(() => progress.classList.add('hidden'), 600);
  }
});

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const docId = document.getElementById('p_docId').value || document.getElementById('p_id').value.trim();
  const data = {
    order: Number(document.getElementById('p_order').value) || 0,
    title_fr: document.getElementById('p_title_fr').value,
    title_en: document.getElementById('p_title_en').value,
    subtitle_fr: document.getElementById('p_subtitle_fr').value,
    subtitle_en: document.getElementById('p_subtitle_en').value,
    description_fr: document.getElementById('p_description_fr').value,
    description_en: document.getElementById('p_description_en').value,
    category: document.getElementById('p_category').value,
    company: document.getElementById('p_company').value,
    status: document.getElementById('p_status').value,
    statusColor: document.getElementById('p_statusColor').value,
    emoji: document.getElementById('p_emoji').value,
    tags: document.getElementById('p_tags').value.split(',').map(t => t.trim()).filter(Boolean),
    github: document.getElementById('p_github').value,
    demo: document.getElementById('p_demo').value,
    detail: document.getElementById('p_detail').value || computeDetail(docId),
    image: document.getElementById('p_image').value,
    richMode: document.getElementById('p_richMode').value,
    sections: document.getElementById('p_richMode').value === 'sections' ? currentSections : [],
    customHtml: document.getElementById('p_richMode').value === 'html' ? document.getElementById('p_customHtml').value : ''
  };
  await setDoc(doc(projectsCol, docId), data, { merge: true });
  closeModal('projectModal');
});

function renderProjectsAdmin(items) {
  const list = document.getElementById('projectsList');
  if (!items.length) { list.innerHTML = '<div class="empty-state">Aucun projet pour le moment. Clique sur "Nouveau projet" pour en ajouter un.</div>'; return; }
  list.innerHTML = items.map(p => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-title">${p.emoji || ''} ${p.title_fr || p.id}</span>
        <span class="item-meta">${p.company || ''} · ${p.status || ''} · ordre ${p.order ?? 0}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit="${p.docId}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" data-delete="${p.docId}" data-col="projects" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editProject(items.find(i => i.docId === btn.dataset.edit))));
}

function editProject(p) {
  document.getElementById('p_docId').value = p.docId;
  document.getElementById('p_id').value = p.docId;
  document.getElementById('p_order').value = p.order ?? 0;
  document.getElementById('p_title_fr').value = p.title_fr || '';
  document.getElementById('p_title_en').value = p.title_en || '';
  document.getElementById('p_subtitle_fr').value = p.subtitle_fr || '';
  document.getElementById('p_subtitle_en').value = p.subtitle_en || '';
  document.getElementById('p_description_fr').value = p.description_fr || '';
  document.getElementById('p_description_en').value = p.description_en || '';
  document.getElementById('p_category').value = p.category || 'fullstack';
  document.getElementById('p_company').value = p.company || '';
  document.getElementById('p_status').value = p.status || 'Terminé';
  document.getElementById('p_statusColor').value = p.statusColor || '#1d9e75';
  document.getElementById('p_emoji').value = p.emoji || '';
  document.getElementById('p_tags').value = (p.tags || []).join(', ');
  document.getElementById('p_github').value = p.github || '';
  document.getElementById('p_demo').value = p.demo || '';
  pDetailInput.value = p.detail || '';
  pDetailInput.dataset.manual = '1'; // ne pas écraser une valeur déjà enregistrée tant que l'ID n'est pas modifié
  document.getElementById('p_image').value = p.image || '';
  const preview = document.getElementById('p_imagePreview');
  if (p.image) { preview.src = p.image; preview.classList.remove('hidden'); } else preview.classList.add('hidden');
  currentSections = Array.isArray(p.sections) ? JSON.parse(JSON.stringify(p.sections)) : [];
  document.getElementById('p_richMode').value = p.richMode || 'standard';
  document.getElementById('p_customHtml').value = p.customHtml || '';
  updateRichModeVisibility();
  renderSectionsEditor();
  document.getElementById('projectModalTitle').textContent = 'Modifier : ' + (p.title_fr || p.docId);
  openModal('projectModal');
}

// ── ARTICLES ─────────────────────────────────────────────────
const articlesCol = collection(db, 'articles');
document.getElementById('newArticleBtn').addEventListener('click', () => {
  document.getElementById('articleForm').reset();
  document.getElementById('a_docId').value = '';
  document.getElementById('articleModalTitle').textContent = 'Nouvel article';
  openModal('articleModal');
});

document.getElementById('articleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const docId = document.getElementById('a_docId').value;
  const data = {
    order: Number(document.getElementById('a_order').value) || 0,
    emoji: document.getElementById('a_emoji').value,
    title_fr: document.getElementById('a_title_fr').value,
    title_en: document.getElementById('a_title_en').value,
    excerpt_fr: document.getElementById('a_excerpt_fr').value,
    excerpt_en: document.getElementById('a_excerpt_en').value,
    category_fr: document.getElementById('a_category_fr').value,
    category_en: document.getElementById('a_category_en').value,
    date: document.getElementById('a_date').value,
    readTime: document.getElementById('a_readTime').value,
    tag: document.getElementById('a_tag').value,
    link: document.getElementById('a_link').value
  };
  if (docId) await setDoc(doc(articlesCol, docId), data, { merge: true });
  else await addDoc(articlesCol, data);
  closeModal('articleModal');
});

function renderArticlesAdmin(items) {
  const list = document.getElementById('articlesList');
  if (!items.length) { list.innerHTML = '<div class="empty-state">Aucun article pour le moment.</div>'; return; }
  list.innerHTML = items.map(a => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-title">${a.emoji || ''} ${a.title_fr || ''}</span>
        <span class="item-meta">${a.date || ''} · ${a.readTime || ''} · ordre ${a.order ?? 0}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit="${a.docId}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" data-delete="${a.docId}" data-col="articles" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editArticle(items.find(i => i.docId === btn.dataset.edit))));
}

function editArticle(a) {
  document.getElementById('a_docId').value = a.docId;
  document.getElementById('a_order').value = a.order ?? 0;
  document.getElementById('a_emoji').value = a.emoji || '';
  document.getElementById('a_title_fr').value = a.title_fr || '';
  document.getElementById('a_title_en').value = a.title_en || '';
  document.getElementById('a_excerpt_fr').value = a.excerpt_fr || '';
  document.getElementById('a_excerpt_en').value = a.excerpt_en || '';
  document.getElementById('a_category_fr').value = a.category_fr || '';
  document.getElementById('a_category_en').value = a.category_en || '';
  document.getElementById('a_date').value = a.date || '';
  document.getElementById('a_readTime').value = a.readTime || '';
  document.getElementById('a_tag').value = a.tag || '';
  document.getElementById('a_link').value = a.link || '';
  document.getElementById('articleModalTitle').textContent = 'Modifier : ' + (a.title_fr || '');
  openModal('articleModal');
}

// ── EXPERIENCES ──────────────────────────────────────────────
const experiencesCol = collection(db, 'experiences');
document.getElementById('newExperienceBtn').addEventListener('click', () => {
  document.getElementById('experienceForm').reset();
  document.getElementById('e_docId').value = '';
  document.getElementById('experienceModalTitle').textContent = 'Nouvelle expérience';
  openModal('experienceModal');
});

document.getElementById('experienceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const docId = document.getElementById('e_docId').value;
  const data = {
    order: Number(document.getElementById('e_order').value) || 0,
    type: document.getElementById('e_type').value,
    title_fr: document.getElementById('e_title_fr').value,
    title_en: document.getElementById('e_title_en').value,
    company: document.getElementById('e_company').value,
    location_fr: document.getElementById('e_location_fr').value,
    location_en: document.getElementById('e_location_en').value,
    period_fr: document.getElementById('e_period_fr').value,
    period_en: document.getElementById('e_period_en').value,
    duration_fr: document.getElementById('e_duration_fr').value,
    duration_en: document.getElementById('e_duration_en').value,
    current: document.getElementById('e_current').checked,
    description_fr: document.getElementById('e_description_fr').value,
    description_en: document.getElementById('e_description_en').value,
    highlights_fr: document.getElementById('e_highlights_fr').value.split('\n').map(s => s.trim()).filter(Boolean),
    highlights_en: document.getElementById('e_highlights_en').value.split('\n').map(s => s.trim()).filter(Boolean)
  };
  if (docId) await setDoc(doc(experiencesCol, docId), data, { merge: true });
  else await addDoc(experiencesCol, data);
  closeModal('experienceModal');
});

function renderExperiencesAdmin(items) {
  const list = document.getElementById('experiencesList');
  if (!items.length) { list.innerHTML = '<div class="empty-state">Aucune expérience pour le moment.</div>'; return; }
  list.innerHTML = items.map(exp => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-title">${exp.type === 'work' ? '💼' : '🎓'} ${exp.title_fr || ''}</span>
        <span class="item-meta">${exp.company || ''} · ${exp.period_fr || ''} · ordre ${exp.order ?? 0}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit="${exp.docId}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" data-delete="${exp.docId}" data-col="experiences" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editExperience(items.find(i => i.docId === btn.dataset.edit))));
}

function editExperience(exp) {
  document.getElementById('e_docId').value = exp.docId;
  document.getElementById('e_order').value = exp.order ?? 0;
  document.getElementById('e_type').value = exp.type || 'work';
  document.getElementById('e_title_fr').value = exp.title_fr || '';
  document.getElementById('e_title_en').value = exp.title_en || '';
  document.getElementById('e_company').value = exp.company || '';
  document.getElementById('e_location_fr').value = exp.location_fr || '';
  document.getElementById('e_location_en').value = exp.location_en || '';
  document.getElementById('e_period_fr').value = exp.period_fr || '';
  document.getElementById('e_period_en').value = exp.period_en || '';
  document.getElementById('e_duration_fr').value = exp.duration_fr || '';
  document.getElementById('e_duration_en').value = exp.duration_en || '';
  document.getElementById('e_current').checked = !!exp.current;
  document.getElementById('e_description_fr').value = exp.description_fr || '';
  document.getElementById('e_description_en').value = exp.description_en || '';
  document.getElementById('e_highlights_fr').value = (exp.highlights_fr || []).join('\n');
  document.getElementById('e_highlights_en').value = (exp.highlights_en || []).join('\n');
  document.getElementById('experienceModalTitle').textContent = 'Modifier : ' + (exp.title_fr || '');
  openModal('experienceModal');
}

// ── SKILLS (compétences) ──────────────────────────────────────
const skillsCol = collection(db, 'skills');
document.getElementById('newSkillBtn').addEventListener('click', () => {
  document.getElementById('skillForm').reset();
  document.getElementById('s_docId').value = '';
  document.getElementById('skillModalTitle').textContent = 'Nouvelle compétence';
  openModal('skillModal');
});

document.getElementById('s_translateBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setBtnLoading(btn, true);
  const category = document.getElementById('s_category_fr').value;
  const info = document.getElementById('s_info_fr').value;
  const [catEn, infoEn] = await Promise.all([translateFrToEn(category), translateFrToEn(info)]);
  if (catEn) document.getElementById('s_category_en').value = catEn;
  if (infoEn) document.getElementById('s_info_en').value = infoEn;
  setBtnLoading(btn, false);
});

document.getElementById('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const docId = document.getElementById('s_docId').value;
  const data = {
    order: Number(document.getElementById('s_order').value) || 0,
    name: document.getElementById('s_name').value,
    category_fr: document.getElementById('s_category_fr').value,
    category_en: document.getElementById('s_category_en').value,
    info_fr: document.getElementById('s_info_fr').value,
    info_en: document.getElementById('s_info_en').value,
    level: document.getElementById('s_level').value,
    icon: document.getElementById('s_icon').value
  };
  if (docId) await setDoc(doc(skillsCol, docId), data, { merge: true });
  else await addDoc(skillsCol, data);
  closeModal('skillModal');
});

function renderSkillsAdmin(items) {
  const list = document.getElementById('skillsList');
  if (!items.length) { list.innerHTML = '<div class="empty-state">Aucune compétence pour le moment.</div>'; return; }
  list.innerHTML = items.map(s => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-title"><i class="${s.icon || 'fas fa-code'}"></i> ${s.name || ''}</span>
        <span class="item-meta">${s.category_fr || ''} · ${s.level || ''} · ordre ${s.order ?? 0}</span>
      </div>
      <div class="item-actions">
        <button class="icon-btn" data-edit="${s.docId}" title="Modifier"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" data-delete="${s.docId}" data-col="skills" title="Supprimer"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editSkill(items.find(i => i.docId === btn.dataset.edit))));
}

function editSkill(s) {
  document.getElementById('s_docId').value = s.docId;
  document.getElementById('s_name').value = s.name || '';
  document.getElementById('s_order').value = s.order ?? 0;
  document.getElementById('s_category_fr').value = s.category_fr || '';
  document.getElementById('s_category_en').value = s.category_en || '';
  document.getElementById('s_info_fr').value = s.info_fr || '';
  document.getElementById('s_info_en').value = s.info_en || '';
  document.getElementById('s_level').value = s.level || 'intermediate';
  document.getElementById('s_icon').value = s.icon || '';
  document.getElementById('skillModalTitle').textContent = 'Modifier : ' + (s.name || '');
  openModal('skillModal');
}

// ── DELETE (delegated, works for all 3 collections) ─────────
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  if (!confirm('Supprimer définitivement cet élément ?')) return;
  await deleteDoc(doc(collection(db, btn.dataset.col), btn.dataset.delete));
});

// ── MIGRATION DES 3 PAGES SUR-MESURE VERS FIRESTORE ──────────
// Récupère le HTML déjà écrit dans pages/taskflow.html etc. et le colle tel
// quel dans le champ customHtml du projet correspondant (mode "html").
// Idempotent (merge:true) : peut être relancé sans risque.
document.getElementById('migrateBespokeBtn').addEventListener('click', async () => {
  if (!confirm('Copier le HTML de TaskFlow, n8n-onboarding et FasoArtisans-landing dans Firestore (mode "HTML personnalisé") ? Les fichiers pages/*.html existants ne sont pas modifiés ni supprimés.')) return;
  const targets = {
    'taskflow': '../pages/taskflow.html',
    'n8n-onboarding': '../pages/n8n-onboarding.html',
    'fasoartisans-landing': '../pages/fasoartisans-landing-detail.html'
  };
  try {
    for (const [slug, path] of Object.entries(targets)) {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`${path} introuvable (${res.status})`);
      const html = await res.text();
      await setDoc(doc(projectsCol, slug), { richMode: 'html', customHtml: html }, { merge: true });
    }
    alert('Migration terminée ! Les 3 projets utilisent maintenant le mode "HTML personnalisé" — modifiable directement depuis "Modifier" > "HTML personnalisé".');
  } catch (err) {
    alert('Erreur pendant la migration : ' + err.message);
  }
});

// ── IMPORT ONE-TIME DES DONNÉES STATIQUES ────────────────────
// Utilise des IDs déterministes pour les 3 collections : relancer l'import
// met à jour les documents existants au lieu d'en créer des doublons.
document.getElementById('importBtn').addEventListener('click', async () => {
  if (!confirm('Importer les données statiques actuelles du site (projets, articles, expériences, compétences) dans Firestore ? Les documents existants avec le même ID seront mis à jour, aucun doublon ne sera créé.')) return;

  try {
    // Projets (projectsData/articlesData/experiencesData viennent des scripts
    // classiques js/data/*.js chargés par admin/index.html — variables globales
    // partagées, PAS des propriétés de window, d'où l'accès direct par nom ici)
    const frP = projectsData?.fr || [];
    const enP = projectsData?.en || [];
    for (let i = 0; i < frP.length; i++) {
      const fr = frP[i], en = enP.find(x => x.id === fr.id) || {};
      await setDoc(doc(projectsCol, fr.id), {
        order: i,
        title_fr: fr.title, title_en: en.title || fr.title,
        subtitle_fr: fr.subtitle, subtitle_en: en.subtitle || fr.subtitle,
        description_fr: fr.description, description_en: en.description || fr.description,
        category: fr.category, company: fr.company, status: fr.status,
        statusColor: fr.statusColor, emoji: fr.emoji, tags: fr.tags || [],
        github: fr.github, demo: fr.demo, detail: computeDetail(fr.id), image: fr.image
        // (richMode/sections/customHtml volontairement omis : l'import ne doit jamais
        // écraser une page détail enrichie déjà configurée à la main dans l'admin)
      }, { merge: true });
    }

    // Articles — ID stable dérivé du champ "id" numérique des données statiques
    const frA = articlesData?.fr || [];
    const enA = articlesData?.en || [];
    for (let i = 0; i < frA.length; i++) {
      const fr = frA[i], en = enA[i] || {};
      const articleId = 'article-' + (fr.id ?? i);
      await setDoc(doc(articlesCol, articleId), {
        order: i, emoji: fr.emoji,
        title_fr: fr.title, title_en: en.title || fr.title,
        excerpt_fr: fr.excerpt, excerpt_en: en.excerpt || fr.excerpt,
        category_fr: fr.category, category_en: en.category || fr.category,
        date: fr.date, readTime: fr.readTime, tag: fr.tag, link: fr.link
      }, { merge: true });
    }

    // Expériences — ID stable dérivé de l'entreprise + du titre du poste
    const frE = experiencesData?.fr || [];
    const enE = experiencesData?.en || [];
    for (let i = 0; i < frE.length; i++) {
      const fr = frE[i], en = enE[i] || {};
      const expId = slugify(`${fr.company}-${fr.title}`) || ('exp-' + i);
      await setDoc(doc(experiencesCol, expId), {
        order: i, type: fr.type, company: fr.company, current: !!fr.current,
        title_fr: fr.title, title_en: en.title || fr.title,
        location_fr: fr.location, location_en: en.location || fr.location,
        period_fr: fr.period, period_en: en.period || fr.period,
        duration_fr: fr.duration, duration_en: en.duration || fr.duration,
        description_fr: fr.description, description_en: en.description || fr.description,
        highlights_fr: fr.highlights || [], highlights_en: en.highlights || fr.highlights || []
      }, { merge: true });
    }

    // Compétences — ID stable dérivé du nom (technologie, pas de traduction)
    const frS = skillsData?.fr || [];
    const enS = skillsData?.en || [];
    for (let i = 0; i < frS.length; i++) {
      const fr = frS[i], en = enS[i] || {};
      const skillId = slugify(fr.name) || ('skill-' + i);
      await setDoc(doc(skillsCol, skillId), {
        order: fr.order ?? i, name: fr.name, icon: fr.icon, level: fr.level,
        category_fr: fr.category, category_en: en.category || fr.category,
        info_fr: fr.info, info_en: en.info || fr.info
      }, { merge: true });
    }

    alert('Import terminé ! Les données sont maintenant dans Firestore. Le site public va automatiquement les afficher au prochain chargement.');
  } catch (err) {
    alert('Erreur pendant l\'import : ' + err.message);
  }
});

// ── LIVE LISTENERS ───────────────────────────────────────────
function initCollections() {
  onSnapshot(query(projectsCol, orderBy('order', 'asc')), (snap) => {
    const items = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    renderProjectsAdmin(items);
  });
  onSnapshot(query(articlesCol, orderBy('order', 'asc')), (snap) => {
    const items = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    renderArticlesAdmin(items);
  });
  onSnapshot(query(experiencesCol, orderBy('order', 'asc')), (snap) => {
    const items = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    renderExperiencesAdmin(items);
  });
  onSnapshot(query(skillsCol, orderBy('order', 'asc')), (snap) => {
    const items = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    renderSkillsAdmin(items);
  });
}
