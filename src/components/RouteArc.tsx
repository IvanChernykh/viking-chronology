import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { makeArcPoints } from '../lib/geo';
import { MovingShip } from './MovingShip';

interface RouteArcProps {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  color: string;
  revealProgress: number;
  shipSpeed: number;
  shipsEnabled: boolean;
  emphasized: boolean;
  shipOffset: number;
  compact: boolean;
}

export function RouteArc({
  start,
  end,
  color,
  revealProgress,
  shipSpeed,
  shipsEnabled,
  emphasized,
  shipOffset,
  compact,
}: RouteArcProps) {
  const fullPoints = useMemo(
    () => makeArcPoints(start.lat, start.lon, end.lat, end.lon, undefined, compact ? 36 : 64),
    [compact, start.lat, start.lon, end.lat, end.lon],
  );

  const visiblePoints = useMemo(() => {
    const progress = THREE.MathUtils.clamp(revealProgress, 0, 1);
    const count = Math.max(2, Math.ceil(fullPoints.length * progress));
    return count >= fullPoints.length ? fullPoints : fullPoints.slice(0, count);
  }, [fullPoints, revealProgress]);

  if (revealProgress <= 0) return null;

  return (
    <group>
      <Line
        points={visiblePoints}
        color={color}
        lineWidth={compact ? (emphasized ? 1.65 : 0.95) : emphasized ? 2.3 : 1.25}
        transparent
        opacity={emphasized ? 0.92 : 0.38}
        depthWrite={false}
        toneMapped={false}
      />
      {!compact && (
        <Line
          points={visiblePoints}
          color="#f1ddb0"
          lineWidth={0.5}
          transparent
          opacity={emphasized ? 0.26 : 0.08}
          depthWrite={false}
          toneMapped={false}
        />
      )}
      {revealProgress >= 0.97 && (
        <MovingShip
          points={fullPoints}
          color={color}
          speed={shipSpeed}
          offset={shipOffset}
          active={shipsEnabled}
          compact={compact}
        />
      )}
    </group>
  );
}
