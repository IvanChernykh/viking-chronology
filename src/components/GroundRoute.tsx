import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { VikingRoute } from '../types';
import { createVoyageCurve } from '../lib/voyagePath';
import { LongshipModel } from './LongshipModel';

interface GroundRouteProps {
  route: VikingRoute;
  progress: number;
  emphasized: boolean;
  compact: boolean;
  showShip: boolean;
}

function ShipOnCurve({ curve, progress, compact, accent }: { curve: THREE.CatmullRomCurve3; progress: number; compact: boolean; accent: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothProgress = useRef(progress);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 1 / 24);
    smoothProgress.current = THREE.MathUtils.damp(smoothProgress.current, progress, 5.2, delta);
    const p = THREE.MathUtils.clamp(smoothProgress.current, 0.001, 0.999);
    curve.getPointAt(p, point);
    curve.getTangentAt(p, tangent);
    groupRef.current.position.copy(point);
    groupRef.current.position.y += Math.sin(clock.elapsedTime * 1.8) * 0.018;
    groupRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.15) * 0.018;
  });
  return <group ref={groupRef}><LongshipModel compact={compact} accent={accent} /></group>;
}

export function GroundRoute({ route, progress, emphasized, compact, showShip }: GroundRouteProps) {
  const curve = useMemo(() => createVoyageCurve(route), [route]);
  const fullPoints = useMemo(() => curve.getPoints(compact ? 72 : 160), [compact, curve]);
  const visibleCount = Math.max(2, Math.ceil(THREE.MathUtils.clamp(progress, 0, 1) * (fullPoints.length - 1)) + 1);
  const visiblePoints = fullPoints.slice(0, visibleCount);
  return <group>
    {!compact && emphasized && <Line points={visiblePoints} color={route.color} lineWidth={7} transparent opacity={0.11} depthWrite={false} />}
    <Line points={visiblePoints} color={route.color} lineWidth={emphasized ? (compact ? 1.7 : 2.7) : 0.9} transparent opacity={emphasized ? 0.92 : 0.12} depthWrite={false} />
    {emphasized && visiblePoints.filter((_, index) => index % (compact ? 12 : 18) === 0).map((point, index) => <mesh key={index} position={point}><sphereGeometry args={[compact ? 0.022 : 0.032, 8, 6]} /><meshBasicMaterial color={route.accent} transparent opacity={0.58} /></mesh>)}
    {showShip && emphasized && progress > 0.005 && progress < 0.999 && <ShipOnCurve curve={curve} progress={progress} compact={compact} accent={route.accent} />}
  </group>;
}
