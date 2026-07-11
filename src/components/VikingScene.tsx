import { ContactShadows, MapControls, Sky } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { VikingCharacter } from '../data/dialogues';
import { allStops } from '../data/routes';
import { readDeviceProfile, resolveRenderQuality, supportsWebGL2 } from '../lib/deviceProfile';
import { latLonToMap } from '../lib/flatMap';
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
  selectedStop: VikingStop | null;
  shipsEnabled: boolean;
  shipSpeed: number;
  renderQuality: RenderQuality;
  isMobile: boolean;
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

function CameraRig({ focusStop, isMobile, controlsRef }: {
  focusStop: VikingStop | null;
  isMobile: boolean;
  controlsRef: RefObject<MapControlsHandle | null>;
}) {
  const { camera } = useThree();
  const target = useRef(latLonToMap(59.1, 10.1, 0));
  const position = useRef(new THREE.Vector3());
  const animationRemaining = useRef(0);

  const setDesiredView = useCallback((stop: VikingStop | null) => {
    const nextTarget = stop ? latLonToMap(stop.lat, stop.lon, 0) : latLonToMap(59.1, 10.1, 0);
    target.current.copy(nextTarget);
    const offset = isMobile
      ? new THREE.Vector3(3.1, 4.3, 5.6)
      : new THREE.Vector3(4.2, 5.7, 7.4);
    position.current.copy(nextTarget).add(offset);
    animationRemaining.current = 1.35;
  }, [isMobile]);

  useEffect(() => {
    setDesiredView(focusStop);
  }, [focusStop, setDesiredView]);

  useEffect(() => {
    const startTarget = latLonToMap(59.1, 10.1, 0);
    const offset = isMobile
      ? new THREE.Vector3(3.1, 4.3, 5.6)
      : new THREE.Vector3(4.2, 5.7, 7.4);
    camera.position.copy(startTarget).add(offset);
    camera.lookAt(startTarget);
    if (controlsRef.current) {
      controlsRef.current.target.copy(startTarget);
      controlsRef.current.update();
    }
  }, [camera, controlsRef, isMobile]);

  useFrame((_, rawDelta) => {
    if (animationRemaining.current <= 0) return;
    const delta = Math.min(rawDelta, 1 / 24);
    const alpha = 1 - Math.exp(-delta * 5.8);
    camera.position.lerp(position.current, alpha);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target.current, alpha);
      controlsRef.current.update();
    } else {
      camera.lookAt(target.current);
    }
    animationRemaining.current -= delta;
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
    if (elapsed.current >= 5) {
      const fps = frames.current / elapsed.current;
      measured.current = true;
      if (fps < 31) onDecline();
    }
  });

  useEffect(() => {
    elapsed.current = 0;
    frames.current = 0;
    measured.current = false;
  }, [quality]);

  return null;
}

