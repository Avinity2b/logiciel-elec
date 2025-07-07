/**
 * Types TypeScript avancés pour le système électrique professionnel
 * Conformes NF C 15-100 avec intégration complète ElectriCAD AI
 * @version 2.0.0
 * @file src/types/electrical-advanced.ts
 */

// ===== TYPES ÉLÉMENTS ÉLECTRIQUES =====

export interface ElectricalElement {
  id: string;
  type: ElectricalElementType;
  name: string;
  x: number;
  y: number;
  room: string;
  power: number;
  voltage: number;
  phase: 1 | 2 | 3;
  specialized: boolean;
  
  // Propriétés avancées NF C 15-100
  priority: ElementPriority;
  category: ElementCategory;
  normativeReference: string;
  installationConstraints: InstallationConstraints;
  
  // Métadonnées de calcul
  calculatedAmperage?: number;
  utilizationCoefficient?: number;
  simultaneityFactor?: number;
  protectionType?: ProtectionType;
  
  // Propriétés existantes (compatibilité)
  symbol?: string;
  description?: string;
  brand?: string;
  reference?: string;
  price?: number;
  width?: number;
  height?: number;
  rotation?: number;
  selected?: boolean;
  connections?: Connection[];
}

export type ElectricalElementType = 
  // Éclairage
  | 'lighting' | 'dcl' | 'spot' | 'applique' | 'projecteur' | 'reglette'
  | 'eclairage_secours' | 'detecteur_presence'
  
  // Prises et alimentations
  | 'outlet_16a' | 'outlet_20a' | 'outlet_32a' | 'outlet_green'
  | 'kitchen_outlet' | 'specialized_outlet' | 'outlet_rj45' | 'outlet_tv'
  
  // Commandes
  | 'switch' | 'dimmer' | 'va_et_vient' | 'bouton_poussoir'
  | 'telerupteur' | 'minuterie' | 'detecteur_mouvement'
  
  // Électroménager et spécialisés
  | 'cooktop' | 'oven' | 'washing_machine' | 'dishwasher' | 'dryer'
  | 'water_heater' | 'heating' | 'air_conditioning' | 'heat_pump'
  | 'electric_vehicle_charger' | 'pool_equipment'
  
  // Sécurité et communication
  | 'smoke_detector' | 'alarm_system' | 'intercom' | 'doorbell'
  | 'cctv_camera' | 'access_control'
  
  // Distribution
  | 'panel_board' | 'sub_panel' | 'junction_box' | 'cable_outlet';

export type ElementCategory = 
  | 'lighting' | 'power' | 'control' | 'appliance' 
  | 'safety' | 'communication' | 'distribution' | 'hvac';

export type ElementPriority = 
  | 'critical' | 'high' | 'medium' | 'low' | 'optional';

export type ProtectionType = 
  | 'standard' | 'differential' | 'specialized' | 'motor' | 'lighting';

export interface InstallationConstraints {
  minHeight: number;
  maxHeight: number;
  requiresEarth: boolean;
  requiresNeutral: boolean;
  requiresPhase: number;
  ipRating: string;
  ambientTemperature: { min: number; max: number };
  specialRequirements: string[];
}

// ===== TYPES CIRCUITS AVANCÉS =====

export interface Circuit {
  id: string;
  name: string;
  type: CircuitType;
  elements: ElectricalElement[];
  power: number;
  calculatedPower: number;
  breakerRating: number;
  cableSection: number;
  cableType: CableType;
  maxCapacity: number;
  ddrId: string | null;
  
  // Propriétés avancées
  protectionCurve: ProtectionCurve;
  earthingSystem: EarthingSystem;
  installationMethod: InstallationMethod;
  cableLength: number;
  voltageDrop: number;
  shortCircuitCurrent: number;
  
  // Conformité NF C 15-100
  nfc15100Compliance: CircuitCompliance;
  calculationMethod: CalculationMethod;
  loadType: LoadType;
  utilizationFactor: number;
  diversityFactor: number;
  
