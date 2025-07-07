import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  Plug, 
  ToggleLeft, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Zap,
  Power,
  Sun,
  Eye,
  Sliders,
  ToggleRight,
  Lamp,
  Cable,
  Usb,
  ArrowUpDown
} from 'lucide-react';
import { ElectricalElement, ElementType } from '../types/electrical';

interface ToolbarProps {
  onAddElement: (element: ElectricalElement) => void;
}

interface DraggableItemProps {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  onAddElement: (element: ElectricalElement) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ type, icon, label, onAddElement }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'electrical-element',
    item: { elementType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDoubleClick = () => {
    // Calculate center of current view
    const stage = (window as any).stageRef?.current;
    if (stage) {
      const stageScale = stage.scaleX();
      const stagePosition = stage.position();
      const canvasSize = { width: stage.width(), height: stage.height() };
      
      // Calculate center position in stage coordinates
      const centerX = (canvasSize.width / 2 - stagePosition.x) / stageScale;
      const centerY = (canvasSize.height / 2 - stagePosition.y) / stageScale;
      
      const element: ElectricalElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: centerX,
        y: centerY,
        rotation: 0,
        properties: getDefaultProperties(type),
        connections: []
      };
      onAddElement(element);
    } else {
      // Fallback if stage not available
      const element: ElectricalElement = {
        id: `${type}-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        rotation: 0,
        properties: getDefaultProperties(type),
        connections: []
      };
      onAddElement(element);
    }
  };

  return (
    <div
      ref={drag}
      onDoubleClick={handleDoubleClick}
      className={`flex flex-col items-center p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-move transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`Double-clic pour placer au centre ou glisser-déposer`}
    >
      <div className="text-blue-400 mb-1">{icon}</div>
      <span className="text-xs text-center text-gray-300 leading-tight">{label}</span>
    </div>
  );
};

const getDefaultProperties = (type: ElementType): Record<string, any> => {
  switch (type) {
    case 'outlet':
      return { power: 2500, voltage: 230, protected: true };
    case 'outlet_high':
      return { power: 2500, voltage: 230, protected: true, height: 'high' };
    case 'outlet_double':
      return { power: 5000, voltage: 230, protected: true, outlets: 2 };
    case 'outlet_double_high':
      return { power: 5000, voltage: 230, protected: true, outlets: 2, height: 'high' };
    case 'socket_20a':
      return { power: 4600, voltage: 230, amperage: 20, specialEquipment: false };
    case 'socket_20a_spe':
      return { power: 4600, voltage: 230, amperage: 20, specialEquipment: true };
    case 'socket_32a':
      return { power: 7360, voltage: 230, amperage: 32 };
    case 'cable_outlet_16a':
      return { power: 3680, voltage: 230, amperage: 16, cableSection: 1.5 };
    case 'outlet_controlled':
      return { power: 2500, voltage: 230, controlled: true };
    case 'outlet_usb':
      return { power: 2500, voltage: 230, usb: true };
    case 'switch':
      return { type: 'simple', contacts: 1, controlledElements: [] };
    case 'switch_pilot':
      return { type: 'simple', contacts: 1, pilot: true, controlledElements: [] };
    case 'switch_double':
      return { type: 'double', contacts: 2, controlledElements: [] };
    case 'switch_double_pilot':
      return { type: 'double', contacts: 2, pilot: true, controlledElements: [] };
    case 'switch_va_et_vient':
      return { type: 'va-et-vient', contacts: 1, controlledElements: [] };
    case 'switch_va_et_vient_pilot':
      return { type: 'va-et-vient', contacts: 1, pilot: true, controlledElements: [] };
    case 'switch_double_va_et_vient':
      return { type: 'double-va-et-vient', contacts: 2, controlledElements: [] };
    case 'switch_double_va_et_vient_pilot':
      return { type: 'double-va-et-vient', contacts: 2, pilot: true, controlledElements: [] };
    case 'push_button':
      return { type: 'poussoir', contacts: 1, controlledElements: [] };
    case 'push_button_pilot':
      return { type: 'poussoir', contacts: 1, pilot: true, controlledElements: [] };
    case 'switch_dimmer':
      return { type: 'variateur', contacts: 1, controlledElements: [], minLevel: 10, maxLevel: 100 };
    case 'motion_detector':
      return { type: 'detecteur', sensitivity: 'medium', delay: 60, range: 8, controlledElements: [] };
    case 'switch_shutter':
      return { type: 'volet-roulant', contacts: 2, controlledElements: [] };
    case 'dcl':
      return { power: 100, voltage: 230, type: 'DCL' };
    case 'dcl_applique':
      return { power: 100, voltage: 230, type: 'DCL', mounting: 'wall' };
    case 'spot':
      return { power: 50, voltage: 230, type: 'LED', quantity: 1 };
    case 'led_strip':
      return { power: 100, voltage: 230, type: 'LED', length: 1 };
    case 'led_projector':
      return { power: 150, voltage: 230, type: 'LED', outdoor: true };
    default:
      return {};
  }
};

