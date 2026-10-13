import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAILS } from '../js/firebase-config.js';
import { uploadImageToCloudinary, uploadFileToCloudinary } from '../js/cloudinary-upload.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginScreen = document.getElementById('loginScreen');
const appEl = document.getElementById('app');

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
  const dateFr = document.getElementById('a_date_fr').value;
  const [tEn, exEn, cEn, dEn] = await Promise.all([translateFrToEn(title), translateFrToEn(excerpt), translateFrToEn(category), translateFrToEn(dateFr)]);
  if (tEn) document.getElementById('a_title_en').value = tEn;
  if (exEn) document.getElementById('a_excerpt_en').value = exEn;
  if (cEn) document.getElementById('a_category_en').value = cEn;
  if (dEn) document.getElementById('a_date_en').value = dEn;
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

// Message compréhensible pour un échec d'écriture Firestore
function explainSaveError(err) {
  const code = err?.code || '';
  const msg = err?.message || String(err);
  if (code === 'permission-denied' || code === 'unauthenticated') {
    return "Enregistrement refusé : ta session a sans doute expiré. Reconnecte-toi puis réessaie.";
  }
  if (/maximum allowed size|exceeds|too large/i.test(msg)) {
    return "Contenu trop volumineux (limite Firestore : 1 Mo par élément). Allège le HTML, par exemple en remplaçant les images intégrées (base64) par des images envoyées via les emplacements Image.";
  }
  return 'Enregistrement échoué : ' + msg;
}

// Enregistre puis ferme la fenêtre. En cas d'échec : message clair, fenêtre
// laissée ouverte (rien de ce qui a été saisi n'est perdu), bouton réactivé.
async function saveAndClose(form, modalId, write) {
  const btn = form.querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    await write();
    closeModal(modalId);
  } catch (err) {
    alert(explainSaveError(err));
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── PROJECTS ─────────────────────────────────────────────────
const projectsCol = collection(db, 'projects');
let knownProjectIds = new Set(); // tenu à jour par l'écoute en temps réel (initCollections)

// Le lien détail se déduit automatiquement du slug (pages/project.html?id=...).
// Si l'utilisateur modifie ce champ à la main, on ne l'écrase plus.
const pIdInput = document.getElementById('p_id');
const pDetailInput = document.getElementById('p_detail');
function computeDetail(slug) {
  return slug ? `pages/project.html?id=${slug}` : '';
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
  htmlImageSlotCount = 4;
  updateRichModeVisibility();
  renderSectionsEditor();
  renderHtmlImageSlots();
  document.getElementById('projectModalTitle').textContent = 'Nouveau projet';
  openModal('projectModal');
});

// ── EMPLACEMENTS IMAGES DU HTML PERSONNALISÉ ─────────────────
// Convention : le code contient des jetons {{IMAGE_1}}, {{IMAGE_2}}... à la
// place des URLs d'image. Chaque emplacement numéroté ici remplace TOUTES
// les occurrences de son jeton dans le textarea au moment de l'upload —
// pas besoin de chercher où coller l'URL dans le code.
let htmlImageSlotCount = 4;

function countExistingImageTokens(html) {
  const matches = [...(html || '').matchAll(/\{\{IMAGE_(\d+)\}\}/g)].map(m => Number(m[1]));
  return matches.length ? Math.max(...matches) : 0;
}

function tokenPresentCount(html, n) {
  return ((html || '').match(new RegExp(`\\{\\{IMAGE_${n}\\}\\}`, 'g')) || []).length;
}

function renderHtmlImageSlots() {
  const container = document.getElementById('p_htmlImageSlots');
  const html = document.getElementById('p_customHtml').value;
  container.innerHTML = Array.from({ length: htmlImageSlotCount }, (_, i) => i + 1).map(n => {
    const remaining = tokenPresentCount(html, n);
    const status = remaining > 0
      ? `<span style="color:#f5c842">jeton présent (${remaining}×) — pas encore uploadée</span>`
      : `<span style="color:#1d9e75">✓ remplie (ou jeton absent du code)</span>`;
    return `
      <div class="section-item" data-slot="${n}" style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">
        <strong style="min-width:70px">Image ${n}</strong>
        <input type="file" accept="image/*" data-slot-upload style="flex:1;min-width:180px"/>
        <span style="font-size:.75rem">${status}</span>
        <div class="upload-progress hidden" style="flex-basis:100%"><div class="bar"></div></div>
      </div>`;
  }).join('');
}

