# Dictionnaire des données

Ces fichiers sont des exports bruts de l'outil analytics de la boutique, non retraités. Période couverte : du 1er juillet au 30 septembre 2026 (T3 2026). Montants en euros, séparateur virgule, décimales avec un point.

## funnel_quotidien.csv

Entonnoir de conversion quotidien, une ligne par jour, par appareil et par source de trafic.

- `date` : jour (AAAA-MM-JJ)
- `appareil` : type d'appareil (mobile ou desktop)
- `source` : source de trafic (direct, email, linkedin, google)
- `sessions` : nombre de visites sur la boutique
- `vues_produit` : sessions ayant consulté au moins une fiche produit
- `ajouts_panier` : sessions ayant ajouté au moins un produit au panier
- `vues_panier` : sessions ayant affiché la page panier
- `debuts_checkout` : sessions ayant cliqué pour passer commande depuis le panier
- `etape_livraison_ok` : sessions ayant validé l'étape livraison du tunnel de commande
- `etape_paiement_ok` : sessions ayant validé l'étape paiement
- `commandes` : commandes confirmées
- `ca_eur` : chiffre d'affaires des commandes confirmées

## produits_performance.csv

Performance cumulée de chaque produit du catalogue sur la période.

- `id` : identifiant produit
- `produit` : nom du produit
- `categorie` : catégorie du catalogue
- `prix_eur` : prix unitaire affiché
- `stock_actuel` : stock au moment de l'export (30 septembre)
- `vues_fiche` : nombre d'affichages de la fiche produit
- `ajouts_panier` : nombre d'ajouts au panier du produit
- `commandes` : nombre de commandes contenant le produit
- `ca_eur` : chiffre d'affaires généré par le produit

## recherches_internes.csv

Requêtes saisies dans le moteur de recherche de la boutique, cumulées sur la période.

- `requete` : texte recherché (normalisé en minuscules)
- `nb_recherches` : nombre de fois où la requête a été saisie
- `nb_resultats` : nombre de produits renvoyés par le moteur
- `taux_clic_pct` : part des recherches suivies d'un clic sur un résultat (en %)

## codes_promo.csv

Saisies dans le champ « code promo » du panier, agrégées par jour et par code saisi.

- `date` : jour (AAAA-MM-JJ)
- `code_saisi` : texte saisi par le client, tel quel
- `tentatives` : nombre de validations du code
- `succes` : nombre de validations acceptées
- `message_affiche` : message renvoyé au client par le site
