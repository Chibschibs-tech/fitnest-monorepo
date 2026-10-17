# Décision : modèles, exécution OpenCode et suivi des tâches

Date : 2026-10-17. Périmètre : outil interne de développement de Fitnest.
Décision technique retenue pour le pilote ; intégrations et qualité sur Fitnest
à qualifier. Ce document n'active aucun appel payant et ne vaut pas approbation
du budget proposé.

Extension de périmètre le même jour : la [plateforme multi-projet Ekwip](multi-project-platform.md)
porte désormais le pilotage commun ; Fitnest est son premier projet pilote. Ce
document conserve les choix de modèles et critères du pilote. La nouvelle
architecture prévaut pour l'implantation du dashboard et l'orchestration durable.

## 1. Choix des modèles

| Rôle | Modèle retenu | Travail confié | Limites |
|---|---|---|---|
| Développeur principal | Kimi K2.7 Code, API `kimi-k2.7-code` | Fonctionnalités bornées, modifications de plusieurs fichiers, tests nouveaux, corrections après échec | Aucun accès production ; aucun changement des règles de validation ou de budget |
| Assistant économique | GLM-5.3-Flash, API Z.AI | Recherche dans le dépôt, synthèses de contexte, documentation, modifications simples explicitement cadrées | Lecture seule par défaut ; écriture limitée au périmètre de sa tâche ; pas d'arbitrage métier ni de modification sensible |
| Relecteur séparé | DeepSeek V4 Pro, API `deepseek-v4-pro` | Revue du diff par rapport à la spec, cas limites, risques de régression et de sécurité | Nouvelle session en lecture seule, sans conversation du développeur ; ne fusionne et ne déploie pas |

Le choix de Kimi repose sur son orientation explicite vers le développement
agentique sur plusieurs fichiers et son tarif API documenté. GLM Flash réduit
le coût des tâches auxiliaires. DeepSeek apporte une seconde analyse distincte.
Ce sont des choix d'ingénierie, pas la conclusion d'un benchmark comparatif déjà
réalisé sur Fitnest. Deux modèles peuvent manquer le même défaut : les tests et
les contrôles d'accès restent indispensables.

DeepSeek avait été envisagé comme développeur principal ; cette décision retient
Kimi à ce poste. Aucun routage live antérieur n'est remplacé : aucun modèle n'est
encore connecté au contrôleur.

Tarifs directs consultés le 17 octobre 2026, USD par million de tokens :

| Modèle | Entrée hors cache | Entrée en cache | Sortie |
|---|---:|---:|---:|
| Kimi K2.7 Code | 0,95 | 0,19 | 4,00 |
| GLM-5.3-Flash | 0,15 | 0,03 | 0,50 |
| DeepSeek V4 Pro, heures pleines | 1,32 | 0,044 | 3,96 |
| DeepSeek V4 Pro, heures creuses | 0,66 | 0,022 | 1,98 |

Le plafond se calcule sans remise de cache et au tarif maximal applicable. Le
coût constaté utilise le tarif effectif et les compteurs retournés. Taxes,
hébergement, minutes de runner et éventuels outils facturés sont séparés. Les
abonnements grand public et Coding Plans ne servent pas de budget API implicite.
Les outils externes facturés restent désactivés pour le pilote.

Les alias fournisseur peuvent évoluer. Enregistrer le modèle demandé, celui
retourné, la date, le fournisseur et la version du barème. Une évolution de modèle
ou un changement de barème déclenche une requalification avant nouvelle série.
Pas de remplacement automatique par un modèle plus cher ou non qualifié.

## 2. OpenCode et responsabilités

OpenCode est l'exécuteur qui permet au modèle de lire, modifier et tester le code.
Le contrôleur Fitnest décide quelle tâche démarre, avec quel modèle et quel
budget ; le modèle ne choisit pas ses propres plafonds.

Implantation retenue :

- Dépôt de l'application pilote : `Chibschibs-tech/fitnest-monorepo`. La plateforme
  commune aura un dépôt privé distinct ; les applications gardent leurs dépôts.
- Orchestration durable : Temporal et workers TypeScript, selon le cadrage
  multi-projet. Exécutions initiales : jobs GitHub Actions déclenchés par le
  contrôleur, avec espace éphémère et isolation du processus. Une tâche active à
  la fois au démarrage.
- OpenCode : version épinglée après qualification ; agents configurés par rôle,
  permissions et limite `steps`. Utiliser le SDK pour les sessions et événements,
  ou la sortie JSON de la CLI pour l'adaptateur initial.
- Configuration de confiance chargée hors du checkout modifiable. Les plugins,
  commandes, règles et configurations présents dans un candidat ne doivent pas
  élargir les permissions du runner.
- Clés API : secrets du service de routage et de comptage, jamais dans le code,
  le navigateur ou les logs. Le runner reçoit un jeton temporaire limité à sa
  tâche. Les accès directs aux API fournisseurs sont bloqués depuis son espace.
- Écritures GitHub et déploiements : services distincts du processus de code ; le
  runner ne possède pas de secret de production.
