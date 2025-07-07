import { ElectricalElement, Circuit, NFCCalculation, ComplianceCheck, MaterialItem } from '../types/electrical';
import { ProjectSettings } from '../types/equipment';
import { getEquipmentByType, getItemById, getSeriesById, getBrandById } from '../data/equipmentDatabase';

// Constants from NF C 15-100
const NFC_CONSTANTS = {
  // Capacités maximales des circuits (ce que le circuit peut supporter)
  OUTLET_CIRCUIT_MAX_CAPACITY: 3680, // 16A x 230V = capacité totale du circuit
  LIGHTING_CIRCUIT_MAX_CAPACITY: 2300, // 10A x 230V = capacité totale du circuit
  SOCKET_20A_CIRCUIT_MAX_CAPACITY: 4600, // 20A x 230V = capacité totale du circuit
  
  DIFFERENTIAL_SENSITIVITY: {
    GENERAL: 30, // mA
    BATHROOM: 30, // mA
    OUTDOOR: 30, // mA
  },
  CABLE_SECTIONS: {
    10: 1.5, // 10A -> 1.5mm²
    16: 1.5, // 16A -> 1.5mm² (selon vos spécifications)
    20: 2.5, // 20A -> 2.5mm²
    25: 4,   // 25A -> 4mm²
    32: 6,   // 32A -> 6mm²
  },
  MAX_OUTLETS_PER_CIRCUIT: 8,      // Prises 16A: 8 max par circuit
  MAX_LIGHTS_PER_CIRCUIT: 8,       // Éclairage: 8 max par circuit
  MAX_SOCKETS_20A_PER_CIRCUIT: 12, // Prises 20A: 12 max par circuit
  MAX_BREAKERS_PER_DIFFERENTIAL: 8, // 8 disjoncteurs max par interdiff
};

// Subscriber breaker options
const SUBSCRIBER_BREAKERS = {
  monophase: [
    { rating: 15, maxPower: 3450 }, // 15A -> 3.45kW
    { rating: 30, maxPower: 6900 }, // 30A -> 6.9kW
    { rating: 45, maxPower: 10350 }, // 45A -> 10.35kW
    { rating: 60, maxPower: 13800 }, // 60A -> 13.8kW
  ],
  triphase: [
    { rating: 10, maxPower: 6000 }, // 10A tri -> 6kW
    { rating: 30, maxPower: 18000 }, // 30A tri -> 18kW
    { rating: 60, maxPower: 36000 }, // 60A tri -> 36kW
  ]
};

