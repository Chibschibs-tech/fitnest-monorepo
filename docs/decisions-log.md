# FitNest — Journal des décisions

Ce fichier ne fait que s'ajouter. Chaque entrée porte sa date, sa raison, et ce qu'elle remplace le cas échéant. C'est la matière première du white paper.

Format : `#` numéro · date · décision · raison · remplace.

---

## Août 2026

### D-001 · 21 août · Méthode Spec-Driven Development
Adoption de la méthode Spec-Kit (GitHub) pour le développement : constitution → specify → clarify → plan → tasks → analyze → implement. Cursor comme agent de dev.
**Raison :** encadrer un agent autonome par des specs écrites plutôt que par des briefs oraux, après plusieurs épisodes de reprise.

### D-002 · 26 août · TVA à 10 %
Taux réduit avec droit à déduction, applicable à la restauration et aux produits alimentaires préparés.
**Raison :** depuis le 1er janvier 2026 le Maroc n'applique plus que deux taux, 20 % et 10 %. L'activité relève du 10 % quelle que soit sa qualification exacte, donc pas d'arbitrage risqué. À faire valider par le comptable.

### D-003 · 26 août · Prix affichés et stockés en TTC
Les prix décidés commercialement sont des TTC. Le HT est dérivé par soustraction, jamais l'inverse. Montants en centimes entiers.
**Raison :** le TTC est le nombre que le client voit et que le fondateur ajuste. Le dériver produirait des décimales bâtardes. La soustraction garantit que les trois lignes de facture se rebouclent exactement.
**Remplace :** la chaîne HT → +TVA → TTC envisagée initialement.

### D-004 · 26 août · Un seul montant TTC au récapitulatif
La décomposition HT / TVA / TTC apparaît uniquement sur la facture.
**Remplace :** décision précédente du même jour prévoyant trois lignes au récapitulatif, alignée sur Calo Bahreïn.

### D-005 · 26 août · Prix différenciés par cellule plan × type de repas
Un prix par croisement, pas un prix par plan ni un prix global par type de repas.
**Raison :** mesuré chez Calo — l'écart entre plans porte entièrement sur le petit-déjeuner et le snack, déjeuner et dîner sont identiques. Les protéines et légumes non féculents sont des calories chères. Un prix uniforme ferait de Protein Power le meilleur rapport apparent et le pire en marge.
**Remplace :** l'hypothèse d'un prix identique sur les trois plans.

### D-006 · 26 août · Cycles 1 semaine / 1 mois / 3 mois + jour d'essai
Durées 1, 4 et 12 semaines. Table en base, jamais en dur.
**Remplace :** les durées 1 / 2 / 4 semaines codées en dur dans le tunnel web.

### D-007 · 26 août · Structure des remises
Le mensuel est le prix de référence. L'hebdomadaire porte un supplément forfaitaire par jour. Le trimestriel porte une remise en pourcentage.
**Raison :** mesuré sur deux relevés Calo Qatar à des niveaux de prix différents — supplément de +10 QAR/jour dans les deux cas, donc forfait et non pourcentage. Ferme le Bloc E du rapport.

### D-008 · 26 août · Frais de livraison payants en hebdomadaire, offerts dès le mensuel
Attribut de la ligne cycle, jamais une condition dans le code.
**Note :** déviation délibérée de Calo, qui offre la livraison sur tous les cycles, y compris le jour d'essai.

### D-009 · 26 août · Minimum 5 jours par semaine, uniforme
**Remplace :** les minimums variables par durée du site (3 jours, 6 jours, 10 jours).
**Raison corrigée :** plancher de revenu par abonné et lisibilité de l'offre. La justification logistique initialement avancée était fausse — la livraison est quotidienne, la tournée roule quel que soit le nombre de jours d'un abonné.

### D-010 · 26 août · Plancher de panier en valeur, pas en composition
Montant minimum par jour, configuré par plan. Aucune contrainte du type « au moins 2 repas dont déjeuner ou dîner ».
**Raison :** mesuré sur l'app Calo — 4 snacks seuls passent si le montant suffit. La règle de composition observée sur le site Calo est propre à cette surface, probablement de la dette.
**Remplace :** la contrainte de composition que j'avais généralisée à tort depuis la page web.

### D-011 · 26 août · Cible calorique indicative
`BMR (Mifflin-St Jeor) × multiplicateur d'activité`. L'objectif ne modifie pas la valeur, seulement les questions posées. La cible ne bloque jamais la validation. `target_kcal` nullable.
**Raison :** vérifié sur deux profils indépendants au rapport, et confirmé sur capture — 950 kcal affichés contre 2 649 en cible, bouton actif.

### D-012 · 26 août · Objectif « manger sainement »
Ajout d'une ligne `eat_healthy` dans les objectifs : saute métriques corporelles, poids cible et niveau d'activité. Produit une cible nulle.

