import { EquipmentBrand, EquipmentSeries, EquipmentItem } from '../types/equipment';

export const EQUIPMENT_BRANDS: EquipmentBrand[] = [
  { id: 'legrand', name: 'Legrand' },
  { id: 'schneider', name: 'Schneider Electric' },
  { id: 'hager', name: 'Hager' },
  { id: 'abb', name: 'ABB' }
];

export const WALL_MOUNTED_SERIES: EquipmentSeries[] = [
  // Legrand
  { id: 'legrand-celiane', name: 'Céliane', brandId: 'legrand', category: 'wall_mounted', description: 'Gamme design premium' },
  { id: 'legrand-mosaic', name: 'Mosaic', brandId: 'legrand', category: 'wall_mounted', description: 'Modulaire et fonctionnel' },
  { id: 'legrand-niloe', name: 'Niloé', brandId: 'legrand', category: 'wall_mounted', description: 'Essentiel et accessible' },
  
  // Schneider
  { id: 'schneider-odace', name: 'Odace', brandId: 'schneider', category: 'wall_mounted', description: 'Design contemporain' },
  { id: 'schneider-unica', name: 'Unica', brandId: 'schneider', category: 'wall_mounted', description: 'Élégance et performance' },
  { id: 'schneider-ovalis', name: 'Ovalis', brandId: 'schneider', category: 'wall_mounted', description: 'Simplicité et efficacité' },
  
  // Hager
  { id: 'hager-kallysta', name: 'Kallysta', brandId: 'hager', category: 'wall_mounted', description: 'Design épuré' },
  { id: 'hager-essensya', name: 'Essensya', brandId: 'hager', category: 'wall_mounted', description: 'Fonctionnel et économique' },
  { id: 'hager-lumina', name: 'Lumina', brandId: 'hager', category: 'wall_mounted', description: 'Classique et fiable' },
  
  // ABB
  { id: 'abb-zenit', name: 'Zenit', brandId: 'abb', category: 'wall_mounted', description: 'Innovation et qualité' },
  { id: 'abb-basic55', name: 'Basic55', brandId: 'abb', category: 'wall_mounted', description: 'Fonctionnel et économique' }
];

export const MODULAR_SERIES: EquipmentSeries[] = [
  // Legrand
  { id: 'legrand-drivia', name: 'Drivia', brandId: 'legrand', category: 'modular', description: 'Coffrets et tableaux résidentiels' },
  { id: 'legrand-dx3', name: 'DX³', brandId: 'legrand', category: 'modular', description: 'Protection modulaire complète' },
  { id: 'legrand-lexic', name: 'Lexic', brandId: 'legrand', category: 'modular', description: 'Coffrets et accessoires' },
  
  // Schneider
  { id: 'schneider-resi9', name: 'Resi9', brandId: 'schneider', category: 'modular', description: 'Résidentiel nouvelle génération' },
  { id: 'schneider-ic60', name: 'iC60', brandId: 'schneider', category: 'modular', description: 'Disjoncteurs modulaires' },
  { id: 'schneider-id', name: 'iID', brandId: 'schneider', category: 'modular', description: 'Interrupteurs différentiels' },
  
  // Hager
  { id: 'hager-volta', name: 'Volta', brandId: 'hager', category: 'modular', description: 'Coffrets résidentiels' },
  { id: 'hager-myn', name: 'MYN', brandId: 'hager', category: 'modular', description: 'Disjoncteurs modulaires' },
  { id: 'hager-cdc', name: 'CDC', brandId: 'hager', category: 'modular', description: 'Interrupteurs différentiels' },
  
  // ABB
  { id: 'abb-mistral', name: 'Mistral', brandId: 'abb', category: 'modular', description: 'Coffrets et tableaux' },
  { id: 'abb-s200', name: 'S200', brandId: 'abb', category: 'modular', description: 'Protection modulaire' },
  { id: 'abb-f200', name: 'F200', brandId: 'abb', category: 'modular', description: 'Interrupteurs différentiels' }
];