export async function calculateCircuits(elements: ElectricalElement[], settings?: ProjectSettings): Promise<NFCCalculation> {
  // Group elements by type - Enhanced for new SVG symbols
  const outlets = elements.filter(el => ['outlet', 'outlet_high', 'outlet_double', 'outlet_double_high', 'outlet_triple', 'outlet_triple_high'].includes(el.type));
  const sockets20A = elements.filter(el => el.type === 'socket_20a');
  const sockets20ASpe = elements.filter(el => el.type === 'socket_20a_spe');
  const sockets32A = elements.filter(el => el.type === 'socket_32a');
  const cableOutlets16A = elements.filter(el => el.type === 'cable_outlet_16a');
  const cableOutlets20A = elements.filter(el => el.type === 'cable_outlet_20a');
  const cableOutlets32A = elements.filter(el => el.type === 'cable_outlet_32a');
  const lights = elements.filter(el => ['dcl', 'dcl_applique', 'dcl_motion', 'spot', 'applique', 'applique_motion', 'led_strip', 'led_projector'].includes(el.type));

  const circuits: Circuit[] = [];

  // 1. ÉCLAIRAGE: Regrouper jusqu'à 8 éléments par circuit - Disjoncteur 10A
  const lightingCircuits = calculateLightingCircuits(lights);
  circuits.push(...lightingCircuits);

  // 2. PRISES 16A: Regrouper jusqu'à 8 prises par circuit - Disjoncteur 16A - Section 1.5mm²
  const outletCircuits = calculateOutletCircuits(outlets);
  circuits.push(...outletCircuits);

  // 3. PRISES 20A: Regrouper jusqu'à 12 prises par circuit - Disjoncteur 20A - Section 2.5mm²
  const socket20ACircuits = calculateSocket20ACircuits(sockets20A);
  circuits.push(...socket20ACircuits);

  // 4. PRISES 20A SPÉ: 1 prise par circuit - Disjoncteur 20A - Section 2.5mm²
  const socket20ASpeCircuits = calculateDedicatedCircuits(sockets20ASpe, 'socket_20a_spe');
  circuits.push(...socket20ASpeCircuits);

  // 5. PRISES 32A: 1 prise par circuit - Disjoncteur 32A - Section 6mm²
  const socket32ACircuits = calculateDedicatedCircuits(sockets32A, 'socket_32a');
  circuits.push(...socket32ACircuits);

  // 6. SORTIES DE CÂBLE: 1 par circuit dédié
  const cableOutlet16ACircuits = calculateDedicatedCircuits(cableOutlets16A, 'cable_outlet_16a');
  circuits.push(...cableOutlet16ACircuits);

  const cableOutlet20ACircuits = calculateDedicatedCircuits(cableOutlets20A, 'cable_outlet_20a');
  circuits.push(...cableOutlet20ACircuits);

  const cableOutlet32ACircuits = calculateDedicatedCircuits(cableOutlets32A, 'cable_outlet_32a');
  circuits.push(...cableOutlet32ACircuits);

  // Calculate total power with weighting
  const totalWeightedPower = calculateWeightedPower(circuits);

  // Calculate subscriber breaker
  const subscriberBreaker = calculateSubscriberBreaker(totalWeightedPower);

  // Calculate differential breakers with new rules
  const differentialBreakers = calculateDifferentialBreakersAdvanced(circuits);

  // Check compliance - Enhanced for new symbols
  const compliance = checkCompliance(circuits, elements);

  // Generate material list with equipment selection (including wall mounted)
  const materialList = generateCompleteMaterialList(circuits, differentialBreakers, elements, settings);

  return {
    totalPower: totalWeightedPower,
    circuits,
    mainBreaker: subscriberBreaker,
    differentialBreakers,
    compliance,
    materialList,
  };
}

function calculateWeightedPower(circuits: Circuit[]): number {
  let totalWeightedPower = 0;

  circuits.forEach(circuit => {
    // Circuits spéciaux : intensité pleine (pas de pondération)
    const isSpecialCircuit = circuit.name.toLowerCase().includes('convecteur') ||
                           circuit.name.toLowerCase().includes('chauffe-eau') ||
                           circuit.name.toLowerCase().includes('borne') ||
                           circuit.name.toLowerCase().includes('véhicule') ||
                           circuit.name.toLowerCase().includes('ce');

    if (isSpecialCircuit) {
      totalWeightedPower += circuit.breakerRating * 230; // Intensité pleine
    } else {
      totalWeightedPower += (circuit.breakerRating * 230) * 0.5; // Pondération 0.5
    }
  });

  return Math.round(totalWeightedPower);
}

function calculateSubscriberBreaker(totalWeightedPower: number): number {
  const totalCurrent = Math.ceil(totalWeightedPower / 230);
  
  // Check monophase options first
  for (const option of SUBSCRIBER_BREAKERS.monophase) {
    if (totalWeightedPower <= option.maxPower) {
      return option.rating;
    }
  }
  
  // If too high for monophase, suggest triphase
  for (const option of SUBSCRIBER_BREAKERS.triphase) {
    if (totalWeightedPower <= option.maxPower) {
      return option.rating; // Note: this would be triphase
    }
  }
  
  return 60; // Default maximum
}

function calculateDifferentialBreakersAdvanced(circuits: Circuit[]) {
  const differentials = [];
  let currentGroup: Circuit[] = [];
  let groupId = 1;

  circuits.forEach(circuit => {
    // Check if adding this circuit would exceed 8 breakers
    if (currentGroup.length >= NFC_CONSTANTS.MAX_BREAKERS_PER_DIFFERENTIAL) {
      // Create differential for current group
      if (currentGroup.length > 0) {
        const differential = createDifferentialForGroup(currentGroup, groupId++);
        differentials.push(differential);
      }
      // Start new group
      currentGroup = [circuit];
    } else {
      currentGroup.push(circuit);
    }
  });

  // Handle remaining circuits
  if (currentGroup.length > 0) {
    const differential = createDifferentialForGroup(currentGroup, groupId);
    differentials.push(differential);
  }

  return differentials;
}

