/**
 * Constantes électriques - NF C 15-100
 * CORE STABLE - Ne pas modifier sans validation technique
 */

// Limites par type de circuit (NF C 15-100)
export const CIRCUIT_LIMITS = {
  LIGHTING: {
    MAX_POINTS: 8,
    MAX_POWER: 2300, // Watts
    BREAKER_SIZE: 10, // Ampères
    CABLE_SECTION: 1.5 // mm²
  },
  OUTLET_16A: {
    MAX_POINTS: 8,
    MAX_POWER: 3680, // 16A × 230V
    BREAKER_SIZE: 16,
    CABLE_SECTION: 1.5
  },
  OUTLET_20A: {
    MAX_POINTS: 12,
    MAX_POWER: 4600, // 20A × 230V  
    BREAKER_SIZE: 20,
    CABLE_SECTION: 2.5
  },
  SPECIALIZED: {
    MAX_POINTS: 1,
    BREAKER_SIZE: 32,
    CABLE_SECTION: 6
  }
} as const;

// Coefficients d'utilisation (Ku)
export const UTILIZATION_COEFFICIENTS = {
  LIGHTING: 1.0,
  HEATING: 1.0,
  OUTLETS_COMFORT: 0.2,
  KITCHEN: 0.5,
  APPLIANCES: 0.8,
  HVAC: 1.0
} as const;

// Facteurs de simultanéité (Ks)
export const SIMULTANEITY_FACTORS = {
  RESIDENTIAL: 0.7,
  COMMERCIAL: 0.8,
  INDUSTRIAL: 0.9
} as const;

// Types de protection différentielle
export const DIFFERENTIAL_TYPES = {
  AC: { sensitivity: [30, 300], description: 'Courants alternatifs' },
  A: { sensitivity: [30, 300], description: 'Courants alternatifs et pulsés' },
  B: { sensitivity: [30, 300], description: 'Tous types de courants' }
} as const;

// Sections de câbles normalisées
export const CABLE_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50] as const;

// Calibres de disjoncteurs
export const BREAKER_RATINGS = [10, 16, 20, 25, 32, 40, 50, 63] as const;