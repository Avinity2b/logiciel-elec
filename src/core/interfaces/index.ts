/**
 * Export centralisé des interfaces
 */

export * from './services';
export * from './components';

// Interface principale de l'application
export interface IApplication {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  getVersion(): string;
  isReady(): boolean;
}

// Interface pour les plugins/extensions
export interface IPlugin {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  isActive(): boolean;
}

// Interface pour les hooks
export interface IHookManager {
  registerHook(name: string, callback: Function): void;
  executeHook(name: string, ...args: any[]): Promise<any[]>;
  removeHook(name: string, callback: Function): void;
}