- Dashboard : interface interne Next.js de la plateforme Ekwip, avec
  authentification et isolation par client/projet. Son hébergement web peut être
  Vercel ; les sessions longues OpenCode tournent dans le runner.

OpenCode documente les fournisseurs Moonshot AI, DeepSeek et Z.AI, le modèle par
agent, les permissions, le SDK et les événements. La présence d'un fournisseur
dans le catalogue n'établit pas encore que la combinaison exacte de versions,
modèle et proxy fonctionne dans notre runner.

Avant activation, vérifier les identifiants exacts via `opencode models` et un
appel borné avec chaque compte autorisé. Tester une séquence d'appels d'outils,
les compteurs de consommation, l'annulation et le redémarrage. Kimi K2.7 Code
exige le mode thinking et des paramètres spécifiques : ne pas lui appliquer une
température générique. Respecter son protocole dans la session éphémère sans
publier les traces brutes de raisonnement dans le dashboard.

## 3. Boucle de travail

1. Le plan validé fournit une tâche : spec, dépendances, commit de départ,
   fichiers autorisés, critères d'acceptation, risque et plafond.
2. Le contrôleur vérifie les dépendances et réserve le budget. GLM prépare le
   contexte si nécessaire ; Kimi développe dans l'environnement isolé. Une petite
   tâche documentaire peut être entièrement attribuée à GLM.
3. Un vérificateur distinct calcule le diff et lance les contrôles applicables
   sur le commit proposé : typage, tests, build et acceptation métier.
4. DeepSeek reçoit la spec, le diff exact et les résultats fiables dans une
   nouvelle session. Ses conclusions sont des observations structurées ; son
   avis seul ne valide pas une livraison.
5. En cas d'échec, Kimi corrige dans la limite des tentatives et du budget total.
   Sinon, un service autorisé publie la branche/PR et vérifie la préproduction.
6. La livraison production exige l'approbation authentifiée de la personne
   habilitée sur le commit effectivement vérifié. Un changement de commit
   invalide les preuves précédentes.

Les tests d'acceptation protégés, le contrôleur, les secrets et la politique de
budget ne sont pas modifiables par l'agent. Les vérifications exécutant du code
candidat tournent aussi sans secrets de publication. Les commentaires publics
d'une issue ne peuvent pas lancer une exécution payante.

Les blocages SEC de la slice 001 et son approbation fondateur T013 restent
applicables. Le pilote porte d'abord sur l'outillage ou une tâche autorisée à
faible impact, pas sur une implémentation produit encore bloquée.

## 4. Budget et mesure

Proposition de pilote, non encore activée : enveloppe API globale de **25 USD**,
jusqu'à dix petites tâches de qualification, **2 USD maximum par tâche**, et
5 USD réservés à la qualification des intégrations. Au plus trois tentatives par
tâche, tous rôles, corrections et échecs compris. Une tâche peut être bloquée
avant ces trois tentatives si son plafond est atteint. Aucun succès ni prix
moyen par fonctionnalité n'est promis par cette enveloppe.

Chaque appel doit réserver son coût maximal avant transmission : taille d'entrée
bornée, sortie maximale incluant les tokens facturés de raisonnement, tarif
prudent et éventuels frais connus. Les réservations du budget de tâche et du
budget global sont atomiques. Les appels auxiliaires, résumés et titres générés
par OpenCode sont inclus ou désactivés.

Un timeout, un compteur manquant ou une réponse ambiguë garde une réservation
non rapprochée et bloque une nouvelle dépense non couverte. Le modèle ne déclare
pas lui-même son coût. Un arrêt ne rembourse pas les tokens déjà traités.
Le bouton « réessayer » conserve tous les coûts précédents. Une limite d'étapes
ou un timeout, seuls, ne garantissent pas un plafond en dollars.

La fondation actuelle additionne des coûts fournis par les adaptateurs et détecte
un dépassement après réception. Elle ne réalise pas encore ces réservations
avant chaque appel fournisseur. Ne pas présenter le plafond comme opérationnel
avant les tests de refus et de concurrence du service de comptage.

Mesure du pilote : coût total de toutes les tentatives, nombre de tâches acceptées,
coût par tâche acceptée, délai médian, taux de réussite au premier passage,
interventions humaines et défauts découverts après acceptation. Le budget suivant
se déduit de ces résultats, ventilés par type de tâche, avec une marge explicite.

## 5. Dashboard à livrer

État au moment de cette décision : **pas de dashboard connecté dans la PR #6**.
La fondation contient le contrôleur, le stockage local, les tests, une simulation
et la CI. Le statut Ready d'un déploiement web n'établit pas la présence du
dashboard ni l'activation des agents.

| Vue | Informations et actions |
|---|---|
| Synthèse | Tâches en attente, actives, bloquées, validées et livrées ; coût consommé, réservations en cours, plafond et solde disponible ; dernière synchronisation |
| Liste des tâches | ID, titre, slice, dépendances, état, modèle actif, tentatives, durée, coût cumulé, réservation, plafond, lien PR et préproduction |
| Détail | Chronologie, résumés d'actions, fichiers modifiés, résultats des tests et de la revue, commit vérifié, raisons du blocage, consommation de chaque appel et tentative |
| Interventions | Lancer une tâche autorisée, mettre la file en pause, demander l'arrêt, reprendre après résolution ; approuver une livraison avec le rôle habilité |