document.getElementById('p_htmlAddSlotBtn').addEventListener('click', () => {
  htmlImageSlotCount++;
  renderHtmlImageSlots();
});

document.getElementById('p_htmlImageSlots').addEventListener('change', async (e) => {
  if (!e.target.matches('[data-slot-upload]')) return;
  const file = e.target.files[0];
  if (!file) return;
  const slotEl = e.target.closest('[data-slot]');
  const n = Number(slotEl.dataset.slot);
  const progress = slotEl.querySelector('.upload-progress');
  const bar = progress.querySelector('.bar');
  progress.classList.remove('hidden');
  try {
    const url = await uploadFileToCloudinary(file, 'image', (pct) => { bar.style.width = pct + '%'; });
    const textarea = document.getElementById('p_customHtml');
    const token = `{{IMAGE_${n}}}`;
    if (!textarea.value.includes(token)) {
      alert(`Aucun jeton ${token} trouvé dans le code — ajoute-le à l'endroit voulu (ex: src="${token}") puis réessaie.`);
      return;
    }
    textarea.value = textarea.value.split(token).join(url);
    renderHtmlImageSlots();
  } catch (err) {
    alert('Upload échoué : ' + err.message);
  } finally {
    setTimeout(() => progress.classList.add('hidden'), 600);
  }
});

// Re-scanne les jetons restants à chaque frappe (sans perdre le focus : léger debounce)
let htmlSlotsScanTimer = null;
document.getElementById('p_customHtml').addEventListener('input', () => {
  clearTimeout(htmlSlotsScanTimer);
  htmlSlotsScanTimer = setTimeout(renderHtmlImageSlots, 400);
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
  const isNew = !document.getElementById('p_docId').value;
  const docId = document.getElementById('p_docId').value || document.getElementById('p_id').value.trim();
  if (isNew) {
    // L'ID sert d'adresse de la page détail : lettres minuscules, chiffres et tirets uniquement
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(docId)) {
      alert('ID invalide : utilise uniquement des lettres minuscules sans accent, des chiffres et des tirets (ex : mon-projet-2).');
      return;
    }
    // Sans ce contrôle, un nouveau projet avec un ID déjà pris écrasait l'autre sans prévenir
    if (knownProjectIds.has(docId)) {
      alert(`Un projet avec l'ID "${docId}" existe déjà. Choisis un autre ID, ou clique sur "Modifier" sur ce projet.`);
      return;
    }
  }
  const val = id => document.getElementById(id).value.trim(); // trim : retire espaces/tabulations collés par copier-coller
  const data = {
    order: Number(document.getElementById('p_order').value) || 0,
    title_fr: val('p_title_fr'),
    title_en: val('p_title_en'),
    subtitle_fr: val('p_subtitle_fr'),
    subtitle_en: val('p_subtitle_en'),
    description_fr: val('p_description_fr'),
    description_en: val('p_description_en'),
    category: document.getElementById('p_category').value,
    company: document.getElementById('p_company').value,
    status: document.getElementById('p_status').value,
    statusColor: document.getElementById('p_statusColor').value,
    emoji: document.getElementById('p_emoji').value,
    tags: document.getElementById('p_tags').value.split(',').map(t => t.trim()).filter(Boolean),
    github: val('p_github'),
    demo: val('p_demo'),
    detail: document.getElementById('p_detail').value || computeDetail(docId),
    image: document.getElementById('p_image').value,
    richMode: document.getElementById('p_richMode').value,
    sections: document.getElementById('p_richMode').value === 'sections' ? currentSections : [],
    customHtml: document.getElementById('p_richMode').value === 'html' ? document.getElementById('p_customHtml').value : ''
  };
  await saveAndClose(e.target, 'projectModal', () => setDoc(doc(projectsCol, docId), data, { merge: true }));
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
  htmlImageSlotCount = Math.max(4, countExistingImageTokens(p.customHtml || ''));
  updateRichModeVisibility();
  renderSectionsEditor();
  renderHtmlImageSlots();
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
    date_fr: document.getElementById('a_date_fr').value,
    date_en: document.getElementById('a_date_en').value,
    readTime: document.getElementById('a_readTime').value,
    tag: document.getElementById('a_tag').value,
    link: document.getElementById('a_link').value
  };
  await saveAndClose(e.target, 'articleModal', () =>
    docId ? setDoc(doc(articlesCol, docId), data, { merge: true }) : addDoc(articlesCol, data));
});

