# Koudpouce

Plateforme d'entraide de proximité : publication de demandes et propositions de services entre voisins.

## Structure du projet

```
koudpouce/
├── backend/          # API Express (REST)
│   ├── data/         # 📁 BDD (db.json) — fichier JSON persistant
│   └── src/
├── frontend/         # Interface Nuxt 3
│   └── app/
└── package.json      # Monorepo (workspaces)
```

## Où se trouve la base de données ?

**`backend/data/db.json`** — Fichier JSON créé automatiquement.

Contient :

- Utilisateurs (emails, mots de passe hashés, displayName)
- Annonces (demandes/propositions avec géolocalisation)

⚠️ **MVP uniquement** : pour production, migrer vers PostgreSQL ou MongoDB.

## Installation

```bash
npm install
```

## Lancement (développement)

**Terminal 1 - Backend :**

```bash
npm run dev:backend
```

→ http://localhost:3001

**Terminal 2 - Frontend :**

```bash
npm run dev:frontend
```

→ http://localhost:3000

## Fonctionnalités

### Déjà implémenté ✅

- **Authentification** : inscription, connexion, sessions HttpOnly
- **Annonces** : publication (demande/proposition), consultation, filtres
- **Géolocalisation** : géocodage automatique + fallback manuel
- **Persistance** : stockage JSON sur disque (backend/data/db.json)
- **Navigation claire** : header avec liens Annonces/Publier

### Prochaines étapes 🚀

- Migration vers base relationnelle (Prisma + SQLite/PostgreSQL)
- Messagerie entre utilisateurs (conversations privées)
- Notifications (email ou push)
- Modération des annonces
- Système de notation/avis

## Sécurité et confidentialité

- Mots de passe hashés (bcrypt)
- Sessions HttpOnly (pas de JWT en localStorage)
- **Adresses privées** : jamais exposées via l'API (seule ville/département affichés)
- CORS configuré pour accepter uniquement localhost en dev

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les conventions de code et le workflow Git.

## Licence

Projet personnel — tous droits réservés (pour le moment).
