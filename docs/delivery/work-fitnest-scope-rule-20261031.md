# Work Fitnest - limite de perimetre confirmee par Chihab
Date: 2026-10-31. Decision de coordination a relire a chaque reprise.

Chihab a explicitement demande de conserver cette limite apres avoir constate que Work Fitnest produisait manuellement des taches destinees a tourner sur Ekwip.

## Responsabilites
- Work Fitnest porte les exigences et decisions produit, la clarification des ambiguities, la conformite aux regles metier, l'examen des resultats et la recette jusqu'a une version testable.
- La plateforme Ekwip doit generer et traiter les taches, contrats/tests et profils progressivement de facon automatique, puis assurer execution, revue, correction, integration, deploiement et reprise.
- Work Ekwip corrige les defauts d'admission, reconnaissance de l'existant, orchestration, qualification et execution.
- Work Fitnest peut corriger un defaut produit concret identifie, avec attribution et coordination pour eviter les doublons. Cette exception ne justifie pas une seconde chaine manuelle de developpement.

## Regle pour la prochaine action
Avant de lancer un travail, identifier son responsable:
1. Exigence, ambiguite, non-conformite produit ou recette: Work Fitnest.
2. Admission, profil, reconnaissance, execution ou reprise: Work Ekwip / plateforme.
3. Tache generable par la plateforme: suivre son traitement, ne pas la recreer manuellement pour masquer un blocage.

## Priorite actuelle
Suivre les paquets produit PR158 et PR159 jusqu'a leur traitement, leur integration et leur recette. Ne pas continuer a fabriquer manuellement les taches suivantes pour annoncer de l'avancement.
PR158: https://github.com/Chibschibs-tech/fitnest-monorepo/pull/158
PR159: https://github.com/Chibschibs-tech/fitnest-monorepo/pull/159

## Preuves et compte rendu
Tests locaux et documents publies ne prouvent ni autonomie ni acceptation ni fonctionnement reel. Distinguer proposition, tests, CI, integration, recu et version testable.
Un blocage plateforme ne devient pas un travail produit manuel par defaut. Consigner son responsable et sa reference de depot; avancer sur les seules activites produit independantes justifiees.
Ne pas annoncer une surveillance ou une execution continue sans mecanisme effectivement actif.
Cette decision remplace les formulations anterieures qui attribuaient a Work Fitnest la cloture de l'autonomie Ekwip ou une preparation manuelle permanente de chaque tache.
