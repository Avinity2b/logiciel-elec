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
import { ImportResult } from '../utils/importExportManager';

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
  // AJOUT : Nouvelle prop pour recevoir les données d'import avancé
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
  onAdvancedImportComplete // AJOUT
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);
  const [showAdvancedExportDialog, setShowAdvancedExportDialog] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('import');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    elements: 'all',
    showConnections: false
  });

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
    setShowAdvancedExportDialog(true);
  };

  // CORRECTION : Fonction qui transmet les données à App.tsx
  const handleImportComplete = (result: ImportResult) => {
    console.log('Import completed:', result);
    
    if (result.success && result.data && onAdvancedImportComplete) {
      let imageData: string;
      
      if (typeof result.data === 'string') {
        // Single image
        imageData = result.data;
      } else if (Array.isArray(result.data)) {
        // Multiple pages - use first page as background
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

            {/* Import Dropdown */}
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
              onClick={onTogglePlanAnalysis}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                showPlanAnalysis 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>Analyse IA</span>
            </button>

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

            {onOpenElectricalPanel && (
              <button
                onClick={onOpenElectricalPanel}
                className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm font-medium transition-colors"
              >
                <Grid className="w-4 h-4" />
                <span>Tableau</span>
              </button>
            )}

            {onOpenQuoteGenerator && (
              <button
                onClick={onOpenQuoteGenerator}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors"
              >
                <Euro className="w-4 h-4" />
                <span>Devis</span>
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-md text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
              
              <div className="absolute right-0 top-full mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Export plan (rapide)</span>
                </button>
                <button
                  onClick={handleAdvancedExport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FileImage className="w-4 h-4" />
                  <span>Export avancé (PDF/JPG/PNG)</span>
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={() => onExportProject('json')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Projet (.json)</span>
                </button>
                <button
                  onClick={() => onExportProject('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Schéma Unifilaire (.pdf)</span>
                </button>
                <button
                  onClick={() => onExportProject('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Liste Matériel (.csv)</span>
                </button>
              </div>
            </div>

            <button 
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.dwg,.jpg,.jpeg,.png,.gif,.bmp,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* Quick Export Plan Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export Rapide du Plan</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                    className={`px-3 py-2 rounded text-sm ${
                      exportOptions.format === 'pdf'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <FileDown className="w-4 h-4 inline mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'jpg' }))}
                    className={`px-3 py-2 rounded text-sm ${
                      exportOptions.format === 'jpg'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Image className="w-4 h-4 inline mr-1" />
                    JPG
                  </button>
                </div>
              </div>

              {/* Elements */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Éléments à afficher</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="elements"
                      checked={exportOptions.elements === 'all'}
                      onChange={() => setExportOptions(prev => ({ ...prev, elements: 'all' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Tout afficher</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="elements"
                      checked={exportOptions.elements === 'outlets'}
                      onChange={() => setExportOptions(prev => ({ ...prev, elements: 'outlets' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Prises uniquement</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="elements"
                      checked={exportOptions.elements === 'lighting'}
                      onChange={() => setExportOptions(prev => ({ ...prev, elements: 'lighting' }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Éclairage uniquement</span>
                  </label>
                </div>
              </div>

              {/* Connections (only for lighting) */}
              {exportOptions.elements === 'lighting' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.showConnections}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, showConnections: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Afficher liaisons commandes/éclairage</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExportPlan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Import/Export Dialog */}
      <ImportExportDialog
        isOpen={showImportExportDialog}
        onClose={() => setShowImportExportDialog(false)}
        mode={importExportMode}
        project={project}
        onImportComplete={handleImportComplete}
        canvasElement={document.querySelector('.konvajs-content')?.parentElement as HTMLElement}
      />

      {/* Advanced Export Dialog */}
      <AdvancedExportDialog
        isOpen={showAdvancedExportDialog}
        onClose={() => setShowAdvancedExportDialog(false)}
        project={project}
        canvasElement={document.querySelector('.konvajs-content')?.parentElement as HTMLElement}
      />
    </>
  );
};

export default Header;