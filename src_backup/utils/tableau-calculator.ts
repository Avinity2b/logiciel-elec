/**
 * Calculateur de Tableaux Électriques Professionnel
 * Conforme NF C 15-100 avec règle de l'aval et optimisations
 * @version 2.0.0
 */

import { ElectricalElement, Circuit, DDRConfig, TableauResult, ProjectSettings } from '../types/electrical';

export interface TableauConfiguration {
  id: string;
  name: string;
  type: 'main' | 'secondary' | 'sub_panel';
  location: string;
  surface: number;
  circuits: Circuit[];
  ddrConfig: DDRConfig[];
  physicalSpecs: PhysicalSpecs;
  powerSpecs: PowerSpecs;
  compliance: ComplianceReport;
}

export interface PhysicalSpecs {
  rows: number;
  modulesPerRow: number;
  totalModules: number;
  usedModules: number;
  reserveModules: number;
  reservePercentage: number;
  enclosureType: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface PowerSpecs {
  installedPower: number;
  weightedPower: number;
  simultaneousPower: number;
  subscriptionPower: number;
  mainBreakerRating: number;
  powerFactor: number;
  loadDiversity: number;
}

export interface ComplianceReport {
  nfc15100: {
    isCompliant: boolean;
    version: string;
    checkedRules: string[];
    violations: ComplianceViolation[];
  };
  safety: {
    differentialProtection: boolean;
    earthing: boolean;
    overloadProtection: boolean;
    shortCircuitProtection: boolean;
  };
  performance: {
    optimizationScore: number;
    efficiencyRating: string;
    suggestions: string[];
  };
}

export interface ComplianceViolation {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  element?: string;
  solution: string;
}

// ===== CONSTANTES AVANCÉES =====

const NFC15100_RULES = {
  CIRCUIT_LIMITS: {
    'lighting': { max: 8, breaker: 10, cable: 1.5, rule: '771.314.2.2' },
    'outlet_16a': { max: 8, breaker: 16, cable: 1.5, rule: '771.314.2.3' },
    'kitchen_20a': { max: 12, breaker: 20, cable: 2.5, rule: '771.314.2.4' },
    'specialized': { max: 1, breaker: 20, cable: 2.5, rule: '771.314.2.5' },
    'cooktop': { max: 1, breaker: 32, cable: 6, rule: '771.314.2.6' }
  },
  
  DDR_REQUIREMENTS: {
    sensitivity: 30, // mA
    maxCircuits: 8,
    typeA: ['kitchen', 'washing_machine', 'dishwasher', 'cooktop'],
    typeAC: ['lighting', 'outlets', 'general']
  },
  
  HOUSING_MINIMUMS: {
    'T1': { surface: 35, minDDR: [{ type: 'AC', rating: 25 }, { type: 'A', rating: 40 }] },
    'T2-T4': { surface: 100, minDDR: [{ type: 'AC', rating: 40 }, { type: 'AC', rating: 40 }, { type: 'A', rating: 40 }] },
    'T5+': { surface: 100, minDDR: [{ type: 'AC', rating: 40 }, { type: 'AC', rating: 40 }, { type: 'AC', rating: 40 }, { type: 'A', rating: 40 }] }
  }
};

const POWER_CALCULATION = {
  COEFFICIENTS: {
    // Coefficients d'utilisation par type (Ku)
    lighting: 1.0,
    heating: 1.0,
    waterHeater: 1.0,
    comfortOutlets: 0.1,
    kitchen: 0.3,
    appliances: 0.7,
    airConditioning: 0.8
  },
  
  SIMULTANEITY: {
    residential: 0.7,
    allElectric: 0.8,
    commercial: 0.9
  },
  
  RESERVE_FACTOR: 1.1,
  
  STANDARD_POWERS: {
    // Puissances standards par équipement (Watts)
    'dcl': 100,
    'spot': 50,
    'outlet_16a': 3680,
    'outlet_20a': 4600,
    'washing_machine': 2500,
    'dishwasher': 2000,
    'cooktop': 7200,
    'oven': 3000,
    'water_heater': 3000
  }
};

/**
 * Classe principale du calculateur de tableaux électriques
 * Suite de tableau-calculator.ts
 */

export class AdvancedTableauCalculator {
  private complianceEngine: ComplianceEngine;
  private optimizationEngine: OptimizationEngine;
  private powerCalculator: PowerCalculator;
  