### D-013 · 26 août · Identité par téléphone, email au récapitulatif
Téléphone + code à usage unique comme unique ancre. Aucun mot de passe. Un numéro = un compte, partagé site et app. Email nullable à la création, obligatoire avant paiement.
**Raison :** l'email demandé à l'inscription ajoute un champ avant que le client ait rien vu. Au récapitulatif il est engagé, et la facture le rend nécessaire.

### D-014 · 26 août · Jour d'essai — une fois par numéro de téléphone
Contourne le minimum de jours, respecte le lead time et le calendrier. Pas de conversion automatique : la conversion est un effort commercial.

### D-015 · 26 août · Valorisation du jour offert
Un jour offert vaut le tarif de l'abonnement en cours du bénéficiaire. Montée vers un plan plus cher : régularisation manuelle par coupon.
**Note :** explicitement non bloquant au démarrage.

### D-016 · 26 août · Aucune automatisation WhatsApp au lancement
Les messages d'admission et de file d'attente sont manuels au départ.

### D-017 · 26 août · Drizzle sort du repo
Canon retenu : migrations Supabase + types générés depuis la base.
**Raison :** doublon avec l'outillage Supabase natif, et dérive déjà constatée — `coupons` existe en production et pas dans `schema.ts`. Rien n'importe `@fitnest/db`, donc la suppression est sans risque.
**Remplace :** la justification initiale, qui reposait à tort sur l'idée que le repo ne possédait pas le schéma.

### D-018 · 26 août · Aperçu de prix calculé côté serveur
Appel debouncé, cache par configuration, skeleton pendant le chargement. Aucun montant calculé localement.
**Raison :** l'alternative — exposer un instantané de données et calculer côté client — duplique la formule, pas seulement les données. Un client mobile ne se met pas à jour de force : une modification de règle laisserait N versions de la formule dans la nature.

### D-019 · 26 août · Un seul projet, un seul repo
Site et app sont deux surfaces d'un même produit, sur la même base et le même moteur. Une seule installation Spec-Kit, une seule constitution.
**Remplace :** l'hypothèse de deux repos et deux constitutions, introduite par erreur en début de conversation. Cette erreur avait produit l'Article II interdisant toute migration depuis le repo — règle intenable dès lors que le projet possède son schéma.

### D-020 · 26 août · L'architecture doit accueillir l'achat ponctuel
Express Shop et upsells ne sont pas construits en V1, mais identité, compte, wallet, prix et livraison sont des socles partagés servant les deux types de commande. Une conception rendant l'ajout coûteux est un défaut, pas une décision de périmètre.
**Remplace :** l'Article I initial, qui interdisait tout panier et rendait l'Express Shop anticonstitutionnel plutôt que reporté.

### D-021 · 26 août · Configuration d'abonnement persistée côté serveur
Un brouillon rattaché au compte, repris sur n'importe quelle surface. Pas d'état de tunnel dans le stockage local du navigateur.
**Raison :** le tunnel web actuel stocke sa configuration dans `localStorage` — perdue au changement d'appareil ou d'onglet. Règle aussi le problème des lignes `subscription_requests` orphelines.

### D-022 · 26 août · Discipline de traçabilité
Toute règle métier porte sa surface, son marché s'il s'agit d'une observation Calo, et son statut : mesuré, déduit ou supposé. Aucun rapprochement entre relevés de marchés ou de sessions différents.
**Raison :** plusieurs erreurs d'analyse sont nées de la fusion de relevés QAR et BHD, et de la transposition d'observations du site Calo vers l'app.

---

## Corrections notables

Consignées pour éviter leur réintroduction.

| Affirmation initiale | Correction |
|---|---|
| Deux repos, deux constitutions | Un seul projet. Site et app partagent la base et le moteur. |
| Le repo ne génère aucune migration | Le projet possède son schéma. La discipline porte sur la revue, pas sur l'interdiction. |
| Allowlist des trois plans dans le code | Catalogue dynamique. Une liste en dur imposerait une release pour ajouter un plan. |
| L'abonnement se vend « pour une semaine » | Confusion entre rythme de livraison et cycle de facturation. |
| Minimum de composition « 2 repas dont déjeuner ou dîner » | Règle du site Calo uniquement. L'app applique un plancher de prix. |
| Le minimum de jours protège la densité de tournée | Faux : la livraison est quotidienne. Il protège le revenu par abonné. |
| Grille de prix vérifiée « sur deux marchés » | Fusion illégitime de relevés QAR et BHD. |
| Stripe comme processeur | Stripe ne supporte pas les marchands marocains. |

---

## Questions ouvertes

### Q-001 · 29 août · Fournisseur SMS pour l'OTP — non choisi
Critères d'évaluation : délivrabilité au Maroc, coût par SMS, compatibilité avec Supabase Auth en mode phone.
**Portée :** bloque l'implémentation de l'identité client, pas la spécification.
**Note volume :** l'OTP ne sert qu'à la vérification du numéro à l'inscription et à la reprise de session perdue (Article V, v4.1.0) — le volume attendu est faible, à prendre en compte dans l'évaluation du coût.
