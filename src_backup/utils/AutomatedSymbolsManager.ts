// src/utils/AutomatedSymbolsManager.ts
import { ElectricalSymbol } from '../types/symbols';
import { ELECTRICAL_SYMBOLS } from '../data/symbolsDatabase';

// Configuration Supabase
const SUPABASE_URL = 'https://vmmkdqfmcbbmnnvwxbpa.supabase.co';
const STORAGE_PATH = '/storage/v1/object/public/symboles-svg';

interface SupabaseFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

class AutomatedSymbolsManager {
  private static instance: AutomatedSymbolsManager;
  private cachedSymbols: ElectricalSymbol[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private isLoading = false;

  public static getInstance(): AutomatedSymbolsManager {
    if (!AutomatedSymbolsManager.instance) {
      AutomatedSymbolsManager.instance = new AutomatedSymbolsManager();
    }
    return AutomatedSymbolsManager.instance;
  }

  /**
   * 🔄 FONCTION PRINCIPALE - Compatible avec l'existant
   * Remplace getSymbolsByCategory() mais garde la même interface
   */
  public async getSymbolsByCategory(): Promise<Record<string, ElectricalSymbol[]>> {
    const symbols = await this.getAllSymbols();
    
    return symbols.reduce((acc, symbol) => {
      if (!acc[symbol.category]) {
        acc[symbol.category] = [];
      }
      acc[symbol.category].push(symbol);
      return acc;
    }, {} as Record<string, ElectricalSymbol[]>);
  }

  /**
   * 🔍 FONCTION PRINCIPALE - Compatible avec l'existant  
   * Remplace getSymbolById() mais garde la même interface
   */
  public async getSymbolById(id: string): Promise<ElectricalSymbol | undefined> {
    const symbols = await this.getAllSymbols();
    return symbols.find(symbol => symbol.id === id);
  }

  /**
   * 📦 Récupère tous les symboles (statiques + dynamiques)
   */
  private async getAllSymbols(): Promise<ElectricalSymbol[]> {
    // Si le cache est encore valide, le retourner
    if (this.isCacheValid()) {
      return this.cachedSymbols;
    }

    // Si déjà en cours de chargement, retourner les symboles statiques
    if (this.isLoading) {
      return ELECTRICAL_SYMBOLS;
    }

    try {
      this.isLoading = true;
      
      // 1. Commencer avec les symboles statiques (SÉCURITÉ)
      const staticSymbols = [...ELECTRICAL_SYMBOLS];
      
      // 2. Tenter de charger les symboles dynamiques
      const dynamicSymbols = await this.loadDynamicSymbols();
      
      // 3. Fusionner intelligemment (statiques prioritaires)
      const mergedSymbols = this.mergeSymbols(staticSymbols, dynamicSymbols);
      
      // 4. Mettre en cache
      this.cachedSymbols = mergedSymbols;
      this.lastCacheUpdate = Date.now();
      
      console.log(`✅ Symboles chargés: ${staticSymbols.length} statiques + ${dynamicSymbols.length} dynamiques = ${mergedSymbols.length} total`);
      
      return mergedSymbols;
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement dynamique, utilisation des symboles statiques:', error);
      return ELECTRICAL_SYMBOLS; // FALLBACK SÉCURISÉ
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 🔄 Charge les nouveaux symboles depuis Supabase
   */
  private async loadDynamicSymbols(): Promise<ElectricalSymbol[]> {
    const dynamicSymbols: ElectricalSymbol[] = [];
    const categories = ['Prises', 'Commandes', 'Lumieres', 'Divers'];

    for (const category of categories) {
      try {
        const files = await this.fetchFilesFromCategory(category);
        
        for (const file of files) {
          if (file.name.toLowerCase().endsWith('.svg')) {
            // Vérifier si ce symbole existe déjà dans les statiques
            const fileName = file.name.replace('.svg', '');
            const id = this.generateId(fileName);
            
            // Skip si déjà défini dans les symboles statiques
            if (ELECTRICAL_SYMBOLS.find(s => s.id === id)) {
              continue;
            }
            
            const symbol = this.createSymbolFromFile(file, category);
            dynamicSymbols.push(symbol);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erreur chargement catégorie ${category}:`, error);
        // Continuer avec les autres catégories
      }
    }

    return dynamicSymbols;
  }

  /**
   * 🔗 Fusionne les symboles statiques et dynamiques
   */
  private mergeSymbols(staticSymbols: ElectricalSymbol[], dynamicSymbols: ElectricalSymbol[]): ElectricalSymbol[] {
    const merged = [...staticSymbols];
    
    // Ajouter seulement les nouveaux symboles dynamiques
    for (const dynamicSymbol of dynamicSymbols) {
      if (!merged.find(s => s.id === dynamicSymbol.id)) {
        merged.push({
          ...dynamicSymbol,
          // Marquer comme dynamique pour l'admin
          _isDynamic: true
        } as ElectricalSymbol);
      }
    }
    
    return merged;
  }

  /**
   * 📁 Récupère les fichiers d'une catégorie Supabase
   */
  private async fetchFilesFromCategory(category: string): Promise<SupabaseFile[]> {
    const url = `${SUPABASE_URL}/storage/v1/object/list/symboles-svg/${category}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} pour ${category}`);
    }

    return await response.json();
  }

  /**
   * 🏗️ Crée un symbole depuis un fichier Supabase
   */
  private createSymbolFromFile(file: SupabaseFile, category: string): ElectricalSymbol {
    const fileName = file.name.replace('.svg', '');
    const id = this.generateId(fileName);
    
    return {
      id,
      name: this.formatDisplayName(fileName),
      category: category as any,
      svgUrl: `${SUPABASE_URL}${STORAGE_PATH}/${category}/${encodeURIComponent(file.name)}`,
      elementType: this.guessElementType(fileName, category),
      properties: this.guessProperties(fileName, category)
    };
  }

  /**
   * 🆔 Génère un ID unique et valide
   */
  private generateId(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 📝 Formate le nom d'affichage
   */
  private formatDisplayName(fileName: string): string {
    return fileName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * 🔍 Devine le type d'élément (logique intelligente)
   */
  private guessElementType(fileName: string, category: string): string {
    const name = fileName.toLowerCase();
    
    if (category === 'Prises') {
      if (name.includes('20a')) return 'socket_20a';
      if (name.includes('32a')) return 'socket_32a';
      if (name.includes('double')) return 'outlet_double';
      if (name.includes('triple')) return 'outlet_triple';
      if (name.includes('haute')) return 'outlet_high';
      if (name.includes('cable') || name.includes('sortie')) return 'cable_outlet_16a';
      if (name.includes('etanche') || name.includes('ip')) return 'outlet_weatherproof';
      return 'outlet_16a';
    }
    
    if (category === 'Commandes') {
      if (name.includes('poussoir')) return name.includes('voyant') ? 'push_button_pilot' : 'push_button';
      if (name.includes('variateur')) return 'switch_dimmer';
      if (name.includes('detecteur')) return 'motion_detector';
      if (name.includes('double')) return name.includes('voyant') ? 'switch_double_pilot' : 'switch_double';
      if (name.includes('va-et-vient')) return name.includes('voyant') ? 'switch_va_et_vient_pilot' : 'switch_va_et_vient';
      return name.includes('voyant') ? 'switch_pilot' : 'switch';
    }
    
    if (category === 'Lumieres') {
      if (name.includes('dcl')) return name.includes('applique') ? 'dcl_applique' : 'dcl';
      if (name.includes('spot')) return 'spot';
      if (name.includes('reglette') || name.includes('led')) return 'led_strip';
      if (name.includes('projecteur')) return 'led_projector';
      return 'dcl';
    }
    
    // Divers
    if (name.includes('clim')) return 'socket_32a';
    if (name.includes('interphone')) return 'interphone';
    if (name.includes('tableau') || name.includes('tgbt')) return 'tgbt';
    
    return 'unknown';
  }

  /**
   * ⚡ Devine les propriétés électriques
   */
  private guessProperties(fileName: string, category: string): Record<string, any> {
    const name = fileName.toLowerCase();
    const props: Record<string, any> = {};
    
    if (category === 'Prises') {
      if (name.includes('20a')) {
        props.power = 4600;
        props.amperage = 20;
      } else if (name.includes('32a')) {
        props.power = 7360;
        props.amperage = 32;
      } else {
        props.power = 2500;
        props.amperage = 16;
      }
      props.voltage = 230;
      
      if (name.includes('etanche') || name.includes('ip')) {
        props.protection = 'IP44';
        props.outdoor = true;
      }
    }
    
    if (category === 'Lumieres') {
      props.power = name.includes('projecteur') ? 150 : 100;
      props.voltage = 230;
      props.type = name.includes('led') ? 'LED' : 'standard';
    }
    
    return props;
  }

  /**
   * ⏰ Vérifie si le cache est encore valide
   */
  private isCacheValid(): boolean {
    return (
      this.cachedSymbols.length > 0 && 
      (Date.now() - this.lastCacheUpdate) < this.CACHE_DURATION
    );
  }

  /**
   * 🗑️ Force le rafraîchissement du cache
   */
  public async forceRefresh(): Promise<void> {
    this.lastCacheUpdate = 0;
    this.cachedSymbols = [];
    await this.getAllSymbols();
  }
}

// Export singleton
export const symbolsManager = AutomatedSymbolsManager.getInstance();

// 🔄 FONCTIONS COMPATIBLES (remplacent celles de symbolsDatabase.ts)
export async function getSymbolsByCategory(): Promise<Record<string, ElectricalSymbol[]>> {
  return await symbolsManager.getSymbolsByCategory();
}

export async function getSymbolById(id: string): Promise<ElectricalSymbol | undefined> {
  return await symbolsManager.getSymbolById(id);
}

// 🔄 VERSIONS SYNCHRONES (fallback pour la compatibilité)
export function getSymbolsByCategorySync(): Record<string, ElectricalSymbol[]> {
  return ELECTRICAL_SYMBOLS.reduce((acc, symbol) => {
    if (!acc[symbol.category]) {
      acc[symbol.category] = [];
    }
    acc[symbol.category].push(symbol);
    return acc;
  }, {} as Record<string, ElectricalSymbol[]>);
}

export function getSymbolByIdSync(id: string): ElectricalSymbol | undefined {
  return ELECTRICAL_SYMBOLS.find(symbol => symbol.id === id);
}