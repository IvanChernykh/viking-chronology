import { ContactShadows, MapControls, Sky, Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { VikingCharacter } from '../data/dialogues';
import { allStops } from '../data/routes';
import { readDeviceProfile, resolveRenderQuality, supportsWebGL2 } from '../lib/deviceProfile';
import { latLonToMap } from '../lib/flatMap';
import { createVoyageCurve } from '../lib/voyagePath';
import type { RenderQuality, VikingRoute, VikingStop } from '../types';
import { ExplorationFog } from './ExplorationFog';
import { GroundRoute } from './GroundRoute';
import { MapSurface } from './MapSurface';
import { SceneFallback } from './SceneFallback';
import { VikingCamp } from './VikingCamp';
import { WorldDecor } from './WorldDecor';
import { WorldStopMarker } from './WorldStopMarker';

interface VikingSceneProps {
  routes: VikingRoute[];
  activeRouteId: string;
  timelineYear: number;
  voyageProgress: number;
  stage: 'planning' | 'voyage' | 'arrived';
  selectedStop: VikingStop | null;
  renderQuality: RenderQuality;
  isMobile: boolean;
  readyCharacters: Set<string>;
  onSelectStop: (stop: VikingStop) => void;
  onSpeakCharacter: (character: VikingCharacter) => void;
}

type RuntimeQuality = Exclude<RenderQuality, 'auto'>;
type MapControlsHandle = ComponentRef<typeof MapControls>;

function lowerQuality(quality: RuntimeQuality): RuntimeQuality {
  if (quality === 'high') return 'balanced';
  return 'battery';
}

function leastDemandingQuality(left: RuntimeQuality, right: RuntimeQuality): RuntimeQuality {
  const rank: Record<RuntimeQuality, number> = { battery: 0, balanced: 1, high: 2 };
  return rank[left] <= rank[right] ? left : right;
}

function CameraRig({ route, stage, voyageProgress, focusStop, isMobile, controlsRef }: {
  route: VikingRoute;
  stage: 'planning' | 'voyage' | 'arrived';
  voyageProgress: number;
  focusStop: VikingStop | null;
  isMobile: boolean;
  controlsRef: RefObject<MapControlsHandle | null>;
}) {
  const { camera } = useThree();
  const curve = useMemo(() => createVoyageCurve(route), [route]);
  const desiredPosition = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const point = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const start = useMemo(() => latLonToMap(59.1, 10.1, 0.2), []);

  useEffect(() => {
    const offset = isMobile ? new THREE.Vector3(3.3, 3.8, 5.3) : new THREE.Vector3(4.3, 4.8, 7.1);
    camera.position.copy(start).add(offset);
    camera.lookAt(start);
    if (controlsRef.current) {
      controlsRef.current.target.copy(start);
      controlsRef.current.update();
    }
  }, [camera, controlsRef, isMobile, start]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 24);
    const alpha = 1 - Math.exp(-delta * (stage === 'voyage' ? 3.4 : 5.2));
    if (stage === 'voyage') {
      const p = THREE.MathUtils.clamp(voyageProgress, 0.004, 0.996);
      curve.getPointAt(p, point);
      curve.getPointAt(Math.min(0.999, p + 0.025), ahead);
      const direction = ahead.clone().sub(point).normalize();
      const side = new THREE.Vector3(-direction.z, 0, direction.x);
      desiredTarget.current.copy(point).lerp(ahead, 0.32);
      desiredPosition.current.copy(point).addScaledVector(side, isMobile ? 2.4 : 3.4).add(new THREE.Vector3(0, isMobile ? 2.8 : 3.65, isMobile ? 3.3 : 4.5));
    } else if (focusStop) {
      desiredTarget.current.copy(latLonToMap(focusStop.lat, focusStop.lon, 0.18));
      desiredPosition.current.copy(desiredTarget.current).add(isMobile ? new THREE.Vector3(3.1, 3.6, 5.1) : new THREE.Vector3(4.1, 4.5, 6.6));
    } else {
      desiredTarget.current.copy(start);
      desiredPosition.current.copy(start).add(isMobile ? new THREE.Vector3(3.3, 3.8, 5.3) : new THREE.Vector3(4.3, 4.8, 7.1));
    }
    camera.position.lerp(desiredPosition.current, alpha);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, alpha);
      controlsRef.current.update();
    } else camera.lookAt(desiredTarget.current);
  });
  return null;
}