function createDifferentialForGroup(circuits: Circuit[], groupId: number) {
  let totalWeightedCurrent = 0;
  let needsTypeA = false;

  circuits.forEach(circuit => {
    // Check if circuit needs type A differential
    const needsTypeACircuit = circuit.name.toLowerCase().includes('plaque') ||
                             circuit.name.toLowerCase().includes('cuisson') ||
                             circuit.name.toLowerCase().includes('lave-linge') ||
                             circuit.name.toLowerCase().includes('borne') ||
                             circuit.name.toLowerCase().includes('véhicule');

    if (needsTypeACircuit) {
      needsTypeA = true;
    }

    // Apply weighting for differential calculation
    const isSpecialCircuit = circuit.name.toLowerCase().includes('convecteur') ||
                           circuit.name.toLowerCase().includes('chauffe-eau') ||
                           circuit.name.toLowerCase().includes('borne') ||
                           circuit.name.toLowerCase().includes('véhicule') ||
                           circuit.name.toLowerCase().includes('ce');

    if (isSpecialCircuit) {
      totalWeightedCurrent += circuit.breakerRating; // Intensité pleine
    } else {
      totalWeightedCurrent += circuit.breakerRating * 0.5; // Pondération 0.5
    }
  });

  // Determine differential rating
  let rating = 40;
  if (totalWeightedCurrent > 40) {
    rating = 63;
  }

  return {
    id: `diff-${groupId}`,
    rating,
    sensitivity: 30,
    type: needsTypeA ? 'A' : 'AC',
    circuits: circuits.map(c => c.id),
  };
}

function calculateLightingCircuits(lights: ElectricalElement[]): Circuit[] {
  const circuits: Circuit[] = [];
  let currentCircuit: ElectricalElement[] = [];

  for (const light of lights) {
    if (currentCircuit.length >= NFC_CONSTANTS.MAX_LIGHTS_PER_CIRCUIT) {
      if (currentCircuit.length > 0) {
        const circuitPower = NFC_CONSTANTS.LIGHTING_CIRCUIT_MAX_CAPACITY;
        circuits.push(createCircuit('lighting', currentCircuit, circuitPower, 10, 1.5));
      }
      currentCircuit = [light];
    } else {
      currentCircuit.push(light);
    }
  }

  if (currentCircuit.length > 0) {
    const circuitPower = NFC_CONSTANTS.LIGHTING_CIRCUIT_MAX_CAPACITY;
    circuits.push(createCircuit('lighting', currentCircuit, circuitPower, 10, 1.5));
  }

  return circuits;
}

function calculateOutletCircuits(outlets: ElectricalElement[]): Circuit[] {
  const circuits: Circuit[] = [];
  let currentCircuit: ElectricalElement[] = [];

  for (const outlet of outlets) {
    if (currentCircuit.length >= NFC_CONSTANTS.MAX_OUTLETS_PER_CIRCUIT) {
      if (currentCircuit.length > 0) {
        const circuitPower = NFC_CONSTANTS.OUTLET_CIRCUIT_MAX_CAPACITY;
        circuits.push(createCircuit('outlet', currentCircuit, circuitPower, 16, 1.5));
      }
      currentCircuit = [outlet];
    } else {
      currentCircuit.push(outlet);
    }
  }

  if (currentCircuit.length > 0) {
    const circuitPower = NFC_CONSTANTS.OUTLET_CIRCUIT_MAX_CAPACITY;
    circuits.push(createCircuit('outlet', currentCircuit, circuitPower, 16, 1.5));
  }

  return circuits;
}

function calculateSocket20ACircuits(sockets20A: ElectricalElement[]): Circuit[] {
  const circuits: Circuit[] = [];
  let currentCircuit: ElectricalElement[] = [];

  for (const socket of sockets20A) {
    if (currentCircuit.length >= NFC_CONSTANTS.MAX_SOCKETS_20A_PER_CIRCUIT) {
      if (currentCircuit.length > 0) {
        const circuitPower = NFC_CONSTANTS.SOCKET_20A_CIRCUIT_MAX_CAPACITY;
        circuits.push(createCircuit('socket_20a', currentCircuit, circuitPower, 20, 2.5));
      }
      currentCircuit = [socket];
    } else {
      currentCircuit.push(socket);
    }
  }

  if (currentCircuit.length > 0) {
    const circuitPower = NFC_CONSTANTS.SOCKET_20A_CIRCUIT_MAX_CAPACITY;
    circuits.push(createCircuit('socket_20a', currentCircuit, circuitPower, 20, 2.5));
  }

  return circuits;
}

