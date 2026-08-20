// ── Configuration Firebase ─────────────────────────────────────
// Ces valeurs sont publiques par nature (visibles dans le navigateur de
// n'importe quel visiteur) : ce n'est pas un problème de sécurité.
// La vraie protection vient des règles Firestore (firestore.rules), qui
// empêchent l'écriture à quiconque n'est pas connecté avec le compte admin.
export const firebaseConfig = {
  apiKey: "AIzaSyBnrExDrJFyDnoDkztmhDcPg9W9ubTYBhE",
  authDomain: "portfolio-prisca-a1451.firebaseapp.com",
  projectId: "portfolio-prisca-a1451",
  storageBucket: "portfolio-prisca-a1451.firebasestorage.app",
  messagingSenderId: "216663386640",
  appId: "1:216663386640:web:b396bc9dc55aad46f87895"
};

// ── Configuration Cloudinary (upload d'images sans backend) ────
export const cloudinaryConfig = {
  cloudName: "gkthojrx",
  uploadPreset: "mon_portfolio"
};

// ── Email(s) autorisés à accéder à /admin ───────────────────────
export const ADMIN_EMAILS = [
  "djamilatoupriscasankara@gmail.com"
];
