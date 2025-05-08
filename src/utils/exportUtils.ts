
import { Project, FurnitureItem } from "@/types";
import { toast } from "sonner";
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

// Helper to create a download
const downloadFile = (content: string | Blob, fileName: string, mimeType: string) => {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { type: mimeType });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 2D Export (PNG/SVG)
export const exportTo2D = (project: Project) => {
  // Find the canvas element for the 2D view
  const canvas = document.querySelector('.canvas-2d canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    toast('Export failed', { 
      description: 'Please make sure you are in the 2D view and try again.'
    });
    return;
  }
  
  try {
    // Export as PNG
    const dataUrl = canvas.toDataURL('image/png');
    const projectName = project.name.replace(/\s+/g, '_').toLowerCase();
    downloadFile(dataUrl, `${projectName}_2d_layout.png`, 'image/png');
    
    toast('2D export complete', {
      description: 'Your 2D room layout has been downloaded as a PNG file.'
    });
  } catch (error) {
    console.error('Error exporting 2D view:', error);
    toast('Export failed', {
      description: 'An error occurred while exporting. Please try again.',
    });
  }
};

// 3D Export (GLTF/GLB/OBJ)
export const exportTo3D = (project: Project) => {
  // For simplicity, we'll create a basic 3D scene based on the project data
  // A more complete implementation would extract the actual scene from the ThreeJS canvas
  
  // Create a new scene
  const scene = new THREE.Scene();
  
  // Add room (floor and walls)
  const roomGroup = new THREE.Group();
  
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(
    project.room.dimensions.width, 
    project.room.dimensions.length
  );
  const floorMaterial = new THREE.MeshBasicMaterial({ 
    color: project.room.floorMaterial.color,
    side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  roomGroup.add(floor);
  
  // Walls (simplified as boxes)
  const wallMaterial = new THREE.MeshBasicMaterial({ color: project.room.wallColor });
  
  // Create walls
  const wallThickness = 0.1;
  
  // Front wall
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(project.room.dimensions.width, project.room.dimensions.height, wallThickness),
    wallMaterial
  );
  frontWall.position.set(
    project.room.dimensions.width / 2,
    project.room.dimensions.height / 2,
    0
  );
  roomGroup.add(frontWall);
  
  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(project.room.dimensions.width, project.room.dimensions.height, wallThickness),
    wallMaterial
  );
  backWall.position.set(
    project.room.dimensions.width / 2,
    project.room.dimensions.height / 2,
    project.room.dimensions.length
  );
  roomGroup.add(backWall);
  
  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, project.room.dimensions.height, project.room.dimensions.length),
    wallMaterial
  );
  leftWall.position.set(
    0,
    project.room.dimensions.height / 2,
    project.room.dimensions.length / 2
  );
  roomGroup.add(leftWall);
  
  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, project.room.dimensions.height, project.room.dimensions.length),
    wallMaterial
  );
  rightWall.position.set(
    project.room.dimensions.width,
    project.room.dimensions.height / 2,
    project.room.dimensions.length / 2
  );
  roomGroup.add(rightWall);
  
  scene.add(roomGroup);
  
  // Add furniture (simplified as boxes)
  project.furniture.forEach(item => {
    const boxGeometry = new THREE.BoxGeometry(
      item.dimensions.width,
      item.dimensions.height,
      item.dimensions.length
    );
    const boxMaterial = new THREE.MeshBasicMaterial({ color: item.material.color });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    
    box.position.set(
      item.position.x,
      item.dimensions.height / 2,
      item.position.z
    );
    
    box.rotation.set(
      item.rotation.x,
      item.rotation.y,
      item.rotation.z
    );
    
    box.name = item.name;
    scene.add(box);
  });
  
  // Show format selection dialog
  const format = prompt('Choose export format: (1) GLB, (2) OBJ', '1');
  
  if (!format) {
    toast('Export cancelled');
    return;
  }
  
  const projectName = project.name.replace(/\s+/g, '_').toLowerCase();
  
  try {
    if (format === '1' || format.toLowerCase() === 'glb') {
      // Export as GLB
      const gltfExporter = new GLTFExporter();
      
      gltfExporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            downloadFile(new Blob([result], { type: 'application/octet-stream' }), `${projectName}.glb`, 'application/octet-stream');
            toast('3D export complete', {
              description: 'Your 3D design has been downloaded as a GLB file.'
            });
          }
        },
        (error) => {
          console.error('GLB Export Error:', error);
          toast('Export failed', {
            description: 'An error occurred while exporting to GLB format.'
          });
        },
        { binary: true }
      );
    } else {
      // Export as OBJ
      const objExporter = new OBJExporter();
      const result = objExporter.parse(scene);
      downloadFile(result, `${projectName}.obj`, 'text/plain');
      toast('3D export complete', {
        description: 'Your 3D design has been downloaded as an OBJ file.'
      });
    }
  } catch (error) {
    console.error('Error exporting 3D design:', error);
    toast('Export failed', {
      description: 'An error occurred while exporting. Please try again.'
    });
  }
};

