import React, { useRef, useEffect, useState } from "react";
import { useLoader, useThree, ThreeEvent, LoaderProto } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Text } from "@react-three/drei";
import { TransformControls } from "@react-three/drei";
import { FurnitureItem } from "@/types";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";
import { isFirebaseStorageUrl, getDirectDownloadUrl } from "@/utils/shapeUtils";

interface CustomModelProps {
  item: FurnitureItem;
}

interface TransformControlsWrapperProps {
  groupRef: React.RefObject<THREE.Group>;
  mode: "translate" | "rotate" | "scale";
  onTransformChange: () => void;
  size?: number;
  enabled: boolean;
}

// TransformControls wrapper component with improved event handling
const TransformControlsWrapper: React.FC<TransformControlsWrapperProps> = ({
  groupRef,
  mode,
  onTransformChange,
  size = 0.7,
  enabled,
}) => {
  // Use Three's hooks to get camera and renderer
  const { camera, gl } = useThree();

  // Use a ref to directly interact with the transform controls
  const transformRef = useRef<any>(null);

  useEffect(() => {
    if (!transformRef.current || !groupRef.current) return;

    // Connect transform controls to our model group
    transformRef.current.attach(groupRef.current);

    // Add event listeners for transform control interactions
    const handleMouseDown = () => {
      // Disable orbit controls when starting transform
      document.dispatchEvent(new CustomEvent("transform-controls-start"));
    };

    const handleMouseUp = () => {
      // Re-enable orbit controls when done with transform
      document.dispatchEvent(new CustomEvent("transform-controls-end"));
    };

    const handleChange = () => {
      onTransformChange();
    };

    if (transformRef.current) {
      transformRef.current.addEventListener("mouseDown", handleMouseDown);
      transformRef.current.addEventListener("mouseUp", handleMouseUp);
      transformRef.current.addEventListener("objectChange", handleChange);
    }

    return () => {
      if (transformRef.current) {
        transformRef.current.removeEventListener("mouseDown", handleMouseDown);
        transformRef.current.removeEventListener("mouseUp", handleMouseUp);
        transformRef.current.removeEventListener("objectChange", handleChange);
        // Make sure to detach before unmounting to prevent recursion
        try {
          transformRef.current.detach();
        } catch (error) {
          console.log("Error detaching transform controls:", error);
        }
      }
    };
  }, [groupRef, onTransformChange]);

  // Don't render if not enabled
  if (!enabled) return null;

  return <TransformControls ref={transformRef} mode={mode} size={size} />;
};

