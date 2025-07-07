/**
 * Export centralisé de toute la configuration
 */
export * from './features';
export * from './environment';
export * from './database';

// Configuration globale combinée
export const APP_CONFIG = {
  name: 'ElectriCAD AI',
  version: '1.0.0',
  description: 'Logiciel de CAO électrique avec IA',
  
  // Métadonnées
  metadata: {
    author: 'ElectriCAD AI Team',
    license: 'PROPRIETARY',
    repository: '',
    documentation: ''
  },
  
  // Limites système
  limits: {
    maxProjectSize: 50 * 1024 * 1024, // 50MB
    maxElementsPerProject: 1000,
    maxConnectionsPerElement: 10,
    maxUndoHistory: 50
  }
} as const;