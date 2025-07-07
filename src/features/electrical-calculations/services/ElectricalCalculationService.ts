/**
 * Service de calculs électriques - Conforme NF C 15-100
 */

import { BaseService } from '../../../shared/services/BaseService';
import { 
  ElectricalElement, 
  Circuit, 
  ElectricalCalculations, 
  ComplianceResult 
} from '../../../core/types';
import { 
  CIRCUIT_LIMITS, 
  UTILIZATION_COEFFICIENTS, 
  SIMULTANEITY_FACTORS 
} from '../../../core/constants';
import { ICalculationService } from '../../../core/interfaces';

export class ElectricalCalculationService extends BaseService implements ICalculationService {
  private static instance: ElectricalCalculationService;

  private constructor() {
    super('ElectricalCalculationService');
  }

  static getInstance(): ElectricalCalculationService {
    if (!ElectricalCalculationService.instance) {
      ElectricalCalculationService.instance = new ElectricalCalculationService();
    }
    return ElectricalCalculationService.instance;
  }

  async initialize(): Promise<void> {
    this.log('Initializing electrical calculation service');
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up electrical calculation service');
    this.isInitialized = false;
  }

  async calculateCircuits(elements: ElectricalElement[]): Promise<Circuit[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    this.log(`Calculating circuits for ${elements.length} elements`);

    try {
      const circuits: Circuit[] = [];
      
      // Grouper les éléments par type
      const groupedElements = this.groupElementsByType(elements);

      // Créer les circuits pour chaque type
      for (const [type, typeElements] of Object.entries(groupedElements)) {
        const typeCircuits = this.createCircuitsForType(type, typeElements);
        circuits.push(...typeCircuits);
      }

      // Valider chaque circuit
      for (const circuit of circuits) {
        circuit.calculations = this.calculateCircuitPower(circuit);
      }

      this.log(`Generated ${circuits.length} circuits`);
      return circuits;

    } catch (error) {
      throw this.handleError(error, 'calculateCircuits');
    }
  }

  async validateCompliance(circuits: Circuit[]): Promise<boolean> {
    const compliance = await this.checkCompliance(circuits);
    return compliance.isCompliant;
  }

  async optimizeCircuits(circuits: Circuit[]): Promise<Circuit[]> {
    // TODO: Implémentation de l'optimisation
    this.log('Circuit optimization not yet implemented');
    return circuits;
  }

  calculatePower(elements: ElectricalElement[]): number {
    return elements.reduce((total, element) => total + element.power, 0);
  }

  private groupElementsByType(elements: ElectricalElement[]): Record<string, ElectricalElement[]> {
    return elements.reduce((groups, element) => {
      const type = this.getCircuitType(element.type);
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(element);
      return groups;
    }, {} as Record<string, ElectricalElement[]>);
  }

  private getCircuitType(elementType: string): string {
    if (elementType.includes('light') || elementType.includes('dcl')) {
      return 'lighting';
    } else if (elementType.includes('outlet') || elementType.includes('prise')) {
      if (elementType.includes('20a') || elementType.includes('cuisine')) {
        return 'outlet_20a';
      }
      return 'outlet_16a';
    } else if (elementType.includes('chauffage') || elementType.includes('heating')) {
      return 'specialized';
    }
    return 'specialized';
  }

  private createCircuitsForType(type: string, elements: ElectricalElement[]): Circuit[] {
    const circuits: Circuit[] = [];
    const limits = this.getCircuitLimits(type);
    
    let currentCircuit: ElectricalElement[] = [];
    let currentPower = 0;

    for (const element of elements) {
      if (currentCircuit.length >= limits.maxPoints || 
          currentPower + element.power > limits.maxPower) {
        
        if (currentCircuit.length > 0) {
          circuits.push(this.createCircuit(type, currentCircuit, circuits.length + 1));
        }
        currentCircuit = [element];
        currentPower = element.power;
      } else {
        currentCircuit.push(element);
        currentPower += element.power;
      }
    }

    if (currentCircuit.length > 0) {
      circuits.push(this.createCircuit(type, currentCircuit, circuits.length + 1));
    }

    return circuits;
  }

  private getCircuitLimits(type: string) {
    switch (type) {
      case 'lighting':
        return CIRCUIT_LIMITS.LIGHTING;
      case 'outlet_16a':
        return CIRCUIT_LIMITS.OUTLET_16A;
      case 'outlet_20a':
        return CIRCUIT_LIMITS.OUTLET_20A;
      default:
        return CIRCUIT_LIMITS.SPECIALIZED;
    }
  }

  private createCircuit(type: string, elements: ElectricalElement[], number: number): Circuit {
    const limits = this.getCircuitLimits(type);
    
    return {
      id: `circuit-${type}-${number}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${number}`,
      type: type as any,
      elements,
      protection: {
        breaker: limits.BREAKER_SIZE,
        differential: 30, // 30mA par défaut
        cableSection: limits.CABLE_SECTION
      },
      calculations: {
        totalPower: 0,
        current: 0,
        voltageDrop: 0,
        isCompliant: false
      }
    };
  }

  private calculateCircuitPower(circuit: Circuit): Circuit['calculations'] {
    const totalPower = circuit.elements.reduce((sum, el) => sum + el.power, 0);
    const current = totalPower / 230; // P = U × I
    const voltageDrop = this.calculateVoltageDrop(current, circuit.protection.cableSection);
    
    return {
      totalPower,
      current,
      voltageDrop,
      isCompliant: this.isCircuitCompliant(circuit, totalPower, current)
    };
  }

  private calculateVoltageDrop(current: number, section: number): number {
    // Calcul simplifié de la chute de tension
    const resistance = 0.0225 / section; // Résistivité cuivre
    const length = 20; // Longueur moyenne estimée
    return (resistance * length * current * 2) / 230 * 100; // En %
  }

  private isCircuitCompliant(circuit: Circuit, power: number, current: number): boolean {
    const limits = this.getCircuitLimits(circuit.type);
    return (
      circuit.elements.length <= limits.maxPoints &&
      power <= limits.maxPower &&
      current <= limits.BREAKER_SIZE
    );
  }

  private async checkCompliance(circuits: Circuit[]): Promise<ComplianceResult> {
    const violations: ComplianceResult['violations'] = [];
    const recommendations: string[] = [];

    for (const circuit of circuits) {
      if (!circuit.calculations.isCompliant) {
        violations.push({
          code: 'NFC15100-001',
          severity: 'error',
          message: `Circuit ${circuit.name} non conforme`,
          circuit: circuit.id
        });
      }

      if (circuit.calculations.voltageDrop > 3) {
        violations.push({
          code: 'NFC15100-002',
          severity: 'warning',
          message: `Chute de tension élevée: ${circuit.calculations.voltageDrop.toFixed(1)}%`,
          circuit: circuit.id
        });
      }
    }

    if (violations.length === 0) {
      recommendations.push('Installation conforme NF C 15-100');
    }

    return {
      isCompliant: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      recommendations
    };
  }
}