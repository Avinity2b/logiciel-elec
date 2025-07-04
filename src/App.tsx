import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './components/Header';
import NewToolbar from './components/NewToolbar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import PlanAnalysisPanel from './components/PlanAnalysisPanel';
import SettingsPanel from './components/SettingsPanel';
import StatusBar from './components/StatusBar';
import ProjectManager from './components/ProjectManager';
import SearchPanel from './components/SearchPanel';
import PlanTemplates from './components/PlanTemplates';
import ElectricalPanel from './components/ElectricalPanel';
import QuoteGenerator from './components/QuoteGenerator';
import ExportZoneSelector from './components/ExportZoneSelector';
import { ElectricalElement, Circuit, Project, Connection, ExportOptions } from './types/electrical';
import { PlanAnalysisResult } from './types/architectural';
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
  const [planAnalysisResult, setPlanAnalysisResult] = useState<PlanAnalysisResult | null>(null);
  const [showPlanAnalysis, setShowPlanAnalysis] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConnections, setShowConnections] = useState(true); // ✅ Actif par défaut
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showPlanTemplates, setShowPlanTemplates] = useState(false);
  const [showElectricalPanel, setShowElectricalPanel] = useState(false);
  const [showQuoteGenerator, setShowQuoteGenerator] = useState(false);
  const [showExportZone, setShowExportZone] = useState(false);
  const [exportZone, setExportZone] = useState<any>(null);

  // Expose stageRef globally for export functionality
  React.useEffect(() => {
    (window as any).stageRef = stageRef;
  }, []);

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
        !ids.includes(conn.from) && !ids.includes(conn.to)
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

  const handleCalculateCircuits = useCallback(async () => {
    setIsCalculating(true);
    try {
      const calculations = await calculateCircuits(project.elements, project.settings);
      setProject(prev => ({
        ...prev,
        calculations
      }));
      
      const suggestions = [
        "Regrouper les spots de la cuisine sur un circuit dédié",
        "Optimiser les connexions interrupteur-éclairage pour réduire le câblage",
        "Considérer l'ajout de variateurs pour les appliques"
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [project.elements, project.settings]);

  const handleExportSchematic = useCallback(async () => {
    if (project.calculations) {
      await generateSchematic(project);
    }
  }, [project]);

  const handleExportProject = useCallback(async (format: 'json' | 'pdf' | 'csv') => {
    await exportProject(project, format);
  }, [project]);

  const handleExportPlan = useCallback(async (options: ExportOptions) => {
    const canvasContainer = document.querySelector('.konvajs-content')?.parentElement;
    if (canvasContainer) {
      const settings: ExportSettings = {
        ...options,
        zone: exportZone,
        paperFormat: 'A4',
        orientation: 'landscape',
        action: 'download'
      };
      await exportPlan(project, settings, canvasContainer as HTMLElement);
    } else {
      alert('Impossible de trouver le canvas pour l\'export');
    }
  }, [project, exportZone]);

  const handleImportPlan = useCallback(async (file: File) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.bmp') || fileName.endsWith('.webp')) {
    // Import direct des images
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProject(prev => ({
        ...prev,
        backgroundImage: result
      }));
      setShowPlanAnalysis(true);
    };
    reader.readAsDataURL(file);
  } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    // Utiliser le vrai système d'import PDF
    await handlePDFImport(file);
  } else if (fileName.endsWith('.dwg')) {
    alert('Les fichiers DWG ne sont pas encore supportés. Veuillez convertir votre fichier en PDF ou image.');
  } else {
    alert('Format de fichier non supporté. Formats acceptés: PDF, JPG, PNG, GIF, BMP, WebP, DWG');
  }
}, []);

  const handlePDFImport = useCallback(async (file: File) => {
  try {
    setIsCalculating(true); // Montrer le loader
    
    // Options d'import pour PDF
    const importOptions = {
      format: 'pdf' as const,
      quality: 'medium' as const,
      maxSize: 50, // 50MB max
      autoResize: true,
      targetWidth: 1920,
      targetHeight: 1080
    };

    // Utiliser l'ImportExportManager pour traiter le PDF
    const result = await importExportManager.importFile(file, importOptions);
    
    if (result.success && result.data) {
      // Si c'est un PDF multi-pages, prendre la première page
      const imageData = Array.isArray(result.data) ? result.data[0] : result.data;
      
      setProject(prev => ({
        ...prev,
        backgroundImage: imageData
      }));
      setShowPlanAnalysis(true);
      
      // Afficher un message de succès
      alert(`PDF importé avec succès ! ${result.metadata?.pageCount ? `(${result.metadata.pageCount} page(s) trouvée(s), première page utilisée)` : ''}`);
    } else {
      throw new Error(result.error || 'Erreur inconnue lors de l\'import PDF');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'importation du PDF:', error);
    
    // Fallback vers l'ancienne méthode en cas d'erreur
    const shouldUseFallback = confirm(
      `Erreur lors de l'import PDF automatique: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n` +
      'Voulez-vous utiliser un placeholder temporaire ? (Sinon, veuillez convertir votre PDF en image JPG/PNG)'
    );
    
    if (shouldUseFallback) {
      // Créer un placeholder
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#666';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Plan PDF (placeholder)', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '14px Arial';
        ctx.fillText('Convertissez votre PDF en image pour un meilleur rendu', canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText(`Fichier: ${file.name}`, canvas.width / 2, canvas.height / 2 + 30);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      setProject(prev => ({
        ...prev,
        backgroundImage: dataUrl
      }));
      setShowPlanAnalysis(true);
    }
  } finally {
    setIsCalculating(false); // Cacher le loader
  }
}, []);

  // AJOUT : Gestionnaire pour l'import avancé depuis Header
  const handleAdvancedImportComplete = useCallback((imageData: string) => {
    console.log('=== IMPORT AVANCÉ DANS APP.tsx ===');
    console.log('Réception des données d\'image...');
    
    setProject(prev => {
      const updatedProject = {
        ...prev,
        backgroundImage: imageData
      };
      console.log('Projet mis à jour avec backgroundImage');
      return updatedProject;
    });
    
    // Activer l'analyse du plan
  setShowPlanAnalysis(true);
  console.log('Analyse du plan activée');
}, []);

const handleAnalysisComplete = useCallback((result: PlanAnalysisResult) => {
  setPlanAnalysisResult(result);
  
  const analysisBasedSuggestions = [
    `${result.rooms.length} pièces détectées - Vérifier les besoins électriques`,
    `${result.doors.length} portes identifiées - Prévoir l'éclairage des passages`,
    `Analyse terminée avec ${Math.round(result.confidence)}% de confiance`
  ];
  
  setAiSuggestions(prev => [...prev, ...analysisBasedSuggestions]);
}, []);

const handleToggleElementVisibility = useCallback((elementType: string, visible: boolean) => {
  console.log(`Toggle ${elementType} visibility: ${visible}`);
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
        onTogglePlanAnalysis={() => setShowPlanAnalysis(!showPlanAnalysis)}
        showPlanAnalysis={showPlanAnalysis}
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
          
          {showPlanAnalysis && (
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