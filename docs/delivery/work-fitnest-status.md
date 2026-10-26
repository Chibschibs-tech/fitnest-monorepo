# Correction SEC-B suite au retour Ekwip — 26 octobre 2026

SEC-C acceptée confirmée par journal opérateur Ekwip : integration0bed3d9643416f92eca9779a4520cdb55e90609c, evidence e2ca4a55c10aad5bf857f27642499721a41fb9d7029903b3cbb0abaef955c0bc. SEC-A préservée.

SEC-B : correctif ciblé publié PR137 au commit fc6dca9c0f95e0f9cbd55f09e839b13c994292ad. Un seul fichier changé : tests/security/sec-b-contract.test.mjs. Le guard interdit désormais GRANT/REVOKE sans dépendre du mot suivant. 34/34 tests passent, dont14 cas négatifs et1 contrôle positif. Revue indépendante confirme12/14 contournements de l'ancien guard fermés ; tous14 rejetés maintenant.

SHA256 corrigé ad83ec0d35d9701730a66fea09fef051193375f5b916617b43f3ce28f81cfff2 ; blob Git eb71f1542f338e96fcaef5f2ded000531dfcc112, relu identique sur GitHub.
Revue et provenance du checker externe remis dans Ekwip PR45 : rapport3e33aa009855f5b6a18f212288e1958386b4269e, handoff0a39d8382e1f3b6480764b490f5162812a2af242.
Ne pas chercher sec-b-independent.mjs dans le scope produit : source protégée Ekwip1409aabc41e9464c1ebd55208ba61e11e871a23a, copie qualifiée d343965e5defcd7e9235cbf4a322ca55d123a316/packages/executor/acceptance/sec-bc/sec-b-independent.mjs.

Le reçu SEC-B n'est pas encore acquis. Ekwip doit réviser l'empreinte protégée après re-revue explicite, adopter le delta sur la base acceptée et reprendre le même run. Aucun contrôle plateforme, digest protégé ou reçu modifié par Work Fitnest. Le blocage SEC-B n'empêche pas les travaux plateforme indépendants.

---

## Historique

# Livraison SEC-B/C actualisée — 26 octobre 2026

SEC-A acceptée préservée sur b8911d6c2d3a1343a22ba2aca462608ab0c9ec12.

- SEC-B PR137 : c43e1da80abe79536441c8d5dca4c73c225a4e3d. 19/19 tests produit, 8/8 checks hébergés. Revue indépendante : 8 obligations contractuelles PASS, limites d'inventaire déclarées.
- SEC-C PR138 : 0c17b4a4f8f335c1057bcd025b66ec83849ce9a9. 51/51 tests produit, 8/8 checks hébergés. Revue indépendante : 10 obligations PASS + 50 assertions externes.
- Ekwip PR45 : dossier indépendant publié au commit 1409aabc41e9464c1ebd55208ba61e11e871a23a ; instructions finales 9c233f3afc64ec3b40b56b4b7a548538e697bdd1. Chemin docs/handoffs/fitnest-qualification-20261026/. Composites exécutés avec succès par auteur de revue et root ; blobs candidats liés SHA256.
- SEC-B CI : regression https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40387899835/job/121800914579 ; build40387899711/job121800913737 ; plan40387899995/job121800936811.
- SEC-C CI : reference https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40387706411/job/121800284654 ; build40387706584/job121800285569 ; plan40387706420/job121800306757.
- Previews READY et GET /200 au SHA exact : SEC-B https://fitnest-monorepo-i306gk7qd-chihab-ekwipmas-projects.vercel.app ; SEC-C https://fitnest-monorepo-2yepbrqca-chihab-ekwipmas-projects.vercel.app . Ce sont des vitrines inchangées, pas la qualification des futures fonctions runtime.

État exact : contrats de conception livrés et revus, reçus Ekwip non encore obtenus. Le registre protégé Ekwip doit adopter ces contrôles, qualifier le worker et reprendre l'adoption tracée PR46 avant intégration/reçu. Aucune acceptation manuelle ni fusion extérieure au protocole. SEC-B conserve non-API/actions et parité de déploiement comme limites explicitement soumises à la revue Ekwip. Les tests runtime T006/T008/T010 ne sont pas des prérequis ajoutés à ces contrats.

Fondations PR136 restent au SHA3a5ac6cd4d2bb163b46277f89b9ad674425fe5a0, CI9/9 dont Supabase Auth Docker réel.

---

## Historique (candidats précédents remplacés par les SHA ci-dessus)

# Work FITNEST — journal de livraison
Mis à jour le 26 octobre 2026, 20:03 Africa/Casablanca.

