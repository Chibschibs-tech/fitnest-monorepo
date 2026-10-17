# Plateforme Ekwip de développement et d'exploitation

Date : 2026-10-17. Statut : architecture cible et plan de réalisation ; non déployé.

Ce document étend la décision `model-routing-dashboard.md` à plusieurs clients et
projets. Il remplace son implantation du dashboard dans l'application Fitnest.
Les rôles LLM, contrôles de coût et critères de preuve sont conservés.

## 1. Résultat attendu et frontière du produit

Entrée : un brief de projet ou une demande d'évolution, un dépôt existant si
disponible, des contraintes, un budget et un responsable d'acceptation.

Sortie : un produit livré avec critères vérifiés, version identifiée,
environnements, documentation d'exploitation et transfert des accès autorisés ;
puis un historique continu de maintenance, incidents et versions suivantes.

La plateforme transforme le brief en proposition de périmètre, critères et plan.
Les hypothèses non validées restent visibles. Une tâche de réalisation devient
exécutable lorsque son contrat est suffisamment précis et autorisé. Un modèle
ne décide pas seul du prix vendu au client, du périmètre contractuel ou des
engagements de disponibilité.

Architecture de propriété :

- Un dépôt privé dédié à la plateforme Ekwip, à créer ou désigner avant son
  implémentation. Aucun nouveau dépôt n'a été créé par cette décision.
- Les applications clientes conservent leurs propres dépôts et environnements.
  Aucun déménagement ni regroupement automatique de leurs codes.
- Fitnest est le premier projet pilote. Son paquet `tooling/delivery-loop` sert
  de prototype portable du contrôleur, pas de plateforme multi-client existante.
- Ces documents sont provisoirement rattachés à la PR #6 pour conserver la
  continuité. Seule une conception générique est publiée ici ; le registre des
  clients, les accès et les documents confidentiels restent privés.

## 2. Six capacités à construire

| Capacité | Responsabilité | Preuve attendue |
|---|---|---|
| Admission d'un projet | Brief, diagnostic du dépôt, design, contraintes, estimation et plan | Contrat versionné approuvé ; inconnues explicites |
| Mémoire du projet | Specs, décisions, architecture, marque, contrats API et preuves | Chaque fait source est lié à une version et à un projet |
| Orchestration | Dépendances, priorités, affectation, attente, reprise et limites | Une interruption ne perd ni état, ni coût, ni approbation |
| Exécution | Agents, environnements isolés, vérifications et publication | Résultats liés à un commit exact et reproductibles |
| Exploitation | Mesures, incidents, maintenance, capacité et versions suivantes | Alertes exploitables, runbooks et validation après déploiement |
| Pilotage | Portfolio, coûts, qualité, décisions et accès | Vue client/projet/version/tâche cohérente avec les événements |

## 3. Stack retenue et séparation des responsabilités

**Orchestrateur : Temporal avec workers TypeScript.** Il porte les workflows
durables, leurs dépendances, les délais, les attentes de validation et les reprises.
L'objectif est une exécution qui continue indépendamment de cette conversation.
Temporal ne réalise ni les tests métier ni l'isolation du code à notre place.

**Exécuteur de code : OpenCode**, derrière un adaptateur versionné. Un travail est
effectué dans un environnement éphémère avec limites CPU, mémoire, réseau et temps.
GitHub Actions reste un premier support d'exécution et de CI ; la plateforme peut
ensuite distribuer ses travaux à un pool de runners sans changer le contrat des
tâches. Les processus persistants d'orchestration tournent dans des services dédiés.

**Pilotage : Next.js et API TypeScript**, avec accès Ekwip et, ultérieurement,
portail client limité à son périmètre. Les actions passent par l'API authentifiée,
pas par un serveur OpenCode exposé au navigateur.

**Données : PostgreSQL pour le registre métier et financier**, stockage d'objets
privé pour les preuves volumineuses. Secrets dans un service dédié, hors des
prompts. Le registre ne contient pas les données de production des applications.