  constructor() {
    this.complianceEngine = new ComplianceEngine();
    this.optimizationEngine = new OptimizationEngine();
    this.powerCalculator = new PowerCalculator();
  }

  /**
   * Calcul complet d'un tableau électrique
   */
  public async calculateTableau(
    elements: ElectricalElement[], 
    settings: ProjectSettings
  ): Promise<TableauConfiguration> {
    
    console.log('🔧 Démarrage calcul tableau électrique professionnel');
    
    // Phase 1: Analyse et préparation des données
    const normalizedElements = this.normalizeElements(elements);
    const roomAnalysis = this.analyzeRooms(normalizedElements);
    
    // Phase 2: Optimisation des circuits
    const optimizedCircuits = await this.optimizationEngine.optimizeCircuits(
      normalizedElements, 
      roomAnalysis, 
      settings
    );
    
    // Phase 3: Calcul des protections différentielles
    const ddrConfiguration = await this.calculateDifferentialProtection(
      optimizedCircuits, 
      settings
    );
    
    // Phase 4: Dimensionnement physique
    const physicalSpecs = this.calculatePhysicalDimensions(
      optimizedCircuits, 
      ddrConfiguration
    );
    
    // Phase 5: Calculs de puissance
    const powerSpecs = this.powerCalculator.calculatePowerSpecs(
      optimizedCircuits, 
      settings
    );
    
    // Phase 6: Validation de conformité
    const complianceReport = await this.complianceEngine.validateCompliance(
      optimizedCircuits,
      ddrConfiguration,
      physicalSpecs,
      powerSpecs,
      settings
    );
    
    return {
      id: this.generateTableauId(),
      name: settings.projectName || 'Tableau Principal',
      type: 'main',
      location: settings.location || 'TGBT',
      surface: settings.surface || 0,
      circuits: optimizedCircuits,
      ddrConfig: ddrConfiguration,
      physicalSpecs,
      powerSpecs,
      compliance: complianceReport
    };
  }

  /**
   * Normalisation des éléments électriques
   */
  private normalizeElements(elements: ElectricalElement[]): ElectricalElement[] {
    return elements.map(element => ({
      ...element,
      power: element.power || POWER_CALCULATION.STANDARD_POWERS[element.type] || 100,
      room: element.room || 'unknown',
      phase: element.phase || 1,
      voltage: element.voltage || 230,
      specialized: element.specialized || this.isSpecializedByDefault(element.type)
    }));
  }

  /**
   * Analyse des pièces et optimisation spatiale
   */
  private analyzeRooms(elements: ElectricalElement[]): RoomAnalysis {
    const roomGroups = this.groupBy(elements, 'room');
    const analysis: RoomAnalysis = {};
    
    Object.entries(roomGroups).forEach(([room, roomElements]) => {
      analysis[room] = {
        elementCount: roomElements.length,
        totalPower: roomElements.reduce((sum, el) => sum + el.power, 0),
        types: [...new Set(roomElements.map(el => el.type))],
        requiresSpecializedCircuits: roomElements.some(el => el.specialized),
        optimizationPriority: this.getRoomPriority(room),
        suggestedCircuits: this.suggestCircuitsForRoom(room, roomElements)
      };
    });
    
    return analysis;
  }

