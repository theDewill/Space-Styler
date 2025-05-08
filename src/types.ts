
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 3D model and furniture types
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

export interface Dimensions {
  width: number;
  height: number;
  length: number;
}

export interface Material {
  id: string;
  name: string;
  color: string;
}

export type FurnitureCategory = 'furniture' | 'decoration' | 'structure';

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  model: string; // URL to .obj file
  thumbnail: string; // URL to image thumbnail
  position: Position;
  rotation: Rotation;
  dimensions: Dimensions;
  material: Material;
}

// Room and project types
export interface Point2D {
  x: number;
  y: number;
}

export interface Window {
  id: string;
  position: Position;
  dimensions: Dimensions;
  rotation: Rotation;
}

export interface Door {
  id: string;
  position: Position;
  dimensions: Dimensions;
  rotation: Rotation;
}

export interface Room {
  id: string;
  name: string;
  dimensions: Dimensions;
  wallColor: string;
  floorMaterial: Material;
  ceiling: number;
  windows: Window[];
  doors: Door[];
  customShape?: Point2D[]; // For custom room shapes
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  room: Room;
  furniture: FurnitureItem[];
}

// View state types
export interface ViewState {
  mode: '2d' | '3d';
  camera: {
    position: Position;
    target: Position;
    zoom: number;
  };
  selectedFurnitureId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  showGrid: boolean;
  showDimensions: boolean;
  isDrawingRoom: boolean;
}

// Helper types
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}
