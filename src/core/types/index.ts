/**
 * Export centralisé de tous les types core
 * Point d'entrée unique pour importer les types
 */

// Types électriques
export type {
  ElectricalElement,
  Circuit,
  Connection,
  ComplianceResult,
  ElectricalCalculations
} from './electrical';

// Types projet
export type {
  Project,
  ExportOptions,
  ImportResult,
  ProjectTemplate,
  ProjectMetrics
} from './project';

// Types équipement
export type {
  EquipmentBrand,
  EquipmentSeries,
  EquipmentItem,
  BrandSeries,
  ProjectSettings
} from './equipment';

// Types UI
export type {
  Symbol,
  SymbolCategory,
  UIState,
  PanelProps,
  Notification,
  ModalProps
} from './ui';

// Réexport pour compatibilité avec l'ancien code
export type {
  ElectricalElement as ElectricalElementLegacy,
  Project as ProjectLegacy,
  ExportOptions as ExportOptionsLegacy
} from './electrical';