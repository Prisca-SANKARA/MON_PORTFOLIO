/**
 * TRADUCTION AUTOMATIQUE EN DIRECT (FR → EN)
 * ============================================
 * Si un champ anglais n'a pas été rempli (ou rempli via le bouton "Traduire"
 * de l'admin), le site le traduit lui-même à l'affichage, côté visiteur,
 * via l'API gratuite MyMemory. Résultat mis en cache (localStorage) pour
 * ne jamais retraduire deux fois le même texte.
 */
const CACHE_KEY = 'autoTranslateCache';

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}
function writeCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* quota plein, tant pis */ }
}

async function translateOne(text, cache) {
  if (!text || !text.trim()) return text;
  if (cache[text]) {
    // Nettoie un ancien avertissement de quota resté en cache avant ce correctif
    if (!/MYMEMORY WARNING/i.test(cache[text])) return cache[text];
    delete cache[text];
  }
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`);
    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    // Quota dépassé / erreur : l'API renvoie un message d'avertissement À LA PLACE
    // de la traduction (avec un statut ≠ 200). On garde alors le français, et on
    // ne met rien en cache pour réessayer à la prochaine visite.
    const ok = Number(json?.responseStatus) === 200 && translated && !/MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(translated);
    if (!ok) return text;
    cache[text] = translated;
    return translated;
  } catch {
    return text; // hors ligne / API indisponible → on garde le français plutôt que planter
  }
}

// Texte contenant des retours à la ligne <br> : on traduit chaque morceau
// séparément pour que les <br> restent à leur place (sinon l'API les déplace
// ou les mélange avec le texte, et la mise en page casse).
async function translateText(text, cache) {
  if (!/<br\s*\/?>/i.test(text || '')) return translateOne(text, cache);
  const parts = text.split(/(<br\s*\/?>)/i);
  const out = await Promise.all(parts.map(async part => {
    if (/^<br/i.test(part) || !part.trim()) return part;
    const translated = await translateOne(part.trim(), cache);
    return part.replace(part.trim(), translated);
  }));
  return out.join('');
}

/**
 * Remplit en place les champs manquants d'un tableau d'objets "en" en se basant
 * sur le tableau "fr" correspondant, pour la liste de champs donnée.
 * Un champ est considéré "manquant" uniquement s'il est vide.
 * @param {Array} frItems
 * @param {Array} enItems
 * @param {string[]} fields - noms de champs simples (string) à traduire
 * @param {string[]} arrayFields - noms de champs tableau de strings (ex: highlights) à traduire élément par élément
 */
export async function autoTranslateItems(frItems, enItems, fields = [], arrayFields = []) {
  const cache = readCache();
  let changed = false;

  for (let i = 0; i < enItems.length; i++) {
    const fr = frItems[i];
    const en = enItems[i];
    if (!fr || !en) continue;

    for (const f of fields) {
      // Seul un champ EN VIDE est traduit : un champ EN rempli à la main est
      // respecté même s'il est identique au FR (noms propres : "TaskFlow",
      // "ARCASHIELD Cyber-Alerts"… que l'API déformerait).
      if (!en[f] && fr[f]) {
        en[f] = await translateText(fr[f], cache);
        changed = true;
      }
    }

    for (const f of arrayFields) {
      const frArr = fr[f] || [];
      const enArr = en[f] || [];
      if (enArr.length === 0 && frArr.length) {
        en[f] = await Promise.all(frArr.map(t => translateText(t, cache)));
        changed = true;
      }
    }
  }

  if (changed) writeCache(cache);
  return changed;
}

/**
 * Traduction automatique "à la volée" de TOUT le texte visible d'un noeud DOM
 * (utilisée pour le contenu qui n'a pas de version EN pré-écrite : sections
 * personnalisées et pages HTML sur-mesure). Parcourt les noeuds texte, traduit
 * chacun via MyMemory (avec le même cache que autoTranslateItems), et remplace
 * leur contenu en place — les balises/attributs/scripts ne sont pas touchés.
 * Fonctionne aussi sur le document d'un iframe (passe son propre <body>).
 * @param {Node} root
 */
export async function translateDomTextNodes(root) {
  if (!root) return false;
  const ownerDoc = root.ownerDocument || document;
  const cache = readCache();

  const walker = ownerDoc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const tag = node.parentElement && node.parentElement.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);

  let changed = false;
  const BATCH = 5; // petits lots pour rester raisonnable avec l'API gratuite
  for (let i = 0; i < nodes.length; i += BATCH) {
    const batch = nodes.slice(i, i + BATCH);
    await Promise.all(batch.map(async (node) => {
      const original = node.nodeValue;
      const translated = await translateOne(original, cache);
      if (translated && translated !== original) { node.nodeValue = translated; changed = true; }
    }));
  }
  if (changed) writeCache(cache);
  return changed;
}
