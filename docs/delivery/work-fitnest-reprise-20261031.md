# Work Fitnest — reprise produit, 31 octobre 2026

## Périmètre repris
Work Fitnest reprend les contrats produit, leurs fixtures sémantiques, la vérification des propositions existantes, les corrections, la recette et les preuves de livraison. Work Ekwip conserve profils/catalogue, qualification du worker, reconnaissance contrôlée des implémentations existantes, orchestration et comptabilité. Aucun blocage produit ne suspend ce chantier plateforme.

## Références relues
- Source sémantique : 2854038dfe653289c326dd33650a311918f630ad.
- Passation Ekwip : docs/handoffs/platform-fitnest-20261031.md au commit plateforme 152b85e372a1ed363de90ca975a6da94c7d9b81a. Elle rapporte quatre reçus SEC-A/B/C et B01-C conservés ; B01-C intégré à 46599153870b62421ff20568b0dd8679222a297b, preuve 448989ac5c7f27c5042c0cad33ad44d310d5797292528800ee204339dab31cd0. Le registre live n'a pas été relu pendant cette reprise.
- Cette passation précède l'exécution B02-C : ses mentions de non-activation ne décrivent plus le dernier état observable des propositions.
- PR produit #156 : tentative 1, commit 7b52080f639c8b09abf29fe068fd7ff7f8551dcb.
- PR produit #157 : tentative 2, commit f2d4b21c6755cce1cef8ceeb131ed45329514e50, tâche 71c86d31-9932-479c-a5c2-6cdc2193a550. Son corps rapporte le contrôle protégé réussi et exige encore CI/revue indépendante. Aucun reçu B02-C vérifié ici.
- PR #149 : proposition de CI pour exercer les commandes publiques de test racine/core. Ne pas recréer ce changement.

## Ordre de livraison
1. B02-C : compléter le contrat staff existant, produire des fixtures sémantiques exécutables et une revue indépendante avant demande d'acceptation. Ne pas démarrer une seconde exécution du même travail via le scheduler.
2. T001/T002/T003 : vérifier les propositions déjà présentes et les preuves du commit exact, puis demander leur reconnaissance contrôlée à Ekwip. Aucune modification artificielle pour créer un patch.
3. B01-I : préparer ses éléments indépendants ; conserver ses dépendances B01-C accepté et T001/T002/T003 vérifiées avant intégration.
4. Chaque livraison distingue proposition, test local, CI, reçu et version déployée réellement testée. La présence d'une preview ne prouve pas l'authentification ou la sécurité en production.

## Revue produit B02-C, commit f2d4b21
Fichiers lus : spec.md, contrats B02-C.json (blob 0ebde8634ea1291bd4ab0c3cb33c973f6d53a673), staff-design.md (blob 080d4bb3625f4ebf54da28f597e69dcd992ba3ff), baseline produit et tâche B02-C.

### R1 — récupération du facteur non spécifiée (bloquant contrat)
Le reset de mot de passe §13.11 exige encore totpCode. §13.12 nomme staff.mfa.recovery, mais ne définit ni échange de preuve, ni transitions d'état, ni réenrôlement, ni restriction de session intermédiaire. Les vérifications reset_recovery_single_use couvrent le reset, pas la perte du facteur.
Compléter un protocole versionné de récupération du facteur distinct du reset : preuve préenrôlée liée au compte/à l'opération, consommation atomique, réenrôlement vérifié, révocation et audit/notification. Pas d'accès métier avant le nouveau facteur vérifié. Les paramètres non ratifiés restent explicites.
Fixtures requises : preuve absente/expirée/rejouée/croisée, concurrence, échec du réenrôlement, ancien facteur/session, notification sans secret et absence de bypass SMS/administrateur caché.

### R2 — bootstrap déclaré mais procédure absente (bloquant contrat)
§5.4 répète l'obligation des deux administrateurs nommés ; il ne donne pas la procédure à usage unique, les préconditions, le scellement ni la reprise après enrôlement partiel.
Décrire états et transitions, entrée contrôlée des deux identités, invitations individuelles et vérification TOTP, fermeture irréversible du bootstrap normal après succès, reprise auditable sans compte caché. Les vrais noms/contacts restent hors des fixtures.
Fixtures requises : tentative non autorisée, troisième compte, replay/concurrence, interruption après premier compte et fermeture après le second.

### R3 — assertions d'API et d'horodatage à rendre vérifiables
B02-C.json demande de type-checker les DTO mais livre des plans textuels ; aucun résultat d'exécution n'est fourni par ces deux fichiers. Les exemples §13.5 et §13.8 utilisent 19:05+01:00 pour actualDeliveredAt et 19:05Z pour occurredAt : préciser s'il s'agit d'instants différents ou corriger la fixture. Un exemple cohérent et une assertion d'instant empêchent une dérive d'une heure.
Fournir des schémas/fixtures exécutables avec succès et refus, y compris version inconnue, provenance serveur et champs secrets interdits. Les contrôles structurels existants ne suffisent pas.

### R4 — cohérence des permissions
La matrice propose menu.weekly.publish et subscriber.act.pause alors que les exemples déclarés littéraux sont menu.publish et subscriber.pause_for. Définir une seule énumération canonique avec correspondance explicite, et tester qu'un alias inconnu refuse. Ne pas changer les cinq rôles ni les combinaisons ratifiées.
La permission logistique reste explicitement accordée et limitée au périmètre ; aucun wildcard Administrator ne la confère.

### Limites conservées
G-ROUND et LOT-11 restent ouverts pour l'intégration livraison ; aucune validation FR-L1–3 sur adaptateur fictif. SEC-A/B/C et B01-C ne sont pas modifiés. Aucune acceptation runtime/production déclarée.

## Vérification documentaire des fondations à 4659915
- T001 : Vitest 5.0.5 épinglé ; pnpm test racine et script core présents. La CI intégrée lance test:core et typecheck:core, pas les deux commandes publiques. PR #149 traite déjà ce manque. Exécution sur le commit exact restant à constater.
- T002 : supabase-js 2.110.7 et ssr 0.5.2 épinglés ; URL/anon et service-role serveur documentés dans .env.example. Le backlog autorise les manifests mais omet .env.example : écart de périmètre à réconcilier par Ekwip, pas à contourner.
- T003 : configuration locale à deux OTP fixes et workflow démarrant une stack jetable ; aucune preuve Docker exécutée pendant cette reprise. La fixture isole Auth et n'exerce pas les migrations produit ; ne pas la présenter comme vérification du schéma complet.

## Prochain résultat concret
Contrat B02-C corrigé et fixtures sémantiques, plus dossier T001/T002/T003 lié aux CI exactes. Les demandes de qualification/reconnaissance restent attribuées à Ekwip ; les corrections produit restent à Fitnest.
