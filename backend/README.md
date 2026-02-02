# Backend Koudpouce

## Architecture

Le backend utilise Express + sessions HttpOnly pour l'authentification.

### Persistance des données

**La "base de données" se trouve ici : `backend/data/db.json`**

C'est un fichier JSON qui stocke :

- Les utilisateurs (avec mots de passe hashés bcrypt)
- Les annonces (demandes/propositions)

Le fichier est créé automatiquement au premier lancement si absent.

⚠️ **MVP seulement** : pour un environnement de production, remplacer par une vraie base (PostgreSQL, MongoDB, etc.).

### Structure de `db.json`

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "passwordHash": "$2a$10$...",
      "displayName": "Nom affiché",
      "createdAt": "2026-01-27T10:00:00.000Z",
      "updatedAt": "2026-01-27T10:00:00.000Z"
    }
  ],
  "listings": [
    {
      "id": "uuid",
      "type": "demande",
      "status": "active",
      "title": "Titre",
      "description": "Description",
      "serviceTypeIds": ["COURSES"],
      "cityName": "Paris",
      "departmentCode": "75",
      "createdByUserId": "uuid",
      "createdAt": "2026-01-27T10:00:00.000Z",
      ...
    }
  ]
}
```

### Confidentialité

Les champs sensibles (`addressRaw`, `geoLatRounded`, `geoLngRounded`) sont stockés dans `db.json` mais **jamais exposés** via l'API (mappers publics).

## Lancement

```bash
npm run dev
```

Le serveur écoute sur http://localhost:3001
