# Guide de style - Koudpouce

## Palette de couleurs

### Couleurs principales (Orange/Amber)

Le site utilise **exclusivement** les teintes orange et amber pour maintenir une identité visuelle cohérente et chaleureuse.

#### Orange (Couleur primaire)

- **Usage** : Éléments principaux, CTAs, header, boutons d'action
- **Classes Tailwind** : `orange-50` à `orange-800`
- **Exemples** :
  - Header : `from-amber-500 via-orange-500 to-amber-600`
  - Boutons primaires : `from-orange-500 to-amber-500`
  - Textes importants : `text-orange-600`, `text-orange-700`

#### Amber (Couleur secondaire)

- **Usage** : Accents, dégradés, arrière-plans subtils
- **Classes Tailwind** : `amber-50` à `amber-700`
- **Exemples** :
  - Arrière-plans : `from-orange-50 via-amber-50 to-yellow-50`
  - Badges : `from-orange-100 to-amber-100`

#### Rouge/Orange (Pour les "demandes")

- **Usage** : Différencier les demandes d'aide
- **Classes Tailwind** : `red-50` à `red-700` + orange
- **Exemples** :
  - Badge demande : `from-red-500 to-orange-500`
  - Section demandes : `text-red-700`, `border-red-200`

### Couleurs neutres (Stone)

- **Usage** : Textes, bordures, éléments secondaires
- **Classes Tailwind** : `stone-50` à `stone-800`
- **Exemples** :
  - Textes principaux : `text-stone-800`
  - Textes secondaires : `text-stone-600`, `text-stone-500`
  - Bordures : `border-stone-200`

## ❌ Couleurs à éviter

**Ne jamais utiliser** :

- Bleu (blue, cyan, sky)
- Vert (green, emerald, teal)
- Violet (purple, indigo)
- Rose (pink)

Ces couleurs brisent l'identité visuelle du site.

## Correspondances type/couleur

### Demande d'aide (type: "demande")

- **Badge** : `from-red-500 to-orange-500`
- **Bordure carte** : `border-red-200`
- **Titre section** : `text-red-700`
- **Bouton CTA** : `from-red-500 to-orange-500`

### Proposition de service (type: "proposition")

- **Badge** : `from-orange-500 to-amber-500`
- **Bordure carte** : `border-orange-200`
- **Titre section** : `text-orange-700`
- **Bouton CTA** : `from-orange-500 to-amber-500`

## Variables CSS

Les variables CSS sont définies dans `/app/assets/css/main.css` :

```css
/* Couleurs primaires */
--color-primary-500: rgb(249 115 22); /* orange-500 */
--color-primary-600: rgb(234 88 12); /* orange-600 */

/* Couleurs secondaires */
--color-secondary-500: rgb(245 158 11); /* amber-500 */
--color-secondary-600: rgb(217 119 6); /* amber-600 */

/* Demandes */
--color-demande-500: rgb(239 68 68); /* red-500 */
--color-demande-700: rgb(185 28 28); /* red-700 */

/* Propositions (= primaire) */
--color-proposition-500: var(--color-primary-500);
--color-proposition-700: var(--color-primary-700);
```

## Typographie

### Tailles

- **Petit** : `text-xs` (12px), `text-sm` (14px)
- **Normal** : `text-base` (16px)
- **Moyen** : `text-lg` (18px), `text-xl` (20px)
- **Grand** : `text-2xl` (24px), `text-3xl` (30px), `text-4xl` (36px)
- **Très grand** : `text-5xl` (48px), `text-6xl` (60px)

### Poids

- **Normal** : `font-normal` (400)
- **Medium** : `font-medium` (500)
- **Semibold** : `font-semibold` (600)
- **Bold** : `font-bold` (700)
- **Extrabold** : `font-extrabold` (800)

## Espacements

Utilisez les classes Tailwind standard :

- **Petit** : `p-2`, `px-4`, `py-2`, `gap-2`
- **Moyen** : `p-4`, `px-6`, `py-4`, `gap-4`
- **Grand** : `p-6`, `px-8`, `py-6`, `gap-6`
- **Très grand** : `p-8`, `px-12`, `py-8`, `gap-8`

## Bordures et arrondis

### Arrondis

- **Petit** : `rounded-lg` (8px)
- **Moyen** : `rounded-xl` (12px)
- **Grand** : `rounded-2xl` (16px)
- **Très grand** : `rounded-3xl` (24px)
- **Cercle** : `rounded-full`

### Bordures

- **Fine** : `border` (1px)
- **Moyenne** : `border-2` (2px)
- **Épaisse** : `border-3` (3px) - si disponible, sinon `border-4`

## Ombres

- **Petite** : `shadow-md`
- **Moyenne** : `shadow-lg`
- **Grande** : `shadow-xl`
- **Très grande** : `shadow-2xl`

## Exemples de composants

### Bouton primaire

```html
<button
  class="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
>
  Action
</button>
```

### Carte

```html
<div
  class="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg hover:shadow-xl transition-all"
>
  Contenu
</div>
```

### Badge

```html
<span
  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
>
  Label
</span>
```

## Transitions et animations

Utilisez toujours `transition-all` pour des animations fluides :

```html
class="... hover:scale-105 transition-all duration-300"
```

## Bonnes pratiques

1. **Cohérence** : Utiliser toujours les mêmes couleurs pour les mêmes types d'éléments
2. **Contraste** : S'assurer que le texte est lisible sur les arrière-plans
3. **Accessibilité** : Respecter les ratios de contraste WCAG (AA minimum)
4. **Modération** : Ne pas surcharger avec trop de couleurs différentes
5. **Variables** : Utiliser les variables CSS pour les valeurs réutilisées
6. **Documentation** : Commenter les choix de couleurs dans le code

## Checklist avant commit

- [ ] Pas de couleurs bleu/vert/violet/rose
- [ ] Les demandes utilisent rouge/orange
- [ ] Les propositions utilisent orange/amber
- [ ] Les textes ont un bon contraste
- [ ] Les espacements sont cohérents
- [ ] Les arrondis correspondent aux standards du site