**Intégrations : adaptateurs GitHub, CI, hébergement et observabilité.** Les droits
sont limités aux dépôts, projets et environnements inscrits au contrat. Une
connexion donnant accès à plusieurs comptes n'autorise pas le choix automatique
d'un autre compte. Un échec de permission arrête l'action correspondante.

Source d'état : Temporal porte l'exécution du workflow ; PostgreSQL porte les
contrats, budgets, dépenses et approbations. Les états affichés du workflow sont
des projections mises à jour par événements dédupliqués, avec date de fraîcheur.
Les transactions et une boîte d'envoi transactionnelle permettent de rapprocher
commandes et réservations. Aucune double écriture réseau supposée atomique.

Une activité peut être retentée par le moteur. Les appels LLM payants et effets
externes ont des identifiants stables, une réservation et un état de rapprochement.
Sans garantie d'idempotence du service externe, une réponse perdue bloque pour
vérification ; elle ne déclenche pas un second achat, commit ou déploiement aveugle.
Les politiques de retry du moteur sont explicitement configurées en conséquence.

## 4. Rôles de travail et routage

Les rôles sont des contrats de travail avec entrée, sortie structurée, outils
autorisés et critère d'acceptation. Ils ne nécessitent pas chacun un nouveau modèle.

| Rôle | Produit de son travail | Exécution initiale |
|---|---|---|
| Produit / analyse | Questions bloquantes, périmètre, parcours et critères d'acceptation | Kimi prépare ; responsable produit arbitre les décisions métier |
| Architecture | Décisions techniques, contrats de données/API, risques et découpage | Kimi prépare ; revue séparée avant travail sensible |
| UX/UI | Parcours, états, accessibilité, design system et rendu responsive | Kimi avec les ressources de marque ; recette visuelle dédiée |
| Développement | Code, tests nouveaux, modifications dans le périmètre | Kimi K2.7 Code |
| Assistance | Recherche, documentation, petits changements autorisés | GLM-5.3-Flash |
| Revue | Constats indépendants, cas limites et écarts à la spec | DeepSeek V4 Pro dans un contexte séparé |
| QA | Résultats fonctionnels, intégration, visuels et charge selon le risque | Outils de test fiables ; LLM pour préparer et analyser |
| Release / exploitation | Déploiement, vérifications, diagnostic et runbook | Services contrôlés ; LLM sans pouvoir d'approbation |

Les rôles Produit, Architecture et UX sont une extension à qualifier : leur
efficacité n'a pas été démontrée sur Fitnest. Le premier pilote de code utilise
des specs déjà validées. Aucun modèle ne s'attribue une nouvelle permission.

Le choix de fournisseur est interchangeable derrière l'adaptateur. Avant une
mise à jour du modèle, du prompt, du runner ou des outils, exécuter des tâches
représentatives et comparer réussite, régressions, coût total et temps de reprise.
Pas de changement automatique de modèle en milieu de release.

## 5. Cycle complet et déclencheurs

| Étape | Livrable / condition de sortie |
|---|---|
| Cadrage | Brief normalisé, acteurs, périmètre et hypothèses acceptés |
| Conception | Parcours, contraintes non fonctionnelles, architecture et contrats vérifiables |
| Planification | Graphe des tâches et dépendances, tests, risques, budget et priorités |
| Réalisation | Branches isolées, diffs autorisés, vérification et revue séparée |
| Intégration | File de fusion ; revalidation sur la nouvelle base et absence de régression |
| Recette | Préproduction isolée, parcours critiques, rendu mobile, performance et acceptation |
| Livraison | Autorisation selon politique, version exacte, contrôles après déploiement et preuves |
| Exploitation | Mesures, alertes, sauvegardes/restauration testées et responsable d'incident |
| Évolution | Nouvelle demande évaluée puis reprise du même cycle avec analyse d'impact |

Une demande de feature ne réécrit pas silencieusement une spec approuvée : elle
crée une version, un diff de périmètre et un impact sur tests, migration, coût et
délai. Un projet existant commence par un diagnostic et une baseline de tests.
La pile existante est respectée sauf décision de migration explicite.

