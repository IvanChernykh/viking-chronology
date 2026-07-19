import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { EnvironmentSnapshot } from '../game/environment/environmentModel';
import { createVoyageCurve } from '../lib/voyagePath';
import type { VikingRoute } from '../types';
import { LongshipModel } from './LongshipModel';

interface GroundRouteProps {
  route: VikingRoute;
  progress: number;
  emphasized: boolean;
  compact: boolean;
  showShip: boolean;
  environment: EnvironmentSnapshot;
}

function ShipOnCurve({
  curve,
  progress,
  compact,
  accent,
  environment,
}: {
  curve: THREE.CatmullRomCurve3;
  progress: number;
  compact: boolean;
  accent: string;
  environment: EnvironmentSnapshot;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothProgress = useRef(progress);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const targetEuler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);

  useFrame(({ clock }, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 1 / 24);
    smoothProgress.current = THREE.MathUtils.damp(smoothProgress.current, progress, 5.2, delta);
    const p = THREE.MathUtils.clamp(smoothProgress.current, 0.001, 0.999);
    curve.getPointAt(p, point);
    curve.getTangentAt(p, tangent).normalize();

    const time = clock.elapsedTime;
    const heave = Math.sin(time * (1.35 + environment.seaState * 1.2) + p * 18) * (0.012 + environment.seaState * 0.045);
    const roll = Math.sin(time * 1.1 + p * 11) * (0.008 + environment.seaState * 0.055);
    const pitch = Math.sin(time * 0.83 + p * 17) * (0.006 + environment.seaState * 0.035);
    const heading = Math.atan2(-tangent.z, tangent.x);

    groupRef.current.position.copy(point);
    groupRef.current.position.y += heave;
    targetEuler.set(roll, heading, pitch, 'YXZ');
    targetQuaternion.setFromEuler(targetEuler);
    groupRef.current.quaternion.slerp(targetQuaternion, 1 - Math.exp(-delta * 8));
  });

  return (
    <group ref={groupRef}>
      <LongshipModel
        compact={compact}
        accent={accent}
        windStrength={environment.windStrength}
        seaState={environment.seaState}
      />
    </group>
  );
}

export function GroundRoute({
  route,
  progress,
  emphasized,
  compact,
  showShip,
  environment,
}: GroundRouteProps) {
  const curve = useMemo(() => createVoyageCurve(route), [route]);
  const fullPoints = useMemo(() => curve.getPoints(compact ? 72 : 160), [compact, curve]);
  const visibleCount = Math.max(2, Math.ceil(THREE.MathUtils.clamp(progress, 0, 1) * (fullPoints.length - 1)) + 1);
  const visiblePoints = fullPoints.slice(0, visibleCount);

  return (
    <group>
      {!compact && emphasized && (
        <Line points={visiblePoints} color={route.color} lineWidth={7} transparent opacity={0.08} depthWrite={false} />
      )}
      <Line
        points={visiblePoints}
        color={route.color}
        lineWidth={emphasized ? (compact ? 1.7 : 2.7) : 0.9}
        transparent
        opacity={emphasized ? 0.86 : 0.1}
        depthWrite={false}
      />
      {emphasized && visiblePoints.filter((_, index) => index % (compact ? 12 : 18) === 0).map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[compact ? 0.022 : 0.032, 8, 6]} />
          <meshBasicMaterial color={route.accent} transparent opacity={0.48} />
        </mesh>
      ))}
      {showShip && emphasized && progress > 0.005 && progress < 0.999 && (
        <ShipOnCurve
          curve={curve}
          progress={progress}
          compact={compact}
          accent={route.accent}
          environment={environment}
        />
      )}
    </group>
  );
}
