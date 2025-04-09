import { useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export function Ticket3D() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [targetRotation] = useState(() => new Vector3(0, Math.PI * 2, 0));
  
  useFrame((state) => {
    if (meshRef.current) {
      // Smooth rotation
      meshRef.current.rotation.y += 0.005;
      
      // Hover animation
      const scale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new Vector3(scale, scale, scale), 0.1);
      
      // Light movement - only if lights array exists and has elements
      if (state.lights && state.lights.length > 0) {
        const time = state.clock.getElapsedTime();
        state.lights[0].position.x = Math.sin(time) * 3;
        state.lights[0].position.z = Math.cos(time) * 3;
      }
    }
  });

  return (
    <group>
      {/* Ticket base */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3, 2, 0.1]} />
        <meshPhysicalMaterial
          color={hovered ? "#818CF8" : "#C7D2FE"}
          metalness={0.2}
          roughness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
        
        {/* Decorative elements */}
        <mesh position={[0, 0.8, 0.06]}>
          <planeGeometry args={[2.8, 0.4]} />
          <meshStandardMaterial color="#4F46E5" />
        </mesh>
        
        <mesh position={[0, -0.8, 0.06]}>
          <planeGeometry args={[2.8, 0.4]} />
          <meshStandardMaterial color="#4F46E5" />
        </mesh>
      </mesh>

      {/* Text elements */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        color="#1E1B4B"
        anchorX="center"
        anchorY="middle"
      >
        PARKING VIOLATION
      </Text>

      <Text
        position={[0, -0.3, 0.06]}
        fontSize={0.1}
        color="#4338CA"
        anchorX="center"
        anchorY="middle"
      >
        NOTICE
      </Text>
    </group>
  );
}