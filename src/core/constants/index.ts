/**
 * Export centralisé des constantes
 */
export * from './electrical';
export * from './ui';

// Constantes applicatives
export const APP_CONSTANTS = {
  VERSION: '1.0.0',
  NAME: 'ElectriCAD AI',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: ['pdf', 'jpg', 'jpeg', 'png'],
  AUTO_SAVE_INTERVAL: 30000, // 30 secondes
  UNDO_LIMIT: 50
} as const;