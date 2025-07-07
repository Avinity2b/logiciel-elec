/**
 * Types électriques fondamentaux - CORE STABLE
 * Ces types ne doivent PAS être modifiés sans tests approfondis
 */

// Types de base pour les éléments électriques
export interface ElectricalElement {
  id: string;
  type: string;
  position: { x: number; y: number };
  rotation: number;
  power: number;
  voltage: number;
  phase: number;
  properties: Record<string, any>;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

// Types pour les circuits
export interface Circuit {
  id: string;
  name: string;
  type: 'lighting' | 'outlet' | 'specialized' | 'heating';
  elements: ElectricalElement[];
  protection: {
    breaker: number; // Ampérage disjoncteur
    differential: number; // Sensibilité différentiel (mA)
    cableSection: number; // Section câble (mm²)
  };
  calculations: {
    totalPower: number;
    current: number;
    voltageDrop: number;
    isCompliant: boolean;
  };
}

// Types pour les connexions
export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: 'electrical' | 'control' | 'data';
  properties: {
    wireType?: string;
    section?: number;
    length?: number;
    color?: string;
  };
}

// Types pour les calculs de conformité
export interface ComplianceResult {
  isCompliant: boolean;
  violations: Array<{
    code: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    circuit?: string;
  }>;
  recommendations: string[];
}

// Types pour les calculs électriques
export interface ElectricalCalculations {
  circuits: Circuit[];
  totalPower: number;
  totalCurrent: number;
  powerFactor: number;
  compliance: ComplianceResult;
  generatedAt: string;
}