interface CategorySectionProps {
  title: string;
  elements: Array<{ type: ElementType; icon: React.ReactNode; label: string }>;
  onAddElement: (element: ElectricalElement) => void;
  defaultExpanded?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  elements, 
  onAddElement, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs font-medium text-gray-400 mb-2 hover:text-gray-300 transition-colors p-1"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      
      {isExpanded && (
        <div className="grid grid-cols-2 gap-1">
          {elements.map((element) => (
            <DraggableItem
              key={element.type}
              type={element.type}
              icon={element.icon}
              label={element.label}
              onAddElement={onAddElement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({ onAddElement }) => {
  const priseElements = [
    { type: 'outlet' as ElementType, icon: <Plug className="w-4 h-4" />, label: 'PC' },
    { type: 'outlet_high' as ElementType, icon: <Plug className="w-4 h-4" />, label: 'PC haute' },
    { type: 'outlet_double' as ElementType, icon: <Plug className="w-4 h-4" />, label: 'PC double' },
    { type: 'outlet_double_high' as ElementType, icon: <Plug className="w-4 h-4" />, label: 'PC double haute' },
    { type: 'socket_20a' as ElementType, icon: <Power className="w-4 h-4" />, label: 'PC 20A' },
    { type: 'socket_20a_spe' as ElementType, icon: <Zap className="w-4 h-4" />, label: 'PC 20A spé' },
    { type: 'socket_32a' as ElementType, icon: <Power className="w-4 h-4" />, label: 'PC 32A' },
    { type: 'cable_outlet_16a' as ElementType, icon: <Cable className="w-4 h-4" />, label: 'SC 10/16A' },
    { type: 'outlet_controlled' as ElementType, icon: <Plug className="w-4 h-4" />, label: 'PC commandée' },
    { type: 'outlet_usb' as ElementType, icon: <Usb className="w-4 h-4" />, label: 'PC USB/USB C' },
  ];

  const commandeElements = [
    { type: 'switch' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Interrupteur' },
    { type: 'switch_pilot' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Inter. à voyant' },
    { type: 'switch_double' as ElementType, icon: <ToggleRight className="w-4 h-4" />, label: 'Inter. double' },
    { type: 'switch_double_pilot' as ElementType, icon: <ToggleRight className="w-4 h-4" />, label: 'Inter. double à voyant' },
    { type: 'switch_va_et_vient' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Va-et-vient' },
    { type: 'switch_va_et_vient_pilot' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Va-et-vient à voyant' },
    { type: 'switch_double_va_et_vient' as ElementType, icon: <ToggleRight className="w-4 h-4" />, label: 'Double va-et-vient' },
    { type: 'switch_double_va_et_vient_pilot' as ElementType, icon: <ToggleRight className="w-4 h-4" />, label: 'Double va-et-vient à voyant' },
    { type: 'push_button' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'Bouton poussoir' },
    { type: 'push_button_pilot' as ElementType, icon: <ToggleLeft className="w-4 h-4" />, label: 'BP voyant' },
    { type: 'switch_dimmer' as ElementType, icon: <Sliders className="w-4 h-4" />, label: 'Variateur' },
    { type: 'motion_detector' as ElementType, icon: <Eye className="w-4 h-4" />, label: 'Détecteur' },
    { type: 'switch_shutter' as ElementType, icon: <ArrowUpDown className="w-4 h-4" />, label: 'Inter. volet roulant' },
  ];

  const eclairageElements = [
    { type: 'dcl' as ElementType, icon: <Lightbulb className="w-4 h-4" />, label: 'DCL plafonnier' },
    { type: 'dcl_applique' as ElementType, icon: <Lamp className="w-4 h-4" />, label: 'DCL applique' },
    { type: 'spot' as ElementType, icon: <Sun className="w-4 h-4" />, label: 'Spot' },
    { type: 'led_strip' as ElementType, icon: <Lightbulb className="w-4 h-4" />, label: 'Réglette LED' },
    { type: 'led_projector' as ElementType, icon: <Sun className="w-4 h-4" />, label: 'Projecteur LED' },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-3 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Pictos Électriques</h3>
      
      <div className="space-y-1">
        <CategorySection
          title="PRISES"
          elements={priseElements}
          onAddElement={onAddElement}
          defaultExpanded={true}
        />

        <CategorySection
          title="COMMANDES"
          elements={commandeElements}
          onAddElement={onAddElement}
          defaultExpanded={true}
        />

        <CategorySection
          title="ÉCLAIRAGE"
          elements={eclairageElements}
          onAddElement={onAddElement}
          defaultExpanded={true}
        />
      </div>

      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <h4 className="text-xs font-medium text-blue-300 mb-1">CIRCUITS NFC 15-100</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• PC 16A : 8 max/circuit</p>
          <p>• PC 20A : 12 max/circuit</p>
          <p>• PC 20A Spé : 1/circuit</p>
          <p>• Éclairage : 8 max/circuit</p>
          <p>• SC : 1/circuit dédié</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
        <h4 className="text-xs font-medium text-green-300 mb-1">RACCOURCIS</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Ctrl+C : Copier</p>
          <p>Ctrl+V : Coller</p>
          <p>Suppr : Supprimer</p>
          <p>Ctrl+A : Tout sélectionner</p>
          <p>Clic+Glisser : Sélection multiple</p>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;