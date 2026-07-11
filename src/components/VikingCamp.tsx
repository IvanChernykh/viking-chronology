import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { vikingCharacters, type VikingCharacter } from '../data/dialogues';
import { latLonToMap } from '../lib/flatMap';

interface VikingCampProps {
  compact: boolean;
  onSpeak: (character: VikingCharacter) => void;
}

function CharacterActor({ character, compact, onSpeak }: { character: VikingCharacter; compact: boolean; onSpeak: (character: VikingCharacter) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useMemo(() => character.id.length * 0.37, [character.id]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.25 + phase) * 0.012;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.42 + phase) * 0.06;
  });

  return (
    <group position={character.offset}>
      <group ref={groupRef} scale={compact ? 0.82 : 1}>
        <mesh castShadow={!compact} position={[0, 0.25, 0]}>
          <capsuleGeometry args={[0.065, 0.17, 5, 8]} />
          <meshStandardMaterial color={character.accent} roughness={0.88} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.48, 0]}>
          <sphereGeometry args={[0.075, compact ? 8 : 14, compact ? 6 : 10]} />
          <meshStandardMaterial color="#c99a72" roughness={0.92} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.092, 0.09, 6]} />
          <meshStandardMaterial color="#596058" metalness={0.28} roughness={0.54} />
        </mesh>
        <mesh position={[0, 0.515, 0.068]}>
          <boxGeometry args={[0.014, 0.075, 0.012]} />
          <meshStandardMaterial color="#474c48" metalness={0.32} roughness={0.5} />
        </mesh>
      </group>
      <mesh
        position={[0, 0.31, 0]}
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
        <sphereGeometry args={[compact ? 0.24 : 0.19, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && (
        <Html center position={[0, 0.78, 0]} distanceFactor={7.8} zIndexRange={[18, 8]}>
          <button type="button" className="character-label" onClick={() => onSpeak(character)}>
            <strong>{character.name}</strong>
            <span>{character.role}</span>
          </button>
        </Html>
      )}
    </group>
  );
}

function Pine({ position, scale = 1, compact }: { position: [number, number, number]; scale?: number; compact: boolean }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow={!compact} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.018, 0.026, 0.2, 6]} />
        <meshStandardMaterial color="#4b2f1f" roughness={0.96} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 0.29, 0]}>
        <coneGeometry args={[0.13, 0.42, compact ? 6 : 9]} />
        <meshStandardMaterial color="#1e4439" roughness={0.94} />
      </mesh>
    </group>
  );
}

export function VikingCamp({ compact, onSpeak }: VikingCampProps) {
  const origin = latLonToMap(59.1, 10.1, 0.17);
  const trees = useMemo<Array<{ position: [number, number, number]; scale: number }>>(
    () => [
      [-0.92, 0, -0.46, 1.1], [-0.78, 0, -0.72, 0.82], [-0.56, 0, -0.58, 0.72],
      [0.78, 0, -0.55, 0.92], [0.96, 0, -0.3, 0.74], [0.68, 0, -0.83, 0.66],
      [-0.98, 0, 0.35, 0.74], [0.92, 0, 0.44, 0.82],
    ].map(([x, y, z, scale]) => ({ position: [x, y, z] as [number, number, number], scale })),
    [],
  );

  return (
    <group position={origin} scale={compact ? 0.8 : 1}>
      <mesh receiveShadow position={[0, -0.012, 0]}>
        <cylinderGeometry args={[1.08, 1.2, 0.06, 28]} />
        <meshStandardMaterial color="#3f513f" roughness={1} />
      </mesh>
      <group position={[-0.12, 0.02, -0.2]}>
        <mesh castShadow={!compact} position={[0, 0.18, 0]}>
          <boxGeometry args={[0.68, 0.3, 0.34]} />
          <meshStandardMaterial color="#5a3824" roughness={0.94} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.05, 0.48, 0.6]}>
          <coneGeometry args={[0.48, 0.5, 4]} />
          <meshStandardMaterial color="#3b2b20" roughness={0.98} />
        </mesh>
      </group>
      <group position={[0.78, 0.01, 0.18]}>
        <mesh castShadow={!compact} position={[0, 0.13, 0]}>
          <boxGeometry args={[0.42, 0.22, 0.28]} />
          <meshStandardMaterial color="#65412a" roughness={0.94} />
        </mesh>
        <mesh castShadow={!compact} position={[0, 0.31, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.72, 0.36, 0.5]}>
          <coneGeometry args={[0.42, 0.42, 4]} />
          <meshStandardMaterial color="#423026" roughness={0.98} />
        </mesh>
      </group>
      <group position={[-0.55, 0.03, 0.66]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.025, 0]}>
          <boxGeometry args={[0.055, 0.85, 0.24]} />
          <meshStandardMaterial color="#6d4b2e" roughness={0.9} />
        </mesh>
      </group>
      {!compact && (
        <group position={[0.28, 0.02, 0.04]}>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.06, 8]} />
            <meshStandardMaterial color="#29221d" roughness={1} />
          </mesh>
          <pointLight position={[0, 0.32, 0]} color="#ff9b47" intensity={3.1} distance={1.35} decay={2} />
          <mesh position={[0, 0.13, 0]}>
            <coneGeometry args={[0.065, 0.24, 7]} />
            <meshStandardMaterial color="#e36b2e" emissive="#ff6c24" emissiveIntensity={1.5} transparent opacity={0.88} />
          </mesh>
        </group>
      )}
      {trees.slice(0, compact ? 5 : trees.length).map((tree) => (
        <Pine key={tree.position.join(':')} position={tree.position} scale={tree.scale} compact={compact} />
      ))}
      {vikingCharacters.map((character) => (
        <CharacterActor key={character.id} character={character} compact={compact} onSpeak={onSpeak} />
      ))}
      <Html center position={[0, 1.05, -0.12]} distanceFactor={10} zIndexRange={[8, 3]}>
        <div className="camp-label">
          <strong>Скандинавия</strong>
          <span>начало хроники · 750 год</span>
        </div>
      </Html>
    </group>
  );
}
