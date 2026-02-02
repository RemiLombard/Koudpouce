# Frontend Koudpouce

## Architecture

Frontend Nuxt 3 avec Tailwind CSS.

## Structure des pages

- `/` : Page d'accueil (choix demande/proposition)
- `/annonces` : Liste des annonces avec filtres
- `/annonces/nouveau` : Publier une annonce (authentifié)
- `/annonces/[id]` : Détail d'une annonce
- `/auth/login` : Connexion
- `/auth/register` : Inscription

## Composables

- `useAuth` : Gestion authentification (register, login, logout, fetchUser)
- `useListings` : Gestion annonces (fetch, filters, pagination, createListing)
- `useGeolocation` : Géolocalisation navigateur (optionnelle)

## Configuration API

Le frontend communique avec le backend via `runtimeConfig.public.apiBase` :

- Défaut : `http://localhost:3001`
- Override : variable env `NUXT_PUBLIC_API_BASE`

CORS est géré côté backend pour permettre les cookies HttpOnly (session).

## Lancement

```bash
npm run dev
```

Le serveur écoute sur http://localhost:3000

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
