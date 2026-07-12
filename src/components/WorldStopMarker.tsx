import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { latLonToMap, terrainHeight } from '../lib/flatMap';
import type { VikingStop } from '../types';

interface WorldStopMarkerProps {
  stop: VikingStop; color: string; active: boolean; selected: boolean; dimmed: boolean; compact: boolean; onSelect: (stop: VikingStop) => void;
}

export function WorldStopMarker({ stop, color, active, selected, dimmed, compact, onSelect }: WorldStopMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const position = latLonToMap(stop.lat, stop.lon, terrainHeight(stop.lat, stop.lon, 1) + 0.05);

  useFrame(({ clock }) => {
    if (!groupRef.current || !active) return;
    const pulse = selected ? 1.13 : 1 + Math.sin(clock.elapsedTime * 2.1 + stop.year) * 0.045;
    groupRef.current.scale.setScalar(pulse);
  });

  if (!active) return null;
  const opacity = dimmed ? 0.28 : 1;
  return (
    <group ref={groupRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[selected ? 0.13 : 0.09, selected ? 0.19 : 0.145, 28]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.82} depthWrite={false} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.034, 0.055, 0.25, compact ? 8 : 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.82 : 0.34} roughness={0.48} transparent opacity={opacity} />
      </mesh>
      <mesh
        position={[0, 0.15, 0]}
        onPointerDown={(event) => {
          event.stopPropagation(); pointerStart.current = { x: event.clientX, y: event.clientY };
          const target = event.nativeEvent.target; if (target instanceof Element) target.setPointerCapture?.(event.pointerId);
        }}
        onPointerUp={(event) => {
          event.stopPropagation(); const start = pointerStart.current; pointerStart.current = null;
          const target = event.nativeEvent.target; if (target instanceof Element) target.releasePointerCapture?.(event.pointerId);
          if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) <= (compact ? 18 : 9)) onSelect(stop);
        }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
      >
        <sphereGeometry args={[compact ? 0.31 : 0.24, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(hovered || selected) && (
        <Html center position={[0, 0.46, 0]} distanceFactor={compact ? 6.5 : 8.5} zIndexRange={[12, 4]}>
          <button type="button" className="world-label" onClick={() => onSelect(stop)}><strong>{stop.name}</strong><span>{stop.yearLabel}</span></button>
        </Html>
      )}
    </group>
  );
}
