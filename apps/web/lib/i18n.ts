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
      mealPlans: 'Plans Repas',
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
        subtitle: 'Obtenez des repas sains sur votre table en 3 étapes simples sans lever le petit doigt.',
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
          description: 'Créneaux de livraison flexibles directement à votre porte. Prêt à réchauffer et à manger en moins de 3 minutes.',
        },
      },
      choosePlan: {
        title: 'Choisissez votre plan',
        subtitle: 'Des plans flexibles que vous pouvez mettre en pause ou annuler à tout moment. Aucun frais caché.',
        week: '/semaine',
        lowCarb: {
          price: 'à partir de 420 Dhs',
        },
        balanced: {
          price: 'à partir de 450 dhs',
        },
        proteinPower: {
          price: '500 dhs',
        },
        weightLoss: {
          title: 'LOW CARB',
          subtitle: 'Eat lighter. Stay sharp',
          description: 'Repas équilibrés avec une teneur réduite en glucides',
          features: {
            reducedCarbs: 'Reduced carbs, steady energy',
            highProtein: 'High protein & fiber focus',
            lowGlycemic: 'Low glycemic impact',
            weightControl: 'Ideal for weight control',
          },
          select: 'SÉLECTIONNER',
        },
        stayFit: {
          title: 'BALANCED',
          subtitle: 'The smart everyday choice.',
          description: 'Équilibre parfait des nutriments pour une alimentation saine',
          features: {
            wellBalanced: 'Well-balanced macros',
            nutrientDense: 'Nutrient-dense ingredients',
            realLife: 'Built for real life routines',
            sustainable: 'Sustainable, no extremes',
          },
          select: 'SÉLECTIONNER',
        },
        muscleGain: {
          title: 'PROTEIN POWER',
          subtitle: 'Fuel. Recover. Perform.',
          description: 'Protéines élevées pour la croissance musculaire et la performance',
          features: {
            highProtein: 'High protein intake',
            trainingRecovery: 'Optimized for training & recovery',
            cleanCarbs: 'Clean carbs when needed',
            performance: 'Performance-driven meals',
          },
          select: 'SÉLECTIONNER',
        },
      },
      whyChooseFitnest: {
        title: 'Pourquoi choisir Fitnest',
        healthFirst: {
          title: 'La santé avant tout',
          description: 'Chaque repas est conçu pour nourrir votre corps et promouvoir le bien-être à long terme.',
        },
        simplicity: {
          title: 'Simplicité et commodité',
          description: 'Nous supprimons les obstacles aux habitudes saines avec des repas personnalisés livrés à votre porte.',
        },
        transformation: {
          title: 'Transformation du mode de vie',
          description: 'Nous soutenons votre parcours de bien-être complet grâce à une nutrition équilibrée, l\'éducation et les conseils.',
        },
      },
      blog: {
        title: 'Dernières actualités de notre blog',
        subtitle: 'Des conseils d\'experts en nutrition, fitness et bien-être pour vous aider à atteindre vos objectifs de santé.',
        mealPrep: 'Préparation de repas',
        nutrition: 'Nutrition',
        fitness: 'Fitness',
        readMore: 'Lire la suite',
        viewAllArticles: 'Voir tous les articles',
        min: 'min',
        minRead: 'min de lecture',
        post1: {
          title: '10 conseils pour préparer des repas sains pour les professionnels occupés',
          description: 'Apprenez à préparer efficacement des repas nutritifs pour toute la semaine, même avec un emploi du temps chargé.',
        },
        post2: {
          title: '5 mythes nutritionnels courants démystifiés',
          description: 'Séparer les faits de la fiction : des experts en nutrition se prononcent sur les allégations diététiques populaires et les idées fausses.',
        },
        post3: {
          title: 'Surmonter un plateau de perte de poids',
          description: 'Stratégies efficaces pour surmonter une progression bloquée et continuer votre parcours de perte de poids.',
        },
      },
      expressShop: {
        title: 'Express Shop',
        subtitle: 'Découvrez notre sélection de collations saines et de compléments alimentaires pour compléter vos plans de repas et vous maintenir énergisé tout au long de la journée.',
        shopNow: 'Acheter',
        visitExpressShop: 'Visiter l\'Express Shop',
        from: 'À partir de',
      },
      cta: {
        title: 'Prêt à transformer votre mode de vie ?',
        description: 'Rejoignez-nous dans notre mission de rendre une alimentation saine simple, agréable et partie intégrante de la vie quotidienne. Faites le premier pas vers un vous plus sain dès aujourd\'hui.',
        button: 'Commencer maintenant',
      },
    },
    waitlist: {
      hero: {
        badge: '🎉 Nouvelles recettes chaque semaine',
        title: 'Vos repas sains,',
        titleHighlight: 'livrés frais',
        description: 'Rejoignez la communauté Fitnest et transformez votre santé avec des repas préparés par des chefs, équilibrés sur le plan nutritionnel, livrés directement à votre porte au Maroc.',
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
        submit: 'Rejoindre la waitlist',
        submitting: 'Envoi en cours...',
        success: 'Vous êtes sur la waitlist !',
        redirecting: 'Redirection vers la page de confirmation...',
        error: 'Veuillez remplir tous les champs obligatoires',
        errorGeneric: 'Une erreur s\'est produite. Veuillez réessayer.',
        privacy: '20% de réduction sur votre premier abonnement mensuel',
        selectPlan: 'Sélectionner un plan',
        phonePlaceholder: '+212 6XX XXX XXX',
        cityPlaceholder: 'Casablanca, Rabat, etc.',
      },
      socialProof: {
        waitlistCount: '46 personnes sur la waitlist',
        rating: 'Note attendue 4,9/5',
        launch: 'Lancement officiel 21/12/25',
      },
      howItWorks: {
        title: 'Comment fonctionne Fitnest',
        subtitle: 'Simple, pratique et conçu pour votre mode de vie chargé',
        step1: {
          title: 'Choisissez votre plan',
          description: 'Sélectionnez parmi nos plans Low Cal, Balanced ou Muscle Gain adaptés à vos objectifs',
        },
        step2: {
          title: 'Nous préparons et cuisinons',
          description: 'Nos chefs préparent vos repas avec des ingrédients frais et locaux et un équilibre nutritionnel précis',
        },
        step3: {
          title: 'Livré frais',
          description: 'Recevez vos repas livrés frais à votre porte, prêts à réchauffer et à déguster',
        },
      },
      mealPlans: {
        title: 'Nos plans de repas',
        subtitle: 'Des plans de repas conçus scientifiquement pour vous aider à atteindre vos objectifs de santé',
        lowCarb: {
          title: 'Low Carb',
          description: 'Repas équilibrés avec une teneur réduite en glucides',
          calories: 'Calories:',
          caloriesValue: '1,200-1,500/jour',
          protein: 'Protéines:',
          proteinValue: 'Élevées',
          startingAt: 'À partir de:',
          price: '420 Dhs/semaine',
          badge: 'Le plus populaire',
        },
        balanced: {
          title: 'Balanced',
          description: 'Équilibre parfait des nutriments pour une alimentation saine',
          calories: 'Calories:',
          caloriesValue: '1,800-2,200/jour',
          macros: 'Macros:',
          macrosValue: 'Équilibrés',
          startingAt: 'À partir de:',
          price: '450 dhs/semaine',
        },
        proteinPower: {
          title: 'Protein Power',
          description: 'Protéines élevées pour la croissance musculaire et la performance',
          calories: 'Calories:',
          caloriesValue: '2,000-2,500/jour',
          protein: 'Protéines:',
          proteinValue: 'Très élevées',
          startingAt: 'À partir de:',
          price: '500 dhs/semaine',
        },
      },
      testimonials: {
        title: 'Ce que disent nos testeurs bêta',
        subtitle: 'Vrais retours d\'utilisateurs qui ont testé nos repas',
        testimonial1: {
          text: 'J\'ai testé les repas pendant la phase bêta et ils étaient absolument délicieux ! Les saveurs sont riches et authentiques. J\'ai complètement arrêté de perdre du temps à essayer de comprendre ma routine alimentaire.',
          author: 'Aicha M.',
          location: 'Casablanca',
        },
        testimonial2: {
          text: 'L\'expérience était si satisfaisante ! Chaque repas que j\'ai testé était parfaitement préparé et nutritif. Je ne passe plus des heures à planifier les repas et à faire les courses. Fitnest a transformé ma routine quotidienne.',
          author: 'Youssef K.',
          location: 'Rabat',
        },
        testimonial3: {
          text: 'J\'ai fait partie du programme de test bêta et les repas ont dépassé mes attentes. Délicieux, frais et parfaitement portionnés. J\'ai arrêté de perdre du temps sur la préparation des repas et je peux me concentrer sur ce qui compte le plus.',
          author: 'Fatima Z.',
          location: 'Marrakech',
        },
      },
      features: {
        title: 'Pourquoi choisir Fitnest ?',
        subtitle: 'Nous nous engageons à offrir la meilleure expérience de repas au Maroc',
        madeWithLove: {
          title: 'Fait avec amour',
          description: 'Chaque repas est préparé avec soin par nos chefs passionnés en utilisant des techniques de cuisine marocaine traditionnelles',
        },
        foodSafety: {
          title: 'Sécurité alimentaire d\'abord',
          description: 'Cuisine certifiée HACCP avec les normes de sécurité alimentaire les plus élevées et livraison à température contrôlée',
        },
        localFresh: {
          title: 'Local et frais',
          description: 'Nous nous approvisionnons en ingrédients auprès de fermes marocaines locales pour garantir la fraîcheur et soutenir notre communauté',
        },
        nutritionistApproved: {
          title: 'Approuvé par des nutritionnistes',
          description: 'Tous les repas sont conçus par des nutritionnistes certifiés pour assurer un équilibre optimal des macro et micronutriments',
        },
      },
      faq: {
        title: 'Questions fréquemment posées',
        subtitle: 'Tout ce que vous devez savoir sur Fitnest',
        q1: {
          question: 'Quand Fitnest sera-t-il disponible ?',
          answer: 'Fitnest est déjà opérationnel. Nous ajoutons progressivement des personnes chaque semaine depuis notre waitlist afin de maintenir la qualité de nos services et de répondre à la demande croissante de manière contrôlée.',
        },
        q2: {
          question: 'Combien coûtent les plans de repas ?',
          answer: 'À partir de 145 dhs par jour, vous pouvez commencer votre parcours avec Fitnest. Les membres de la waitlist bénéficient de 20% de réduction sur leur premier mois lors du lancement.',
        },
        q3: {
          question: 'Puis-je personnaliser mes repas ?',
          answer: 'Oui ! Vous pouvez spécifier des restrictions alimentaires, des allergies et des préférences alimentaires. Nos chefs personnaliseront vos repas en conséquence.',
        },
        q4: {
          question: 'À quelle fréquence livrez-vous ?',
          answer: 'Nous livrons des repas frais 2 à 3 fois par semaine pour garantir une fraîcheur maximale. Vous pouvez choisir vos jours et heures de livraison préférés.',
        },
        q5: {
          question: 'Que se passe-t-il si je n\'aime pas un repas ?',
          answer: 'Nous offrons une garantie de satisfaction à 100%. Si vous n\'êtes pas satisfait d\'un repas, nous le remplacerons ou vous rembourserons intégralement.',
        },
      },
      cta: {
        title: 'Prêt à transformer votre santé ?',
        description: 'Rejoignez 46 personnes qui sont déjà sur la waitlist pour l\'avenir de l\'alimentation saine au Maroc.',
        joinNow: 'Rejoindre la waitlist maintenant',
        learnMore: 'En savoir plus',
        privacy: 'Pas de spam, jamais. Désabonnez-vous à tout moment. Accès anticipé garanti pour les membres de la waitlist.',
      },
      waitlistReason: {
        title: 'Pourquoi une waitlist ?',
        description: 'Pour garantir la qualité de nos processus et rester cohérents, nous limitons actuellement les nouvelles inscriptions et ajoutons de nouveaux membres chaque semaine en raison de la surcharge que nous recevons. C\'est pourquoi nous avons mis en place une waitlist.',
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
        readMore: 'Read More',
        viewAllArticles: 'View All Articles',
        min: 'min',
        minRead: 'min read',
        post1: {
          title: '10 Healthy Meal Prep Tips for Busy Professionals',
          description: 'Learn how to efficiently prepare nutritious meals for the entire week, even with a busy schedule.',
        },
        post2: {
          title: '5 Common Nutrition Myths Debunked',
          description: 'Separating fact from fiction: nutrition experts weigh in on popular diet claims and misconceptions.',
        },
        post3: {
          title: 'Breaking Through a Weight Loss Plateau',
          description: 'Effective strategies to overcome stalled progress and continue your weight loss journey.',
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
        badge: '🎉 New recipes every week',
        title: 'Your Healthy Meals,',
        titleHighlight: 'Delivered Fresh',
        description: 'Join the Fitnest community and transform your health with chef-prepared, nutritionally balanced meals delivered right to your door in Morocco.',
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
        launch: 'Official launch 21/12/25',
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
          description: 'Our chefs prepare your meals with fresh, local ingredients and precise nutritional balance',
        },
        step3: {
          title: 'Delivered Fresh',
          description: 'Receive your meals delivered fresh to your door, ready to heat and enjoy',
        },
      },
      mealPlans: {
        title: 'Our Meal Plans',
        subtitle: 'Scientifically designed meal plans to help you achieve your health goals',
        lowCarb: {
          title: 'Low Carb',
          description: 'Balanced meals with reduced carbohydrate content',
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
        subtitle: 'Real feedback from users who tested our meals',
        testimonial1: {
          text: 'I tested the meals during the beta phase and they were absolutely delicious! The flavors are rich and authentic. I\'ve completely stopped wasting time trying to figure out my food routine.',
          author: 'Aicha M.',
          location: 'Casablanca',
        },
        testimonial2: {
          text: 'The experience was so satisfying! Every meal I tested was perfectly prepared and nutritious. I no longer spend hours meal planning and grocery shopping. Fitnest has transformed my daily routine.',
          author: 'Youssef K.',
          location: 'Rabat',
        },
        testimonial3: {
          text: 'I was part of the beta testing program and the meals exceeded my expectations. Delicious, fresh, and perfectly portioned. I\'ve stopped wasting time on meal prep and can focus on what matters most.',
          author: 'Fatima Z.',
          location: 'Marrakech',
        },
      },
      features: {
        title: 'Why Choose Fitnest?',
        subtitle: 'We\'re committed to delivering the best meal experience in Morocco',
        madeWithLove: {
          title: 'Made with Love',
          description: 'Every meal is prepared with care by our passionate chefs using traditional Moroccan cooking techniques',
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
          description: 'All meals are designed by certified nutritionists to ensure optimal macro and micronutrient balance',
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
        description: 'Join 46 people who are already on the waitlist for the future of healthy eating in Morocco.',
        joinNow: 'Join the Waitlist Now',
        learnMore: 'Learn More',
        privacy: 'No spam, ever. Unsubscribe at any time. Early access guaranteed for waitlist members.',
      },
      waitlistReason: {
        title: 'Why a Waitlist?',
        description: 'To guarantee the quality of our processes and stay consistent, we are currently limiting new subscriptions and adding new members every week due to the overload we are receiving. This is why we have set up a waitlist.',
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

