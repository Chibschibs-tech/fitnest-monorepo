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
        label: 'PROCESSUS SIMPLE',
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
        weightLoss: {
          title: 'Perte de poids',
          description: 'Focus sur la satiété et la perte progressive',
          features: {
            calorieControlled: 'Repas contrôlés en calories',
            lowGlycemic: 'Indice glycémique faible',
            highFiber: 'Teneur élevée en fibres',
            appTracking: 'Suivi via l\'application inclus',
          },
          select: 'SÉLECTIONNER',
        },
        stayFit: {
          title: 'Rester en forme',
          description: 'Équilibre et variété pour le maintien',
          features: {
            perfectMacro: 'Équilibre parfait des macros',
            largeVariety: 'Grande variété de recettes',
            nutrientRich: 'Ingrédients riches en nutriments',
            weeklyRotation: 'Rotation hebdomadaire du menu',
            premiumSupport: 'Support premium',
          },
          select: 'SÉLECTIONNER',
        },
        muscleGain: {
          title: 'Prise de masse',
          description: 'Protéines élevées et focus sur la performance',
          features: {
            highProtein: 'Protéines élevées (150g+)',
            postWorkout: 'Récupération post-entraînement',
            cleanCarbs: 'Glucides propres supplémentaires',
            performance: 'Amélioration des performances',
          },
          select: 'SÉLECTIONNER',
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
        label: 'SIMPLE PROCESS',
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
        weightLoss: {
          title: 'Weight Loss',
          description: 'Focus on satiety & progressive loss',
          features: {
            calorieControlled: 'Calorie controlled meals',
            lowGlycemic: 'Low glycemic index',
            highFiber: 'High fiber content',
            appTracking: 'App tracking included',
          },
          select: 'SELECT',
        },
        stayFit: {
          title: 'Stay Fit',
          description: 'Balance & Variety for maintenance',
          features: {
            perfectMacro: 'Perfect macro balance',
            largeVariety: 'Large variety of recipes',
            nutrientRich: 'Nutrient rich ingredients',
            weeklyRotation: 'Weekly menu rotation',
            premiumSupport: 'Premium support',
          },
          select: 'SELECT',
        },
        muscleGain: {
          title: 'Muscle Gain',
          description: 'High Protein & Power focus',
          features: {
            highProtein: 'High protein (150g+)',
            postWorkout: 'Post-workout recovery',
            cleanCarbs: 'Extra clean carbs',
            performance: 'Performance boosting',
          },
          select: 'SELECT',
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

