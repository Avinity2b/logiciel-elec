import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Download, 
  Calculator, 
  Settings, 
  Save,
  FolderOpen,
  Zap,
  Scan,
  Link,
  Image,
  FileDown,
  Search,
  Home,
  Euro,
  Grid,
  Upload,
  FileImage
} from 'lucide-react';
import { Project, ExportOptions } from '../types/electrical';
import ImportExportDialog from './ImportExportDialog';
import AdvancedExportDialog from './AdvancedExportDialog';
import SafeExportDialog from './SafeExportDialog';
import { ImportResult, ImportExportManager } from '../utils/importExportManager';

interface HeaderProps {
  project: Project;
  onImportPlan: (file: File) => void;
  onExportProject: (format: 'json' | 'pdf' | 'csv') => void;
  onCalculateCircuits: () => void;
  isCalculating: boolean;
  onTogglePlanAnalysis: () => void;
  showPlanAnalysis: boolean;
  onOpenSettings: () => void;
  onToggleConnections: () => void;
  showConnections: boolean;
  onExportPlan?: (options: ExportOptions) => void;
  onOpenProjectManager?: () => void;
  onOpenSearch?: () => void;
  onOpenPlanTemplates?: () => void;
  onOpenElectricalPanel?: () => void;
  onOpenQuoteGenerator?: () => void;
  onAdvancedImportComplete?: (imageData: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  project,
  onImportPlan,
  onExportProject,
  onCalculateCircuits,
  isCalculating,
  onTogglePlanAnalysis,
  showPlanAnalysis,
  onOpenSettings,
  onToggleConnections,
  showConnections,
  onExportPlan,
  onOpenProjectManager,
  onOpenSearch,
  onOpenPlanTemplates,
  onOpenElectricalPanel,
  onOpenQuoteGenerator,
  onAdvancedImportComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);
  const [showSafeExportDialog, setShowSafeExportDialog] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('import');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    elements: 'all',
    showConnections: false
  });

  // Instance du manager pour l'export simple
  const importExportManager = ImportExportManager.getInstance();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportPlan(file);
      e.target.value = '';
    }
  };

  const handleExportPlan = () => {
    if (onExportPlan) {
      onExportPlan(exportOptions);
      setShowExportModal(false);
    }
  };

  const handleAdvancedImport = () => {
    setImportExportMode('import');
    setShowImportExportDialog(true);
  };

  const handleAdvancedExport = () => {
    // Utiliser notre dialogue d'export sécurisé
    setShowSafeExportDialog(true);
  };

  const handleSimplePDFExport = () => {
    // Ouvrir directement l'export avancé qui fonctionne bien
    // L'utilisateur n'aura qu'à cliquer sur "Exporter" dans le dialogue
    setShowAdvancedExportDialog(true);
  };

  const handleImportComplete = (result: ImportResult) => {
    console.log('Import completed:', result);
    
    if (result.success && result.data && onAdvancedImportComplete) {
      let imageData: string;
      
      if (typeof result.data === 'string') {
        imageData = result.data;
      } else if (Array.isArray(result.data)) {
        imageData = result.data[0];
      } else {
        console.error('Format de données non reconnu:', result.data);
        return;
      }
      
      console.log('Transmission des données d\'import à App.tsx...');
      onAdvancedImportComplete(imageData);
    } else {
      console.error('Import failed or missing callback:', { 
        success: result.success, 
        hasData: !!result.data, 
        hasCallback: !!onAdvancedImportComplete 
      });
    }
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-semibold text-white">ElectriCAD AI</h1>
            </div>
            
            <div className="h-6 w-px bg-gray-600" />
            
            <span className="text-sm text-gray-300">{project.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenPlanTemplates && (
              <button
                onClick={onOpenPlanTemplates}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Modèles</span>
              </button>
            )}

            {onOpenProjectManager && (
              <button
                onClick={onOpenProjectManager}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Projets</span>
              </button>
            )}

            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                <span>Importer</span>
              </button>
              
              <div className="absolute left-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleImportClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Import rapide (glisser-déposer)</span>
                </button>
                <button
                  onClick={handleAdvancedImport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FileImage className="w-4 h-4" />
                  <span>Import avancé (PDF/JPG/PNG)</span>
                </button>
              </div>
            </div>

            <button
              onClick={onToggleConnections}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                showConnections 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>Liaisons éclairage</span>
            </button>

            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Recherche</span>
              </button>
            )}

            <button
              onClick={onCalculateCircuits}
              disabled={isCalculating}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md text-sm font-medium transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? 'Calcul...' : 'Calculer'}</span>
            </button>

            <button
              onClick={handleAdvancedExport}
              className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>

            {onOpenElectricalPanel && (
              <button
                onClick={onOpenElectricalPanel}
                className="flex items-center space-x-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-md text-sm font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Tableaux</span>
              </button>
            )}

            {onOpenQuoteGenerator && (
              <button
                onClick={onOpenQuoteGenerator}
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm font-medium transition-colors"
              >
                <Euro className="w-4 h-4" />
                <span>Devis</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {showImportExportDialog && (
        <ImportExportDialog
          isOpen={showImportExportDialog}
          mode={importExportMode}
          onClose={() => setShowImportExportDialog(false)}
          onImportComplete={handleImportComplete}
          project={project}
        />
      )}

      {showSafeExportDialog && (
        <SafeExportDialog
          isOpen={showSafeExportDialog}
          project={project}
          onClose={() => setShowSafeExportDialog(false)}
        />
      )}
    </>
  );
};

export default Header;