Les statuts distinguent « en revue », « prêt en préproduction » et « livré ».
Une réponse positive du modèle ne marque pas une tâche terminée. Afficher des
compteurs de tâches et des jalons vérifiés ; ne pas inventer un pourcentage de
progression à partir du texte produit par le modèle.

Trois montants distincts :

- **Consommé estimé** : usage renvoyé par les fournisseurs × barème daté.
- **Réservé** : exposition maximale des appels en cours ou non rapprochés.
- **Rapproché** : consommation contrôlée contre les données de facturation
  disponibles. Si le fournisseur ne permet qu'un rapprochement global, ne pas
  prétendre avoir une facture exacte par tâche.

Les événements OpenCode alimentent une API interne qui persiste les états avant
de les afficher. Sa connexion SSE apporte l'actualisation, pas la durabilité.
`opencode stats` aide au diagnostic ; ce n'est pas le registre financier du projet.
Les clés API, secrets, prompts et transcriptions brutes ne sont pas exposés.

## 6. Données et critères d'acceptation

Prévoir un stockage PostgreSQL réservé au pilotage, séparé des données clients et
du wallet Fitnest. Modèle à détailler dans la migration d'implémentation :

| Entité | Données principales |
|---|---|
| `delivery_tasks` | Spec, état, priorité, dépendances, périmètre, plafond, révision |
| `delivery_runs` | Tâche, tentative, session OpenCode, modèle, début/fin, commit |
| `delivery_calls` | Run, identifiant unique de requête, modèle demandé/retourné, usage, coût, état de rapprochement |
| `delivery_prices` | Fournisseur, modèle, tarifs, unité, monnaie, validité, source |
| `delivery_reservations` | Appel, enveloppe concernée, montant, état ; unicité et verrou transactionnel |
| `delivery_events` | Identifiant unique, ordre, auteur authentifié, événement nettoyé, date serveur |
| `delivery_evidence` | Commit, résultat CI/revue/déploiement, référence vérifiée |
| `delivery_approvals` | Personne habilitée, décision, commit et déploiement visés, expiration |

Montants en micro-USD entiers ; les différents types de tokens ne doivent jamais
être comptés deux fois. Contraintes uniques sur appels et événements, transactions
sur les réservations, vérification des droits sur chaque action. Le stockage JSON
mono-hôte actuel ne constitue pas ce backend partagé.

Le dashboard et l'exécution live ne sont acceptés qu'après démonstration de :

1. Une vraie tâche suivie depuis son lancement jusqu'à la préproduction, avec
   modèle, commit, tests et coût identifiables.
2. Un appel refusé avant émission lorsqu'il dépasserait le budget, y compris
   lorsque deux demandes arrivent simultanément.
3. Une coupure et une reprise sans perte de coût, double comptage ou double
   exécution ; un coût inconnu visible comme tel.
4. Une correction qui augmente le coût cumulé sans effacer l'essai précédent.
5. Un visiteur non autorisé incapable de lire ou piloter le projet ; un agent
   incapable de changer les plafonds ou de s'accorder une approbation.
6. Une revue indépendante du commit exact et un rejet de preuve après changement
   de commit ; aucune mise en production sans l'approbation attendue.

Ordre de réalisation : registre des tâches/coûts et écran connecté en mode
simulation clairement identifié ; adaptateur OpenCode avec comptage ; première
tâche réelle bornée ; préproduction ; pilote ; autorisation production. Les
tests simulés ne sont jamais présentés comme une dépense ou une livraison réelle.
Cet ordre pour le pilote s'inscrit dans les lots P1 à P4 du cadrage multi-projet.

## Sources officielles consultées

- [Kimi K2.7 Code : modèle et tarifs](https://www.kimi.ai/resources/kimi-k2-7-code)
- [Paramètres et protocole Kimi](https://platform.kimi.ai/docs/guide/kimi-k2-7-code-quickstart)
- [Kimi dans OpenCode](https://platform.kimi.ai/docs/guide/open-code)
- [Tarifs Z.AI](https://docs.z.ai/guides/overview/pricing)
- [DeepSeek : modèles et tarifs](https://api-docs.deepseek.com/quick_start/pricing/)
- [OpenCode : agents](https://opencode.ai/docs/agents/)
- [OpenCode : fournisseurs](https://opencode.ai/docs/providers/)
- [OpenCode : SDK et événements](https://opencode.ai/docs/sdk/)
- [OpenCode : CLI et statistiques](https://opencode.ai/docs/cli/)
- [OpenCode : intégration GitHub](https://opencode.ai/docs/github/)

Ces sources confirment les capacités documentées et les tarifs consultés. Elles
ne prouvent ni notre intégration ni les performances futures sur Fitnest.
