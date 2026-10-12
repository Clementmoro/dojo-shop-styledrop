# eXalt Store

La boutique officielle des goodies eXalt : vêtements, accessoires, papeterie et éditions limitées, pour les consultants, les clients et les nouveaux arrivants.

🛍️ **Production :** [dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)
📦 **Dernière version :** [Releases](https://github.com/Clementmoro/dojo-shop-styledrop/releases)

---

## Fonctionnalités

| Parcours | Ce que fait la boutique |
|---|---|
| **Découverte** | Home avec sélection et collections, quiz « Ton univers en 30 sec » qui recommande 3 produits |
| **Catalogue** | 4 collections (Vêtements, Accessoires, Papeterie, Édition limitée), tri par prix et popularité, recherche |
| **Fiche produit** | Description, taille, couleur, quantité, indicateur de stock, date de livraison estimée |
| **Panier** | Récapitulatif, code promo, frais de livraison et TVA |
| **Checkout** | Parcours en 3 étapes (livraison, paiement, confirmation), mode cadeau, validation de la carte bancaire |
| **Compte** | Inscription, connexion, profil, historique de commandes, suivi de commande en invité |

## Stack technique

- **Front :** React 18, TypeScript, Vite
- **Style :** TailwindCSS
- **State :** Redux Toolkit
- **Routing :** React Router 6
- **API :** fonctions serverless Vercel (`api/`) en production, `json-server` en local, sur la même base `src/data/db.json`
- **Hébergement :** Vercel, avec un déploiement de preview par branche

## Démarrer en local

Prérequis : Node.js 20 ou plus.

```bash
npm install
npm start
```

- Boutique : `http://localhost:5173`
- API mock : `http://localhost:3000` (les appels `/api/*` du front y sont redirigés par Vite)

### Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Lance la boutique et l'API mock en parallèle |
| `npm run dev` | Lance seulement le front |
| `npm run build` | Vérifie les types et construit la version de production |
| `npm run lint` | Analyse le code avec ESLint |

## Structure du projet

```
├── api/                 Fonctions serverless (products, orders, users)
├── public/              Images produits, favicon, robots.txt
├── src/
│   ├── components/      Composants d'interface (header, cartes produit, quiz…)
│   ├── pages/           Une page par route (home, shop, produit, panier, checkout…)
│   ├── features/        Slices Redux (panier, authentification, catalogue)
│   ├── utils/           Formatage, validation des formulaires, codes promo
│   └── data/db.json     Catalogue, commandes et utilisateurs de démo
├── mission/             Brief et exports analytics (voir section Dojo)
└── scripts/             Outillage (récupération des URLs de preview)
```

## API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/products` | Liste du catalogue |
| `GET` | `/api/products/:id` | Détail d'un produit |
| `GET` `POST` | `/api/orders` | Liste et création de commandes |
| `GET` | `/api/orders/:id` | Détail d'une commande |
| `GET` `POST` | `/api/users` | Liste et création de comptes |
| `GET` `PUT` | `/api/users/:id` | Détail et mise à jour d'un profil |

> En production, les écritures (commandes, comptes) ne sont pas persistées : c'est une boutique de démonstration.

## Contribuer

1. Crée une branche depuis `main` : `feature/<sujet>` ou `proto/<prénom>-<sujet>`.
2. Pousse ta branche : Vercel publie automatiquement une **URL de preview**, visible sur le commit dans GitHub.
3. Ouvre une **Pull Request** vers `main` avec ce que fait la feature et le problème qu'elle résout.
4. Après relecture, la PR est mergée et la production se met à jour en 1 à 2 minutes.

`main` est la version en production : on n'y pousse jamais directement.

## Historique

| Version | Date | Contenu |
|---|---|---|
| [v1.1](https://github.com/Clementmoro/dojo-shop-styledrop/releases/tag/v1.1) | mai 2026 | Mode cadeau, quiz d'accueil, stepper du checkout, gestion du stock, validation CB |
| [v1.0](https://github.com/Clementmoro/dojo-shop-styledrop/releases/tag/v1.0) | avril 2026 | Lancement de la boutique |

Le détail de chaque évolution est dans l'onglet [Commits](https://github.com/Clementmoro/dojo-shop-styledrop/commits/main).

---

## 🥋 Dojo Claude Code

Ce repo sert aussi de terrain de jeu au **Dojo Claude Code** d'eXalt : un atelier de 2h30 où des consultants PM/PO découvrent la boutique comme au premier jour d'une mission, puis la font évoluer avec Claude, sans écrire de code.

| Pour… | Ouvre |
|---|---|
| Suivre l'atelier pas à pas | [`GUIDE_PARTICIPANT.md`](GUIDE_PARTICIPANT.md) |
| Lire le brief du client | [`mission/BRIEF.md`](mission/BRIEF.md) |
| Explorer les données | [`mission/data/`](mission/data/) |
| Voir comment Claude est briefé | [`CLAUDE.md`](CLAUDE.md) |

**Le programme :** setup et intro GitHub, puis Discovery (la chasse aux frictions), Documentation, et Prototypage avec mises en prod en continu.

Chaque session laisse sa trace : les features mergées pendant l'atelier rejoignent la release suivante.

---

eXalt © 2026