Après livraison, les événements de supervision et fenêtres de maintenance
configurées peuvent ouvrir un travail de diagnostic ou une PR. Les événements
sont authentifiés, dédupliqués et regroupés pour éviter une boucle d'alertes qui
consommerait le budget. Une anomalie ne devient pas automatiquement un ordre de
modifier la production.

Pour le scaling de l'application : mesurer latence, erreurs, saturation, files et
coût par opération ; fixer les objectifs selon le projet ; tester la charge ;
proposer cache, index, worker ou capacité supplémentaire sur une cause mesurée.
Seules les plages d'autoscaling préautorisées peuvent augmenter la capacité sans
nouvelle décision financière. Kubernetes et microservices ne sont pas des
prérequis systématiques.

Pour le scaling de la plateforme : commencer avec un worker et une tâche active,
puis augmenter les jobs isolés après mesure. Quotas et priorités par client,
verrou de publication par dépôt et ordonnancement équitable évitent qu'un projet
monopolise la capacité ou produise des changements contradictoires.

## 6. Contrat minimal d'un projet

Le contrat versionné contient :

- `tenant_id`, `project_id`, propriétaire et approbateurs autorisés ;
- dépôts permis, compte GitHub exact, branches et commits de référence ;
- brief, specs et décisions approuvées, exclusions, jalons et critères métier ;
- ressources de marque, design system et parcours à vérifier ;
- stack et versions, commandes de build/test, adaptateurs et environnements ;
- chemins protégés, règles de migration, risques et politique d'autonomie ;
- références de secrets, limites réseau et catégories de données permises ;
- budgets par période/projet/release/tâche, réservations et quotas de concurrence ;
- objectifs de disponibilité et performance, sauvegarde, reprise et escalade ;
- durée de conservation, export et suppression à la fin du mandat.

Les secrets eux-mêmes n'y figurent jamais. La liste des tests n'est pas choisie
uniquement par le développeur évalué. Une entrée incomplète déclenche une demande
précise sur la décision manquante ; les travaux indépendants déjà autorisés peuvent
continuer.

## 7. Mémoire et séparation des clients

Les specs et décisions approuvées font foi. L'index de recherche est une vue
dérivée, pas une source qui peut changer le métier. Les extraits fournis à un
agent sont liés au dépôt, commit, version de spec et périmètre de sa tâche.
Un changement invalide les extraits affectés ; chaque run garde les références
exactes utilisées. Les sorties non approuvées restent des propositions.

L'autorisation `tenant_id` / `project_id` est appliquée côté service et stockage,
y compris pour la recherche sémantique, les preuves, les caches, exports et logs.
Chaque job possède son espace isolé et ses permissions temporaires. Le contexte
d'un client n'est jamais fourni à l'agent d'un autre client.

On mutualise les outils et gabarits génériques détenus par Ekwip. Réutiliser du
code, une donnée ou un document confidentiel d'un client exige le droit approprié.
Pour des contraintes fortes, prévoir ressources et comptes dédiés. Un simple
préfixe de dossier ou un namespace d'orchestrateur ne suffit pas à prouver
l'isolation.

## 8. Niveaux d'autonomie et responsabilité

| Niveau | Actions autorisées par défaut |
|---|---|
| Analyse | Lecture du périmètre et propositions, sans effet externe |
| Réalisation | Modification isolée, tests et PR dans le budget autorisé |
| Préproduction | Déploiement isolé et recette après contrôles |
| Production | Exécution dans les limites d'une politique approuvée et avec l'approbation prévue |

Pendant le pilote, chaque livraison production conserve l'approbation explicite
existante. Une future politique peut préautoriser certaines opérations à faible
risque ; elle est versionnée, bornée et révocable, avec arrêt d'urgence. Les
changements destructifs de données, d'identité, de paiement, de droits ou de
budget ne sont pas préautorisés par cette conception.

