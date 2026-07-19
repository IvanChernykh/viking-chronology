import { Sky, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { EnvironmentSnapshot } from '../game/environment/environmentModel';
import type { RenderQuality } from '../types';

interface EnvironmentDirectorProps {
  environment: EnvironmentSnapshot;
  quality: Exclude<RenderQuality, 'auto'>;
  isMobile: boolean;
}

function ExposureController({ exposure }: { exposure: number }) {
  useFrame(({ gl }, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 24);
    gl.toneMappingExposure = THREE.MathUtils.damp(gl.toneMappingExposure, exposure, 5.5, delta);
  });

  return null;
}

function WeatherParticles({ environment, quality, isMobile }: EnvironmentDirectorProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const active = environment.precipitation > 0.34 && (environment.weather === 'rain' || environment.weather === 'storm' || environment.weather === 'snow');
  const snow = environment.weather === 'snow';
  const baseCount = quality === 'high' ? 1500 : quality === 'balanced' ? 820 : 320;
  const count = Math.max(0, Math.round(baseCount * environment.precipitation * (isMobile ? 0.62 : 1) * (snow ? 0.62 : 1)));

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const seed = Math.sin((index + 1) * 918.17) * 43758.5453;
      const random = seed - Math.floor(seed);
      const secondary = Math.sin((index + 1) * 127.31) * 24634.6345;
      const randomB = secondary - Math.floor(secondary);
      positions[offset] = (random * 2 - 1) * 8;
      positions[offset + 1] = randomB * 8 - 1;
      positions[offset + 2] = ((random + randomB * 0.37) % 1) * 10 - 5;
      speeds[index] = snow ? 0.55 + randomB * 0.65 : 5.5 + randomB * 5.2;
    }
    return { positions, speeds };
  }, [count, snow]);

  useFrame((_, rawDelta) => {
    if (!active || !pointsRef.current || !groupRef.current) return;
    const delta = Math.min(rawDelta, 1 / 24);
    const attribute = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = attribute.array as Float32Array;
    const windX = environment.windDirection[0] * environment.windStrength;
    const windZ = environment.windDirection[1] * environment.windStrength;

    groupRef.current.position.set(camera.position.x, camera.position.y - 1.6, camera.position.z);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] += windX * delta * (snow ? 0.55 : 1.35);
      positions[offset + 1] -= particleData.speeds[index] * delta;
      positions[offset + 2] += windZ * delta * (snow ? 0.55 : 1.35);

      if (positions[offset + 1] < -1.5) positions[offset + 1] = 7.2;
      if (positions[offset] > 8) positions[offset] = -8;
      if (positions[offset] < -8) positions[offset] = 8;
      if (positions[offset + 2] > 5) positions[offset + 2] = -5;
      if (positions[offset + 2] < -5) positions[offset + 2] = 5;
    }
    attribute.needsUpdate = true;
  });

  if (!active || count === 0) return null;

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={snow ? '#d9e5e7' : '#91b4bf'}
          size={snow ? 0.045 : 0.022}
          transparent
          opacity={snow ? 0.74 : 0.58}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export function EnvironmentDirector({ environment, quality, isMobile }: EnvironmentDirectorProps) {
  const compact = quality === 'battery';
  const sunPosition = useMemo(() => {
    const [x, y, z] = environment.sunDirection;
    return new THREE.Vector3(x, y, z).normalize().multiplyScalar(18);
  }, [environment.sunDirection]);
  const fogNear = isMobile ? 6.5 : 8.5;
  const fogFar = (isMobile ? 16 : 21) + environment.visibility * (isMobile ? 8 : 14);
  const daylight = environment.daylight;

  return (
    <>
      <color attach="background" args={[environment.skyColor]} />
      <fog attach="fog" args={[environment.fogColor, fogNear, fogFar]} />
      {!compact && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={6.5 + environment.cloudCover * 8.5}
          rayleigh={1.25 + environment.cloudCover * 1.45}
          mieCoefficient={0.004 + environment.cloudCover * 0.011}
          mieDirectionalG={0.78 + environment.cloudCover * 0.1}
        />
      )}
      {!compact && daylight < 0.28 && (
        <Stars
          radius={48}
          depth={20}
          count={quality === 'high' ? 1500 : 900}
          factor={1.15}
          saturation={0.14}
          fade
          speed={0.035}
        />
      )}
      <hemisphereLight
        args={[
          environment.ambientColor,
          environment.groundColor,
          0.72 + daylight * 1.15 - environment.cloudCover * 0.2,
        ]}
      />
      <directionalLight
        castShadow={!compact && !isMobile && daylight > 0.08}
        position={sunPosition}
        intensity={0.3 + daylight * (3.9 - environment.cloudCover * 1.35)}
        color={environment.sunColor}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {daylight < 0.3 && (
        <directionalLight
          position={[-sunPosition.x, Math.max(5, -sunPosition.y), -sunPosition.z]}
          intensity={(0.3 - daylight) * 1.8}
          color="#8eb2c8"
        />
      )}
      <WeatherParticles environment={environment} quality={quality} isMobile={isMobile} />
      <ExposureController exposure={environment.exposure} />
    </>
  );
}
