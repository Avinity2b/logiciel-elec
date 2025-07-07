/**
 * Constantes interface utilisateur
 */

// Couleurs système
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6366F1', 
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
  
  // Thème sombre
  DARK: {
    BACKGROUND: '#1F2937',
    SURFACE: '#374151',
    TEXT: '#F9FAFB'
  },
  
  // Codes couleurs électriques
  ELECTRICAL: {
    LIGHTING: '#FFC107',
    OUTLETS: '#4CAF50',
    HEATING: '#FF5722',
    CONTROL: '#9C27B0',
    DATA: '#00BCD4'
  }
} as const;

// Dimensions canvas
export const CANVAS = {
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0,
  ZOOM_STEP: 0.1,
  GRID_SIZE: 20
} as const;

// Tailles des symboles
export const SYMBOL_SIZES = {
  SMALL: { width: 24, height: 24 },
  MEDIUM: { width: 32, height: 32 },
  LARGE: { width: 48, height: 48 }
} as const;

// Messages utilisateur
export const MESSAGES = {
  SAVE_SUCCESS: 'Projet sauvegardé avec succès',
  SAVE_ERROR: 'Erreur lors de la sauvegarde',
  LOAD_SUCCESS: 'Projet chargé avec succès',
  LOAD_ERROR: 'Erreur lors du chargement',
  EXPORT_SUCCESS: 'Export réalisé avec succès',
  EXPORT_ERROR: 'Erreur lors de l\'export',
  CALCULATION_SUCCESS: 'Calculs terminés',
  CALCULATION_ERROR: 'Erreur lors des calculs'
} as const;