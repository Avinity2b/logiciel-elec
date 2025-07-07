/**
 * Types projet - CORE STABLE
 */

import { ElectricalElement, Circuit, Connection, ElectricalCalculations } from './electrical';
import { ProjectSettings } from './equipment';

// Type principal du projet
export interface Project {
  id: string;
  name: string;
  description?: string;
  elements: ElectricalElement[];
  circuits: Circuit[];
  connections: Connection[];
  calculations: ElectricalCalculations | null;
  backgroundImage: string | null;
  settings: ProjectSettings;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    author?: string;
    tags?: string[];
  };
}

// Types pour l'export
export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'json';
  elements: 'all' | 'selection' | 'visible';
  showConnections: boolean;
  showLabels: boolean;
  showGrid: boolean;
  quality: number;
  scale: number;
  area?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Types pour l'import
export interface ImportResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}

// Types pour la gestion de projet
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial';
  thumbnail?: string;
  project: Partial<Project>;
}

export interface ProjectMetrics {
  totalElements: number;
  totalCircuits: number;
  totalConnections: number;
  totalPower: number;
  complianceScore: number;
  lastModified: string;
}