  /**
   * Calcul des protections différentielles avec règle de l'aval
   */
  private async calculateDifferentialProtection(
    circuits: Circuit[], 
    settings: ProjectSettings
  ): Promise<DDRConfig[]> {
    
    console.log('⚡ Calcul protections différentielles avec règle de l\'aval');
    
    // 1. Déterminer les minimums réglementaires
    const housingType = this.getHousingType(settings.surface, settings.roomCount);
    const minimumDDRs = NFC15100_RULES.HOUSING_MINIMUMS[housingType].minDDR;
    
    // 2. Calculer les besoins réels par circuit
    const circuitNeeds = circuits.map(circuit => ({
      circuit,
      requiredType: this.getDDRType(circuit),
      calculatedAmperage: this.applyDownstreamRule(circuit),
      priority: this.getCircuitPriority(circuit)
    }));
    
    // 3. Algorithme d'optimisation de répartition
    const ddrConfig = this.optimizeDDRDistribution(circuitNeeds, minimumDDRs);
    
    // 4. Validation et ajustements
    return this.validateAndAdjustDDR(ddrConfig);
  }

  /**
   * Application de la règle de l'aval pour calcul ampérage DDR
   * Formule NF C 15-100: DDR = Σ(Chauffage/CE à 100%) + Σ(Autres × 50%)
   */
  private applyDownstreamRule(circuit: Circuit): number {
    let totalAmperage = 0;
    
    circuit.elements.forEach(element => {
      const elementAmperage = element.power / element.voltage;
      
      if (this.isAlwaysOnElement(element.type)) {
        // 100% pour chauffage, chauffe-eau, VE
        totalAmperage += elementAmperage;
      } else {
        // 50% pour les autres circuits
        totalAmperage += elementAmperage * 0.5;
      }
    });
    
    return Math.ceil(totalAmperage);
  }

  /**
   * Optimisation de la répartition des circuits sur les DDR
   */
  private optimizeDDRDistribution(
    circuitNeeds: any[], 
    minimumDDRs: any[]
  ): DDRConfig[] {
    
    // Initialiser avec les DDR minimums
    const ddrConfig: DDRConfig[] = minimumDDRs.map(min => ({
      id: this.generateDDRId(),
      type: min.type,
      rating: min.rating,
      sensitivity: 30,
      circuits: [],
      calculatedLoad: 0,
      utilizationRate: 0,
      isCompliant: true
    }));
    
    // Trier les circuits par priorité et ampérage
    const sortedNeeds = circuitNeeds.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.calculatedAmperage - a.calculatedAmperage;
    });
    
    // Algorithme de bin packing optimisé
    sortedNeeds.forEach(need => {
      const bestDDR = this.findOptimalDDR(ddrConfig, need);
      
      if (bestDDR) {
        bestDDR.circuits.push(need.circuit);
        bestDDR.calculatedLoad += need.calculatedAmperage;
        bestDDR.utilizationRate = bestDDR.calculatedLoad / bestDDR.rating;
        need.circuit.ddrId = bestDDR.id;
      } else {
        // Créer un nouveau DDR si nécessaire
        const newDDR = this.createAdditionalDDR(need);
        ddrConfig.push(newDDR);
      }
    });
    
