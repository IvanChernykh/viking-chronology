import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createFlatMapTexture, createLandMaskTexture, MAP_DEPTH, MAP_WIDTH } from '../lib/flatMap';
import type { RenderQuality } from '../types';

interface MapSurfaceProps {
  quality: Exclude<RenderQuality, 'auto'>;
}

const noise = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + 7.1;
    amplitude *= 0.5;
  }
  return value;
}
`;

function Ocean({ compact }: { compact: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uCompact: { value: compact ? 1 : 0 } }), [compact]);

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]} receiveShadow>
      <planeGeometry args={[MAP_WIDTH + 2.6, MAP_DEPTH + 2.6, compact ? 28 : 128, compact ? 18 : 72]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uCompact;
          varying vec2 vUv;
          varying float vWave;
          ${noise}
          void main() {
            vUv = uv;
            vec3 p = position;
            float large = sin(p.x * 0.65 + uTime * 0.38) * 0.035;
            float crossWave = cos(p.y * 1.2 - uTime * 0.31) * 0.022;
            float detail = (fbm(p.xy * 1.6 + uTime * 0.07) - 0.5) * 0.045;
            float wave = (large + crossWave + detail) * (1.0 - uCompact * 0.55);
            p.z += wave;
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          ${noise}
          void main() {
            float grain = fbm(vUv * 18.0 + uTime * 0.025);
            float horizon = smoothstep(0.0, 1.0, vUv.y);
            vec3 deep = vec3(0.012, 0.075, 0.095);
            vec3 mid = vec3(0.025, 0.16, 0.18);
            vec3 color = mix(deep, mid, horizon * 0.62 + grain * 0.12);
            float crest = smoothstep(0.028, 0.07, vWave);
            color += crest * vec3(0.18, 0.28, 0.27);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function Terrain({ quality }: { quality: Exclude<RenderQuality, 'auto'> }) {
  const compact = quality === 'battery';
  const map = useMemo(() => createFlatMapTexture(quality === 'high' ? 2048 : compact ? 1024 : 1536), [compact, quality]);
  const mask = useMemo(() => createLandMaskTexture(compact ? 512 : 1024), [compact]);
  const uniforms = useMemo(() => ({
    uMap: { value: map },
    uMask: { value: mask },
    uHeight: { value: compact ? 0.28 : quality === 'high' ? 0.62 : 0.46 },
  }), [compact, map, mask, quality]);

  useEffect(() => () => {
    map.dispose();
    mask.dispose();
  }, [map, mask]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow castShadow={!compact}>
      <planeGeometry args={[MAP_WIDTH, MAP_DEPTH, compact ? 120 : 220, compact ? 62 : 118]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite
        vertexShader={`
          uniform sampler2D uMask;
          uniform float uHeight;
          varying vec2 vUv;
          varying float vHeight;
          varying float vLand;
          ${noise}
          void main() {
            vUv = uv;
            vec3 p = position;
            float land = texture2D(uMask, uv).r;
            float coast = smoothstep(0.08, 0.72, land);
            float broad = fbm(uv * vec2(8.0, 5.0));
            float ridges = pow(fbm(uv * vec2(23.0, 14.0) + 9.0), 2.2);
            float north = smoothstep(0.45, 0.95, uv.y);
            float height = coast * (0.04 + broad * 0.18 + ridges * uHeight * (0.35 + north * 0.8));
            p.z += height;
            vHeight = height;
            vLand = land;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uMap;
          varying vec2 vUv;
          varying float vHeight;
          varying float vLand;
          void main() {
            if (vLand < 0.12) discard;
            vec3 base = texture2D(uMap, vUv).rgb;
            float elevation = smoothstep(0.08, 0.56, vHeight);
            float snow = smoothstep(0.36, 0.72, vHeight) * smoothstep(0.5, 0.95, vUv.y);
            vec3 rock = vec3(0.25, 0.26, 0.23);
            vec3 snowColor = vec3(0.72, 0.76, 0.72);
            vec3 color = mix(base, rock, elevation * 0.6);
            color = mix(color, snowColor, snow * 0.72);
            float coast = smoothstep(0.12, 0.28, vLand) * (1.0 - smoothstep(0.28, 0.5, vLand));
            color += coast * vec3(0.12, 0.1, 0.055);
            gl_FragColor = vec4(color, smoothstep(0.1, 0.32, vLand));
          }
        `}
      />
    </mesh>
  );
}

export function MapSurface({ quality }: MapSurfaceProps) {
  return (
    <group>
      <mesh position={[0, -0.42, 0]} receiveShadow>
        <boxGeometry args={[MAP_WIDTH + 0.3, 0.72, MAP_DEPTH + 0.3]} />
        <meshStandardMaterial color="#0b1211" roughness={0.98} metalness={0.02} />
      </mesh>
      <Ocean compact={quality === 'battery'} />
      <Terrain quality={quality} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[MAP_WIDTH + 0.05, MAP_DEPTH + 0.05]} />
        <meshBasicMaterial color="#d5be83" transparent opacity={0.025} depthWrite={false} />
      </mesh>
    </group>
  );
}
