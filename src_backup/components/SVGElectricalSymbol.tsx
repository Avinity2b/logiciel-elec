import React, { useState, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage } from 'react-konva';
import { ElectricalElement } from '../types/electrical';
import { getSymbolById } from '../data/symbolsDatabase';

interface SVGElectricalSymbolProps {
  element: ElectricalElement;
  isSelected: boolean;
  onClick: (e: any) => void;
  onDrag: (newPos: { x: number; y: number }) => void;
  connections?: string[];
}

const SVGElectricalSymbol: React.FC<SVGElectricalSymbolProps> = ({
  element,
  isSelected,
  onClick,
  onDrag,
  connections = []
}) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSVGAsImage = async () => {
      try {
        setIsLoading(true);
        
        // Get the symbol data
        const symbol = element.symbolId ? getSymbolById(element.symbolId) : null;
        const svgUrl = element.svgUrl || symbol?.svgUrl;
        
        if (!svgUrl) {
          setIsLoading(false);
          return;
        }

        // Fetch SVG content
        const response = await fetch(svgUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status}`);
        }
        
        const svgText = await response.text();
        
        // Create a blob URL for the SVG
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const svgBlobUrl = URL.createObjectURL(svgBlob);
        
        // Create an image element
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          setKonvaImage(img);
          setIsLoading(false);
          URL.revokeObjectURL(svgBlobUrl); // Clean up
        };
        
        img.onerror = () => {
          console.error('Failed to load SVG as image:', svgUrl);
          setIsLoading(false);
          URL.revokeObjectURL(svgBlobUrl); // Clean up
        };
        
        img.src = svgBlobUrl;
        
      } catch (error) {
        console.error('Error loading SVG:', error);
        setIsLoading(false);
      }
    };

    loadSVGAsImage();
  }, [element.symbolId, element.svgUrl]);

  // Determine the data-type for connection logic
  const getDataType = (element: ElectricalElement): string => {
    const symbol = element.symbolId ? getSymbolById(element.symbolId) : null;
    
    // Map element types to connection categories
    const switchTypes = [
      'switch', 'switch_pilot', 'switch_double', 'switch_double_pilot',
      'switch_va_et_vient', 'switch_va_et_vient_pilot', 
      'switch_double_va_et_vient', 'switch_double_va_et_vient_pilot',
      'push_button', 'push_button_pilot', 'switch_dimmer', 'motion_detector'
    ];
    
    const lightingTypes = [
      'dcl', 'dcl_applique', 'dcl_motion', 'spot', 'applique', 'applique_motion',
      'led_strip', 'led_projector'
    ];
    
    const outletTypes = [
      'outlet', 'outlet_high', 'outlet_double', 'outlet_double_high', 'outlet_triple', 'outlet_triple_high',
      'outlet_controlled', 'outlet_usb', 'socket_20a', 'socket_20a_spe', 'socket_32a',
      'cable_outlet_16a', 'cable_outlet_20a', 'cable_outlet_32a'
    ];
    
    if (switchTypes.includes(element.type)) {
      return 'switch';
    } else if (lightingTypes.includes(element.type)) {
      return 'lighting';
    } else if (outletTypes.includes(element.type)) {
      return 'outlet';
    } else {
      return 'other';
    }
  };

  const baseProps = {
    x: element.x,
    y: element.y,
    draggable: true,
    onClick: (e: any) => {
      // Add connection-specific data to the event
      e.elementId = element.id;
      e.dataType = getDataType(element);
      e.elementType = element.type;
      onClick(e);
    },
    onDragEnd: (e: any) => {
      onDrag({ x: e.target.x(), y: e.target.y() });
    },
    rotation: element.rotation,
    // Add HTML-like attributes for connection system
    id: element.id,
    name: `electrical-element-${element.id}`,
  };

  // Check if this symbol should be scaled up (Clim or TGBT)
  const shouldScaleUp = element.symbolId === 'clim' || element.symbolId === 'tgbt';
  const symbolSize = shouldScaleUp ? 48 : 32; // 50% increase: 32 * 1.5 = 48

  return (
    <Group 
      {...baseProps}
      // Add custom properties for connection detection
      _elementId={element.id}
      _dataType={getDataType(element)}
      _elementType={element.type}
      className="draggable electrical-element"
    >
      {/* Loading state */}
      {isLoading && (
        <Rect
          x={-symbolSize/2}
          y={-symbolSize/2}
          width={symbolSize}
          height={symbolSize}
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth={1}
        />
      )}
      
      {/* SVG Image */}
      {konvaImage && !isLoading && (
        <KonvaImage
          image={konvaImage}
          x={-symbolSize/2}
          y={-symbolSize/2}
          width={symbolSize}
          height={symbolSize}
          listening={true}
        />
      )}
      
      {/* Fallback rectangle if no image */}
      {!konvaImage && !isLoading && (
        <Rect
          x={-symbolSize/2}
          y={-symbolSize/2}
          width={symbolSize}
          height={symbolSize}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={1}
        />
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={-symbolSize/2 - 2}
          y={-symbolSize/2 - 2}
          width={symbolSize + 4}
          height={symbolSize + 4}
          stroke="#3B82F6"
          strokeWidth={2}
          dash={[3, 3]}
          fill="transparent"
        />
      )}
      
      {/* Connection indicator */}
      {connections.length > 0 && (
        <Rect
          x={-symbolSize/2 - 4}
          y={-symbolSize/2 - 4}
          width={symbolSize + 8}
          height={symbolSize + 8}
          stroke="#10B981"
          strokeWidth={2}
          fill="transparent"
          cornerRadius={4}
        />
      )}
    </Group>
  );
};

export default SVGElectricalSymbol;