function SceneContent({
  routes,
  activeRouteId,
  timelineYear,
  selectedStop,
  shipsEnabled,
  shipSpeed,
  isMobile,
  onSelectStop,
  onSpeakCharacter,
  quality,
  onQualityDecline,
}: Omit<VikingSceneProps, 'renderQuality'> & {
  quality: RuntimeQuality;
  onQualityDecline: () => void;
}) {
  const compact = quality === 'battery';
  const controlsRef = useRef<MapControlsHandle>(null);

  return (
    <>
      <color attach="background" args={['#071315']} />
      <fog attach="fog" args={['#071315', isMobile ? 9 : 11, isMobile ? 23 : 28]} />
      {!compact && <Sky distance={450000} sunPosition={[-9, 8, -5]} inclination={0.47} azimuth={0.22} turbidity={8.5} rayleigh={1.7} mieCoefficient={0.008} mieDirectionalG={0.82} />}
      <hemisphereLight args={['#d8d7c3', '#13231f', compact ? 1.35 : 1.65]} />
      <directionalLight
        castShadow={!compact}
        position={[-6, 10, 8]}
        intensity={compact ? 2.15 : 3.25}
        color="#ffdda6"
        shadow-mapSize-width={quality === 'high' ? 1536 : 768}
        shadow-mapSize-height={quality === 'high' ? 1536 : 768}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[3, 3, -1]} intensity={compact ? 2.5 : 4.5} color="#6aa5a4" distance={15} />

      <MapSurface quality={quality} />
      <WorldDecor timelineYear={timelineYear} stops={allStops} compact={compact} />

      {routes.map((route) => (
        <GroundRoute
          key={route.id}
          route={route}
          timelineYear={timelineYear}
          emphasized={activeRouteId === 'all' || activeRouteId === route.id}
          shipsEnabled={shipsEnabled}
          shipSpeed={shipSpeed}
          compact={compact || isMobile}
        />
      ))}

      {routes.flatMap((route) => route.stops.map((stop) => (
        <WorldStopMarker
          key={stop.id}
          stop={stop}
          color={route.color}
          active={stop.year <= timelineYear}
          selected={selectedStop?.id === stop.id}
          dimmed={activeRouteId !== 'all' && activeRouteId !== route.id}
          compact={compact || isMobile}
          onSelect={onSelectStop}
        />
      )))}

      <VikingCamp compact={compact || isMobile} onSpeak={onSpeakCharacter} />
      <ExplorationFog timelineYear={timelineYear} compact={compact || isMobile} />

      {!compact && (
        <ContactShadows
          position={[0, 0.025, 0]}
          opacity={0.35}
          scale={18}
          blur={2.4}
          far={3.5}
          frames={1}
          color="#020706"
        />
      )}

      <CameraRig focusStop={selectedStop} isMobile={isMobile} controlsRef={controlsRef} />
      <MapControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        enableDamping
        dampingFactor={isMobile ? 0.16 : 0.11}
        screenSpacePanning
        zoomToCursor
        minDistance={isMobile ? 3.5 : 4.2}
        maxDistance={isMobile ? 16 : 19}
        panSpeed={isMobile ? 0.82 : 0.68}
        zoomSpeed={isMobile ? 0.82 : 0.72}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <FrameBudgetGuard quality={quality} onDecline={onQualityDecline} />
    </>
  );
}

export function VikingScene(props: VikingSceneProps) {
  const profile = useMemo(() => readDeviceProfile(props.isMobile), [props.isMobile]);
  const requestedQuality = useMemo(
    () => resolveRenderQuality(props.renderQuality, props.isMobile, profile),
    [profile, props.isMobile, props.renderQuality],
  );
  const [adaptiveQuality, setAdaptiveQuality] = useState<RuntimeQuality>(requestedQuality);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const webglSupported = useMemo(() => supportsWebGL2(), []);

  const runtimeQuality = props.renderQuality === 'auto'
    ? leastDemandingQuality(requestedQuality, adaptiveQuality)
    : requestedQuality;

  const declineQuality = useCallback(() => {
    setAdaptiveQuality((current) => lowerQuality(current));
  }, []);

  const retry = useCallback(() => {
    setContextLost(false);
    setAdaptiveQuality('battery');
    setCanvasKey((key) => key + 1);
  }, []);

  if (!webglSupported) return <SceneFallback reason="unsupported" />;
  if (contextLost) return <SceneFallback reason="context-lost" onRetry={retry} />;

  const maxDpr = runtimeQuality === 'high' ? 1.65 : runtimeQuality === 'balanced' ? 1.25 : 1;
  const minDpr = runtimeQuality === 'battery' ? 0.76 : 0.92;
  const dpr = THREE.MathUtils.clamp(profile.devicePixelRatio, minDpr, maxDpr);

  return (
    <Canvas
      key={canvasKey}
      shadows={runtimeQuality !== 'battery' && !props.isMobile}
      dpr={dpr}
      camera={{
        position: [5.8, props.isMobile ? 4.3 : 5.7, props.isMobile ? 5.8 : 7.4],
        fov: props.isMobile ? 44 : 38,
        near: 0.08,
        far: 80,
      }}
      gl={{
        antialias: runtimeQuality === 'high' && !props.isMobile,
        alpha: false,
        depth: true,
        stencil: false,
        powerPreference: props.isMobile ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = runtimeQuality === 'battery' ? 1.1 : 1.18;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = gl.domElement;
        canvas.style.touchAction = 'none';
        canvas.style.overscrollBehavior = 'none';
        canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        canvas.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault();
            setContextLost(true);
          },
          { once: true },
        );
      }}
    >
      <Suspense fallback={null}>
        <SceneContent
          {...props}
          quality={runtimeQuality}
          onQualityDecline={declineQuality}
        />
      </Suspense>
    </Canvas>
  );
}