function calculateDedicatedCircuits(sockets: ElectricalElement[], socketType: string): Circuit[] {
  return sockets.map(socket => {
    if (socketType === 'socket_32a' || socketType === 'cable_outlet_32a') {
      const circuitPower = 32 * 230;
      return createCircuit('dedicated', [socket], circuitPower, 32, 6);
    } else if (socketType === 'cable_outlet_16a') {
      const circuitPower = 16 * 230;
      return createCircuit('dedicated', [socket], circuitPower, 16, 1.5);
    } else {
      const circuitPower = 20 * 230;
      return createCircuit('dedicated', [socket], circuitPower, 20, 2.5);
    }
  });
}

function createCircuit(
  type: Circuit['type'], 
  elements: ElectricalElement[], 
  power: number,
  breakerRating: number,
  cableSection: number
): Circuit {
  const current = breakerRating;
  
  let circuitName = '';
  if (type === 'lighting') {
    circuitName = `Éclairage (${elements.length} points)`;
  } else if (type === 'outlet') {
    circuitName = `Prises 16A (${elements.length} unités)`;
  } else if (type === 'socket_20a') {
    circuitName = `Prises 20A (${elements.length} unités)`;
  } else if (type === 'dedicated') {
    if (elements[0]?.type === 'socket_32a') {
      circuitName = `Prise 32A spécialisée`;
    } else if (elements[0]?.type === 'socket_20a_spe') {
      circuitName = `Prise 20A spécialisée`;
    } else if (elements[0]?.type === 'cable_outlet_16a') {
      circuitName = `Sortie de câble 16A`;
    } else if (elements[0]?.type === 'cable_outlet_20a') {
      circuitName = `Sortie de câble CE 20A`;
    } else if (elements[0]?.type === 'cable_outlet_32a') {
      circuitName = `Sortie de câble 32A`;
    } else {
      circuitName = `Équipement spécialisé`;
    }
  }
  
  return {
    id: `circuit-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: circuitName,
    type,
    elements: elements.map(el => el.id),
    power,
    current,
    cableSection,
    breakerRating,
    differentialRating: 30,
    length: 20,
  };
}

function checkCompliance(circuits: Circuit[], elements: ElectricalElement[]): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // Check circuit element counts
  const lightingCircuits = circuits.filter(c => c.type === 'lighting');
  const outletCircuits = circuits.filter(c => c.type === 'outlet');
  const socket20ACircuits = circuits.filter(c => c.type === 'socket_20a');
  
  lightingCircuits.forEach((circuit, index) => {
    if (circuit.elements.length <= NFC_CONSTANTS.MAX_LIGHTS_PER_CIRCUIT) {
      checks.push({
        rule: 'Éclairage par circuit',
        status: 'compliant',
        message: `Circuit éclairage ${index + 1}: ${circuit.elements.length}/${NFC_CONSTANTS.MAX_LIGHTS_PER_CIRCUIT} points`
      });
    } else {
      checks.push({
        rule: 'Éclairage par circuit',
        status: 'error',
        message: `Circuit éclairage ${index + 1}: ${circuit.elements.length} points (max: ${NFC_CONSTANTS.MAX_LIGHTS_PER_CIRCUIT})`,
        suggestion: 'Diviser le circuit'
      });
    }
  });

  outletCircuits.forEach((circuit, index) => {
    if (circuit.elements.length <= NFC_CONSTANTS.MAX_OUTLETS_PER_CIRCUIT) {
      checks.push({
        rule: 'Prises 16A par circuit',
        status: 'compliant',
        message: `Circuit prises 16A ${index + 1}: ${circuit.elements.length}/${NFC_CONSTANTS.MAX_OUTLETS_PER_CIRCUIT} prises`
      });
    } else {
      checks.push({
        rule: 'Prises 16A par circuit',
        status: 'error',
        message: `Circuit prises 16A ${index + 1}: ${circuit.elements.length} prises (max: ${NFC_CONSTANTS.MAX_OUTLETS_PER_CIRCUIT})`,
        suggestion: 'Diviser le circuit'
      });
    }
  });

  socket20ACircuits.forEach((circuit, index) => {
    if (circuit.elements.length <= NFC_CONSTANTS.MAX_SOCKETS_20A_PER_CIRCUIT) {
      checks.push({
        rule: 'Prises 20A par circuit',
        status: 'compliant',
        message: `Circuit prises 20A ${index + 1}: ${circuit.elements.length}/${NFC_CONSTANTS.MAX_SOCKETS_20A_PER_CIRCUIT} prises`
      });
    } else {
      checks.push({
        rule: 'Prises 20A par circuit',
        status: 'error',
        message: `Circuit prises 20A ${index + 1}: ${circuit.elements.length} prises (max: ${NFC_CONSTANTS.MAX_SOCKETS_20A_PER_CIRCUIT})`,
        suggestion: 'Diviser le circuit'
      });
    }
  });

  // Enhanced connection checking for SVG symbols
  const switches = elements.filter(el => {
    const switchTypes = [
      'switch', 'switch_pilot', 'switch_double', 'switch_double_pilot',
      'switch_va_et_vient', 'switch_va_et_vient_pilot', 
      'switch_double_va_et_vient', 'switch_double_va_et_vient_pilot',
      'push_button', 'push_button_pilot', 'switch_dimmer', 'motion_detector'
    ];
    return switchTypes.includes(el.type);
  });
  
  const connectedSwitches = switches.filter(sw => sw.connections && sw.connections.length > 0);
  
  if (switches.length > 0) {
    checks.push({
      rule: 'Connexions interrupteurs',
      status: connectedSwitches.length === switches.length ? 'compliant' : 'warning',
      message: `${connectedSwitches.length}/${switches.length} interrupteurs connectés`,
      suggestion: connectedSwitches.length < switches.length ? 'Connecter tous les interrupteurs aux éclairages' : undefined
    });
  }

  const hasGeneralDifferential = circuits.some(c => c.differentialRating === 30);
  if (hasGeneralDifferential) {
    checks.push({
      rule: 'Protection différentielle',
      status: 'compliant',
      message: 'Protection différentielle 30mA présente'
    });
  } else {
    checks.push({
      rule: 'Protection différentielle',
      status: 'error',
      message: 'Protection différentielle 30mA manquante',
      suggestion: 'Ajouter un interrupteur différentiel 30mA'
    });
  }

  return checks;
}

function generateCompleteMaterialList(
  circuits: Circuit[], 
  differentialBreakers: any[], 
  elements: ElectricalElement[],
  settings?: ProjectSettings
): MaterialItem[] {
  const materials: MaterialItem[] = [];

  // 1. APPAREILLAGE MURAL - Count all wall mounted elements (enhanced for new symbols)
  const wallMountedCounts = countWallMountedElements(elements);
  
  Object.entries(wallMountedCounts).forEach(([type, count]) => {
    if (count > 0) {
      const item = createWallMountedMaterialItem(type, count, settings);
      if (item) materials.push(item);
    }
  });

  // 2. DISJONCTEUR D'ABONNÉ
  const subscriberBreakerItem: MaterialItem = {
    id: 'subscriber-breaker',
    name: `Disjoncteur d'abonné ${circuits.length > 0 ? calculateSubscriberBreaker(calculateWeightedPower(circuits)) : 30}A`,
    brand: getBrandFromSettings(settings, 'modular') || 'Schneider',
    reference: `DB-${circuits.length > 0 ? calculateSubscriberBreaker(calculateWeightedPower(circuits)) : 30}A`,
    quantity: 1,
    unitPrice: 85,
    totalPrice: 85,
    category: 'Protection'
  };
  materials.push(subscriberBreakerItem);

  // 3. INTERRUPTEURS DIFFÉRENTIELS
  differentialBreakers.forEach(diff => {
    const diffType = `differential_${diff.rating}a`;
    const selectedSeriesId = settings?.modularSeries;
    
    let item: MaterialItem;
    
    if (selectedSeriesId) {
      const equipmentItems = getEquipmentByType('modular', diffType);
      const selectedItem = equipmentItems.find(item => item.seriesId === selectedSeriesId);
      
      if (selectedItem) {
        const series = getSeriesById(selectedSeriesId);
        const brand = series ? getBrandById(series.brandId) : null;
        
        item = {
          id: `diff-${diff.id}`,
          name: `${selectedItem.name} Type ${diff.type}`,
          brand: brand?.name || 'Schneider',
          reference: selectedItem.reference,
          quantity: 1,
          unitPrice: selectedItem.price || 85,
          totalPrice: selectedItem.price || 85,
          category: 'Protection',
          seriesId: selectedSeriesId
        };
      } else {
        item = createDefaultDifferentialItem(diff);
      }
    } else {
      item = createDefaultDifferentialItem(diff);
    }
    
    materials.push(item);
  });

  // 4. DISJONCTEURS MODULAIRES
  const breakerCounts = circuits.reduce((acc, circuit) => {
    acc[circuit.breakerRating] = (acc[circuit.breakerRating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  Object.entries(breakerCounts).forEach(([rating, count]) => {
    const breakerType = `breaker_${rating}a`;
    const selectedSeriesId = settings?.modularSeries;
    
    let item: MaterialItem;
    
    if (selectedSeriesId) {
      const equipmentItems = getEquipmentByType('modular', breakerType);
      const selectedItem = equipmentItems.find(item => item.seriesId === selectedSeriesId);
      
      if (selectedItem) {
        const series = getSeriesById(selectedSeriesId);
        const brand = series ? getBrandById(series.brandId) : null;
        
        item = {
          id: `breaker-${rating}a`,
          name: selectedItem.name,
          brand: brand?.name || 'Schneider',
          reference: selectedItem.reference,
          quantity: count,
          unitPrice: selectedItem.price || 25,
          totalPrice: count * (selectedItem.price || 25),
          category: 'Protection',
          seriesId: selectedSeriesId
        };
      } else {
        item = createDefaultBreakerItem(rating, count);
      }
    } else {
      item = createDefaultBreakerItem(rating, count);
    }
    
    materials.push(item);
  });

  // 5. CÂBLES
  const cableCounts = circuits.reduce((acc, circuit) => {
    const key = circuit.cableSection;
    acc[key] = (acc[key] || 0) + circuit.length;
    return acc;
  }, {} as Record<number, number>);

  Object.entries(cableCounts).forEach(([section, length]) => {
    materials.push({
      id: `cable-${section}mm2`,
      name: `Câble ${section}mm² (mètres)`,
      brand: 'Nexans',
      reference: `U-1000-R2V-${section}G`,
      quantity: length,
      unitPrice: 2.5,
      totalPrice: length * 2.5,
      category: 'Câblage'
    });
  });

  return materials;
}

function countWallMountedElements(elements: ElectricalElement[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  elements.forEach(element => {
    // Map element types to material types - Enhanced for new symbols
    let materialType = element.type;
    
    // Group similar elements
    if (['dcl', 'dcl_applique', 'dcl_motion'].includes(element.type)) {
      materialType = 'dcl';
    } else if (['applique', 'applique_motion'].includes(element.type)) {
      materialType = 'applique';
    } else if (['switch', 'switch_pilot', 'switch_double', 'switch_double_pilot', 'switch_va_et_vient', 'switch_va_et_vient_pilot', 'switch_double_va_et_vient', 'switch_double_va_et_vient_pilot', 'push_button', 'push_button_pilot', 'switch_dimmer'].includes(element.type)) {
      materialType = 'switch';
    } else if (['outlet', 'outlet_high', 'outlet_double', 'outlet_double_high', 'outlet_triple', 'outlet_triple_high'].includes(element.type)) {
      materialType = 'outlet';
    }
    
    counts[materialType] = (counts[materialType] || 0) + 1;
  });
  
  return counts;
}

function createWallMountedMaterialItem(type: string, count: number, settings?: ProjectSettings): MaterialItem | null {
  const selectedSeriesId = settings?.wallMountedSeries;
  const brandId = settings?.wallMountedBrand || 'schneider';
  
  // Get equipment name and price based on type - Enhanced for new symbols
  const equipmentInfo = getWallMountedEquipmentInfo(type);
  if (!equipmentInfo) return null;
  
  let item: MaterialItem;
  
  if (selectedSeriesId) {
    const equipmentItems = getEquipmentByType('wall_mounted', type);
    const selectedItem = equipmentItems.find(item => item.seriesId === selectedSeriesId);
    
    if (selectedItem) {
      const series = getSeriesById(selectedSeriesId);
      const brand = series ? getBrandById(series.brandId) : null;
      
      item = {
        id: `wall-${type}`,
        name: selectedItem.name,
        brand: brand?.name || 'Schneider',
        reference: selectedItem.reference,
        quantity: count,
        unitPrice: selectedItem.price || equipmentInfo.defaultPrice,
        totalPrice: count * (selectedItem.price || equipmentInfo.defaultPrice),
        category: 'Appareillage mural',
        seriesId: selectedSeriesId
      };
    } else {
      item = createDefaultWallMountedItem(type, count, equipmentInfo, brandId);
    }
  } else {
    item = createDefaultWallMountedItem(type, count, equipmentInfo, brandId);
  }
  
  return item;
}

function getWallMountedEquipmentInfo(type: string): { name: string; defaultPrice: number } | null {
  const equipmentMap: Record<string, { name: string; defaultPrice: number }> = {
    'outlet': { name: 'Prise 16A 2P+T', defaultPrice: 8.50 },
    'outlet_triple': { name: 'Prise triple 16A 2P+T', defaultPrice: 15.80 },
    'socket_20a': { name: 'Prise 20A 2P+T', defaultPrice: 12.30 },
    'socket_20a_spe': { name: 'Prise 20A spécialisée', defaultPrice: 15.80 },
    'socket_32a': { name: 'Prise 32A 2P+T', defaultPrice: 25.60 },
    'dcl': { name: 'DCL (Dispositif de Connexion Luminaire)', defaultPrice: 4.20 },
    'dcl_applique': { name: 'DCL applique murale', defaultPrice: 4.20 },
    'spot': { name: 'Spot encastrable', defaultPrice: 12.50 },
    'applique': { name: 'Applique murale', defaultPrice: 18.90 },
    'led_strip': { name: 'Réglette LED', defaultPrice: 25.60 },
    'led_projector': { name: 'Projecteur LED', defaultPrice: 45.80 },
    'switch': { name: 'Interrupteur/commutateur', defaultPrice: 6.80 },
    'motion_detector': { name: 'Détecteur de mouvement', defaultPrice: 35.20 },
    'cable_outlet_16a': { name: 'Sortie de câble 16A', defaultPrice: 8.90 },
    'cable_outlet_20a': { name: 'Sortie de câble CE 20A', defaultPrice: 12.40 },
    'cable_outlet_32a': { name: 'Sortie de câble 32A', defaultPrice: 18.70 },
    'rj45': { name: 'Prise RJ45', defaultPrice: 12.50 },
    'tv_outlet': { name: 'Prise TV coaxiale', defaultPrice: 8.90 },
    'interphone': { name: 'Interphone', defaultPrice: 85.60 },
    'tgbt': { name: 'Tableau électrique', defaultPrice: 150.00 }
  };
  
  return equipmentMap[type] || null;
}

function createDefaultWallMountedItem(type: string, count: number, equipmentInfo: any, brandId: string): MaterialItem {
  const brand = getBrandById(brandId);
  
  return {
    id: `wall-${type}`,
    name: equipmentInfo.name,
    brand: brand?.name || 'Schneider',
    reference: `${brandId.toUpperCase()}-${type.toUpperCase()}`,
    quantity: count,
    unitPrice: equipmentInfo.defaultPrice,
    totalPrice: count * equipmentInfo.defaultPrice,
    category: 'Appareillage mural'
  };
}

function getBrandFromSettings(settings?: ProjectSettings, category?: 'wall_mounted' | 'modular'): string | undefined {
  if (!settings) return undefined;
  
  if (category === 'wall_mounted') {
    return settings.wallMountedBrand;
  } else if (category === 'modular') {
    return settings.modularBrand;
  }
  
  return undefined;
}

function createDefaultBreakerItem(rating: string | number, count: number): MaterialItem {
  return {
    id: `breaker-${rating}a`,
    name: `Disjoncteur ${rating}A courbe C`,
    brand: 'Schneider',
    reference: `IC60N-${rating}A-C`,
    quantity: count,
    unitPrice: 25,
    totalPrice: count * 25,
    category: 'Protection'
  };
}

function createDefaultDifferentialItem(diff: any): MaterialItem {
  return {
    id: `diff-${diff.id}`,
    name: `Interrupteur différentiel ${diff.rating}A ${diff.sensitivity}mA Type ${diff.type}`,
    brand: 'Schneider',
    reference: `ID-${diff.rating}A-${diff.sensitivity}mA-${diff.type}`,
    quantity: 1,
    unitPrice: 85,
    totalPrice: 85,
    category: 'Protection'
  };
}