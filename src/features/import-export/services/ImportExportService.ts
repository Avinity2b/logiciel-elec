/**
 * Service Import/Export modernisé
 */

import { BaseService } from '../../../shared/services/BaseService';
import { Project, ExportOptions, ImportResult } from '../../../core/types';
import { IImportService, IExportService } from '../../../core/interfaces';
import { ValidationUtils } from '../../../shared/utils/validation';

export class ImportExportService extends BaseService implements IImportService, IExportService {
  private static instance: ImportExportService;

  private constructor() {
    super('ImportExportService');
  }

  static getInstance(): ImportExportService {
    if (!ImportExportService.instance) {
      ImportExportService.instance = new ImportExportService();
    }
    return ImportExportService.instance;
  }

  async initialize(): Promise<void> {
    this.log('Initializing import/export service');
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up import/export service');
    this.isInitialized = false;
  }

  // Implémentation IImportService
  async importFile(file: File): Promise<ImportResult> {
    try {
      this.log(`Importing file: ${file.name} (${file.type})`);
      
      // Validation du fichier
      ValidationUtils.validateImportFile(file);

      if (file.type === 'application/json') {
        return this.importJSON(file);
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        return this.importPlan(file);
      }

      throw new Error(`Type de fichier non supporté: ${file.type}`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      this.log(`Import failed: ${errorMsg}`, 'error');
      
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  async importProject(data: string): Promise<Project> {
    try {
      const parsed = JSON.parse(data);
      
      if (!ValidationUtils.validateProject(parsed)) {
        throw new Error('Format de projet invalide');
      }

      this.log(`Project imported: ${parsed.name}`);
      return parsed;

    } catch (error) {
      throw this.handleError(error, 'importProject');
    }
  }

  validateImport(data: any): boolean {
    return ValidationUtils.validateProject(data);
  }

  // Implémentation IExportService
  async exportProject(project: Project, options: ExportOptions): Promise<Blob> {
    try {
      this.log(`Exporting project: ${project.name} as ${options.format}`);

      switch (options.format) {
        case 'json':
          return this.exportToJSON(project);
        case 'pdf':
          return this.exportToPDF(project, options);
        case 'png':
        case 'jpg':
          return this.exportToImage(project, options);
        default:
          throw new Error(`Format d'export non supporté: ${options.format}`);
      }

    } catch (error) {
      throw this.handleError(error, 'exportProject');
    }
  }

  async exportToPDF(project: Project, options: ExportOptions): Promise<Blob> {
    // Réutiliser l'ancien système d'export PDF qui fonctionne
    const { exportPlan } = await import('../../../legacy/utils/planExporter');
    
    // Simuler un canvas pour l'export (à adapter selon les besoins)
    const mockStage = {
      toDataURL: () => 'data:image/png;base64,mock'
    };

    const settings = {
      format: 'pdf' as const,
      quality: options.quality || 300,
      includeBackground: true,
      includeConnections: options.showConnections
    };

    await exportPlan(mockStage, project, settings);
    
    // Retourner un blob vide pour l'instant (l'ancien système gère le téléchargement)
    return new Blob([''], { type: 'application/pdf' });
  }

  async exportToImage(project: Project, options: ExportOptions): Promise<Blob> {
    // Utiliser html2canvas pour l'export image
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Impossible de créer le contexte canvas');

    // Dessiner le fond
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner les éléments (simplifié)
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Projet: ${project.name}`, 20, 40);
    ctx.fillText(`Éléments: ${project.elements.length}`, 20, 70);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, `image/${options.format}`, options.quality || 0.9);
    });
  }

  async exportToJSON(project: Project): Promise<Blob> {
    const jsonData = JSON.stringify(project, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }

  // Méthodes privées
  private async importJSON(file: File): Promise<ImportResult> {
    const text = await file.text();
    const project = await this.importProject(text);
    
    return {
      success: true,
      data: project
    };
  }

  private async importPlan(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          success: true,
          data: result
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Erreur lors de la lecture du fichier'
        });
      };

      reader.readAsDataURL(file);
    });
  }
}