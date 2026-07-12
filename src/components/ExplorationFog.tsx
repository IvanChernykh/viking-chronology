import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { allStops, timelineBounds } from '../data/routes';
import { latLonToUv, MAP_DEPTH, MAP_WIDTH } from '../lib/flatMap';
interface ExplorationFogProps { timelineYear: number; compact: boolean; }
const MAX_REVEALS = 24;
export function ExplorationFog({ timelineYear, compact }: ExplorationFogProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { centers, radii, count } = useMemo(() => {
    const active = allStops.filter((stop) => stop.year <= timelineYear);
    const progress = THREE.MathUtils.clamp((timelineYear - timelineBounds.min) / (timelineBounds.max - timelineBounds.min), 0, 1);
    const points = [{ uv: latLonToUv(59.1, 10.1), radius: 0.118 + progress * 0.018 }, ...active.map((stop, index) => ({ uv: latLonToUv(stop.lat, stop.lon), radius: 0.068 + Math.min(0.03, index * 0.0018) + progress * 0.014 }))].slice(0, MAX_REVEALS);
    return { centers: Array.from({ length: MAX_REVEALS }, (_, index) => points[index]?.uv ?? new THREE.Vector2(-10, -10)), radii: Array.from({ length: MAX_REVEALS }, (_, index) => points[index]?.radius ?? 0), count: points.length };
  }, [timelineYear]);
  const uniforms = useMemo(() => ({ uCenters: { value: centers }, uRadii: { value: radii }, uCount: { value: count }, uAspect: { value: MAP_WIDTH / MAP_DEPTH }, uCompact: { value: compact ? 1 : 0 }, uTime: { value: 0 } }), [centers, compact, count, radii]);
  useFrame(({ clock }) => { if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.elapsedTime; });
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.49, 0]} renderOrder={50}><planeGeometry args={[MAP_WIDTH, MAP_DEPTH, compact ? 1 : 48, compact ? 1 : 24]} /><shaderMaterial ref={materialRef} transparent depthWrite={false} uniforms={uniforms} vertexShader={`uniform float uTime; uniform float uCompact; varying vec2 vUv; varying float vDrift; void main(){vUv=uv;vec3 p=position;float drift=sin((p.x*.8+p.y*.45)+uTime*.16)*.035;drift+=cos((p.y*1.1-p.x*.22)-uTime*.11)*.022;p.z+=drift*(1.-uCompact);vDrift=drift;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`} fragmentShader={`uniform vec2 uCenters[24];uniform float uRadii[24];uniform int uCount;uniform float uAspect;uniform float uCompact;uniform float uTime;varying vec2 vUv;varying float vDrift;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}float valueNoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}void main(){float reveal=0.,edgeBand=0.;for(int i=0;i<24;i++){if(i>=uCount)break;vec2 delta=vUv-uCenters[i];delta.x*=uAspect;float distanceToCenter=length(delta);float radius=uRadii[i];float localReveal=1.-smoothstep(radius*.54,radius,distanceToCenter);reveal=max(reveal,localReveal);edgeBand=max(edgeBand,smoothstep(radius*.52,radius*.78,distanceToCenter)*(1.-smoothstep(radius*.78,radius,distanceToCenter)));}float mist=valueNoise(vUv*17.+vec2(uTime*.022,-uTime*.015));mist+=valueNoise(vUv*43.-vec2(uTime*.011,uTime*.009))*.42;float unknownAlpha=.89+mist*.065+vDrift*.25;float knownAlpha=.015+edgeBand*(.08+mist*.08);float alpha=mix(unknownAlpha,knownAlpha,reveal);vec3 fogColor=mix(vec3(.008,.015,.014),vec3(.12,.15,.135),mist*.42+edgeBand*.18);gl_FragColor=vec4(fogColor,clamp(alpha,0.,.96));}`} /></mesh>;
}