## Référence et périmètre
Source sémantique inchangée : `2854038dfe653289c326dd33650a311918f630ad`.
Branche d'intégration : `fitnest-foundation-runtime`, tête recontrôlée `b8911d6c2d3a1343a22ba2aca462608ab0c9ec12`.
Plan conservé : 102 tâches, 38 capacités, 32 exigences SEC. Décisions relues dans docs/decisions-log.md et docs/delivery/{clarifications,governance-alignment-20261024,acceptance}.md.
Work FITNEST possède produit, contrats et recette. Work Ekwip possède exécuteur, profils enregistrés, reprises, qualifications et services Ekwip.

## Acquis préservé
SEC-A, PR [134](https://github.com/Chibschibs-tech/fitnest-monorepo/pull/134), commit intégré ci-dessus, n'est ni réécrite ni relancée.
La passation rapporte le reçu du 26/10 à 17:48:12 UTC. L'aperçu vivant montre 1 reçu, zéro réservation et 0 appel à rapprocher pour SEC-A.
**Anomalie de présentation à réconcilier par Ekwip :** le détail SEC-A affiche encore « Non acquise », check:validate et integrated_commit_checks_pending à 17:48:17, alors que l'aperçu compte un reçu. Cette vue contradictoire n'autorise pas une nouvelle tentative et ne prouve pas une annulation du reçu.

## Travaux parallèles, responsables et isolation
| Chantier | Branche produit | Travail | Situation |
|---|---|---|---|
| SEC-B | work-fitnest-sec-b-20261026 | Inventaire réel, privilèges/exposition, collecteur et tests des preuves | [PR137](https://github.com/Chibschibs-tech/fitnest-monorepo/pull/137), c7b6c2b2d42092da8671bab90118b2e5633cb2bb ; 12/12 locaux |
| SEC-C | work-fitnest-sec-c-20261026 | Conception sessions bornées/révocation, modèle paramétré, tests et contrat | [PR138](https://github.com/Chibschibs-tech/fitnest-monorepo/pull/138), 76bd0c44667c99adea5f94503f58e15009534b1b ; 45/45 locaux |
| B01-C/T001/T002/T003/BX-C | work-fitnest-foundations-20261026 | Vérifier propositions existantes, corriger qualification CI et préciser couverture | [PR136](https://github.com/Chibschibs-tech/fitnest-monorepo/pull/136), 3a5ac6cd4d2bb163b46277f89b9ad674425fe5a0 ; 13/13 locaux |
| Coordination | work-fitnest-delivery-20261026 | Journal, références et suivi d'intégration | Actif |

Les tests de référence ne valent pas preuve runtime. Les hypothèses de fixtures ne choisissent aucune durée de production. G-SESSION, G-RECOVERY et G-T013 restent selon le registre. Aucun changement de base produit ni service Ekwip n'est autorisé par ce journal.

## Blocage SEC-C transmis au Work Ekwip
Dashboard vivant observé : execution blocked; « Job GitHub terminé avant prise de tâche : configuration à vérifier ».
[Job existant](https://github.com/chihabJekwip/ekwip-delivery-platform/actions/runs/40243859069), tentative 1 : failure avant claim. Aucun test, revue ou appel fournisseur reçu ; réservations 0, rapprochements 0.
Action Ekwip : diagnostiquer ce dispatch et reprendre ce travail existant de manière idempotente après enregistrement du contrat produit. Ne pas créer un run doublon. Fitnest poursuit les fichiers produit en parallèle.

## Couverture et écarts de profils
Aperçu observé : 3 profils pour 102 tâches, 1 reçu, 99 occurrences « Exécuteur Fitnest à qualifier » et « task_retry_bound_missing_or_exhausted », six travaux en revue. Les compteurs se chevauchent.
Les contrats par chantier préciseront commandes, chemins exacts, preuves complètes et limites. Le Work Ekwip doit qualifier/enregistrer ces contrats sans confondre un test statique ou un modèle de référence avec l'intégration complète.
Le journal Work Ekwip a été retrouvé sur [work-ekwip-consolidation-20261026](https://github.com/chihabJekwip/ekwip-delivery-platform/blob/work-ekwip-consolidation-20261026/docs/handoffs/work-ekwip-status.md), associé à la [PR44](https://github.com/chihabJekwip/ekwip-delivery-platform/pull/44).
La demande de coordination est publiée dans le dépôt Ekwip via [PR45](https://github.com/chihabJekwip/ekwip-delivery-platform/pull/45), commit 65018d8522ab285fc25845217f24c2f180793d8b. Elle demande profils protégés, reprise du run SEC-C existant et adoption contrôlée du patch exact.
Blocage confirmé par lecture du code Ekwip : les PR externes work-fitnest-* ne satisfont pas validExecutorBranch ni la chaîne run/revue/publication/dispatch qualifié. L'intégration opérateur CI/constitution ne vaut pas acceptation produit. Ne pas fusionner ces PR hors chaîne ni renommer artificiellement une branche executor/*. Le Work Ekwip reste responsable de résoudre cette adoption.

## Définition d'une livraison
PR et SHA exact → contrôles requis + revue indépendante → intégration → reçu lié au commit intégré → résultat testable correspondant.
Aucun nouveau jalon n'est déclaré accepté.
Un aperçu web Vercel existant a été vérifié READY et HTTP 200 sur le commit accepté SEC-A exact b8911d6c2d3a1343a22ba2aca462608ab0c9ec12 :
[ouvrir la version de base](https://fitnest-monorepo-dofd844ih-chihab-ekwipmas-projects.vercel.app), déploiement dpl_DXp6SspPetTwUz3gVSBXQf9FYDEv.
L'aperçu admin dpl_BKNTvaDTGjpjz56cYFNqdtC9j7S2 répond aussi 200, mais / affiche la même vitrine : cela ne valide pas l'administration.
Ces contrôles portent sur la disponibilité de la vitrine existante, pas les parcours V1 auth/révocation. Aucune version testable nouvellement acceptée n'est enregistrée dans Ekwip.
T010 reste dépendante de T008, SEC-C, SEC-A, T009 et des décisions G-SESSION/G-RECOVERY. L'acceptation de SEC-A seule ne la débloque pas.

## Preuves et revue des propositions
Fondations : parseur env corrigé après finding indépendant whitespace/export, quatre régressions ajoutées ; 13/13 tests recontrôlés par le coordinateur. Workflow Identity foundation couvre désormais SDK/env et conserve core + Auth Docker. Aperçu Vercel web READY au SHA 3a5ac6cd4d2bb163b46277f89b9ad674425fe5a0, HTTP200 : https://fitnest-monorepo-ag4mxzhkx-chihab-ekwipmas-projects.vercel.app . Ce contrôle ne valide pas les parcours Auth.
SEC-B : 24 tables publiques fermées et 23 séquences à revoir ; refus SQL 42501 réels sur users LIMIT0 pour anon/authenticated. 12/12 tests locaux. La revue a demandé une procédure reproductible d'assemblage des deux résultats SQL et des migrations : ajoutée. Métadonnées seulement ; exposition HTTP, rôle applicatif effectif et replay restent ouverts.
Les workflows candidats restent des propositions ; Ekwip doit protéger les tests et enregistrer les profils. CI distante complète et reçu d'intégration restent à vérifier. Les branches produit ont été créées depuis l'exact commit SEC-A accepté.

## Vérification finale des incréments (26 octobre)
- Fondations au SHA 3a5ac6cd4d2bb163b46277f89b9ad674425fe5a0 : 9/9 checks verts, dont [Identity foundation](https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40381871045) (core, local-auth Docker, setup-contract). Ceci apporte une preuve Auth réelle sur fixture isolée, sans constituer le reçu des tâches.
- SEC-B au SHA c7b6c2b2d42092da8671bab90118b2e5633cb2bb : 8/8 checks verts, dont [inventaire PR](https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40382025313). [Aperçu candidat](https://fitnest-monorepo-jdqezqnkj-chihab-ekwipmas-projects.vercel.app) READY, HTTP200.
- SEC-C au SHA 76bd0c44667c99adea5f94503f58e15009534b1b : 45 tests locaux passés, [modèle CI PR](https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40382746976) et push verts. 8/8 checks finalement verts, y compris le [build général PR](https://github.com/Chibschibs-tech/fitnest-monorepo/actions/runs/40382746969). [Aperçu candidat](https://fitnest-monorepo-g97x9n4bm-chihab-ekwipmas-projects.vercel.app) READY, HTTP200.
- Revue indépendante locale : tous les findings résolus — parseur env, recapture composite, challenge effectivement complété et email vérifié avant risque conformément à SEC-A. Cette revue n'est pas une revue enregistrée par Ekwip.

## Prochaine reprise requise
Work Ekwip dispose des trois PR/SHA/contrats via PR45 (mise à jour d24cd374197ad7e75b6af112941683781ac36c8a). Qualifier les tests protégés et réconcilier périmètres/CI, adopter le patch exact dans les runs existants, exécuter la revue liée, intégrer, vérifier le SHA intégré puis émettre le reçu. Les nouvelles PR restent proposées, non fusionnées, non acceptées. SEC-B conserve ses preuves runtime manquantes ; SEC-C ses essais provider/canaux/concurrence manquants. Les trois aperçus sont des versions candidates consultables de la vitrine, pas des parcours sécurité V1 livrés.
