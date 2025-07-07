/**
 * Composant Panneau Électrique Avancé - VERSION CORRIGÉE
 * @file src/components/ElectricalPanelAdvanced.tsx
 * @version 2.0.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calculator, 
  Zap, 
  Shield, 
  Settings, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  BarChart3,
  Gauge,
  AlertTriangle
} from 'lucide-react';

import { 
  TableauResult, 
  Circuit, 
  DDRConfig, 
  ProjectSettings,
  ElectricalElement 
} from '../types/electrical';

// Import des types avancés
import {
  TableauResult as AdvancedTableauResult,
  ProjectSettings as AdvancedProjectSettings,
  ComplianceViolation
} from '../types/electrical-advanced';

import { 
  AdvancedTableauCalculator 
} from '../utils/tableau-calculator';

import { 
  generateSchematic,
  generateComplianceReport 
} from '../utils/schematicGenerator';

// ===== INTERFACES =====

export interface ElectricalPanelAdvancedProps {
  elements: ElectricalElement[];
  settings: ProjectSettings;
  onCalculationComplete?: (result: TableauResult) => void;
  onSettingsChange?: (settings: ProjectSettings) => void;
  className?: string;
}

export interface ElectricalPanelAdvancedRef {
  calculate: () => Promise<void>;
  exportSchematic: () => Promise<void>;
  exportCompliance: () => Promise<void>;
  getResult: () => TableauResult | null;
}

interface CalculationState {
  isCalculating: boolean;
  progress: number;
  currentPhase: string;
  result: TableauResult | null;
  error: string | null;
  lastCalculated: Date | null;
}

interface TabState {
  activeTab: 'overview' | 'circuits' | 'ddr' | 'compliance' | 'material' | 'calculations';
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
}

// ===== COMPOSANT PRINCIPAL =====

export const ElectricalPanelAdvanced: React.FC<ElectricalPanelAdvancedProps> = ({
  elements,
  settings,
  onCalculationComplete,
  onSettingsChange,
  className = ''
}) => {
  // États du composant
  const [calculationState, setCalculationState] = useState<CalculationState>({
    isCalculating: false,
    progress: 0,
    currentPhase: '',
    result: null,
    error: null,
    lastCalculated: null
  });

  const [tabState, setTabState] = useState<TabState>({
    activeTab: 'overview'
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Calculateur avancé
  const calculator = useMemo(() => new AdvancedTableauCalculator(), []);

  // Métriques calculées
  const metrics = useMemo(() => {
    if (!calculationState.result) return null;

    const result = calculationState.result;
    return {
      efficiency: result.powerSpecs ? 
        (result.powerSpecs.simultaneousPower / result.powerSpecs.installedPower * 100).toFixed(1) : 
        '75.0',
      utilizationRate: result.physicalDimensions ? 
        (result.physicalDimensions.usedModules / result.physicalDimensions.totalModules * 100).toFixed(1) : 
        '80.0',
      complianceScore: result.compliance.score || 85,
      costEfficiency: result.materialList ? 
        (result.materialList.reduce((sum, item) => sum + item.totalPrice, 0) / result.totalPower * 1000).toFixed(0) : 
        '150'
    };
  }, [calculationState.result]);

  // Fonction de calcul principal
  const handleCalculate = useCallback(async () => {
    if (elements.length === 0) {
      setCalculationState(prev => ({
        ...prev,
        error: 'Aucun élément électrique à calculer'
      }));
      return;
    }

    setCalculationState(prev => ({
      ...prev,
      isCalculating: true,
      progress: 0,
      currentPhase: 'Initialisation...',
      error: null
    }));

    try {
      // Simulation du progrès
      const phases = [
        'Analyse des éléments...',
        'Optimisation des circuits...',
        'Calcul des protections...',
        'Dimensionnement physique...',
        'Validation conformité...',
        'Finalisation...'
      ];

      for (let i = 0; i < phases.length; i++) {
        setCalculationState(prev => ({
          ...prev,
          progress: ((i + 1) / phases.length) * 100,
          currentPhase: phases[i]
        }));
        
        // Délai pour simulation
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Conversion des paramètres
      const advancedSettings: AdvancedProjectSettings = {
        ...settings,
        floorCount: 1,
        powerSupplyType: 'single_phase',
        nominalVoltage: 230,
        frequency: 50,
        earthingSystem: 'TT',
        calculationMethod: 'nfc15100_standard',
        safetyFactors: {
          generalSafety: 1.2,
          temperatureDerating: 1.0,
          futureExpansion: 1.1,
          harmonicDistortion: 1.0,
          voltageDrop: 1.0
        },
        optimizationCriteria: {
          primaryObjective: 'cost',
          weightings: {
            initialCost: 0.4,
            operatingCost: 0.2,
            reliability: 0.2,
            efficiency: 0.1,
            maintainability: 0.1
          },
          constraints: []
        },
        installationConstraints: {
          minHeight: 1000,
          maxHeight: 1800,
          requiresEarth: true,
          requiresNeutral: true,
          requiresPhase: 1,
          ipRating: 'IP30',
          ambientTemperature: { min: -5, max: 40 },
          specialRequirements: []
        },
        equipmentPreferences: {
          preferredBrands: ['Schneider', 'Legrand'],
          qualityLevel: 'standard',
          warrantyRequirements: '2 years',
          maintenanceRequirements: 'standard'
        },
        budgetConstraints: {
          maxBudget: 5000,
          targetBudget: 3000,
          allowableOverrun: 0.1,
          costOptimizationLevel: 'moderate'
        },
        location: settings.location || {
          country: 'France',
          region: 'Ile-de-France',
          city: 'Paris',
          coordinates: { latitude: 48.8566, longitude: 2.3522 },
          timezone: 'Europe/Paris',
          electricalZone: 'Zone 1'
        },
        climateData: {
          averageTemperature: 12,
          temperatureRange: { min: -5, max: 35 },
          humidity: { average: 70, range: { min: 40, max: 90 } },
          seasonalVariations: {
            'summer': { temperature: 25, humidity: 60 },
            'winter': { temperature: 5, humidity: 80 }
          }
        },
        applicableStandards: ['NF C 15-100:2015'],
        certificationRequirements: [],
        inspectionSchedule: {
          plannedInspections: [],
          criticalMilestones: []
        }
      };

      // Calcul réel
      const advancedResult = await calculator.calculateTableau(elements, advancedSettings);

      // Conversion pour compatibilité
      const result: TableauResult = {
        circuits: advancedResult.circuits,
        ddrConfig: advancedResult.ddrConfig,
        totalPower: advancedResult.totalPower,
        subscriptionPower: advancedResult.subscriptionPower,
        mainBreaker: advancedResult.mainBreaker,
        materialList: advancedResult.materialList,
        compliance: {
          isCompliant: advancedResult.compliance.nfc15100.isCompliant,
          errors: advancedResult.compliance.nfc15100.violations
            .filter(v => v.severity === 'critical' || v.severity === 'major')
            .map(v => v.description),
          warnings: advancedResult.compliance.nfc15100.violations
            .filter(v => v.severity === 'minor')
            .map(v => v.description),
          score: advancedResult.compliance.performance.optimizationScore
        },
        // Propriétés étendues
        id: advancedResult.id,
        name: advancedResult.name,
        type: advancedResult.type,
        physicalDimensions: advancedResult.physicalDimensions,
        powerSpecs: advancedResult.powerSpecs,
        calculations: advancedResult.calculations
      };

      setCalculationState(prev => ({
        ...prev,
        isCalculating: false,
        progress: 100,
        currentPhase: 'Terminé',
        result,
        lastCalculated: new Date()
      }));

      // Callback
      onCalculationComplete?.(result);

    } catch (error: any) {
      console.error('Erreur calcul tableau:', error);
      setCalculationState(prev => ({
        ...prev,
        isCalculating: false,
        error: error.message || 'Erreur lors du calcul'
      }));
    }
  }, [elements, settings, calculator, onCalculationComplete]);

  // Export des documents
  const handleExportSchematic = useCallback(async () => {
    if (!calculationState.result) return;

    try {
      if ('physicalDimensions' in calculationState.result) {
        await generateSchematic(
          calculationState.result as AdvancedTableauResult,
          settings as AdvancedProjectSettings,
          elements,
          {
            format: 'A4',
            orientation: 'portrait',
            showMaterialList: true,
            showCalculations: true,
            showCompliance: true
          }
        );
      }
    } catch (error: any) {
      console.error('Erreur export schéma:', error);
    }
  }, [calculationState.result, settings, elements]);

  const handleExportCompliance = useCallback(async () => {
    if (!calculationState.result) return;

    try {
      await generateComplianceReport(
        {
          compliance: {
            isCompliant: calculationState.result.compliance.isCompliant,
            score: metrics?.complianceScore,
            errors: calculationState.result.compliance.errors,
            warnings: calculationState.result.compliance.warnings
          }
        },
        settings.name || 'Installation'
      );
    } catch (error: any) {
      console.error('Erreur export conformité:', error);
    }
  }, [calculationState.result, metrics, settings.name]);

  // Calcul automatique au changement d'éléments
  useEffect(() => {
    if (elements.length > 0) {
      const timer = setTimeout(() => {
        handleCalculate();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [elements, settings, handleCalculate]);

  // ===== COMPOSANTS AUXILIAIRES =====

  const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, status }) => {
    const statusColors = {
      good: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      error: 'text-red-600 bg-red-50'
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${statusColors[status]}`}>
            {icon}
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  // Onglet Vue d'ensemble
  const OverviewTab: React.FC<{ result: TableauResult }> = ({ result }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bilan de puissance */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Bilan de Puissance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Puissance installée:</span>
              <span className="font-medium">{result.powerSpecs?.installedPower.toFixed(0) || result.totalPower.toFixed(0)} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Puissance simultanée:</span>
              <span className="font-medium">{result.powerSpecs?.simultaneousPower.toFixed(0) || (result.totalPower * 0.7).toFixed(0)} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Puissance souscrite:</span>
              <span className="font-medium text-blue-600">{result.subscriptionPower} kVA</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Disjoncteur général:</span>
              <span className="font-medium">{result.mainBreaker}A</span>
            </div>
          </div>
        </div>

        {/* Dimensionnement physique */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Dimensionnement Physique
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Modules utilisés:</span>
              <span className="font-medium">{result.physicalDimensions?.usedModules || 30}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Modules de réserve:</span>
              <span className="font-medium">{result.physicalDimensions?.reserveModules || 8} ({result.physicalDimensions?.reservePercentage || 25}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total modules:</span>
              <span className="font-medium">{result.physicalDimensions?.totalModules || 38}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Nombre de rangées:</span>
              <span className="font-medium">{result.physicalDimensions?.rows || 3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé des circuits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Résumé des Circuits ({result.circuits.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(
            result.circuits.reduce((acc, circuit) => {
              acc[circuit.type] = (acc[circuit.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500 capitalize">{type.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ===== RENDU PRINCIPAL =====

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* En-tête */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tableau Électrique Professionnel
              </h2>
              <p className="text-sm text-gray-500">
                Calculs conformes NF C 15-100 • {elements.length} éléments
                {calculationState.lastCalculated && (
                  <span className="ml-2">
                    • Dernière analyse: {calculationState.lastCalculated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Boutons d'action */}
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Paramètres avancés"
            >
              <Settings className="h-5 w-5" />
            </button>

            <button
              onClick={handleCalculate}
              disabled={calculationState.isCalculating || elements.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {calculationState.isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Calcul...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Calculer</span>
                </>
              )}
            </button>

            {calculationState.result && (
              <div className="flex space-x-2">
                <button
                  onClick={handleExportSchematic}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Exporter schéma unifilaire"
                >
                  <FileText className="h-5 w-5" />
                </button>
                <button
                  onClick={handleExportCompliance}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Exporter rapport de conformité"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {calculationState.isCalculating && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{calculationState.currentPhase}</span>
              <span>{calculationState.progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculationState.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Erreur */}
        {calculationState.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{calculationState.error}</span>
          </div>
        )}
      </div>

      {/* Paramètres avancés */}
      {showAdvancedSettings && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de Calcul</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de logement
              </label>
              <select 
                value={settings.buildingType || 'residential'}
                onChange={(e) => onSettingsChange?.({
                  ...settings,
                  buildingType: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="residential">Résidentiel</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industriel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                value={settings.surface || 100}
                onChange={(e) => onSettingsChange?.({
                  ...settings,
                  surface: parseInt(e.target.value) || 100
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Régime de neutre
              </label>
              <select 
                value={settings.earthingSystem || 'TT'}
                onChange={(e) => onSettingsChange?.({
                  ...settings,
                  earthingSystem: e.target.value as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TT">TT (Résidentiel)</option>
                <option value="TN-S">TN-S (Industriel)</option>
                <option value="IT">IT (Médical)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Métriques principales */}
      {calculationState.result && metrics && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Efficacité"
              value={`${metrics.efficiency}%`}
              status={parseFloat(metrics.efficiency) > 70 ? 'good' : 'warning'}
            />
            <MetricCard
              icon={<Gauge className="h-5 w-5" />}
              label="Utilisation tableau"
              value={`${metrics.utilizationRate}%`}
              status={parseFloat(metrics.utilizationRate) < 90 ? 'good' : 'warning'}
            />
            <MetricCard
              icon={<Shield className="h-5 w-5" />}
              label="Conformité"
              value={`${metrics.complianceScore}/100`}
              status={metrics.complianceScore === 100 ? 'good' : 'error'}
            />
            <MetricCard
              icon={<BarChart3 className="h-5 w-5" />}
              label="Coût/kW"
              value={`${metrics.costEfficiency}€`}
              status="good"
            />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {calculationState.result ? (
        <div className="p-6">
          <OverviewTab result={calculationState.result} />
        </div>
      ) : !calculationState.isCalculating && !calculationState.error ? (
        <div className="p-12 text-center">
          <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Prêt pour les calculs
          </h3>
          <p className="text-gray-500 mb-6">
            Ajoutez des éléments électriques sur le plan et lancez le calcul pour obtenir 
            le dimensionnement automatique du tableau électrique.
          </p>
          <button
            onClick={handleCalculate}
            disabled={elements.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Lancer le calcul
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ElectricalPanelAdvanced;