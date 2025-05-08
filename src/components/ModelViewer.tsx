
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { SimpleRoom } from './models/SimpleRoom';
import { OrbitControls } from '@react-three/drei';

const ModelViewer = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-soft-sage/30 to-warm-cream">
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 25 }}>
        <Suspense fallback={null}>
          <SimpleRoom position={[0, -1, 0]} scale={1.5} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ModelViewer;
