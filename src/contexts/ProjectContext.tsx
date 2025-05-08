import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, FurnitureItem, Room, Material, ViewState } from '../types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  customModels: FurnitureItem[];
  materials: Material[];
  view: ViewState;
  isDragging: boolean;
  setView: (view: Partial<ViewState>) => void;
  createNewProject: (name: string, roomDimensions: { width: number, length: number, height: number }) => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  addFurniture: (item: FurnitureItem) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  removeFurniture: (id: string) => void;
  setIsDragging: (isDragging: boolean) => void;
  updateRoomProperties: (updates: Partial<Room>) => void;
  addCustomModel: (model: FurnitureItem) => void;
  removeCustomModel: (id: string) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  importScene: (sceneData: Partial<Project>) => void; // Function for scene import
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Mock materials
const mockMaterials: Material[] = [
  { id: 'fabric-1', name: 'Blue Fabric', color: '#2563eb' },
  { id: 'fabric-2', name: 'Gray Fabric', color: '#64748b' },
  { id: 'fabric-3', name: 'Beige Fabric', color: '#d4a76a' },
  { id: 'leather-1', name: 'Black Leather', color: '#1e293b' },
  { id: 'leather-2', name: 'Brown Leather', color: '#92400e' },
  { id: 'wood-1', name: 'Oak', color: '#a16207' },
  { id: 'wood-2', name: 'Walnut', color: '#7c2d12' },
  { id: 'wood-3', name: 'Maple', color: '#ca8a04' },
  { id: 'metal-1', name: 'Chrome', color: '#cbd5e1' },
  { id: 'metal-2', name: 'Brushed Steel', color: '#94a3b8' },
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [customModels, setCustomModels] = useState<FurnitureItem[]>([]);
  const [materials] = useState<Material[]>(mockMaterials);
  const [isDragging, setIsDragging] = useState(false);
  const [view, setViewState] = useState<ViewState>({
    mode: '2d',
    camera: {
      position: { x: 0, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
    },
    selectedFurnitureId: null,
    transformMode: 'translate', // Default transform mode
    showGrid: true,
    showDimensions: true,
    isDrawingRoom: false,
  });

  // Load projects from local storage on mount
  useEffect(() => {
    // Use a consistent storage key since we don't have user-specific data
    const storageKey = 'furniture-app-projects';
    const savedProjects = localStorage.getItem(storageKey);
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        })));
      } catch (err) {
        console.error('Error loading projects', err);
      }
    }

    // Load custom models from local storage
    const savedCustomModels = localStorage.getItem('furniture-app-custom-models');
    if (savedCustomModels) {
      try {
        const parsedCustomModels = JSON.parse(savedCustomModels);
        setCustomModels(parsedCustomModels);
      } catch (err) {
        console.error('Error loading custom models', err);
      }
    }
  }, []);

  // Save projects to local storage
  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    const storageKey = 'furniture-app-projects';
    localStorage.setItem(storageKey, JSON.stringify(updatedProjects));
  };

  // Save custom models to local storage
  const saveCustomModelsToStorage = (updatedCustomModels: FurnitureItem[]) => {
    localStorage.setItem('furniture-app-custom-models', JSON.stringify(updatedCustomModels));
  };

  const createNewProject = (name: string, roomDimensions: { width: number, length: number, height: number }) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      room: {
        id: `room-${Date.now()}`,
        name: 'Main Room',
        dimensions: {
          width: roomDimensions.width,
          length: roomDimensions.length,
          height: roomDimensions.height,
        },
        wallColor: '#FFFFFF',
        floorMaterial: { id: 'wood-1', name: 'Oak', color: '#a16207' },
        ceiling: roomDimensions.height,
        windows: [],
        doors: [],
      },
      furniture: [],
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    saveProjectsToStorage(updatedProjects);
  };

  const loadProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
    }
  };

  const saveProject = () => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      updatedAt: new Date(),
    };
    
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setCurrentProject(updatedProject);
    saveProjectsToStorage(updatedProjects);
  };

  const addFurniture = (item: FurnitureItem) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      furniture: [...currentProject.furniture, item],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const updateFurniture = (id: string, updates: Partial<FurnitureItem>) => {
    if (!currentProject) return;
    
    const updatedFurniture = currentProject.furniture.map(item => {
      if (item.id === id) {
        // Create a new furniture item with the updates
        const updatedItem = { ...item, ...updates };
        
        // If position is updated, ensure Y value is preserved
        if (updates.position) {
          updatedItem.position = {
            ...item.position,
            ...updates.position,
          };
        }
        
        return updatedItem;
      }
      return item;
    });
    
    const updatedProject = {
      ...currentProject,
      furniture: updatedFurniture,
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const removeFurniture = (id: string) => {
    if (!currentProject) return;
    
    const updatedFurniture = currentProject.furniture.filter(item => item.id !== id);
    
    const updatedProject = {
      ...currentProject,
      furniture: updatedFurniture,
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    
    // If the deleted furniture was selected, clear the selection
    if (view.selectedFurnitureId === id) {
      setView({ selectedFurnitureId: null });
    }
    
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const updateRoomProperties = (updates: Partial<Room>) => {
    if (!currentProject) return;
    
    const updatedRoom = {
      ...currentProject.room,
      ...updates,
    };
    
    const updatedProject = {
      ...currentProject,
      room: updatedRoom,
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const addCustomModel = (model: FurnitureItem) => {
    const updatedCustomModels = [...customModels, model];
    setCustomModels(updatedCustomModels);
    saveCustomModelsToStorage(updatedCustomModels);
  };

  const removeCustomModel = (id: string) => {
    const updatedCustomModels = customModels.filter(model => model.id !== id);
    setCustomModels(updatedCustomModels);
    saveCustomModelsToStorage(updatedCustomModels);
  };

  // Enhanced setView function to handle mode changes correctly
  const setView = (newView: Partial<ViewState>) => {
    setViewState(prev => {
      const updatedView = { ...prev, ...newView };
      
      // When switching from 2D to 3D view, ensure we have a valid transform mode
      if (newView.mode === '3d' && !updatedView.transformMode) {
        updatedView.transformMode = 'translate';
      }
      
      return updatedView;
    });
  };
  
  // Enhanced setTransformMode function to ensure it works properly
  const setTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
    setViewState(prev => ({
      ...prev,
      transformMode: mode
    }));
  };

  // New function to import a scene
  const importScene = (sceneData: Partial<Project>) => {
    if (!sceneData.room) return;
    
    // Create a new project with imported data
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: sceneData.name || 'Imported Scene',
      createdAt: new Date(),
      updatedAt: new Date(),
      room: {
        ...sceneData.room as Room,
        id: sceneData.room.id || `room-${Date.now()}`,
        name: sceneData.room.name || 'Main Room',
        windows: sceneData.room.windows || [],
        doors: sceneData.room.doors || [],
      },
      furniture: sceneData.furniture || [],
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    saveProjectsToStorage(updatedProjects);
    
    // Set view to 3D to see the imported scene
    setView({ mode: '3d' });
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentProject, 
      customModels,
      materials,
      view,
      isDragging,
      setView, 
      createNewProject, 
      loadProject, 
      saveProject,
      addFurniture,
      updateFurniture,
      removeFurniture,
      setIsDragging,
      updateRoomProperties,
      addCustomModel,
      removeCustomModel,
      setTransformMode,
      importScene,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
