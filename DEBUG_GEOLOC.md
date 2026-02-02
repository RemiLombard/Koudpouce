# Tests de débogage - Géolocalisation

## Comment tester

1. **Ouvrir la console du navigateur** (F12)
2. **Aller sur `/annonces`**
3. **Observer les logs dans la console**

## Logs à surveiller

### Lors de la recherche de ville

Quand vous tapez "Paris" dans le champ de recherche :

```
🔍 debouncedSearch appelé, query: Pa
🔍 debouncedSearch appelé, query: Par
🔍 debouncedSearch appelé, query: Pari
🌐 Appel API geo.gouv.fr...
✅ Résultats reçus: 10 villes
```

### Lors de la sélection d'une ville

```
📍 Ville sélectionnée: { nom: "Paris", code: "75056", ... }
📤 Émission selection: { type: "city", lat: 48.8566, lng: 2.3522, radius: 10 }
🔍 LocationFilter change: { type: "city", lat: 48.8566, lng: 2.3522, radius: 10 }
🎯 Filtres appliqués: { type: "...", lat: 48.8566, lng: 2.3522, radius: 10 }
🌐 Query params: type=...&aroundLat=48.8566&aroundLng=2.3522&radiusKm=10&offset=0&limit=10
```

### Lors du changement de rayon

```
📤 Émission selection: { type: "city", lat: 48.8566, lng: 2.3522, radius: 20 }
🔍 LocationFilter change: { type: "city", lat: 48.8566, lng: 2.3522, radius: 20 }
🎯 Filtres appliqués: { type: "...", lat: 48.8566, lng: 2.3522, radius: 20 }
🌐 Query params: type=...&aroundLat=48.8566&aroundLng=2.3522&radiusKm=20&offset=0&limit=10
```

## Vérifications à faire

### ✅ Checklist Frontend

- [ ] Le champ de recherche accepte la saisie
- [ ] Les logs "🔍 debouncedSearch appelé" apparaissent quand on tape
- [ ] L'API geo.gouv.fr est appelée (log "🌐 Appel API")
- [ ] Les résultats s'affichent dans le dropdown
- [ ] On peut cliquer sur une ville
- [ ] Le mode change (affichage "📍 Paris" avec sélecteur de rayon)
- [ ] Les changements de rayon déclenchent un reload
- [ ] Les paramètres `aroundLat`, `aroundLng`, `radiusKm` sont dans l'URL de l'API

### ✅ Checklist Backend

Vérifier dans la console backend (terminal) :

```bash
cd backend
npm run dev
```

Observer les requêtes :

- `GET /api/listings?...&aroundLat=48.8566&aroundLng=2.3522&radiusKm=10`

### ❌ Problèmes potentiels

#### Le champ ne réagit pas

- Vérifier que `v-model="searchQuery"` fonctionne
- Vérifier les erreurs console

#### Pas de résultats de l'API

- L'API geo.gouv.fr est-elle accessible ?
- Test manuel : https://geo.api.gouv.fr/communes?nom=Paris&fields=nom,code,codeDepartement,centre&limit=5

#### Le filtre ne s'applique pas

- Vérifier que `onLocationChange` est appelé
- Vérifier que les filtres contiennent bien `lat`, `lng`, `radius`
- Vérifier que `buildQueryParams` génère les bons noms de paramètres

#### Les annonces ne sont pas filtrées

- Vérifier côté backend que `filters.aroundLat`, `filters.aroundLng`, `filters.radiusKm` sont bien reçus
- Vérifier que `findListings` utilise bien ces filtres
- Vérifier qu'il existe des annonces avec des coordonnées géocodées

## Commandes utiles

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev

# Tester l'API geo.gouv.fr directement
curl "https://geo.api.gouv.fr/communes?nom=Paris&fields=nom,code,codeDepartement,centre&limit=5"
```
