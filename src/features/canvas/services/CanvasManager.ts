/**
 * Gestionnaire Canvas - Logique métier centralisée
 */

import { BaseService } from '../../../shared/services/BaseService';
import { ElectricalElement } from '../../../core/types';
import { CanvasState, CanvasConfig } from '../types';
import { CANVAS } from '../../../core/constants';

export class CanvasManager extends BaseService {
  private state: CanvasState;
  private config: CanvasConfig;
  private listeners: Array<(state: CanvasState) => void> = [];

  constructor(config?: Partial<CanvasConfig>) {
    super('CanvasManager');
    
    this.config = {
      width: CANVAS.DEFAULT_WIDTH,
      height: CANVAS.DEFAULT_HEIGHT,
      gridSize: CANVAS.GRID_SIZE,
      minZoom: CANVAS.MIN_ZOOM,
      maxZoom: CANVAS.MAX_ZOOM,
      snapToGrid: true,
      ...config
    };

    this.state = {
      elements: [],
      selectedElements: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
      showGrid: true,
      showConnections: true,
      backgroundImage: null,
      mode: 'select'
    };
  }

  async initialize(): Promise<void> {
    this.log('Initializing canvas manager');
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up canvas manager');
    this.listeners = [];
    this.isInitialized = false;
  }

  // Gestion des éléments
  addElement(element: ElectricalElement): void {
    if (this.config.snapToGrid) {
      element.position = this.snapToGrid(element.position);
    }
    
    this.state.elements.push(element);
    this.notifyChange();
    this.log(`Added element: ${element.id}`);
  }

  updateElement(id: string, updates: Partial<ElectricalElement>): void {
    const index = this.state.elements.findIndex(el => el.id === id);
    if (index === -1) {
      this.log(`Element not found: ${id}`, 'warn');
      return;
    }

    if (updates.position && this.config.snapToGrid) {
      updates.position = this.snapToGrid(updates.position);
    }

    this.state.elements[index] = { ...this.state.elements[index], ...updates };
    this.notifyChange();
    this.log(`Updated element: ${id}`);
  }

  deleteElement(id: string): void {
    this.state.elements = this.state.elements.filter(el => el.id !== id);
    this.state.selectedElements = this.state.selectedElements.filter(selId => selId !== id);
    this.notifyChange();
    this.log(`Deleted element: ${id}`);
  }

  // Gestion de la sélection
  selectElement(id: string, multi: boolean = false): void {
    if (!multi) {
      this.state.selectedElements = [id];
    } else {
      if (this.state.selectedElements.includes(id)) {
        this.state.selectedElements = this.state.selectedElements.filter(selId => selId !== id);
      } else {
        this.state.selectedElements.push(id);
      }
    }
    this.notifyChange();
  }

  clearSelection(): void {
    this.state.selectedElements = [];
    this.notifyChange();
  }

  // Gestion de la vue
  setZoom(zoom: number): void {
    this.state.zoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    this.notifyChange();
  }

  setPan(pan: { x: number; y: number }): void {
    this.state.pan = pan;
    this.notifyChange();
  }

  // Utilitaires
  private snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
    const gridSize = this.config.gridSize;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }

  // Système d'observation
  subscribe(listener: (state: CanvasState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state); // Emission immédiate de l'état actuel
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyChange(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        this.log('Error notifying canvas listener', 'error');
      }
    });
  }

  // Getters publics
  getState(): CanvasState {
    return { ...this.state };
  }

  getConfig(): CanvasConfig {
    return { ...this.config };
  }

  getElementById(id: string): ElectricalElement | undefined {
    return this.state.elements.find(el => el.id === id);
  }

  getSelectedElements(): ElectricalElement[] {
    return this.state.elements.filter(el => this.state.selectedElements.includes(el.id));
  }
}