import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface MovingShipProps {
  points: THREE.Vector3[];
  color: string;
  speed: number;
  offset: number;
  active: boolean;
  compact?: boolean;
}

const OAR_POSITIONS = [-0.055, -0.02, 0.02, 0.055] as const;
const SHIELD_POSITIONS = [-0.072, -0.024, 0.024, 0.072] as const;

function createSailTexture(color: string, compact: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = compact ? 128 : 256;
  canvas.height = compact ? 96 : 192;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable.');

  context.fillStyle = '#d4c39d';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  const stripeWidth = canvas.width / 7;
  for (let index = 0; index < 7; index += 2) {
    context.fillRect(index * stripeWidth, 0, stripeWidth, canvas.height);
  }
  context.strokeStyle = 'rgba(55, 31, 17, 0.42)';
  context.lineWidth = compact ? 3 : 5;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  context.globalAlpha = 0.14;
  const threadStep = compact ? 6 : 9;
  for (let y = threadStep; y < canvas.height; y += threadStep) {
    context.fillStyle = y % (threadStep * 2) === 0 ? '#ffffff' : '#3d2918';
    context.fillRect(0, y, canvas.width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = !compact;
  texture.minFilter = compact ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function MovingShip({ points, color, speed, offset, active, compact = false }: MovingShipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const progressRef = useRef(offset % 1);
  const position = useRef(new THREE.Vector3());
  const smoothedPosition = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const correctedUp = useRef(new THREE.Vector3());
  const orientationMatrix = useRef(new THREE.Matrix4());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => point.clone()), false, 'centripetal', 0.35),
    [points],
  );
  const sailTexture = useMemo(() => createSailTexture(color, compact), [color, compact]);
  const geometryDetail = compact ? 7 : 12;

  useEffect(() => () => sailTexture.dispose(), [sailTexture]);

  useEffect(() => {
    const initial = curve.getPointAt(progressRef.current, new THREE.Vector3());
    smoothedPosition.current.copy(initial);
    if (groupRef.current) groupRef.current.position.copy(initial);
  }, [curve]);

  useFrame(({ clock }, rawDelta) => {
    const group = groupRef.current;
    const model = modelRef.current;
    if (!group || !model || !active || points.length < 2) return;

    const delta = Math.min(rawDelta, 1 / 24);
    progressRef.current = (progressRef.current + delta * 0.028 * speed) % 1;
    const progress = progressRef.current;

    curve.getPointAt(progress, position.current);
    curve.getTangentAt(progress, forward.current).normalize();
    up.current.copy(position.current).normalize();
    right.current.crossVectors(up.current, forward.current).normalize();
    correctedUp.current.crossVectors(forward.current, right.current).normalize();
    orientationMatrix.current.makeBasis(right.current, correctedUp.current, forward.current);
    targetQuaternion.current.setFromRotationMatrix(orientationMatrix.current);

    const positionDamping = 1 - Math.exp(-delta * 18);
    const rotationDamping = 1 - Math.exp(-delta * 12);
    smoothedPosition.current.lerp(position.current, positionDamping);
    group.position.copy(smoothedPosition.current);
    group.quaternion.slerp(targetQuaternion.current, rotationDamping);

    const fadeIn = THREE.MathUtils.smoothstep(progress, 0, 0.075);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(progress, 0.925, 1);
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
    group.scale.setScalar(0.72 * envelope);

    const phase = clock.elapsedTime * 1.35 + offset * Math.PI * 2;
    model.position.y = Math.sin(phase) * 0.006;
    model.rotation.z = Math.sin(phase * 0.72) * 0.025;
  });

  return (
    <group ref={groupRef} visible={active}>
      <group ref={modelRef}>
        <mesh rotation-x={Math.PI / 2} scale={[1.05, 1, 0.84]}>
          <capsuleGeometry args={[0.037, 0.17, compact ? 4 : 6, geometryDetail]} />
          <meshStandardMaterial color="#4b2718" roughness={0.83} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.022, -0.105]} rotation-x={Math.PI / 2}>
          <coneGeometry args={[0.042, 0.11, geometryDetail]} />
          <meshStandardMaterial color="#3b2015" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.02, 0.11]} rotation-x={-Math.PI / 2}>
          <coneGeometry args={[0.038, 0.1, geometryDetail]} />
          <meshStandardMaterial color="#3b2015" roughness={0.82} />
        </mesh>

        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.006, 0.007, 0.27, compact ? 6 : 8]} />
          <meshStandardMaterial color="#9a7d55" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.004, 0.004, 0.18, compact ? 6 : 8]} />
          <meshStandardMaterial color="#8f7048" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.145, 0]}>
          <planeGeometry args={[0.17, 0.135]} />
          <meshStandardMaterial map={sailTexture} side={THREE.DoubleSide} roughness={0.92} metalness={0} />
        </mesh>

        {OAR_POSITIONS.flatMap((z) =>
          [-1, 1].map((side) => (
            <mesh key={`${z}-${side}`} position={[side * 0.078, 0.005, z]} rotation-z={Math.PI / 2 + side * 0.08}>
              <cylinderGeometry args={[0.0026, 0.0034, 0.15, compact ? 4 : 6]} />
              <meshStandardMaterial color="#9c7d50" roughness={0.94} />
            </mesh>
          )),
        )}

        {SHIELD_POSITIONS.flatMap((z) =>
          [-1, 1].map((side) => (
            <mesh key={`shield-${z}-${side}`} position={[side * 0.043, 0.037, z]} rotation-y={side > 0 ? Math.PI / 2 : -Math.PI / 2}>
              <circleGeometry args={[0.014, compact ? 10 : 14]} />
              <meshStandardMaterial color={side > 0 ? '#8c3a27' : '#b28a43'} roughness={0.76} metalness={0.08} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
