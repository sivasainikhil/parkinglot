import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Ticket3D } from './Ticket3D';

export function Scene3D() {
  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-indigo-50 to-white rounded-lg">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableZoom={true}
          maxDistance={10}
          minDistance={3}
          maxPolarAngle={Math.PI / 2}
        />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[-10, 10, -10]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        <Ticket3D />
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          Parking Ticket System
        </Text>
      </Canvas>
    </div>
  );
}