export interface ElectricalSymbol {
  id: string;
  name: string;
  category: 'Commandes' | 'Prises' | 'Lumières' | 'Divers';
  svgUrl: string;
  elementType: string;
  properties?: Record<string, any>;
}

export interface SymbolCategory {
  name: string;
  symbols: ElectricalSymbol[];
  expanded: boolean;
}