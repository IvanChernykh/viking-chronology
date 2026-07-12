import { useMemo } from 'react';
import * as THREE from 'three';

interface LongshipModelProps {
  compact?: boolean;
  accent?: string;
  sailRef?: React.RefObject<THREE.Mesh | null>;
}

function createHullGeometry(): THREE.BufferGeometry {
  const sections = [
    { z: -0.92, w: 0.02, y: 0.17 },
    { z: -0.7, w: 0.22, y: 0.14 },
    { z: -0.28, w: 0.31, y: 0.11 },
    { z: 0.28, w: 0.31, y: 0.11 },
    { z: 0.7, w: 0.22, y: 0.14 },
    { z: 0.92, w: 0.02, y: 0.2 },
  ];
  const vertices: number[] = [];
  const indices: number[] = [];
  sections.forEach((section) => {
    vertices.push(
      -section.w, section.y, section.z,
      section.w, section.y, section.z,
      -section.w * 0.42, -0.04, section.z,
      section.w * 0.42, -0.04, section.z,
    );
  });
  for (let index = 0; index < sections.length - 1; index += 1) {
    const a = index * 4;
    const b = (index + 1) * 4;
    indices.push(
      a, b, b + 2, a, b + 2, a + 2,
      a + 1, a + 3, b + 3, a + 1, b + 3, b + 1,
      a + 2, b + 2, b + 3, a + 2, b + 3, a + 3,
    );
  }
  indices.push(0, 1, 3, 0, 3, 2);
  const last = (sections.length - 1) * 4;
  indices.push(last, last + 2, last + 3, last, last + 3, last + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function Shield({ side, z, accent, compact }: { side: -1 | 1; z: number; accent: string; compact: boolean }) {
  return (
    <group position={[side * 0.29, 0.12, z]} rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <mesh castShadow={!compact}>
        <cylinderGeometry args={[0.09, 0.09, 0.018, compact ? 10 : 18]} />
        <meshStandardMaterial color={accent} roughness={0.76} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.011, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.024, 10]} />
        <meshStandardMaterial color="#2b2019" roughness={0.6} metalness={0.25} />
      </mesh>
    </group>
  );
}

export function LongshipModel({ compact = false, accent = '#a54c38', sailRef }: LongshipModelProps) {
  const hull = useMemo(() => createHullGeometry(), []);
  const shields = compact ? [-0.45, 0, 0.45] : [-0.58, -0.28, 0.02, 0.32, 0.6];
  return (
    <group scale={compact ? 0.72 : 0.88}>
      <mesh geometry={hull} castShadow={!compact} receiveShadow>
        <meshStandardMaterial color="#3c1d12" roughness={0.72} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.125, 0]} castShadow={!compact}>
        <boxGeometry args={[0.48, 0.035, 1.32]} />
        <meshStandardMaterial color="#705038" roughness={0.9} />
      </mesh>
      {[-0.42, -0.14, 0.14, 0.42].map((z) => (
        <mesh key={z} position={[0, 0.17, z]} castShadow={!compact}>
          <boxGeometry args={[0.61, 0.025, 0.035]} />
          <meshStandardMaterial color="#4e301f" roughness={0.94} />
        </mesh>
      ))}
      <mesh position={[0, 0.61, 0.04]} castShadow={!compact}>
        <cylinderGeometry args={[0.018, 0.028, 1.05, 8]} />
        <meshStandardMaterial color="#3d291a" roughness={0.88} />
      </mesh>
      <mesh ref={sailRef} position={[0, 0.66, 0.08]} castShadow={!compact}>
        <planeGeometry args={[0.82, 0.66, compact ? 2 : 8, compact ? 2 : 6]} />
        <meshStandardMaterial color="#c8aa75" roughness={0.88} side={THREE.DoubleSide} emissive="#3b261a" emissiveIntensity={0.08} />
      </mesh>
      {!compact && (
        <>
          <mesh position={[0, 0.66, 0.075]}><planeGeometry args={[0.035, 0.67]} /><meshBasicMaterial color={accent} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, 0.66, 0.07]} rotation={[0, 0, Math.PI / 2]}><planeGeometry args={[0.025, 0.83]} /><meshBasicMaterial color={accent} side={THREE.DoubleSide} /></mesh>
        </>
      )}
      {shields.flatMap((z) => [
        <Shield key={`l-${z}`} side={-1} z={z} accent={accent} compact={compact} />,
        <Shield key={`r-${z}`} side={1} z={z} accent={accent} compact={compact} />,
      ])}
    </group>
  );
}
