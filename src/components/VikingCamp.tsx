import { Html, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { vikingCharacters, type VikingCharacter } from '../data/dialogues';
import { latLonToMap } from '../lib/flatMap';
import { LongshipModel } from './LongshipModel';
import { VikingActor } from './VikingActor';

interface VikingCampProps {
  compact: boolean;
  onSpeak: (character: VikingCharacter) => void;
  readyCharacters: Set<string>;
  expeditionActive: boolean;
}

function Longhouse({ position, scale = 1, compact }: { position: [number, number, number]; scale?: number; compact: boolean }) {
  return <group position={position} scale={scale}>
    <mesh castShadow={!compact} receiveShadow position={[0, 0.22, 0]}><boxGeometry args={[0.92, 0.38, 0.44]} /><meshStandardMaterial color="#5b3924" roughness={0.96} /></mesh>
    <mesh castShadow={!compact} position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.18, 0.46, 0.72]}><coneGeometry args={[0.58, 0.62, 4]} /><meshStandardMaterial color="#33251c" roughness={1} /></mesh>
    {[-0.28, 0, 0.28].map((x) => <mesh key={x} position={[x, 0.25, 0.225]}><boxGeometry args={[0.045, 0.26, 0.025]} /><meshStandardMaterial color="#2c1b13" roughness={0.98} /></mesh>)}
    <mesh position={[0, 0.24, 0.23]}><boxGeometry args={[0.18, 0.24, 0.035]} /><meshStandardMaterial color="#2b1b13" roughness={0.98} /></mesh>
  </group>;
}

function Pine({ position, scale = 1, compact }: { position: [number, number, number]; scale?: number; compact: boolean }) {
  return <group position={position} scale={scale}>
    <mesh castShadow={!compact} position={[0, 0.18, 0]}><cylinderGeometry args={[0.018, 0.03, 0.36, 7]} /><meshStandardMaterial color="#40281a" roughness={0.98} /></mesh>
    {[0.29, 0.48, 0.66].map((y, index) => <mesh key={y} castShadow={!compact} position={[0, y, 0]}><coneGeometry args={[0.19 - index * 0.035, 0.34, compact ? 7 : 10]} /><meshStandardMaterial color={index === 0 ? '#183a32' : '#21463a'} roughness={0.96} /></mesh>)}
  </group>;
}

function Fire({ compact }: { compact: boolean }) {
  const flameRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (flameRef.current) { flameRef.current.scale.y = 0.85 + Math.sin(clock.elapsedTime * 8.2) * 0.16; flameRef.current.rotation.y = clock.elapsedTime * 1.3; } });
  return <group position={[0.18, 0.04, 0.12]}>
    <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.1, 0.12, 0.06, 10]} /><meshStandardMaterial color="#25201b" roughness={1} /></mesh>
    <mesh ref={flameRef} position={[0, 0.18, 0]}><coneGeometry args={[0.065, 0.32, 8]} /><meshStandardMaterial color="#f18a3b" emissive="#ff5b1c" emissiveIntensity={2.3} transparent opacity={0.92} /></mesh>
    {!compact && <pointLight position={[0, 0.38, 0]} color="#ff8b42" intensity={4.6} distance={2.1} decay={2} />}
    {!compact && <Sparkles count={12} scale={[0.5, 0.8, 0.5]} position={[0, 0.5, 0]} size={1.2} speed={0.35} color="#ffb15c" />}
  </group>;
}

export function VikingCamp({ compact, onSpeak, readyCharacters, expeditionActive }: VikingCampProps) {
  const origin = latLonToMap(59.1, 10.1, 0.2);
  const trees = useMemo<Array<{ position: [number, number, number]; scale: number }>>(() => {
    const source = [[-1.35,0,-0.65,1.1],[-1.1,0,-1,0.82],[-0.78,0,-0.86,0.74],[1.15,0,-0.72,0.98],[1.42,0,-0.42,0.76],[0.88,0,-1.05,0.7],[-1.45,0,0.52,0.76],[1.32,0,0.64,0.84],[-0.9,0,0.98,0.68]];
    return source.map(([x,y,z,scale]) => ({ position: [x,y,z] as [number,number,number], scale }));
  }, []);
  return <group position={origin} scale={compact ? 0.82 : 1}>
    <mesh receiveShadow position={[0,-0.04,0]}><cylinderGeometry args={[1.58,1.76,0.11,38]} /><meshStandardMaterial color="#31463b" roughness={1} /></mesh>
    <mesh receiveShadow position={[0,-0.005,0.18]} scale={[1.2,0.03,0.76]}><sphereGeometry args={[1,24,12]} /><meshStandardMaterial color="#46543f" roughness={1} /></mesh>
    <Longhouse position={[-0.38,0,-0.36]} scale={1.05} compact={compact} />
    <Longhouse position={[0.78,0,0.04]} scale={0.7} compact={compact} />
    <Longhouse position={[-0.92,0,0.48]} scale={0.58} compact={compact} />
    <group position={[-0.28,0.02,1.12]}>
      <mesh receiveShadow position={[0,0.03,0]}><boxGeometry args={[1.55,0.06,0.28]} /><meshStandardMaterial color="#69462c" roughness={0.92} /></mesh>
      {[-0.65,-0.22,0.22,0.65].map((x) => <mesh key={x} position={[x,-0.18,0]}><cylinderGeometry args={[0.035,0.05,0.42,7]} /><meshStandardMaterial color="#4c311f" roughness={0.98} /></mesh>)}
      {!expeditionActive && <group position={[0,0.28,0]} rotation={[0,Math.PI/2,0]} scale={0.34}><LongshipModel compact accent="#d4b36c" /></group>}
    </group>
    <Fire compact={compact} />
    {trees.slice(0, compact ? 6 : trees.length).map((tree) => <Pine key={tree.position.join(':')} position={tree.position} scale={tree.scale} compact={compact} />)}
    {vikingCharacters.map((character) => <VikingActor key={character.id} character={character} compact={compact} ready={readyCharacters.has(character.id)} onSpeak={onSpeak} />)}
    <Html center position={[0,1.38,-0.25]} distanceFactor={10} zIndexRange={[8,3]}><div className="camp-label"><strong>Хавнфьорд</strong><span>совет экспедиции · Скандинавия</span></div></Html>
  </group>;
}
