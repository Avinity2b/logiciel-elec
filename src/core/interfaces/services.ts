/**
 * Interfaces pour les services
 * Contrats que doivent respecter tous les services
 */

import { 
  ElectricalElement, 
  Circuit, 
  Project, 
  ExportOptions, 
  ImportResult,
  ElectricalCalculations 
} from '../types';

// Interface service de calcul
export interface ICalculationService {
  calculateCircuits(elements: ElectricalElement[]): Promise<Circuit[]>;
  validateCompliance(circuits: Circuit[]): Promise<boolean>;
  optimizeCircuits(circuits: Circuit[]): Promise<Circuit[]>;
  calculatePower(elements: ElectricalElement[]): number;
}

// Interface service d'export
export interface IExportService {
  exportProject(project: Project, options: ExportOptions): Promise<Blob>;
  exportToPDF(project: Project, options: ExportOptions): Promise<Blob>;
  exportToImage(project: Project, options: ExportOptions): Promise<Blob>;
  exportToJSON(project: Project): Promise<string>;
}

// Interface service d'import
export interface IImportService {
  importFile(file: File): Promise<ImportResult>;
  importProject(data: string): Promise<Project>;
  validateImport(data: any): boolean;
}

// Interface service de stockage
export interface IStorageService {
  saveProject(project: Project): Promise<void>;
  loadProject(id: string): Promise<Project>;
  listProjects(): Promise<Project[]>;
  deleteProject(id: string): Promise<void>;
  exportProjects(): Promise<string>;
  importProjects(data: string): Promise<void>;
}

// Interface service de symboles
export interface ISymbolService {
  loadSymbols(): Promise<Symbol[]>;
  getSymbolsByCategory(category: string): Promise<Symbol[]>;
  getSymbolById(id: string): Promise<Symbol | null>;
  cacheSymbol(id: string, data: string): void;
}