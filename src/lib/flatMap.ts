import * as THREE from 'three';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties, Position } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';

interface WorldAtlasObjects extends Objects<GeoJsonProperties> {
  countries: Objects<GeoJsonProperties>[string];
}

const typedAtlas = worldAtlas as unknown as Topology<WorldAtlasObjects>;
type CountryFeature = Feature<Geometry, GeoJsonProperties>;

export const MAP_BOUNDS = { west: -68, east: 50, south: 32, north: 74 } as const;
export const MAP_WIDTH = 18;
export const MAP_DEPTH = 9.6;
export const MAP_CENTER = { lat: 53, lon: -9 } as const;

export function latLonToMap(lat: number, lon: number, y = 0): THREE.Vector3 {
  const x = THREE.MathUtils.mapLinear(lon, MAP_BOUNDS.west, MAP_BOUNDS.east, -MAP_WIDTH / 2, MAP_WIDTH / 2);
  const z = THREE.MathUtils.mapLinear(lat, MAP_BOUNDS.south, MAP_BOUNDS.north, MAP_DEPTH / 2, -MAP_DEPTH / 2);
  return new THREE.Vector3(x, y, z);
}

export function latLonToUv(lat: number, lon: number): THREE.Vector2 {
  const u = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(lon, MAP_BOUNDS.west, MAP_BOUNDS.east, 0, 1), 0, 1);
  const v = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(lat, MAP_BOUNDS.south, MAP_BOUNDS.north, 0, 1), 0, 1);
  return new THREE.Vector2(u, v);
}

function projectPosition([lon, lat]: Position, width: number, height: number): [number, number] {
  return [
    THREE.MathUtils.mapLinear(lon, MAP_BOUNDS.west, MAP_BOUNDS.east, 0, width),
    THREE.MathUtils.mapLinear(lat, MAP_BOUNDS.north, MAP_BOUNDS.south, 0, height),
  ];
}

function drawRing(context: CanvasRenderingContext2D, ring: Position[], width: number, height: number): void {
  let previous: [number, number] | null = null;
  ring.forEach((position, index) => {
    const point = projectPosition(position, width, height);
    const jump = previous ? Math.hypot(point[0] - previous[0], point[1] - previous[1]) : 0;
    if (index === 0 || jump > width * 0.42) context.moveTo(point[0], point[1]);
    else context.lineTo(point[0], point[1]);
    previous = point;
  });
}

function drawGeometry(context: CanvasRenderingContext2D, geometry: Geometry, width: number, height: number): void {
  if (geometry.type === 'Polygon') geometry.coordinates.forEach((ring) => drawRing(context, ring, width, height));
  else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach((polygon) => polygon.forEach((ring) => drawRing(context, ring, width, height)));
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createFlatMapTexture(width = 2048): THREE.CanvasTexture {
  const height = Math.round(width * (MAP_DEPTH / MAP_WIDTH));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable.');

  const ocean = context.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, '#0d2225');
  ocean.addColorStop(0.48, '#102d31');
  ocean.addColorStop(1, '#091b1e');
  context.fillStyle = ocean;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = 'rgba(187, 163, 104, 0.10)';
  context.lineWidth = 1;
  for (let lon = -60; lon <= 45; lon += 10) {
    const [x] = projectPosition([lon, MAP_BOUNDS.south], width, height);
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
  }
  for (let lat = 35; lat <= 70; lat += 5) {
    const [, y] = projectPosition([MAP_BOUNDS.west, lat], width, height);
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  context.restore();

  const countries = feature(typedAtlas, typedAtlas.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
  context.save();
  context.beginPath();
  countries.features.forEach((country: CountryFeature) => drawGeometry(context, country.geometry, width, height));
  const land = context.createLinearGradient(0, 0, width, height);
  land.addColorStop(0, '#46513f'); land.addColorStop(0.42, '#626448'); land.addColorStop(0.72, '#4b573f'); land.addColorStop(1, '#343f35');
  context.fillStyle = land;
  context.fill('evenodd');
  context.strokeStyle = 'rgba(223, 197, 132, 0.56)';
  context.lineWidth = width >= 1600 ? 1.8 : 1.15;
  context.stroke();
  context.restore();

  context.save();
  context.globalCompositeOperation = 'soft-light';
  const random = seededRandom(1021);
  const count = Math.floor(width * height * 0.0045);
  for (let index = 0; index < count; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 0.35 + random() * 1.5;
    context.fillStyle = random() > 0.55 ? `rgba(238, 215, 159, ${0.018 + random() * 0.035})` : `rgba(0, 16, 18, ${0.03 + random() * 0.05})`;
    context.fillRect(x, y, radius, radius);
  }
  context.restore();

  context.save();
  context.globalCompositeOperation = 'screen';
  const glow = context.createRadialGradient(width * 0.67, height * 0.24, 8, width * 0.67, height * 0.24, width * 0.34);
  glow.addColorStop(0, 'rgba(220, 187, 116, 0.16)'); glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = width >= 1600 ? 8 : 4;
  texture.needsUpdate = true;
  return texture;
}

export function makeGroundCurve(start: { lat: number; lon: number }, end: { lat: number; lon: number }, seed = 0): THREE.CatmullRomCurve3 {
  const a = latLonToMap(start.lat, start.lon, 0.18);
  const b = latLonToMap(end.lat, end.lon, 0.18);
  const direction = b.clone().sub(a);
  const length = direction.length();
  const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
  const bend = Math.min(0.72, length * 0.11) * (seed % 2 === 0 ? 1 : -1);
  const p1 = a.clone().lerp(b, 0.34).addScaledVector(perpendicular, bend);
  const p2 = a.clone().lerp(b, 0.68).addScaledVector(perpendicular, bend * 0.72);
  return new THREE.CatmullRomCurve3([a, p1, p2, b], false, 'centripetal', 0.45);
}

export function createLandMaskTexture(width = 1024): THREE.CanvasTexture {
  const height = Math.round(width * (MAP_DEPTH / MAP_WIDTH));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context is unavailable.');
  context.fillStyle = '#000'; context.fillRect(0, 0, width, height);
  const countries = feature(typedAtlas, typedAtlas.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
  context.beginPath();
  countries.features.forEach((country: CountryFeature) => drawGeometry(context, country.geometry, width, height));
  context.fillStyle = '#fff'; context.fill('evenodd');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
