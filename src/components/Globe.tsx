import { Line } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createEarthTexture } from '../lib/earthTexture';
import { GLOBE_RADIUS, latLonToVector3 } from '../lib/geo';
import type { RenderQuality } from '../types';

interface GlobeProps {
  quality: Exclude<RenderQuality, 'auto'>;
}

function Graticule({ compact }: { compact: boolean }) {
  const latitudeStep = compact ? 30 : 15;
  const longitudeStep = compact ? 30 : 15;
  const pointStep = compact ? 6 : 3;

  const latitudeLines = useMemo(
    () =>
      Array.from({ length: Math.floor(150 / latitudeStep) + 1 }, (_, index) => -75 + index * latitudeStep).map((lat) =>
        Array.from({ length: Math.floor(360 / pointStep) + 1 }, (_, pointIndex) =>
          latLonToVector3(lat, -180 + pointIndex * pointStep, GLOBE_RADIUS + 0.012),
        ),
      ),
    [latitudeStep, pointStep],
  );

  const longitudeLines = useMemo(
    () =>
      Array.from({ length: Math.floor(360 / longitudeStep) }, (_, index) => -180 + index * longitudeStep).map((lon) =>
        Array.from({ length: Math.floor(180 / pointStep) + 1 }, (_, pointIndex) =>
          latLonToVector3(-90 + pointIndex * pointStep, lon, GLOBE_RADIUS + 0.012),
        ),
      ),
    [longitudeStep, pointStep],
  );

  return (
    <group>
      {[...latitudeLines, ...longitudeLines].map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#b59a61"
          transparent
          opacity={compact ? 0.055 : 0.075}
          lineWidth={0.42}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

export function Globe({ quality }: GlobeProps) {
  const compact = quality === 'battery';
  const textureWidth = quality === 'high' ? 2048 : quality === 'balanced' ? 1280 : 768;
  const texture = useMemo(() => createEarthTexture(textureWidth), [textureWidth]);
  const segments = quality === 'high' ? 96 : quality === 'balanced' ? 72 : 48;

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group rotation-y={-0.08}>
      <mesh receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, segments, segments]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.91}
          metalness={0.02}
          emissive="#17110b"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh scale={1.018}>
        <sphereGeometry args={[GLOBE_RADIUS, Math.min(64, segments), Math.min(64, segments)]} />
        <meshBasicMaterial
          color="#b98f54"
          transparent
          opacity={0.035}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.075}>
        <sphereGeometry args={[GLOBE_RADIUS, Math.min(64, segments), Math.min(64, segments)]} />
        <meshBasicMaterial
          color="#536a70"
          transparent
          opacity={0.025}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Graticule compact={compact} />
    </group>
  );
}
