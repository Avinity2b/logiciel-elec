import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Stage, Layer, Image as KonvaImage, Group, Line } from 'react-konva';
import { ElectricalElement, Project, Connection } from '../types/electrical';
import { PlanAnalysisResult } from '../types/architectural';
import SVGElectricalSymbol from './SVGElectricalSymbol';
import ArchitecturalOverlay from './ArchitecturalOverlay';
import { getSymbolById } from '../data/symbolsDatabase';

interface CanvasProps {
  project: Project;
  selectedElements: ElectricalElement[];
  onSelectElements: (elements: ElectricalElement[]) => void;
  onUpdateElement: (id: string, updates: Partial<ElectricalElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onAddElement: (element: ElectricalElement) => void;
  onAddConnection: (connection: Connection) => void;
  onDeleteConnection: (connectionId: string) => void;
  planAnalysisResult?: PlanAnalysisResult | null;
  showConnections: boolean;
}

const Canvas = React.forwardRef<any, CanvasProps>(({
  project,
  selectedElements,
  onSelectElements,
  onUpdateElement,
  onDeleteElements,
  onAddElement,
  onAddConnection,
  onDeleteConnection,
  planAnalysisResult,
  showConnections
}, ref) => {
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<ElectricalElement | null>(null);
  const [clipboard, setClipboard] = useState<ElectricalElement[]>([]);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  
  // Zoom and pan states
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [backgroundImageScale, setBackgroundImageScale] = useState({ x: 1, y: 1 });
  const [backgroundImageSize, setBackgroundImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Drag preview state
  const [dragPreview, setDragPreview] = useState<{
    elementType: string;
    symbolId?: string;
    svgUrl?: string;
    x: number;
    y: number;
    visible: boolean;
  } | null>(null);

  // Architectural overlay visibility
  const [architecturalVisibility, setArchitecturalVisibility] = useState({
    walls: true,
    doors: true,
    windows: true,
    rooms: true,
    furniture: true,
    dimensions: true,
    texts: true
  });

  // Helper function to convert screen coordinates to stage coordinates
  const screenToStageCoordinates = useCallback((screenX: number, screenY: number) => {
    if (!ref?.current) return { x: screenX, y: screenY };
    
    const stage = ref.current;
    const stageRect = stage.container().getBoundingClientRect();
    
    // Get current stage transformations
    const currentScale = stage.scaleX(); // Assuming uniform scaling
    const currentPosition = stage.position();
    
    // Convert screen coordinates to stage coordinates
    // Formula: (screen_coord - stage_offset - stage_position) / stage_scale
    const stageX = (screenX - stageRect.left - currentPosition.x) / currentScale;
    const stageY = (screenY - stageRect.top - currentPosition.y) / currentScale;
    
    return { x: stageX, y: stageY };
  }, [ref]);

  const [{ isOver, dragItem }, drop] = useDrop(() => ({
    accept: 'electrical-element',
    drop: (item: { elementType: string; symbolId?: string; svgUrl?: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && ref?.current) {
        // Use the helper function to get correct coordinates
        const { x: adjustedX, y: adjustedY } = screenToStageCoordinates(clientOffset.x, clientOffset.y);
        
        console.log('Drop coordinates:', {
          screen: { x: clientOffset.x, y: clientOffset.y },
          stage: { x: adjustedX, y: adjustedY },
          scale: ref.current.scaleX(),
          position: ref.current.position()
        });
        
        // Get symbol properties if available
        const symbol = item.symbolId ? getSymbolById(item.symbolId) : null;
        
        const newElement: ElectricalElement = {
          id: `${item.elementType}-${Date.now()}`,
          type: item.elementType as any,
          x: adjustedX,
          y: adjustedY,
          rotation: 0,
          properties: symbol?.properties || getDefaultProperties(item.elementType),
          connections: [],
          symbolId: item.symbolId,
          svgUrl: item.svgUrl
        };
        onAddElement(newElement);
      }
      // Clear drag preview
      setDragPreview(null);
    },
    hover: (item: { elementType: string; symbolId?: string; svgUrl?: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && ref?.current) {
        // Use the helper function for hover preview as well
        const { x, y } = screenToStageCoordinates(clientOffset.x, clientOffset.y);
        
        setDragPreview({
          elementType: item.elementType,
          symbolId: item.symbolId,
          svgUrl: item.svgUrl,
          x,
          y,
          visible: true
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      dragItem: monitor.getItem(),
    }),
  }), [screenToStageCoordinates]); // Add dependency

  // Clear drag preview when not hovering
  useEffect(() => {
    if (!isOver) {
      setDragPreview(null);
    }
  }, [isOver]);

  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const toolbarWidth = 320; // Updated for new toolbar width
      const propertiesWidth = 320;
      const analysisWidth = planAnalysisResult ? 320 : 0;
      const headerHeight = 64;
      const statusHeight = 56;
      
      const newWidth = window.innerWidth - toolbarWidth - propertiesWidth - analysisWidth;
      const newHeight = window.innerHeight - headerHeight - statusHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [planAnalysisResult]);

  // Enhanced connection logic for SVG symbols
  const getElementDataType = (element: ElectricalElement): string => {
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
    
    if (switchTypes.includes(element.type)) {
      return 'switch';
    } else if (lightingTypes.includes(element.type)) {
      return 'lighting';
    } else {
      return 'other';
    }
  };

  const canElementsConnect = (element1: ElectricalElement, element2: ElectricalElement): boolean => {
    const type1 = getElementDataType(element1);
    const type2 = getElementDataType(element2);
    
    // Allow connections between switches and lighting
    return (type1 === 'switch' && type2 === 'lighting') || 
           (type1 === 'lighting' && type2 === 'switch') ||
           (type1 === 'lighting' && type2 === 'lighting'); // Allow lighting to lighting connections
  };

  const getDefaultProperties = (type: string): Record<string, any> => {
    switch (type) {
      case 'outlet':
        return { power: 2500, voltage: 230, protected: true };
      case 'socket_20a_spe':
        return { power: 4600, voltage: 230, amperage: 20, specialEquipment: true };
      case 'socket_20a':
        return { power: 4600, voltage: 230, amperage: 20, specialEquipment: false };
      case 'socket_32a':
        return { power: 7360, voltage: 230, amperage: 32 };
      case 'dcl':
        return { power: 100, voltage: 230, type: 'DCL' };
      case 'dcl_motion':
        return { power: 100, voltage: 230, type: 'DCL', motionDetection: true };
      case 'spot':
        return { power: 50, voltage: 230, type: 'LED', quantity: 1 };
      case 'applique':
        return { power: 75, voltage: 230, type: 'LED' };
      case 'applique_motion':
        return { power: 75, voltage: 230, type: 'LED', motionDetection: true };
      case 'switch':
        return { type: 'simple', contacts: 1, controlledElements: [] };
      case 'switch_double':
        return { type: 'double', contacts: 2, controlledElements: [] };
      case 'switch_dimmer':
        return { type: 'variateur', contacts: 1, controlledElements: [], minLevel: 10, maxLevel: 100 };
      case 'motion_detector':
        return { type: 'detecteur', sensitivity: 'medium', delay: 60, range: 8, controlledElements: [] };
      default:
        return {};
    }
  };

  const handleStageMouseDown = useCallback((e: any) => {
    // Check if we clicked on the stage background (not on an element)
    if (e.target === e.target.getStage()) {
      const pos = e.target.getStage().getPointerPosition();
      const adjustedPos = screenToStageCoordinates(pos.x, pos.y);
      
      // Check if we're holding space for panning or if we're in selection mode
      if (e.evt.button === 1 || e.evt.button === 2) { // Middle or right mouse button for panning
        setIsDraggingStage(true);
        e.evt.preventDefault();
      } else if (!e.evt.spaceKey) { // Only start selection if space is not pressed
        setStartPos(adjustedPos);
        setIsSelecting(true);
        setSelectionRect({ x: adjustedPos.x, y: adjustedPos.y, width: 0, height: 0 });
      }
    }
  }, [screenToStageCoordinates]);

  const handleStageMouseMove = useCallback((e: any) => {
    if (!isSelecting) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const adjustedPos = screenToStageCoordinates(pos.x, pos.y);
    
    setSelectionRect({
      x: Math.min(startPos.x, adjustedPos.x),
      y: Math.min(startPos.y, adjustedPos.y),
      width: Math.abs(adjustedPos.x - startPos.x),
      height: Math.abs(adjustedPos.y - startPos.y)
    });
  }, [isSelecting, startPos, screenToStageCoordinates]);

  const handleStageMouseUp = useCallback(() => {
    if (isSelecting) {
      // Select elements within rectangle
      const elementsInRect = project.elements.filter(element => {
        return element.x >= selectionRect.x &&
               element.x <= selectionRect.x + selectionRect.width &&
               element.y >= selectionRect.y &&
               element.y <= selectionRect.y + selectionRect.height;
      });
      
      onSelectElements(elementsInRect);
      setIsSelecting(false);
      setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
    }
    setIsDraggingStage(false);
  }, [isSelecting, selectionRect, project.elements, onSelectElements]);

  const handleElementClick = useCallback((element: ElectricalElement, e: any) => {
    e.cancelBubble = true;
    
    if (connectionMode) {
      if (!connectionStart) {
        // Start connection - check if element can be a connection source
        const dataType = getElementDataType(element);
        if (dataType === 'switch' || dataType === 'lighting') {
          setConnectionStart(element);
          console.log(`Connection started from ${element.type} (${dataType})`);
        } else {
          console.log(`Element ${element.type} cannot start connections`);
        }
      } else {
        // End connection
        if (connectionStart.id !== element.id) {
          // Check if elements can connect
          if (canElementsConnect(connectionStart, element)) {
            const connection: Connection = {
              id: `conn-${Date.now()}`,
              from: connectionStart.id,
              to: element.id,
              type: 'control'
            };
            onAddConnection(connection);
            
            // Update element connections
            onUpdateElement(connectionStart.id, {
              connections: [...(connectionStart.connections || []), element.id]
            });
            onUpdateElement(element.id, {
              connections: [...(element.connections || []), connectionStart.id]
            });
            
            console.log(`Connection created: ${connectionStart.type} -> ${element.type}`);
          } else {
            console.log(`Cannot connect ${connectionStart.type} to ${element.type}`);
          }
        }
        setConnectionStart(null);
      }
    } else {
      // Normal selection
      if (e.evt.ctrlKey) {
        const isSelected = selectedElements.some(el => el.id === element.id);
        if (isSelected) {
          onSelectElements(selectedElements.filter(el => el.id !== element.id));
        } else {
          onSelectElements([...selectedElements, element]);
        }
      } else {
        onSelectElements([element]);
      }
    }
  }, [connectionMode, connectionStart, selectedElements, onSelectElements, onAddConnection, onUpdateElement, getElementDataType, canElementsConnect]);

  const handleElementDrag = useCallback((id: string, newPos: { x: number; y: number }) => {
    onUpdateElement(id, newPos);
  }, [onUpdateElement]);

  // Zoom functionality
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    // Limit zoom
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStageScale(clampedScale);
    setStagePosition(newPos);
    
    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    stage.batchDraw();
  }, []);

  // Pan functionality - only when dragging the stage background
  const handleStageDragEnd = useCallback((e: any) => {
    if (isDraggingStage || e.target === e.target.getStage()) {
      const newPosition = { x: e.target.x(), y: e.target.y() };
      setStagePosition(newPosition);
    }
  }, [isDraggingStage]);

  // Fit image to canvas
  const fitImageToCanvas = useCallback(() => {
    if (!backgroundImageRef.current) return;
    
    const img = backgroundImageRef.current;
    const canvasWidth = canvasSize.width;
    const canvasHeight = canvasSize.height;
    
    const scaleX = canvasWidth / img.width;
    const scaleY = canvasHeight / img.height;
    const scale = Math.min(scaleX, scaleY);
    
    setBackgroundImageScale({ x: scale, y: scale });
    setBackgroundImageSize({ width: img.width * scale, height: img.height * scale });
  }, [canvasSize]);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
    if (ref?.current) {
      ref.current.scale({ x: 1, y: 1 });
      ref.current.position({ x: 0, y: 0 });
      ref.current.batchDraw();
    }
  }, [ref]);

