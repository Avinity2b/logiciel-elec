import { ElectricalSymbol } from '../types/symbols';

export const ELECTRICAL_SYMBOLS: ElectricalSymbol[] = [
  // PRISES
  {
    id: 'alim-sortie-cable',
    name: 'Alim - Sortie de cable',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Alim%20-%20Sortie%20de%20cable.svg',
    elementType: 'cable_outlet_16a',
    properties: { power: 3680, voltage: 230, amperage: 16 }
  },
  {
    id: 'alim-seche-serviette',
    name: 'Alim Seche Serviette',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Alim%20Seche%20Serviette.SVG',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'alim-vmc',
    name: 'Alim VMC',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Alim%20VMC.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'alim-vr',
    name: 'Alim VR',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Alim%20VR.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'chauffe-eau',
    name: 'Chauffe Eau',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Chauffe%20Eau.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'congelateur',
    name: 'Congelateur',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Congelateur.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'four',
    name: 'Four',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Four.svg',
    elementType: 'socket_32a',
    properties: { power: 7360, voltage: 230, amperage: 32 }
  },
  {
    id: 'lave-linge',
    name: 'Lave Linge',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Lave%20Linge.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'seche-linge',
    name: 'Seche Linge',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Seche%20Linge.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'lave-vaisselle',
    name: 'Lave Vaisselle',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Lave%20Vaisselle.svg',
    elementType: 'socket_20a_spe',
    properties: { power: 4600, voltage: 230, amperage: 20, specialEquipment: true }
  },
  {
    id: 'pc',
    name: 'PC',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC.svg',
    elementType: 'outlet',
    properties: { power: 2500, voltage: 230, protected: true }
  },
  {
    id: 'pc-double',
    name: 'PC Double',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%20double.svg',
    elementType: 'outlet_double',
    properties: { power: 5000, voltage: 230, outlets: 2 }
  },
  {
    id: 'pc-triple',
    name: 'PC Triple',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%20triple.svg',
    elementType: 'outlet_triple',
    properties: { power: 7500, voltage: 230, outlets: 3 }
  },
  {
    id: 'pc-haute',
    name: 'PC Haute',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%20haute.svg',
    elementType: 'outlet_high',
    properties: { power: 2500, voltage: 230, height: 'high' }
  },
  {
    id: 'pc-double-haute',
    name: 'PC Double Haute',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%20double%20haute.svg',
    elementType: 'outlet_double_high',
    properties: { power: 5000, voltage: 230, outlets: 2, height: 'high' }
  },
  {
    id: 'pc-triple-haute',
    name: 'PC Triple Haute',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%20triple%20haute.svg',
    elementType: 'outlet_triple_high',
    properties: { power: 7500, voltage: 230, outlets: 3, height: 'high' }
  },
  {
    id: 'pc-20a',
    name: 'PC 20A',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%2020A.svg',
    elementType: 'socket_20a',
    properties: { power: 4600, voltage: 230, amperage: 20 }
  },
  {
    id: 'pc-32a',
    name: 'PC 32A',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/PC%2032A.svg',
    elementType: 'socket_32a',
    properties: { power: 7360, voltage: 230, amperage: 32 }
  },
  {
    id: 'plaque-electrique',
    name: 'Plaque Electrique',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/Plaque%20Electrique.svg',
    elementType: 'socket_32a',
    properties: { power: 7360, voltage: 230, amperage: 32 }
  },
  {
    id: 'rj45',
    name: 'RJ45',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/RJ45.svg',
    elementType: 'rj45',
    properties: { type: 'ethernet' }
  },
  {
    id: 'tv',
    name: 'TV',
    category: 'Prises',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Prises/TV.svg',
    elementType: 'tv_outlet',
    properties: { type: 'coaxial' }
  },

  // COMMANDES
  {
    id: 'interrupteur',
    name: 'Interrupteur',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur.svg',
    elementType: 'switch',
    properties: { type: 'simple', contacts: 1 }
  },
  {
    id: 'interrupteur-voyant',
    name: 'Interrupteur à voyant',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20a%20voyant.svg',
    elementType: 'switch_pilot',
    properties: { type: 'simple', contacts: 1, pilot: true }
  },
  {
    id: 'interrupteur-double',
    name: 'Interrupteur double',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20double.svg',
    elementType: 'switch_double',
    properties: { type: 'double', contacts: 2 }
  },
  {
    id: 'interrupteur-double-voyant',
    name: 'Interrupteur double à voyant',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20double%20a%20voyant.svg',
    elementType: 'switch_double_pilot',
    properties: { type: 'double', contacts: 2, pilot: true }
  },
  {
    id: 'va-et-vient',
    name: 'Interrupteur va‑et‑vient',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20va-et-vient.svg',
    elementType: 'switch_va_et_vient',
    properties: { type: 'va-et-vient', contacts: 1 }
  },
  {
    id: 'va-et-vient-voyant',
    name: 'Interrupteur va‑et‑vient voyant',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20va-et-vient%20a%20voyant.svg',
    elementType: 'switch_va_et_vient_pilot',
    properties: { type: 'va-et-vient', contacts: 1, pilot: true }
  },
  {
    id: 'double-va-et-vient',
    name: 'Double va‑et‑vient',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20va-et-vient%20double.svg',
    elementType: 'switch_double_va_et_vient',
    properties: { type: 'double-va-et-vient', contacts: 2 }
  },
  {
    id: 'double-va-et-vient-voyant',
    name: 'Double va‑et‑vient voyant',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20va-et-vient%20double%20a%20voyant.svg',
    elementType: 'switch_double_va_et_vient_pilot',
    properties: { type: 'double-va-et-vient', contacts: 2, pilot: true }
  },
  {
    id: 'bouton-poussoir',
    name: 'Bouton poussoir',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/Poussoir.svg',
    elementType: 'push_button',
    properties: { type: 'poussoir', contacts: 1 }
  },
  {
    id: 'bouton-poussoir-voyant',
    name: 'Bouton poussoir voyant',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/Poussoir%20a%20voyant.svg',
    elementType: 'push_button_pilot',
    properties: { type: 'poussoir', contacts: 1, pilot: true }
  },
  {
    id: 'variateur',
    name: 'Variateur',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/interrupteur%20a%20variateur.svg',
    elementType: 'switch_dimmer',
    properties: { type: 'variateur', contacts: 1, minLevel: 10, maxLevel: 100 }
  },
  {
    id: 'detecteur-mouvement',
    name: 'Détecteur de mouvement',
    category: 'Commandes',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Commandes/Detecteur%20de%20mouvement.svg',
    elementType: 'motion_detector',
    properties: { type: 'detecteur', sensitivity: 'medium', delay: 60, range: 8 }
  },

  // LUMIÈRES
  {
    id: 'dcl-plafonnier',
    name: 'DCL plafonnier',
    category: 'Lumières',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Lumieres/DCL.svg',
    elementType: 'dcl',
    properties: { power: 100, voltage: 230, type: 'DCL' }
  },
  {
    id: 'dcl-applique',
    name: 'DCL applique',
    category: 'Lumières',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Lumieres/DCL%20Applique.svg',
    elementType: 'dcl_applique',
    properties: { power: 100, voltage: 230, type: 'DCL', mounting: 'wall' }
  },
  {
    id: 'spot-encastre',
    name: 'Spot encastré',
    category: 'Lumières',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Lumieres/Spot.svg',
    elementType: 'spot',
    properties: { power: 50, voltage: 230, type: 'LED', quantity: 1 }
  },
  {
    id: 'reglette-led',
    name: 'Réglette LED',
    category: 'Lumières',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Lumieres/Reglette%20LED.svg',
    elementType: 'led_strip',
    properties: { power: 100, voltage: 230, type: 'LED', length: 1 }
  },
  {
    id: 'projecteur-led',
    name: 'Projecteur LED',
    category: 'Lumières',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Lumieres/Projecteur.svg',
    elementType: 'led_projector',
    properties: { power: 150, voltage: 230, type: 'LED', outdoor: true }
  },

  // DIVERS
  {
    id: 'clim',
    name: 'Clim',
    category: 'Divers',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Divers/Clim.svg',
    elementType: 'socket_32a',
    properties: { power: 7360, voltage: 230, amperage: 32 }
  },
  {
    id: 'interphone',
    name: 'Interphone',
    category: 'Divers',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Divers/Interphone.svg',
    elementType: 'interphone',
    properties: { voltage: 12 }
  },
  {
    id: 'tgbt',
    name: 'TGBT',
    category: 'Divers',
    svgUrl: 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co/storage/v1/object/public/symboles-svg/Divers/TGBT.svg',
    elementType: 'tgbt',
    properties: { type: 'tableau' }
  }
];

export function getSymbolsByCategory(): Record<string, ElectricalSymbol[]> {
  return ELECTRICAL_SYMBOLS.reduce((acc, symbol) => {
    if (!acc[symbol.category]) {
      acc[symbol.category] = [];
    }
    acc[symbol.category].push(symbol);
    return acc;
  }, {} as Record<string, ElectricalSymbol[]>);
}

export function getSymbolById(id: string): ElectricalSymbol | undefined {
  return ELECTRICAL_SYMBOLS.find(symbol => symbol.id === id);
}