const CustomModelLoader: React.FC<CustomModelProps> = ({ item }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { removeFurniture, updateFurniture, view, setView } = useProject();
  const { toast } = useToast();
  const isSelected = view.selectedFurnitureId === item.id;

  // Set default vertical position to 0.4m if y position is 0
  useEffect(() => {
    if (item.position.y === 0) {
      updateFurniture(item.id, {
        position: {
          ...item.position,
          y: 0.4, // Set default vertical position to 0.4m
        },
      });
      console.log(`Set default vertical position for ${item.id} to 0.4m`);
    }
  }, [item.id]);

  // Calculate position with actual Y coordinate from item
  const position: [number, number, number] = [
    item.position.x,
    item.position.y, // Use actual Y position from item
    item.position.z,
  ];

  // Handle model selection with improved event handling
  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    // Stop propagation to prevent deselection when clicking on the model
    e.stopPropagation();
    // Prevent the event from bubbling up to the scene
    e.nativeEvent.stopPropagation();

    setView({ selectedFurnitureId: item.id });
    console.log(`Selected furniture: ${item.id}`);
  };

  // Update furniture data when transform controls change position
  const handleTransformChange = () => {
    if (!groupRef.current) return;

    // Get current position from the group
    const newPosition = {
      x: groupRef.current.position.x,
      y: groupRef.current.position.y, // Keep the y position (for up/down movement)
      z: groupRef.current.position.z,
    };

    // Get current rotation from the group
    const newRotation = {
      x: groupRef.current.rotation.x,
      y: groupRef.current.rotation.y,
      z: groupRef.current.rotation.z,
    };

    // Get scale for dimensions update - now supporting non-uniform scaling
    const scaleX = groupRef.current.scale.x;
    const scaleY = groupRef.current.scale.y;
    const scaleZ = groupRef.current.scale.z;

    const newDimensions = {
      width: item.dimensions.width * scaleX,
      height: item.dimensions.height * scaleY,
      length: item.dimensions.length * scaleZ,
    };

    // Update furniture item with new position, rotation and dimensions
    updateFurniture(item.id, {
      position: newPosition,
      rotation: newRotation,
      dimensions: newDimensions,
    });
  };

  // Improved OBJ model loading with better URL handling
  const OBJModel = () => {
    const objGroupRef = useRef<THREE.Group>(null);
    const { invalidate } = useThree();
    const [loadingError, setLoadingError] = useState<boolean>(false);

    // Process URL for direct download - this is the key improvement
    let modelUrl = item.model;

    // Special handling for URL-loaded models
    if (typeof modelUrl === "string" && !modelUrl.startsWith("blob:")) {
      try {
        modelUrl = getDirectDownloadUrl(modelUrl);
        console.log(`Loading OBJ model for ${item.name} from:`, modelUrl);
      } catch (error) {
        console.error(`Error processing model URL for ${item.id}:`, error);
      }
    } else {
      console.log(`Loading OBJ model for ${item.name} from:`, modelUrl);
    }

    // Create a unique cache key for each model
    const cacheKey = `${item.id}-${modelUrl}`;

    try {
      // Using the third parameter with a loading manager callback function
      const obj = useLoader(OBJLoader, modelUrl, (loader) => {
        // Get the global THREE.js loader manager
        const manager = loader.manager;

        // Add error handler
        if (manager) {
          manager.onError = (url) => {
            console.error(`Error loading OBJ from URL: ${url}`);
            setLoadingError(true);
            // We'll handle removal in useEffect

            // Show toast notification for error
            toast({
              title: "Model Loading Error",
              description: `Failed to load 3D model: ${item.name}. Please try dragging it again to the 3D space.`,
              variant: "destructive",
            });
          };

          // Clear any existing cache for this model URL
          // and ensure it's loaded fresh
          manager.itemStart(cacheKey);
        }
      });

      useEffect(() => {
        if (!objGroupRef.current || !obj) return;

        try {
          console.log(`OBJ ${item.id} loaded successfully, applying to scene`);

          // Clear existing children first
          while (objGroupRef.current.children.length > 0) {
            objGroupRef.current.remove(objGroupRef.current.children[0]);
          }

          // Clone the loaded object to avoid modifying the original
          const model = obj.clone();

          // Apply material to all meshes in the model
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Create and apply a new material
              child.material = new THREE.MeshStandardMaterial({
                color: item.material.color,
                roughness: 0.7,
                metalness: 0.2,
                side: THREE.DoubleSide, // Show both sides of faces
              });

              // Make sure geometry has correct normals
              if (child.geometry) {
                child.geometry.computeVertexNormals();
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
              }
            }
          });

          // Add model to our group
          objGroupRef.current.add(model);

          // Calculate bounding box for scaling
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);

          if (size.x === 0 || size.y === 0 || size.z === 0) {
            console.warn(`OBJ model ${item.id} has a zero dimension, using default size`);
            return;
          }

          // Scale to fit item dimensions
          const scaleX = item.dimensions.width / size.x;
          const scaleY = item.dimensions.height / size.y;
          const scaleZ = item.dimensions.length / size.z;
          const scale = Math.min(scaleX, scaleY, scaleZ);

          model.scale.set(scale, scale, scale);

          // Center the model
          const center = new THREE.Vector3();
          box.getCenter(center);
          model.position.sub(center.multiplyScalar(scale));

          // Remove the default rotation applied to imported models
          // Remove the -Math.PI/2 rotation on X-axis to keep models upright
          model.rotation.set(0, 0, 0);

          // Force a re-render
          invalidate();

          console.log(
            `OBJ model "${item.name}" (ID: ${item.id}) loaded successfully with dimensions:`,
            size,
          );
        } catch (e) {
          console.error(`Error processing OBJ model ${item.id} after loading:`, e);
          setLoadingError(true);
          // Remove furniture from scene on error
          removeFurniture(item.id);
          // Show toast notification
          toast({
            title: "Model Loading Error",
            description: `Failed to process 3D model: ${item.name}`,
          });
        }
      }, [obj, item, invalidate]);

      if (loadingError) {
        return null;
      }

      return <group ref={objGroupRef} />;
    } catch (error) {
      console.error(`Error loading OBJ model ${item.id}:`, error);

      // Remove the furniture item from the project
      useEffect(() => {
        // Handle model loading error - remove furniture and show toast
        removeFurniture(item.id);
        toast({
          title: "Model Loading Error",
          description: `Failed to load 3D model: ${item.name}. Please try dragging it again to the 3D space.`,
          variant: "destructive",
        });
        setLoadError("Failed to load OBJ model");
      }, []);

      return null;
    }
  };

  // If there was an error loading the model, don't render anything
  if (loadError) {
    return null;
  }

  // We need to separate the transform controls from the model to prevent recursion
  return (
    <>
      <group
        ref={groupRef}
        position={[item.position.x, item.position.y, item.position.z]}
        rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
        onClick={handleSelect}
      >
        <OBJModel />

        {/* Label - only show when selected */}
        {isSelected && (
          <Text
            position={[0, item.dimensions.height * 0.6, 0]}
            fontSize={0.15}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {item.name}
          </Text>
        )}
      </group>

      {/* Keep TransformControls outside the main group to avoid recursion */}
      {isSelected && (
        <TransformControlsWrapper
          groupRef={groupRef}
          mode={view.transformMode || "translate"}
          onTransformChange={handleTransformChange}
          size={0.7}
          enabled={isSelected}
        />
      )}
    </>
  );
};

export default CustomModelLoader;
