/**
 * Interfaces pour les composants
 */

import { ElectricalElement, Project, Connection } from '../types';

// Interface composant Canvas
export interface ICanvasComponent {
  addElement(element: ElectricalElement): void;
  updateElement(id: string, updates: Partial<ElectricalElement>): void;
  deleteElement(id: string): void;
  selectElement(id: string): void;
  clearSelection(): void;
  zoomIn(): void;
  zoomOut(): void;
  fitToScreen(): void;
}

// Interface gestionnaire de projet
export interface IProjectManager {
  currentProject: Project;
  createProject(name: string): Project;
  loadProject(project: Project): void;
  saveProject(): void;
  exportProject(format: string): void;
}

// Interface panneau de propriétés
export interface IPropertiesPanel {
  selectedElements: ElectricalElement[];
  updateElement(id: string, properties: Record<string, any>): void;
  bulkUpdate(properties: Record<string, any>): void;
}