  // Localisation et distribution
  panelLocation: string;
  distributionLevel: number;
  emergencyCircuit: boolean;
  criticalLoad: boolean;
}

export type CircuitType = 
  | 'lighting' | 'outlet_16a' | 'kitchen_20a' | 'specialized' 
  | 'cooktop' | 'high_power' | 'heating' | 'motor' | 'emergency';

export type CableType = 
  | 'H07V-U' | 'H07V-R' | 'H07V-K' | 'H05VV-F' | 'A05VV-F'
  | 'U1000R2V' | 'FR-N05VV-U' | 'C2V' | 'U1000RVFV';

export type ProtectionCurve = 'B' | 'C' | 'D' | 'K' | 'Z';

export type EarthingSystem = 'TT' | 'TN-S' | 'TN-C' | 'TN-C-S' | 'IT';

export type InstallationMethod = 
  | 'embedded' | 'surface' | 'conduit' | 'cable_tray' | 'underground';

export type LoadType = 
  | 'resistive' | 'inductive' | 'capacitive' | 'mixed' | 'motor' | 'lighting_led';

export type CalculationMethod = 
  | 'nfc15100_standard' | 'ute_guide' | 'manufacturer_data' | 'measured_values';

export interface CircuitCompliance {
  isCompliant: boolean;
  checkedRules: string[];
  violations: ComplianceViolation[];
  recommendations: string[];
  certificationLevel: 'full' | 'partial' | 'non_compliant';
}

// ===== TYPES DDR ET PROTECTIONS =====

export interface DDRConfig {
  id: string;
  type: DDRType;
  rating: number;
  sensitivity: DDRSensitivity;
  circuits: Circuit[];
  calculatedLoad: number;
  utilizationRate: number;
  isCompliant: boolean;
  
  // Propriétés avancées
  breakingCapacity: number;
  selectionCriteria: DDRSelectionCriteria;
  installationPosition: number;
  auxiliaryContacts: boolean;
  residualCurrentType: ResidualCurrentType;
  
  // Coordination et sélectivité
  upstreamProtection?: string;
  downstreamProtections: string[];
  selectivityLevel: SelectivityLevel;
  backupProtection?: string;
}

export type DDRType = 'AC' | 'A' | 'F' | 'B' | 'B+';

export type DDRSensitivity = 10 | 30 | 100 | 300 | 500 | 1000; // mA

export type ResidualCurrentType = 
  | 'sinusoidal' | 'pulsed_dc' | 'smooth_dc' | 'high_frequency';

export type SelectivityLevel = 'none' | 'partial' | 'total' | 'time_delayed';

export interface DDRSelectionCriteria {
  leakageCurrentSum: number;
  environmentalConditions: EnvironmentalConditions;
  loadCharacteristics: LoadCharacteristics;
  installationConstraints: DDRInstallationConstraints;
  normativeRequirements: string[];
}

export interface LoadCharacteristics {
  harmonicContent: number;
  loadVariability: 'stable' | 'variable' | 'fluctuating';
  startingCurrent: number;
  powerFactor: number;
  frequencyRange: { min: number; max: number };
}

export interface DDRInstallationConstraints {
  ambientTemperature: number;
  altitude: number;
  vibrationLevel: 'low' | 'medium' | 'high';
  pollutionDegree: 1 | 2 | 3 | 4;
  overvoltageCategory: 'I' | 'II' | 'III' | 'IV';
}

// ===== TYPES TABLEAU ÉLECTRIQUE =====

export interface TableauResult {
  id: string;
  name: string;
  type: TableauType;
  circuits: Circuit[];
  ddrConfig: DDRConfig[];
  physicalDimensions: PhysicalDimensions;
  powerSpecs: PowerSpecifications;
  compliance: ComplianceReport;
  materialList: MaterialItem[];
  
  // Calculs de puissance
  totalPower: number;
  subscriptionPower: number;
  mainBreaker: number;
  calculations: PowerCalculations;
  
  // Propriétés avancées
  installationContext: InstallationContext;
  designParameters: DesignParameters;
  validationResults: ValidationResults;
  optimizationReport: OptimizationReport;
}

