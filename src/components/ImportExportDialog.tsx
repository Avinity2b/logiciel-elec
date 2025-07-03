import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  X,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Project } from '../types/electrical';
import { 
  importExportManager, 
  ImportOptions, 
  ExportOptions, 
  ImportResult, 
  ExportResult 
} from '../utils/importExportManager';

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  project: Project;
  onImportComplete?: (result: ImportResult) => void;
  canvasElement?: HTMLElement;
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
  
  // Import settings
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'pdf',
    quality: 'medium',
    maxSize: 10,
    autoResize: true,
    targetWidth: 1920,
    targetHeight: 1080
  });

  // Export settings
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 0.9,
    resolution: 300,
    includeBackground: true,
    paperSize: 'A4',
    orientation: 'landscape',
    margins: { top: 15, right: 15, bottom: 15, left: 15 }
  });

  const [useCase, setUseCase] = useState<'web' | 'print' | 'archive'>('print');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setResult(null);
      setPreviewData(null);
      setSelectedFile(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Apply recommended settings based on use case
  const applyRecommendedSettings = useCallback((newUseCase: 'web' | 'print' | 'archive') => {
    const recommended = importExportManager.getRecommendedSettings(newUseCase);
    setImportOptions(recommended.import);
    setExportOptions(recommended.export);
    setUseCase(newUseCase);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setPreviewData(null);
      
      // Auto-detect format
      if (file.type === 'application/pdf') {
        setImportOptions(prev => ({ ...prev, format: 'pdf' }));
      } else if (file.type.startsWith('image/')) {
        const format = file.type.includes('png') ? 'png' : 'jpg';
        setImportOptions(prev => ({ ...prev, format: format as 'jpg' | 'png' }));
      }
    }
  }, []);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const result = await importExportManager.importFile(selectedFile, importOptions);
      setResult(result);
      
      if (result.success && result.data) {
        setPreviewData(result.data);
        onImportComplete?.(result);
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, importOptions, onImportComplete]);

  // Handle export
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
  }, [project, canvasElement, exportOptions]);

  // Render preview
  const renderPreview = () => {
    if (!previewData) return null;

    const previews = Array.isArray(previewData) ? previewData : [previewData];
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Aperçu {previews.length > 1 ? `(${previews.length} pages)` : ''}
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {previews.map((dataUrl, index) => (
            <div key={index} className="relative">
              <img 
                src={dataUrl} 
                alt={`Aperçu ${index + 1}`}
                className="w-full h-auto max-h-32 object-contain bg-white rounded border"
              />
              {previews.length > 1 && (
                <span className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                  Page {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {mode === 'import' ? (
              <Upload className="w-5 h-5 text-blue-400" />
            ) : (
              <Download className="w-5 h-5 text-green-400" />
            )}
            <h2 className="text-lg font-semibold text-white">
              {mode === 'import' ? 'Importer un Plan' : 'Exporter le Plan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Panel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Paramètres</h3>
              </div>

              {/* Use Case Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Utilisation recommandée
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['web', 'print', 'archive'] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => applyRecommendedSettings(preset)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        useCase === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset === 'web' ? 'Web' : preset === 'print' ? 'Impression' : 'Archive'}
                    </button>
                  ))}
                </div>
              </div>

              {mode === 'import' ? (
                // Import Settings
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Format
                    </label>
                    <select
                      value={importOptions.format}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        format: e.target.value as 'pdf' | 'jpg' | 'png' 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Qualité
                    </label>
                    <select
                      value={importOptions.quality}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        quality: e.target.value as 'low' | 'medium' | 'high' 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="low">Faible (rapide)</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée (lent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Taille max (MB)
                    </label>
                    <input
                      type="number"
                      value={importOptions.maxSize}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        maxSize: parseInt(e.target.value) || 10 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.autoResize}
                        onChange={(e) => setImportOptions(prev => ({ 
                          ...prev, 
                          autoResize: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-300">Redimensionner automatiquement</span>
                    </label>
                  </div>

                  {importOptions.autoResize && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Largeur cible</label>
                        <input
                          type="number"
                          value={importOptions.targetWidth || ''}
                          onChange={(e) => setImportOptions(prev => ({ 
                            ...prev, 
                            targetWidth: parseInt(e.target.value) || undefined 
                          }))}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="1920"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hauteur cible</label>
                        <input
                          type="number"
                          value={importOptions.targetHeight || ''}
                          onChange={(e) => setImportOptions(prev => ({ 
                            ...prev, 
                            targetHeight: parseInt(e.target.value) || undefined 
                          }))}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          placeholder="1080"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Export Settings
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Format
                    </label>
                    <select
                      value={exportOptions.format}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        format: e.target.value as 'pdf' | 'jpg' | 'png' 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Résolution (DPI)
                    </label>
                    <select
                      value={exportOptions.resolution}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        resolution: parseInt(e.target.value) 
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value={72}>72 DPI (Web)</option>
                      <option value={150}>150 DPI (Standard)</option>
                      <option value={300}>300 DPI (Impression)</option>
                      <option value={600}>600 DPI (Haute qualité)</option>
                    </select>
                  </div>

                  {exportOptions.format !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Qualité ({Math.round(exportOptions.quality * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={exportOptions.quality}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          quality: parseFloat(e.target.value) 
                        }))}
                        className="w-full"
                      />
                    </div>
                  )}

                  {exportOptions.format === 'pdf' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Format papier
                          </label>
                          <select
                            value={exportOptions.paperSize}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              paperSize: e.target.value as 'A4' | 'A3' | 'Letter' 
                            }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="Letter">Letter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Orientation
                          </label>
                          <select
                            value={exportOptions.orientation}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              orientation: e.target.value as 'portrait' | 'landscape' 
                            }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            <option value="landscape">Paysage</option>
                            <option value="portrait">Portrait</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Marges (mm)
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                            <div key={side}>
                              <label className="block text-xs text-gray-400 mb-1 capitalize">
                                {side === 'top' ? 'Haut' : side === 'right' ? 'Droite' : side === 'bottom' ? 'Bas' : 'Gauche'}
                              </label>
                              <input
                                type="number"
                                value={exportOptions.margins?.[side] || 15}
                                onChange={(e) => setExportOptions(prev => ({ 
                                  ...prev, 
                                  margins: { 
                                    ...prev.margins, 
                                    [side]: parseInt(e.target.value) || 15 
                                  } 
                                }))}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                min="0"
                                max="50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeBackground}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          includeBackground: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-300">Inclure l'arrière-plan</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Action Panel */}
            <div className="space-y-4">
              {mode === 'import' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sélectionner un fichier
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center space-y-2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <Upload className="w-8 h-8" />
                        <span className="text-sm">
                          Cliquez pour sélectionner un fichier
                        </span>
                        <span className="text-xs">
                          PDF, JPG, PNG (max {importOptions.maxSize}MB)
                        </span>
                      </button>
                    </div>
                    
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">{selectedFile.name}</span>
                          <span className="text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || isProcessing}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Import en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Importer</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-700 rounded-lg">
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
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Export en cours...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Exporter</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Result Display */}
              {result && (
                <div className={`p-3 rounded-lg ${
                  result.success ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      result.success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {result.success ? 'Succès' : 'Erreur'}
                    </span>
                  </div>
                  
                  {result.success ? (
                    <div className="text-sm text-gray-300">
                      {mode === 'import' ? (
                        <>
                          <div>Fichier importé avec succès</div>
                          {'metadata' in result && result.metadata && (
                            <div className="text-xs text-gray-400 mt-1">
                              {result.metadata.pageCount && (
                                <div>Pages: {result.metadata.pageCount}</div>
                              )}
                              <div>
                                Taille: {(result.metadata.fileSize / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>Fichier exporté: {'fileName' in result && result.fileName}</div>
                          {'fileSize' in result && result.fileSize && (
                            <div className="text-xs text-gray-400 mt-1">
                              Taille: {(result.fileSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-300">
                      {result.error}
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              {mode === 'import' && renderPreview()}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
          <button
            onClick={() => {
              setResult(null);
              setPreviewData(null);
              setSelectedFile(null);
            }}
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
  );
};

export default ImportExportDialog;