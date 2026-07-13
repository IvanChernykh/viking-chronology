import * as THREE from 'three';
import { latLonToMap } from './flatMap';
import type { VikingRoute } from '../types';

export function createVoyageCurve(route: VikingRoute): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  route.stops.forEach((stop, index) => {
    const point = latLonToMap(stop.lat, stop.lon, 0.16);
    if (index > 0) {
      const previous = points[points.length - 1];
      const middle = previous.clone().lerp(point, 0.5);
      const direction = point.clone().sub(previous);
      const bend = new THREE.Vector3(-direction.z, 0, direction.x)
        .normalize()
        .multiplyScalar(Math.min(direction.length() * 0.08, 0.46) * (index % 2 === 0 ? 1 : -1));
      middle.add(bend);
      points.push(middle);
    }
    points.push(point);
  });
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.38);
}

export function voyageYear(route: VikingRoute, progress: number): number {
  const first = route.stops[0]?.year ?? route.startYear;
  const last = route.stops[route.stops.length - 1]?.year ?? route.endYear;
  return THREE.MathUtils.lerp(first, last, THREE.MathUtils.clamp(progress, 0, 1));
}
