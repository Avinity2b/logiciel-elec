/**
 * Types interface utilisateur - CORE STABLE
 */

// Types pour les symboles
export interface Symbol {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  url: string;
  thumbnail?: string;
  dimensions: {
    width: number;
    height: number;
  };
  properties: {
    defaultPower?: number;
    defaultVoltage?: number;
    type?: string;
  };
  metadata: {
    version: string;
    author?: string;
    description?: string;
  };
}

// Types pour les catégories de symboles
export interface SymbolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

// Types pour l'état de l'interface
export interface UIState {
  selectedTool: string | null;
  selectedElements: string[];
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showConnections: boolean;
  showLabels: boolean;
  activePanel: string | null;
}

// Types pour les panneaux
export interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Types pour les modales
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}