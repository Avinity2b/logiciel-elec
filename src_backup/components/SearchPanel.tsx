import React, { useState, useCallback } from 'react';
import { Search, MapPin, Zap, Lightbulb, Plug, X } from 'lucide-react';
import { ElectricalElement, Project } from '../types/electrical';

interface SearchPanelProps {
  project: Project;
  onElementFound: (elementId: string) => void;
  onClose: () => void;
}

interface SearchResult {
  element: ElectricalElement;
  circuit?: string;
  matches: string[];
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  project,
  onElementFound,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'outlets' | 'lighting' | 'switches'>('all');

  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const searchLower = term.toLowerCase();

    project.elements.forEach(element => {
      const matches: string[] = [];
      
      // Search by type
      if (element.type.toLowerCase().includes(searchLower)) {
        matches.push(`Type: ${element.type}`);
      }
      
      // Search by properties
      Object.entries(element.properties).forEach(([key, value]) => {
        if (value && value.toString().toLowerCase().includes(searchLower)) {
          matches.push(`${key}: ${value}`);
        }
      });
      
      // Search by circuit
      const circuit = project.calculations?.circuits.find(c => c.elements.includes(element.id));
      if (circuit && circuit.name.toLowerCase().includes(searchLower)) {
        matches.push(`Circuit: ${circuit.name}`);
      }
      
      // Search by ID
      if (element.id.toLowerCase().includes(searchLower)) {
        matches.push(`ID: ${element.id}`);
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        const isOutlet = ['outlet', 'socket_20a', 'socket_20a_spe', 'socket_32a', 'cable_outlet_16a', 'cable_outlet_20a', 'cable_outlet_32a'].includes(element.type);
        const isLighting = ['dcl', 'dcl_motion', 'spot', 'applique', 'applique_motion'].includes(element.type);
        const isSwitch = ['switch', 'switch_double', 'switch_dimmer', 'motion_detector'].includes(element.type);
        
        if (selectedCategory === 'outlets' && !isOutlet) return;
        if (selectedCategory === 'lighting' && !isLighting) return;
        if (selectedCategory === 'switches' && !isSwitch) return;
      }

      if (matches.length > 0) {
        results.push({
          element,
          circuit: circuit?.name,
          matches
        });
      }
    });

    setSearchResults(results);
  }, [project, selectedCategory]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    performSearch(term);
  };

  const getElementIcon = (type: string) => {
    if (['outlet', 'socket_20a', 'socket_20a_spe', 'socket_32a', 'cable_outlet_16a', 'cable_outlet_20a', 'cable_outlet_32a'].includes(type)) {
      return <Plug className="w-4 h-4 text-blue-400" />;
    }
    if (['dcl', 'dcl_motion', 'spot', 'applique', 'applique_motion'].includes(type)) {
      return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    }
    if (['switch', 'switch_double', 'switch_dimmer', 'motion_detector'].includes(type)) {
      return <Zap className="w-4 h-4 text-green-400" />;
    }
    return <MapPin className="w-4 h-4 text-gray-400" />;
  };

  const getElementLabel = (type: string) => {
    const labels: Record<string, string> = {
      outlet: 'Prise 16A',
      socket_20a: 'Prise 20A',
      socket_20a_spe: 'Prise 20A Spé',
      socket_32a: 'Prise 32A',
      cable_outlet_16a: 'SC 16A',
      cable_outlet_20a: 'SC CE 20A',
      cable_outlet_32a: 'SC 32A',
      dcl: 'DCL',
      dcl_motion: 'DCL Détection',
      spot: 'Spot',
      applique: 'Applique',
      applique_motion: 'Applique Détection',
      switch: 'Interrupteur',
      switch_double: 'Inter. Double',
      switch_dimmer: 'Variateur',
      motion_detector: 'Détecteur Mvt'
    };
    return labels[type] || type;
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300">Recherche</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un élément..."
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
          autoFocus
        />
      </div>

      {/* Category filter */}
      <div className="mb-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 rounded text-xs ${
              selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setSelectedCategory('outlets')}
            className={`px-2 py-1 rounded text-xs ${
              selectedCategory === 'outlets' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Prises
          </button>
          <button
            onClick={() => setSelectedCategory('lighting')}
            className={`px-2 py-1 rounded text-xs ${
              selectedCategory === 'lighting' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Éclairage
          </button>
          <button
            onClick={() => setSelectedCategory('switches')}
            className={`px-2 py-1 rounded text-xs ${
              selectedCategory === 'switches' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Commandes
          </button>
        </div>
      </div>

      {/* Search results */}
      <div className="space-y-2">
        {searchResults.length === 0 && searchTerm && (
          <div className="text-center text-gray-400 py-4">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun résultat trouvé</p>
          </div>
        )}

        {searchResults.map((result, index) => (
          <div
            key={result.element.id}
            className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 cursor-pointer transition-colors"
            onClick={() => onElementFound(result.element.id)}
          >
            <div className="flex items-start space-x-2">
              {getElementIcon(result.element.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white truncate">
                    {getElementLabel(result.element.type)}
                  </h4>
                  <span className="text-xs text-gray-400">
                    #{result.element.id.split('-').pop()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  Position: ({Math.round(result.element.x)}, {Math.round(result.element.y)})
                </div>
                
                {result.circuit && (
                  <div className="text-xs text-blue-400 mt-1">
                    Circuit: {result.circuit}
                  </div>
                )}
                
                <div className="mt-2 space-y-1">
                  {result.matches.slice(0, 2).map((match, matchIndex) => (
                    <div key={matchIndex} className="text-xs text-gray-500">
                      {match}
                    </div>
                  ))}
                  {result.matches.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{result.matches.length - 2} autres correspondances
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Statistiques</h4>
        <div className="space-y-1 text-xs text-gray-500">
          <div>Total éléments: {project.elements.length}</div>
          <div>Circuits: {project.calculations?.circuits.length || 0}</div>
          <div>Connexions: {project.connections.length}</div>
        </div>
      </div>

      {/* Search tips */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <h4 className="text-xs font-medium text-blue-300 mb-1">Conseils de recherche</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Tapez le type d'élément (prise, spot, etc.)</p>
          <p>• Recherchez par puissance (20A, 100W, etc.)</p>
          <p>• Utilisez le nom du circuit</p>
          <p>• Recherchez par ID d'élément</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;