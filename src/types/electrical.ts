export interface ElectricalElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, any>;
  circuitId?: string;
  connections?: string[]; // IDs of connected elements
  symbolId?: string; // Reference to the symbol used
  svgUrl?: string; // URL of the SVG symbol
}

export type ElementType = 
  | 'outlet' 
  | 'outlet_high'
  | 'outlet_double'
  | 'outlet_double_high'
  | 'outlet_triple'
  | 'outlet_triple_high'
  | 'outlet_controlled'
  | 'outlet_usb'
  | 'switch' 
  | 'switch_pilot'
  | 'switch_double'
  | 'switch_double_pilot'
  | 'switch_va_et_vient'
  | 'switch_va_et_vient_pilot'
  | 'switch_double_va_et_vient'
  | 'switch_double_va_et_vient_pilot'
  | 'push_button'
  | 'push_button_pilot'
  | 'switch_dimmer'
  | 'motion_detector'
  | 'switch_shutter'
  | 'dcl'
  | 'dcl_applique'
  | 'spot'
  | 'led_strip'
  | 'led_projector'
  | 'socket_20a'
  | 'socket_20a_spe'
  | 'socket_32a'
  | 'cable_outlet_16a'
  | 'cable_outlet_20a'
  | 'cable_outlet_32a'
  | 'rj45'
  | 'tv_outlet'
  | 'interphone'
  | 'tgbt'
  // Legacy types for compatibility
  | 'dcl_motion'
  | 'applique'
  | 'applique_motion';

export interface Circuit {
  id: string;
  name: string;
  type: 'lighting' | 'outlet' | 'dedicated' | 'heating';
  elements: string[];
  power: number;
  current: number;
  cableSection: number;
  breakerRating: number;
  differentialRating?: number;
  length: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'control' | 'power';
}

export interface NFCCalculation {
  totalPower: number;
  circuits: Circuit[];
  mainBreaker: number;
  differentialBreakers: DifferentialBreaker[];
  compliance: ComplianceCheck[];
  materialList: MaterialItem[];
}

export interface DifferentialBreaker {
  id: string;
  rating: number;
  sensitivity: number;
  circuits: string[];
}

export interface ComplianceCheck {
  rule: string;
  status: 'compliant' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  brand: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  seriesId?: string;
}

export interface Project {
  id: string;
  name: string;
  elements: ElectricalElement[];
  circuits: Circuit[];
  connections: Connection[];
  calculations: NFCCalculation | null;
  backgroundImage: string | null;
  settings?: {
    selectedWallSeries: Record<string, string>;
    selectedModularSeries: Record<string, string>;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'jpg';
  elements: 'all' | 'outlets' | 'lighting';
  showConnections: boolean;
}