export type TableauType = 
  | 'main_panel' | 'sub_panel' | 'distribution_board' 
  | 'motor_control_center' | 'lighting_panel' | 'emergency_panel';

export interface PhysicalDimensions {
  rows: number;
  modulesPerRow: number;
  totalModules: number;
  usedModules: number;
  reserveModules: number;
  reservePercentage: number;
  enclosureType: EnclosureType;
  dimensions: Dimensions3D;
  weight: number;
  ipRating: string;
  materialType: string;
}

export interface PowerSpecifications {
  installedPower: number;
  demandPower: number;
  weightedPower: number;
  simultaneousPower: number;
  subscriptionPower: number;
  mainBreakerRating: number;
  
  // Facteurs de calcul
  utilizationFactor: number;
  diversityFactor: number;
  simultaneityFactor: number;
  reserveFactor: number;
  powerFactor: number;
  
  // Caractéristiques réseau
  nominalVoltage: number;
  frequency: number;
  earthingSystem: EarthingSystem;
  shortCircuitPower: number;
}

export interface PowerCalculations {
  method: CalculationMethod;
  assumptions: CalculationAssumptions;
  intermediateResults: IntermediateResults;
  validationChecks: ValidationCheck[];
  uncertaintyAnalysis: UncertaintyAnalysis;
}

export interface CalculationAssumptions {
  climateZone: string;
  buildingType: string;
  occupancyType: string;
  operatingSchedule: OperatingSchedule;
  loadGrowthFactor: number;
  safetyMargin: number;
}

export interface OperatingSchedule {
  dailyProfile: LoadProfile[];
  weeklyVariation: number;
  seasonalVariation: number;
  specialEvents: SpecialEvent[];
}

export interface LoadProfile {
  hour: number;
  loadFactor: number;
  activeLoads: string[];
}

export interface SpecialEvent {
  name: string;
  frequency: string;
  duration: number;
  additionalLoad: number;
}

// ===== TYPES CONFORMITÉ ET VALIDATION =====

export interface ComplianceReport {
  nfc15100: NFC15100Compliance;
  safety: SafetyCompliance;
  performance: PerformanceAnalysis;
  environmental: EnvironmentalCompliance;
  documentation: DocumentationStatus;
}

export interface NFC15100Compliance {
  isCompliant: boolean;
  version: string;
  checkedRules: CheckedRule[];
  violations: ComplianceViolation[];
  recommendations: Recommendation[];
  certificationLevel: CertificationLevel;
}

export interface CheckedRule {
  ruleId: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable';
  evidence: string[];
  comments: string;
}

export interface ComplianceViolation {
  id: string;
  rule: string;
  severity: ViolationSeverity;
  description: string;
  element?: string;
  location?: string;
  solution: string;
  priority: number;
  estimatedCost?: number;
}

export type ViolationSeverity = 'critical' | 'major' | 'minor' | 'observation';

export type CertificationLevel = 'full' | 'conditional' | 'partial' | 'non_compliant';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  description: string;
  benefit: string;
  implementation: ImplementationDetails;
  priority: number;
}

export type RecommendationCategory = 
  | 'safety' | 'performance' | 'cost' | 'maintenance' | 'future_proof';

export interface ImplementationDetails {
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  estimatedCost: number;
  requiredSkills: string[];
  dependencies: string[];
}

// ===== TYPES MATÉRIEL ET ÉQUIPEMENT =====

export interface MaterialItem {
  id: string;
  category: MaterialCategory;
  name: string;
  description: string;
  brand: string;
  reference: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  
  // Propriétés techniques
  technicalSpecs: TechnicalSpecifications;
  certifications: Certification[];
  installationRequirements: InstallationRequirements;
  maintenanceSchedule: MaintenanceSchedule;
  
  // Gestion stocks et approvisionnement
  availability: AvailabilityStatus;
  leadTime: number;
  alternativeReferences: string[];
  obsolescenceStatus: ObsolescenceStatus;
}

