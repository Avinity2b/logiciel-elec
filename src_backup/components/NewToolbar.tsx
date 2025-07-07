import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ElectricalElement, ElementType } from '../types/electrical';
import { ElectricalSymbol } from '../types/symbols';
import { getSymbolsByCategory } from '../data/symbolsDatabase';
import SymbolIcon from './SymbolIcon';

interface NewToolbarProps {
  onAddElement: (element: ElectricalElement) => void;
}

interface DraggableSymbolProps {
  symbol: ElectricalSymbol;
  onAddElement: (element: ElectricalElement) => void;
}

const DraggableSymbol: React.FC<DraggableSymbolProps> = ({ symbol, onAddElement }) => {
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'electrical-element',
    item: { 
      elementType: symbol.elementType,
      symbolId: symbol.id,
      svgUrl: symbol.svgUrl 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Hide the default drag preview and use our custom one
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Create custom drag preview
  useEffect(() => {
    if (isDragging && dragPreviewRef.current) {
      const dragLayer = document.createElement('div');
      dragLayer.id = 'custom-drag-preview';
      dragLayer.style.position = 'fixed';
      dragLayer.style.pointerEvents = 'none';
      dragLayer.style.zIndex = '9999';
      dragLayer.style.left = '0';
      dragLayer.style.top = '0';
      dragLayer.style.transform = 'translate(-50%, -50%)';
      
      // Check if this symbol should be scaled up
      const shouldScaleUp = symbol.id === 'clim' || symbol.id === 'tgbt';
      const previewSize = shouldScaleUp ? 48 : 32;
      
      // Create the preview content (just the SVG)
      dragLayer.innerHTML = `
        <div style="
          width: ${previewSize}px; 
          height: ${previewSize}px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #3B82F6;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(4px);
        ">
          <div id="preview-icon-container" style="width: ${previewSize - 8}px; height: ${previewSize - 8}px;"></div>
        </div>
      `;
      
      document.body.appendChild(dragLayer);
      
      // Load and insert the SVG
      const loadPreviewIcon = async () => {
        try {
          const response = await fetch(symbol.svgUrl);
          const svgText = await response.text();
          
          const iconContainer = dragLayer.querySelector('#preview-icon-container');
          if (iconContainer) {
            const modifiedSvg = svgText.replace(/<svg[^>]*>/, (match) => {
              return match.replace(/width="[^"]*"/, `width="${previewSize - 8}"`)
                         .replace(/height="[^"]*"/, `height="${previewSize - 8}"`);
            });
            iconContainer.innerHTML = modifiedSvg;
          }
        } catch (error) {
          console.error('Error loading preview SVG:', error);
          const iconContainer = dragLayer.querySelector('#preview-icon-container');
          if (iconContainer) {
            iconContainer.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background: #f3f4f6; 
                border-radius: 4px;
                font-size: 12px;
                color: #6b7280;
              ">?</div>
            `;
          }
        }
      };
      
      loadPreviewIcon();
      
      // Track mouse movement
      const handleMouseMove = (e: MouseEvent) => {
        dragLayer.style.left = e.clientX + 'px';
        dragLayer.style.top = e.clientY + 'px';
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      
      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (document.body.contains(dragLayer)) {
          document.body.removeChild(dragLayer);
        }
      };
    }
  }, [isDragging, symbol]);

  // Cleanup on unmount or when dragging stops
  useEffect(() => {
    if (!isDragging) {
      const existingPreview = document.getElementById('custom-drag-preview');
      if (existingPreview) {
        document.body.removeChild(existingPreview);
      }
    }
  }, [isDragging]);

  const handleDoubleClick = useCallback(() => {
    // Get stage reference for center positioning
    const stage = (window as any).stageRef?.current;
    if (stage) {
      const stageScale = stage.scaleX();
      const stagePosition = stage.position();
      const canvasSize = { width: stage.width(), height: stage.height() };
      
      // Calculate center position in stage coordinates
      const centerX = (canvasSize.width / 2 - stagePosition.x) / stageScale;
      const centerY = (canvasSize.height / 2 - stagePosition.y) / stageScale;
      
      const element: ElectricalElement = {
        id: `${symbol.elementType}-${Date.now()}`,
        type: symbol.elementType as ElementType,
        x: centerX,
        y: centerY,
        rotation: 0,
        properties: symbol.properties || {},
        connections: [],
        symbolId: symbol.id,
        svgUrl: symbol.svgUrl
      };
      onAddElement(element);
    } else {
      // Fallback if stage not available
      const element: ElectricalElement = {
        id: `${symbol.elementType}-${Date.now()}`,
        type: symbol.elementType as ElementType,
        x: 100,
        y: 100,
        rotation: 0,
        properties: symbol.properties || {},
        connections: [],
        symbolId: symbol.id,
        svgUrl: symbol.svgUrl
      };
      onAddElement(element);
    }
  }, [symbol, onAddElement]);

  return (
    <div
      ref={(node) => {
        drag(node);
        dragPreviewRef.current = node;
      }}
      onDoubleClick={handleDoubleClick}
      className={`
        flex items-center w-full p-2 mb-1 
        bg-gray-50 hover:bg-blue-50 
        border border-gray-200 hover:border-blue-300
        rounded-md cursor-move transition-all duration-150
        shadow-sm hover:shadow-md
        ${isDragging ? 'opacity-30 scale-95' : ''}
      `}
      title={`${symbol.name} - Double-clic pour placer au centre ou glisser-déposer`}
    >
      {/* Icône à gauche, taille fixe */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3">
        <SymbolIcon 
          svgUrl={symbol.svgUrl} 
          alt={symbol.name}
          size={32}
          symbolId={symbol.id}
          className="drop-shadow-sm"
        />
      </div>
      
      {/* Texte à droite avec espacement */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-800 font-medium leading-tight block truncate">
          {symbol.name}
        </span>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  categoryName: string;
  symbols: ElectricalSymbol[];
  onAddElement: (element: ElectricalElement) => void;
  defaultExpanded?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  categoryName, 
  symbols, 
  onAddElement, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full flex items-center justify-between 
          px-3 py-2 mb-2
          bg-gray-100 hover:bg-gray-200 
          border border-gray-300 rounded-md
          text-sm font-semibold text-gray-700
          transition-colors duration-150
          shadow-sm
        "
      >
        <span className="uppercase tracking-wide">{categoryName}</span>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">({symbols.length})</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="space-y-1 pl-2">
          {symbols.map((symbol) => (
            <DraggableSymbol
              key={symbol.id}
              symbol={symbol}
              onAddElement={onAddElement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NewToolbar: React.FC<NewToolbarProps> = ({ onAddElement }) => {
  const symbolsByCategory = getSymbolsByCategory();
  const categoryOrder = ['Commandes', 'Prises', 'Lumières', 'Divers'];

  return (
    <div className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-200 border-b border-gray-300 px-4 py-3 shadow-sm z-10">
        <h3 className="text-base font-semibold text-gray-800">Symboles Électriques</h3>
        <p className="text-xs text-gray-600 mt-1">Conformes aux normes françaises</p>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="space-y-2">
          {categoryOrder.map(categoryName => {
            const symbols = symbolsByCategory[categoryName] || [];
            if (symbols.length === 0) return null;
            
            return (
              <CategorySection
                key={categoryName}
                categoryName={categoryName}
                symbols={symbols}
                onAddElement={onAddElement}
                defaultExpanded={true}
              />
            );
          })}
        </div>

        {/* Info panels */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">
              Fonctionnalités
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Chargement dynamique depuis Supabase</p>
              <p>• Double-clic : placement au centre</p>
              <p>• Glisser-déposer : positionnement exact</p>
              <p>• Preview personnalisé : symbole uniquement</p>
              <p>• Clim/TGBT : Taille augmentée (+50%)</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
              Raccourcis Clavier
            </h4>
            <div className="text-xs text-green-700 space-y-1">
              <p><kbd className="px-1 py-0.5 bg-white border border-green-300 rounded text-xs">Ctrl+C</kbd> Copier</p>
              <p><kbd className="px-1 py-0.5 bg-white border border-green-300 rounded text-xs">Ctrl+V</kbd> Coller</p>
              <p><kbd className="px-1 py-0.5 bg-white border border-green-300 rounded text-xs">Suppr</kbd> Supprimer</p>
              <p><kbd className="px-1 py-0.5 bg-white border border-green-300 rounded text-xs">Ctrl+A</kbd> Tout sélectionner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewToolbar;