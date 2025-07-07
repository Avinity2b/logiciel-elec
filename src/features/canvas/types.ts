/**
 * Types spécifiques au Canvas
 */

import { ElectricalElement } from '../../core/types';

export interface CanvasState {
  elements: ElectricalElement[];
  selectedElements: string[];
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showConnections: boolean;
  backgroundImage: string | null;
  mode: 'select' | 'place' | 'connect' | 'pan';
}

export interface CanvasActions {
  addElement: (element: ElectricalElement) => void;
  updateElement: (id: string, updates: Partial<ElectricalElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setMode: (mode: CanvasState['mode']) => void;
  toggleGrid: () => void;
  toggleConnections: () => void;
}

export interface CanvasConfig {
  width: number;
  height: number;
  gridSize: number;
  minZoom: number;
  maxZoom: number;
  snapToGrid: boolean;
}