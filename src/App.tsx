import {
  Clock3,
  Compass,
  Headphones,
  Info,
  Map,
  Menu,
  Network,
  Users,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { DialoguePanel } from './components/DialoguePanel';
import { ExpeditionHUD, type ExpeditionPhase } from './components/ExpeditionHUD';
import { StoryPanel } from './components/StoryPanel';
import { Timeline } from './components/Timeline';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import type { VikingCharacter } from './data/dialogues';
import { expeditionChapters, initialSupplies, type ExpeditionId, type ExpeditionSupplies } from './data/expeditions';
import { allStops, routes, timelineBounds } from './data/routes';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useVikingAudio } from './hooks/useVikingAudio';
import type { AudioScene } from './lib/audioEngine';
import { canSpeakDialogue, speakReconstructedNorse, stopDialogueSpeech } from './lib/dialogueSpeech';
import type { RenderQuality, VikingStop } from './types';

const VikingScene = lazy(() =>
  import('./components/VikingScene').then((module) => ({ default: module.VikingScene })),
);

const medievalRoutePalette: Record<string, { color: string; accent: string }> = {
  'north-atlantic': { color: '#d4b36c', accent: '#f0dfb0' },
  'western-europe': { color: '#a94b35', accent: '#d99b86' },
  'eastern-rivers': { color: '#6f8d77', accent: '#b4c7b2' },
};

const displayRoutes = routes.map((route) => ({
  ...route,
  ...(medievalRoutePalette[route.id] ?? {}),
}));

function resolveAudioScene(stop: VikingStop | null, routeId: string): AudioScene {
  if (routeId === 'eastern-rivers') return 'river';
  if (stop?.kind === 'settlement' || stop?.kind === 'court' || stop?.kind === 'homeland') {
    return 'settlement';
  }
  if (stop?.kind === 'raid' || stop?.kind === 'trade') return 'coast';
  return 'open-sea';
}

