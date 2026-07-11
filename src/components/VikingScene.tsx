import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { readDeviceProfile, resolveRenderQuality, supportsWebGL2 } from '../lib/deviceProfile';
import { latLonToVector3 } from '../lib/geo';
import type { RenderQuality, VikingRoute, VikingStop } from '../types';
import { Globe } from './Globe';
import { RouteArc } from './RouteArc';
import { SceneFallback } from './SceneFallback';
import { StopMarker } from './StopMarker';

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
}

type RuntimeQuality = Exclude<RenderQuality, 'auto'>;

function lowerQuality(quality: RuntimeQuality): RuntimeQuality {
  if (quality === 'high') return 'balanced';
  return 'battery';
}

function leastDemandingQuality(left: RuntimeQuality, right: RuntimeQuality): RuntimeQuality {
  const rank: Record<RuntimeQuality, number> = { battery: 0, balanced: 1, high: 2 };
  return rank[left] <= rank[right] ? left : right;
}

function CameraRig({ focusStop, isMobile }: { focusStop: VikingStop | null; isMobile: boolean }) {
  const { camera } = useThree();
  const desiredPosition = useRef(new THREE.Vector3(0.8, 2.7, 7.4));
  const animationRemaining = useRef(0);

  useEffect(() => {
    if (focusStop) {
      const surface = latLonToVector3(focusStop.lat, focusStop.lon, 1).normalize();
      desiredPosition.current
        .copy(surface.multiplyScalar(isMobile ? 6.95 : 6.15))
        .add(new THREE.Vector3(0, isMobile ? 0.6 : 0.35, 0));
    } else {
      desiredPosition.current.set(0.8, isMobile ? 2.95 : 2.7, isMobile ? 8.2 : 7.4);
    }
    animationRemaining.current = 1.1;
  }, [focusStop, isMobile]);

  useFrame((_, rawDelta) => {
    if (animationRemaining.current <= 0) return;
    const delta = Math.min(rawDelta, 1 / 20);
    const interpolation = 1 - Math.exp(-delta * 5.4);
    camera.position.lerp(desiredPosition.current, interpolation);
    camera.lookAt(0, 0, 0);
    animationRemaining.current -= delta;
  });

  return null;
}

function FrameBudgetGuard({
  quality,
  onDecline,
}: {
  quality: RuntimeQuality;
  onDecline: () => void;
}) {
  const elapsed = useRef(0);
  const frameCount = useRef(0);
  const measured = useRef(false);

  useFrame((_, rawDelta) => {
    if (measured.current || quality === 'battery' || document.hidden) return;
    const delta = Math.min(rawDelta, 0.12);
    elapsed.current += delta;
    frameCount.current += 1;

    if (elapsed.current >= 4.5) {
      const averageFps = frameCount.current / elapsed.current;
      measured.current = true;
      if (averageFps < 32) onDecline();
    }
  });

  useEffect(() => {
    elapsed.current = 0;
    frameCount.current = 0;
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
  quality,
  reducedMotion,
  onQualityDecline,
}: Omit<VikingSceneProps, 'renderQuality'> & {
  quality: RuntimeQuality;
  reducedMotion: boolean;
  onQualityDecline: () => void;
}) {
  const compact = quality === 'battery';
  const segmentEntries = useMemo(
    () =>
      routes.flatMap((route, routeIndex) =>
        route.stops.slice(1).map((stop, stopIndex) => ({
          route,
          routeIndex,
          start: route.stops[stopIndex],
          end: stop,
          segmentIndex: stopIndex,
        })),
      ),
    [routes],
  );

  const latestCompletedSegment = useMemo(
    () =>
      Object.fromEntries(
        routes.map((route) => {
          let latest = -1;
          route.stops.slice(1).forEach((stop, index) => {
            if (stop.year <= timelineYear) latest = index;
          });
          return [route.id, latest];
        }),
      ) as Record<string, number>,
    [routes, timelineYear],
  );

  const stars = quality === 'high' ? 1800 : quality === 'balanced' ? 900 : 360;

  return (
    <>
      <color attach="background" args={['#0b0a08']} />
      <fog attach="fog" args={['#0b0a08', 8.2, 17]} />
      <hemisphereLight args={['#d7c8a3', '#17100b', compact ? 0.68 : 0.88]} />
      <directionalLight
        position={[-5, 4, 6]}
        intensity={compact ? 1.85 : 2.35}
        color="#f5dfaf"
      />
      <pointLight position={[4, -1, -5]} intensity={compact ? 8 : 14} distance={13} color="#456b78" />
      {!compact && <pointLight position={[-4, 1, 2]} intensity={4.5} distance={9} color="#8f3d24" />}
      <Stars
        radius={70}
        depth={42}
        count={stars}
        factor={compact ? 1.7 : 2.2}
        saturation={0.12}
        fade
        speed={reducedMotion ? 0 : 0.055}
      />

      <Globe quality={quality} />

      {segmentEntries.map(({ route, routeIndex, start, end, segmentIndex }) => {
        const denominator = Math.max(1, end.year - start.year);
        const revealProgress = THREE.MathUtils.clamp((timelineYear - start.year) / denominator, 0, 1);
        const emphasized = activeRouteId === 'all' || activeRouteId === route.id;

        return (
          <RouteArc
            key={`${route.id}-${start.id}-${end.id}`}
            start={start}
            end={end}
            color={route.color}
            revealProgress={revealProgress}
            shipSpeed={shipSpeed}
            shipsEnabled={shipsEnabled && emphasized && segmentIndex === latestCompletedSegment[route.id]}
            emphasized={emphasized}
            shipOffset={(routeIndex * 0.23 + segmentIndex * 0.31) % 1}
            compact={compact}
          />
        );
      })}

      {routes.flatMap((route) =>
        route.stops.map((stop) => (
          <StopMarker
            key={stop.id}
            stop={stop}
            routeColor={route.color}
            active={stop.year <= timelineYear}
            selected={selectedStop?.id === stop.id}
            dimmed={activeRouteId !== 'all' && activeRouteId !== route.id}
            compact={isMobile || compact}
            animate={!reducedMotion && !compact}
            onSelect={onSelectStop}
          />
        )),
      )}

      <CameraRig focusStop={selectedStop} isMobile={isMobile} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        minDistance={isMobile ? 4.85 : 4.25}
        maxDistance={isMobile ? 11 : 10}
        rotateSpeed={isMobile ? 0.58 : 0.48}
        zoomSpeed={0.68}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
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

  const runtimeQuality =
    props.renderQuality === 'auto'
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

  const maxDpr = runtimeQuality === 'high' ? 1.8 : runtimeQuality === 'balanced' ? 1.3 : 1;
  const minDpr = runtimeQuality === 'battery' ? 0.82 : 1;
  const dpr = THREE.MathUtils.clamp(profile.devicePixelRatio, minDpr, maxDpr);

  return (
    <Canvas
      key={canvasKey}
      dpr={dpr}
      camera={{
        position: [0.8, props.isMobile ? 2.95 : 2.7, props.isMobile ? 8.2 : 7.4],
        fov: props.isMobile ? 47 : 42,
        near: 0.1,
        far: 120,
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
        gl.toneMappingExposure = 1.04;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = gl.domElement;
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
          reducedMotion={profile.reducedMotion}
          onQualityDecline={declineQuality}
        />
      </Suspense>
    </Canvas>
  );
}