function FrameBudgetGuard({ quality, onDecline }: { quality: RuntimeQuality; onDecline: () => void }) {
  const elapsed = useRef(0);
  const frames = useRef(0);
  const measured = useRef(false);
  useFrame((_, rawDelta) => {
    if (measured.current || quality === 'battery' || document.hidden) return;
    elapsed.current += Math.min(rawDelta, 0.12);
    frames.current += 1;
    if (elapsed.current >= 5.5) {
      const fps = frames.current / elapsed.current;
      measured.current = true;
      if (fps < 32) onDecline();
    }
  });
  useEffect(() => { elapsed.current = 0; frames.current = 0; measured.current = false; }, [quality]);
  return null;
}

function SceneContent({ routes, activeRouteId, timelineYear, voyageProgress, stage, selectedStop, isMobile, readyCharacters, onSelectStop, onSpeakCharacter, quality, onQualityDecline }: Omit<VikingSceneProps, 'renderQuality'> & { quality: RuntimeQuality; onQualityDecline: () => void }) {
  const compact = quality === 'battery';
  const controlsRef = useRef<MapControlsHandle>(null);
  const activeRoute = routes.find((route) => route.id === activeRouteId) ?? routes[0];
  const chronologyProgress = THREE.MathUtils.clamp((timelineYear - activeRoute.startYear) / Math.max(1, activeRoute.endYear - activeRoute.startYear), 0, 1);
  return <>
    <color attach="background" args={['#061113']} />
    <fog attach="fog" args={['#071416', isMobile ? 8 : 10, isMobile ? 22 : 30]} />
    {!compact && <Sky distance={450000} sunPosition={[-8, 7, -6]} inclination={0.49} azimuth={0.24} turbidity={9.2} rayleigh={2.1} mieCoefficient={0.008} mieDirectionalG={0.84} />}
    {!compact && <Stars radius={45} depth={18} count={900} factor={1.1} saturation={0.2} fade speed={0.08} />}
    <hemisphereLight args={['#d4d6c7', '#0d201c', compact ? 1.3 : 1.7]} />
    <directionalLight castShadow={!compact && !isMobile} position={[-7,11,7]} intensity={compact ? 2.2 : 3.7} color="#ffdca6" shadow-mapSize-width={quality === 'high' ? 2048 : 1024} shadow-mapSize-height={quality === 'high' ? 2048 : 1024} shadow-camera-near={1} shadow-camera-far={36} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={9} shadow-camera-bottom={-9} />
    <pointLight position={[3,3.8,-1]} intensity={compact ? 2.2 : 4.2} color="#6ea9a7" distance={18} />
    <MapSurface quality={quality} />
    <WorldDecor timelineYear={timelineYear} stops={allStops} compact={compact || isMobile} />
    {routes.map((route) => {
      const active = route.id === activeRouteId;
      return <GroundRoute key={route.id} route={route} progress={active ? (stage === 'planning' ? 0.025 : voyageProgress) : chronologyProgress * 0.45} emphasized={active} compact={compact || isMobile} showShip={active && stage === 'voyage'} />;
    })}
    {routes.flatMap((route) => route.stops.map((stop) => <WorldStopMarker key={stop.id} stop={stop} color={route.color} active={stop.year <= timelineYear || (route.id === activeRouteId && stage === 'arrived')} selected={selectedStop?.id === stop.id} dimmed={route.id !== activeRouteId} compact={compact || isMobile} onSelect={onSelectStop} />))}
    <VikingCamp compact={compact || isMobile} onSpeak={onSpeakCharacter} readyCharacters={readyCharacters} expeditionActive={stage === 'voyage'} />
    <ExplorationFog timelineYear={timelineYear} compact={compact || isMobile} />
    {!compact && !isMobile && <ContactShadows position={[0,0.025,0]} opacity={0.28} scale={20} blur={2.8} far={4.2} frames={1} color="#020706" />}
    <CameraRig route={activeRoute} stage={stage} voyageProgress={voyageProgress} focusStop={selectedStop} isMobile={isMobile} controlsRef={controlsRef} />
    <MapControls ref={controlsRef} makeDefault enabled={stage !== 'voyage'} enableRotate={false} enableDamping dampingFactor={isMobile ? 0.18 : 0.1} screenSpacePanning zoomToCursor={!isMobile} minDistance={isMobile ? 4.1 : 4.8} maxDistance={isMobile ? 13.5 : 18} panSpeed={isMobile ? 0.72 : 0.62} zoomSpeed={isMobile ? 0.7 : 0.72} mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }} touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }} />
    {!compact && !isMobile && <EffectComposer multisampling={0}><SMAA /><Bloom intensity={0.28} luminanceThreshold={0.84} luminanceSmoothing={0.32} mipmapBlur /><Vignette eskil={false} offset={0.2} darkness={0.55} /></EffectComposer>}
    <FrameBudgetGuard quality={quality} onDecline={onQualityDecline} />
  </>;
}