function renderArticlesAdmin(items) {
  const list = document.getElementById('articlesList');
  if (!items.length) { list.innerHTML = '<div class="empty-state">Aucun article pour le moment.</div>'; return; }
  list.innerHTML = items.map(a => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-title">${a.emoji || ''} ${a.title_fr || ''}</span>
        <span class="item-meta">${a.date_fr || ''} · ${a.readTime || ''} · ordre ${a.order ?? 0}</span>
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
  document.getElementById('a_date_fr').value = a.date_fr || '';
  document.getElementById('a_date_en').value = a.date_en || '';
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
  await saveAndClose(e.target, 'experienceModal', () =>
    docId ? setDoc(doc(experiencesCol, docId), data, { merge: true }) : addDoc(experiencesCol, data));
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
  await saveAndClose(e.target, 'skillModal', () =>
    docId ? setDoc(doc(skillsCol, docId), data, { merge: true }) : addDoc(skillsCol, data));
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

// ── PROFIL (identité + hero + à propos + sections + contact + pied de page) ──
// Document unique (pas une collection) : settings/profile.
// PROFILE_FIELDS : champs bilingues FR/EN (inputs pf_{f}_fr / pf_{f}_en).
const PROFILE_FIELDS = [
  'hero_tag', 'hero_line1', 'hero_line2', 'hero_desc', 'hero_badge1', 'hero_badge2',
  'nav_title', 'nav_sub',
  'about_tag', 'about_title', 'about_sub', 'about_p1', 'about_p2', 'about_p3', 'available',
  'location_badge1', 'location_badge2',
  'stat1', 'stat2', 'stat3', 'stat4',
  'skills_tag', 'skills_title', 'skills_sub',
  'portfolio_tag', 'portfolio_title',
  'exp_tag', 'exp_title',
  'articles_tag', 'articles_title', 'articles_sub', 'articles_more',
  'contact_tag', 'contact_title', 'contact_location',
  'footer_desc', 'footer_copy',
  'typed'
];
// Champs bilingues volontairement exclus du bouton "Traduire" (texte multi-ligne,
// une traduction automatique brute mélangerait les lignes) :
const PROFILE_FIELDS_NO_AUTOTRANSLATE = ['typed'];
// PROFILE_SINGLE_FIELDS : champs uniques, pas de version EN (input pf_{f}).
const PROFILE_SINGLE_FIELDS = [
  'nav_name', 'display_name',
  'contact_email', 'contact_phone', 'contact_linkedin_url', 'contact_linkedin_handle',
  'contact_github_url', 'contact_github_handle'
];
const profileDoc = doc(db, 'settings', 'profile');

document.getElementById('pf_photoFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const progress = document.getElementById('pf_photoProgress');
  const bar = progress.querySelector('.bar');
  progress.classList.remove('hidden');
  try {
    const url = await uploadFileToCloudinary(file, 'image', (pct) => { bar.style.width = pct + '%'; });
    document.getElementById('pf_photo').value = url;
    const preview = document.getElementById('pf_photoPreview');
    preview.src = url;
    preview.classList.remove('hidden');
  } catch (err) {
    alert('Upload échoué : ' + err.message);
  } finally {
    setTimeout(() => progress.classList.add('hidden'), 600);
  }
});

document.getElementById('pf_cvFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const progress = document.getElementById('pf_cvProgress');
  const bar = progress.querySelector('.bar');
  progress.classList.remove('hidden');
  try {
    const url = await uploadFileToCloudinary(file, 'raw', (pct) => { bar.style.width = pct + '%'; });
    document.getElementById('pf_cv').value = url;
    document.getElementById('pf_cvCurrent').textContent = 'Nouveau CV prêt à enregistrer : ' + file.name;
  } catch (err) {
    alert('Upload échoué : ' + err.message);
  } finally {
    setTimeout(() => progress.classList.add('hidden'), 600);
  }
});

