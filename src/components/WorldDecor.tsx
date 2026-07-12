import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createLandMask, latLonToMap, MAP_BOUNDS, sampleLandMask, terrainHeight } from '../lib/flatMap';
import type { VikingStop } from '../types';

interface WorldDecorProps { timelineYear: number; stops: VikingStop[]; compact: boolean; }
interface ScatterPoint { position: THREE.Vector3; scale: number; rotation: number; year: number; }

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

function makeScatter(count: number, type: 'tree' | 'rock'): ScatterPoint[] {
  const random = seeded(type === 'tree' ? 874 : 1021);
  const mask = createLandMask(448);
  const result: ScatterPoint[] = [];
  let attempts = 0;
  while (result.length < count && attempts < count * 36) {
    attempts += 1;
    const u = random(); const v = random(); const land = sampleLandMask(mask, u, v);
    if (land < (type === 'tree' ? 0.62 : 0.5)) continue;
    const lat = THREE.MathUtils.lerp(MAP_BOUNDS.south, MAP_BOUNDS.north, v);
    const lon = THREE.MathUtils.lerp(MAP_BOUNDS.west, MAP_BOUNDS.east, u);
    if (lat < 42 && type === 'tree') continue;
    const point = latLonToMap(lat, lon, terrainHeight(lat, lon, land));
    result.push({ position: point, scale: type === 'tree' ? 0.38 + random() * 0.62 : 0.35 + random() * 0.8, rotation: random() * Math.PI * 2, year: 750 + Math.floor(random() * 240) });
  }
  return result;
}

function InstancedForest({ timelineYear, compact }: { timelineYear: number; compact: boolean }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null); const foliageRef = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => makeScatter(compact ? 70 : 210, 'tree'), [compact]);
  const visible = useMemo(() => points.filter((point) => point.year <= timelineYear + 70), [points, timelineYear]);
  useEffect(() => { const dummy = new THREE.Object3D(); visible.forEach((point, index) => { dummy.position.copy(point.position).add(new THREE.Vector3(0, 0.085 * point.scale, 0)); dummy.rotation.set(0, point.rotation, 0); dummy.scale.setScalar(point.scale); dummy.updateMatrix(); trunkRef.current?.setMatrixAt(index, dummy.matrix); dummy.position.copy(point.position).add(new THREE.Vector3(0, 0.28 * point.scale, 0)); dummy.scale.setScalar(point.scale); dummy.updateMatrix(); foliageRef.current?.setMatrixAt(index, dummy.matrix); }); if (trunkRef.current) { trunkRef.current.count = visible.length; trunkRef.current.instanceMatrix.needsUpdate = true; } if (foliageRef.current) { foliageRef.current.count = visible.length; foliageRef.current.instanceMatrix.needsUpdate = true; } }, [visible]);
  return <group><instancedMesh ref={trunkRef} args={[undefined, undefined, points.length]} castShadow={!compact} receiveShadow><cylinderGeometry args={[0.016, 0.026, 0.18, compact ? 5 : 7]} /><meshStandardMaterial color="#3b291d" roughness={1} /></instancedMesh><instancedMesh ref={foliageRef} args={[undefined, undefined, points.length]} castShadow={!compact}><coneGeometry args={[0.105, 0.38, compact ? 6 : 9]} /><meshStandardMaterial color="#173b31" roughness={1} flatShading /></instancedMesh></group>;
}

function InstancedRocks({ timelineYear, compact }: { timelineYear: number; compact: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null); const points = useMemo(() => makeScatter(compact ? 32 : 100, 'rock'), [compact]); const visible = useMemo(() => points.filter((point) => point.year <= timelineYear + 110), [points, timelineYear]);
  useEffect(() => { const dummy = new THREE.Object3D(); visible.forEach((point, index) => { dummy.position.copy(point.position).add(new THREE.Vector3(0, 0.04 * point.scale, 0)); dummy.rotation.set(point.rotation * 0.13, point.rotation, point.rotation * 0.08); dummy.scale.set(point.scale * 0.13, point.scale * 0.08, point.scale * 0.17); dummy.updateMatrix(); ref.current?.setMatrixAt(index, dummy.matrix); }); if (ref.current) { ref.current.count = visible.length; ref.current.instanceMatrix.needsUpdate = true; } }, [visible]);
  return <instancedMesh ref={ref} args={[undefined, undefined, points.length]} castShadow={!compact} receiveShadow><dodecahedronGeometry args={[1, compact ? 0 : 1]} /><meshStandardMaterial color="#58605a" roughness={0.98} flatShading /></instancedMesh>;
}

function Settlement({ stop, compact }: { stop: VikingStop; compact: boolean }) {
  const position = latLonToMap(stop.lat, stop.lon, 0.11); const buildingCount = compact ? 1 : stop.kind === 'settlement' || stop.kind === 'trade' ? 3 : 2; const body = stop.kind === 'raid' ? '#543126' : stop.kind === 'court' ? '#5b4f36' : '#4a3928';
  return <group position={position} scale={compact ? 0.58 : 0.72}><mesh position={[0, -0.012, 0]} receiveShadow><cylinderGeometry args={[0.33, 0.38, 0.025, 18]} /><meshStandardMaterial color="#3c473a" roughness={1} /></mesh>{Array.from({ length: buildingCount }, (_, index) => { const angle = (index / buildingCount) * Math.PI * 2 + 0.35; return <group key={index} position={[Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.13]} rotation={[0, -angle, 0]}><mesh castShadow={!compact} position={[0, 0.065, 0]}><boxGeometry args={[0.15, 0.13, 0.11]} /><meshStandardMaterial color={body} roughness={0.96} /></mesh><mesh castShadow={!compact} position={[0, 0.16, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.25, 0.13, 0.2]}><coneGeometry args={[0.34, 0.34, 4]} /><meshStandardMaterial color="#2d251d" roughness={1} /></mesh></group>; })}{!compact && <mesh position={[0, 0.015, 0]}><torusGeometry args={[0.25, 0.008, 5, 26]} /><meshStandardMaterial color="#6e5940" roughness={0.96} /></mesh>}</group>;
}

export function WorldDecor({ timelineYear, stops, compact }: WorldDecorProps) {
  const activeStops = useMemo(() => stops.filter((stop) => stop.year <= timelineYear), [stops, timelineYear]);
  return <group><InstancedForest timelineYear={timelineYear} compact={compact} /><InstancedRocks timelineYear={timelineYear} compact={compact} />{activeStops.map((stop) => <Settlement key={stop.id} stop={stop} compact={compact} />)}</group>;
}