// New function to export scene data as JSON
export const exportSceneToJSON = (project: Project, customName?: string) => {
  if (!project) {
    toast('Export failed', { 
      description: 'No project is currently loaded.'
    });
    return;
  }
  
  try {
    // Create a serializable version of the project
    // Extract only the necessary properties to rebuild the scene
    const sceneData = {
      name: customName || project.name,
      date: new Date().toISOString(),
      design: {
        room: {
          dimensions: project.room.dimensions,
          wallColor: project.room.wallColor,
          floorMaterial: project.room.floorMaterial,
          customShape: project.room.customShape || null,
        },
        furniture: project.furniture.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          model: item.model, // The OBJ file URL/path
          position: item.position,
          rotation: item.rotation,
          dimensions: item.dimensions,
          material: item.material
        }))
      }
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(sceneData, null, 2);
    const fileName = customName ? 
      customName.replace(/\s+/g, '_').toLowerCase() : 
      project.name.replace(/\s+/g, '_').toLowerCase();
    downloadFile(jsonString, `${fileName}_scene.json`, 'application/json');
    
    toast('Scene export complete', {
      description: 'Your scene has been downloaded as a JSON file.'
    });
  } catch (error) {
    console.error('Error exporting scene as JSON:', error);
    toast('Export failed', {
      description: 'An error occurred while exporting as JSON. Please try again.',
    });
  }
};

// New function to import scene data from JSON
export const importSceneFromJSON = (
  jsonFile: File, 
  onImportComplete: (project: Partial<Project>) => void
) => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      if (!event.target?.result) {
        throw new Error('Failed to read file');
      }
      
      const jsonData = JSON.parse(event.target.result as string);
      
      // Check if the JSON has the new "design" structure
      const designData = jsonData.design;
      
      // Handle both the old format and the new format with "design" key
      const roomData = designData ? designData.room : jsonData.room;
      const furnitureData = designData ? designData.furniture : jsonData.furniture;
      
      // Validate the imported data has the required structure
      if (!roomData || !furnitureData || !Array.isArray(furnitureData)) {
        throw new Error('Invalid scene file format');
      }
      
      // Create a project structure from the JSON data
      const importedProject: Partial<Project> = {
        name: jsonData.name || 'Imported Scene',
        room: {
          ...roomData,
          id: `room-${Date.now()}`,
          name: 'Imported Room',
          windows: roomData.windows || [],
          doors: roomData.doors || [],
          ceiling: roomData.dimensions.height,
        },
        furniture: furnitureData.map((item: any) => ({
          ...item,
          // Ensure each furniture item has a new unique ID
          id: `${item.id || 'furniture'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }))
      };
      
      onImportComplete(importedProject);
      
      toast('Scene import complete', {
        description: 'Your scene has been successfully imported.'
      });
    } catch (error) {
      console.error('Error importing scene from JSON:', error);
      toast('Import failed', {
        description: 'The selected file could not be imported. Please check if it is a valid scene file.',
      });
    }
  };
  
  reader.onerror = () => {
    toast('Import failed', {
      description: 'Failed to read the selected file.',
    });
  };
  
  reader.readAsText(jsonFile);
};
