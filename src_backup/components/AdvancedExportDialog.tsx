import React, { useState, useCallback } from 'react';
import { 
  Download, 
  FileText, 
  Image, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  X,
  Settings,
  FileDown,
  Monitor,
  Printer,
  Archive
} from 'lucide-react';
import { Project } from '../types/electrical';
import { 
  ImportExportManager, 
  ExportOptions, 
  ExportResult 
} from '../utils/importExportManager';

interface AdvancedExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  canvasElement?: HTMLElement;
}

const AdvancedExportDialog: React.FC<AdvancedExportDialogProps> = ({
  isOpen,
  onClose,
  project,
  canvasElement
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
  const [useCase, setUseCase] = useState<'web' | 'print' | 'archive'>('print');

  // Options d'export optimisées pour chaque format et usage
  const getOptimalExportOptions = useCallback((format: 'pdf' | 'png' | 'jpg', usage: 'web' | 'print' | 'archive'): ExportOptions => {
    const baseOptions: ExportOptions = {
      format,
      quality: 1.0,
      resolution: 300,
      includeBackground: true,
      paperSize: 'A3',
      orientation: 'landscape',
      margins: { top: 10, right: 10, bottom: 10, left: 10 }
    };

    switch (usage) {
      case 'web':
        return {
          ...baseOptions,
          resolution: format === 'pdf' ? 150 : 96,
          quality: format === 'jpg' ? 0.85 : 1.0,
          paperSize: 'A4'
        };
      
      case 'print':
        return {
          ...baseOptions,
          resolution: 300, // Haute résolution pour impression
          quality: format === 'jpg' ? 0.95 : 1.0,
          paperSize: 'A3', // Format plus grand pour les plans
          margins: { top: 15, right: 15, bottom: 15, left: 15 }
        };
      
      case 'archive':
        return {
          ...baseOptions,
          resolution: 600, // Très haute résolution pour archivage
          quality: 1.0, // Qualité maximale
          paperSize: 'A3',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        };
      
      default:
        return baseOptions;
    }
  }, []);

  // Instance du manager
  const importExportManager = ImportExportManager.getInstance();

  // Handle export
  const handleExport = useCallback(async () => {
    if (!canvasElement) {
      setResult({ success: false, error: 'Élément canvas non trouvé' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const exportOptions = getOptimalExportOptions(selectedFormat, useCase);
      const result = await importExportManager.exportPlan(project, canvasElement, exportOptions);
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [project, canvasElement, selectedFormat, useCase, getOptimalExportOptions, importExportManager]);

  // Apply preset based on use case
  const applyPreset = useCallback((preset: 'web' | 'print' | 'archive') => {
    setUseCase(preset);
    
    // Suggestions de format selon l'usage
    switch (preset) {
      case 'web':
        setSelectedFormat('png'); // PNG pour le web (transparence possible)
        break;
      case 'print':
        setSelectedFormat('pdf'); // PDF pour l'impression (vectoriel + mise en page)
        break;
      case 'archive':
        setSelectedFormat('pdf'); // PDF pour archivage (pérenne)
        break;
    }
  }, []);

  // Render format options
  const renderFormatOptions = () => {
    const formats = [
      {
        id: 'pdf' as const,
        icon: FileDown,
        title: 'PDF',
        description: 'Format vectoriel, idéal pour l\'impression et l\'archivage',
        pros: ['Qualité vectorielle', 'Taille optimisée', 'Mise en page professionnelle'],
        recommended: useCase === 'print' || useCase === 'archive'
      },
      {
        id: 'png' as const,
        icon: Image,
        title: 'PNG',
        description: 'Image haute qualité avec transparence possible',
        pros: ['Qualité maximale', 'Support transparence', 'Compatible partout'],
        recommended: useCase === 'web'
      },
      {
        id: 'jpg' as const,
        icon: Image,
        title: 'JPG',
        description: 'Image compressée, taille de fichier réduite',
        pros: ['Taille fichier optimisée', 'Compatible universellement', 'Bon pour partage'],
        recommended: false
      }
    ];

    return (
      <div className="space-y-3">
        {formats.map((format) => {
          const Icon = format.icon;
          const isSelected = selectedFormat === format.id;
          const isRecommended = format.recommended;
          
          return (
            <div
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{format.title}</h4>
                    {isRecommended && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {format.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {format.pros.map((pro, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render quality settings
  const renderQualitySettings = () => {
    const options = getOptimalExportOptions(selectedFormat, useCase);
    
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Paramètres de qualité
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Résolution:</span>
            <span className="font-medium text-gray-900 dark:text-white">{options.resolution} DPI</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Qualité:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(options.quality * 100)}%
            </span>
          </div>
          
          {selectedFormat === 'pdf' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Format papier:</span>
                <span className="font-medium text-gray-900 dark:text-white">{options.paperSize}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Orientation:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {options.orientation === 'landscape' ? 'Paysage' : 'Portrait'}
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Arrière-plan:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {options.includeBackground ? 'Inclus' : 'Transparent'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render result
  const renderResult = () => {
    if (!result) return null;

    if (result.success) {
      return (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Export réussi !</span>
          </div>
          {result.fileName && (
            <p className="text-sm text-green-600 dark:text-green-200 mt-1">
              Fichier sauvegardé : {result.fileName}
            </p>
          )}
          {result.fileSize && (
            <p className="text-sm text-green-600 dark:text-green-200">
              Taille : {(result.fileSize / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Erreur d'export</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-200 mt-1">
            {result.error}
          </p>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export haute qualité
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Use Case Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Utilisation prévue
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'web', icon: Monitor, title: 'Web/Écran', desc: 'Partage numérique, présentation' },
                  { id: 'print', icon: Printer, title: 'Impression', desc: 'Impression papier, plans de travail' },
                  { id: 'archive', icon: Archive, title: 'Archivage', desc: 'Conservation long terme, qualité maximale' }
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = useCase === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => applyPreset(option.id as 'web' | 'print' | 'archive')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">{option.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Format de fichier
              </h3>
              {renderFormatOptions()}
            </div>

            {/* Quality Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Aperçu des paramètres
              </h3>
              {renderQualitySettings()}
            </div>

            {/* Project Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Informations du projet
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Nom du projet:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Éléments:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{project.elements.length}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Circuits:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{project.circuits.length}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Connexions:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{project.connections.length}</p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-lg font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Export en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Exporter en {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>

            {/* Result Display */}
            {renderResult()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedExportDialog;