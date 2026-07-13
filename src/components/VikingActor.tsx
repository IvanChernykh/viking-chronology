import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { VikingCharacter } from '../data/dialogues';

interface VikingActorProps {
  character: VikingCharacter;
  compact: boolean;
  onSpeak: (character: VikingCharacter) => void;
  ready?: boolean;
}

export function VikingActor({ character, compact, onSpeak, ready = false }: VikingActorProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useMemo(() => character.id.length * 0.43, [character.id]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 1.25) * 0.012;
      rootRef.current.rotation.y = Math.sin(t * 0.34) * 0.06;
    }
    if (leftArmRef.current) leftArmRef.current.rotation.x = -0.08 + Math.sin(t * 0.82) * 0.045;
    if (rightArmRef.current) rightArmRef.current.rotation.x = 0.08 - Math.sin(t * 0.82) * 0.045;
  });

  return (
    <group position={character.offset}>
      <group ref={rootRef} scale={compact ? 0.82 : 1}>
        <mesh castShadow={!compact} position={[0, 0.38, 0]}>
          <capsuleGeometry args={[0.085, 0.3, 6, 10]} />
          <meshStandardMaterial color={character.accent} roughness={0.9} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.34, 0.03]} scale={[1.25, 1.15, 0.75]}>
          <coneGeometry args={[0.12, 0.36, 7]} />
          <meshStandardMaterial color="#4a382b" roughness={0.98} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.68, 0]}>
          <sphereGeometry args={[0.105, compact ? 9 : 18, compact ? 7 : 12]} />
          <meshStandardMaterial color="#bd8e68" roughness={0.92} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.77, -0.005]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.128, 0.12, 7]} />
          <meshStandardMaterial color="#5b5c57" metalness={0.28} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.65, 0.098]}>
          <boxGeometry args={[0.017, 0.085, 0.014]} />
          <meshStandardMaterial color="#4a4138" roughness={0.86} />
        </mesh>
        <group ref={leftArmRef} position={[-0.12, 0.48, 0]} rotation={[0, 0, 0.16]}>
          <mesh castShadow={!compact} position={[0, -0.13, 0]}>
            <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
            <meshStandardMaterial color="#6d4932" roughness={0.92} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.12, 0.48, 0]} rotation={[0, 0, -0.16]}>
          <mesh castShadow={!compact} position={[0, -0.13, 0]}>
            <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
            <meshStandardMaterial color="#6d4932" roughness={0.92} />
          </mesh>
        </group>
        {[-0.055, 0.055].map((x) => (
          <mesh key={x} castShadow={!compact} position={[x, 0.12, 0]}>
            <capsuleGeometry args={[0.038, 0.22, 4, 8]} />
            <meshStandardMaterial color="#3b3028" roughness={0.96} />
          </mesh>
        ))}
      </group>

      <mesh
        position={[0, 0.43, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onSpeak(character);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
      >
        <sphereGeometry args={[compact ? 0.28 : 0.22, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {(hovered || ready) && (
        <Html center position={[0, 1.03, 0]} distanceFactor={8.4} zIndexRange={[20, 8]}>
          <button type="button" className={`character-label ${ready ? 'character-label--ready' : ''}`} onClick={() => onSpeak(character)}>
            <strong>{character.name}</strong>
            <span>{ready ? 'совет получен' : character.role}</span>
          </button>
        </Html>
      )}
    </group>
  );
}
