import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { latLonToVector3 } from '../lib/geo';
import { kindMeta } from '../lib/kindMeta';
import type { VikingStop } from '../types';

interface StopMarkerProps {
  stop: VikingStop;
  routeColor: string;
  active: boolean;
  selected: boolean;
  dimmed: boolean;
  compact: boolean;
  animate: boolean;
  onSelect: (stop: VikingStop) => void;
}

interface PointerOrigin {
  pointerId: number;
  x: number;
  y: number;
}

const FORWARD = new THREE.Vector3(0, 0, 1);

function stopNativePointer(event: ThreeEvent<PointerEvent>) {
  event.stopPropagation();
  event.nativeEvent.stopPropagation();
  event.nativeEvent.stopImmediatePropagation?.();
}

export function StopMarker({
  stop,
  routeColor,
  active,
  selected,
  dimmed,
  compact,
  animate,
  onSelect,
}: StopMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Group>(null);
  const pointerOrigin = useRef<PointerOrigin | null>(null);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const position = useMemo(() => latLonToVector3(stop.lat, stop.lon, 2.285), [stop.lat, stop.lon]);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(FORWARD, position.clone().normalize()),
    [position],
  );

  useEffect(
    () => () => {
      document.body.style.cursor = 'default';
    },
    [],
  );

  useFrame(({ clock }) => {
    if (!pulseRef.current || !markerRef.current) return;
    const scale = selected ? 1.34 : hovered ? 1.18 : 1;
    targetScale.current.setScalar(scale);
    markerRef.current.scale.lerp(targetScale.current, 0.2);

    if (!animate && !selected) {
      pulseRef.current.visible = false;
      return;
    }

    pulseRef.current.visible = active;
    const wave = 1 + ((clock.elapsedTime * 0.36 + stop.year * 0.003) % 1) * 1.55;
    pulseRef.current.scale.setScalar(wave);
    const material = pulseRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = active ? Math.max(0, 0.3 - (wave - 1) * 0.17) : 0;
  });

  const activate = () => {
    onSelect(stop);
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    stopNativePointer(event);
    pointerOrigin.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    const target = event.nativeEvent.target;
    if (target instanceof Element && 'setPointerCapture' in target) {
      target.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    stopNativePointer(event);
    const origin = pointerOrigin.current;
    pointerOrigin.current = null;
    const target = event.nativeEvent.target;
    if (target instanceof Element && 'releasePointerCapture' in target) {
      target.releasePointerCapture(event.pointerId);
    }

    if (!origin || origin.pointerId !== event.pointerId) return;
    const movement = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    const tapTolerance = compact ? 22 : 10;
    if (movement <= tapTolerance) activate();
  };

  const handlePointerCancel = (event: ThreeEvent<PointerEvent>) => {
    stopNativePointer(event);
    pointerOrigin.current = null;
    const target = event.nativeEvent.target;
    if (target instanceof Element && 'releasePointerCapture' in target) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  const showLabel = selected || (!compact && hovered);
  const hitRadius = compact ? 0.19 : 0.14;

  return (
    <group position={position} quaternion={quaternion}>
      <group
        ref={markerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          pointerOrigin.current = null;
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {/* Large invisible raycast target: deliberately larger than the visible marker. */}
        <mesh position={[0, 0, 0.025]}>
          <sphereGeometry args={[hitRadius, compact ? 12 : 16, compact ? 8 : 12]} />
          <meshBasicMaterial
            transparent
            opacity={0.001}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>

        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry
            args={[
              selected ? 0.074 : hovered ? 0.064 : 0.056,
              selected ? 0.074 : hovered ? 0.064 : 0.056,
              0.026,
              compact ? 14 : 20,
            ]}
          />
          <meshStandardMaterial
            color={active ? routeColor : '#514b40'}
            emissive={active ? routeColor : '#2e2a24'}
            emissiveIntensity={selected ? 1.05 : hovered ? 0.78 : 0.38}
            roughness={0.55}
            metalness={0.34}
            transparent
            opacity={dimmed ? 0.34 : active ? 1 : 0.52}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.029, 0.039, compact ? 14 : 20]} />
          <meshBasicMaterial color="#f1d89c" transparent opacity={active ? 0.82 : 0.3} depthWrite={false} />
        </mesh>
        <mesh ref={pulseRef}>
          <ringGeometry args={[0.068, 0.081, compact ? 20 : 30]} />
          <meshBasicMaterial color={routeColor} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {showLabel && (
        <Html center distanceFactor={compact ? 8.4 : 7.2} zIndexRange={[50, 0]}>
          <button
            type="button"
            className={`map-label ${selected ? 'map-label--selected' : ''}`}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              activate();
            }}
            aria-label={`Открыть историческую карточку: ${stop.name}`}
          >
            <span className="map-label__symbol">{kindMeta[stop.kind].symbol}</span>
            <span>
              <strong>{stop.name}</strong>
              <small>{stop.yearLabel}</small>
            </span>
          </button>
        </Html>
      )}
    </group>
  );
}
