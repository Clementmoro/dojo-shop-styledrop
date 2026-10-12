# 🧭 Guide participant · Dojo Claude Code

> Pas besoin de coder. Un navigateur, un compte GitHub et un compte Claude suffisent.

---

## Avant de commencer

**1. Accepte l'invitation GitHub.** Tu as reçu un e-mail « invited you to collaborate on Clementmoro/dojo-shop-styledrop ». Clique sur **Accept invitation**. C'est ce qui permettra à Sam de mettre ton prototype en ligne en Phase 3.

**2. Ouvre la boutique** dans un onglet : [dojo-shop-styledrop.vercel.app](https://dojo-shop-styledrop.vercel.app)

> 📺 Le brief de la sponsor client, Sophie, est projeté à l'écran. Garde-le en tête : c'est ta mission.

**3. Ouvre Claude Code** dans un autre onglet : [claude.ai/code](https://claude.ai/code). Connecte GitHub si on te le demande, puis choisis le repo **`Clementmoro/dojo-shop-styledrop`**.

**4. Dis bonjour à Sam :**

```
Bonjour ! Je m'appelle [ton prénom], je suis consultant PM et c'est mon premier jour
sur la mission eXalt. Tu peux me présenter le produit ?
```

Sam, c'est Claude dans le rôle du tech lead de l'équipe. Il a lu tout le code et toutes les données. Il termine chaque réponse par des **👉 Pistes** : si tu ne sais pas quoi demander, copie-en une.

---

## 🔍 Phase 1 · Discovery (35 min)

**L'objectif :** répondre à la question de la sponsor client, « où est-ce qu'on perd nos clients ? ».

La boutique cache **plusieurs frictions**, et les données du trimestre en gardent la trace. Tu as trois terrains de jeu :

| Terrain | Où | Pour quoi faire |
|---|---|---|
| Le brief | `mission/BRIEF.md` | Comprendre ce que veut le client et ses KPIs |
| Le site | La boutique en ligne | Vivre le parcours comme un vrai client |
| Les données | `mission/data/` | Prouver avec des chiffres ce que tu ressens sur le site |

**Pour démarrer :**

```
Lis le brief de Sophie dans mission/BRIEF.md et résume-moi ce qu'elle attend de moi.
```

```
Les données sont illisibles en CSV : fais-moi un dashboard du trimestre pour voir
où on perd les clients.
```

> 📊 Le dashboard est fait pour **toi** : demande à Sam de l'adapter à ta question (« ajoute le mobile », « par semaine », « seulement les visiteurs venus par email »).

```
Dans les données du funnel, à quelle étape on perd le plus de monde ? Et sur mobile ?
```

```
Je vais passer une commande complète sur le site. Dis-moi quoi regarder à chaque étape.
```

```
Une autre promo de consultants est passée sur cette boutique avant moi.
Qu'est-ce qu'ils ont ajouté, et où je peux le voir sur GitHub ?
```

**Le bon réflexe :** une intuition sur le site, une preuve dans la donnée. « Le total me paraît cher » devient « la chute panier → checkout est de X % ».

### 🥚 Bonus : les 3 secrets

En plus des frictions, 3 secrets sont cachés dans la boutique. Sam sait où ils sont mais ne te le dira pas : au mieux, un indice. Un bon PM regarde là où les utilisateurs ne regardent jamais…

### 📝 Ton carnet de chasse

Note ce que tu trouves, on fait le décompte au débrief.

| # | Ce que j'ai trouvé | Où (site, donnée, code) | La preuve chiffrée |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |

Features de la promo précédente retrouvées : ____ / 6

Secrets trouvés : ☐ ☐ ☐

---

## 📋 Phase 2 · Documentation (25 min)

Transforme ta chasse en livrables. Choisis-en 2, génère un premier jet, puis itère au moins 2 fois.

```
À partir de ce qu'on a trouvé ensemble, fais-moi une journey map de l'acheteur :
étape, action, émotion, friction, preuve dans les données.
```

```
Priorise les frictions trouvées avec une matrice impact / effort,
et propose 3 quick wins avant le Drop #2 du 20 novembre.
```

```
Rédige les user stories des 3 quick wins, avec critères d'acceptation.
```

```
Écris la réponse à Sophie : un mail de 15 lignes avec le diagnostic et la recommandation.
```

> 💬 Sam fait le premier jet. Le jugement, c'est toi : corrige ce qui est faux, ajoute ce que tu as vu.

---

## 🚀 Phase 3 · Prototypage (50 min)

Choisis une amélioration (idéalement un de tes quick wins) et décris-la à Sam :

```
Je m'appelle [ton prénom]. Je veux prototyper [ta feature en 1 ou 2 phrases].
Le problème que ça résout : [le problème].
```

**Ce qui va se passer :**
1. Sam crée ta **branche** : ton brouillon, la version officielle du site n'est pas touchée.
2. Il code, puis **sauvegarde** (commit) et **envoie sur GitHub** (push).
3. Vercel construit ta version en 1 à 2 minutes. Sam te donne ton lien : 🔗 **ton prototype est en ligne**.
4. Tu testes, tu demandes des ajustements, Sam met à jour. À chaque fois, un nouveau lien.

**Idées si tu sèches :** corriger ce que tu as trouvé en Phase 1, ou ajouter une wishlist, des avis clients, une alerte « prévenez-moi du retour en stock », une section nouveautés, un guide des tailles…

> ⚠️ Ne demande jamais à Sam de toucher à `main` : la mise en prod, c'est l'animateur qui la fait.

---

## 🚢 Mise en prod en continu (à partir de 01:55)

**Ton proto te plaît ?** Dis à Sam :

```
Mon proto est prêt, je veux le proposer pour la prod.
```

Sam met ta branche à jour, puis te donne un lien de **Pull Request**. Ouvre-le, clique sur **Create pull request** : c'est ta demande de mise en prod.

**L'animateur merge et annonce :** « Nouvelle feature en prod ! » sans dire laquelle. Tout le monde la cherche sur [la boutique](https://dojo-shop-styledrop.vercel.app).

**Le premier qui la trouve** désigne son auteur, qui la pitche en 1 minute, debout :
1. **La friction** de départ
2. **La feature** en une phrase
3. **Ton brief** à Sam
4. **La suite** : ce que tu ferais ensuite

Ton proto n'est pas mergé à temps ? Tu montres ton lien de preview pendant la clôture.

---

## En cas de pépin

| Problème | Solution |
|---|---|
| Je ne vois pas le repo dans Claude Code | Vérifie que tu as accepté l'invitation GitHub, puis recharge |
| Sam dit qu'il ne peut pas pousser | Appelle l'animateur (invitation pas encore acceptée ?) |
| Mon lien de preview ne marche pas | Demande à Sam : « Le lien ne marche pas, tu peux vérifier ? » |
| Je suis perdu | Demande à Sam : « Je suis perdu, on en est où et je fais quoi maintenant ? » |

---

*Dojo Claude Code · eXalt*
