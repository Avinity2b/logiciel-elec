import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { ExportZone } from '../utils/planExporter';

interface ExportZoneSelectorProps {
  canvasWidth: number;
  canvasHeight: number;
  onZoneChange: (zone: ExportZone) => void;
  initialZone?: ExportZone;
}

const ExportZoneSelector: React.FC<ExportZoneSelectorProps> = ({
  canvasWidth,
  canvasHeight,
  onZoneChange,
  initialZone
}) => {
  const [zone, setZone] = useState<ExportZone>(
    initialZone || {
      x: canvasWidth * 0.1,
      y: canvasHeight * 0.1,
      width: canvasWidth * 0.8,
      height: canvasHeight * 0.8
    }
  );
  
  const rectRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const handleZoneChange = useCallback(() => {
    if (rectRef.current) {
      const node = rectRef.current;
      const newZone = {
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY()
      };
      
      // Reset scale to 1 after getting dimensions
      node.scaleX(1);
      node.scaleY(1);
      node.width(newZone.width);
      node.height(newZone.height);
      
      setZone(newZone);
      onZoneChange(newZone);
    }
  }, [onZoneChange]);

  React.useEffect(() => {
    if (transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Stage
        width={canvasWidth}
        height={canvasHeight}
        className="pointer-events-auto"
      >
        <Layer>
          {/* Semi-transparent overlay */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Clear zone */}
          <Rect
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            fill="transparent"
            globalCompositeOperation="destination-out"
          />
          
          {/* Selection rectangle */}
          <Rect
            ref={rectRef}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            stroke="#3B82F6"
            strokeWidth={2}
            dash={[10, 5]}
            fill="rgba(59, 130, 246, 0.1)"
            draggable
            onDragEnd={handleZoneChange}
            onTransformEnd={handleZoneChange}
          />
          
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (newBox.width < 50 || newBox.height < 50) {
                return oldBox;
              }
              
              // Keep within canvas bounds
              if (newBox.x < 0 || newBox.y < 0 || 
                  newBox.x + newBox.width > canvasWidth || 
                  newBox.y + newBox.height > canvasHeight) {
                return oldBox;
              }
              
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      
      {/* Zone info */}
      <div className="absolute top-4 left-4 bg-gray-800 text-white p-2 rounded text-xs">
        Zone: {Math.round(zone.width)} × {Math.round(zone.height)} px
      </div>
    </div>
  );
};

export default ExportZoneSelector;