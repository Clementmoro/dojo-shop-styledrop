# Dojo Claude Code · eXalt

> 2h30 pour passer de zéro à une feature prototypée et en ligne, sur une vraie codebase, sans écrire une ligne de code.

**Ta mission :** tu es consultant PM et c'est ton premier jour chez eXalt. Leur boutique de goodies attire du monde, mais elle ne vend pas. À toi de comprendre pourquoi, de le documenter, puis de prototyper une amélioration. Ton binôme technique : **Sam**, le tech lead de l'équipe (c'est Claude).

🛍️ **La boutique :** [dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)
📬 **Le brief client :** [`mission/BRIEF.md`](mission/BRIEF.md)
📊 **Les données :** [`mission/data/`](mission/data/)
🧭 **Le guide pas à pas :** [`GUIDE_PARTICIPANT.md`](GUIDE_PARTICIPANT.md)

---

## Le programme

| Horaire | Étape | Durée |
|---------|-------|-------|
| 00:00 | Setup | 10 min |
| 00:10 | Intro GitHub | 10 min |
| 00:20 | **Phase 1 · Discovery** : la chasse aux frictions | 35 min |
| 00:55 | Débrief de la chasse | 10 min |
| 01:05 | **Phase 2 · Documentation** : les livrables PM | 25 min |
| 01:30 | Pause | 5 min |
| 01:35 | **Phase 3 · Prototypage** : ta feature en ligne | 40 min |
| 02:15 | Pitchs | 10 min |
| 02:25 | Mise en prod live et clôture | 5 min |

## Setup en 3 étapes

1. **Accepte l'invitation GitHub** reçue par e-mail (tu deviens collaborateur du repo).
2. **Ouvre la boutique** : [dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)
3. **Ouvre Claude Code** sur [claude.ai/code](https://claude.ai/code) et choisis le repo `Clementmoro/dojo-shop-styledrop`.

Pas de terminal, pas de compte Vercel, pas d'installation.

## Les 3 phases

### 🔍 Phase 1 · Discovery
La boutique cache plusieurs frictions qui font fuir les clients, et les données en gardent la trace. Lis le brief, fouille le site, interroge les données avec Sam. Bonus : **3 secrets** sont cachés quelque part. Tous les moyens sont bons.

### 📋 Phase 2 · Documentation
Transforme ce que tu as trouvé en livrables PM : journey map, user stories, priorisation, recommandation à la sponsor.

### 🚀 Phase 3 · Prototypage
Choisis une amélioration et décris-la à Sam. Il la code sur ta **branche** (ton brouillon), la met en ligne et te donne ton lien de preview. La version officielle n'est pas touchée : à la fin, l'animateur choisit des protos à intégrer en prod.

## Comment c'est fait

- **Le code :** React + TypeScript, TailwindCSS, Redux Toolkit. Les données produits sont dans `src/data/db.json`.
- **L'hébergement :** Vercel. Chaque branche poussée sur GitHub obtient automatiquement sa propre URL de preview.
- **Le comportement de Sam :** tout est dans [`CLAUDE.md`](CLAUDE.md), la carte d'identité que Claude lit au démarrage. Va y jeter un œil : c'est un fichier texte qui pilote une IA.

## Lancer en local (optionnel, pour les curieux)

```bash
npm install
npm start
```

La boutique tourne sur `http://localhost:5173`.

---

eXalt © 2026 · Dojo Claude Code
