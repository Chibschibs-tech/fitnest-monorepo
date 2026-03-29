// Internationalization configuration
export const locales = ['fr', 'en'] as const
export const defaultLocale = 'fr' as const

export type Locale = (typeof locales)[number]

// Translation keys
export const translations = {
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      mealPlans: 'Plans repas',
      meals: 'Menu',
      howItWorks: 'Comment ça marche',
      contact: 'Contact',
      login: 'Connexion',
      myAccount: 'Mon compte',
      subscribe: 'S\'abonner',
    },
    // Home page
    home: {
      hero: {
        viewMealPlans: 'Voir les plans repas',
        howItWorks: 'Comment ça marche',
      },
      howItWorks: {
        label: 'SIMPLE ET ADAPTÉ',
        title: 'Comment ça marche',
        subtitle: 'Des repas sains sur votre table en 3 étapes simples, sans prise de tête.',
        choosePlan: {
          title: 'Choisir un plan',
          description: 'Sélectionnez parmi nos menus adaptés à vos besoins et objectifs alimentaires.',
        },
        weCook: {
          title: 'Nous cuisinons',
          description: 'Nos chefs experts préparent vos repas quotidiennement en utilisant uniquement les ingrédients les plus frais, sourcés localement.',
        },
        weDeliver: {
          title: 'Nous livrons',
          description: 'Des créneaux de livraison flexibles jusqu\'à votre porte. À réchauffer et à savourer en moins de 3 minutes.',
        },
      },
      choosePlan: {
        title: 'Choisissez votre plan',
        subtitle: 'Des formules flexibles : mettez en pause ou résiliez quand vous voulez. Pas de frais cachés.',
        week: '/semaine',
        lowCarb: {
          price: 'à partir de 420 MAD',
        },
        balanced: {
          price: 'à partir de 450 MAD',
        },
        proteinPower: {
          price: '500 MAD',
        },
        weightLoss: {
          title: 'Weight Loss',
          subtitle: 'Plus léger, toujours d\'attaque.',
          description: 'Repas équilibrés avec moins de glucides',
          features: {
            reducedCarbs: 'Moins de glucides, énergie plus stable',
            highProtein: 'Riche en protéines et en fibres',
            lowGlycemic: 'Faible impact sur la glycémie',
            weightControl: 'Idéal pour gérer son poids',
          },
          select: 'Choisir',
        },
        stayFit: {
          title: 'Stay Fit',
          subtitle: 'L\'allié de votre quotidien.',
          description: 'Un équilibre nutritionnel idéal pour manger sainement au long cours',
          features: {
            wellBalanced: 'Macros bien équilibrés',
            nutrientDense: 'Aliments denses en nutriments',
            realLife: 'Pensé pour la vraie vie (travail, famille, sport)',
            sustainable: 'Durable, sans extrêmes ni frustration',
          },
          select: 'Choisir',
        },
        muscleGain: {
          title: 'Muscle Gain',
          subtitle: 'Énergie, récupération, performance.',
          description: 'Apport protéique élevé pour la masse musculaire et les efforts',
          features: {
            highProtein: 'Apport protéique renforcé',
            trainingRecovery: 'Pensé pour l\'entraînement et la récupération',
            cleanCarbs: 'Glucides de qualité quand il le faut',
            performance: 'Repas orientés performance',
          },
          select: 'Choisir',
        },
      },
      whyChooseFitnest: {
        title: 'Pourquoi choisir Fitnest',
        healthFirst: {
          title: 'La santé avant tout',
          description: 'Chaque repas est conçu pour nourrir votre corps et promouvoir le bien-être à long terme.',
        },
        simplicity: {
          title: 'Simple et pratique',
          description: 'On enlève les freins du quotidien : des repas adaptés à vous, livrés à domicile.',
        },
        transformation: {
          title: 'Changer durablement ses habitudes',
          description: 'On vous accompagne sur la durée : nutrition équilibrée, pédagogie et conseils.',
        },
      },
      blog: {
        title: 'Dernières actualités de notre blog',
        subtitle: 'Conseils d\'experts en nutrition, sport et bien-être pour progresser vers vos objectifs santé.',
        mealPrep: 'Préparation de repas',
        nutrition: 'Nutrition',
        fitness: 'Fitness',
        wellness: 'Bien-être',
        readMore: 'Lire la suite',
        readArticle: 'Lire l\'article',
        viewAllArticles: 'Voir tous les articles',
        backToBlog: 'Retour au blog',
        min: 'min',
        minRead: 'min de lecture',
        youMightAlsoLike: 'Vous pourriez aussi aimer',
        post1: {
          title: 'Pourquoi la livraison de repas sains transforme votre quotidien au Maroc',
          description: 'Découvrez comment les repas préparés par des chefs peuvent vous faire gagner du temps tout en améliorant votre santé et votre bien-être.',
          category: 'Nutrition',
          readTime: '5 min de lecture',
        },
        post2: {
          title: '5 mythes nutritionnels courants démystifiés',
          description: 'Séparer les faits de la fiction : des experts en nutrition se prononcent sur les allégations diététiques populaires et les idées fausses.',
          category: 'Nutrition',
          readTime: '7 min de lecture',
        },
        post3: {
          title: 'Surmonter un plateau de perte de poids avec une alimentation équilibrée',
          description: 'Stratégies efficaces pour surmonter une progression bloquée et continuer votre parcours de perte de poids grâce à des repas adaptés.',
          category: 'Fitness',
          readTime: '8 min de lecture',
        },
        post4: {
          title: 'Pourquoi les protéines sont essentielles pour la construction musculaire',
          description: 'Comprendre le rôle des protéines dans le développement et la récupération musculaire, et comment optimiser votre apport avec des repas équilibrés.',
          category: 'Nutrition',
          readTime: '6 min de lecture',
        },
        post5: {
          title: 'L\'art de l\'alimentation consciente : améliorer votre relation avec la nourriture',
          description: 'Comment pratiquer la pleine conscience pendant les repas peut transformer vos habitudes alimentaires et votre bien-être général.',
          category: 'Bien-être',
          readTime: '9 min de lecture',
        },
      },
      expressShop: {
        title: 'Express Shop',
        subtitle: 'Snacks sains et compléments pour compléter vos plans repas et garder le rythme toute la journée.',
        shopNow: 'Acheter',
        visitExpressShop: 'Visiter l\'Express Shop',
        from: 'À partir de',
      },
      cta: {
        title: 'Prêt à transformer votre mode de vie ?',
        description: 'Avec nous, manger sainement devient simple et plaisant, au fil des jours. Faites le premier pas vers une meilleure forme dès aujourd\'hui.',
        button: 'Commencer maintenant',
      },
    },
    waitlist: {
      hero: {
        badge: 'Nouvelles recettes chaque semaine',
        title: 'Vos plans repas sains,',
        titleHighlight: 'livrés frais',
        description: 'Rejoignez la communauté Fitnest : des repas préparés par nos chefs, équilibrés nutritionnellement, livrés frais jusqu\'à votre porte au Grand Casablanca.',
        chefPrepared: 'Préparé par des chefs',
        freshIngredients: 'Ingrédients frais',
        freeDelivery: 'Livraison gratuite',
      },
      form: {
        firstName: 'Prénom *',
        lastName: 'Nom *',
        email: 'Adresse e-mail *',
        phone: 'Numéro de téléphone',
        mealPlan: 'Plan de repas préféré',
        city: 'Ville',
        notifications: 'Je souhaite recevoir des mises à jour et des offres spéciales',
        submit: 'Rejoindre la liste d\'attente',
        submitting: 'Envoi en cours...',
        success: 'Vous êtes inscrit(e) sur la liste d\'attente !',
        redirecting: 'Redirection vers la page de confirmation...',
        error: 'Veuillez remplir tous les champs obligatoires',
        errorGeneric: 'Une erreur s\'est produite. Veuillez réessayer.',
        privacy: '20% de réduction sur votre premier abonnement mensuel',
        selectPlan: 'Sélectionner un plan',
        phonePlaceholder: '+212 6XX XXX XXX',
        cityPlaceholder: 'Casablanca, Rabat, etc.',
      },
      socialProof: {
        waitlistCount: '46 personnes déjà inscrites',
        rating: 'Objectif : note 4,9/5',
        launch: 'Environ 15 nouveaux abonnés par semaine',
      },
      howItWorks: {
        title: 'Comment fonctionne Fitnest',
        subtitle: 'Simple, pensé pour les journées chargées',
        step1: {
          title: 'Choisissez votre plan',
          description: 'Weight Loss, Stay Fit, Muscle Gain ou Keto : choisissez la formule qui vous correspond',
        },
        step2: {
          title: 'On prépare, on cuisine',
          description: 'Nos chefs préparent vos repas avec des ingrédients frais, locaux quand c\'est possible, et un équilibre nutritionnel soigné',
        },
        step3: {
          title: 'Livraison fraîche',
          description: 'Recevez vos repas à domicile, prêts à réchauffer et à déguster',
        },
      },
      mealPlans: {
        title: 'Nos plans de repas',
        subtitle: 'Des formules pensées avec des nutritionnistes pour vous aider à atteindre vos objectifs santé',
        lowCarb: {
          title: 'Weight Loss',
          description: 'Repas équilibrés avec moins de glucides',
          calories: 'Calories :',
          caloriesValue: '1 200–1 500 / jour',
          protein: 'Protéines :',
          proteinValue: 'Élevées',
          startingAt: 'À partir de :',
          price: '420 MAD / semaine',
          badge: 'Le plus populaire',
        },
        balanced: {
          title: 'Stay Fit',
          description: 'Équilibre nutritionnel idéal pour une alimentation saine au quotidien',
          calories: 'Calories :',
          caloriesValue: '1 800–2 200 / jour',
          macros: 'Macros :',
          macrosValue: 'Équilibrés',
          startingAt: 'À partir de :',
          price: '450 MAD / semaine',
        },
        proteinPower: {
          title: 'Muscle Gain',
          description: 'Apport protéique élevé pour la masse musculaire et la performance',
          calories: 'Calories :',
          caloriesValue: '2 000–2 500 / jour',
          protein: 'Protéines :',
          proteinValue: 'Très élevées',
          startingAt: 'À partir de :',
          price: '500 MAD / semaine',
        },
      },
      testimonials: {
        title: 'Ce que disent nos testeurs bêta',
        subtitle: 'Vrais retours d\'utilisateurs qui ont testé nos plans repas',
        testimonial1: {
          text: 'J\'ai testé Fitnest en bêta : un vrai régal, des saveurs riches et authentiques. Je ne perds plus de temps à planifier mes repas ni à courir les courses.',
          author: 'Aicha M.',
          location: 'Casablanca',
        },
        testimonial2: {
          text: 'Une super expérience : chaque livraison était soignée et vraiment équilibrée. Fini les heures passées au supermarché — Fitnest m\'a simplifié le quotidien.',
          author: 'Youssef K.',
          location: 'Rabat',
        },
        testimonial3: {
          text: 'J\'étais dans le programme bêta : au-delà de mes attentes. Frais, savoureux, bien portionnés. Je me concentre sur l\'essentiel, Fitnest s\'occupe de mes repas.',
          author: 'Fatima Z.',
          location: 'Marrakech',
        },
      },
      features: {
        title: 'Pourquoi choisir Fitnest ?',
        subtitle: 'On vise l\'excellence à chaque livraison',
        madeWithLove: {
          title: 'Fait avec passion',
          description: 'Nos chefs préparent chaque repas avec soin, en s\'inspirant aussi des savoir-faire de la cuisine marocaine',
        },
        foodSafety: {
          title: 'La sécurité alimentaire avant tout',
          description: 'Cuisine suivant les règles HACCP, normes strictes et chaîne du froid respectée jusqu\'à chez vous',
        },
        localFresh: {
          title: 'Local et frais',
          description: 'Priorité aux producteurs et ingrédients marocains pour de la fraîcheur et du goût',
        },
        nutritionistApproved: {
          title: 'Validé par des nutritionnistes',
          description: 'Des menus pensés avec des nutritionnistes diplômés pour un bon équilibre macro et micronutriments',
        },
      },
      faq: {
        title: 'Questions fréquemment posées',
        subtitle: 'Tout ce que vous devez savoir sur Fitnest',
        q1: {
          question: 'Fitnest est-il déjà disponible ?',
          answer: 'Oui, Fitnest est en activité. Nous ouvrons les inscriptions progressivement via la liste d\'attente pour garder un service irréprochable face à la demande.',
        },
        q2: {
          question: 'Combien coûtent les plans repas ?',
          answer: 'Les tarifs démarrent à 420 MAD par semaine (soit environ 60 MAD par jour selon la formule). Les inscrits sur la liste d\'attente bénéficient de 20 % sur le premier mois au lancement de leur abonnement.',
        },
        q3: {
          question: 'Puis-je personnaliser mes repas ?',
          answer: 'Oui. Indiquez allergies, restrictions et goûts : nous adaptons le menu dans la mesure du possible.',
        },
        q4: {
          question: 'À quelle fréquence livrez-vous ?',
          answer: 'Nous livrons des repas frais 2 à 3 fois par semaine pour garder une qualité optimale. Vous choisissez les créneaux qui vous conviennent.',
        },
        q5: {
          question: 'Et si un repas ne me plaît pas ?',
          answer: 'Nous appliquons une politique de satisfaction : en cas de problème sur un repas, nous trouvons une solution (remplacement ou remboursement selon les conditions en vigueur).',
        },
      },
      cta: {
        title: 'Prêt à transformer votre santé ?',
        description: 'Rejoignez les 46 premiers inscrits sur la liste d\'attente et passez à une alimentation plus sereine.',
        joinNow: 'S\'inscrire sur la liste d\'attente',
        learnMore: 'En savoir plus',
        privacy: 'Pas de spam. Désinscription en un clic. Priorité d\'accès pour les inscrits sur la liste d\'attente.',
      },
      waitlistReason: {
        title: 'Pourquoi une liste d\'attente ?',
        description: 'Pour garder la même qualité de cuisine, de livraison et de service, nous limitons le nombre de nouveaux abonnés chaque semaine. La liste d\'attente nous permet d\'intégrer tout le monde dans de bonnes conditions.',
      },
    },
    footer: {
      description: 'Repas sains livrés à Casablanca et environs, adaptés à vos objectifs.',
      navigation: 'Navigation',
      company: 'Entreprise',
      legal: 'Légal',
      contact: 'Contact',
      followUs: 'Suivez-nous',
      mealPlans: 'Plans repas',
      howItWorks: 'Comment ça marche',
      blog: 'Blog',
      about: 'À propos',
      contactUs: 'Contactez-nous',
      waitlist: 'Liste d\'attente',
      terms: 'CGU',
      privacy: 'Confidentialité',
      legalMentions: 'Mentions légales',
      copyright: 'Tous droits réservés',
      rights: '© {year} Fitnest. Tous droits réservés.',
    },
    legal: {
      terms: {
        title: 'Conditions Générales d\'Utilisation',
        lastUpdated: 'Dernière mise à jour',
        introduction: {
          title: '1. Introduction',
          content: 'Bienvenue sur Fitnest. Ces Conditions Générales d\'Utilisation régissent votre utilisation de notre site web, application mobile et services. En accédant ou en utilisant Fitnest, vous acceptez d\'être lié par ces Conditions. Si vous n\'êtes pas d\'accord avec une partie de ces conditions, vous ne pouvez pas accéder à nos services.',
        },
        definitions: {
          title: '2. Définitions',
          service: 'Le "Service" fait référence au service de préparation et de livraison de repas fourni par Fitnest.',
          user: 'L\'"Utilisateur" fait référence à la personne qui accède ou utilise le Service, qu\'il s\'agisse d\'un utilisateur enregistré ou d\'un invité.',
          subscription: 'L\'"Abonnement" fait référence au service de plan de repas récurrent proposé par Fitnest.',
        },
        account: {
          title: '3. Inscription au compte',
          content1: 'Pour utiliser certaines fonctionnalités de notre Service, vous pouvez être amené à créer un compte. Vous acceptez de fournir des informations exactes, actuelles et complètes lors du processus d\'inscription et de mettre à jour ces informations pour les garder exactes, actuelles et complètes.',
          content2: 'Vous êtes responsable de la protection du mot de passe que vous utilisez pour accéder au Service et de toutes les activités ou actions effectuées sous votre mot de passe. Nous vous encourageons à utiliser un mot de passe fort (en utilisant une combinaison de lettres majuscules et minuscules, de chiffres et de symboles) avec votre compte.',
        },
        subscriptions: {
          title: '4. Abonnements et commandes',
          intro: 'En vous abonnant à nos plans de repas, vous acceptez les conditions suivantes :',
          item1: 'Les frais d\'abonnement seront facturés automatiquement selon le plan que vous sélectionnez (hebdomadaire, bihebdomadaire ou mensuel).',
          item2: 'Vous pouvez modifier ou annuler votre abonnement à tout moment via les paramètres de votre compte ou en contactant notre service client au moins 48 heures avant votre prochaine livraison prévue.',
          item3: 'Les modifications de votre abonnement, y compris l\'adresse de livraison, les préférences de repas ou le calendrier de livraison, doivent être effectuées au moins 48 heures avant votre livraison prévue.',
          item4: 'Nous nous réservons le droit d\'ajuster les prix de nos abonnements avec un préavis raisonnable aux abonnés.',
        },
        delivery: {
          title: '5. Livraison',
          intro: 'Fitnest livrera les repas à l\'adresse fournie par l\'Utilisateur lors du processus de commande. En utilisant notre Service, vous acceptez ce qui suit :',
          item1: 'Vous fournirez des informations de livraison exactes, y compris l\'adresse et les coordonnées.',
          item2: 'Vous ou une personne autorisée par vous serez disponible pour recevoir la livraison pendant la fenêtre de livraison spécifiée.',
          item3: 'Si personne n\'est disponible pour recevoir la livraison, nous laisserons le colis à la porte s\'il est sûr de le faire, ou suivrons vos instructions de livraison si fournies.',
          item4: 'Fitnest n\'est pas responsable du vol, des dommages ou de la détérioration après que la livraison ait été effectuée.',
          item5: 'Les délais de livraison sont des estimations et peuvent varier en fonction de la circulation, des conditions météorologiques ou d\'autres circonstances imprévues.',
        },
        contact: {
          title: '11. Contactez-nous',
          intro: 'Si vous avez des questions concernant ces Conditions, veuillez nous contacter à :',
          email: 'E-mail : contact@fitnest.ma',
          phone: 'Téléphone : +212 522 123 456',
          address: 'Adresse : Casablanca, Maroc',
        },
      },
      privacy: {
        title: 'Politique de Confidentialité',
        lastUpdated: 'Dernière mise à jour',
        introduction: {
          title: '1. Introduction',
          content1: 'Chez Fitnest, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web, utilisez notre application mobile ou utilisez nos services de livraison de repas.',
          content2: 'Veuillez lire attentivement cette Politique de Confidentialité. Si vous n\'êtes pas d\'accord avec les termes de cette Politique de Confidentialité, veuillez ne pas accéder à nos services.',
        },
        information: {
          title: '2. Informations que nous collectons',
          intro: 'Nous collectons plusieurs types d\'informations auprès des utilisateurs de nos services, notamment :',
          personal: {
            title: '2.1 Informations personnelles',
            content: 'Les informations personnelles sont des données qui peuvent être utilisées pour vous identifier directement ou indirectement. Nous pouvons collecter les informations personnelles suivantes :',
            items: [
              'Informations de contact (telles que nom, adresse e-mail, numéro de téléphone et adresse de livraison)',
              'Identifiants de compte (tels que nom d\'utilisateur et mot de passe)',
              'Informations de paiement (telles que détails de carte de crédit, adresse de facturation)',
              'Préférences et restrictions alimentaires',
              'Objectifs de santé et de forme physique',
              'Historique des commandes et préférences',
            ],
          },
        },
        contact: {
          title: '11. Contactez-nous',
          intro: 'Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter à :',
          email: 'E-mail : contact@fitnest.ma',
          phone: 'Téléphone : +212 522 123 456',
          address: 'Adresse : Casablanca, Maroc',
        },
      },
      legalMentions: {
        title: 'Mentions Légales',
        company: {
          title: 'Informations sur l\'entreprise',
          name: 'Raison sociale : Fitnest',
          address: 'Siège social : Casablanca, Maroc',
          phone: 'Téléphone : +212 522 123 456',
          email: 'E-mail : contact@fitnest.ma',
        },
        publication: {
          title: 'Directeur de publication',
          name: 'Nom: Chihab Jabri',
          role: 'Rôle: Directeur de publication',
        },
        hosting: {
          title: 'Hébergement',
          provider: 'Fournisseur: Vercel Inc.',
          address: 'Adresse: 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis',
        },
        intellectual: {
          title: 'Propriété intellectuelle',
          content: 'L\'ensemble de ce site relève de la législation marocaine et internationale sur le droit d\'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.',
        },
        liability: {
          title: 'Limitation de responsabilité',
          content: 'Fitnest ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l\'utilisateur, lors de l\'accès au site, et résultant soit de l\'utilisation d\'un matériel ne répondant pas aux spécifications, soit de l\'apparition d\'un bug ou d\'une incompatibilité.',
        },
      },
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      mealPlans: 'Plans',
      meals: 'Menu',
      howItWorks: 'How It Works',
      contact: 'Contact',
      login: 'Login',
      myAccount: 'My account',
      subscribe: 'Subscribe',
    },
    // Home page
    home: {
      hero: {
        viewMealPlans: 'View Meal Plans',
        howItWorks: 'How It Works',
      },
      howItWorks: {
        label: 'SIMPLE & ADAPTED',
        title: 'How It Works',
        subtitle: 'Get healthy meals on your table in 3 simple steps without lifting a finger.',
        choosePlan: {
          title: 'Choose Plan',
          description: 'Select from our menus tailored to your dietary needs and goals.',
        },
        weCook: {
          title: 'We Cook',
          description: 'Expert chefs prepare your meals daily using only the freshest locally sourced ingredients.',
        },
        weDeliver: {
          title: 'We Deliver',
          description: 'Flexible delivery slots right to your door. Ready to heat and eat in under 3 minutes.',
        },
      },
      choosePlan: {
        title: 'Choose Your Plan',
        subtitle: 'Flexible plans that you can pause or cancel anytime. No hidden fees.',
        week: '/week',
        lowCarb: {
          price: 'from 420 MAD',
        },
        balanced: {
          price: 'from 450 MAD',
        },
        proteinPower: {
          price: '500 MAD',
        },
        weightLoss: {
          title: 'LOW CARB',
          subtitle: 'Eat lighter. Stay sharp',
          description: 'Balanced meals with reduced carbohydrate content',
          features: {
            reducedCarbs: 'Reduced carbs, steady energy',
            highProtein: 'High protein & fiber focus',
            lowGlycemic: 'Low glycemic impact',
            weightControl: 'Ideal for weight control',
          },
          select: 'SELECT',
        },
        stayFit: {
          title: 'BALANCED',
          subtitle: 'The smart everyday choice.',
          description: 'Perfect nutrient balance for healthy eating',
          features: {
            wellBalanced: 'Well-balanced macros',
            nutrientDense: 'Nutrient-dense ingredients',
            realLife: 'Built for real life routines',
            sustainable: 'Sustainable, no extremes',
          },
          select: 'SELECT',
        },
        muscleGain: {
          title: 'PROTEIN POWER',
          subtitle: 'Fuel. Recover. Perform.',
          description: 'High protein for muscle growth and performance',
          features: {
            highProtein: 'High protein intake',
            trainingRecovery: 'Optimized for training & recovery',
            cleanCarbs: 'Clean carbs when needed',
            performance: 'Performance-driven meals',
          },
          select: 'SELECT',
        },
      },
      whyChooseFitnest: {
        title: 'Why Choose Fitnest',
        healthFirst: {
          title: 'Health First',
          description: 'Every meal is designed to fuel your body and promote long-term well-being.',
        },
        simplicity: {
          title: 'Simplicity & Convenience',
          description: 'We remove barriers to healthy habits with personalized meals delivered to your door.',
        },
        transformation: {
          title: 'Lifestyle Transformation',
          description: 'We support your entire wellness journey through balanced nutrition, education, and guidance.',
        },
      },
      blog: {
        title: 'Latest from Our Blog',
        subtitle: 'Expert advice on nutrition, fitness, and healthy living to help you achieve your wellness goals.',
        mealPrep: 'Meal Prep',
        nutrition: 'Nutrition',
        fitness: 'Fitness',
        wellness: 'Wellness',
        readMore: 'Read More',
        readArticle: 'Read Article',
        viewAllArticles: 'View All Articles',
        backToBlog: 'Back to Blog',
        min: 'min',
        minRead: 'min read',
        youMightAlsoLike: 'You might also like',
        post1: {
          title: 'Why Healthy Meal Delivery Transforms Your Daily Life in Morocco',
          description: 'Discover how chef-prepared meals can save you time while improving your health and well-being.',
          category: 'Nutrition',
          readTime: '5 min read',
        },
        post2: {
          title: '5 Common Nutrition Myths Debunked',
          description: 'Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.',
          category: 'Nutrition',
          readTime: '7 min read',
        },
        post3: {
          title: 'Breaking Through a Weight Loss Plateau with Balanced Meals',
          description: 'Effective strategies to overcome stalled progress and continue your weight loss journey with tailored meals.',
          category: 'Fitness',
          readTime: '8 min read',
        },
        post4: {
          title: 'Why Protein is Essential for Muscle Building',
          description: 'Understanding the role of protein in muscle development and recovery, and how to optimize your intake with balanced meals.',
          category: 'Nutrition',
          readTime: '6 min read',
        },
        post5: {
          title: 'The Art of Mindful Eating: Improving Your Relationship with Food',
          description: 'How practicing mindfulness during meals can transform your eating habits and overall well-being.',
          category: 'Wellness',
          readTime: '9 min read',
        },
      },
      expressShop: {
        title: 'Express Shop',
        subtitle: 'Discover our selection of healthy snacks and supplements to complement your meal plans and keep you energized throughout the day.',
        shopNow: 'Shop Now',
        visitExpressShop: 'Visit Express Shop',
        from: 'From',
      },
      cta: {
        title: 'Ready to Transform Your Lifestyle?',
        description: 'Join us in our mission to make healthy eating simple, enjoyable, and part of everyday life. Take the first step toward a healthier you today.',
        button: 'Get Started Today',
      },
    },
    waitlist: {
      hero: {
        badge: 'New recipes every week',
        title: 'Your Healthy Meal Plans,',
        titleHighlight: 'Delivered Fresh',
        description: 'Join the Fitnest community and transform your health with chef-prepared, nutritionally balanced meal plans delivered right to your door.',
        chefPrepared: 'Chef-Prepared',
        freshIngredients: 'Fresh Ingredients',
        freeDelivery: 'Free Delivery',
      },
      form: {
        firstName: 'First Name *',
        lastName: 'Last Name *',
        email: 'Email Address *',
        phone: 'Phone Number',
        mealPlan: 'Preferred Meal Plan',
        city: 'City',
        notifications: 'I want to receive updates and special offers',
        submit: 'Join the Waitlist',
        submitting: 'Submitting...',
        success: 'You\'re on the list!',
        redirecting: 'Redirecting to confirmation page...',
        error: 'Please fill in all required fields',
        errorGeneric: 'Something went wrong. Please try again.',
        privacy: '20% off on your first monthly subscription',
        selectPlan: 'Select a plan',
        phonePlaceholder: '+212 6XX XXX XXX',
        cityPlaceholder: 'Casablanca, Rabat, etc.',
      },
      socialProof: {
        waitlistCount: '46 people in the waitlist',
        rating: '4.9/5 Rating Expected',
        launch: '15 new subscribers every week',
      },
      howItWorks: {
        title: 'How Fitnest Works',
        subtitle: 'Simple, convenient, and designed for your busy lifestyle',
        step1: {
          title: 'Choose Your Plan',
          description: 'Select from our Low Carb, Balanced, or Protein Power meal plans tailored to your goals',
        },
        step2: {
          title: 'We Prepare & Cook',
          description: 'Our chefs prepare your meal plans with fresh, local ingredients and precise nutritional balance',
        },
        step3: {
          title: 'Delivered Fresh',
          description: 'Receive your meal plans delivered fresh to your door, ready to heat and enjoy',
        },
      },
      mealPlans: {
        title: 'Our Meal Plans',
        subtitle: 'Scientifically designed meal plans to help you achieve your health goals',
        lowCarb: {
          title: 'Low Carb',
          description: 'Balanced meal plans with reduced carbohydrate content',
          calories: 'Calories:',
          caloriesValue: '1,200-1,500/day',
          protein: 'Protein:',
          proteinValue: 'High',
          startingAt: 'Starting at:',
          price: '420 MAD/week',
          badge: 'Most Popular',
        },
        balanced: {
          title: 'Balanced',
          description: 'Perfect nutrient balance for healthy eating',
          calories: 'Calories:',
          caloriesValue: '1,800-2,200/day',
          macros: 'Macros:',
          macrosValue: 'Balanced',
          startingAt: 'Starting at:',
          price: '450 MAD/week',
        },
        proteinPower: {
          title: 'Protein Power',
          description: 'High protein for muscle growth and performance',
          calories: 'Calories:',
          caloriesValue: '2,000-2,500/day',
          protein: 'Protein:',
          proteinValue: 'Very High',
          startingAt: 'Starting at:',
          price: '500 MAD/week',
        },
      },
      testimonials: {
        title: 'What Our Beta Testers Say',
        subtitle: 'Real feedback from users who tested our meal plans',
        testimonial1: {
          text: 'I tested the meal plans during the beta phase and they were absolutely delicious! The flavors are rich and authentic. I\'ve completely stopped wasting time trying to figure out my food routine.',
          author: 'Aicha M.',
          location: 'Casablanca',
        },
        testimonial2: {
          text: 'The experience was so satisfying! Every meal plan I tested was perfectly prepared and nutritious. I no longer spend hours meal planning and grocery shopping. Fitnest has transformed my daily routine.',
          author: 'Youssef K.',
          location: 'Rabat',
        },
        testimonial3: {
          text: 'I was part of the beta testing program and the meal plans exceeded my expectations. Delicious, fresh, and perfectly portioned. I\'ve stopped wasting time on meal prep and can focus on what matters most.',
          author: 'Fatima Z.',
          location: 'Marrakech',
        },
      },
      features: {
        title: 'Why Choose Fitnest?',
        subtitle: 'We\'re committed to delivering the best meal plan experience',
        madeWithLove: {
          title: 'Made with Love',
          description: 'Every meal plan is prepared with care by our passionate chefs using traditional Moroccan cooking techniques',
        },
        foodSafety: {
          title: 'Food Safety First',
          description: 'HACCP certified kitchen with the highest food safety standards and temperature-controlled delivery',
        },
        localFresh: {
          title: 'Local & Fresh',
          description: 'We source ingredients from local Moroccan farms to ensure freshness and support our community',
        },
        nutritionistApproved: {
          title: 'Nutritionist Approved',
          description: 'All meal plans are designed by certified nutritionists to ensure optimal macro and micronutrient balance',
        },
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about Fitnest',
        q1: {
          question: 'When will Fitnest be available?',
          answer: 'Fitnest is already operating. We are progressively adding people every week from our waitlist to maintain the quality of our services and respond to the growing demand in a controlled manner.',
        },
        q2: {
          question: 'How much do meal plans cost?',
          answer: 'Starting from 145 MAD per day, you can begin your journey with Fitnest. Waitlist members get 20% off their first month when we launch.',
        },
        q3: {
          question: 'Can I customize my meals?',
          answer: 'Yes! You can specify dietary restrictions, allergies, and food preferences. Our chefs will customize your meals accordingly.',
        },
        q4: {
          question: 'How often do you deliver?',
          answer: 'We deliver fresh meals 2-3 times per week to ensure maximum freshness. You can choose your preferred delivery days and times.',
        },
        q5: {
          question: 'What if I don\'t like a meal?',
          answer: 'We offer a 100% satisfaction guarantee. If you\'re not happy with any meal, we\'ll replace it or provide a full refund.',
        },
      },
      cta: {
        title: 'Ready to Transform Your Health?',
        description: 'Join 46 people who are already on the waitlist for the future of healthy eating.',
        joinNow: 'Join the Waitlist Now',
        learnMore: 'Learn More',
        privacy: 'No spam, ever. Unsubscribe at any time. Early access guaranteed for waitlist members.',
      },
      waitlistReason: {
        title: 'Why a Waitlist?',
        description: 'To guarantee the quality of our processes and stay consistent, we are currently limiting new subscriptions and adding new members every week due to the overload we are receiving. This is why we have set up a waitlist.',
      },
    },
    footer: {
      description: 'Healthy meal plans delivered, tailored to your goals.',
      navigation: 'Navigation',
      company: 'Company',
      legal: 'Legal',
      contact: 'Contact',
      followUs: 'Follow Us',
      mealPlans: 'Meal Plans',
      howItWorks: 'How It Works',
      blog: 'Blog',
      about: 'About',
      contactUs: 'Contact Us',
      waitlist: 'Waitlist',
      terms: 'Terms',
      privacy: 'Privacy',
      legalMentions: 'Legal Mentions',
      copyright: 'All rights reserved',
      rights: '© {year} Fitnest. All rights reserved.',
    },
    legal: {
      terms: {
        title: 'Terms and Conditions',
        lastUpdated: 'Last updated',
        introduction: {
          title: '1. Introduction',
          content: 'Welcome to Fitnest. These Terms and Conditions govern your use of our website, mobile application, and services. By accessing or using Fitnest, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.',
        },
        definitions: {
          title: '2. Definitions',
          service: '"Service" refers to the meal preparation and delivery service provided by Fitnest.',
          user: '"User" refers to the individual who accesses or uses the Service, whether as a registered user or guest.',
          subscription: '"Subscription" refers to the recurring meal plan service offered by Fitnest.',
        },
        account: {
          title: '3. Account Registration',
          content1: 'To use certain features of our Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.',
          content2: 'You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use a strong password (using a combination of upper and lower case letters, numbers, and symbols) with your account.',
        },
        subscriptions: {
          title: '4. Subscriptions and Orders',
          intro: 'By subscribing to our meal plans, you agree to the following terms:',
          item1: 'Subscription fees will be charged automatically according to the plan you select (weekly, bi-weekly, or monthly).',
          item2: 'You may modify or cancel your subscription at any time through your account settings or by contacting our customer service at least 48 hours before your next scheduled delivery.',
          item3: 'Changes to your subscription, including delivery address, meal preferences, or delivery schedule, must be made at least 48 hours before your scheduled delivery.',
          item4: 'We reserve the right to adjust pricing for our subscriptions with reasonable notice to subscribers.',
        },
        delivery: {
          title: '5. Delivery',
          intro: 'Fitnest will deliver meals to the address provided by the User during the ordering process. By using our Service, you agree to the following:',
          item1: 'You will provide accurate delivery information, including address and contact details.',
          item2: 'You or someone authorized by you will be available to receive the delivery during the specified delivery window.',
          item3: 'If no one is available to receive the delivery, we will leave the package at the door if it\'s safe to do so, or follow your delivery instructions if provided.',
          item4: 'Fitnest is not responsible for theft, damage, or spoilage after delivery has been completed.',
          item5: 'Delivery times are estimates and may vary based on traffic, weather conditions, or other unforeseen circumstances.',
        },
        contact: {
          title: '11. Contact Us',
          intro: 'If you have any questions about these Terms, please contact us at:',
          email: 'Email: contact@fitnest.ma',
          phone: 'Phone: +212 522 123 456',
          address: 'Address: Casablanca, Morocco',
        },
      },
      privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'Last updated',
        introduction: {
          title: '1. Introduction',
          content1: 'At Fitnest, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or use our meal delivery services.',
          content2: 'Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access our services.',
        },
        information: {
          title: '2. Information We Collect',
          intro: 'We collect several types of information from and about users of our services, including:',
          personal: {
            title: '2.1 Personal Information',
            content: 'Personal information is data that can be used to identify you directly or indirectly. We may collect the following personal information:',
            items: [
              'Contact information (such as name, email address, phone number, and delivery address)',
              'Account credentials (such as username and password)',
              'Payment information (such as credit card details, billing address)',
              'Dietary preferences and restrictions',
              'Health and fitness goals',
              'Order history and preferences',
            ],
          },
        },
        contact: {
          title: '11. Contact Us',
          intro: 'If you have any questions about this Privacy Policy, please contact us at:',
          email: 'Email: contact@fitnest.ma',
          phone: 'Phone: +212 522 123 456',
          address: 'Address: Casablanca, Morocco',
        },
      },
      legalMentions: {
        title: 'Legal Mentions',
        company: {
          title: 'Company Information',
          name: 'Company Name: Fitnest',
          address: 'Address: Casablanca, Morocco',
          phone: 'Phone: +212 522 123 456',
          email: 'Email: contact@fitnest.ma',
        },
        publication: {
          title: 'Publication Director',
          name: 'Name: Chihab Jabri',
          role: 'Role: Publication Director',
        },
        hosting: {
          title: 'Hosting',
          provider: 'Provider: Vercel Inc.',
          address: 'Address: 340 S Lemon Ave #4133, Walnut, CA 91789, United States',
        },
        intellectual: {
          title: 'Intellectual Property',
          content: 'This entire site is subject to Moroccan and international legislation on copyright and intellectual property. All reproduction rights are reserved, including for downloadable documents and iconographic and photographic representations.',
        },
        liability: {
          title: 'Limitation of Liability',
          content: 'Fitnest cannot be held liable for direct and indirect damage caused to the user\'s equipment, when accessing the site, and resulting either from the use of equipment that does not meet the specifications, or from the appearance of a bug or incompatibility.',
        },
      },
    },
  },
} as const

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

export function t(key: string, locale: Locale = defaultLocale): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to French if translation not found
      value = translations[defaultLocale]
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey]
      }
      break
    }
  }
  
  return typeof value === 'string' ? value : key
}

