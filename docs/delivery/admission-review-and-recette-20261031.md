# Work Fitnest — revue d'admission et conditions de recette
Date : 2026-10-31. Statut : suivi produit, aucune acceptation nouvelle.

## Décision produit T002
Source relue : docs/delivery/backlog.json au commit 2854038dfe653289c326dd33650a311918f630ad, tâche S001-T002.
Son critère exige explicitement la documentation des trois variables Supabase dans .env.example, alors que allowed_paths omet ce fichier.
Work Fitnest confirme que .env.example appartient au résultat produit déjà demandé. La correction de cohérence attendue est limitée à ce chemin exact ; elle ne justifie ni wildcard .env*, ni accès aux secrets, ni élargissement des autres chemins.
Work Ekwip reste responsable de la réconciliation versionnée plan/profil et de ses contrôles. Cette note ne modifie pas le plan, n'accorde aucune acceptation et ne contourne aucune gate. Le modèle doit garder des valeurs factices et la clé service-role côté serveur.

## Observations de dépôt
- PR158 ouverte : correction B02-C et preuves statiques des fondations ; référence proposée 53df5c856a6b871f51cb1cc5e0cbb39db9769f56. Le corps de PR cite encore des révisions antérieures ; utiliser les références de fichiers et le journal de correction.
- PR159 ouverte : contrats food/operations/communications ; référence proposée 259f1bbfba0253b9f3ad5574451e9a41c3afecaf.
- PR149 ouverte : qualification des commandes publiques de test. Pas de nouvelle proposition concurrente.
- La passation Ekwip au commit debc7f53372712b2b95ce2a1b73320e1c9918dd0 rapporte l'admission automatique de catalogues préparés, mais précise que la reconnaissance de l'existant et la qualification des nouveaux tests restent ouvertes.
- Catalogue suivi docs/fitnest/activation/staff-design-catalog.json, blob 0caa0b014b665c8900cae46e5707ef5c8a93e71f : deux fichiers autorisés (B02-C.json et staff-design.md), un seul contrôle contract-document-v2. Ce catalogue ne décrit pas les références exécutables ni les contrôles sémantiques proposés par PR158.
- Aucune preuve de prise en charge de PR158/159 n'a été trouvée dans les éléments relus. Cela ne prouve pas l'absence d'une activité ailleurs.
- Le connecteur disponible ne donne pas les checks/logs CI ni les opérations de fusion ; aucun outil navigateur disponible à cette reprise. CI, registre vivant et version Fitnest déployée non vérifiés ici.

## Conditions de recette produit
| Livraison | Vérification attendue par Work Fitnest | Preuve encore nécessaire |
| --- | --- | --- |
| B02-C / PR158 | Distinguer récupération de facteur et mot de passe ; deux administrateurs nommés ; permissions canoniques ; refus des preuves expirées, réutilisées ou liées à un autre compte | Adoption rattachée à l'exécution 71c86d31-9932-479c-a5c2-6cdc2193a550, tests sémantiques qualifiés au commit exact, revue, commit intégré et reçu de contrat |
| T001 / PR149 | Les commandes racine et core exécutent leurs suites et une suite vide échoue | CI du commit exact puis intégration vérifiée |
| T002 | Dépendances épinglées et installables ; exemples factices ; aucune clé serveur exposée au client | Réconciliation du chemin, installation verrouillée et preuves adaptées au code intégré |
| T003 | Deux identités locales distinctes ; mauvais OTP refusé ; fixtures locales uniquement | Exécution réelle Auth isolée liée au commit ; ne pas la présenter comme répétition de toutes les migrations produit |
| B04-C / PR159 | Inconnu différent de zéro ; unités/bases et versions conservées ; dangers hérités conservés | Revue et qualification de contrat ; données alimentaires, recalcul et fixtures DB-M encore incomplets |
| B11-C / PR159 | Autorisation courante, corrections immuables, blocage sécurité, ambiguïté d'effet sans renvoi aveugle | Revue et qualification de contrat ; G-ROUND/G-MUTATIONS restent ouverts |
| B12-C / PR159 | Preuve récente liée à l'opération, rejeu refusé, admission manuelle conservée, confidentialité des notifications | Revue et qualification de contrat ; fournisseurs/privacy/recovery restent ouverts |

Les 132 tests staff, 157 tests de domaines et 13 contrôles statiques précédemment exécutés sont des preuves de référence locales. Ils ne constituent ni CI distante ni recette d'une application déployée.
Pour une recette applicative, attendre une URL testable rattachée à un commit intégré, des comptes/fixtures appropriés et les scénarios métier réellement implémentés. Les contrats seuls n'annoncent aucune fonctionnalité disponible.

## Responsabilités et suite
Work Fitnest examine les résultats et corrige les non-conformités produit concrètes. Ekwip qualifie les contrôles, reconnaît les propositions existantes, intègre, déploie et reprend les échecs.
Ne pas relancer B02-C en doublon, ne pas recréer T001/T002/T003, ne pas produire manuellement les prochains contrats pour contourner une lacune d'admission.
B01-I garde ses dépendances vérifiées. SEC-A/B/C et B01-C restent préservées.
