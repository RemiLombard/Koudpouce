# 📘 Cahier des charges – Projet « Koudpouce »

## 1. Présentation générale du projet

### Nom du projet

**Koudpouce**

### Concept

Koudpouce est une plateforme web d’entraide locale permettant aux habitants d’une même ville ou d’un même quartier de demander ou proposer de l’aide pour des services simples du quotidien.

Le numérique est utilisé **uniquement comme un outil de mise en relation**, dont l’objectif final est de provoquer des **interactions humaines réelles et utiles**.

Exemples de services :

* aide pour porter un meuble
* arroser des plantes
* aide administrative
* aide pour un CV
* petits services ponctuels entre voisins

---

## 2. Vision, valeurs et philosophie (NON NÉGOCIABLE)

### Objectif principal

Recréer du lien humain local grâce au numérique, sans logique de réseau social.

### Valeurs fondamentales

* solidarité
* proximité
* simplicité
* confiance
* utilité concrète

### Le projet ne doit PAS :

* ressembler à un réseau social
* encourager l’exposition de soi
* valoriser la performance, la popularité ou la compétition
* introduire des mécaniques de gamification

### Principe clé

Le numérique est un **moyen**, jamais une **finalité**.

---

## 3. Utilisateurs cibles

* habitants d’une même ville ou d’un même quartier
* étudiants
* seniors
* personnes non expertes du numérique

Le site doit être :

* accessible
* rassurant
* intergénérationnel
* simple à comprendre dès la première visite

---

## 4. Contraintes UX / UI STRICTES

### UX (expérience utilisateur)

* interface volontairement simple
* parcours courts
* peu d’animations, mais utiles
* ton humain, bienveillant, non marketing

### UI (design)

* design doux, chaleureux, rassurant
* palette de couleurs sobres (pastel ou naturelles)
* typographie lisible et humaine
* icônes simples
* illustrations inclusives

### Interdictions formelles

* pas de dark patterns
* pas de pop-ups intrusifs
* pas de notifications agressives
* pas de jargon startup
* pas de surcharge visuelle

---

## 5. Stack technique (IMPOSÉE)

### Frontend

* Nuxt 3
* TypeScript
* Tailwind CSS

### Backend

* Express.js
* API REST

### Architecture

Monorepo avec séparation claire :

```
/coup-de-pouce
 ├── /frontend   → Nuxt 3
 ├── /backend    → Express
 └── /cms        → Sanity (optionnel)
```

### Règles techniques

* aucun framework CSS autre que Tailwind
* pas de backend serverless
* pas de solution propriétaire non justifiée
* code lisible, commenté et pédagogique

---

## 6. Fonctionnalités AUTORISÉES (périmètre verrouillé)

### Fonctionnalités obligatoires

* création de compte utilisateur
* connexion / déconnexion
* publication d’une **demande d’aide** OU d’une **proposition de service**
* consultation des annonces locales
* messagerie simple entre utilisateurs
* géolocalisation par zone (ville / quartier)

### Fonctionnalités EXCLUES

* fil d’actualité
* commentaires publics
* likes / réactions
* notation des utilisateurs
* profils sociaux détaillés
* algorithmes de recommandation complexes
* gamification (points, badges, classements)

⚠️ **Si une fonctionnalité n’est pas listée ici, elle ne doit PAS être ajoutée.**

---

## 7. Messagerie

* messagerie privée uniquement
* pas de temps réel obligatoire
* conversations simples
* objectif : permettre l’organisation d’une aide réelle

---

## 8. Géolocalisation

* géolocalisation approximative (ville/quartier)
* aucune précision à l’adresse exacte
* respect de la vie privée prioritaire

---

## 9. CMS (optionnel)

Sanity peut être utilisé uniquement pour :

* contenu éditorial
* page « Pourquoi Koudpouce ? »
* FAQ
* règles de bonne conduite
* textes informatifs

Le CMS ne doit PAS gérer :

* les utilisateurs
* les annonces
* les messages

---

## 10. Attentes concernant le travail de l’IA

### Règles générales

* travailler **étape par étape**
* expliquer chaque choix technique
* demander validation avant toute nouvelle fonctionnalité
* ne jamais ajouter de feature non demandée
* poser une question si une décision n’est pas explicitement définie

### Pour chaque fonctionnalité, fournir :

* structure des dossiers
* composants frontend
* routes API backend
* modèles de données
* commentaires clairs et pédagogiques

### Interdictions

* aucune génération « tout-en-un »
* aucun ajout de complexité inutile

---

## 11. Rôle de l’IA

L’IA agit comme :

* un **assistant de développement**
* un **outil de production encadré**

L’IA **ne décide pas seule** de la vision, des fonctionnalités ou de l’UX.

---

## 12. Objectif pédagogique du projet

Koudpouce est :

* un projet étudiant
* un projet de conception UX/UI
* un projet de développement web structuré
* un projet montrant un usage raisonné et réfléchi de l’IA

La priorité est :
**la clarté, la cohérence et le sens du projet**, pas la performance technique.

---

## 13. Instruction finale à l’IA (OBLIGATOIRE)

> Tu dois respecter strictement ce cahier des charges.
> Toute proposition en dehors de ce cadre doit être soumise à validation préalable.
> En cas de doute, tu dois poser une question.