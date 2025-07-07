import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './components/Header';
import NewToolbar from './components/NewToolbar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import PlanAnalysisPanel from './components/PlanAnalysisPanel'; // Gardé pour éviter les erreurs
import SettingsPanel from './components/SettingsPanel';
import StatusBar from './components/StatusBar';
import ProjectManager from './components/ProjectManager';
import SearchPanel from './components/SearchPanel';
import PlanTemplates from './components/PlanTemplates';
import ElectricalPanel from './components/ElectricalPanel';
import QuoteGenerator from './components/QuoteGenerator';
import ExportZoneSelector from './components/ExportZoneSelector';
import { ElectricalElement, Circuit, Project, Connection, ExportOptions } from './types/electrical';
import { PlanAnalysisResult } from './types/architectural'; // Gardé pour éviter les erreurs
import { ProjectSettings } from './types/equipment';
import { calculateCircuits } from './utils/nfc15100';
import { generateSchematic } from './utils/schematicGenerator';
import { exportProject } from './utils/exportUtils';
import { exportPlan, ExportSettings } from './utils/planExporter';
import { ImportExportManager } from './utils/importExportManager';
const importExportManager = ImportExportManager.getInstance();

function App() {
  const stageRef = useRef<any>(null);
  
  const [project, setProject] = useState<Project>({
    id: 'new-project',
    name: 'Nouveau Projet',
    elements: [],
    circuits: [],
    connections: [],
    calculations: null,
    backgroundImage: null,
    settings: {
      selectedWallSeries: {},
      selectedModularSeries: {}
    }
  });

  const [selectedElements, setSelectedElements] = useState<ElectricalElement[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [planAnalysisResult, setPlanAnalysisResult] = useState<PlanAnalysisResult | null>(null); // Gardé pour éviter les erreurs
  const [showPlanAnalysis, setShowPlanAnalysis] = useState(false); // Toujours false maintenant
  const [showSettings, setShowSettings] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPlanTemplates, setShowPlanTemplates] = useState(false);
  const [showElectricalPanel, setShowElectricalPanel] = useState(false);
  const [showQuoteGenerator, setShowQuoteGenerator] = useState(false);
  const [showExportZone, setShowExportZone] = useState(false);
  const [exportZone, setExportZone] = useState({ x: 0, y: 0, width: 800, height: 600 });

  const handleAddElement = useCallback((element: ElectricalElement) => {
    setProject(prev => ({
      ...prev,
      elements: [...prev.elements, element]
    }));
  }, []);

  const handleUpdateElement = useCallback((id: string, updates: Partial<ElectricalElement>) => {
    setProject(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  }, []);

  const handleDeleteElements = useCallback((ids: string[]) => {
    setProject(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !ids.includes(el.id)),
      connections: prev.connections.filter(conn => 
        !ids.includes(conn.fromId) && !ids.includes(conn.toId)
      )
    }));
    setSelectedElements([]);
  }, []);

  const handleAddConnection = useCallback((connection: Connection) => {
    setProject(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }));
  }, []);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    setProject(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  }, []);

  const handleImportPlan = useCallback(async (file: File) => {
    try {
      const result = await importExportManager.importFile(file);
      
      if (result.success && result.data) {
        if (typeof result.data === 'string') {
          setProject(prev => ({
            ...prev,
            backgroundImage: result.data as string
          }));
        } else if (Array.isArray(result.data)) {
          setProject(prev => ({
            ...prev,
            backgroundImage: result.data[0]
          }));
        }
      }
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'import du fichier');
    }
  }, []);

  const handleAdvancedImportComplete = useCallback((imageData: string) => {
    setProject(prev => ({
      ...prev,
      backgroundImage: imageData
    }));
  }, []);

  const handleExportProject = useCallback(async (format: 'json' | 'pdf' | 'csv') => {
    try {
      await exportProject(project, format);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  }, [project]);

  const handleExportPlan = useCallback(async (options: ExportOptions) => {
    if (!stageRef.current) return;
    
    try {
      const settings: ExportSettings = {
        format: options.format === 'pdf' ? 'pdf' : 'png',
        quality: 300,
        area: options.elements === 'selection' ? exportZone : undefined,
        includeBackground: true,
        includeConnections: options.showConnections
      };

      await exportPlan(stageRef.current, project, settings);
    } catch (error) {
      console.error('Erreur export plan:', error);
      alert('Erreur lors de l\'export du plan');
    }
  }, [project, exportZone]);

  const handleCalculateCircuits = useCallback(async () => {
    setIsCalculating(true);
    try {
      const calculations = await calculateCircuits(project.elements, project.settings);
      setProject(prev => ({ ...prev, calculations }));
      
      // Suggestions IA basées sur les calculs
      const suggestions = [
        `${calculations.circuits.length} circuits calculés`,
        `Puissance totale: ${calculations.totalPower.toFixed(0)}W`,
        calculations.compliance.isCompliant 
          ? 'Installation conforme NF C 15-100' 
          : 'Vérifiez la conformité NF C 15-100'
      ];
      setAiSuggestions(prev => [...prev, ...suggestions]);
    } catch (error) {
      console.error('Erreur calcul:', error);
      alert('Erreur lors du calcul des circuits');
    } finally {
      setIsCalculating(false);
    }
  }, [project.elements, project.settings]);

  const handleExportSchematic = useCallback(async () => {
    try {
      const schematic = generateSchematic(project);
      // Logique d'export du schéma
      console.log('Schéma généré:', schematic);
    } catch (error) {
      console.error('Erreur génération schéma:', error);
    }
  }, [project]);

  // Gardé pour éviter les erreurs mais ne fait rien
  const handleAnalysisComplete = useCallback((result: PlanAnalysisResult) => {
    console.log('Analyse terminée (désactivée):', result);
    // Ne fait rien - fonctionnalité désactivée
  }, []);

  // Gardé pour éviter les erreurs mais ne fait rien
  const handleToggleElementVisibility = useCallback((elementType: string, visible: boolean) => {
    console.log(`Toggle ${elementType} visibility: ${visible} (désactivé)`);
    // Ne fait rien - fonctionnalité désactivée
  }, []);

  const handleSettingsChange = useCallback((settings: ProjectSettings) => {
    setProject(prev => ({
      ...prev,
      settings
    }));
  }, []);

  const handleToggleConnections = useCallback(() => {
    setShowConnections(prev => !prev);
  }, []);

  const handleLoadProject = useCallback((loadedProject: Project) => {
    setProject(loadedProject);
    setSelectedElements([]);
    setAiSuggestions([]);
    setPlanAnalysisResult(null);
  }, []);

  const handleElementFound = useCallback((elementId: string) => {
    const element = project.elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElements([element]);
      // Center view on element (would need canvas reference)
      // For now, just select it
    }
  }, [project.elements]);

  const handleSelectTemplate = useCallback((templateProject: Project) => {
    setProject(templateProject);
    setSelectedElements([]);
    setAiSuggestions([]);
    setPlanAnalysisResult(null);
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    setProject(updatedProject);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-900 text-white flex flex-col">
        <Header 
          project={project}
          onImportPlan={handleImportPlan}
          onExportProject={handleExportProject}
          onCalculateCircuits={handleCalculateCircuits}
          isCalculating={isCalculating}
          onTogglePlanAnalysis={() => {}} // Fonction vide - bouton supprimé
          showPlanAnalysis={false} // Toujours false
          onOpenSettings={() => setShowSettings(true)}
          onToggleConnections={handleToggleConnections}
          showConnections={showConnections}
          onExportPlan={handleExportPlan}
          onOpenProjectManager={() => setShowProjectManager(true)}
          onOpenSearch={() => setShowSearch(true)}
          onOpenPlanTemplates={() => setShowPlanTemplates(true)}
          onOpenElectricalPanel={() => setShowElectricalPanel(true)}
          onOpenQuoteGenerator={() => setShowQuoteGenerator(true)}
          onAdvancedImportComplete={handleAdvancedImportComplete}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <NewToolbar onAddElement={handleAddElement} />
          
          <div className="flex-1 flex flex-col relative">
            <Canvas
              ref={stageRef}
              project={project}
              selectedElements={selectedElements}
              onSelectElements={setSelectedElements}
              onUpdateElement={handleUpdateElement}
              onDeleteElements={handleDeleteElements}
              onAddElement={handleAddElement}
              onAddConnection={handleAddConnection}
              onDeleteConnection={handleDeleteConnection}
              planAnalysisResult={planAnalysisResult}
              showConnections={showConnections}
            />
            
            {showExportZone && (
              <ExportZoneSelector
                canvasWidth={800}
                canvasHeight={600}
                onZoneChange={setExportZone}
                initialZone={exportZone}
              />
            )}
            
            <StatusBar 
              elementCount={project.elements.length}
              circuitCount={project.circuits.length}
              connectionCount={project.connections.length}
              aiSuggestions={aiSuggestions}
            />
          </div>
          
          <div className="flex">
            <PropertiesPanel
              selectedElements={selectedElements}
              onUpdateElement={handleUpdateElement}
              onExportSchematic={handleExportSchematic}
              calculations={project.calculations}
              project={project}
            />
            
            {/* MASQUÉ: Le PlanAnalysisPanel n'apparaît jamais car showPlanAnalysis est toujours false */}
            {false && showPlanAnalysis && (
              <PlanAnalysisPanel
                backgroundImage={project.backgroundImage}
                onAnalysisComplete={handleAnalysisComplete}
                onToggleElementVisibility={handleToggleElementVisibility}
                analysisResult={planAnalysisResult}
              />
            )}

            {showSearch && (
              <SearchPanel
                project={project}
                onElementFound={handleElementFound}
                onClose={() => setShowSearch(false)}
              />
            )}
          </div>
        </div>

        {showSettings && (
          <SettingsPanel
            settings={project.settings || {
              selectedWallSeries: {},
              selectedModularSeries: {}
            }}
            onSettingsChange={handleSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showProjectManager && (
          <ProjectManager
            onLoadProject={handleLoadProject}
            onClose={() => setShowProjectManager(false)}
            currentProject={project}
          />
        )}

        {showPlanTemplates && (
          <PlanTemplates
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowPlanTemplates(false)}
          />
        )}

        {showElectricalPanel && (
          <ElectricalPanel
            project={project}
            onUpdateProject={handleUpdateProject}
            onClose={() => setShowElectricalPanel(false)}
          />
        )}

        {showQuoteGenerator && (
          <QuoteGenerator
            project={project}
            onClose={() => setShowQuoteGenerator(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;