export type MaterialCategory = 
  | 'protection' | 'distribution' | 'wiring' | 'equipment' 
  | 'enclosure' | 'accessory' | 'safety' | 'measurement';

export interface TechnicalSpecifications {
  nominalValues: Record<string, number | string>;
  operatingConditions: OperatingConditions;
  mechanicalProperties: MechanicalProperties;
  electricalProperties: ElectricalProperties;
  environmentalProperties: EnvironmentalProperties;
}

export interface OperatingConditions {
  temperatureRange: TemperatureRange;
  humidityRange: HumidityRange;
  altitudeLimit: number;
  vibrationResistance: string;
  ipRating: string;
}

export interface Certification {
  standard: string;
  issuingBody: string;
  certificateNumber: string;
  validityDate: Date;
  scope: string;
}

// ===== TYPES PROJET ET CONFIGURATION =====

export interface ProjectSettings {
  id: string;
  name: string;
  description: string;
  
  // Paramètres bâtiment
  buildingType: BuildingType;
  surface: number;
  roomCount: number;
  floorCount: number;
  occupancyType: OccupancyType;
  
  // Paramètres électriques
  powerSupplyType: PowerSupplyType;
  nominalVoltage: number;
  frequency: number;
  earthingSystem: EarthingSystem;
  powerSubscription: number;
  
  // Paramètres calcul
  calculationMethod: CalculationMethod;
  safetyFactors: SafetyFactors;
  optimizationCriteria: OptimizationCriteria;
  
  // Contraintes et préférences
  installationConstraints: InstallationConstraints;
  equipmentPreferences: EquipmentPreferences;
  budgetConstraints: BudgetConstraints;
  
  // Localisation et climat
  location: LocationInfo;
  climateData: ClimateData;
  
  // Conformité
  applicableStandards: string[];
  certificationRequirements: CertificationRequirement[];
  inspectionSchedule: InspectionSchedule;
}

export type BuildingType = 
  | 'residential' | 'commercial' | 'industrial' | 'healthcare' 
  | 'educational' | 'hospitality' | 'retail' | 'mixed_use';

export type OccupancyType = 
  | 'single_family' | 'multi_family' | 'office' | 'retail' 
  | 'warehouse' | 'manufacturing' | 'laboratory' | 'data_center';

export type PowerSupplyType = 
  | 'single_phase' | 'three_phase' | 'split_phase' | 'dc_supply';

export interface SafetyFactors {
  generalSafety: number;
  temperatureDerating: number;
  futureExpansion: number;
  harmonicDistortion: number;
  voltageDrop: number;
}

export interface OptimizationCriteria {
  primaryObjective: 'cost' | 'performance' | 'reliability' | 'sustainability';
  weightings: {
    initialCost: number;
    operatingCost: number;
    reliability: number;
    efficiency: number;
    maintainability: number;
  };
  constraints: OptimizationConstraint[];
}

export interface OptimizationConstraint {
  type: string;
  parameter: string;
  value: number;
  tolerance: number;
}

// ===== TYPES UTILITAIRES =====

export interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit' | 'kelvin';
}

export interface HumidityRange {
  min: number;
  max: number;
  unit: 'percentage' | 'absolute';
}

export interface Connection {
  id: string;
  fromElementId: string;
  toElementId: string;
  connectionType: ConnectionType;
  cableType: CableType;
  length: number;
  route: Point[];
}

export type ConnectionType = 
  | 'power' | 'control' | 'data' | 'earth' | 'neutral';

export interface Point {
  x: number;
  y: number;
}

export interface EnvironmentalConditions {
  temperature: number;
  humidity: number;
  altitude: number;
  pollutionLevel: number;
  seismicZone: string;
  windZone: string;
}

export type EnclosureType = 
  | 'surface_mounted' | 'flush_mounted' | 'floor_standing' 
  | 'wall_mounted' | 'pole_mounted' | 'underground';

export type AvailabilityStatus = 
  | 'in_stock' | 'limited_stock' | 'on_order' | 'discontinued' | 'custom_order';

