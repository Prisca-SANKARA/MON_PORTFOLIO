# Setup — Rendre le portfolio dynamique

Ton site reste un site statique (HTML/CSS/JS, aucun build). Firestore stocke
les données (projets/articles/expériences), Cloudinary stocke les images.
Tu gères tout depuis `/admin`, sans jamais toucher au code ni redéployer.

## 1. Créer le projet Firebase

1. Va sur https://console.firebase.google.com > **Ajouter un projet**
2. Nomme-le (ex: `portfolio-prisca`), désactive Google Analytics (pas utile ici)
3. Une fois créé : **Créer une application Web** (icône `</>`) — donne-lui un nom, pas besoin de Firebase Hosting
4. Copie l'objet `firebaseConfig` affiché (apiKey, authDomain, projectId, etc.)
5. Colle ces valeurs dans `js/firebase-config.js` à la place des `"REMPLACE_MOI"`

## 2. Activer Firestore

1. Dans la console Firebase > **Firestore Database** > **Créer une base**
2. Mode production, région Europe (`eur3` ou `europe-west`) recommandée
3. Une fois créée, va dans l'onglet **Règles** et remplace tout par le contenu du fichier `firestore.rules` fourni ici
4. Publie les règles

## 3. Activer l'authentification (pour toi uniquement)

1. Dans la console Firebase > **Authentication** > **Sign-in method**
2. Active **Email/Mot de passe**
3. Onglet **Users** > **Ajouter un utilisateur** : mets ton email (`djamilatoupriscasankara@gmail.com`) et un mot de passe fort
4. C'est ce compte que tu utiliseras pour te connecter sur `/admin`

## 4. Créer le compte Cloudinary (upload d'images sans backend)

1. Va sur https://cloudinary.com > crée un compte gratuit
2. Dashboard > note ton **Cloud name**
3. Settings (⚙️) > **Upload** > **Add upload preset**
   - Signing Mode : **Unsigned**
   - Folder : `portfolio` (optionnel, déjà géré dans le code)
   - Sauvegarde et note le **nom du preset**
4. Colle Cloud name + preset dans `js/firebase-config.js` (`cloudinaryConfig`)

## 5. Importer tes projets/articles/expériences actuels

1. Ouvre `admin/index.html` dans ton navigateur (ou lance `npm run admin`)
2. Connecte-toi avec le compte créé à l'étape 3
3. Clique sur **"Importer les données du site"** (en haut à droite) — une seule fois
4. Ça copie tout ce qui existe déjà dans `js/data/*.js` vers Firestore
5. Ensuite, gère tout depuis l'admin : ajouter, modifier, supprimer, changer une image

## 6. Vérifier que ça marche

1. `npm run dev` pour lancer le site en local
2. Ouvre `http://localhost:5500`
3. Ouvre la console navigateur (F12) — tu ne devrais voir aucune erreur Firebase
4. Ajoute un projet test depuis `/admin`, rafraîchis le site : il doit apparaître sans redeploy

## Notes importantes

- Les clés dans `firebase-config.js` sont **publiques par nature** (visibles dans le navigateur de n'importe quel visiteur) — ce n'est pas un problème de sécurité, la vraie protection vient des règles Firestore (`firestore.rules`), qui empêchent l'écriture à quiconque n'est pas connecté avec ton compte autorisé.
- Le site continue de fonctionner même si Firestore est indisponible : les données statiques dans `js/data/*.js` servent de secours.
- Après le premier import, tu peux garder `js/data/*.js` comme sauvegarde, mais toute modification future se fait uniquement via `/admin`.
