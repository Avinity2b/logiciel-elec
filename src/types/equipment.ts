export interface EquipmentBrand {
  id: string;
  name: string;
  logo?: string;
}

export interface EquipmentSeries {
  id: string;
  name: string;
  brandId: string;
  category: EquipmentCategory;
  description?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  reference: string;
  seriesId: string;
  type: string;
  specifications: Record<string, any>;
  price?: number;
  image?: string;
}

export type EquipmentCategory = 'wall_mounted' | 'modular';

export interface ProjectSettings {
  showControlConnections?: boolean;
  selectedWallSeries?: Record<string, string>; // Legacy - keep for compatibility
  selectedModularSeries?: Record<string, string>; // Legacy - keep for compatibility
  
  // New simplified settings
  wallMountedBrand?: string;
  wallMountedSeries?: string;
  wallMountedSupplierDiscount?: number;
  wallMountedMargin?: number;
  
  modularBrand?: string;
  modularSeries?: string;
  modularSupplierDiscount?: number;
  modularMargin?: number;
}