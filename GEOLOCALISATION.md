# Système de géolocalisation - Koudpouce

## Vue d'ensemble

Le système de géolocalisation permet aux utilisateurs de filtrer les annonces par localisation de 2 façons :

1. **Recherche par ville/département** (avec autocomplétion)
2. **"Autour de moi"** (géolocalisation GPS)

Dans les deux cas, l'utilisateur peut affiner avec un **rayon de recherche** (5, 10, 20 ou 50 km).

## Architecture

### Frontend

#### Composant `LocationFilter.vue`

Composant principal de filtrage spatial avec :

- **Recherche de ville** : Utilise l'API geo.gouv.fr (gratuite) pour l'autocomplétion
- **Bouton "Autour de moi"** : Déclenche la demande de géolocalisation
- **Sélecteur de rayon** : 5, 10, 20, 50 km
- **Réinitialisation** : Permet de revenir à la recherche sans filtre spatial

#### Composable `useGeolocation.ts`

Gère la géolocalisation avec :

- Demande de permission respectueuse
- Stockage du consentement en localStorage
- États réactifs (idle, pending, granted, denied)

#### Type `ListingPublic`

Inclut maintenant un champ optionnel `distanceKm` calculé par le backend.

### Backend

#### Route GET `/api/listings`

Accepte les paramètres suivants pour le filtrage spatial :

- `aroundLat` : Latitude du point central (nombre)
- `aroundLng` : Longitude du point central (nombre)
- `radiusKm` : Rayon de recherche en km (5, 10, 20 ou 50)

#### Modèle `Listing`

- **Fonction `findListings`** : Filtre les annonces par distance
- **Fonction `calculateDistances`** : Calcule les distances depuis un point de référence
- **Tri intelligent** :
  - Avec géoloc : Tri par distance croissante (les plus proches en premier)
  - Sans géoloc : Tri par date décroissante (les plus récentes en premier)

#### Mapper `toListingPublic`

Enrichit les annonces avec la distance calculée (si applicable).

## Utilisation

### API geo.gouv.fr

Endpoint : `https://geo.api.gouv.fr/communes`

Paramètres utilisés :

- `nom` : Nom de la ville recherchée
- `fields` : Champs à récupérer (nom, code, codeDepartement, centre)
- `boost` : Tri par population
- `limit` : Nombre max de résultats

Réponse type :

```json
[
  {
    "nom": "Paris",
    "code": "75056",
    "codeDepartement": "75",
    "centre": {
      "coordinates": [2.3522, 48.8566]
    }
  }
]
```

### Affichage des distances

Dans `ListingCard.vue`, la distance est affichée si disponible :

```vue
{{ listing.cityName }} ({{ listing.departmentCode }})
<span v-if="listing.distanceKm !== undefined">
  • {{ listing.distanceKm }} km
</span>
```

## Workflow utilisateur

1. **L'utilisateur arrive sur `/annonces`**
   - Par défaut, aucun filtre spatial n'est actif
   - Les annonces sont triées par date

2. **L'utilisateur clique sur le filtre de localisation**
   - Option A : Il tape une ville (ex: "Paris")
     - Autocomplétion avec l'API geo.gouv.fr
     - Sélection de la ville
   - Option B : Il clique sur "Autour de moi"
     - Demande de géolocalisation
     - Si acceptée, coordonnées récupérées

3. **Sélection du rayon**
   - Par défaut : 10 km
   - Choix : 5, 10, 20, 50 km

4. **Résultats**
   - Annonces filtrées dans le rayon choisi
   - Triées par distance croissante
   - Distance affichée sur chaque carte

5. **Réinitialisation**
   - Bouton ✕ pour revenir au mode sans filtre spatial
   - Retour au tri par date

## Considérations de sécurité

### Données privées

Les coordonnées GPS exactes des annonces (`geoLatRounded`, `geoLngRounded`) ne sont **JAMAIS** exposées via l'API publique.

Seules les informations suivantes sont publiques :

- Ville (nom)
- Département (code)
- Distance calculée (si recherche spatiale active)

### Géolocalisation utilisateur

- Demande de permission explicite
- Coordonnées stockées uniquement côté client (jamais envoyées au serveur)
- Utilisées uniquement pour le filtrage des annonces

## Améliorations futures

### Court terme

- [ ] Géocoder les villes sélectionnées pour obtenir les coordonnées exactes
- [ ] Ajouter des départements dans l'autocomplétion
- [ ] Afficher un marqueur visuel "📍 Recherche active : 10 km autour de Paris"

### Moyen terme

- [ ] Carte interactive avec visualisation des annonces
- [ ] Filtrage par zone dessinée sur la carte
- [ ] Sauvegarde des recherches favorites

### Long terme

- [ ] Notifications pour les nouvelles annonces dans un rayon défini
- [ ] Suggestions de villes/départements basées sur l'historique
- [ ] API de géocodage inverse (coordonnées → ville)