export const WALL_MOUNTED_ITEMS: EquipmentItem[] = [
  // Prises Legrand Céliane
  { id: 'legrand-celiane-prise-16a', name: 'Prise 16A 2P+T', reference: '067111', seriesId: 'legrand-celiane', type: 'outlet', specifications: { amperage: 16, earthed: true }, price: 12.50 },
  { id: 'legrand-celiane-prise-20a', name: 'Prise 20A 2P+T', reference: '067121', seriesId: 'legrand-celiane', type: 'socket_20a', specifications: { amperage: 20, earthed: true }, price: 15.80 },
  
  // Interrupteurs Legrand Céliane
  { id: 'legrand-celiane-inter-simple', name: 'Interrupteur simple', reference: '067001', seriesId: 'legrand-celiane', type: 'switch', specifications: { contacts: 1 }, price: 8.90 },
  { id: 'legrand-celiane-inter-double', name: 'Interrupteur double', reference: '067002', seriesId: 'legrand-celiane', type: 'switch_double', specifications: { contacts: 2 }, price: 16.50 },
  { id: 'legrand-celiane-variateur', name: 'Variateur 600W', reference: '067083', seriesId: 'legrand-celiane', type: 'switch_dimmer', specifications: { maxPower: 600 }, price: 45.20 },
  
  // Schneider Odace
  { id: 'schneider-odace-prise-16a', name: 'Prise 16A 2P+T', reference: 'S520059', seriesId: 'schneider-odace', type: 'outlet', specifications: { amperage: 16, earthed: true }, price: 11.20 },
  { id: 'schneider-odace-inter-simple', name: 'Interrupteur simple', reference: 'S520204', seriesId: 'schneider-odace', type: 'switch', specifications: { contacts: 1 }, price: 7.80 }
];

export const MODULAR_ITEMS: EquipmentItem[] = [
  // Legrand DX³
  { id: 'legrand-dx3-disj-10a', name: 'Disjoncteur 10A courbe C', reference: '403156', seriesId: 'legrand-dx3', type: 'breaker_10a', specifications: { amperage: 10, curve: 'C', poles: 1 }, price: 18.50 },
  { id: 'legrand-dx3-disj-16a', name: 'Disjoncteur 16A courbe C', reference: '403157', seriesId: 'legrand-dx3', type: 'breaker_16a', specifications: { amperage: 16, curve: 'C', poles: 1 }, price: 19.80 },
  { id: 'legrand-dx3-disj-20a', name: 'Disjoncteur 20A courbe C', reference: '403158', seriesId: 'legrand-dx3', type: 'breaker_20a', specifications: { amperage: 20, curve: 'C', poles: 1 }, price: 21.20 },
  { id: 'legrand-dx3-disj-32a', name: 'Disjoncteur 32A courbe C', reference: '403160', seriesId: 'legrand-dx3', type: 'breaker_32a', specifications: { amperage: 32, curve: 'C', poles: 1 }, price: 28.90 },
  { id: 'legrand-dx3-diff-40a', name: 'Interrupteur différentiel 40A 30mA', reference: '411502', seriesId: 'legrand-dx3', type: 'differential_40a', specifications: { amperage: 40, sensitivity: 30, type: 'AC' }, price: 85.60 },
  
  // Schneider iC60
  { id: 'schneider-ic60-disj-10a', name: 'Disjoncteur 10A courbe C', reference: 'A9F74110', seriesId: 'schneider-ic60', type: 'breaker_10a', specifications: { amperage: 10, curve: 'C', poles: 1 }, price: 17.20 },
  { id: 'schneider-ic60-disj-16a', name: 'Disjoncteur 16A courbe C', reference: 'A9F74116', seriesId: 'schneider-ic60', type: 'breaker_16a', specifications: { amperage: 16, curve: 'C', poles: 1 }, price: 18.90 },
  { id: 'schneider-ic60-disj-20a', name: 'Disjoncteur 20A courbe C', reference: 'A9F74120', seriesId: 'schneider-ic60', type: 'breaker_20a', specifications: { amperage: 20, curve: 'C', poles: 1 }, price: 20.50 },
  
  // Schneider iID
  { id: 'schneider-iid-diff-40a', name: 'Interrupteur différentiel 40A 30mA', reference: 'A9R11240', seriesId: 'schneider-id', type: 'differential_40a', specifications: { amperage: 40, sensitivity: 30, type: 'AC' }, price: 82.40 }
];

export function getEquipmentByType(category: 'wall_mounted' | 'modular', type: string): EquipmentItem[] {
  const items = category === 'wall_mounted' ? WALL_MOUNTED_ITEMS : MODULAR_ITEMS;
  return items.filter(item => item.type === type);
}

export function getSeriesByBrand(brandId: string, category: 'wall_mounted' | 'modular'): EquipmentSeries[] {
  const series = category === 'wall_mounted' ? WALL_MOUNTED_SERIES : MODULAR_SERIES;
  return series.filter(s => s.brandId === brandId);
}

export function getBrandById(brandId: string): EquipmentBrand | undefined {
  return EQUIPMENT_BRANDS.find(b => b.id === brandId);
}

export function getSeriesById(seriesId: string): EquipmentSeries | undefined {
  return [...WALL_MOUNTED_SERIES, ...MODULAR_SERIES].find(s => s.id === seriesId);
}

export function getItemById(itemId: string): EquipmentItem | undefined {
  return [...WALL_MOUNTED_ITEMS, ...MODULAR_ITEMS].find(i => i.id === itemId);
}