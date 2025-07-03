export interface ArchitecturalElement {
  id: string;
  type: ArchitecturalElementType;
  points: Point[];
  properties: Record<string, any>;
  room?: string;
  dimensions?: {
    width?: number;
    height?: number;
    length?: number;
  };
}

export type ArchitecturalElementType = 
  | 'wall'
  | 'partition'
  | 'door'
  | 'window'
  | 'room'
  | 'furniture'
  | 'dimension'
  | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  area: number;
  perimeter: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  walls: string[];
  doors: string[];
  windows: string[];
  furniture: string[];
}

export type RoomType = 
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'toilet'
  | 'hallway'
  | 'office'
  | 'storage'
  | 'garage'
  | 'balcony'
  | 'other';

export interface PlanAnalysisResult {
  walls: ArchitecturalElement[];
  partitions: ArchitecturalElement[];
  doors: ArchitecturalElement[];
  windows: ArchitecturalElement[];
  rooms: Room[];
  furniture: ArchitecturalElement[];
  dimensions: ArchitecturalElement[];
  texts: ArchitecturalElement[];
  scale?: number;
  confidence: number;
}

export interface AnalysisSettings {
  detectWalls: boolean;
  detectDoors: boolean;
  detectWindows: boolean;
  detectRooms: boolean;
  detectFurniture: boolean;
  detectDimensions: boolean;
  detectText: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  minWallLength: number;
  minRoomArea: number;
}