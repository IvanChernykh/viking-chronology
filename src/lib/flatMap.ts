import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
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
  const x = THREE.MathUtils.mapLinear(lon, MAP_BOUNDS.west, MAP_BOUNDS.east, 0, width);
  const y = THREE.MathUtils.mapLinear(lat, MAP_BOUNDS.north, MAP_BOUNDS.south, 0, height);
  return [x, y];
}

function drawRing(context: CanvasRenderingContext2D, ring: Position[], width: number, height: number): void {
  let previous: [number, number] | null = null;
  ring.forEach((position, index) => {
    const point = projectPosition(position, width, height);
    const jump = previous ? Math.hypot(point[0] - previous[0], point[1] - previous[1]) : 0;
    if (index === 0 || jump > width * 0.42) context.moveTo(point[0], point[1]); else context.lineTo(point[0], point[1]);
    previous = point;
  });
}

function drawGeometry(context: CanvasRenderingContext2D, geometry: Geometry, width: number, height: number): void {
  if (geometry.type === 'Polygon') geometry.coordinates.forEach((ring) => drawRing(context, ring, width, height));
  else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach((polygon) => polygon.forEach((ring) => drawRing(context, ring, width, height)));
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

export function createFlatMapTexture(width = 2048): THREE.CanvasTexture {
  const height = Math.round(width * (MAP_DEPTH / MAP_WIDTH));
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas 2D context is unavailable.');
  const ocean = context.createLinearGradient(0, 0, 0, height); ocean.addColorStop(0, '#0d2225'); ocean.addColorStop(0.48, '#102d31'); ocean.addColorStop(1, '#091b1e'); context.fillStyle = ocean; context.fillRect(0, 0, width, height);
  context.save(); context.strokeStyle = 'rgba(187, 163, 104, 0.10)'; context.lineWidth = 1;
  for (let lon = -60; lon <= 45; lon += 10) { const [x] = projectPosition([lon, MAP_BOUNDS.south], width, height); context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
  for (let lat = 35; lat <= 70; lat += 5) { const [, y] = projectPosition([MAP_BOUNDS.west, lat], width, height); context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
  context.restore();
  const countries = feature(typedAtlas, typedAtlas.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
  context.save(); context.beginPath(); countries.features.forEach((country: CountryFeature) => drawGeometry(context, country.geometry, width, height));
  const land = context.createLinearGradient(0, 0, width, height); land.addColorStop(0, '#46513f'); land.addColorStop(0.42, '#626448'); land.addColorStop(0.72, '#4b573f'); land.addColorStop(1, '#343f35'); context.fillStyle = land; context.fill('evenodd'); context.strokeStyle = 'rgba(223, 197, 132, 0.56)'; context.lineWidth = width >= 1600 ? 1.8 : 1.15; context.stroke(); context.restore();
  context.save(); context.globalCompositeOperation = 'soft-light'; const random = seededRandom(1021); const count = Math.floor(width * height * 0.0045);
  for (let index = 0; index < count; index += 1) { const x = random() * width; const y = random() * height; const radius = 0.35 + random() * 1.5; context.fillStyle = random() > 0.55 ? `rgba(238, 215, 159, ${0.018 + random() * 0.035})` : `rgba(0, 16, 18, ${0.03 + random() * 0.05})`; context.fillRect(x, y, radius, radius); }
  context.restore(); context.save(); context.globalCompositeOperation = 'screen'; const glow = context.createRadialGradient(width * 0.67, height * 0.24, 8, width * 0.67, height * 0.24, width * 0.34); glow.addColorStop(0, 'rgba(220, 187, 116, 0.16)'); glow.addColorStop(1, 'rgba(0, 0, 0, 0)'); context.fillStyle = glow; context.fillRect(0, 0, width, height); context.restore();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = width >= 1600 ? 8 : 4; texture.needsUpdate = true; return texture;
}

const terrainNoise = createNoise2D(() => 0.61803398875);
export interface TerrainMask { canvas: HTMLCanvasElement; data: Uint8ClampedArray; width: number; height: number; }

export function createLandMask(width = 768): TerrainMask {
  const height = Math.max(256, Math.round(width * (MAP_DEPTH / MAP_WIDTH)));
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true }); if (!context) throw new Error('Canvas 2D context is unavailable.');
  context.fillStyle = '#000'; context.fillRect(0, 0, width, height);
  const countries = feature(typedAtlas, typedAtlas.objects.countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
  context.beginPath(); countries.features.forEach((country: CountryFeature) => drawGeometry(context, country.geometry, width, height)); context.fillStyle = '#fff'; context.fill('evenodd');
  const softened = document.createElement('canvas'); softened.width = width; softened.height = height;
  const softContext = softened.getContext('2d', { willReadFrequently: true }); if (!softContext) throw new Error('Canvas 2D context is unavailable.');
  softContext.filter = `blur(${Math.max(2, Math.round(width / 300))}px)`; softContext.drawImage(canvas, 0, 0); softContext.filter = 'none'; const image = softContext.getImageData(0, 0, width, height);
  return { canvas: softened, data: image.data, width, height };
}

export function sampleLandMask(mask: TerrainMask, u: number, v: number): number {
  const x = Math.max(0, Math.min(mask.width - 1, Math.round(u * (mask.width - 1))));
  const y = Math.max(0, Math.min(mask.height - 1, Math.round((1 - v) * (mask.height - 1))));
  return mask.data[(y * mask.width + x) * 4] / 255;
}

function mountainEnvelope(lat: number, lon: number): number {
  const norway = Math.exp(-(((lat - 62.2) / 6.0) ** 2 + ((lon - 8.0) / 4.2) ** 2));
  const alps = Math.exp(-(((lat - 46.6) / 2.2) ** 2 + ((lon - 9.3) / 5.3) ** 2));
  const iceland = Math.exp(-(((lat - 64.9) / 2.2) ** 2 + ((lon + 18.4) / 4.6) ** 2));
  const greenland = Math.exp(-(((lat - 64.5) / 5.5) ** 2 + ((lon + 43.0) / 7.5) ** 2));
  return Math.min(1, norway * 0.95 + alps * 0.75 + iceland * 0.7 + greenland * 0.62);
}

export function terrainHeight(lat: number, lon: number, land = 1): number {
  if (land < 0.14) return -0.08 + land * 0.12;
  const macro = terrainNoise(lon * 0.065, lat * 0.072) * 0.5 + 0.5;
  const detail = terrainNoise(lon * 0.19 + 13.2, lat * 0.21 - 7.4) * 0.5 + 0.5;
  const mountains = mountainEnvelope(lat, lon);
  const coast = THREE.MathUtils.smoothstep(land, 0.1, 0.85);
  return 0.025 + coast * (0.055 + macro * 0.075 + detail * 0.028 + mountains * (0.24 + detail * 0.18));
}

export function createTerrainGeometry(segmentsX: number, segmentsZ: number, mask: TerrainMask): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(MAP_WIDTH, MAP_DEPTH, segmentsX, segmentsZ); geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position as THREE.BufferAttribute; const colors: number[] = []; const color = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index); const z = positions.getZ(index); const u = x / MAP_WIDTH + 0.5; const v = 0.5 - z / MAP_DEPTH;
    const lat = THREE.MathUtils.lerp(MAP_BOUNDS.south, MAP_BOUNDS.north, v); const lon = THREE.MathUtils.lerp(MAP_BOUNDS.west, MAP_BOUNDS.east, u); const land = sampleLandMask(mask, u, v); const y = terrainHeight(lat, lon, land); positions.setY(index, y);
    if (land < 0.16) color.set('#0b2a30'); else if (land < 0.42) color.set('#756b4e'); else if (y > 0.34) color.set('#72746e'); else if (y > 0.22) color.set('#4d584c'); else if (lat > 65) color.set('#606b5c'); else color.set('#3f553f');
    const variation = (terrainNoise(lon * 0.42, lat * 0.44) + 1) * 0.035; color.offsetHSL(0, 0, variation - 0.035); colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals(); geometry.computeBoundingSphere(); return geometry;
}

export function createLandMaskTexture(mask: TerrainMask): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(mask.canvas); texture.colorSpace = THREE.NoColorSpace; texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.needsUpdate = true; return texture;
}

export function makeGroundCurve(start: { lat: number; lon: number }, end: { lat: number; lon: number }, seed = 0): THREE.CatmullRomCurve3 {
  const a = latLonToMap(start.lat, start.lon, 0.18); const b = latLonToMap(end.lat, end.lon, 0.18); const direction = b.clone().sub(a); const length = direction.length(); const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize(); const bendDirection = seed % 2 === 0 ? 1 : -1; const bend = Math.min(0.72, length * 0.11) * bendDirection; const p1 = a.clone().lerp(b, 0.34).addScaledVector(perpendicular, bend); const p2 = a.clone().lerp(b, 0.68).addScaledVector(perpendicular, bend * 0.72); return new THREE.CatmullRomCurve3([a, p1, p2, b], false, 'centripetal', 0.45);
}