export function VikingScene(props: VikingSceneProps) {
  const profile = useMemo(() => readDeviceProfile(props.isMobile), [props.isMobile]);
  const requestedQuality = useMemo(() => resolveRenderQuality(props.renderQuality, props.isMobile, profile), [profile, props.isMobile, props.renderQuality]);
  const [adaptiveQuality, setAdaptiveQuality] = useState<RuntimeQuality>(requestedQuality);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const webglSupported = useMemo(() => supportsWebGL2(), []);
  const runtimeQuality = props.renderQuality === 'auto' ? leastDemandingQuality(requestedQuality, adaptiveQuality) : requestedQuality;
  const declineQuality = useCallback(() => setAdaptiveQuality((current) => lowerQuality(current)), []);
  const retry = useCallback(() => { setContextLost(false); setAdaptiveQuality('battery'); setCanvasKey((key) => key + 1); }, []);
  if (!webglSupported) return <SceneFallback reason="unsupported" />;
  if (contextLost) return <SceneFallback reason="context-lost" onRetry={retry} />;
  const maxDpr = runtimeQuality === 'high' ? 1.55 : runtimeQuality === 'balanced' ? 1.2 : 0.95;
  const minDpr = runtimeQuality === 'battery' ? 0.72 : 0.88;
  const dpr = THREE.MathUtils.clamp(profile.devicePixelRatio, minDpr, maxDpr);
  return <Canvas key={canvasKey} shadows={runtimeQuality !== 'battery' && !props.isMobile} dpr={dpr} camera={{ position: [5.8, props.isMobile ? 4.2 : 5.3, props.isMobile ? 6 : 7.4], fov: props.isMobile ? 46 : 37, near: 0.08, far: 90 }} gl={{ antialias: runtimeQuality === 'high' && !props.isMobile, alpha: false, depth: true, stencil: false, powerPreference: props.isMobile ? 'default' : 'high-performance', failIfMajorPerformanceCaveat: false }} onCreated={({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = runtimeQuality === 'battery' ? 1.05 : 1.16;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = gl.domElement;
    canvas.style.touchAction = 'none';
    canvas.style.overscrollBehavior = 'none';
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); setContextLost(true); }, { once: true });
  }}><Suspense fallback={null}><SceneContent {...props} quality={runtimeQuality} onQualityDecline={declineQuality} /></Suspense></Canvas>;
}
