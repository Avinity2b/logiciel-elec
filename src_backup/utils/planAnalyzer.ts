import { ArchitecturalElement, PlanAnalysisResult, AnalysisSettings, Room, Point } from '../types/architectural';

export class PlanAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData | null = null;
  private settings: AnalysisSettings;

  constructor(settings: AnalysisSettings) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.settings = settings;
  }

  async analyzeImage(imageUrl: string): Promise<PlanAnalysisResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);
          this.imageData = this.ctx.getImageData(0, 0, img.width, img.height);
          
          const result = await this.performAnalysis();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = imageUrl;
    });
  }

  private async performAnalysis(): Promise<PlanAnalysisResult> {
    if (!this.imageData) {
      throw new Error('Aucune image à analyser');
    }

    const result: PlanAnalysisResult = {
      walls: [],
      partitions: [],
      doors: [],
      windows: [],
      rooms: [],
      furniture: [],
      dimensions: [],
      texts: [],
      confidence: 0
    };

    // Préprocessing de l'image
    const processedImage = this.preprocessImage(this.imageData);
    
    // Détection des différents éléments
    if (this.settings.detectWalls) {
      result.walls = await this.detectWalls(processedImage);
    }
    
    if (this.settings.detectDoors) {
      result.doors = await this.detectDoors(processedImage);
    }
    
    if (this.settings.detectWindows) {
      result.windows = await this.detectWindows(processedImage);
    }
    
    if (this.settings.detectRooms) {
      result.rooms = await this.detectRooms(processedImage, result.walls);
    }
    
    if (this.settings.detectFurniture) {
      result.furniture = await this.detectFurniture(processedImage);
    }
    
    if (this.settings.detectDimensions) {
      result.dimensions = await this.detectDimensions(processedImage);
    }
    
    if (this.settings.detectText) {
      result.texts = await this.detectTexts(processedImage);
    }

    // Calcul de la confiance globale
    result.confidence = this.calculateConfidence(result);
    
    return result;
  }

  private preprocessImage(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    // Conversion en niveaux de gris
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // Amélioration du contraste
    this.enhanceContrast(data);
    
    // Réduction du bruit
    this.reduceNoise(data, width, height);

    return new ImageData(data, width, height);
  }

  private enhanceContrast(data: Uint8ClampedArray): void {
    const factor = 1.5; // Facteur d'amélioration du contraste
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
      data[i + 1] = data[i];
      data[i + 2] = data[i];
    }
  }

  private reduceNoise(data: Uint8ClampedArray, width: number, height: number): void {
    const original = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let sum = 0;
        let count = 0;
        
        // Filtre médian 3x3
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
            sum += original[neighborIdx];
            count++;
          }
        }
        
        const average = sum / count;
        data[idx] = average;
        data[idx + 1] = average;
        data[idx + 2] = average;
      }
    }
  }

  private async detectWalls(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const walls: ArchitecturalElement[] = [];
    const edges = this.detectEdges(imageData);
    const lines = this.detectLines(edges);
    
    // Filtrer et regrouper les lignes pour former des murs
    const wallLines = lines.filter(line => {
      const length = this.calculateLineLength(line.points);
      return length >= this.settings.minWallLength;
    });

    // Regrouper les lignes parallèles proches pour former des murs épais
    const groupedWalls = this.groupParallelLines(wallLines);
    
    groupedWalls.forEach((wallGroup, index) => {
      walls.push({
        id: `wall-${index}`,
        type: 'wall',
        points: wallGroup.points,
        properties: {
          thickness: wallGroup.thickness || 20,
          material: 'concrete',
          structural: true
        }
      });
    });

    return walls;
  }

  private async detectDoors(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const doors: ArchitecturalElement[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Recherche de motifs caractéristiques des portes (arcs, rectangles avec ouverture)
    for (let y = 0; y < height - 50; y += 10) {
      for (let x = 0; x < width - 30; x += 10) {
        if (this.isDoorPattern(data, x, y, width)) {
          doors.push({
            id: `door-${doors.length}`,
            type: 'door',
            points: [
              { x, y },
              { x: x + 30, y },
              { x: x + 30, y: y + 50 },
              { x, y: y + 50 }
            ],
            properties: {
              width: 80,
              height: 200,
              openingDirection: 'right',
              type: 'standard'
            }
          });
        }
      }
    }

    return doors;
  }

  private async detectWindows(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const windows: ArchitecturalElement[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Recherche de motifs caractéristiques des fenêtres (rectangles avec lignes internes)
    for (let y = 0; y < height - 40; y += 10) {
      for (let x = 0; x < width - 60; x += 10) {
        if (this.isWindowPattern(data, x, y, width)) {
          windows.push({
            id: `window-${windows.length}`,
            type: 'window',
            points: [
              { x, y },
              { x: x + 60, y },
              { x: x + 60, y: y + 40 },
              { x, y: y + 40 }
            ],
            properties: {
              width: 120,
              height: 100,
              type: 'standard',
              glazing: 'double'
            }
          });
        }
      }
    }

    return windows;
  }

  private async detectRooms(imageData: ImageData, walls: ArchitecturalElement[]): Promise<Room[]> {
    const rooms: Room[] = [];
    
    // Utilisation d'un algorithme de flood fill pour détecter les espaces fermés
    const visited = new Set<string>();
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 10; y < height - 10; y += 20) {
      for (let x = 10; x < width - 10; x += 20) {
        const key = `${x},${y}`;
        if (!visited.has(key) && this.isEmptySpace(data, x, y, width)) {
          const roomBounds = this.floodFillRoom(data, x, y, width, height, visited);
          
          if (roomBounds && this.calculateArea(roomBounds) >= this.settings.minRoomArea) {
            const roomType = this.classifyRoom(roomBounds, walls);
            
            rooms.push({
              id: `room-${rooms.length}`,
              name: this.generateRoomName(roomType, rooms.length),
              type: roomType,
              area: this.calculateArea(roomBounds),
              perimeter: this.calculatePerimeter(roomBounds),
              bounds: roomBounds,
              walls: [],
              doors: [],
              windows: [],
              furniture: []
            });
          }
        }
      }
    }

    return rooms;
  }

  private async detectFurniture(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const furniture: ArchitecturalElement[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Détection de formes géométriques caractéristiques du mobilier
    const shapes = this.detectShapes(imageData);
    
    shapes.forEach((shape, index) => {
      const furnitureType = this.classifyFurniture(shape);
      if (furnitureType) {
        furniture.push({
          id: `furniture-${index}`,
          type: 'furniture',
          points: shape.points,
          properties: {
            furnitureType,
            movable: true
          }
        });
      }
    });

    return furniture;
  }

  private async detectDimensions(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const dimensions: ArchitecturalElement[] = [];
    
    // Recherche de lignes de cote avec flèches et texte
    const lines = this.detectLines(imageData);
    const texts = await this.detectTexts(imageData);
    
    lines.forEach((line, index) => {
      if (this.isDimensionLine(line, texts)) {
        const associatedText = this.findAssociatedText(line, texts);
        dimensions.push({
          id: `dimension-${index}`,
          type: 'dimension',
          points: line.points,
          properties: {
            value: associatedText?.value || 0,
            unit: 'cm',
            precision: 1
          }
        });
      }
    });

    return dimensions;
  }

  private async detectTexts(imageData: ImageData): Promise<ArchitecturalElement[]> {
    const texts: ArchitecturalElement[] = [];
    
    // Simulation de reconnaissance de texte (OCR)
    // Dans une implémentation réelle, on utiliserait Tesseract.js ou une API OCR
    const textRegions = this.detectTextRegions(imageData);
    
    textRegions.forEach((region, index) => {
      texts.push({
        id: `text-${index}`,
        type: 'text',
        points: region.bounds,
        properties: {
          content: region.text || 'Texte détecté',
          fontSize: region.fontSize || 12,
          font: 'Arial'
        }
      });
    });

    return texts;
  }

  // Méthodes utilitaires pour la détection

  private detectEdges(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const edges = new Uint8ClampedArray(data.length);

    // Filtre de Sobel pour la détection de contours
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let i = 0; i < 9; i++) {
          const dx = (i % 3) - 1;
          const dy = Math.floor(i / 3) - 1;
          const idx = ((y + dy) * width + (x + dx)) * 4;
          const pixel = data[idx];
          
          gx += pixel * sobelX[i];
          gy += pixel * sobelY[i];
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const idx = (y * width + x) * 4;
        
        edges[idx] = magnitude > 50 ? 255 : 0;
        edges[idx + 1] = edges[idx];
        edges[idx + 2] = edges[idx];
        edges[idx + 3] = 255;
      }
    }

    return new ImageData(edges, width, height);
  }

  private detectLines(imageData: ImageData): Array<{ points: Point[], angle: number, length: number }> {
    // Implémentation simplifiée de la transformée de Hough pour détecter les lignes
    const lines: Array<{ points: Point[], angle: number, length: number }> = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Recherche de segments de lignes horizontales et verticales
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const idx = (y * width + x) * 4;
        if (data[idx] > 128) { // Pixel de contour
          // Recherche de ligne horizontale
          const hLine = this.traceHorizontalLine(data, x, y, width, height);
          if (hLine.length > this.settings.minWallLength) {
            lines.push({
              points: [{ x, y }, { x: x + hLine.length, y }],
              angle: 0,
              length: hLine.length
            });
          }
          
          // Recherche de ligne verticale
          const vLine = this.traceVerticalLine(data, x, y, width, height);
          if (vLine.length > this.settings.minWallLength) {
            lines.push({
              points: [{ x, y }, { x, y: y + vLine.length }],
              angle: 90,
              length: vLine.length
            });
          }
        }
      }
    }

    return lines;
  }

  private detectShapes(imageData: ImageData): Array<{ points: Point[], type: string }> {
    const shapes: Array<{ points: Point[], type: string }> = [];
    const contours = this.findContours(imageData);
    
    contours.forEach(contour => {
      const shape = this.analyzeContour(contour);
      if (shape) {
        shapes.push(shape);
      }
    });

    return shapes;
  }

  // Méthodes de classification et d'analyse

  private classifyRoom(bounds: any, walls: ArchitecturalElement[]): any {
    const area = this.calculateArea(bounds);
    const aspectRatio = (bounds.maxX - bounds.minX) / (bounds.maxY - bounds.minY);
    
    // Classification basique basée sur la taille et les proportions
    if (area < 5) return 'toilet';
    if (area < 10 && aspectRatio > 1.5) return 'hallway';
    if (area < 15) return 'bathroom';
    if (area < 25) return 'bedroom';
    if (area > 40) return 'living_room';
    return 'other';
  }

  private classifyFurniture(shape: any): string | null {
    const area = this.calculateShapeArea(shape.points);
    const aspectRatio = this.calculateAspectRatio(shape.points);
    
    // Classification basique du mobilier
    if (shape.type === 'rectangle') {
      if (area < 2 && aspectRatio > 2) return 'table';
      if (area < 1) return 'chair';
      if (aspectRatio > 3) return 'sofa';
    } else if (shape.type === 'circle') {
      return 'table';
    }
    
    return null;
  }

  private calculateConfidence(result: PlanAnalysisResult): number {
    let confidence = 0;
    let factors = 0;

    // Facteurs de confiance basés sur les éléments détectés
    if (result.walls.length > 0) {
      confidence += 0.3;
      factors++;
    }
    
    if (result.rooms.length > 0) {
      confidence += 0.3;
      factors++;
    }
    
    if (result.doors.length > 0) {
      confidence += 0.2;
      factors++;
    }
    
    if (result.windows.length > 0) {
      confidence += 0.1;
      factors++;
    }
    
    if (result.dimensions.length > 0) {
      confidence += 0.1;
      factors++;
    }

    return factors > 0 ? (confidence / factors) * 100 : 0;
  }

  // Méthodes utilitaires privées (implémentations simplifiées)

  private isDoorPattern(data: Uint8ClampedArray, x: number, y: number, width: number): boolean {
    // Logique simplifiée de détection de motif de porte
    return Math.random() < 0.1; // Simulation
  }

  private isWindowPattern(data: Uint8ClampedArray, x: number, y: number, width: number): boolean {
    // Logique simplifiée de détection de motif de fenêtre
    return Math.random() < 0.05; // Simulation
  }

  private isEmptySpace(data: Uint8ClampedArray, x: number, y: number, width: number): boolean {
    const idx = (y * width + x) * 4;
    return data[idx] > 200; // Espace blanc/vide
  }

  private floodFillRoom(data: Uint8ClampedArray, startX: number, startY: number, width: number, height: number, visited: Set<string>): any {
    // Implémentation simplifiée du flood fill
    return {
      minX: startX - 50,
      minY: startY - 50,
      maxX: startX + 50,
      maxY: startY + 50
    };
  }

  private calculateArea(bounds: any): number {
    return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY) / 10000; // Conversion en m²
  }

  private calculatePerimeter(bounds: any): number {
    return 2 * ((bounds.maxX - bounds.minX) + (bounds.maxY - bounds.minY)) / 100; // Conversion en m
  }

  private calculateLineLength(points: Point[]): number {
    if (points.length < 2) return 0;
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private groupParallelLines(lines: any[]): any[] {
    // Implémentation simplifiée du regroupement de lignes parallèles
    return lines.map(line => ({
      points: line.points,
      thickness: 20
    }));
  }

  private traceHorizontalLine(data: Uint8ClampedArray, startX: number, y: number, width: number, height: number): { length: number } {
    let length = 0;
    for (let x = startX; x < width && data[(y * width + x) * 4] > 128; x++) {
      length++;
    }
    return { length };
  }

  private traceVerticalLine(data: Uint8ClampedArray, x: number, startY: number, width: number, height: number): { length: number } {
    let length = 0;
    for (let y = startY; y < height && data[(y * width + x) * 4] > 128; y++) {
      length++;
    }
    return { length };
  }

  private findContours(imageData: ImageData): Point[][] {
    // Implémentation simplifiée de détection de contours
    return [];
  }

  private analyzeContour(contour: Point[]): { points: Point[], type: string } | null {
    // Analyse simplifiée de contour
    return null;
  }

  private isDimensionLine(line: any, texts: any[]): boolean {
    // Vérification si une ligne est une ligne de cote
    return false;
  }

  private findAssociatedText(line: any, texts: any[]): any {
    // Recherche du texte associé à une ligne de cote
    return null;
  }

  private detectTextRegions(imageData: ImageData): any[] {
    // Détection simplifiée de régions de texte
    return [];
  }

  private calculateShapeArea(points: Point[]): number {
    // Calcul de l'aire d'une forme
    return 0;
  }

  private calculateAspectRatio(points: Point[]): number {
    // Calcul du ratio d'aspect
    return 1;
  }

  private generateRoomName(type: any, index: number): string {
    const names: Record<string, string> = {
      living_room: 'Salon',
      bedroom: 'Chambre',
      kitchen: 'Cuisine',
      bathroom: 'Salle de bain',
      toilet: 'WC',
      hallway: 'Couloir',
      office: 'Bureau',
      storage: 'Rangement',
      garage: 'Garage',
      balcony: 'Balcon',
      other: 'Pièce'
    };
    
    return `${names[type] || 'Pièce'} ${index + 1}`;
  }
}