  // Zoom to fit all elements
  const zoomToFit = useCallback(() => {
    if (project.elements.length === 0) return;
    
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    project.elements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x);
      maxY = Math.max(maxY, element.y);
    });
    
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    const scaleX = canvasSize.width / contentWidth;
    const scaleY = canvasSize.height / contentHeight;
    const scale = Math.min(scaleX, scaleY, 2); // Max zoom 2x
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newPos = {
      x: canvasSize.width / 2 - centerX * scale,
      y: canvasSize.height / 2 - centerY * scale
    };
    
    setStageScale(scale);
    setStagePosition(newPos);
    
    if (ref?.current) {
      ref.current.scale({ x: scale, y: scale });
      ref.current.position(newPos);
      ref.current.batchDraw();
    }
  }, [project.elements, canvasSize, ref]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedElements.length > 0) {
      onDeleteElements(selectedElements.map(el => el.id));
    } else if (e.key === 'c' && e.ctrlKey) {
      setClipboard([...selectedElements]);
      e.preventDefault();
    } else if (e.key === 'v' && e.ctrlKey && clipboard.length > 0) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: el.x + 50,
        y: el.y + 50,
        connections: []
      }));
      newElements.forEach(el => onAddElement(el));
      e.preventDefault();
    } else if (e.key === 'a' && e.ctrlKey) {
      onSelectElements([...project.elements]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setConnectionMode(false);
      setConnectionStart(null);
      onSelectElements([]);
    } else if (e.key === '0' && e.ctrlKey) {
      resetView();
      e.preventDefault();
    } else if (e.key === '1' && e.ctrlKey) {
      zoomToFit();
      e.preventDefault();
    }
  }, [selectedElements, onDeleteElements, clipboard, onAddElement, project.elements, onSelectElements, resetView, zoomToFit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Load background image
  useEffect(() => {
    if (project.backgroundImage) {
      const img = new window.Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        setBackgroundImageSize({ width: img.width, height: img.height });
        fitImageToCanvas();
        ref?.current?.batchDraw();
      };
      img.src = project.backgroundImage;
    }
  }, [project.backgroundImage, fitImageToCanvas, ref]);

  const renderConnections = () => {
    // Only render connections if showConnections is true
    if (!showConnections) return null;

    return project.connections.map(connection => {
      const fromElement = project.elements.find(el => el.id === connection.from);
      const toElement = project.elements.find(el => el.id === connection.to);
      
      if (!fromElement || !toElement) return null;
      
      return (
        <Line
          key={connection.id}
          points={[fromElement.x, fromElement.y, toElement.x, toElement.y]}
          stroke="#10B981"
          strokeWidth={2}
          dash={[5, 5]}
          opacity={0.8}
        />
      );
    });
  };

  // Render drag preview symbol
  const renderDragPreview = () => {
    if (!dragPreview || !dragPreview.visible) return null;

    // Create a temporary element for preview
    const previewElement: ElectricalElement = {
      id: 'preview',
      type: dragPreview.elementType as any,
      x: dragPreview.x,
      y: dragPreview.y,
      rotation: 0,
      properties: getDefaultProperties(dragPreview.elementType),
      connections: [],
      symbolId: dragPreview.symbolId,
      svgUrl: dragPreview.svgUrl
    };

    return (
      <Group opacity={0.7}>
        <SVGElectricalSymbol
          element={previewElement}
          isSelected={false}
          onClick={() => {}}
          onDrag={() => {}}
          connections={[]}
        />
      </Group>
    );
  };

  return (
    <div 
      ref={drop}
      className={`flex-1 bg-gray-100 relative ${isOver ? 'bg-blue-50' : ''}`}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <div className="bg-gray-800 rounded-lg p-2 text-white text-xs">
          Zoom: {Math.round(stageScale * 100)}%
        </div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              const newScale = Math.min(5, stageScale * 1.2);
              setStageScale(newScale);
              if (ref?.current) {
                ref.current.scale({ x: newScale, y: newScale });
                ref.current.batchDraw();
              }
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            +
          </button>
          <button
            onClick={() => {
              const newScale = Math.max(0.1, stageScale / 1.2);
              setStageScale(newScale);
              if (ref?.current) {
                ref.current.scale({ x: newScale, y: newScale });
                ref.current.batchDraw();
              }
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            title="Reset (Ctrl+0)"
          >
            1:1
          </button>
          <button
            onClick={zoomToFit}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
            title="Zoom to fit (Ctrl+1)"
          >
            Fit
          </button>
          {backgroundImageRef.current && (
            <button
              onClick={fitImageToCanvas}
              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs"
              title="Ajuster l'image"
            >
              Img
            </button>
          )}
        </div>
      </div>

      {/* Connection Mode Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <button
          onClick={() => {
            setConnectionMode(!connectionMode);
            setConnectionStart(null);
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            connectionMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {connectionMode ? 'Mode Connexion ON' : 'Mode Connexion'}
        </button>
        {connectionStart && (
          <div className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            Connecter {connectionStart.type} → Sélectionnez un élément compatible
          </div>
        )}
      </div>

      {/* Navigation Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-800 text-white p-2 rounded text-xs opacity-75">
        <div>🖱️ Clic + Glisser : Déplacer la vue</div>
        <div>🔍 Molette : Zoomer/Dézoomer</div>
        <div>⌨️ Ctrl+0 : Reset • Ctrl+1 : Ajuster</div>
        <div>🔗 Mode Connexion : Relier interrupteurs ↔ éclairages</div>
        <div className="mt-1 pt-1 border-t border-gray-600 text-green-300">
          ✅ Positionnement corrigé : Zoom + Pan pris en compte
        </div>
        {planAnalysisResult && (
          <div className="mt-1 pt-1 border-t border-gray-600">
            <div>🏗️ Analyse IA : {Math.round(planAnalysisResult.confidence)}% confiance</div>
          </div>
        )}
      </div>

      <Stage
        ref={ref}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheel}
        draggable={!isSelecting}
        onDragEnd={handleStageDragEnd}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        className="bg-white cursor-grab active:cursor-grabbing"
      >
        <Layer>
          {/* Background Image */}
          {backgroundImageRef.current && (
            <KonvaImage
              image={backgroundImageRef.current}
              opacity={0.7}
              listening={false}
              scaleX={backgroundImageScale.x}
              scaleY={backgroundImageScale.y}
            />
          )}
          
          {/* Grid */}
          {Array.from({ length: Math.ceil(canvasSize.width / 20) }, (_, i) => (
            <Group key={`grid-${i}`}>
              {Array.from({ length: Math.ceil(canvasSize.height / 20) }, (_, j) => (
                <React.Fragment key={`grid-point-${i}-${j}`}>
                  {(i * 20) % 100 === 0 && (j * 20) % 100 === 0 && (
                    <circle
                      x={i * 20}
                      y={j * 20}
                      radius={1}
                      fill="#e5e7eb"
                    />
                  )}
                </React.Fragment>
              ))}
            </Group>
          ))}

          {/* Connections */}
          {renderConnections()}

          {/* Selection Rectangle */}
          {isSelecting && (
            <rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth={1}
              dash={[5, 5]}
            />
          )}

          {/* Drag Preview */}
          {renderDragPreview()}
        </Layer>

        {/* Architectural Overlay */}
        {planAnalysisResult && (
          <ArchitecturalOverlay
            analysisResult={planAnalysisResult}
            visibleElements={architecturalVisibility}
            scale={1}
          />
        )}

        <Layer>
          {/* Electrical Elements - Now using SVG symbols with enhanced connection support */}
          {project.elements.map((element) => (
            <SVGElectricalSymbol
              key={element.id}
              element={element}
              isSelected={selectedElements.some(el => el.id === element.id)}
              onClick={(e) => handleElementClick(element, e)}
              onDrag={(newPos) => handleElementDrag(element.id, newPos)}
              connections={element.connections}
            />
          ))}
        </Layer>
      </Stage>

      {/* Drop overlay */}
      {isOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-500 flex items-center justify-center">
          <div className="text-blue-600 font-medium">
            Relâcher pour placer l'élément
          </div>
        </div>
      )}

      {/* Instructions */}
      {project.elements.length === 0 && !project.backgroundImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-lg font-medium mb-2">Commencez votre conception</h3>
            <p className="text-sm mb-4">
              Importez un plan ou glissez-déposez des éléments depuis la barre d'outils
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Clic + Glisser pour sélection multiple</p>
              <p>• Ctrl+C/V pour copier/coller</p>
              <p>• Mode Connexion pour relier éléments</p>
              <p>• Molette souris pour zoomer</p>
              <p>• Ctrl+0 pour reset zoom, Ctrl+1 pour ajuster</p>
              <p>• <strong>Nouveau :</strong> Symboles SVG normalisés</p>
              <p>• <strong>Connexions :</strong> Interrupteurs ↔ Éclairages</p>
              <p className="text-green-400">• <strong>Corrigé :</strong> Positionnement précis avec zoom/pan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Canvas;