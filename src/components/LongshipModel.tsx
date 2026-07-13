import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface LongshipModelProps {
  compact?: boolean;
  accent?: string;
}

export function LongshipModel({ compact = false, accent = '#d4b36c' }: LongshipModelProps) {
  const sailRef = useRef<THREE.Mesh>(null);
  const oarsRef = useRef<THREE.Group>(null);
  const phase = 1.731;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime + phase;
    if (sailRef.current) {
      sailRef.current.rotation.y = Math.sin(time * 1.35) * 0.035;
      sailRef.current.scale.x = 1 + Math.sin(time * 1.7) * 0.012;
    }
    if (oarsRef.current) oarsRef.current.rotation.x = Math.sin(time * 1.9) * 0.08;
  });

  const shields = compact ? 5 : 8;
  const oars = compact ? 4 : 7;

  return (
    <group scale={compact ? 0.72 : 1}>
      <mesh castShadow={!compact} position={[0, 0.12, 0]} scale={[1.65, 0.28, 0.42]}>
        <capsuleGeometry args={[0.38, 2.45, compact ? 5 : 10, compact ? 10 : 20]} />
        <meshStandardMaterial color="#3b2115" roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 0.22, 0]} scale={[1.46, 0.12, 0.33]}>
        <capsuleGeometry args={[0.34, 2.1, 5, 16]} />
        <meshStandardMaterial color="#6a3f25" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2.2, 0.07, 0.5]} />
        <meshStandardMaterial color="#725238" roughness={0.92} />
      </mesh>

      {Array.from({ length: shields }, (_, index) => {
        const x = -0.9 + index * (1.8 / Math.max(1, shields - 1));
        const color = index % 3 === 0 ? '#a84e38' : index % 3 === 1 ? '#b58a49' : '#547067';
        return (
          <group key={index} position={[x, 0.34, index % 2 === 0 ? 0.31 : -0.31]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow={!compact}>
              <cylinderGeometry args={[0.17, 0.17, 0.035, compact ? 10 : 18]} />
              <meshStandardMaterial color={color} roughness={0.78} metalness={0.08} />
            </mesh>
            <mesh position={[0, 0.022, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.05, 10]} />
              <meshStandardMaterial color="#76736c" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        );
      })}

      <mesh castShadow={!compact} position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 1.55, 10]} />
        <meshStandardMaterial color="#4d321f" roughness={0.8} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.022, 1.38, 8]} />
        <meshStandardMaterial color="#5b3a22" roughness={0.84} />
      </mesh>
      <mesh ref={sailRef} castShadow={!compact} position={[0, 1.03, 0.02]}>
        <planeGeometry args={[1.28, 1.02, compact ? 3 : 8, compact ? 2 : 5]} />
        <meshStandardMaterial color="#d7c28f" roughness={0.84} side={THREE.DoubleSide} emissive="#5b3b27" emissiveIntensity={0.08} />
      </mesh>
      {[-0.34, 0, 0.34].map((offset) => (
        <mesh key={offset} position={[offset, 1.03, 0.028]}>
          <boxGeometry args={[0.055, 1, 0.012]} />
          <meshStandardMaterial color={offset === 0 ? accent : '#8e3d2d'} roughness={0.78} />
        </mesh>
      ))}

      <group ref={oarsRef} position={[0, 0.3, 0]}>
        {Array.from({ length: oars }, (_, index) => {
          const x = -0.82 + index * (1.64 / Math.max(1, oars - 1));
          return [-1, 1].map((side) => (
            <mesh key={`${index}-${side}`} position={[x, -0.02, side * 0.62]} rotation={[0, 0, side * 0.22]}>
              <boxGeometry args={[0.035, 0.035, 0.92]} />
              <meshStandardMaterial color="#a27b4a" roughness={0.9} />
            </mesh>
          ));
        })}
      </group>

      <group position={[-1.42, 0.48, 0]}>
        <mesh castShadow={!compact} rotation={[0, 0, -0.22]}>
          <coneGeometry args={[0.14, 0.58, 7]} />
          <meshStandardMaterial color="#56321e" roughness={0.75} />
        </mesh>
        <mesh position={[-0.08, 0.22, 0]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color="#8b5d32" roughness={0.8} />
        </mesh>
      </group>

      <mesh position={[0, -0.04, 0]} scale={[1.3, 0.02, 0.48]}>
        <sphereGeometry args={[1, 20, 10]} />
        <meshBasicMaterial color="#c9dddc" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}
