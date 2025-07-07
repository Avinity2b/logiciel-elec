import * as pdfjsLib from 'pdfjs-dist';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { Project } from '../types/project';

// Configuration PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ImportOptions {
  format: 'pdf' | 'jpg' | 'png';
  quality: 'low' | 'medium' | 'high';
  maxSize: number;
  autoResize: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'jpg' | 'png';
  quality: number;
  resolution: number;
  includeBackground: boolean;
  multiPage?: boolean;
  paperSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface ImportResult {
  success: boolean;
  data?: string | string[];
  error?: string;
  metadata?: {
    originalWidth: number;
    originalHeight: number;
    fileSize: number;
    pageCount?: number;
  };
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
  fileSize?: number;
}

export class ImportExportManager {
  private static instance: ImportExportManager;
  
  public static getInstance(): ImportExportManager {
    if (!ImportExportManager.instance) {
      ImportExportManager.instance = new ImportExportManager();
    }
    return ImportExportManager.instance;
  }

  // ==================== IMPORT METHODS ====================

  async importFile(file: File, options: ImportOptions): Promise<ImportResult> {
    try {
      const validation = this.validateImportFile(file, options);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      switch (options.format) {
        case 'pdf':
          return await this.importPDF(file, options);
        case 'jpg':
        case 'png':
          return await this.importImage(file, options);
        default:
          return { success: false, error: 'Format de fichier non supporté' };
      }
    } catch (error) {
      console.error('Import error:', error);
      return { 
        success: false, 
        error: `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  /**
   * Import PDF avec HAUTE RÉSOLUTION pour éviter le flou au zoom
   */
  private async importPDF(file: File, options: ImportOptions): Promise<ImportResult> {
    try {
      console.log('Import PDF haute résolution:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 0,
          disableFontFace: true,
          disableRange: true,
          disableStream: true,
          disableAutoFetch: true,
          disableCreateObjectURL: true,
          maxImageSize: 10485760, // 10MB pour meilleure qualité
          cMapPacked: false,
          stopAtErrors: true
        });

        const pdf = await loadingTask.promise;
        console.log('PDF chargé, pages:', pdf.numPages);

        const page = await pdf.getPage(1);
        
        // CORRECTION : Utiliser une TRÈS HAUTE RÉSOLUTION pour éviter le flou
        let scale = this.getHighResolutionScale(options.quality);
        let viewport = page.getViewport({ scale });
        
        // Si autoResize est activé, ajuster l'échelle mais maintenir la haute résolution
        if (options.autoResize && (options.targetWidth || options.targetHeight)) {
          const targetWidth = options.targetWidth || 1920;
          const targetHeight = options.targetHeight || 1080;
          
          // Calculer l'échelle de base pour les dimensions cibles
          const baseScaleX = targetWidth / (viewport.width / scale);
          const baseScaleY = targetHeight / (viewport.height / scale);
          const baseScale = Math.min(baseScaleX, baseScaleY);
          
          // Appliquer l'échelle de base + facteur haute résolution
          scale = baseScale * this.getHighResolutionScale(options.quality);
          scale = Math.max(1.0, Math.min(scale, 8.0)); // Limites plus élevées
          
          viewport = page.getViewport({ scale });
        } else {
          // Si pas d'autoResize, adapter l'échelle selon la qualité demandée
          const qualityScale = this.getScaleForQuality(options.quality);
          scale = qualityScale;
          viewport = page.getViewport({ scale });
        }

        console.log(`Échelle haute résolution: ${scale}, Dimensions: ${viewport.width}x${viewport.height}`);

        // Utiliser un canvas avec des paramètres optimisés pour la netteté
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        
        // Configuration du canvas pour la meilleure qualité
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Optimiser le contexte pour la netteté
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // Rendu avec paramètres optimisés
        await page.render({
          canvasContext: context,
          viewport: viewport,
          // Paramètres additionnels pour la qualité
          intent: 'display',
          renderInteractiveForms: false,
          transform: null,
          background: 'white'
        }).promise;

        // Export avec qualité maximale pour PNG
        const qualityValue = options.quality === 'high' ? 1.0 : 
                           options.quality === 'medium' ? 0.95 : 0.9;
        const dataUrl = canvas.toDataURL('image/png', qualityValue);
        
        // Nettoyer
        page.cleanup();
        await pdf.destroy();

        return {
          success: true,
          data: dataUrl,
          metadata: {
            originalWidth: viewport.width,
            originalHeight: viewport.height,
            fileSize: file.size,
            pageCount: pdf.numPages
          }
        };

      } catch (pdfError) {
        console.error('Erreur PDF.js:', pdfError);
        return await this.importPDFAlternative(file, options);
      }

    } catch (error) {
      console.error('Erreur import PDF:', error);
      return { 
        success: false, 
        error: 'Erreur lors de l\'import PDF. Essayez de convertir le PDF en image JPG/PNG.'
      };
    }
  }

  /**
   * Méthode alternative pour l'import PDF avec haute résolution
   */
  private async importPDFAlternative(file: File, options: ImportOptions): Promise<ImportResult> {
    try {
      console.log('Import PDF alternatif haute résolution');
      
      const fileUrl = URL.createObjectURL(file);
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          verbosity: 0
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        // Utiliser une échelle encore plus élevée pour la méthode alternative
        const scale = this.getHighResolutionScale(options.quality) * 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Configuration optimale du contexte
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
          intent: 'display',
          background: 'white'
        }).promise;
        
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Nettoyer
        URL.revokeObjectURL(fileUrl);
        page.cleanup();
        await pdf.destroy();
        
        return {
          success: true,
          data: dataUrl,
          metadata: {
            originalWidth: viewport.width,
            originalHeight: viewport.height,
            fileSize: file.size,
            pageCount: pdf.numPages
          }
        };
        
      } finally {
        URL.revokeObjectURL(fileUrl);
      }
      
    } catch (error) {
      console.error('Erreur méthode alternative PDF:', error);
      return { 
        success: false, 
        error: `Erreur lors de l'import PDF alternatif: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  private async importImage(file: File, options: ImportOptions): Promise<ImportResult> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Pour les images aussi, utiliser une meilleure résolution
          const dimensions = this.calculateImageDimensions(img.width, img.height, options);
          
          // Appliquer un facteur de sur-échantillonnage pour les images
          const superSamplingFactor = options.quality === 'high' ? 2.0 : 
                                     options.quality === 'medium' ? 1.5 : 1.0;
          
          canvas.width = dimensions.width * superSamplingFactor;
          canvas.height = dimensions.height * superSamplingFactor;
          
          // Configuration pour la meilleure qualité
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Dessiner l'image avec la résolution augmentée
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const qualityValue = this.getQualityValue(options.quality);
          const format = options.format === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, qualityValue);
          
          resolve({
            success: true,
            data: dataUrl,
            metadata: {
              originalWidth: img.width,
              originalHeight: img.height,
              fileSize: file.size
            }
          });
        } catch (error) {
          resolve({ 
            success: false, 
            error: `Erreur lors du traitement de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
          });
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ success: false, error: 'Impossible de charger l\'image' });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // ==================== EXPORT METHODS ====================

  async exportPlan(project: Project, canvasElement: HTMLElement, options: ExportOptions): Promise<ExportResult> {
    try {
      // Essayer d'abord l'export Konva direct, puis fallback vers html2canvas
      const stage = (window as any).stageRef?.current;
      
      if (stage) {
        // Méthode Konva directe (recommandée)
        return await this.exportWithKonva(project, stage, options);
      } else {
        // Fallback vers html2canvas
        return await this.exportWithHtml2Canvas(project, canvasElement, options);
      }
    } catch (error) {
      console.error('Export error:', error);
      return { 
        success: false, 
        error: `Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  /**
   * Export direct avec Konva (méthode recommandée)
   */
  private async exportWithKonva(project: Project, stage: any, options: ExportOptions): Promise<ExportResult> {
    try {
      console.log('Export avec Konva direct...');
      
      // Obtenir les dimensions du stage
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      
      // Calculer le facteur d'échelle pour la qualité
      const scaleFactor = Math.max(1, options.resolution / 96);
      
      // Export avec Konva
      const dataURL = stage.toDataURL({
        mimeType: options.format === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: options.quality,
        pixelRatio: scaleFactor, // Facteur de qualité
        width: stageWidth,
        height: stageHeight
      });

      switch (options.format) {
        case 'pdf':
          return await this.createPDFFromDataURL(dataURL, project, options, stageWidth * scaleFactor, stageHeight * scaleFactor);
        case 'jpg':
        case 'png':
          return await this.saveImageFromDataURL(dataURL, project, options);
        default:
          return { success: false, error: 'Format d\'export non supporté' };
      }
      
    } catch (error) {
      console.error('Erreur export Konva:', error);
      throw error;
    }
  }

  /**
   * Export fallback avec html2canvas
   */
  private async exportWithHtml2Canvas(project: Project, canvasElement: HTMLElement, options: ExportOptions): Promise<ExportResult> {
    try {
      console.log('Export avec html2canvas (fallback)...');
      
      // Trouver le canvas Konva spécifiquement
      const konvaCanvas = canvasElement.querySelector('canvas');
      if (!konvaCanvas) {
        throw new Error('Canvas Konva non trouvé');
      }

      // Configuration optimisée pour Konva
      const canvas = await html2canvas(canvasElement, {
        scale: Math.max(1, options.resolution / 96),
        useCORS: true,
        allowTaint: true,
        backgroundColor: options.includeBackground ? '#ffffff' : null,
        logging: false,
        imageTimeout: 30000,
        removeContainer: true,
        foreignObjectRendering: false, // Important pour Konva
        canvas: konvaCanvas, // Utiliser le canvas Konva directement
        width: canvasElement.offsetWidth,
        height: canvasElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });

      const dataURL = canvas.toDataURL(
        options.format === 'jpg' ? 'image/jpeg' : 'image/png',
        options.quality
      );

      switch (options.format) {
        case 'pdf':
          return await this.createPDFFromDataURL(dataURL, project, options, canvas.width, canvas.height);
        case 'jpg':
        case 'png':
          return await this.saveImageFromDataURL(dataURL, project, options);
        default:
          return { success: false, error: 'Format d\'export non supporté' };
      }
      
    } catch (error) {
      console.error('Erreur export html2canvas:', error);
      throw error;
    }
  }

  /**
   * Créer PDF à partir d'un DataURL
   */
  private async createPDFFromDataURL(dataURL: string, project: Project, options: ExportOptions, imgWidth: number, imgHeight: number): Promise<ExportResult> {
    try {
      const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: options.paperSize?.toLowerCase() as any || 'a3',
        compress: false,
        precision: 16
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = options.margins || { top: 15, right: 15, bottom: 15, left: 15 };
      
      const availableWidth = pdfWidth - margins.left - margins.right;
      const availableHeight = pdfHeight - margins.top - margins.bottom;

      // Calculer les dimensions optimales
      const imgRatio = imgWidth / imgHeight;
      let finalWidth = availableWidth;
      let finalHeight = finalWidth / imgRatio;

      if (finalHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = finalHeight * imgRatio;
      }

      const x = margins.left + (availableWidth - finalWidth) / 2;
      const y = margins.top + (availableHeight - finalHeight) / 2;

      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Plan électrique - ${project.name}`, margins.left, margins.top - 5);

      // Image
      pdf.addImage(dataURL, options.format === 'jpg' ? 'JPEG' : 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

      // Footer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const footerY = pdfHeight - 5;
      pdf.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} - ${project.elements.length} éléments électriques`,
        margins.left,
        footerY
      );
      
      pdf.text(
        `Résolution: ${options.resolution} DPI - Qualité: ${Math.round(options.quality * 100)}%`,
        margins.left,
        footerY - 3
      );

      const fileName = `plan-electrique-${project.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      pdf.save(fileName);

      return {
        success: true,
        fileName: fileName,
        fileSize: pdf.output('blob').size
      };
    } catch (error) {
      throw new Error(`Erreur création PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Sauvegarder image à partir d'un DataURL
   */
  private async saveImageFromDataURL(dataURL: string, project: Project, options: ExportOptions): Promise<ExportResult> {
    try {
      return new Promise((resolve) => {
        // Convertir dataURL en blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Dessiner l'image
          if (options.format === 'jpg' && options.includeBackground) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const extension = options.format === 'png' ? 'png' : 'jpg';
              const fileName = `plan-electrique-${project.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${extension}`;
              saveAs(blob, fileName);
              resolve({
                success: true,
                fileName: fileName,
                fileSize: blob.size
              });
            } else {
              resolve({ success: false, error: `Impossible de générer l'image ${options.format.toUpperCase()}` });
            }
          }, `image/${options.format}`, options.quality);
        };
        
        img.onerror = () => {
          resolve({ success: false, error: 'Erreur lors du traitement de l\'image' });
        };
        
        img.src = dataURL;
      });
    } catch (error) {
      throw new Error(`Erreur sauvegarde image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  private validateImportFile(file: File, options: ImportOptions): { valid: boolean; error?: string } {
    const maxSizeBytes = options.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `Fichier trop volumineux. Taille maximum: ${options.maxSize}MB` 
      };
    }

    const allowedTypes = {
      pdf: ['application/pdf'],
      jpg: ['image/jpeg', 'image/jpg'],
      png: ['image/png']
    };

    const validTypes = allowedTypes[options.format];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Type de fichier invalide. Attendu: ${validTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  private calculateImageDimensions(originalWidth: number, originalHeight: number, options: ImportOptions): { width: number; height: number } {
    if (!options.autoResize) {
      return { width: originalWidth, height: originalHeight };
    }

    const targetWidth = options.targetWidth || 1920;
    const targetHeight = options.targetHeight || 1080;
    const aspectRatio = originalWidth / originalHeight;
    
    // CORRECTION : Préserver le ratio d'aspect correctement
    let width = targetWidth;
    let height = width / aspectRatio;
    
    if (height > targetHeight) {
      height = targetHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * NOUVELLE MÉTHODE : Échelles haute résolution pour éviter le flou
   */
  private getHighResolutionScale(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 2.0;      // 2x la résolution normale
      case 'medium': return 3.0;   // 3x la résolution normale  
      case 'high': return 4.0;     // 4x la résolution normale pour qualité maximale
      default: return 3.0;
    }
  }

  private getScaleForQuality(quality: 'low' | 'medium' | 'high'): number {
    // Échelles augmentées pour toutes les qualités
    switch (quality) {
      case 'low': return 1.5;      
      case 'medium': return 2.0;   
      case 'high': return 2.5;     
      default: return 2.0;
    }
  }

  private getQualityValue(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 0.8;      // Augmenté de 0.6 à 0.8
      case 'medium': return 0.95;  // Augmenté de 0.8 à 0.95
      case 'high': return 1.0;     // Qualité maximale
      default: return 0.95;
    }
  }

  private async resizeImage(dataUrl: string, targetWidth?: number, targetHeight?: number): Promise<string> {
    if (!targetWidth && !targetHeight) return dataUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const aspectRatio = img.width / img.height;
        let newWidth = targetWidth || (targetHeight! * aspectRatio);
        let newHeight = targetHeight || (targetWidth! / aspectRatio);
        
        // CORRECTION : S'assurer que les deux dimensions respectent les limites
        if (targetWidth && targetHeight) {
          const scaleX = targetWidth / img.width;
          const scaleY = targetHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          newWidth = img.width * scale;
          newHeight = img.height * scale;
        }
        
        canvas.width = Math.round(newWidth);
        canvas.height = Math.round(newHeight);
        
        // Configuration optimale pour le redimensionnement
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        resolve(canvas.toDataURL('image/png', 1.0)); // Qualité maximale
      };
      
      img.src = dataUrl;
    });
  }
}

// Export singleton instance
export const importExportManager = ImportExportManager.getInstance();