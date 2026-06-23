# Dojo Claude Code · eXalt Consulting

Repo support du **Promptathon 2025 eXalt**, un atelier de 2h30 pour passer de zéro à une feature prototypée sur une vraie codebase, sans écrire une ligne de code.

Basé sur une boutique mode en React.js + TypeScript, le repo sert de terrain de jeu pour explorer Claude Code comme partenaire technique.

## Démo en ligne

[dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)

## Programme de la session

| Horaire | Phase | Durée |
|---------|-------|-------|
| 00:00 | Setup | 10 min |
| 00:10 | Intro GitHub | 10 min |
| 00:20 | Phase 1 · Discovery | 30 min |
| 00:50 | Débrief collectif | 5 min |
| 00:55 | Phase 2 · Documentation | 30 min |
| 01:25 | Pause | 5 min |
| 01:30 | Phase 3 · Vibe Coding | 45 min |
| 02:15 | Pitches | 10 min |
| 02:25 | Clôture | 5 min |

## Setup en 3 étapes

1. **Fork** ce repo sur GitHub
2. **Ouvre** la boutique sur [dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)
3. **Connecte** Claude Code : [claude.ai/code](https://claude.ai/code) → Connect to GitHub → sélectionne ton repo forké

Boutique ouverte + Claude Code connecté = tu es prêt pour les phases 1 et 2. (Codespace uniquement en phase 3.)

## Les 3 phases

### Phase 1 · Discovery (30 min)

Explorer le produit comme si c'était ton premier jour de mission.

**Prompt de lancement :**
> Bonjour ! Je viens de rejoindre la mission eXalt en tant que consultant PM. C'est mon premier jour. Peux-tu me présenter le produit sur lequel je vais travailler ?

### Phase 2 · Documentation (30 min)

Produire des livrables PM avec Claude : User Journey Map, User Stories, Personas, Gap Analysis, MoSCoW.

**Prompt de lancement :**
> Génère une carte du parcours utilisateur complet pour la boutique eXalt, de la découverte du site à la livraison. Format tableau : étape / action utilisateur / émotion probable / point de friction potentiel.

### Phase 3 · Vibe Coding (45 min)

Prototyper une feature de ton choix, visible dans le navigateur, sans écrire une ligne de code.

**Idées de features :**
- Recherche temps réel
- Wishlist / favoris
- Notes et avis produits
- Filtre par prix
- Badge stock faible
- Section Nouveautés
- Pop-in de bienvenue
- Sélecteur de couleur

**Prompt de lancement :**
> Je veux prototyper [décris ta feature en 1-2 phrases]. Le problème utilisateur que ça résout : [décris le problème]. Avant de coder, dis-moi ce que tu vas faire et comment tu vas le faire.

## Stack technique

- React.js + TypeScript
- TailwindCSS
- Redux Toolkit
- JSON Server (mock API)
- Axios
- React Router
- React Hot Toast

## Lancer le projet en local

```bash
npm install
npm start
Pitch final (5 min par groupe)
La feature construite (une phrase)
Le problème utilisateur résolu
Démo live en partage d'écran
Ce que tu aurais fait différemment avec plus de temps
eXalt © 2025 · github.com/Clementmoro/dojo-shop-styledrop

---
Pour l'éditer directement sur GitHub : va sur [github.com/Clementmoro/dojo-shop-styledrop](https://github.com/Clementmoro/dojo-shop-styledrop), clique sur `README.md`, puis sur l'icône crayon en haut à droite. Tu peux aussi me dire de basculer sur le compte `Clementmoro` si tu veux que je le fasse automatiquement.
