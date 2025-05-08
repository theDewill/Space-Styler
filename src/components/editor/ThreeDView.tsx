import React, { useEffect, useRef, useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "sonner";
import * as THREE from "three";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { FurnitureItem } from "@/types";
import { calculateCentroid } from "@/utils/shapeUtils";
import CustomModelLoader from "./CustomModelLoader";

// Component to render a single furniture item
const FurnitureModel = ({ item }: { item: FurnitureItem }) => {
  return <CustomModelLoader item={item} />;
};

// Custom floor component that renders terrain floor with room's floor color
const CustomFloor = ({ room }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const FLOOR_EXTENSION = 10; // meters to extend the floor beyond the room

  useEffect(() => {
    if (!meshRef.current) return;

    // If we have a custom shape, create a custom geometry
    if (room.customShape && room.customShape.length >= 3) {
      const shape = new THREE.Shape();

      // Move to first point
      shape.moveTo(room.customShape[0].x, room.customShape[0].y);

      // Draw lines to other points
      for (let i = 1; i < room.customShape.length; i++) {
        shape.lineTo(room.customShape[i].x, room.customShape[i].y);
      }

      // Close the shape
      shape.lineTo(room.customShape[0].x, room.customShape[0].y);

      // Create geometry from shape
      const geometry = new THREE.ShapeGeometry(shape);

      // Update the mesh
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
      meshRef.current.geometry = geometry;
    }
  }, [room.customShape]);

  // For the terrain floor and walls positioning
  let centerX = 0;
  let centerY = 0;

  if (room.customShape && room.customShape.length >= 3) {
    // For custom shapes, calculate the centroid
    const centroid = calculateCentroid(room.customShape);
    centerX = centroid.x;
    centerY = centroid.y;
  } else {
    // For rectangular rooms, use dimensions
    centerX = room.dimensions.width / 2;
    centerY = room.dimensions.length / 2;
  }

  return (
    <group>
      {/* Large terrain floor that extends beyond the room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.002, centerY]} receiveShadow>
        <planeGeometry args={[FLOOR_EXTENSION * 2, FLOOR_EXTENSION * 2]} />
        <meshStandardMaterial
          color={room.floorMaterial.color}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Actual room floor shape (only for custom shapes) */}
      {room.customShape && room.customShape.length >= 3 && (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[1, 1]} /> {/* Placeholder, replaced in useEffect */}
          <meshStandardMaterial
            color={room.floorMaterial.color}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

// Component to render walls based on room dimensions or custom shape
const Walls = ({ room }) => {
  // For custom shapes, we'd need to generate walls for each edge
  if (room.customShape && room.customShape.length >= 3) {
    return (
      <group>
        {/* Create walls along the edges of the custom shape */}
        {room.customShape.map((point, i) => {
          const nextIndex = (i + 1) % room.customShape.length;
          const nextPoint = room.customShape[nextIndex];

          // Calculate wall properties
          const dx = nextPoint.x - point.x;
          const dy = nextPoint.y - point.y;
          const wallLength = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          // Calculate midpoint of the wall segment for positioning
          const midX = (point.x + nextPoint.x) / 2;
          const midY = (point.y + nextPoint.y) / 2;

          return (
            <mesh
              key={i}
              position={[midX, room.dimensions.height / 2, midY]}
              rotation={[0, -angle, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[wallLength, room.dimensions.height, 0.1]} />
              <meshStandardMaterial
                color={room.wallColor}
                roughness={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    );
  }

  // Default rectangular room walls - now with double-sided materials
  return (
    <group>
      <mesh
        position={[0, room.dimensions.height / 2, room.dimensions.length / 2]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[room.dimensions.length, room.dimensions.height, 0.05]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        position={[room.dimensions.width, room.dimensions.height / 2, room.dimensions.length / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[room.dimensions.length, room.dimensions.height, 0.05]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        position={[room.dimensions.width / 2, room.dimensions.height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[room.dimensions.width, room.dimensions.height, 0.05]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      <mesh
        position={[room.dimensions.width / 2, room.dimensions.height / 2, room.dimensions.length]}
        rotation={[0, Math.PI, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[room.dimensions.width, room.dimensions.height, 0.05]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Scene setup component with properly aligned floor and walls
const Scene = () => {
  const { currentProject, setView, view } = useProject();

  // Handle background click to deselect current item
  const handleBackgroundClick = (event: ThreeEvent<MouseEvent>) => {
    // Only deselect if it's a click on the background plane
    if (event.object.name === "background-plane") {
      console.log("Background clicked, deselecting item");
      setView({ selectedFurnitureId: null });
    }
  };

  // Log current selection state for debugging
  useEffect(() => {
    console.log("Current selection state:", view.selectedFurnitureId);
  }, [view.selectedFurnitureId]);

  if (!currentProject) return null;

  // Calculate room center for camera positioning
  let roomCenter = {
    x: currentProject.room.dimensions.width / 2,
    y: 0,
    z: currentProject.room.dimensions.length / 2,
  };

  // If custom shape is available, use its centroid for positioning
  if (currentProject.room.customShape && currentProject.room.customShape.length >= 3) {
    const centroid = calculateCentroid(currentProject.room.customShape);
    roomCenter = { x: centroid.x, y: 0, z: centroid.y };
  }

  return (
    <>
      {/* Improved lighting setup for better shadows */}
      <ambientLight intensity={0.4} />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Secondary directional light */}
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />

      {/* Invisible background plane for click detection */}
      <mesh
        name="background-plane"
        position={[roomCenter.x, 0, roomCenter.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[100, 100, 1]}
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry />
        <meshBasicMaterial opacity={0} transparent={true} />
      </mesh>

      {/* Use a common parent to ensure floor and walls share the same coordinate system */}
      <group>
        <CustomFloor room={currentProject.room} />
        <Walls room={currentProject.room} />
      </group>

      {currentProject.furniture.map((item) => (
        <FurnitureModel key={`furniture-${item.id}`} item={item} />
      ))}
    </>
  );
};

// Main ThreeDView component
const ThreeDView = () => {
  const { currentProject, addFurniture, setView, view } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  const [sceneInitialized, setSceneInitialized] = useState(false);

  // Handle scene initialization
  const handleCreated = (state: any) => {
    canvasRef.current = state.gl.domElement;
    setSceneInitialized(true);
  };

  // Handle drag and drop from furniture catalog
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Listen for transform controls events to disable/enable orbit controls
  useEffect(() => {
    const handleTransformStart = () => {
      console.log("Transform controls started, disabling orbit controls");
      setOrbitControlsEnabled(false);
    };

    const handleTransformEnd = () => {
      console.log("Transform controls ended, enabling orbit controls");
      setOrbitControlsEnabled(true);
    };

    // Add event listeners for transform controls
    document.addEventListener("transform-controls-start", handleTransformStart);
    document.addEventListener("transform-controls-end", handleTransformEnd);

    return () => {
      document.removeEventListener("transform-controls-start", handleTransformStart);
      document.removeEventListener("transform-controls-end", handleTransformEnd);
    };
  }, []);

  // Reset orbit controls enabled state when no furniture is selected
  useEffect(() => {
    if (!view.selectedFurnitureId) {
      setOrbitControlsEnabled(true);
    }
  }, [view.selectedFurnitureId]);

  // Deselect object when clicking on canvas background
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only deselect if clicking directly on the canvas backdrop (not on controls or objects)
    if (e.target === e.currentTarget) {
      setView({ selectedFurnitureId: null });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!currentProject) return;

    // Get furniture data
    try {
      const furnitureData = JSON.parse(e.dataTransfer.getData("furniture"));
      if (!furnitureData) return;

      // Calculate room center based on shape or dimensions
      let centerX = currentProject.room.dimensions.width / 2;
      let centerZ = currentProject.room.dimensions.length / 2;

      if (currentProject.room.customShape && currentProject.room.customShape.length >= 3) {
        const centroid = calculateCentroid(currentProject.room.customShape);
        centerX = centroid.x;
        centerZ = centroid.y;
      }

      // Add furniture to center of the room with a unique ID each time
      const newFurniture = {
        ...furnitureData,
        id: `${furnitureData.id}-${Date.now()}`, // Ensure unique ID for each instance
        position: {
          x: centerX,
          y: 0.4, // Default vertical position 0.4m above ground
          z: centerZ,
        },
        // Set rotation with default values (no initial rotation)
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
      };

      // Wait until the scene is fully initialized before adding furniture
      if (sceneInitialized) {
        addFurniture(newFurniture);
        toast("3D model added to your room");
      } else {
        // If scene isn't ready, wait a moment and then add
        setTimeout(() => {
          addFurniture(newFurniture);
          toast("3D model added to your room");
        }, 300);
      }
    } catch (err) {
      console.error("Error dropping model", err);
      toast("Error adding model", {
        description: "Something went wrong when adding the 3D model.",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="canvas-3d w-full h-full flex items-center justify-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {currentProject ? (
        <Canvas shadows onCreated={handleCreated}>
          <color attach="background" args={["#f5f5f5"]} />
          {(() => {
            let targetX = currentProject.room.dimensions.width / 2;
            let targetZ = currentProject.room.dimensions.length / 2;

            if (currentProject.room.customShape && currentProject.room.customShape.length >= 3) {
              const centroid = calculateCentroid(currentProject.room.customShape);
              targetX = centroid.x;
              targetZ = centroid.y;
            }

            return (
              <>
                <PerspectiveCamera makeDefault position={[targetX + 5, 5, targetZ + 5]} />
                <Scene />
                <OrbitControls
                  ref={controlsRef}
                  enableDamping={false}
                  target={[targetX, currentProject.room.dimensions.height / 4, targetZ]}
                  enabled={orbitControlsEnabled} // Dynamically enable/disable controls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  rotateSpeed={0.5}
                  zoomSpeed={0.7}
                  makeDefault
                />
              </>
            );
          })()}
        </Canvas>
      ) : (
        <div className="text-center text-muted-foreground">No project loaded</div>
      )}
    </div>
  );
};

export default ThreeDView;
