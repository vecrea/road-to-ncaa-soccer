# ⚽ Road to NCAA — Soccer

Application web pour aider **Nicolas** (footballeur belge 🇧🇪) à trouver l'**université américaine idéale**
pour jouer au **foot masculin en NCAA** tout en étudiant.

Chaque université reçoit un **score de compatibilité (0-100)** calculé selon ton profil, plus une
catégorie de recrutement **Réaliste / Objectif / Ambitieux**.

> **MVP.** Critères actuels : **Football** (force du programme) · **Ambiance** · **Coût**.
> D'autres critères seront ajoutés ensuite.

## ✨ Ce que fait l'app

- **Tableau de bord** : objectif rentrée, compte à rebours, prochaines actions, indicateurs, shortlist.
- **Classement** des universités de foot masculin (D1/D2/D3) par score de compatibilité, avec filtres,
  comparateur et favoris ⭐.
- **Mes stats** : profil joueur (poste, pied, physique), **stats par saison** (club, matchs, buts, passes)
  et **palmarès** — éditable, 100 % dans ton navigateur.
- **Ma présentation** (pour les coachs) : message perso, Instagram, profil + graphique de stats, contact,
  et un **lien partageable** qui contient tes infos.
- **Ma fiche** : fiche de recrutement exportable en **PDF**.
- **Bourses** : potentiel de bourse par fac (foot = sport « à équivalence », ~9,9 bourses D1 partagées).
- **Budget**, **GPA**, **carnet de coachs**, **démarches** (calendrier NCAA / visa), **Assistant IA**.
- **FR / EN**, **mode sombre**, et dates au format US en anglais.

## 🚀 Lancer en local

```bash
npm install
npm run dev      # ouvre l'URL affichée
npm run build    # génère dist/
npm run preview  # sert le build
```

## 🌐 Mise en ligne

Un workflow GitHub Actions est prêt (`.github/workflows/deploy.yml`). Une fois le code poussé sur `main` :

1. GitHub → **Settings → Pages** → **Source : GitHub Actions**.
2. L'app se déploie automatiquement à `https://<utilisateur>.github.io/road-to-ncaa-soccer/`.

## ⚠️ Données

La sélection d'universités, les conférences, les coachs, les coûts et la force des programmes de foot
sont des **estimations indicatives**, à vérifier sur les rosters / sites officiels avant tout contact.

## 🧱 Stack

React + Vite + Tailwind CSS v4. Aucune donnée envoyée à un serveur (tout reste dans le navigateur).
