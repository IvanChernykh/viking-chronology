import { useMemo } from 'react';
import { latLonToMap } from '../lib/flatMap';
import type { VikingStop } from '../types';

interface WorldDecorProps {
  timelineYear: number;
  stops: VikingStop[];
  compact: boolean;
}

interface ReliefPoint {
  lat: number;
  lon: number;
  year: number;
  scale: number;
  type: 'mountain' | 'forest';
}

const relief: ReliefPoint[] = [
  { lat: 61.4, lon: 7.4, year: 750, scale: 1.2, type: 'mountain' },
  { lat: 63.1, lon: 10.1, year: 750, scale: 0.92, type: 'mountain' },
  { lat: 58.4, lon: 8.3, year: 750, scale: 0.7, type: 'forest' },
  { lat: 60.2, lon: 15.4, year: 760, scale: 0.82, type: 'forest' },
  { lat: 64.8, lon: -18.2, year: 874, scale: 0.9, type: 'mountain' },
  { lat: 61.0, lon: -44.2, year: 985, scale: 1.05, type: 'mountain' },
  { lat: 46.4, lon: 9.5, year: 845, scale: 0.85, type: 'mountain' },
  { lat: 42.7, lon: -5.2, year: 844, scale: 0.72, type: 'mountain' },
  { lat: 58.4, lon: 31.2, year: 860, scale: 0.65, type: 'forest' },
  { lat: 51.2, lon: 30.4, year: 882, scale: 0.72, type: 'forest' },
];

function Mountain({ point, compact }: { point: ReliefPoint; compact: boolean }) {
  const position = latLonToMap(point.lat, point.lon, 0.04);
  return (
    <group position={position} scale={point.scale * (compact ? 0.74 : 1)}>
      <mesh castShadow={!compact} position={[-0.08, 0.16, 0]} rotation={[0, 0.3, 0]}>
        <coneGeometry args={[0.18, 0.42, compact ? 5 : 7]} />
        <meshStandardMaterial color="#596253" roughness={0.96} flatShading />
      </mesh>
      <mesh castShadow={!compact} position={[0.12, 0.11, 0.05]} rotation={[0, -0.4, 0]}>
        <coneGeometry args={[0.13, 0.3, compact ? 5 : 7]} />
        <meshStandardMaterial color="#454f46" roughness={0.98} flatShading />
      </mesh>
    </group>
  );
}

function ForestPatch({ point, compact }: { point: ReliefPoint; compact: boolean }) {
  const position = latLonToMap(point.lat, point.lon, 0.05);
  const trees = compact ? 3 : 6;
  return (
    <group position={position} scale={point.scale}>
      {Array.from({ length: trees }, (_, index) => {
        const angle = (index / trees) * Math.PI * 2;
        const radius = index % 2 === 0 ? 0.11 : 0.2;
        return (
          <group key={index} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} scale={0.7 + (index % 3) * 0.12}>
            <mesh position={[0, 0.075, 0]}>
              <cylinderGeometry args={[0.012, 0.018, 0.15, 5]} />
              <meshStandardMaterial color="#422c1e" roughness={1} />
            </mesh>
            <mesh castShadow={!compact} position={[0, 0.22, 0]}>
              <coneGeometry args={[0.09, 0.32, compact ? 5 : 7]} />
              <meshStandardMaterial color="#173b32" roughness={1} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Settlement({ stop, compact }: { stop: VikingStop; compact: boolean }) {
  const position = latLonToMap(stop.lat, stop.lon, 0.07);
  const buildingCount = compact ? 1 : stop.kind === 'settlement' || stop.kind === 'trade' ? 3 : 2;
  const color = stop.kind === 'raid' ? '#543126' : stop.kind === 'court' ? '#5b4f36' : '#4a3928';

  return (
    <group position={position} scale={compact ? 0.62 : 0.82}>
      {Array.from({ length: buildingCount }, (_, index) => {
        const x = (index - (buildingCount - 1) / 2) * 0.15;
        const z = index % 2 === 0 ? 0.08 : -0.07;
        return (
          <group key={index} position={[x, 0, z]}>
            <mesh castShadow={!compact} position={[0, 0.07, 0]}>
              <boxGeometry args={[0.12, 0.12, 0.1]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
            <mesh castShadow={!compact} position={[0, 0.17, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.22, 0.12, 0.18]}>
              <coneGeometry args={[0.32, 0.34, 4]} />
              <meshStandardMaterial color="#2d251d" roughness={0.98} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function WorldDecor({ timelineYear, stops, compact }: WorldDecorProps) {
  const activeRelief = useMemo(() => relief.filter((point) => point.year <= timelineYear), [timelineYear]);
  const activeStops = useMemo(() => stops.filter((stop) => stop.year <= timelineYear), [stops, timelineYear]);

  return (
    <group>
      {activeRelief.map((point, index) => point.type === 'mountain'
        ? <Mountain key={`m-${index}`} point={point} compact={compact} />
        : <ForestPatch key={`f-${index}`} point={point} compact={compact} />)}
      {activeStops.map((stop) => <Settlement key={stop.id} stop={stop} compact={compact} />)}
    </group>
  );
}
