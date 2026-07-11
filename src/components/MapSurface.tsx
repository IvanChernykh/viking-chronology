import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createFlatMapTexture, MAP_DEPTH, MAP_WIDTH } from '../lib/flatMap';
import type { RenderQuality } from '../types';

interface MapSurfaceProps {
  quality: Exclude<RenderQuality, 'auto'>;
}

function WaterPlane({ compact }: { compact: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCompact: { value: compact ? 1 : 0 },
    }),
    [compact],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]} receiveShadow>
      <planeGeometry args={[MAP_WIDTH + 1.4, MAP_DEPTH + 1.4, compact ? 1 : 80, compact ? 1 : 42]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uCompact;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float wave = sin((p.x + uTime * 0.52) * 2.3) * 0.012;
            wave += cos((p.y - uTime * 0.33) * 3.1) * 0.009;
            p.z += wave * (1.0 - uCompact);
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying float vWave;
          void main() {
            float edge = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
            vec3 deep = vec3(0.025, 0.12, 0.14);
            vec3 shallow = vec3(0.08, 0.24, 0.25);
            vec3 color = mix(deep, shallow, vUv.y * 0.42 + vWave * 6.0);
            color += edge * 0.018;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function MapSurface({ quality }: MapSurfaceProps) {
  const compact = quality === 'battery';
  const texture = useMemo(() => createFlatMapTexture(quality === 'high' ? 2048 : compact ? 1024 : 1536), [compact, quality]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group>
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[MAP_WIDTH + 0.28, 0.34, MAP_DEPTH + 0.28]} />
        <meshStandardMaterial color="#121513" roughness={0.96} metalness={0.04} />
      </mesh>
      <WaterPlane compact={compact} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[MAP_WIDTH, MAP_DEPTH]} />
        <meshStandardMaterial
          map={texture}
          color="#f5ead0"
          roughness={0.88}
          metalness={0.02}
          emissive="#081314"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]}>
        <ringGeometry args={[Math.min(MAP_WIDTH, MAP_DEPTH) * 0.52, Math.min(MAP_WIDTH, MAP_DEPTH) * 0.525, 96]} />
        <meshBasicMaterial color="#b69559" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}
