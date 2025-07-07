/**
 * Types équipement - CORE STABLE
 */

// Marques d'équipement
export interface EquipmentBrand {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  country: string;
  description?: string;
}

// Séries d'équipement
export interface EquipmentSeries {
  id: string;
  name: string;
  brandId: string;
  category: 'wall_mounted' | 'modular' | 'industrial';
  description: string;
  thumbnail?: string;
  specifications?: Record<string, any>;
}

// Articles d'équipement
export interface EquipmentItem {
  id: string;
  name: string;
  reference: string;
  seriesId: string;
  type: string;
  specifications: Record<string, any>;
  price: number;
  currency: string;
  availability?: 'available' | 'limited' | 'discontinued';
  datasheet?: string;
}

// Configuration d'équipement par projet
export interface BrandSeries {
  brandId: string;
  seriesId: string;
  supplierDiscount: number;
  defaultMargin: number;
}

export interface ProjectSettings {
  selectedWallSeries: Record<string, any>;
  selectedModularSeries: Record<string, any>;
  
  // Configuration commerciale
  wallMountedBrand?: string;
  wallMountedSeries?: string;
  wallMountedSupplierDiscount?: number;
  wallMountedMargin?: number;
  
  modularBrand?: string;
  modularSeries?: string;
  modularSupplierDiscount?: number;
  modularMargin?: number;
  
  // Préférences techniques
  defaultProtection?: {
    differential: number;
    earthing: 'TT' | 'TN' | 'IT';
  };
  
  // Préférences d'affichage
  showPowerLabels?: boolean;
  showReferenceLabels?: boolean;
  colorScheme?: 'light' | 'dark' | 'auto';
}