import React, { useState } from 'react';
import { X, Download, Monitor, Printer, Archive, FileImage, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project } from '../types/electrical';

interface SafeExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface ExportOptions {
  quality: 'high' | 'print' | 'archive';
  format: 'pdf' | 'jpg' | 'png';
  paperSize: 'A3' | 'A4';
  orientation: 'landscape' | 'portrait';
  includeBackground: boolean;
  resolution: number;
}

interface ExportResult {
  success: boolean;
  message: string;
}

const SafeExportDialog: React.FC<SafeExportDialogProps> = ({ isOpen, onClose, project }) => {
  const [options, setOptions] = useState<ExportOptions>({
    quality: 'print',
    format: 'pdf',
    paperSize: 'A3',
    orientation: 'landscape',
    includeBackground: true,
    resolution: 300
  });

  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);

  const qualitySettings = {
    high: {
      description: 'Rapide, capture écran',
      resolution: 150,
      method: 'screenshot'
    },
    print: {
      description: 'HYBRIDE vectoriel+raster',
      resolution: 300,
      method: 'hybrid'
    },
    archive: {
      description: 'ULTRA haute résolution',
      resolution: 600,
      method: 'ultra'
    }
  };

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setResult(null);

    try {
      if (options.quality === 'high') {
        await exportScreenshotPDF();
      } else if (options.quality === 'print') {
        await exportHybridPDF();
      } else {
        await exportUltraHighResPDF();
      }

      setResult({
        success: true,
        message: `✅ Export ${qualitySettings[options.quality].method} réussi !`
      });

    } catch (error) {
      console.error('Erreur export:', error);
      setResult({ 
        success: false, 
        message: `Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setIsExporting(false);
    }
  };

  // MÉTHODE 1: Screenshot classique (rapide)
  const exportScreenshotPDF = async () => {
    console.log('📸 EXPORT SCREENSHOT');
    
    const canvasElement = document.querySelector('.konvajs-content')?.parentElement as HTMLElement;
    if (!canvasElement) throw new Error('Canvas non trouvé');

    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(canvasElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: options.includeBackground ? '#ffffff' : null
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    await createPDFFromImage(imgData, canvas.width, canvas.height, 'SCREENSHOT');
  };

  // MÉTHODE 2: Hybride - Screenshot haute résolution de la zone visible
  const exportHybridPDF = async () => {
    console.log('🎯 EXPORT HYBRIDE - Capture zone visible');
    
    // Étape 1: Capturer la zone actuellement visible du stage
    const stage = await findKonvaStage();
    if (!stage) throw new Error('Stage Konva introuvable');

    // Sauvegarder l'état actuel
    const originalScale = stage.scaleX();
    const originalPosition = stage.position();
    
    console.log(`📍 État actuel - Scale: ${originalScale.toFixed(2)}, Position: (${originalPosition.x.toFixed(0)}, ${originalPosition.y.toFixed(0)})`);

    try {
      // Calculer la zone visible actuelle
      const stageContainer = stage.container();
      const containerRect = stageContainer.getBoundingClientRect();
      
      // Dimensions du viewport visible
      const viewportWidth = containerRect.width;
      const viewportHeight = containerRect.height;
      
      // Calculer la zone du stage qui est actuellement visible
      const visibleX = -originalPosition.x / originalScale;
      const visibleY = -originalPosition.y / originalScale;
      const visibleWidth = viewportWidth / originalScale;
      const visibleHeight = viewportHeight / originalScale;
      
      console.log(`🔍 Zone visible: x=${visibleX.toFixed(0)}, y=${visibleY.toFixed(0)}, w=${visibleWidth.toFixed(0)}, h=${visibleHeight.toFixed(0)}`);
      
      // Capturer uniquement cette zone visible en haute résolution
      const highResScale = 3; // 3x résolution
      const captureDataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1.0,
        pixelRatio: highResScale,
        x: visibleX,
        y: visibleY,
        width: visibleWidth,
        height: visibleHeight
      });

      // Créer le PDF avec cette image
      await createCleanPDF(captureDataURL, visibleWidth * highResScale, visibleHeight * highResScale);

    } catch (error) {
      console.error('❌ Erreur capture zone visible:', error);
      throw error;
    }
  };

  // MÉTHODE 3: Ultra haute résolution de la zone visible
  const exportUltraHighResPDF = async () => {
    console.log('🚀 EXPORT ULTRA HAUTE RÉSOLUTION - Zone visible');
    
    const stage = await findKonvaStage();
    if (!stage) throw new Error('Stage Konva introuvable');

    // État actuel
    const originalScale = stage.scaleX();
    const originalPosition = stage.position();
    
    // Calculer zone visible
    const stageContainer = stage.container();
    const containerRect = stageContainer.getBoundingClientRect();
    
    const visibleX = -originalPosition.x / originalScale;
    const visibleY = -originalPosition.y / originalScale;
    const visibleWidth = containerRect.width / originalScale;
    const visibleHeight = containerRect.height / originalScale;

    // Capturer à résolution ultra (4x) de la zone visible
    const ultraDataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1.0,
      pixelRatio: 4,
      x: visibleX,
      y: visibleY,
      width: visibleWidth,
      height: visibleHeight
    });

    await createCleanPDF(ultraDataURL, visibleWidth * 4, visibleHeight * 4);
  };

  const findKonvaStage = async (): Promise<any> => {
    // Recherche robuste du stage
    let stage = null;
    
    // Méthode 1: Référence globale
    stage = (window as any).stageRef?.current;
    if (stage) {
      console.log('✅ Stage trouvé via référence globale');
      return stage;
    }
    
    // Méthode 2: DOM
    const stageElement = document.querySelector('.konvajs-content canvas') as any;
    if (stageElement && stageElement._konva_stage) {
      stage = stageElement._konva_stage;
      console.log('✅ Stage trouvé via DOM');
      return stage;
    }
    
    // Méthode 3: Konva global
    if ((window as any).Konva) {
      const stages = (window as any).Konva.stages;
      if (stages && stages.length > 0) {
        stage = stages[0];
        console.log('✅ Stage trouvé via Konva.stages');
        return stage;
      }
    }
    
    return null;
  };

  const createCleanPDF = async (imageData: string, imgWidth: number, imgHeight: number) => {
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize.toLowerCase(),
      compress: false
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Calculer les dimensions en conservant le ratio
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    const imgRatio = imgWidth / imgHeight;
    let finalWidth = availableWidth;
    let finalHeight = finalWidth / imgRatio;
    
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight;
      finalWidth = finalHeight * imgRatio;
    }
    
    const x = margin + (availableWidth - finalWidth) / 2;
    const y = margin + (availableHeight - finalHeight) / 2;
    
    // Ajouter l'image SANS connexions vectorielles parasites
    pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
    
    // Métadonnées
    pdf.setProperties({
      title: project.name || 'Plan électrique',
      subject: 'Plan électrique haute résolution - ElectriCAD AI',
      creator: 'ElectriCAD AI - Export propre',
      keywords: 'haute-résolution, électrique, plan, propre'
    });
    
    const methodName = options.quality === 'archive' ? 'ULTRA' : 'HYBRIDE';
    pdf.save(`${project.name || 'plan'}_${methodName}_${Date.now()}.pdf`);
    console.log(`✅ PDF ${methodName} propre généré`);
  };

  const createPDFFromImage = async (imageData: string, imgWidth: number, imgHeight: number, type: string) => {
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize.toLowerCase()
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    const imgRatio = imgWidth / imgHeight;
    let finalWidth = availableWidth;
    let finalHeight = finalWidth / imgRatio;
    
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight;
      finalWidth = finalHeight * imgRatio;
    }
    
    const x = margin + (availableWidth - finalWidth) / 2;
    const y = margin + (availableHeight - finalHeight) / 2;
    
    // En-tête
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Plan électrique - ${project.name}`, margin, margin - 5);
    
    // Image
    const format = imageData.includes('data:image/png') ? 'PNG' : 'JPEG';
    pdf.addImage(imageData, format, x, y, finalWidth, finalHeight, undefined, 'FAST');
    
    // Métadonnées
    pdf.setProperties({
      title: project.name || 'Plan électrique',
      subject: `Plan électrique ${type} - ElectriCAD AI`,
      creator: 'ElectriCAD AI',
      keywords: `${type.toLowerCase()}, électrique, plan`
    });
    
    pdf.save(`${project.name || 'plan'}_${type}_${Date.now()}.pdf`);
    console.log(`✅ PDF ${type} généré`);
  };

  const addVectorConnections = async (pdf: any, stage: any, pageWidth: number, pageHeight: number, margin: number) => {
    try {
      // Échelle pour mapper stage vers PDF
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      const scaleX = availableWidth / stageWidth;
      const scaleY = availableHeight / stageHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const offsetX = margin + (availableWidth - stageWidth * scale) / 2;
      const offsetY = margin + (availableHeight - stageHeight * scale) / 2;
      
      // Trouver les connexions
      const connections = stage.find('Line');
      
      pdf.setDrawColor('#0066CC'); // Bleu pour les connexions
      pdf.setLineWidth(0.5);
      
      for (const line of connections) {
        const points = line.points();
        if (points && points.length >= 4) {
          for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i] * scale + offsetX;
            const y1 = points[i + 1] * scale + offsetY;
            const x2 = points[i + 2] * scale + offsetX;
            const y2 = points[i + 3] * scale + offsetY;
            
            pdf.line(x1, y1, x2, y2);
          }
        }
      }
      
      console.log('🔗 Connexions vectorielles ajoutées');
    } catch (error) {
      console.log('⚠️ Erreur connexions vectorielles:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export HYBRIDE - Qualité optimale garantie
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quality Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mode d'export</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'high', icon: Monitor, label: 'Rapide', color: 'green' },
                { value: 'print', icon: Printer, label: 'ZONE 3x', color: 'blue' },
                { value: 'archive', icon: Archive, label: 'ZONE 4x', color: 'purple' }
              ].map(({ value, icon: Icon, label, color }) => {
                const config = qualitySettings[value as keyof typeof qualitySettings];
                const isSelected = options.quality === value;
                return (
                  <button
                    key={value}
                    onClick={() => setOptions(prev => ({ ...prev, quality: value as any }))}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/30`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? `text-${color}-500` : 'text-gray-400'
                    }`} />
                    <div className="font-bold text-gray-900 dark:text-white">{label}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {config.description}
                    </div>
                    {value !== 'high' && (
                      <div className="text-xs font-bold text-orange-600 mt-1">
                        🎯 GARANTI !
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {options.quality === 'high' && '📸 Screenshot classique'}
              {options.quality === 'print' && '🎯 Capture zone visible 3x'}
              {options.quality === 'archive' && '🚀 Capture zone visible 4x'}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {options.quality === 'high' && 'Capture d\'écran rapide avec html2canvas. Qualité correcte pour visualisation.'}
              {options.quality === 'print' && 'Capture de la zone actuellement visible en résolution 3x via Konva natif. Symboles parfaits, positions exactes.'}
              {options.quality === 'archive' && 'Capture ultra haute résolution (4x) de la zone visible. Qualité maximale pour impression professionnelle.'}
            </p>
          </div>

          {/* Paper Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format papier
              </label>
              <select
                value={options.paperSize}
                onChange={(e) => setOptions(prev => ({ ...prev, paperSize: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="A3">A3 (420×297mm)</option>
                <option value="A4">A4 (297×210mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orientation
              </label>
              <select
                value={options.orientation}
                onChange={(e) => setOptions(prev => ({ ...prev, orientation: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="landscape">Paysage</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          {/* Background Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeBackground"
              checked={options.includeBackground}
              onChange={(e) => setOptions(prev => ({ ...prev, includeBackground: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="includeBackground" className="text-sm text-gray-700 dark:text-gray-300">
              Inclure l'arrière-plan blanc
            </label>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg flex items-center space-x-3 ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
            }`}>
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </span>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Export en cours...</span>
                </>
              ) : (
                <>
                  <FileImage className="w-4 h-4" />
                  <span>Exporter en PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeExportDialog;