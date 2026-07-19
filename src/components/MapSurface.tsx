import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { EnvironmentSnapshot } from '../game/environment/environmentModel';
import { createFlatMapTexture, createLandMaskTexture, MAP_DEPTH, MAP_WIDTH } from '../lib/flatMap';
import type { RenderQuality } from '../types';

interface MapSurfaceProps {
  quality: Exclude<RenderQuality, 'auto'>;
  environment: EnvironmentSnapshot;
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

function Ocean({
  compact,
  quality,
  mask,
  environment,
}: {
  compact: boolean;
  quality: Exclude<RenderQuality, 'auto'>;
  mask: THREE.Texture;
  environment: EnvironmentSnapshot;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLandMask: { value: mask },
      uSeaState: { value: 0.3 },
      uWind: { value: new THREE.Vector2(1, 0) },
      uSunDirection: { value: new THREE.Vector3(0.4, 0.8, 0.2) },
      uSunColor: { value: new THREE.Color('#fff0c8') },
      uDeepColor: { value: new THREE.Color('#061c25') },
      uShallowColor: { value: new THREE.Color('#1d5860') },
      uCloudCover: { value: 0.4 },
      uPrecipitation: { value: 0 },
      uCompact: { value: compact ? 1 : 0 },
    }),
    [compact, mask],
  );

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uSeaState.value = environment.seaState;
    material.uniforms.uWind.value.set(environment.windDirection[0], environment.windDirection[1]);
    material.uniforms.uSunDirection.value
      .set(environment.sunDirection[0], environment.sunDirection[1], environment.sunDirection[2])
      .normalize();
    material.uniforms.uSunColor.value.set(environment.sunColor);
    material.uniforms.uCloudCover.value = environment.cloudCover;
    material.uniforms.uPrecipitation.value = environment.precipitation;
  }, [environment]);

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  const segments = quality === 'high' ? [180, 96] : compact ? [40, 24] : [112, 60];

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
      <planeGeometry args={[MAP_WIDTH + 3.2, MAP_DEPTH + 3.2, segments[0], segments[1]]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uSeaState;
          uniform vec2 uWind;
          uniform float uCompact;
          varying vec2 vUv;
          varying float vWave;
          varying vec3 vWorldPosition;
          ${noise}

          float gerstner(vec2 direction, float steepness, float wavelength, inout vec3 p) {
            float k = 6.2831853 / wavelength;
            float speed = sqrt(9.8 / k);
            float phase = k * (dot(direction, p.xy) - speed * uTime);
            float amplitude = steepness / k;
            p.x += direction.x * amplitude * cos(phase);
            p.y += direction.y * amplitude * cos(phase);
            return amplitude * sin(phase);
          }

          void main() {
            vUv = uv;
            vec3 p = position;
            vec2 wind = normalize(uWind + vec2(0.0001));
            float energy = mix(0.035, 0.17, uSeaState) * (1.0 - uCompact * 0.42);
            float wave = 0.0;
            wave += gerstner(wind, 0.12 + uSeaState * 0.13, 2.8, p);
            wave += gerstner(normalize(vec2(-wind.y, wind.x) * 0.7 + wind), 0.075 + uSeaState * 0.08, 1.45, p);
            wave += gerstner(normalize(vec2(wind.x * 0.35 - wind.y, wind.y * 0.35 + wind.x)), 0.038 + uSeaState * 0.05, 0.72, p);
            float detail = (fbm(p.xy * 2.4 + uTime * wind * 0.08) - 0.5) * energy * 0.45;
            p.z += (wave + detail) * energy * 4.8;
            vWave = p.z;
            vec4 worldPosition = modelMatrix * vec4(p, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform sampler2D uLandMask;
          uniform vec3 uSunDirection;
          uniform vec3 uSunColor;
          uniform vec3 uDeepColor;
          uniform vec3 uShallowColor;
          uniform float uCloudCover;
          uniform float uPrecipitation;
          varying vec2 vUv;
          varying float vWave;
          varying vec3 vWorldPosition;
          ${noise}

          void main() {
            vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
            if (!gl_FrontFacing) normal *= -1.0;
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            vec3 lightDirection = normalize(uSunDirection);
            float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.2);
            float diffuse = max(dot(normal, lightDirection), 0.0);
            float specular = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), 78.0);
            float grain = fbm(vUv * 24.0 + vWave * 9.0);
            float depthGradient = smoothstep(0.0, 1.0, vUv.y) * 0.32 + grain * 0.08;
            vec3 color = mix(uDeepColor, uShallowColor, depthGradient + fresnel * 0.36);
            color += uSunColor * diffuse * 0.08 * (1.0 - uCloudCover * 0.65);
            color += uSunColor * specular * (0.55 - uCloudCover * 0.34);
            color = mix(color, color * 0.72, uPrecipitation * 0.38);

            float land = texture2D(uLandMask, vUv).r;
            float shore = 1.0 - smoothstep(0.035, 0.22, abs(land - 0.18));
            float crest = smoothstep(0.035, 0.12, vWave + grain * 0.03);
            float foam = clamp(shore * (0.42 + grain * 0.58) + crest * (0.3 + uPrecipitation * 0.22), 0.0, 0.78);
            color = mix(color, vec3(0.66, 0.76, 0.74), foam);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function Terrain({
  quality,
  map,
  mask,
  environment,
}: {
  quality: Exclude<RenderQuality, 'auto'>;
  map: THREE.Texture;
  mask: THREE.Texture;
  environment: EnvironmentSnapshot;
}) {
  const compact = quality === 'battery';
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uMask: { value: mask },
      uHeight: { value: compact ? 0.28 : quality === 'high' ? 0.64 : 0.48 },
      uWetness: { value: 0 },
      uSnowCoverage: { value: 0 },
      uCloudCover: { value: 0.4 },
      uSunDirection: { value: new THREE.Vector3(0.4, 0.8, 0.2) },
      uSeasonTint: { value: new THREE.Color('#ffffff') },
    }),
    [compact, map, mask, quality],
  );

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uWetness.value = environment.wetness;
    material.uniforms.uSnowCoverage.value = environment.snowCoverage;
    material.uniforms.uCloudCover.value = environment.cloudCover;
    material.uniforms.uSunDirection.value
      .set(environment.sunDirection[0], environment.sunDirection[1], environment.sunDirection[2])
      .normalize();
    const seasonTint = environment.season === 'summer'
      ? '#eef0d6'
      : environment.season === 'autumn'
        ? '#d9b88a'
        : environment.season === 'winter'
          ? '#c9d6d7'
          : '#dce8c6';
    material.uniforms.uSeasonTint.value.set(seasonTint);
  }, [environment]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow castShadow={!compact}>
      <planeGeometry args={[MAP_WIDTH, MAP_DEPTH, compact ? 120 : 240, compact ? 62 : 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite
        vertexShader={`
          uniform sampler2D uMask;
          uniform float uHeight;
          varying vec2 vUv;
          varying float vHeight;
          varying float vLand;
          varying vec3 vWorldPosition;
          ${noise}

          void main() {
            vUv = uv;
            vec3 p = position;
            float land = texture2D(uMask, uv).r;
            float coast = smoothstep(0.08, 0.72, land);
            float broad = fbm(uv * vec2(8.0, 5.0));
            float ridges = pow(fbm(uv * vec2(23.0, 14.0) + 9.0), 2.2);
            float microRelief = fbm(uv * vec2(64.0, 41.0) + 23.0);
            float north = smoothstep(0.45, 0.95, uv.y);
            float height = coast * (0.035 + broad * 0.17 + ridges * uHeight * (0.34 + north * 0.82) + microRelief * 0.045);
            p.z += height;
            vHeight = height;
            vLand = land;
            vec4 worldPosition = modelMatrix * vec4(p, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform sampler2D uMap;
          uniform float uWetness;
          uniform float uSnowCoverage;
          uniform float uCloudCover;
          uniform vec3 uSunDirection;
          uniform vec3 uSeasonTint;
          varying vec2 vUv;
          varying float vHeight;
          varying float vLand;
          varying vec3 vWorldPosition;
          ${noise}

          void main() {
            if (vLand < 0.12) discard;
            vec3 normal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
            if (!gl_FrontFacing) normal *= -1.0;
            float light = max(dot(normal, normalize(uSunDirection)), 0.0);
            vec3 base = texture2D(uMap, vUv).rgb * uSeasonTint;
            float detail = fbm(vUv * vec2(92.0, 56.0));
            float elevation = smoothstep(0.08, 0.56, vHeight);
            float rockMask = smoothstep(0.28, 0.74, elevation + (1.0 - normal.y) * 0.55);
            float snowMask = smoothstep(0.18, 0.64, vHeight + uSnowCoverage * 0.46) * smoothstep(0.42, 0.98, vUv.y);
            snowMask = clamp(snowMask * (0.25 + uSnowCoverage), 0.0, 0.92);
            vec3 rock = vec3(0.24, 0.255, 0.24) * (0.82 + detail * 0.24);
            vec3 snowColor = vec3(0.72, 0.78, 0.78);
            vec3 color = mix(base, rock, rockMask * 0.72);
            color = mix(color, snowColor, snowMask);
            color *= mix(1.0, 0.63 + light * 0.22, uCloudCover * 0.65);
            color = mix(color, color * vec3(0.52, 0.62, 0.59), uWetness * (0.34 + rockMask * 0.2));
            float coast = smoothstep(0.12, 0.28, vLand) * (1.0 - smoothstep(0.28, 0.5, vLand));
            color += coast * vec3(0.1, 0.085, 0.05) * (1.0 - uWetness * 0.35);
            gl_FragColor = vec4(color, smoothstep(0.1, 0.32, vLand));
          }
        `}
      />
    </mesh>
  );
}

export function MapSurface({ quality, environment }: MapSurfaceProps) {
  const compact = quality === 'battery';
  const map = useMemo(() => createFlatMapTexture(quality === 'high' ? 2048 : compact ? 1024 : 1536), [compact, quality]);
  const mask = useMemo(() => createLandMaskTexture(compact ? 512 : 1024), [compact]);

  useEffect(
    () => () => {
      map.dispose();
      mask.dispose();
    },
    [map, mask],
  );

  return (
    <group>
      <mesh position={[0, -0.42, 0]} receiveShadow>
        <boxGeometry args={[MAP_WIDTH + 0.3, 0.72, MAP_DEPTH + 0.3]} />
        <meshStandardMaterial color="#0b1211" roughness={0.98} metalness={0.02} />
      </mesh>
      <Ocean compact={compact} quality={quality} mask={mask} environment={environment} />
      <Terrain quality={quality} map={map} mask={mask} environment={environment} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[MAP_WIDTH + 0.05, MAP_DEPTH + 0.05]} />
        <meshBasicMaterial color="#d5be83" transparent opacity={0.018} depthWrite={false} />
      </mesh>
    </group>
  );
}
