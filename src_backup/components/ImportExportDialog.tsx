import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  X,
  Eye,
  RotateCcw,
  Crop,
  Check
} from 'lucide-react';
import { Project } from '../types/electrical';
import { 
  ImportExportManager, 
  ImportOptions, 
  ExportOptions, 
  ImportResult, 
  ExportResult 
} from '../utils/importExportManager';
import PDFCropTool from './PDFCropTool';

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  project: Project;
  onImportComplete?: (result: ImportResult) => void;
  canvasElement?: HTMLElement;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImportExportDialog: React.FC<ImportExportDialogProps> = ({
  isOpen,
  onClose,
  mode,
  project,
  onImportComplete,
  canvasElement
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | ExportResult | null>(null);
  const [previewData, setPreviewData] = useState<string | string[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // États pour le rognage
  const [showCropTool, setShowCropTool] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [importedData, setImportedData] = useState<string | null>(null);

  // Options d'import par défaut (simplifiées)
  const getImportOptions = useCallback((fileType: string): ImportOptions => {
    const format = fileType === 'application/pdf' ? 'pdf' : 
                  fileType.includes('png') ? 'png' : 'jpg';
    
    return {
      format: format as 'pdf' | 'jpg' | 'png',
      quality: 'high',
      maxSize: 100,
      autoResize: true,
      targetWidth: 1920,
      targetHeight: 1080
    };
  }, []);

  // Export settings (pour le mode export)
  const [exportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 0.9,
    resolution: 300,
    includeBackground: true,
    paperSize: 'A4',
    orientation: 'landscape',
    margins: { top: 15, right: 15, bottom: 15, left: 15 }
  });

  // Instance du manager
  const importExportManager = ImportExportManager.getInstance();

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setPreviewData(null);
      setImportedData(null);
    }
  }, []);

  // Générer aperçu pour le rognage
  const generatePreviewForCrop = useCallback(async (file: File) => {
    try {
      const options = getImportOptions(file.type);
      const previewOptions: ImportOptions = {
        ...options,
        quality: 'medium',
        autoResize: false // Important : garder la taille originale pour le rognage
      };
      
      const result = await importExportManager.importFile(file, previewOptions);
      
      if (result.success && result.data && result.metadata) {
        const imageData = Array.isArray(result.data) ? result.data[0] : result.data;
        setOriginalImageData(imageData);
        setOriginalDimensions({
          width: result.metadata.originalWidth,
          height: result.metadata.originalHeight
        });
        setShowCropTool(true);
      } else {
        throw new Error(result.error || 'Erreur lors de la génération de l\'aperçu');
      }
    } catch (error) {
      console.error('Erreur aperçu:', error);
      setResult({ 
        success: false, 
        error: `Erreur lors de la génération de l'aperçu: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    }
  }, [getImportOptions, importExportManager]);

  // Handle import with or without cropping
  const handleImport = useCallback(async (withCropping: boolean = false) => {
    if (!selectedFile) return;

    if (withCropping && selectedFile.type === 'application/pdf') {
      await generatePreviewForCrop(selectedFile);
      return;
    }

    // Import normal sans rognage
    setIsProcessing(true);
    setResult(null);

    try {
      const options = getImportOptions(selectedFile.type);
      const result = await importExportManager.importFile(selectedFile, options);
      setResult(result);
      
      if (result.success && result.data) {
        const imageData = Array.isArray(result.data) ? result.data[0] : result.data;
        setPreviewData(imageData);
        setImportedData(imageData);
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, getImportOptions, generatePreviewForCrop, importExportManager]);

  // Handle crop completion
  const handleCropComplete = useCallback(async (croppedImageData: string, cropArea: CropArea) => {
    setShowCropTool(false);
    setIsProcessing(true);
    setResult(null);

    try {
      // Créer un résultat d'import avec l'image rognée
      const result: ImportResult = {
        success: true,
        data: croppedImageData,
        metadata: {
          originalWidth: cropArea.width,
          originalHeight: cropArea.height,
          fileSize: selectedFile?.size || 0,
          pageCount: 1
        }
      };
      
      setResult(result);
      setPreviewData(croppedImageData);
      setImportedData(croppedImageData);
      
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Erreur lors du rognage: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  // Handle crop cancellation
  const handleCropCancel = useCallback(() => {
    setShowCropTool(false);
    setOriginalImageData('');
    setOriginalDimensions({ width: 0, height: 0 });
  }, []);

  // Handle final validation (complete import)
  const handleValidateImport = useCallback(() => {
    console.log('=== VALIDATION IMPORT ===');
    console.log('importedData:', importedData ? 'Présent' : 'Absent');
    console.log('result:', result);
    console.log('onImportComplete:', onImportComplete ? 'Présent' : 'Absent');
    
    if (importedData && result?.success) {
      const finalResult: ImportResult = {
        success: true,
        data: importedData,
        metadata: result.metadata
      };
      
      console.log('finalResult à envoyer:', finalResult);
      
      // S'assurer que onImportComplete est appelé avant de fermer
      if (onImportComplete) {
        console.log('Appel de onImportComplete...');
        onImportComplete(finalResult);
        console.log('onImportComplete appelé avec succès');
        
        // Petit délai pour s'assurer que l'import est traité
        setTimeout(() => {
          console.log('Fermeture de la fenêtre...');
          onClose();
        }, 200);
      } else {
        console.warn('onImportComplete callback non fourni');
        onClose();
      }
    } else {
      console.error('Conditions non remplies pour validation:', {
        hasImportedData: !!importedData,
        resultSuccess: result?.success
      });
    }
  }, [importedData, result, onImportComplete, onClose]);

  // Handle export (pour le mode export)
  const handleExport = useCallback(async () => {
    if (!canvasElement) {
      setResult({ success: false, error: 'Élément canvas non trouvé' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
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
  }, [project, canvasElement, exportOptions, importExportManager]);

  // Reset function
  const handleReset = useCallback(() => {
    setResult(null);
    setPreviewData(null);
    setSelectedFile(null);
    setImportedData(null);
    setOriginalImageData('');
    setOriginalDimensions({ width: 0, height: 0 });
  }, []);

  // Render preview
  const renderPreview = () => {
    if (!previewData) return null;

    const previews = Array.isArray(previewData) ? previewData : [previewData];
    
    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Aperçu
        </h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <img 
            src={previews[0]} 
            alt="Aperçu du plan"
            className="w-full max-h-64 object-contain bg-gray-800 rounded border border-gray-600"
          />
        </div>
      </div>
    );
  };

  // Render result
  const renderResult = () => {
    if (!result) return null;

    if (result.success) {
      const message = 'metadata' in result && result.metadata?.pageCount 
        ? `Import réussi ! ${result.metadata.pageCount} page(s) trouvée(s) dans le PDF.`
        : mode === 'import' ? 'Import réussi !' : 'Export réussi !';
        
      return (
        <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-600">
          <div className="flex items-center text-green-300">
            <CheckCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-4 p-3 bg-red-900/30 rounded border border-red-600">
          <div className="flex items-center text-red-300">
            <AlertCircle className="w-4 h-4 mr-2" />
            Erreur: {result.error}
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  // Afficher l'outil de rognage si activé
  if (showCropTool && originalImageData) {
    return (
      <PDFCropTool
        imageData={originalImageData}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        originalWidth={originalDimensions.width}
        originalHeight={originalDimensions.height}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {mode === 'import' ? (
              <Upload className="w-5 h-5 text-blue-400" />
            ) : (
              <Download className="w-5 h-5 text-green-400" />
            )}
            <h2 className="text-lg font-semibold text-white">
              {mode === 'import' ? 'Importer un plan' : 'Exporter le projet'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {mode === 'import' ? (
            <>
              {/* Zone de sélection de fichier */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-gray-300">
                      <FileText className="w-6 h-6" />
                      <span className="font-medium text-lg">{selectedFile.name}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-400 hover:text-blue-300 font-medium text-lg"
                      >
                        Choisir un fichier
                      </button>
                      <p className="text-gray-400 mt-2">
                        ou glisser-déposer ici
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Formats supportés: PDF, JPG, PNG
                    </p>
                  </div>
                )}
              </div>

              {/* Boutons d'import */}
              {selectedFile && (
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleImport(true)}
                    disabled={isProcessing || selectedFile.type !== 'application/pdf'}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Préparation du rognage...</span>
                      </>
                    ) : (
                      <>
                        <Crop className="w-5 h-5" />
                        <span>Importer avec rognage</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleImport(false)}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Import en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Importer sans rognage</span>
                      </>
                    )}
                  </button>
                  
                  {selectedFile.type !== 'application/pdf' && (
                    <p className="text-xs text-gray-400 text-center">
                      Le rognage n'est disponible que pour les fichiers PDF
                    </p>
                  )}
                </div>
              )}

              {/* Affichage des résultats */}
              {renderResult()}

              {/* Aperçu */}
              {renderPreview()}
            </>
          ) : (
            <>
              {/* Mode Export */}
              <div className="p-4 bg-gray-700 rounded-lg mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Projet à exporter</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Nom: {project.name}</div>
                  <div>Éléments: {project.elements.length}</div>
                  <div>Circuits: {project.circuits.length}</div>
                  <div>Connexions: {project.connections.length}</div>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Export en cours...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Exporter</span>
                  </>
                )}
              </button>

              {renderResult()}
            </>
          )}
        </div>

        {/* Footer avec boutons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-700">
          <div>
            {mode === 'import' && importedData && result?.success && (
              <button
                onClick={handleValidateImport}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2 font-medium"
              >
                <Check className="w-4 h-4" />
                <span>Valider l'importation</span>
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportDialog;