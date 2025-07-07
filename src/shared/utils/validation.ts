/**
 * Utilitaires de validation
 */

import { ElectricalElement, Circuit, Project } from '../../core/types';

export class ValidationUtils {
  /**
   * Valider un élément électrique
   */
  static validateElectricalElement(element: any): element is ElectricalElement {
    return (
      typeof element === 'object' &&
      typeof element.id === 'string' &&
      typeof element.type === 'string' &&
      typeof element.position === 'object' &&
      typeof element.position.x === 'number' &&
      typeof element.position.y === 'number' &&
      typeof element.power === 'number' &&
      typeof element.voltage === 'number'
    );
  }

  /**
   * Valider un projet complet
   */
  static validateProject(project: any): project is Project {
    return (
      typeof project === 'object' &&
      typeof project.id === 'string' &&
      typeof project.name === 'string' &&
      Array.isArray(project.elements) &&
      Array.isArray(project.circuits) &&
      Array.isArray(project.connections) &&
      project.elements.every(this.validateElectricalElement)
    );
  }

  /**
   * Valider un fichier d'import
   */
  static validateImportFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB (max: 50MB)`);
    }

    return true;
  }

  /**
   * Sanitiser une chaîne de caractères
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Retirer les balises potentielles
      .trim()
      .substring(0, 255); // Limiter la longueur
  }

  /**
   * Valider un ID
   */
  static validateId(id: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 50;
  }
}