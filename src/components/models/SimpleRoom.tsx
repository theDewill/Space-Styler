import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function SimpleRoom2(props: { position?: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (state.mouse.x * Math.PI) / 20,
        0.05,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (state.mouse.y * Math.PI) / 20,
        0.05,
      );
    }
  });

  return (
    <group ref={groupRef} position={props.position} scale={props.scale}>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#F5F2EA" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#F5F2EA" />
      </mesh>

      {/* Side Wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#F5F2EA" />
      </mesh>

      {/* Sofa */}
      <group position={[0, 0.5, -2.5]}>
        <mesh castShadow>
          <boxGeometry args={[3, 0.5, 1]} />
          <meshStandardMaterial color="#2A2D45" />
        </mesh>
        <mesh position={[0, 0.5, -0.4]} castShadow>
          <boxGeometry args={[3, 0.5, 0.2]} />
          <meshStandardMaterial color="#2A2D45" />
        </mesh>
        <mesh position={[-1.4, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1, 0.5, 0.2]} />
          <meshStandardMaterial color="#2A2D45" />
        </mesh>
        <mesh position={[1.4, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1, 0.5, 0.2]} />
          <meshStandardMaterial color="#2A2D45" />
        </mesh>
      </group>

      {/* Coffee Table */}
      <mesh position={[0, 0.3, -0.5]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#B8C4BB" />
      </mesh>
      <mesh position={[0, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#4A0404" />
      </mesh>

      {/* Chair */}
      <group position={[2, 0.5, -1.5]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.1, 1]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
        <mesh position={[0, 0.5, -0.4]} castShadow>
          <boxGeometry args={[1, 0.8, 0.1]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
      </group>
    </group>
  );
}

export function SimpleRoom(props: { position?: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState<string | null>(null);

  // Smoother camera movement with easing
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        (state.mouse.x * Math.PI) / 25,
        0.03,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (state.mouse.y * Math.PI) / 30,
        0.03,
      );
    }
  });

  // Materials with more refined colors and properties
  const materials = {
    floor: new THREE.MeshStandardMaterial({
      color: "#F8F4EC",
      roughness: 0.7,
      metalness: 0.1,
    }),
    wall: new THREE.MeshStandardMaterial({
      color: "#F0EAD6",
      roughness: 0.9,
      metalness: 0,
    }),
    sofa: new THREE.MeshStandardMaterial({
      color: "#334257",
      roughness: 0.8,
      metalness: 0.1,
    }),
    accent: new THREE.MeshStandardMaterial({
      color: "#D4B483",
      roughness: 0.6,
      metalness: 0.2,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: "#6E4C1E",
      roughness: 0.7,
      metalness: 0.1,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: "#B0B7C0",
      roughness: 0.3,
      metalness: 0.7,
    }),
    plant: new THREE.MeshStandardMaterial({
      color: "#4B7F52",
      roughness: 0.8,
      metalness: 0,
    }),
    carpet: new THREE.MeshStandardMaterial({
      color: "#E5D8CC",
      roughness: 0.9,
      metalness: 0,
    }),
  };

  // Hover state handler for interactive elements
  const handlePointerOver = (itemId: string) => {
    setHovered(itemId);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={groupRef} position={props.position || [0, 0, 0]} scale={props.scale || 1}>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 8.5, 10, 10]} />
        <primitive object={materials.floor} />
      </mesh>

      {/* Carpet */}
      <mesh position={[0, 0.01, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.5, 32]} />
        <primitive object={materials.carpet} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -4.25]} receiveShadow>
        <planeGeometry args={[8.5, 4.5]} />
        <primitive object={materials.wall} />
      </mesh>

      <mesh position={[-4.25, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8.5, 4.5]} />
        <primitive object={materials.wall} />
      </mesh>

      {/* Baseboard trim */}
      <mesh position={[0, 0.1, -4.2]} receiveShadow>
        <boxGeometry args={[8.4, 0.2, 0.05]} />
        <primitive object={materials.wood} />
      </mesh>

      <mesh position={[-4.2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.2, 0.05]} />
        <primitive object={materials.wood} />
      </mesh>

      {/* Sofa - more detailed with cushions */}
      <group position={[0, 0.5, -3]}>
        {/* Base */}
        <mesh castShadow>
          <boxGeometry args={[3.2, 0.5, 1.2]} />
          <primitive object={materials.sofa} />
        </mesh>

        {/* Backrest */}
        <mesh position={[0, 0.6, -0.5]} castShadow>
          <boxGeometry args={[3.2, 0.8, 0.2]} />
          <primitive object={materials.sofa} />
        </mesh>

        {/* Armrests */}
        <mesh position={[-1.6, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.2]} />
          <primitive object={materials.sofa} />
        </mesh>

        <mesh position={[1.6, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.2]} />
          <primitive object={materials.sofa} />
        </mesh>

        {/* Cushions */}
        <mesh position={[-0.8, 0.65, 0.2]} castShadow>
          <boxGeometry args={[1.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#293B5F" roughness={0.9} metalness={0.1} />
        </mesh>

        <mesh position={[0.8, 0.65, 0.2]} castShadow>
          <boxGeometry args={[1.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#293B5F" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Decorative pillows */}
        <mesh position={[-1.2, 0.75, 0.4]} rotation={[0.2, 0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <primitive object={materials.accent} />
        </mesh>

        <mesh position={[1.2, 0.75, 0.4]} rotation={[0.2, -0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.1]} />
          <primitive object={materials.accent} />
        </mesh>
      </group>

      {/* Cofee Table */}
      <group position={[0, 0, -0.7]}>
        {/* Table top - glass effect */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.08, 1]} />
          <meshStandardMaterial
            color="#D7E5E7"
            roughness={0.1}
            metalness={0.9}
            transparent={true}
            opacity={0.6}
          />
        </mesh>

        {/* Table frame */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[1.9, 0.02, 1.1]} />
          <primitive object={materials.metal} />
        </mesh>

        {/* Table legs */}
        <mesh position={[-0.8, 0.15, -0.4]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <primitive object={materials.metal} />
        </mesh>

        <mesh position={[0.8, 0.15, -0.4]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <primitive object={materials.metal} />
        </mesh>

        <mesh position={[-0.8, 0.15, 0.4]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <primitive object={materials.metal} />
        </mesh>

        <mesh position={[0.8, 0.15, 0.4]} castShadow>
          <boxGeometry args={[0.05, 0.3, 0.05]} />
          <primitive object={materials.metal} />
        </mesh>

        {/* Decorative items */}
        <mesh position={[-0.5, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
        </mesh>

        <mesh position={[0.4, 0.45, 0.2]} castShadow>
          <boxGeometry args={[0.35, 0.1, 0.25]} />
          <primitive object={materials.wood} />
        </mesh>
      </group>

      {/* Accent Chair - more stylish design */}
      <group position={[2.2, 0.5, -1.8]} rotation={[0, -Math.PI / 5, 0]}>
        {/* Seat */}
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.15, 1.1]} />
          <primitive object={materials.accent} />
        </mesh>

        {/* Backrest */}
        <mesh position={[0, 0.5, -0.5]} castShadow>
          <boxGeometry args={[1.1, 1, 0.1]} />
          <primitive object={materials.accent} />
        </mesh>

        {/* Frame */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.2, 0.05, 1.2]} />
          <primitive object={materials.wood} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.5, -0.1, -0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <primitive object={materials.wood} />
        </mesh>

        <mesh position={[0.5, -0.1, -0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <primitive object={materials.wood} />
        </mesh>

        <mesh position={[-0.5, -0.1, 0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <primitive object={materials.wood} />
        </mesh>

        <mesh position={[0.5, -0.1, 0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <primitive object={materials.wood} />
        </mesh>
      </group>

      {/* Plants for life and color */}
      <group position={[-3, 0, -3]}>
        {/* Pot */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
          <meshStandardMaterial color="#D9C5B4" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Plant */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={materials.plant} />
        </mesh>

        <mesh position={[0.2, 1, 0.1]} rotation={[0, 0.5, 0.2]} castShadow>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={materials.plant} />
        </mesh>

        <mesh position={[-0.2, 0.9, -0.1]} rotation={[0, -0.3, 0.1]} castShadow>
          <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={materials.plant} />
        </mesh>
      </group>

      {/* Wall Art */}
      <mesh position={[0, 2.2, -4.1]} castShadow>
        <boxGeometry args={[2, 1.3, 0.05]} />
        <meshStandardMaterial color="#1C1C1C" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[0, 2.2, -4.05]} castShadow>
        <boxGeometry args={[1.9, 1.2, 0.05]} />
        <meshStandardMaterial color="#E6D1B1" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Side Table */}
      <group position={[-2.5, 0.4, -1.5]}>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
          <primitive object={materials.wood} />
        </mesh>

        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <primitive object={materials.metal} />
        </mesh>

        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
          <primitive object={materials.metal} />
        </mesh>

        {/* Decorative Lamp */}
        <group position={[0, 0.15, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.15, 0.2, 16]} />
            <meshStandardMaterial color="#F7F7F7" roughness={0.5} metalness={0.1} />
          </mesh>

          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
            <meshStandardMaterial color="#F7F7F7" roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
