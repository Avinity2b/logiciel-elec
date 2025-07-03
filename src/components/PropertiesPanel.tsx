import React from 'react';
import { Settings, FileText, Zap, AlertTriangle, CheckCircle, Link } from 'lucide-react';
import { ElectricalElement, NFCCalculation, Project } from '../types/electrical';

interface PropertiesPanelProps {
  selectedElements: ElectricalElement[];
  onUpdateElement: (id: string, updates: Partial<ElectricalElement>) => void;
  onExportSchematic: () => void;
  calculations: NFCCalculation | null;
  project: Project;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onUpdateElement,
  onExportSchematic,
  calculations,
  project
}) => {
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, {
        properties: {
          ...selectedElement.properties,
          [property]: value
        }
      });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { [axis]: value });
    }
  };

  const handleRotationChange = (value: number) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { rotation: value });
    }
  };

  const getConnectedElements = (elementId: string) => {
    const element = project.elements.find(el => el.id === elementId);
    if (!element || !element.connections) return [];
    
    return element.connections.map(connId => 
      project.elements.find(el => el.id === connId)
    ).filter(Boolean);
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    const commonProperties = (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Position X
          </label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Position Y
          </label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Rotation (°)
          </label>
          <input
            type="number"
            value={selectedElement.rotation}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
            step="15"
            min="0"
            max="360"
          />
        </div>
      </div>
    );

    const specificProperties = (() => {
      switch (selectedElement.type) {
        case 'outlet':
        case 'socket_32a':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Puissance (W)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.power || 0}
                  onChange={(e) => handlePropertyChange('power', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Tension (V)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.voltage || 230}
                  onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              {selectedElement.type !== 'outlet' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Ampérage (A)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.properties.amperage || 16}
                    onChange={(e) => handlePropertyChange('amperage', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
              )}
            </div>
          );

        case 'socket_20a':
        case 'socket_20a_spe':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Puissance (W)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.power || 4600}
                  onChange={(e) => handlePropertyChange('power', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Tension (V)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.voltage || 230}
                  onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Ampérage (A)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.amperage || 20}
                  onChange={(e) => handlePropertyChange('amperage', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              {selectedElement.type === 'socket_20a' && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedElement.properties.specialEquipment || false}
                      onChange={(e) => handlePropertyChange('specialEquipment', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-400">Équipement spécialisé</span>
                  </label>
                </div>
              )}
            </div>
          );

        case 'cable_outlet_16a':
        case 'cable_outlet_20a':
        case 'cable_outlet_32a':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Puissance (W)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.power || 0}
                  onChange={(e) => handlePropertyChange('power', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Ampérage (A)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.amperage || 16}
                  onChange={(e) => handlePropertyChange('amperage', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Section câble (mm²)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.cableSection || 1.5}
                  onChange={(e) => handlePropertyChange('cableSection', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  readOnly
                />
              </div>
              {selectedElement.properties.equipment && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Équipement
                  </label>
                  <input
                    type="text"
                    value={selectedElement.properties.equipment}
                    onChange={(e) => handlePropertyChange('equipment', e.target.value)}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
              )}
            </div>
          );

        case 'dcl':
        case 'dcl_motion':
        case 'spot':
        case 'applique':
        case 'applique_motion':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Puissance (W)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.power || 100}
                  onChange={(e) => handlePropertyChange('power', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={selectedElement.properties.type || 'LED'}
                  onChange={(e) => handlePropertyChange('type', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="LED">LED</option>
                  <option value="Halogène">Halogène</option>
                  <option value="Fluo">Fluocompacte</option>
                  <option value="Incandescent">Incandescence</option>
                </select>
              </div>
              {selectedElement.type === 'spot' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={selectedElement.properties.quantity || 1}
                    onChange={(e) => handlePropertyChange('quantity', parseInt(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    min="1"
                  />
                </div>
              )}
              {(selectedElement.type === 'dcl_motion' || selectedElement.type === 'applique_motion') && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedElement.properties.motionDetection || false}
                      onChange={(e) => handlePropertyChange('motionDetection', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-400">Détection de mouvement</span>
                  </label>
                </div>
              )}
            </div>
          );

        case 'switch':
        case 'switch_double':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={selectedElement.properties.type || 'simple'}
                  onChange={(e) => handlePropertyChange('type', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="simple">Simple</option>
                  <option value="double">Double</option>
                  <option value="va-et-vient">Va-et-vient</option>
                  <option value="poussoir">Poussoir</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Contacts
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.contacts || (selectedElement.type === 'switch_double' ? 2 : 1)}
                  onChange={(e) => handlePropertyChange('contacts', parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  min="1"
                  max="4"
                />
              </div>
            </div>
          );

        case 'switch_dimmer':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={selectedElement.properties.type || 'variateur'}
                  onChange={(e) => handlePropertyChange('type', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="variateur">Variateur</option>
                  <option value="variateur-led">Variateur LED</option>
                  <option value="variateur-halogene">Variateur Halogène</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Niveau Min (%)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.minLevel || 10}
                  onChange={(e) => handlePropertyChange('minLevel', parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Niveau Max (%)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.maxLevel || 100}
                  onChange={(e) => handlePropertyChange('maxLevel', parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  min="50"
                  max="100"
                />
              </div>
            </div>
          );

        case 'motion_detector':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Sensibilité
                </label>
                <select
                  value={selectedElement.properties.sensitivity || 'medium'}
                  onChange={(e) => handlePropertyChange('sensitivity', e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Délai (secondes)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.delay || 60}
                  onChange={(e) => handlePropertyChange('delay', parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  min="10"
                  max="600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Portée (mètres)
                </label>
                <input
                  type="number"
                  value={selectedElement.properties.range || 8}
                  onChange={(e) => handlePropertyChange('range', parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  min="2"
                  max="15"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    })();

    const connectedElements = getConnectedElements(selectedElement.id);

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Position & Rotation</h4>
          {commonProperties}
        </div>
        {specificProperties && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Propriétés Spécifiques</h4>
            {specificProperties}
          </div>
        )}
        {connectedElements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Connexions
            </h4>
            <div className="space-y-2">
              {connectedElements.map((connectedEl) => (
                <div key={connectedEl?.id} className="text-xs text-gray-400 bg-gray-700 p-2 rounded">
                  {connectedEl?.type.toUpperCase()} #{connectedEl?.id.split('-').pop()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMultipleSelection = () => {
    if (selectedElements.length <= 1) return null;

    return (
      <div className="space-y-4">
        <div className="text-center text-gray-400">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{selectedElements.length} éléments sélectionnés</p>
        </div>
        
        <div className="space-y-2">
          {selectedElements.map((element) => (
            <div key={element.id} className="text-xs text-gray-400 bg-gray-700 p-2 rounded">
              {element.type.toUpperCase()} #{element.id.split('-').pop()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalculationsSummary = () => {
    if (!calculations) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Résumé</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Puissance totale:</span>
              <span className="text-white">{calculations.totalPower}W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Circuits:</span>
              <span className="text-white">{calculations.circuits.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connexions:</span>
              <span className="text-white">{project.connections.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Circuits Détaillés</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {calculations.circuits.map((circuit, index) => (
              <div key={circuit.id} className="bg-gray-700 p-2 rounded text-xs">
                <div className="font-medium text-gray-300">{circuit.name}</div>
                <div className="text-gray-400">
                  {circuit.power}W • {circuit.breakerRating}A • {circuit.cableSection}mm²
                </div>
                <div className="text-gray-500">
                  {circuit.elements.length} élément{circuit.elements.length > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Conformité</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {calculations.compliance.map((check, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs">
                {check.status === 'compliant' ? (
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                )}
                <span className={`${
                  check.status === 'compliant' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {check.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onExportSchematic}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Générer Schéma</span>
        </button>
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-300">Propriétés</h3>
      </div>

      {selectedElements.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sélectionnez un ou plusieurs éléments</p>
        </div>
      ) : selectedElements.length === 1 ? (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              {selectedElement!.type.toUpperCase()} #{selectedElement!.id.split('-').pop()}
            </h4>
          </div>
          {renderElementProperties()}
        </div>
      ) : (
        renderMultipleSelection()
      )}

      {calculations && (
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-300">Calculs NFC 15-100</h3>
          </div>
          {renderCalculationsSummary()}
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;