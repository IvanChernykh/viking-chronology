import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { makeGroundCurve } from '../lib/flatMap';
import type { VikingRoute, VikingStop } from '../types';

interface GroundRouteProps {
  route: VikingRoute;
  timelineYear: number;
  emphasized: boolean;
  shipsEnabled: boolean;
  shipSpeed: number;
  compact: boolean;
}

function Longship({ curve, baseProgress, speed, color, compact }: {
  curve: THREE.CatmullRomCurve3;
  baseProgress: number;
  speed: number;
  color: string;
  compact: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;
    const delta = Math.min(rawDelta, 1 / 30);
    const drift = (clock.elapsedTime * 0.018 * speed) % 0.16;
    const progress = THREE.MathUtils.clamp(baseProgress * 0.86 + drift, 0.04, 0.98);
    const point = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress).normalize();
    const desiredYaw = Math.atan2(tangent.x, tangent.z);
    group.position.lerp(point, 1 - Math.exp(-delta * 12));
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, desiredYaw, 10, delta);
    group.position.y = point.y + Math.sin(clock.elapsedTime * 1.7) * 0.012;
    group.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.025;
    if (sailRef.current) sailRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.035;
  });

  return (
    <group ref={groupRef} scale={compact ? 0.72 : 0.9}>
      <mesh castShadow={!compact} position={[0, 0.035, 0]} scale={[1.25, 0.28, 0.42]}>
        <sphereGeometry args={[0.22, compact ? 8 : 14, compact ? 6 : 10]} />
        <meshStandardMaterial color="#4a2415" roughness={0.78} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.68, 6]} />
        <meshStandardMaterial color="#3a2517" roughness={0.9} />
      </mesh>
      <mesh ref={sailRef} castShadow={!compact} position={[0, 0.42, 0]}>
        <planeGeometry args={[0.62, 0.48, compact ? 1 : 8, compact ? 1 : 5]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.72} />
      </mesh>
      {!compact && Array.from({ length: 5 }, (_, index) => {
        const z = (index - 2) * 0.12;
        return (
          <group key={z} position={[0, 0.08, z]}>
            <mesh rotation={[0, 0, Math.PI / 2.7]} position={[0.34, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.72, 5]} />
              <meshStandardMaterial color="#8f6a3f" roughness={0.85} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 2.7]} position={[-0.34, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.72, 5]} />
              <meshStandardMaterial color="#8f6a3f" roughness={0.85} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function segmentProgress(start: VikingStop, end: VikingStop, year: number): number {
  return THREE.MathUtils.clamp((year - start.year) / Math.max(1, end.year - start.year), 0, 1);
}

export function GroundRoute({ route, timelineYear, emphasized, shipsEnabled, shipSpeed, compact }: GroundRouteProps) {
  const segments = useMemo(
    () => route.stops.slice(1).map((end, index) => {
      const start = route.stops[index];
      return { start, end, curve: makeGroundCurve(start, end, index + route.startYear) };
    }),
    [route],
  );

  let latestActiveIndex = -1;
  segments.forEach(({ start }, index) => {
    if (timelineYear >= start.year) latestActiveIndex = index;
  });

  return (
    <group>
      {segments.map(({ start, end, curve }, index) => {
        const progress = segmentProgress(start, end, timelineYear);
        if (progress <= 0) return null;
        const sampleCount = compact ? 34 : 64;
        const fullPoints = curve.getPoints(sampleCount);
        const visibleCount = Math.max(2, Math.ceil(progress * (fullPoints.length - 1)) + 1);
        const points = fullPoints.slice(0, visibleCount);
        const opacity = emphasized ? 0.9 : 0.22;

        return (
          <group key={`${start.id}-${end.id}`}>
            {!compact && emphasized && (
              <Line points={points} color={route.color} lineWidth={5.4} transparent opacity={0.13} depthWrite={false} />
            )}
            <Line
              points={points}
              color={route.color}
              lineWidth={emphasized ? (compact ? 1.6 : 2.4) : 1}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
            {shipsEnabled && emphasized && index === latestActiveIndex && progress > 0.04 && (
              <Longship curve={curve} baseProgress={progress} speed={shipSpeed} color={route.accent} compact={compact} />
            )}
          </group>
        );
      })}
    </group>
  );
}
