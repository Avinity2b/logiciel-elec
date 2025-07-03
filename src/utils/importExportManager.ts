import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Project } from '../types/electrical';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export interface ImportOptions {
  format: 'pdf' | 'jpg' | 'png';
  quality: 'low' | 'medium' | 'high';
  maxSize: number; // Max file size in MB
  autoResize: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'jpg' | 'png';
  quality: number; // 0.1 to 1.0 for JPG, ignored for PNG
  resolution: number; // DPI: 72 for web, 300 for print
  includeBackground: boolean;
  multiPage?: boolean; // For PDF only
  paperSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface ImportResult {
  success: boolean;
  data?: string | string[]; // Base64 data URL(s)
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

  /**
   * Import a file (PDF, JPG, PNG) and convert to usable format
   */
  async importFile(file: File, options: ImportOptions): Promise<ImportResult> {
    try {
      // Validate file
      const validation = this.validateImportFile(file, options);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Process based on file type
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
   * Import PDF file and extract pages as images
   */
  private async importPDF(file: File, options: ImportOptions): Promise<ImportResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      const pages: string[] = [];

      // Extract each page as image
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.getScaleForQuality(options.quality) });
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        
        // Apply resize if needed
        const processedDataUrl = options.autoResize 
          ? await this.resizeImage(dataUrl, options.targetWidth, options.targetHeight)
          : dataUrl;
          
        pages.push(processedDataUrl);
      }

      return {
        success: true,
        data: pageCount === 1 ? pages[0] : pages,
        metadata: {
          originalWidth: 0, // Will be set from first page
          originalHeight: 0,
          fileSize: file.size,
          pageCount: pageCount
        }
      };
    } catch (error) {
      console.error('PDF import error:', error);
      return { 
        success: false, 
        error: `Erreur lors de l'import PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  /**
   * Import image file (JPG, PNG)
   */
  private async importImage(file: File, options: ImportOptions): Promise<ImportResult> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Create canvas for processing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Determine final dimensions
          let { width, height } = this.calculateImageDimensions(
            img.width, 
            img.height, 
            options
          );
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and process image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Apply quality settings
          const quality = this.getQualityValue(options.quality);
          const format = options.format === 'png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, quality);
          
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
        }
      };
      
      img.onerror = () => {
        resolve({ 
          success: false, 
          error: 'Impossible de charger l\'image. Vérifiez que le fichier n\'est pas corrompu.' 
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // ==================== EXPORT METHODS ====================

  /**
   * Export project plan as PDF, JPG, or PNG
   */
  async exportPlan(
    project: Project, 
    canvasElement: HTMLElement, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(project, canvasElement, options);
        case 'jpg':
          return await this.exportToJPG(project, canvasElement, options);
        case 'png':
          return await this.exportToPNG(project, canvasElement, options);
        default:
          return { success: false, error: 'Format d\'export non supporté' };
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
   * Export to PDF with multiple pages support
   */
  private async exportToPDF(
    project: Project, 
    canvasElement: HTMLElement, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Capture canvas as high-resolution image
      const canvas = await html2canvas(canvasElement, {
        scale: options.resolution / 96, // Convert DPI to scale
        useCORS: true,
        allowTaint: true,
        backgroundColor: options.includeBackground ? '#ffffff' : null
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: options.paperSize?.toLowerCase() as any || 'a4'
      });

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = options.margins || { top: 10, right: 10, bottom: 10, left: 10 };
      
      const availableWidth = pdfWidth - margins.left - margins.right;
      const availableHeight = pdfHeight - margins.top - margins.bottom;

      // Calculate image dimensions to fit page
      const imgRatio = canvas.width / canvas.height;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * imgRatio;
      }

      // Center the image
      const x = margins.left + (availableWidth - imgWidth) / 2;
      const y = margins.top + (availableHeight - imgHeight) / 2;

      // Add header
      pdf.setFontSize(16);
      pdf.text(`Plan électrique - ${project.name}`, margins.left, margins.top - 5);

      // Add image
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      // Add footer with metadata
      pdf.setFontSize(8);
      pdf.text(
        `Généré le ${new Date().toLocaleDateString()} - ${project.elements.length} éléments`,
        margins.left,
        pdfHeight - 5
      );

      // Save file
      const fileName = `plan-electrique-${project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

      return {
        success: true,
        fileName: fileName,
        fileSize: pdf.output('blob').size
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  /**
   * Export to JPG
   */
  private async exportToJPG(
    project: Project, 
    canvasElement: HTMLElement, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const canvas = await html2canvas(canvasElement, {
        scale: options.resolution / 96,
        useCORS: true,
        allowTaint: true,
        backgroundColor: options.includeBackground ? '#ffffff' : '#ffffff' // JPG needs background
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `plan-electrique-${project.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
            saveAs(blob, fileName);
            resolve({
              success: true,
              fileName: fileName,
              fileSize: blob.size
            });
          } else {
            resolve({ success: false, error: 'Impossible de générer l\'image JPG' });
          }
        }, 'image/jpeg', options.quality);
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Erreur lors de l'export JPG: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  /**
   * Export to PNG
   */
  private async exportToPNG(
    project: Project, 
    canvasElement: HTMLElement, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const canvas = await html2canvas(canvasElement, {
        scale: options.resolution / 96,
        useCORS: true,
        allowTaint: true,
        backgroundColor: options.includeBackground ? '#ffffff' : null
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `plan-electrique-${project.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            saveAs(blob, fileName);
            resolve({
              success: true,
              fileName: fileName,
              fileSize: blob.size
            });
          } else {
            resolve({ success: false, error: 'Impossible de générer l\'image PNG' });
          }
        }, 'image/png');
      });
    } catch (error) {
      return { 
        success: false, 
        error: `Erreur lors de l'export PNG: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate import file
   */
  private validateImportFile(file: File, options: ImportOptions): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = options.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `Fichier trop volumineux. Taille maximum: ${options.maxSize}MB` 
      };
    }

    // Check file type
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

  /**
   * Calculate image dimensions based on options
   */
  private calculateImageDimensions(
    originalWidth: number, 
    originalHeight: number, 
    options: ImportOptions
  ): { width: number; height: number } {
    if (!options.autoResize) {
      return { width: originalWidth, height: originalHeight };
    }

    const targetWidth = options.targetWidth || 1920;
    const targetHeight = options.targetHeight || 1080;
    
    const aspectRatio = originalWidth / originalHeight;
    
    let width = targetWidth;
    let height = width / aspectRatio;
    
    if (height > targetHeight) {
      height = targetHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get scale factor based on quality setting
   */
  private getScaleForQuality(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 1.0;
      case 'medium': return 1.5;
      case 'high': return 2.0;
      default: return 1.5;
    }
  }

  /**
   * Get quality value for image compression
   */
  private getQualityValue(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 0.6;
      case 'medium': return 0.8;
      case 'high': return 0.95;
      default: return 0.8;
    }
  }

  /**
   * Resize image to target dimensions
   */
  private async resizeImage(
    dataUrl: string, 
    targetWidth?: number, 
    targetHeight?: number
  ): Promise<string> {
    if (!targetWidth && !targetHeight) return dataUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const { width, height } = this.calculateImageDimensions(
          img.width, 
          img.height, 
          { 
            autoResize: true, 
            targetWidth, 
            targetHeight,
            format: 'png',
            quality: 'medium',
            maxSize: 10
          }
        );
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.src = dataUrl;
    });
  }

  /**
   * Get supported file formats
   */
  getSupportedFormats(): { import: string[]; export: string[] } {
    return {
      import: ['pdf', 'jpg', 'jpeg', 'png'],
      export: ['pdf', 'jpg', 'png']
    };
  }

  /**
   * Get recommended settings for different use cases
   */
  getRecommendedSettings(useCase: 'web' | 'print' | 'archive'): { import: ImportOptions; export: ExportOptions } {
    const settings = {
      web: {
        import: {
          format: 'jpg' as const,
          quality: 'medium' as const,
          maxSize: 5,
          autoResize: true,
          targetWidth: 1920,
          targetHeight: 1080
        },
        export: {
          format: 'jpg' as const,
          quality: 0.8,
          resolution: 72,
          includeBackground: true,
          paperSize: 'A4' as const,
          orientation: 'landscape' as const
        }
      },
      print: {
        import: {
          format: 'png' as const,
          quality: 'high' as const,
          maxSize: 20,
          autoResize: false
        },
        export: {
          format: 'pdf' as const,
          quality: 1.0,
          resolution: 300,
          includeBackground: true,
          paperSize: 'A3' as const,
          orientation: 'landscape' as const,
          margins: { top: 15, right: 15, bottom: 15, left: 15 }
        }
      },
      archive: {
        import: {
          format: 'png' as const,
          quality: 'high' as const,
          maxSize: 50,
          autoResize: false
        },
        export: {
          format: 'png' as const,
          quality: 1.0,
          resolution: 300,
          includeBackground: true
        }
      }
    };

    return settings[useCase];
  }
}

// Export singleton instance
export const importExportManager = ImportExportManager.getInstance();