export type ObsolescenceStatus = 
  | 'current' | 'last_time_buy' | 'obsolete' | 'replacement_available';

// ===== INTERFACES COMPLEXES =====

export interface ValidationResults {
  overallScore: number;
  categoryScores: Record<string, number>;
  criticalIssues: ValidationIssue[];
  warnings: ValidationIssue[];
  improvements: ImprovementSuggestion[];
  testResults: TestResult[];
}

export interface ValidationIssue {
  id: string;
  severity: ViolationSeverity;
  category: string;
  description: string;
  affectedElements: string[];
  resolution: ResolutionStep[];
}

export interface ResolutionStep {
  step: number;
  description: string;
  estimatedTime: number;
  requiredTools: string[];
  safetyPrecautions: string[];
}

export interface OptimizationReport {
  originalConfiguration: ConfigurationSnapshot;
  optimizedConfiguration: ConfigurationSnapshot;
  improvements: ImprovementMetric[];
  tradeOffs: TradeOff[];
  alternativeConfigurations: AlternativeConfiguration[];
}

export interface ConfigurationSnapshot {
  timestamp: Date;
  totalCost: number;
  efficiency: number;
  reliability: number;
  compliance: number;
  keyMetrics: Record<string, number>;
}

export interface ImprovementMetric {
  metric: string;
  originalValue: number;
  improvedValue: number;
  improvement: number;
  unit: string;
}

export interface TradeOff {
  description: string;
  gains: Gain[];
  losses: Loss[];
  netBenefit: number;
}

export interface Gain {
  aspect: string;
  value: number;
  unit: string;
}

export interface Loss {
  aspect: string;
  value: number;
  unit: string;
}

// ===== TYPES POUR L'INTERFACE UTILISATEUR =====

export interface CalculationProgress {
  phase: CalculationPhase;
  progress: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  completedOperations: string[];
  errors: CalculationError[];
}

export type CalculationPhase = 
  | 'initialization' | 'analysis' | 'optimization' | 'validation' 
  | 'documentation' | 'completed' | 'error';

export interface CalculationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context: Record<string, any>;
  suggestedAction: string;
}

// ===== EXPORT DES TYPES PRINCIPAUX =====

export type {
  // Types principaux
  ElectricalElement,
  Circuit,
  DDRConfig,
  TableauResult,
  ProjectSettings,
  
  // Types de conformité
  ComplianceReport,
  ComplianceViolation,
  
  // Types de matériel
  MaterialItem,
  
  // Types utilitaires
  Connection,
  Point,
  Dimensions3D
};

// ===== CONSTANTES ET ENUMS =====

export const ELECTRICAL_CONSTANTS = {
  STANDARD_VOLTAGES: [12, 24, 48, 110, 230, 400, 690, 1000] as const,
  STANDARD_FREQUENCIES: [50, 60] as const,
  STANDARD_BREAKER_RATINGS: [6, 10, 16, 20, 25, 32, 40, 50, 63] as const,
  STANDARD_CABLE_SECTIONS: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50] as const,
  DDR_SENSITIVITIES: [10, 30, 100, 300, 500, 1000] as const,
  IP_RATINGS: ['IP20', 'IP21', 'IP23', 'IP44', 'IP54', 'IP65', 'IP67'] as const
} as const;

export const NFC15100_CONSTANTS = {
  CIRCUIT_LIMITS: {
    LIGHTING_MAX_POINTS: 8,
    OUTLET_16A_MAX_COUNT: 8,
    KITCHEN_20A_MAX_COUNT: 12,
    DDR_MAX_CIRCUITS: 8,
    MIN_RESERVE_PERCENTAGE: 20
  },
  PROTECTION_REQUIREMENTS: {
    DDR_SENSITIVITY_GENERAL: 30, // mA
    DDR_SENSITIVITY_BATHROOM: 30, // mA
    DDR_SENSITIVITY_OUTDOOR: 30, // mA
    MAIN_BREAKER_MIN_RATING: 15 // A
  }
} as const;