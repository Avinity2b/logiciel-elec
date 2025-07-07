/**
 * Service de gestion des feature flags
 */

import { BaseService } from './BaseService';
import { FEATURES, FeatureFlag, isFeatureEnabled } from '../../core/config';

export class FeatureService extends BaseService {
  private static instance: FeatureService;
  private features: Record<FeatureFlag, boolean>;

  private constructor() {
    super('FeatureService');
    this.features = { ...FEATURES };
  }

  static getInstance(): FeatureService {
    if (!FeatureService.instance) {
      FeatureService.instance = new FeatureService();
    }
    return FeatureService.instance;
  }

  async initialize(): Promise<void> {
    this.log('Initializing feature service');
    // Charger la configuration depuis le stockage local si nécessaire
    const savedFeatures = localStorage.getItem('electricad_features');
    if (savedFeatures) {
      try {
        const parsed = JSON.parse(savedFeatures);
        this.features = { ...this.features, ...parsed };
      } catch (error) {
        this.log('Failed to load saved features', 'warn');
      }
    }
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up feature service');
    this.isInitialized = false;
  }

  isEnabled(feature: FeatureFlag): boolean {
    return this.features[feature];
  }

  enable(feature: FeatureFlag): void {
    this.features[feature] = true;
    this.saveFeatures();
    this.log(`Enabled feature: ${feature}`);
  }

  disable(feature: FeatureFlag): void {
    this.features[feature] = false;
    this.saveFeatures();
    this.log(`Disabled feature: ${feature}`);
  }

  toggle(feature: FeatureFlag): boolean {
    const newState = !this.features[feature];
    this.features[feature] = newState;
    this.saveFeatures();
    this.log(`Toggled feature ${feature}: ${newState}`);
    return newState;
  }

  getAllFeatures(): Record<FeatureFlag, boolean> {
    return { ...this.features };
  }

  resetToDefaults(): void {
    this.features = { ...FEATURES };
    this.saveFeatures();
    this.log('Reset all features to defaults');
  }

  private saveFeatures(): void {
    try {
      localStorage.setItem('electricad_features', JSON.stringify(this.features));
    } catch (error) {
      this.log('Failed to save features', 'warn');
    }
  }
}