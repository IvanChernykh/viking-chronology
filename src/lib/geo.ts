import * as THREE from 'three';

export const GLOBE_RADIUS = 2.25;

export function latLonToVector3(lat: number, lon: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function makeArcPoints(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  radius = GLOBE_RADIUS,
  segments = 64,
): THREE.Vector3[] {
  const start = latLonToVector3(startLat, startLon, 1).normalize();
  const end = latLonToVector3(endLat, endLon, 1).normalize();
  const angle = start.angleTo(end);
  const arcHeight = THREE.MathUtils.clamp(angle * 0.42, 0.12, 0.72);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const sinAngle = Math.sin(angle);
    const interpolated =
      sinAngle < 1e-6
        ? start.clone().lerp(end, t).normalize()
        : start
            .clone()
            .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
            .add(end.clone().multiplyScalar(Math.sin(t * angle) / sinAngle))
            .normalize();
    const lift = Math.sin(Math.PI * t) * arcHeight;
    return interpolated.multiplyScalar(radius + 0.035 + lift);
  });
}

export function pointAlongArc(points: THREE.Vector3[], progress: number): THREE.Vector3 {
  const clamped = THREE.MathUtils.clamp(progress, 0, 0.9999);
  const scaled = clamped * (points.length - 1);
  const index = Math.floor(scaled);
  const local = scaled - index;
  return points[index].clone().lerp(points[Math.min(index + 1, points.length - 1)], local);
}

export function tangentAlongArc(points: THREE.Vector3[], progress: number): THREE.Vector3 {
  const delta = 0.003;
  const previous = pointAlongArc(points, Math.max(0, progress - delta));
  const next = pointAlongArc(points, Math.min(0.9999, progress + delta));
  return next.sub(previous).normalize();
}

export function estimateRouteDistanceKm(stops: Array<{ lat: number; lon: number }>): number {
  const earthRadiusKm = 6371;
  let total = 0;

  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];
    const lat1 = THREE.MathUtils.degToRad(previous.lat);
    const lat2 = THREE.MathUtils.degToRad(current.lat);
    const deltaLat = lat2 - lat1;
    const deltaLon = THREE.MathUtils.degToRad(current.lon - previous.lon);
    const haversine =
      Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    total += 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
  }

  return total;
}
