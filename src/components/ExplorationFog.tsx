import { useMemo } from 'react';
import * as THREE from 'three';
import { allStops, timelineBounds } from '../data/routes';
import { latLonToUv, MAP_DEPTH, MAP_WIDTH } from '../lib/flatMap';

interface ExplorationFogProps { timelineYear: number; compact: boolean; }
const MAX_REVEALS = 24;
export function ExplorationFog({ timelineYear, compact }: ExplorationFogProps) {
  const { centers, radii, count } = useMemo(() => {
    const active = allStops.filter((stop) => stop.year <= timelineYear);
    const progress = THREE.MathUtils.clamp((timelineYear - timelineBounds.min) / (timelineBounds.max - timelineBounds.min), 0, 1);
    const points = [{ uv: latLonToUv(59.1, 10.1), radius: 0.105 + progress * 0.018 }, ...active.map((stop, index) => ({ uv: latLonToUv(stop.lat, stop.lon), radius: 0.062 + Math.min(0.026, index * 0.0015) + progress * 0.012 }))].slice(0, MAX_REVEALS);
    return { centers: Array.from({ length: MAX_REVEALS }, (_, index) => points[index]?.uv ?? new THREE.Vector2(-10, -10)), radii: Array.from({ length: MAX_REVEALS }, (_, index) => points[index]?.radius ?? 0), count: points.length };
  }, [timelineYear]);
  const uniforms = useMemo(() => ({ uCenters: { value: centers }, uRadii: { value: radii }, uCount: { value: count }, uAspect: { value: MAP_WIDTH / MAP_DEPTH }, uCompact: { value: compact ? 1 : 0 } }), [centers, compact, count, radii]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.071, 0]} renderOrder={50}><planeGeometry args={[MAP_WIDTH, MAP_DEPTH]} /><shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`} fragmentShader={`uniform vec2 uCenters[24];uniform float uRadii[24];uniform int uCount;uniform float uAspect;uniform float uCompact;varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}void main(){float reveal=0.0;for(int i=0;i<24;i++){if(i>=uCount)break;vec2 delta=vUv-uCenters[i];delta.x*=uAspect;float distanceToCenter=length(delta);float radius=uRadii[i];float localReveal=1.0-smoothstep(radius*.58,radius,distanceToCenter);reveal=max(reveal,localReveal);}float noise=(hash(floor(vUv*220.0))-.5)*(.035-uCompact*.018);float alpha=mix(.965+noise,.025,reveal);vec3 fogColor=mix(vec3(.012,.020,.018),vec3(.055,.070,.058),vUv.y);gl_FragColor=vec4(fogColor,clamp(alpha,0.0,.985));}`} /></mesh>;
}
