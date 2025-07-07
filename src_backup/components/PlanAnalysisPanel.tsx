import React, { useState, useCallback } from 'react';
import { 
  Scan, 
  Settings, 
  Play, 
  Square, 
  Home, 
  DoorOpen, 
  Maximize, 
  Sofa, 
  Ruler, 
  Type,
  Eye,
  EyeOff,
  Loader,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { PlanAnalyzer } from '../utils/planAnalyzer';
import { AnalysisSettings, PlanAnalysisResult, ArchitecturalElement } from '../types/architectural';

interface PlanAnalysisPanelProps {
  backgroundImage: string | null;
  onAnalysisComplete: (result: PlanAnalysisResult) => void;
  onToggleElementVisibility: (elementType: string, visible: boolean) => void;
  analysisResult: PlanAnalysisResult | null;
}

const PlanAnalysisPanel: React.FC<PlanAnalysisPanelProps> = ({
  backgroundImage,
  onAnalysisComplete,
  onToggleElementVisibility,
  analysisResult
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visibleElements, setVisibleElements] = useState({
    walls: true,
    doors: true,
    windows: true,
    rooms: true,
    furniture: true,
    dimensions: true,
    texts: true
  });

  const [settings, setSettings] = useState<AnalysisSettings>({
    detectWalls: true,
    detectDoors: true,
    detectWindows: true,
    detectRooms: true,
    detectFurniture: true,
    detectDimensions: true,
    detectText: true,
    sensitivity: 'medium',
    minWallLength: 50,
    minRoomArea: 5
  });

  const handleAnalyze = useCallback(async () => {
    if (!backgroundImage) {
      alert('Aucun plan à analyser. Veuillez d\'abord importer une image.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analyzer = new PlanAnalyzer(settings);
      const result = await analyzer.analyzeImage(backgroundImage);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      alert('Erreur lors de l\'analyse du plan. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [backgroundImage, settings, onAnalysisComplete]);

  const handleToggleVisibility = useCallback((elementType: string) => {
    const newVisibility = !visibleElements[elementType as keyof typeof visibleElements];
    setVisibleElements(prev => ({
      ...prev,
      [elementType]: newVisibility
    }));
    onToggleElementVisibility(elementType, newVisibility);
  }, [visibleElements, onToggleElementVisibility]);

  const handleSettingChange = useCallback((key: keyof AnalysisSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'walls': return <Square className="w-4 h-4" />;
      case 'doors': return <DoorOpen className="w-4 h-4" />;
      case 'windows': return <Maximize className="w-4 h-4" />;
      case 'rooms': return <Home className="w-4 h-4" />;
      case 'furniture': return <Sofa className="w-4 h-4" />;
      case 'dimensions': return <Ruler className="w-4 h-4" />;
      case 'texts': return <Type className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  const getElementCount = (type: string): number => {
    if (!analysisResult) return 0;
    switch (type) {
      case 'walls': return analysisResult.walls.length;
      case 'doors': return analysisResult.doors.length;
      case 'windows': return analysisResult.windows.length;
      case 'rooms': return analysisResult.rooms.length;
      case 'furniture': return analysisResult.furniture.length;
      case 'dimensions': return analysisResult.dimensions.length;
      case 'texts': return analysisResult.texts.length;
      default: return 0;
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (confidence >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="bg-gray-800 border-l border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scan className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-300">Analyse du Plan</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Bouton d'analyse */}
      <button
        onClick={handleAnalyze}
        disabled={!backgroundImage || isAnalyzing}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          !backgroundImage || isAnalyzing
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Analyse en cours...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Analyser le Plan</span>
          </>
        )}
      </button>

      {/* Paramètres d'analyse */}
      {showSettings && (
        <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
          <h4 className="text-xs font-medium text-gray-300">Paramètres d'Analyse</h4>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sensibilité</label>
              <select
                value={settings.sensitivity}
                onChange={(e) => handleSettingChange('sensitivity', e.target.value)}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Longueur min. mur (px)</label>
              <input
                type="number"
                value={settings.minWallLength}
                onChange={(e) => handleSettingChange('minWallLength', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
                min="10"
                max="200"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Surface min. pièce (m²)</label>
              <input
                type="number"
                value={settings.minRoomArea}
                onChange={(e) => handleSettingChange('minRoomArea', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-400">Éléments à détecter</h5>
            {Object.entries(settings).filter(([key]) => key.startsWith('detect')).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleSettingChange(key as keyof AnalysisSettings, e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-gray-400">
                  {key.replace('detect', '').replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de l'analyse */}
      {analysisResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span className="text-xs text-gray-400">Confiance</span>
            <div className="flex items-center space-x-2">
              {getConfidenceIcon(analysisResult.confidence)}
              <span className={`text-xs font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                {Math.round(analysisResult.confidence)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-300">Éléments Détectés</h4>
            
            {Object.keys(visibleElements).map(elementType => {
              const count = getElementCount(elementType);
              const isVisible = visibleElements[elementType as keyof typeof visibleElements];
              
              return (
                <div key={elementType} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    {getElementIcon(elementType)}
                    <span className="text-xs text-gray-300 capitalize">
                      {elementType === 'walls' ? 'Murs' :
                       elementType === 'doors' ? 'Portes' :
                       elementType === 'windows' ? 'Fenêtres' :
                       elementType === 'rooms' ? 'Pièces' :
                       elementType === 'furniture' ? 'Mobilier' :
                       elementType === 'dimensions' ? 'Cotes' :
                       elementType === 'texts' ? 'Textes' : elementType}
                    </span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </div>
                  
                  <button
                    onClick={() => handleToggleVisibility(elementType)}
                    className="p-1 hover:bg-gray-600 rounded transition-colors"
                  >
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-blue-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Détails des pièces */}
          {analysisResult.rooms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-300">Détail des Pièces</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {analysisResult.rooms.map((room, index) => (
                  <div key={room.id} className="p-2 bg-gray-700 rounded text-xs">
                    <div className="font-medium text-gray-300">{room.name}</div>
                    <div className="text-gray-400">
                      {room.area.toFixed(1)} m² • {room.perimeter.toFixed(1)} m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!backgroundImage && (
        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <h4 className="text-xs font-medium text-blue-300 mb-1">ANALYSE AUTOMATIQUE</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Importez d'abord un plan</p>
            <p>• Cliquez sur "Analyser le Plan"</p>
            <p>• L'IA détectera automatiquement :</p>
            <p className="ml-2">- Murs et cloisons</p>
            <p className="ml-2">- Portes et fenêtres</p>
            <p className="ml-2">- Pièces et espaces</p>
            <p className="ml-2">- Mobilier et équipements</p>
            <p className="ml-2">- Cotes et dimensions</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanAnalysisPanel;