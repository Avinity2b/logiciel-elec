import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Check, 
  X,
  Square,
  Maximize2,
  CornerUpLeft
} from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PDFCropToolProps {
  imageData: string;
  onCropComplete: (croppedImageData: string, cropArea: CropArea) => void;
  onCancel: () => void;
  originalWidth: number;
  originalHeight: number;
}

const PDFCropTool: React.FC<PDFCropToolProps> = ({
  imageData,
  onCropComplete,
  onCancel,
  originalWidth,
  originalHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: originalWidth * 0.8,
    height: originalHeight * 0.8
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Charger et dessiner l'image
  useEffect(() => {
    if (!canvasRef.current || !imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Configurer les dimensions du canvas
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;
      
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const initialScale = Math.min(scaleX, scaleY) * 0.8;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      setZoom(initialScale);
      setImageLoaded(true);
      
      // Centrer l'image
      const centeredX = (containerWidth - img.width * initialScale) / 2;
      const centeredY = (containerHeight - img.height * initialScale) / 2;
      setPanOffset({ x: centeredX, y: centeredY });
      
      // Initialiser la zone de découpage au centre
      setCropArea({
        x: img.width * 0.1,
        y: img.height * 0.1,
        width: img.width * 0.8,
        height: img.height * 0.8
      });
      
      drawCanvas(ctx, img, initialScale, { x: centeredX, y: centeredY });
    };

    img.src = imageData;
  }, [imageData]);

  // Fonction de dessin du canvas
  const drawCanvas = useCallback((
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    currentZoom: number, 
    currentPanOffset: { x: number; y: number }
  ) => {
    if (!ctx || !img) return;

    const canvas = ctx.canvas;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner l'image avec zoom et pan
    ctx.save();
    ctx.drawImage(
      img, 
      currentPanOffset.x, 
      currentPanOffset.y, 
      img.width * currentZoom, 
      img.height * currentZoom
    );
    
    // Dessiner la zone de découpage
    const cropX = currentPanOffset.x + cropArea.x * currentZoom;
    const cropY = currentPanOffset.y + cropArea.y * currentZoom;
    const cropWidth = cropArea.width * currentZoom;
    const cropHeight = cropArea.height * currentZoom;
    
    // Overlay sombre sur les zones non sélectionnées
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zone claire pour la sélection
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropX, cropY, cropWidth, cropHeight);
    ctx.globalCompositeOperation = 'source-over';
    
    // Bordure de la zone de découpage
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    
    // Poignées de redimensionnement
    const handleSize = 8;
    const handles = [
      { x: cropX - handleSize/2, y: cropY - handleSize/2, cursor: 'nw-resize', id: 'nw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY - handleSize/2, cursor: 'ne-resize', id: 'ne' },
      { x: cropX - handleSize/2, y: cropY + cropHeight - handleSize/2, cursor: 'sw-resize', id: 'sw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY + cropHeight - handleSize/2, cursor: 'se-resize', id: 'se' },
      { x: cropX + cropWidth/2 - handleSize/2, y: cropY - handleSize/2, cursor: 'n-resize', id: 'n' },
      { x: cropX + cropWidth/2 - handleSize/2, y: cropY + cropHeight - handleSize/2, cursor: 's-resize', id: 's' },
      { x: cropX - handleSize/2, y: cropY + cropHeight/2 - handleSize/2, cursor: 'w-resize', id: 'w' },
      { x: cropX + cropWidth - handleSize/2, y: cropY + cropHeight/2 - handleSize/2, cursor: 'e-resize', id: 'e' }
    ];
    
    ctx.fillStyle = '#3b82f6';
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    ctx.restore();
  }, [cropArea]);

  // Redessiner quand les paramètres changent
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      drawCanvas(ctx, img, zoom, panOffset);
    };
    
    img.src = imageData;
  }, [cropArea, zoom, panOffset, imageLoaded, drawCanvas, imageData]);

  // Gestion des événements de souris
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convertir les coordonnées canvas en coordonnées image
    const cropX = panOffset.x + cropArea.x * zoom;
    const cropY = panOffset.y + cropArea.y * zoom;
    const cropWidth = cropArea.width * zoom;
    const cropHeight = cropArea.height * zoom;
    
    // Vérifier si on clique sur une poignée de redimensionnement
    const handleSize = 8;
    const handles = [
      { x: cropX - handleSize/2, y: cropY - handleSize/2, id: 'nw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY - handleSize/2, id: 'ne' },
      { x: cropX - handleSize/2, y: cropY + cropHeight - handleSize/2, id: 'sw' },
      { x: cropX + cropWidth - handleSize/2, y: cropY + cropHeight - handleSize/2, id: 'se' },
      { x: cropX + cropWidth/2 - handleSize/2, y: cropY - handleSize/2, id: 'n' },
      { x: cropX + cropWidth/2 - handleSize/2, y: cropY + cropHeight - handleSize/2, id: 's' },
      { x: cropX - handleSize/2, y: cropY + cropHeight/2 - handleSize/2, id: 'w' },
      { x: cropX + cropWidth - handleSize/2, y: cropY + cropHeight/2 - handleSize/2, id: 'e' }
    ];
    
    for (const handle of handles) {
      if (x >= handle.x && x <= handle.x + handleSize && 
          y >= handle.y && y <= handle.y + handleSize) {
        setIsResizing(true);
        setResizeHandle(handle.id);
        setDragStart({ x, y });
        return;
      }
    }
    
    // Vérifier si on clique dans la zone de découpage pour la déplacer
    if (x >= cropX && x <= cropX + cropWidth && 
        y >= cropY && y <= cropY + cropHeight) {
      setIsDragging(true);
      setDragStart({ x: x - cropX, y: y - cropY });
    }
  }, [cropArea, zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      // Déplacer la zone de découpage
      const newX = (x - dragStart.x - panOffset.x) / zoom;
      const newY = (y - dragStart.y - panOffset.y) / zoom;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, originalWidth - prev.width)),
        y: Math.max(0, Math.min(newY, originalHeight - prev.height))
      }));
    } else if (isResizing) {
      // Redimensionner la zone de découpage
      const deltaX = (x - dragStart.x) / zoom;
      const deltaY = (y - dragStart.y) / zoom;
      
      setCropArea(prev => {
        let newCrop = { ...prev };
        
        switch (resizeHandle) {
          case 'nw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(50, prev.width - deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
          case 'se':
            newCrop.width = Math.max(50, prev.width + deltaX);
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
          case 'n':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.height = Math.max(50, prev.height - deltaY);
            break;
          case 's':
            newCrop.height = Math.max(50, prev.height + deltaY);
            break;
          case 'w':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(50, prev.width - deltaX);
            break;
          case 'e':
            newCrop.width = Math.max(50, prev.width + deltaX);
            break;
        }
        
        // Assurer que la zone reste dans les limites
        if (newCrop.x + newCrop.width > originalWidth) {
          newCrop.width = originalWidth - newCrop.x;
        }
        if (newCrop.y + newCrop.height > originalHeight) {
          newCrop.height = originalHeight - newCrop.y;
        }
        
        return newCrop;
      });
      
      setDragStart({ x, y });
    }
  }, [isDragging, isResizing, dragStart, zoom, panOffset, resizeHandle, originalWidth, originalHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // Fonctions de zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const initialScale = Math.min(scaleX, scaleY) * 0.8;
    
    setZoom(initialScale);
    
    const centeredX = (containerWidth - originalWidth * initialScale) / 2;
    const centeredY = (containerHeight - originalHeight * initialScale) / 2;
    setPanOffset({ x: centeredX, y: centeredY });
  }, [originalWidth, originalHeight]);

  // Sélection de zones prédéfinies
  const handlePresetSelection = useCallback((preset: string) => {
    const margin = Math.min(originalWidth, originalHeight) * 0.05;
    
    switch (preset) {
      case 'full':
        setCropArea({ x: 0, y: 0, width: originalWidth, height: originalHeight });
        break;
      case 'center':
        setCropArea({
          x: originalWidth * 0.25,
          y: originalHeight * 0.25,
          width: originalWidth * 0.5,
          height: originalHeight * 0.5
        });
        break;
      case 'top':
        setCropArea({
          x: margin,
          y: margin,
          width: originalWidth - 2 * margin,
          height: originalHeight * 0.4
        });
        break;
      case 'bottom':
        setCropArea({
          x: margin,
          y: originalHeight * 0.6,
          width: originalWidth - 2 * margin,
          height: originalHeight * 0.4 - margin
        });
        break;
    }
  }, [originalWidth, originalHeight]);

  // Effectuer le découpage
  const handleCrop = useCallback(() => {
    if (!imageData) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      
      const croppedImageData = canvas.toDataURL('image/png', 1.0);
      onCropComplete(croppedImageData, cropArea);
    };
    
    img.src = imageData;
  }, [imageData, cropArea, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header avec contrôles */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Crop className="w-5 h-5 mr-2" />
              Rogner le PDF
            </h3>
            
            {/* Contrôles de zoom */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                title="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                title="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                title="Réinitialiser le zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sélections prédéfinies */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Sélections rapides:</span>
            <button
              onClick={() => handlePresetSelection('full')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Tout
            </button>
            <button
              onClick={() => handlePresetSelection('center')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Centre
            </button>
            <button
              onClick={() => handlePresetSelection('top')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Haut
            </button>
            <button
              onClick={() => handlePresetSelection('bottom')}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Bas
            </button>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Annuler</span>
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2 font-semibold"
            >
              <Check className="w-4 h-4" />
              <span>Valider et importer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone de découpage */}
      <div className="flex-1 overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Infos sur la sélection et boutons d'action principaux */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <span>
              Position: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}
            </span>
            <span>
              Taille: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </span>
            <span>
              Ratio: {((cropArea.width / cropArea.height) * 100 / 100).toFixed(2)}
            </span>
          </div>
          
          {/* Boutons d'action principaux dans le footer */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Annuler</span>
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2 font-semibold shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Valider et importer</span>
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          Glissez pour déplacer • Utilisez les poignées pour redimensionner • Molette pour zoomer
        </div>
      </div>
    </div>
  );
};

export default PDFCropTool;