document.getElementById('pf_translateBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setBtnLoading(btn, true);
  await Promise.all(PROFILE_FIELDS.filter(f => !PROFILE_FIELDS_NO_AUTOTRANSLATE.includes(f)).map(async (f) => {
    const frInput = document.getElementById(`pf_${f}_fr`);
    const enInput = document.getElementById(`pf_${f}_en`);
    if (frInput.value && !enInput.value) {
      const translated = await translateFrToEn(frInput.value);
      if (translated) enInput.value = translated;
    }
  }));
  setBtnLoading(btn, false);
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = { photo: document.getElementById('pf_photo').value, cv: document.getElementById('pf_cv').value };
  PROFILE_FIELDS.forEach(f => {
    data[`${f}_fr`] = document.getElementById(`pf_${f}_fr`).value;
    data[`${f}_en`] = document.getElementById(`pf_${f}_en`).value;
  });
  PROFILE_SINGLE_FIELDS.forEach(f => {
    data[f] = document.getElementById(`pf_${f}`).value;
  });
  try {
    await setDoc(profileDoc, data, { merge: true });
    alert('Profil enregistré !');
  } catch (err) {
    alert(explainSaveError(err));
  }
});

function loadProfileForm(data) {
  if (!data) return;
  PROFILE_FIELDS.forEach(f => {
    const frInput = document.getElementById(`pf_${f}_fr`);
    const enInput = document.getElementById(`pf_${f}_en`);
    if (data[`${f}_fr`] !== undefined) frInput.value = data[`${f}_fr`];
    if (data[`${f}_en`] !== undefined) enInput.value = data[`${f}_en`];
  });
  PROFILE_SINGLE_FIELDS.forEach(f => {
    const input = document.getElementById(`pf_${f}`);
    if (data[f] !== undefined) input.value = data[f];
  });
  if (data.photo) {
    document.getElementById('pf_photo').value = data.photo;
    const preview = document.getElementById('pf_photoPreview');
    preview.src = data.photo;
    preview.classList.remove('hidden');
  }
  if (data.cv) {
    document.getElementById('pf_cv').value = data.cv;
    document.getElementById('pf_cvCurrent').textContent = 'CV actuel : ' + data.cv;
  }
}

// ── DELETE (delegated, works for all 3 collections) ─────────
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delete]');
  if (!btn) return;
  if (!confirm('Supprimer définitivement cet élément ?')) return;
  try {
    await deleteDoc(doc(collection(db, btn.dataset.col), btn.dataset.delete));
  } catch (err) {
    alert(explainSaveError(err).replace('Enregistrement', 'Suppression'));
  }
});

// ── LIVE LISTENERS ───────────────────────────────────────────
let collectionsStarted = false;
function initCollections() {
  // Déconnexion puis reconnexion : les écoutes tournent déjà, ne pas les doubler
  if (collectionsStarted) return;
  collectionsStarted = true;
  onSnapshot(query(projectsCol, orderBy('order', 'asc')), (snap) => {
    const items = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    knownProjectIds = new Set(items.map(p => p.docId));
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
  // Le profil est un FORMULAIRE (pas une simple liste en lecture seule) :
  // on ne le pré-remplit qu'UNE fois au chargement. Sans ça, si Firestore
  // renvoie un second instantané pendant que tu tapes (comportement Firebase
  // normal juste après l'ouverture de la page), ça écrase silencieusement
  // ce que tu es en train de saisir avant même que tu aies cliqué "Enregistrer".
  let profileFormLoaded = false;
  onSnapshot(profileDoc, (snap) => {
    if (profileFormLoaded) return;
    if (snap.exists()) { loadProfileForm(snap.data()); profileFormLoaded = true; }
  });
}