function App() {
  const isMobile = useMediaQuery('(max-width: 760px)');
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const [activeRouteId, setActiveRouteId] = useState('all');
  const [timelineYear, setTimelineYear] = useState(timelineBounds.min);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [shipSpeed, setShipSpeed] = useState(1);
  const [shipsEnabled, setShipsEnabled] = useState(true);
  const [renderQuality, setRenderQuality] = useState<RenderQuality>('auto');
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<VikingStop | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<VikingCharacter | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<ExpeditionId>('western-europe');
  const [expeditionPhase, setExpeditionPhase] = useState<ExpeditionPhase>('planning');
  const [supplies, setSupplies] = useState<ExpeditionSupplies>(initialSupplies);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [spokenCharacterIds, setSpokenCharacterIds] = useState<Set<string>>(() => new Set());
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const previousFrame = useRef<number | null>(null);
  const timelineAccumulator = useRef(0);
  const lastTimelineCommit = useRef(0);
  const lastTickYear = useRef<number | null>(null);
  const audio = useVikingAudio();

  useEffect(() => {
    window.__vikingBootComplete?.();
  }, []);

  const selectedRoute = useMemo(
    () => displayRoutes.find((route) => route.stops.some((stop) => stop.id === selectedStop?.id)) ?? displayRoutes[0],
    [selectedStop],
  );

  const selectedExpedition = useMemo(
    () => expeditionChapters.find((chapter) => chapter.id === selectedExpeditionId) ?? expeditionChapters[0],
    [selectedExpeditionId],
  );

  const visibleStops = useMemo(
    () =>
      allStops.filter(
        (stop) =>
          stop.year <= timelineYear && (activeRouteId === 'all' || stop.routeId === activeRouteId),
      ).length,
    [activeRouteId, timelineYear],
  );

  useEffect(() => {
    audio.setScene(resolveAudioScene(selectedStop, activeRouteId));
  }, [activeRouteId, audio, selectedStop]);

  useEffect(() => {
    const rounded = Math.round(timelineYear / 5) * 5;
    if (rounded !== lastTickYear.current) {
      audio.playTimelineTick(rounded);
      lastTickYear.current = rounded;
    }
  }, [audio, timelineYear]);

  useEffect(() => {
    if (!playing) {
      previousFrame.current = null;
      timelineAccumulator.current = 0;
      lastTimelineCommit.current = 0;
      return;
    }

    let frameId = 0;
    const commitInterval = isMobile ? 90 : 50;
    const tick = (timestamp: number) => {
      if (previousFrame.current === null) previousFrame.current = timestamp;
      const deltaSeconds = document.hidden
        ? 0
        : Math.min((timestamp - previousFrame.current) / 1000, 0.08);
      previousFrame.current = timestamp;
      timelineAccumulator.current += deltaSeconds * 11 * playbackSpeed;

      if (timestamp - lastTimelineCommit.current >= commitInterval && timelineAccumulator.current > 0) {
        const increment = timelineAccumulator.current;
        timelineAccumulator.current = 0;
        lastTimelineCommit.current = timestamp;
        setTimelineYear((currentYear) => {
          const next = currentYear + increment;
          if (next >= timelineBounds.max) {
            setPlaying(false);
            return timelineBounds.max;
          }
          return next;
        });
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isMobile, playing, playbackSpeed]);

  useEffect(() => {
    if (expeditionPhase !== 'voyage') return;
    let frameId = 0;
    let previous: number | null = null;
    let progress = journeyProgress;
    let lastCommit = 0;
    const durationSeconds = 42 / Math.max(0.65, shipSpeed);
    const commitInterval = isMobile ? 80 : 42;
    const animate = (timestamp: number) => {
      if (previous === null) previous = timestamp;
      const delta = document.hidden ? 0 : Math.min((timestamp - previous) / 1000, 0.08);
      previous = timestamp;
      progress = Math.min(1, progress + delta / durationSeconds);
      if (timestamp - lastCommit >= commitInterval || progress >= 1) {
        lastCommit = timestamp;
        const year = selectedExpedition.departureYear + (selectedExpedition.arrivalYear - selectedExpedition.departureYear) * progress;
        setJourneyProgress(progress);
        setTimelineYear(year);
        if (progress >= 1) {
          setExpeditionPhase('arrived');
          const route = displayRoutes.find((item) => item.id === selectedExpedition.routeId);
          if (route) setSelectedStop(route.stops[route.stops.length - 1]);
          return;
        }
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [expeditionPhase, isMobile, journeyProgress, selectedExpedition, shipSpeed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedStop(null);
        setActiveCharacter(null);
        stopDialogueSpeech();
        setControlsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectStop = (stop: VikingStop) => {
    setActiveCharacter(null);
    stopDialogueSpeech();
    setSelectedStop(stop);
    setTimelineYear((current) => Math.max(current, stop.year));
    setPlaying(false);
    setControlsOpen(false);
    audio.playSelection(stop.year + stop.name.length);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(12);
  };

  const handleSpeakCharacter = (character: VikingCharacter) => {
    setSelectedStop(null);
    setActiveCharacter(character);
    setDialogueIndex(0);
    setPlaying(false);
    setControlsOpen(false);
    setSpokenCharacterIds((current) => {
      const next = new Set(current);
      next.add(character.id);
      return next;
    });
    speakReconstructedNorse(character.lines[0].oldNorse);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(10);
  };

  const advanceDialogue = () => {
    if (!activeCharacter) return;
    const nextIndex = (dialogueIndex + 1) % activeCharacter.lines.length;
    setDialogueIndex(nextIndex);
    speakReconstructedNorse(activeCharacter.lines[nextIndex].oldNorse);
  };

  const closeDialogue = () => {
    setActiveCharacter(null);
    stopDialogueSpeech();
  };

  const handleRouteChange = (routeId: string) => {
    setActiveRouteId(routeId);
    setControlsOpen(false);
    if (routeId !== 'all') {
      const route = displayRoutes.find((item) => item.id === routeId);
      if (route) {
        const availableStops = route.stops.filter((stop) => stop.year <= timelineYear);
        setSelectedStop(availableStops[availableStops.length - 1] ?? route.stops[0]);
      }
    }
  };

  const selectExpedition = (id: ExpeditionId) => {
    if (expeditionPhase === 'voyage') return;
    setSelectedExpeditionId(id);
    setActiveRouteId(id);
    const chapter = expeditionChapters.find((item) => item.id === id);
    if (chapter) setTimelineYear(Math.max(timelineBounds.min, chapter.departureYear - 12));
    setSelectedStop(null);
    closeDialogue();
  };

  const supplyExpedition = (resource: keyof ExpeditionSupplies) => {
    if (expeditionPhase !== 'planning') return;
    setSupplies((current) => ({ ...current, [resource]: Math.min(100, current[resource] + 9) }));
    audio.playSelection(resource.length * 11);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(8);
  };

  const launchExpedition = () => {
    const requirementsMet = Object.entries(selectedExpedition.requirements).every(
      ([key, value]) => supplies[key as keyof ExpeditionSupplies] >= value,
    );
    if (!requirementsMet || spokenCharacterIds.size < 2) return;
    setSelectedStop(null);
    closeDialogue();
    setPlaying(false);
    setActiveRouteId(selectedExpedition.routeId);
    setTimelineYear(selectedExpedition.departureYear);
    setJourneyProgress(0);
    setExpeditionPhase('voyage');
    if (!audio.enabled) void audio.toggle();
  };

  const returnToVillage = () => {
    setExpeditionPhase('planning');
    setJourneyProgress(0);
    setTimelineYear(timelineBounds.min);
    setSelectedStop(null);
    setActiveRouteId('all');
  };

  const navigateStory = (direction: -1 | 1) => {
    if (!selectedStop) return;
    const stops = selectedRoute.stops;
    const index = stops.findIndex((stop) => stop.id === selectedStop.id);
    const nextIndex = (index + direction + stops.length) % stops.length;
    handleSelectStop(stops[nextIndex]);
  };

  const togglePlaying = () => {
    if (!playing && timelineYear >= timelineBounds.max - 0.5) {
      setTimelineYear(timelineBounds.min);
      setSelectedStop(null);
    }
    setPlaying((value) => !value);
  };

  return (
    <main className={`app-shell ${selectedStop ? 'app-shell--story-open' : ''} ${activeCharacter ? 'app-shell--dialogue-open' : ''}`}>
      <div className="ornament ornament--top" aria-hidden="true">ᚠ ᚢ ᚦ ᚬ ᚱ ᚴ ᚼ ᚾ ᛁ ᛅ ᛋ ᛏ ᛒ ᛘ ᛚ ᛦ</div>
      <div className="scene-layer">
        <SceneErrorBoundary
          resetKey={sceneResetKey}
          onRetry={() => setSceneResetKey((key) => key + 1)}
        >
          <Suspense
            fallback={
              <div className="scene-loading" role="status">
                <span aria-hidden="true" />
                <strong>Подготовка 3D-мира</strong>
                <small>Рельеф, поселение, персонажи и исторические маршруты</small>
              </div>
            }
          >
            <VikingScene
              key={sceneResetKey}
              routes={displayRoutes}
              activeRouteId={activeRouteId}
              timelineYear={timelineYear}
              selectedStop={selectedStop}
              shipsEnabled={shipsEnabled}
              shipSpeed={shipSpeed}
              renderQuality={renderQuality}
              isMobile={isMobile}
              journeyRouteId={expeditionPhase === 'voyage' || expeditionPhase === 'arrived' ? selectedExpedition.routeId : null}
              journeyProgress={journeyProgress}
              onSelectStop={handleSelectStop}
              onSpeakCharacter={handleSpeakCharacter}
            />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      <div className="world-mode-chip glass-panel" aria-label="Режим трёхмерного мира">
        <Map size={15} />
        <div><strong>Живая историческая экспедиция</strong><span>перетащите мир · сведите пальцы для масштаба</span></div>
        <Users size={15} />
      </div>

      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          <span>ᚱ</span>
        </div>
        <div className="brand-copy">
          <span className="eyebrow">Исторический атлас VIII–XI веков</span>
          <h1>Пути северных мореходов</h1>
          <span className="brand-subtitle">Маршруты, торговля, поселения и источники</span>
        </div>
        <div className="header-metrics">
          <div><Network size={15} /><span><strong>{displayRoutes.length}</strong> направления</span></div>
          <div><Clock3 size={15} /><span><strong>{Math.round(timelineYear)}</strong> год</span></div>
          <div><Compass size={15} /><span><strong>{visibleStops}</strong> точек</span></div>
        </div>
        <button
          type="button"
          className={`header-audio-button icon-button ${audio.enabled ? 'header-audio-button--active' : ''}`}
          onClick={() => void audio.toggle()}
          aria-label={audio.enabled ? 'Выключить звук' : 'Включить звуковую реконструкцию'}
          title={audio.enabled ? 'Выключить звук' : 'Включить звуковую реконструкцию'}
        >
          {audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          type="button"
          className="mobile-menu-button icon-button"
          onClick={() => setControlsOpen((open) => !open)}
          aria-label="Открыть настройки"
          aria-expanded={controlsOpen}
        >
          {controlsOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {controlsOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Закрыть настройки"
          onClick={() => setControlsOpen(false)}
        />
      )}

      <ExpeditionHUD
        selectedId={selectedExpeditionId}
        supplies={supplies}
        phase={expeditionPhase}
        progress={journeyProgress}
        spokenCharacters={spokenCharacterIds.size}
        onSelect={selectExpedition}
        onSupply={supplyExpedition}
        onLaunch={launchExpedition}
        onReturn={returnToVillage}
      />

      <div className={`control-panel-wrap ${controlsOpen ? 'control-panel-wrap--open' : ''}`}>
        <ControlPanel
          routes={displayRoutes}
          activeRouteId={activeRouteId}
          shipsEnabled={shipsEnabled}
          shipSpeed={shipSpeed}
          renderQuality={renderQuality}
          audioSupported={audio.supported}
          audioEnabled={audio.enabled}
          ambienceEnabled={audio.ambienceEnabled}
          musicEnabled={audio.musicEnabled}
          masterVolume={audio.masterVolume}
          ambienceVolume={audio.ambienceVolume}
          musicVolume={audio.musicVolume}
          onRouteChange={handleRouteChange}
          onShipsChange={setShipsEnabled}
          onShipSpeedChange={setShipSpeed}
          onRenderQualityChange={setRenderQuality}
          onAudioToggle={audio.toggle}
          onAmbienceChange={audio.setAmbienceEnabled}
          onMusicChange={audio.setMusicEnabled}
          onMasterVolumeChange={audio.setMasterVolume}
          onAmbienceVolumeChange={audio.setAmbienceVolume}
          onMusicVolumeChange={audio.setMusicVolume}
        />
      </div>

      <section className={`method-note glass-panel ${expeditionPhase !== 'planning' ? 'method-note--hidden' : ''}`}>
        <ShieldCheck size={17} />
        <div>
          <strong>Историческая дисциплина</strong>
          <p>
            Мир раскрывается по датам и источникам. Реплики персонажей — маркированная языковая реконструкция,
            а маршруты проходят по поверхности воды и суши без «летающих» кораблей.
          </p>
        </div>
      </section>

      {!audio.enabled && audio.supported && !controlsOpen && (
        <button type="button" className="sound-invitation" onClick={() => void audio.toggle()}>
          <Headphones size={17} />
          <span><strong>Включить звуковую среду</strong><small>ветер, море, дерево и инструментальная реконструкция</small></span>
        </button>
      )}

      {activeCharacter && (
        <DialoguePanel
          character={activeCharacter}
          lineIndex={dialogueIndex}
          speechSupported={canSpeakDialogue()}
          onSpeak={() => speakReconstructedNorse(activeCharacter.lines[dialogueIndex].oldNorse)}
          onNext={advanceDialogue}
          onClose={closeDialogue}
        />
      )}

      {selectedStop && (
        <StoryPanel
          key={selectedStop.id}
          stop={selectedStop}
          route={selectedRoute}
          onClose={() => setSelectedStop(null)}
          onPrevious={() => navigateStory(-1)}
          onNext={() => navigateStory(1)}
        />
      )}

      <Timeline
        minYear={timelineBounds.min}
        maxYear={timelineBounds.max}
        year={timelineYear}
        playing={playing}
        playbackSpeed={playbackSpeed}
        onYearChange={(year) => {
          if (expeditionPhase === 'voyage') return;
          setTimelineYear(year);
          setPlaying(false);
        }}
        onTogglePlaying={togglePlaying}
        onReset={() => {
          setTimelineYear(timelineBounds.min);
          setPlaying(false);
          setSelectedStop(null);
          setExpeditionPhase('planning');
          setJourneyProgress(0);
          closeDialogue();
        }}
        onPlaybackSpeedChange={setPlaybackSpeed}
      />

      <div className="historical-disclaimer" role="note">
        <Info size={13} />
        <span>Звук и визуальная среда — исследовательская реконструкция, а не запись прошлого.</span>
      </div>
    </main>
  );
}

export default App;
