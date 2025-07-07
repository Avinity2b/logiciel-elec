/**
 * Feature Flags - Contrôle des fonctionnalités
 * IMPORTANT: Ces flags permettent d'activer/désactiver les fonctionnalités
 */
export const FEATURES = {
  // 🟢 STABLE - Production ready
  BASIC_CANVAS: true,
  SYMBOL_PLACEMENT: true,
  PROJECT_SAVE_LOAD: true,
  BASIC_EXPORT: true,
  
  // 🟡 EN DÉVELOPPEMENT - Test uniquement
  ADVANCED_CALCULATIONS: false,
  AI_SUGGESTIONS: false,
  CLOUD_SYNC: false,
  COLLABORATIVE_EDITING: false,
  
  // 🔵 COMMERCIAL - Versions payantes
  ADVANCED_EXPORT: false,
  COMMERCIAL_QUOTES: false,
  MULTI_PROJECT: false,
  PREMIUM_SYMBOLS: false,
  
  // 🔴 EXPÉRIMENTAL - Très instable
  AR_VISUALIZATION: false,
  VOICE_COMMANDS: false,
  AUTO_LAYOUT: false
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Vérifier si une fonctionnalité est activée
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURES[feature];
};

/**
 * Obtenir toutes les fonctionnalités actives
 */
export const getActiveFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature as FeatureFlag);
};