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

function drawRing(context: CanvasRenderingContext2D, ring: Position[], width: number, height: number): void {
  if (ring.length === 0) return;
  let previousX: number | null = null;

  ring.forEach(([lon, lat], index) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    const shouldMove = index === 0 || previousX === null || Math.abs(x - previousX) > width / 2;
    if (shouldMove) context.moveTo(x, y);
    else context.lineTo(x, y);
    previousX = x;
  });
}

function drawGeometry(context: CanvasRenderingContext2D, geometry: Geometry, width: number, height: number): void {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring) => drawRing(context, ring, width, height));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon) => polygon.forEach((ring) => drawRing(context, ring, width, height)));
  }
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createEarthTexture(width = 2048): THREE.CanvasTexture {
  const height = Math.floor(width / 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Canvas 2D context is unavailable.');

  const oceanGradient = context.createLinearGradient(0, 0, 0, height);
  oceanGradient.addColorStop(0, '#101a1b');
  oceanGradient.addColorStop(0.48, '#172525');
  oceanGradient.addColorStop(1, '#0d1516');
  context.fillStyle = oceanGradient;
  context.fillRect(0, 0, width, height);

  const countries = feature(
    typedAtlas,
    typedAtlas.objects.countries,
  ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

  context.save();
  context.beginPath();
  countries.features.forEach((country: CountryFeature) => drawGeometry(context, country.geometry, width, height));
  const landGradient = context.createLinearGradient(0, 0, width, height);
  landGradient.addColorStop(0, '#665d3f');
  landGradient.addColorStop(0.48, '#817451');
  landGradient.addColorStop(1, '#4c4a33');
  context.fillStyle = landGradient;
  context.fill('evenodd');
  context.strokeStyle = 'rgba(224, 194, 125, 0.48)';
  context.lineWidth = width >= 1600 ? 1.45 : 0.85;
  context.stroke();
  context.restore();

  const random = seededRandom(793);
  context.save();
  context.globalCompositeOperation = 'soft-light';
  const grainCount = Math.floor(width * height * 0.006);
  for (let index = 0; index < grainCount; index += 1) {
    const x = random() * width;
    const y = random() * height;
    const alpha = 0.018 + random() * 0.035;
    context.fillStyle = random() > 0.5 ? `rgba(255, 226, 164, ${alpha})` : `rgba(31, 20, 11, ${alpha})`;
    context.fillRect(x, y, random() * 2 + 0.4, random() * 2 + 0.4);
  }
  context.restore();

  context.save();
  context.globalCompositeOperation = 'screen';
  const glow = context.createRadialGradient(width * 0.34, height * 0.36, 10, width * 0.34, height * 0.36, width * 0.7);
  glow.addColorStop(0, 'rgba(189, 151, 82, 0.12)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = width >= 1600 ? 8 : 4;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}
