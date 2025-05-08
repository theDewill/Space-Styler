
// Room and furniture types
export interface Dimensions {
  width: number;
  height: number;
  length: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export type FurnitureCategory = 'chair' | 'table' | 'sofa' | 'bed' | 'storage' | 'decoration';
export type FurnitureCategoryType = FurnitureCategory | 'all';

export interface Material {
  id: string;
  name: string;
  color: string;
  texture?: string;
  roughness?: number;
  metalness?: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  model: string; // path to 3D model
  thumbnail: string;
  dimensions: Dimensions;
  position: Position;
  rotation: Rotation;
  material: Material;
  price?: number;
}

export interface Room {
  id: string;
  name: string;
  dimensions: Dimensions;
  wallColor: string;
  floorMaterial: Material;
  ceiling: number; // height
  windows: Position[];
  doors: Position[];
  customShape?: Point2D[]; // Add support for custom room shape
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  room: Room;
  furniture: FurnitureItem[];
  clientName?: string;
  notes?: string;
}

// App state types
export interface ViewState {
  mode: '2d' | '3d';
  camera: {
    position: Position;
    target: Position;
    zoom: number;
  };
  selectedFurnitureId: string | null;
  transformMode?: 'translate' | 'rotate' | 'scale'; // Property for transform controls
  showGrid: boolean;
  showDimensions: boolean;
  isDrawingRoom: boolean;
}

export interface AppState {
  projects: Project[];
  currentProject: Project | null;
  furnitureCatalog: FurnitureItem[];
  customModels: FurnitureItem[];
  materials: Material[];
  view: ViewState;
  isDragging: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