Ekwip conserve les décisions produit, les engagements client et le pouvoir de
publication. Un responsable humain assure l'escalade des incidents. Le chat peut
aider à concevoir et auditer ; il ne devient pas à lui seul un service permanent.
La disponibilité continue exige le déploiement réel des services, alertes et
procédures d'astreinte prévues.

## 9. Dashboard et économie du service

La vue d'entrée est le portefeuille Ekwip : projets, jalons, santé, dépenses et
décisions en attente. Navigation : client → projet → release → tâche → tentative.
Une alerte ou un blocage affiche la cause, le responsable et l'action disponible.
Un projet sans mesure de santé est « non instrumenté », pas « sain ».

Le coût inclut LLM, runners, CI, stockage et hébergement mesurés. Les coûts
communs ont une règle d'allocation affichée ; ils ne sont pas présentés comme
une facture fournisseur exacte par tâche. L'avancement distingue tâches
acceptées, valeur livrée et reste à faire ; les prévisions gardent leurs hypothèses.

Les plafonds sont hiérarchiques : plateforme → client → projet → release → tâche.
Une réservation vérifie tous les plafonds concernés. Revue, corrections et
maintenance consomment une enveloppe identifiée ; aucun budget de maintenance
illimité n'est créé à la livraison. Une demande additionnelle hors périmètre
affiche l'écart estimé avant son activation.

Les 25 USD précédemment proposés couvrent seulement le pilote API borné. Ils ne
sont ni le coût de construction de la plateforme, ni son budget mensuel total,
ni une autorisation de provisionner une infrastructure payante.

## 10. Lots de réalisation et preuves

| Lot | Contenu | Condition pour passer au suivant |
|---|---|---|
| P1 — Pilotage commun | Dépôt privé plateforme, registre projets/contrats, droits, registre de coûts, dashboard ; démonstrations étiquetées | Accès croisé refusé entre deux projets synthétiques ; aucun coût inconnu affiché à zéro |
| P2 — Une vraie livraison | Temporal, adaptateur OpenCode, routage des trois modèles, comptage, tests/revue/PR/préproduction sur Fitnest | Une tâche autorisée réussit ; coupure et reprise prouvées ; plafond respecté avant appels |
| P3 — Réutilisation | Un second projet autorisé, templates versionnés, dépendances et file de fusion | Même moteur sans fork spécifique ; aucun mélange de secrets, contexte, coûts ou preuves |
| P4 — Exploitation | Supervision, incidents, maintenance, versions suivantes, mesure de charge et capacité | Incident simulé traité et tracé ; feature suivante livrée sans régression ; procédure de reprise testée |

P1 n'a pas besoin d'attendre les clés LLM. P2 requiert les accès, le budget activé
et les gates métier du projet. P3 ne donne pas implicitement accès à tous les
clients. P4 n'active une surveillance qu'après configuration explicite de ses
sources, seuils, destinataires et permissions.

Critères transverses : après redémarrage, pas de perte de dépenses ni reprise
aveugle d'effets externes ; preuves invalidées après changement de commit ; refus
d'une auto-approbation ; impossibilité pour le code candidat de modifier le
contrôleur ; contrôle d'accès sur toutes les lectures et actions ; arrêt de la
file sans effacer les travaux ou coûts déjà engagés.

La fondation Fitnest existante reste limitée à son périmètre de spec 005. Cette
architecture n'en coche aucune intégration live et ne lève pas les exigences SEC
ou l'approbation fondateur de la slice 001.

## Sources de faisabilité technique

- [Temporal : workflows, état et reprise](https://docs.temporal.io/workflows)
- [Temporal : activités et nouvelles tentatives](https://docs.temporal.io/activities)
- [OpenCode : SDK, sessions et événements](https://opencode.ai/docs/sdk/)
- [GitHub Actions : sécurité des exécutions](https://docs.github.com/en/actions/reference/security/secure-use)

Les choix d'architecture sont des recommandations pour ce périmètre. Aucun de
ces documents officiels ne prouve que notre plateforme est déjà implémentée,
isolée entre clients, disponible en continu ou capable de remplacer sans
supervision toutes les fonctions d'une équipe de développement.