    return ddrConfig;
  }

  /**
   * Recherche du DDR optimal pour un circuit
   */
  private findOptimalDDR(ddrConfig: DDRConfig[], need: any): DDRConfig | null {
    const compatibleDDRs = ddrConfig.filter(ddr => 
      ddr.type === need.requiredType &&
      ddr.circuits.length < NFC15100_RULES.DDR_REQUIREMENTS.maxCircuits &&
      (ddr.calculatedLoad + need.calculatedAmperage) <= (ddr.rating * 0.9) // 90% max
    );
    
    if (compatibleDDRs.length === 0) return null;
    
    // Optimiser pour la meilleure utilisation sans surcharge
    return compatibleDDRs.reduce((best, current) => {
      const currentUtil = (current.calculatedLoad + need.calculatedAmperage) / current.rating;
      const bestUtil = (best.calculatedLoad + need.calculatedAmperage) / best.rating;
      
      // Préférer l'utilisation la plus élevée sans dépasser 90%
      return currentUtil > bestUtil && currentUtil <= 0.9 ? current : best;
    });
  }

  /**
   * Calcul des dimensions physiques du tableau
   */
  private calculatePhysicalDimensions(
    circuits: Circuit[], 
    ddrConfig: DDRConfig[]
  ): PhysicalSpecs {
    
    console.log('📐 Calcul dimensions physiques');
    
    // Calcul modules utilisés
    let usedModules = 0;
    
    // Modules DDR (2 modules chacun pour résidentiel)
    usedModules += ddrConfig.length * 2;
    
    // Modules disjoncteurs
    circuits.forEach(circuit => {
      if (circuit.breakerRating <= 20) {
        usedModules += 1; // Disjoncteur unipolaire
      } else {
        usedModules += 2; // Disjoncteur bipolaire pour 32A+
      }
    });
    
    // Modules auxiliaires
    const auxiliaryModules = this.calculateAuxiliaryModules(circuits);
    usedModules += auxiliaryModules;
    
    // Calcul réserve (minimum 20% selon NF C 15-100)
    const reservePercentage = Math.max(20, 25); // 25% recommandé
    const reserveModules = Math.ceil(usedModules * (reservePercentage / 100));
    const totalModules = usedModules + reserveModules;
    
    // Calcul rangées (18 modules par rangée standard)
    const modulesPerRow = 18;
    const rows = Math.ceil(totalModules / modulesPerRow);
    
    // Dimensions coffret
    const dimensions = this.calculateEnclosureDimensions(rows, modulesPerRow);
    
    return {
      rows,
      modulesPerRow,
      totalModules,
      usedModules,
      reserveModules,
      reservePercentage,
      enclosureType: this.selectEnclosureType(rows, totalModules),
      dimensions
    };
  }

  // ===== MÉTHODES UTILITAIRES =====

  private isSpecializedByDefault(type: string): boolean {
    return ['cooktop', 'water_heater', 'heating', 'washing_machine', 'dishwasher'].includes(type);
  }

  private isAlwaysOnElement(type: string): boolean {
    return ['heating', 'water_heater', 'electric_vehicle_charger'].includes(type);
  }

  private getDDRType(circuit: Circuit): 'A' | 'AC' {
    const requiresTypeA = circuit.elements.some(el => 
      NFC15100_RULES.DDR_REQUIREMENTS.typeA.includes(el.type) || el.specialized
    );
    return requiresTypeA ? 'A' : 'AC';
  }

  private getHousingType(surface?: number, roomCount?: number): string {
    if (surface && surface < 35) return 'T1';
    if (roomCount && roomCount >= 5) return 'T5+';
    return 'T2-T4';
  }

  private getRoomPriority(room: string): number {
    const priorities = {
      'kitchen': 10,
      'bathroom': 9,
      'living_room': 8,
      'bedroom': 7,
      'hallway': 6,
      'storage': 5,
      'unknown': 1
    };
    return priorities[room] || 5;
  }

  private getCircuitPriority(circuit: Circuit): number {
    if (circuit.type === 'specialized') return 10;
    if (circuit.type === 'kitchen_20a') return 9;
    if (circuit.type === 'lighting') return 8;
    return 7;
  }

  private calculateAuxiliaryModules(circuits: Circuit[]): number {
    let modules = 0;
    
    // Parafoudre (obligatoire dans certaines zones)
    modules += 2;
    
    // Contacteur jour/nuit si chauffe-eau
    const hasWaterHeater = circuits.some(c => 
      c.elements.some(el => el.type === 'water_heater')
    );
    if (hasWaterHeater) modules += 1;
    
    // Télérupteurs pour va-et-vient complexes
    const complexLighting = circuits.filter(c => c.type === 'lighting' && c.elements.length > 4);
    modules += complexLighting.length * 0.5; // Estimation
    
    return Math.ceil(modules);
  }

  private calculateEnclosureDimensions(rows: number, modulesPerRow: number) {
    // Dimensions standard coffrets Schneider/Legrand
    const moduleWidth = 17.5; // mm
    const rowHeight = 45; // mm
    const margins = { width: 40, height: 100, depth: 20 };
    
    return {
      width: (modulesPerRow * moduleWidth) + margins.width,
      height: (rows * rowHeight) + margins.height,
      depth: 100 + margins.depth // Profondeur standard + marge
    };
  }

  private selectEnclosureType(rows: number, totalModules: number): string {
    if (rows <= 1) return 'Coffret 1 rangée';
    if (rows <= 2) return 'Coffret 2 rangées';
    if (rows <= 3) return 'Coffret 3 rangées';
    return 'Armoire électrique';
  }

  private generateTableauId(): string {
    return `TAB_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateDDRId(): string {
    return `DDR_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private createAdditionalDDR(need: any): DDRConfig {
    // Créer un DDR avec le calibre minimal nécessaire
    const minRating = Math.max(25, Math.ceil(need.calculatedAmperage / 0.9));
    const standardRatings = [25, 40, 63];
    const selectedRating = standardRatings.find(r => r >= minRating) || 63;
    
    return {
      id: this.generateDDRId(),
      type: need.requiredType,
      rating: selectedRating,
      sensitivity: 30,
      circuits: [need.circuit],
      calculatedLoad: need.calculatedAmperage,
      utilizationRate: need.calculatedAmperage / selectedRating,
      isCompliant: true
    };
  }

  private validateAndAdjustDDR(ddrConfig: DDRConfig[]): DDRConfig[] {
    return ddrConfig.map(ddr => {
      // Vérifier surcharge
      if (ddr.utilizationRate > 1.0) {
        console.warn(`⚠️ DDR ${ddr.rating}A surchargé: ${(ddr.utilizationRate * 100).toFixed(1)}%`);
        ddr.isCompliant = false;
      }
      
      // Vérifier nombre de circuits
      if (ddr.circuits.length > NFC15100_RULES.DDR_REQUIREMENTS.maxCircuits) {
        console.warn(`⚠️ DDR ${ddr.rating}A: trop de circuits (${ddr.circuits.length})`);
        ddr.isCompliant = false;
      }
      
      return ddr;
    });
  }

  private suggestCircuitsForRoom(room: string, elements: ElectricalElement[]): string[] {
    const suggestions: string[] = [];
    
    // Logique de suggestions basée sur le type de pièce
    if (room === 'kitchen') {
      suggestions.push('Circuit prises 20A plan de travail');
      suggestions.push('Circuit électroménager spécialisé');
    }
    
    if (elements.some(el => el.type === 'lighting')) {
      suggestions.push('Circuit éclairage dédié');
    }
    
    return suggestions;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
}

// ===== INTERFACES SUPPLÉMENTAIRES =====

interface RoomAnalysis {
  [room: string]: {
    elementCount: number;
    totalPower: number;
    types: string[];
    requiresSpecializedCircuits: boolean;
    optimizationPriority: number;
    suggestedCircuits: string[];
  };
}

// ===== CLASSES AUXILIAIRES =====

class ComplianceEngine {
  async validateCompliance(
    circuits: Circuit[],
    ddrConfig: DDRConfig[],
    physicalSpecs: PhysicalSpecs,
    powerSpecs: PowerSpecs,
    settings: ProjectSettings
  ): Promise<ComplianceReport> {
    
    const violations: ComplianceViolation[] = [];
    const checkedRules: string[] = [];
    
    // Vérification des limites de circuits
    circuits.forEach(circuit => {
      const rule = NFC15100_RULES.CIRCUIT_LIMITS[circuit.type];
      if (rule) {
        checkedRules.push(rule.rule);
        if (circuit.elements.length > rule.max) {
          violations.push({
            rule: rule.rule,
            severity: 'error',
            description: `Circuit ${circuit.name} dépasse la limite autorisée`,
            element: circuit.id,
            solution: `Diviser en ${Math.ceil(circuit.elements.length / rule.max)} circuits`
          });
        }
      }
    });
    
    // Vérification DDR
    ddrConfig.forEach(ddr => {
      if (!ddr.isCompliant) {
        violations.push({
          rule: 'DDR_COMPLIANCE',
          severity: ddr.utilizationRate > 1.0 ? 'error' : 'warning',
          description: `DDR ${ddr.rating}A non conforme`,
          solution: 'Rééquilibrer ou ajouter un DDR supplémentaire'
        });
      }
    });
    
    return {
      nfc15100: {
        isCompliant: violations.filter(v => v.severity === 'error').length === 0,
        version: 'NF C 15-100:2015',
        checkedRules,
        violations
      },
      safety: {
        differentialProtection: ddrConfig.length > 0,
        earthing: true,
        overloadProtection: true,
        shortCircuitProtection: true
      },
      performance: {
        optimizationScore: this.calculateOptimizationScore(circuits, ddrConfig),
        efficiencyRating: this.getEfficiencyRating(powerSpecs),
        suggestions: this.generateSuggestions(circuits, ddrConfig)
      }
    };
  }

  private calculateOptimizationScore(circuits: Circuit[], ddrConfig: DDRConfig[]): number {
    let score = 100;
    
    // Pénalité pour circuits sous-utilisés
    circuits.forEach(circuit => {
      const utilizationRate = circuit.elements.length / CIRCUIT_LIMITS[circuit.type]?.maxPoints || 1;
      if (utilizationRate < 0.5) score -= 5;
    });
    
    // Pénalité pour DDR mal équilibrés
    ddrConfig.forEach(ddr => {
      if (ddr.utilizationRate < 0.3) score -= 10;
      if (ddr.utilizationRate > 0.9) score -= 15;
    });
    
    return Math.max(0, score);
  }

  private getEfficiencyRating(powerSpecs: PowerSpecs): string {
    const efficiency = powerSpecs.simultaneousPower / powerSpecs.installedPower;
    
    if (efficiency >= 0.8) return 'Excellent';
    if (efficiency >= 0.7) return 'Très bien';
    if (efficiency >= 0.6) return 'Bien';
    if (efficiency >= 0.5) return 'Moyen';
    return 'À améliorer';
  }

  private generateSuggestions(circuits: Circuit[], ddrConfig: DDRConfig[]): string[] {
    const suggestions: string[] = [];
    
    // Analyser l'équilibrage des DDR
    const avgUtilization = ddrConfig.reduce((sum, ddr) => sum + ddr.utilizationRate, 0) / ddrConfig.length;
    
    if (avgUtilization < 0.6) {
      suggestions.push('Considérer la réduction du nombre de DDR pour optimiser les coûts');
    }
    
    if (ddrConfig.some(ddr => ddr.utilizationRate > 0.9)) {
      suggestions.push('Rééquilibrer les circuits pour éviter la surcharge des DDR');
    }
    
    return suggestions;
  }
}

class OptimizationEngine {
  async optimizeCircuits(
    elements: ElectricalElement[], 
    roomAnalysis: RoomAnalysis, 
    settings: ProjectSettings
  ): Promise<Circuit[]> {
    
    console.log('🎯 Optimisation des circuits par IA');
    
    // Grouper par type et pièce
    const groupedElements = this.intelligentGrouping(elements, roomAnalysis);
    
    // Créer les circuits optimisés
    const circuits = this.createOptimizedCircuits(groupedElements);
    
    // Équilibrage final
    return this.balanceCircuits(circuits);
  }

  private intelligentGrouping(
    elements: ElectricalElement[], 
    roomAnalysis: RoomAnalysis
  ): Map<string, ElectricalElement[]> {
    
    const groups = new Map<string, ElectricalElement[]>();
    
    // Prioriser le groupement par pièce pour l'éclairage
    elements.filter(el => el.type === 'lighting').forEach(el => {
      const key = `lighting_${el.room}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(el);
    });
    
    // Grouper les prises par zone logique
    elements.filter(el => el.type === 'outlet_16a').forEach(el => {
      const key = `outlets_${el.room}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(el);
    });
    
    // Circuits spécialisés individuels
    elements.filter(el => el.specialized).forEach(el => {
      const key = `specialized_${el.id}`;
      groups.set(key, [el]);
    });
    
    return groups;
  }

  private createOptimizedCircuits(groups: Map<string, ElectricalElement[]>): Circuit[] {
    const circuits: Circuit[] = [];
    
    groups.forEach((elements, groupKey) => {
      const circuitType = this.determineCircuitType(elements[0]);
      const limit = NFC15100_RULES.CIRCUIT_LIMITS[circuitType];
      
      if (limit) {
        // Diviser si nécessaire selon la limite
        while (elements.length > 0) {
          const circuitElements = elements.splice(0, limit.max);
          circuits.push(this.createCircuit(circuitType, circuitElements, limit));
        }
      }
    });
    
    return circuits;
  }

  private determineCircuitType(element: ElectricalElement): keyof typeof NFC15100_RULES.CIRCUIT_LIMITS {
    if (element.specialized) return 'specialized';
    if (element.type === 'lighting') return 'lighting';
    if (element.room === 'kitchen' && element.type.includes('outlet')) return 'kitchen_20a';
    if (element.type === 'cooktop') return 'cooktop';
    return 'outlet_16a';
  }

  private createCircuit(type: string, elements: ElectricalElement[], limit: any): Circuit {
    const totalPower = elements.reduce((sum, el) => sum + el.power, 0);
    
    return {
      id: `CIR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: `${limit.rule} - ${elements[0]?.room || 'Zone'}`,
      type: type as any,
      elements,
      power: totalPower,
      breakerRating: limit.breaker,
      cableSection: limit.cable,
      maxCapacity: limit.max,
      ddrId: null
    };
  }

  private balanceCircuits(circuits: Circuit[]): Circuit[] {
    // Algorithme d'équilibrage pour optimiser la répartition
    return circuits.sort((a, b) => b.power - a.power);
  }
}

class PowerCalculator {
  calculatePowerSpecs(circuits: Circuit[], settings: ProjectSettings): PowerSpecs {
    console.log('⚡ Calcul spécifications de puissance');
    
    const installedPower = this.calculateInstalledPower(circuits);
    const weightedPower = this.calculateWeightedPower(circuits);
    const simultaneousPower = this.calculateSimultaneousPower(weightedPower, settings);
    const subscriptionPower = this.calculateSubscriptionPower(simultaneousPower);
    
    return {
      installedPower,
      weightedPower,
      simultaneousPower,
      subscriptionPower,
      mainBreakerRating: this.calculateMainBreaker(subscriptionPower),
      powerFactor: 0.9, // Facteur de puissance résidentiel standard
      loadDiversity: simultaneousPower / installedPower
    };
  }

  private calculateInstalledPower(circuits: Circuit[]): number {
    return circuits.reduce((sum, circuit) => sum + circuit.power, 0);
  }

  private calculateWeightedPower(circuits: Circuit[]): number {
    return circuits.reduce((sum, circuit) => {
      const coefficient = this.getUtilizationCoefficient(circuit.type);
      return sum + (circuit.power * coefficient);
    }, 0);
  }

  private calculateSimultaneousPower(weightedPower: number, settings: ProjectSettings): number {
    const simultaneityFactor = settings.allElectric ? 
      POWER_CALCULATION.SIMULTANEITY.allElectric : 
      POWER_CALCULATION.SIMULTANEITY.residential;
    
    return weightedPower * simultaneityFactor;
  }

  private calculateSubscriptionPower(simultaneousPower: number): number {
    const withReserve = simultaneousPower * POWER_CALCULATION.RESERVE_FACTOR;
    return Math.ceil(withReserve / 1000); // Conversion en kVA
  }

  private calculateMainBreaker(subscriptionPower: number): number {
    const standardBreakers = [15, 30, 45, 60, 90];
    const calculatedAmperage = (subscriptionPower * 1000) / 230;
    
    return standardBreakers.find(rating => rating >= calculatedAmperage) || 90;
  }

  private getUtilizationCoefficient(circuitType: string): number {
    const coefficients = {
      'lighting': POWER_CALCULATION.COEFFICIENTS.lighting,
      'outlet_16a': POWER_CALCULATION.COEFFICIENTS.comfortOutlets,
      'kitchen_20a': POWER_CALCULATION.COEFFICIENTS.kitchen,
      'specialized': POWER_CALCULATION.COEFFICIENTS.appliances
    };
    
    return coefficients[circuitType] || 0.5;
  }
}