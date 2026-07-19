import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface LongshipModelProps {
  compact?: boolean;
  accent?: string;
  windStrength?: number;
  seaState?: number;
}

function createHullGeometry(compact: boolean): THREE.BufferGeometry {
  const sections = compact ? 10 : 18;
  const crossSections = compact ? 7 : 11;
  const length = 3.15;
  const beam = 0.46;
  const depth = 0.54;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let section = 0; section < sections; section += 1) {
    const t = section / (sections - 1);
    const x = (t - 0.5) * length;
    const taper = 0.045 + Math.pow(Math.sin(t * Math.PI), 0.62) * 0.955;
    const endLift = Math.pow(Math.abs(t - 0.5) * 2, 3.4) * 0.34;

    for (let cross = 0; cross < crossSections; cross += 1) {
      const u = cross / (crossSections - 1);
      const angle = u * Math.PI;
      const z = Math.cos(angle) * beam * taper;
      const keelDepth = Math.sin(angle) * depth * (0.74 + taper * 0.26);
      const sheer = Math.pow(Math.abs(u - 0.5) * 2, 2) * 0.12;
      const y = 0.31 + endLift + sheer - keelDepth;
      positions.push(x, y, z);
    }
  }

  for (let section = 0; section < sections - 1; section += 1) {
    for (let cross = 0; cross < crossSections - 1; cross += 1) {
      const a = section * crossSections + cross;
      const b = a + crossSections;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function LongshipModel({
  compact = false,
  accent = '#d4b36c',
  windStrength = 0.45,
  seaState = 0.35,
}: LongshipModelProps) {
  const sailRef = useRef<THREE.Mesh>(null);
  const sailMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const oarsRef = useRef<THREE.Group>(null);
  const phase = 1.731;
  const hullGeometry = useMemo(() => createHullGeometry(compact), [compact]);
  const sailUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindStrength: { value: windStrength },
      uAccent: { value: new THREE.Color(accent) },
      uCloth: { value: new THREE.Color('#d7c28f') },
    }),
    [accent, windStrength],
  );

  useEffect(() => () => hullGeometry.dispose(), [hullGeometry]);
  useEffect(() => {
    if (!sailMaterialRef.current) return;
    sailMaterialRef.current.uniforms.uWindStrength.value = windStrength;
    sailMaterialRef.current.uniforms.uAccent.value.set(accent);
  }, [accent, windStrength]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime + phase;
    if (sailRef.current) sailRef.current.rotation.y = Math.sin(time * 0.78) * (0.018 + windStrength * 0.035);
    if (sailMaterialRef.current) sailMaterialRef.current.uniforms.uTime.value = time;
    if (oarsRef.current) oarsRef.current.rotation.x = Math.sin(time * 1.9) * (0.035 + seaState * 0.085);
  });

  const shields = compact ? 5 : 9;
  const oars = compact ? 4 : 8;

  return (
    <group scale={compact ? 0.72 : 1}>
      <mesh castShadow={!compact} geometry={hullGeometry}>
        <meshStandardMaterial color="#3b2115" roughness={0.74} metalness={0.025} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 0.33, 0]}>
        <boxGeometry args={[2.34, 0.065, 0.56]} />
        <meshStandardMaterial color="#765337" roughness={0.9} />
      </mesh>
      {[-0.34, 0, 0.34].map((offset) => (
        <mesh key={offset} castShadow={!compact} position={[0, 0.255, offset]}>
          <boxGeometry args={[2.58, 0.055, 0.045]} />
          <meshStandardMaterial color={offset === 0 ? '#4a2e1f' : '#604026'} roughness={0.86} />
        </mesh>
      ))}
      {[-1.02, -0.58, -0.14, 0.3, 0.74, 1.18].slice(0, compact ? 4 : 6).map((x) => (
        <mesh key={x} position={[x, 0.35, 0]}>
          <boxGeometry args={[0.035, 0.075, 0.62]} />
          <meshStandardMaterial color="#3c271a" roughness={0.94} />
        </mesh>
      ))}

      {Array.from({ length: shields }, (_, index) => {
        const x = -1.05 + index * (2.1 / Math.max(1, shields - 1));
        const color = index % 3 === 0 ? '#a84e38' : index % 3 === 1 ? '#b58a49' : '#547067';
        return [-1, 1].map((side) => (
          <group key={`${index}-${side}`} position={[x, 0.38, side * 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow={!compact}>
              <cylinderGeometry args={[0.17, 0.17, 0.035, compact ? 10 : 18]} />
              <meshStandardMaterial color={color} roughness={0.78} metalness={0.08} />
            </mesh>
            <mesh position={[0, 0.022, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.05, 10]} />
              <meshStandardMaterial color="#76736c" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        ));
      })}

      <mesh castShadow={!compact} position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.035, 0.047, 1.62, 10]} />
        <meshStandardMaterial color="#4d321f" roughness={0.8} />
      </mesh>
      <mesh castShadow={!compact} position={[0, 1.39, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.024, 1.46, 8]} />
        <meshStandardMaterial color="#5b3a22" roughness={0.84} />
      </mesh>
      <mesh ref={sailRef} castShadow={!compact} position={[0, 1.05, 0.02]}>
        <planeGeometry args={[1.34, 1.08, compact ? 5 : 14, compact ? 4 : 10]} />
        <shaderMaterial
          ref={sailMaterialRef}
          uniforms={sailUniforms}
          side={THREE.DoubleSide}
          vertexShader={`
            uniform float uTime;
            uniform float uWindStrength;
            varying vec2 vUv;
            varying float vLight;
            void main() {
              vUv = uv;
              vec3 p = position;
              float billow = sin(uv.x * 3.1415926) * sin(uv.y * 3.1415926);
              float flutter = sin(uv.y * 18.0 + uTime * (2.2 + uWindStrength * 2.8) + uv.x * 4.0);
              p.z += billow * (0.055 + uWindStrength * 0.12) + flutter * 0.008 * uWindStrength * uv.x;
              p.x += sin(uv.y * 5.0 + uTime * 0.75) * 0.008 * uWindStrength;
              vLight = 0.78 + billow * 0.22;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uAccent;
            uniform vec3 uCloth;
            varying vec2 vUv;
            varying float vLight;
            void main() {
              float stripe = step(0.5, fract(vUv.x * 6.0));
              vec3 color = mix(uCloth, uAccent, stripe * 0.72);
              float seam = smoothstep(0.47, 0.5, abs(fract(vUv.x * 6.0) - 0.5));
              color *= vLight - seam * 0.07;
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      <group ref={oarsRef} position={[0, 0.32, 0]}>
        {Array.from({ length: oars }, (_, index) => {
          const x = -0.96 + index * (1.92 / Math.max(1, oars - 1));
          return [-1, 1].map((side) => (
            <mesh key={`${index}-${side}`} position={[x, -0.02, side * 0.68]} rotation={[0, 0, side * 0.19]}>
              <boxGeometry args={[0.032, 0.032, 1.02]} />
              <meshStandardMaterial color="#a27b4a" roughness={0.9} />
            </mesh>
          ));
        })}
      </group>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.47, 0.54, 0]} rotation={[0, 0, side * -0.2]}>
          <mesh castShadow={!compact}>
            <coneGeometry args={[0.13, 0.7, 7]} />
            <meshStandardMaterial color="#56321e" roughness={0.75} />
          </mesh>
          <mesh position={[side * 0.03, 0.3, 0]}>
            <sphereGeometry args={[0.085, 10, 8]} />
            <meshStandardMaterial color="#8b5d32" roughness={0.8} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0.01, 0]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[-0.58, -0.02, side * 0.32]} rotation={[-Math.PI / 2, 0, side * 0.12]}>
            <planeGeometry args={[1.9, 0.18, 1, 1]} />
            <meshBasicMaterial color="#b9d6d8" transparent opacity={0.055 + seaState * 0.08} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
