import { Anchor, BookOpen, Compass, Headphones, History, Menu, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DialoguePanel } from './components/DialoguePanel';
import { EncounterPanel } from './components/EncounterPanel';
import { ExpeditionHUD } from './components/ExpeditionHUD';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import { StoryPanel } from './components/StoryPanel';
import { Timeline } from './components/Timeline';
import type { VikingCharacter } from './data/dialogues';
import { expeditionChapters, type ExpeditionChoice, type ExpeditionResources } from './data/expeditions';
import { routes, timelineBounds } from './data/routes';
import { deriveEnvironmentSnapshot } from './game/environment/environmentModel';
import { expeditionReducer } from './game/simulation/expeditionState';
import { loadExpeditionState, saveExpeditionState } from './game/simulation/saveGame';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useVikingAudio } from './hooks/useVikingAudio';
import { canSpeakDialogue, speakReconstructedNorse, stopDialogueSpeech } from './lib/dialogueSpeech';
import type { RenderQuality, VikingStop } from './types';

const VikingScene = lazy(() => import('./components/VikingScene').then((module) => ({ default: module.VikingScene })));

function App() {
  const isMobile = useMediaQuery('(max-width: 760px)');
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const [simulation, dispatchSimulation] = useReducer(
    expeditionReducer,
    expeditionChapters[0].id,
    loadExpeditionState,
  );
  const [introOpen, setIntroOpen] = useState(true);
  const [selectedStop, setSelectedStop] = useState<VikingStop | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<VikingCharacter | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [renderQuality] = useState<RenderQuality>('auto');
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const previousFrame = useRef<number | null>(null);
  const simulationAccumulator = useRef(0);
  const simulationRef = useRef(simulation);
  const audio = useVikingAudio();

  const selectedChapter = useMemo(
    () => expeditionChapters.find((chapter) => chapter.id === simulation.selectedChapterId) ?? expeditionChapters[0],
    [simulation.selectedChapterId],
  );
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === selectedChapter.routeId) ?? routes[0],
    [selectedChapter.routeId],
  );
  const activeEncounter = useMemo(
    () => selectedChapter.milestones.find((milestone) => milestone.id === simulation.activeEncounterId) ?? null,
    [selectedChapter.milestones, simulation.activeEncounterId],
  );
  const readyCrew = useMemo(() => new Set(simulation.readyCrewIds), [simulation.readyCrewIds]);
  const timelineYear = useMemo(
    () => selectedChapter.startYear + (selectedChapter.endYear - selectedChapter.startYear) * simulation.progress,
    [selectedChapter, simulation.progress],
  );
  const environment = useMemo(
    () => deriveEnvironmentSnapshot({
      chapterId: selectedChapter.id,
      stage: simulation.stage,
      progress: simulation.progress,
      year: timelineYear,
    }),
    [selectedChapter.id, simulation.progress, simulation.stage, timelineYear],
  );

  useEffect(() => {
    window.__vikingBootComplete?.();
  }, []);

  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);

  useEffect(() => {
    const intervalId = window.setInterval(() => saveExpeditionState(simulationRef.current), 1500);
    return () => {
      window.clearInterval(intervalId);
      saveExpeditionState(simulationRef.current);
    };
  }, []);

  useEffect(() => {
    saveExpeditionState(simulation);
  }, [simulation.activeEncounterId, simulation.selectedChapterId, simulation.stage]);

  useEffect(() => {
    audio.setScene(
      simulation.stage === 'voyage'
        ? (selectedChapter.routeId === 'eastern-rivers' ? 'river' : 'open-sea')
        : 'settlement',
    );
  }, [audio, selectedChapter.routeId, simulation.stage]);

  useEffect(() => {
    if (simulation.stage !== 'voyage' || simulation.activeEncounterId) {
      previousFrame.current = null;
      simulationAccumulator.current = 0;
      return;
    }

    let frameId = 0;
    const tick = (timestamp: number) => {
      if (previousFrame.current === null) previousFrame.current = timestamp;
      const delta = document.hidden ? 0 : Math.min((timestamp - previousFrame.current) / 1000, 0.08);
      previousFrame.current = timestamp;
      simulationAccumulator.current += delta;

      if (simulationAccumulator.current >= 0.18) {
        dispatchSimulation({
          type: 'advance',
          deltaSeconds: simulationAccumulator.current * (isMobile ? 0.9 : 1),
          chapter: selectedChapter,
          environment,
        });
        simulationAccumulator.current = 0;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [environment, isMobile, selectedChapter, simulation.activeEncounterId, simulation.stage]);

  useEffect(() => {
    if (!activeEncounter) return;
    audio.playSelection(activeEncounter.year);
  }, [activeEncounter, audio]);

  useEffect(() => {
    if (simulation.stage !== 'arrived' || selectedStop) return;
    setSelectedStop(activeRoute.stops[activeRoute.stops.length - 1] ?? null);
    audio.playSelection(selectedChapter.endYear);
  }, [activeRoute.stops, audio, selectedChapter.endYear, selectedStop, simulation.stage]);

  useEffect(() => {
    audio.playTimelineTick(Math.round(timelineYear / 5) * 5);
  }, [audio, timelineYear]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedStop(null);
      setActiveCharacter(null);
      setMobilePanelOpen(false);
      stopDialogueSpeech();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectChapter = (chapter: typeof selectedChapter) => {
    if (simulation.stage === 'voyage') return;
    dispatchSimulation({ type: 'selectChapter', chapterId: chapter.id });
    setSelectedStop(null);
    setActiveCharacter(null);
  };

  const handleResourceChange = (key: keyof ExpeditionResources, value: number) => {
    dispatchSimulation({ type: 'adjustResource', key, value });
  };

  const openDialogue = (character: VikingCharacter) => {
    setActiveCharacter(character);
    setDialogueIndex(0);
    setSelectedStop(null);
    dispatchSimulation({ type: 'markCrewReady', crewId: character.id });
    speakReconstructedNorse(character.lines[0].oldNorse);
    audio.playSelection(character.id.length * 79);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(10);
  };

  const advanceDialogue = () => {
    if (!activeCharacter) return;
    const next = (dialogueIndex + 1) % activeCharacter.lines.length;
    setDialogueIndex(next);
    speakReconstructedNorse(activeCharacter.lines[next].oldNorse);
  };

  const launch = () => {
    dispatchSimulation({ type: 'launch', chapter: selectedChapter });
    setSelectedStop(null);
    setActiveCharacter(null);
    stopDialogueSpeech();
    audio.playSelection(selectedChapter.startYear);
    if (!audio.enabled) void audio.toggle();
  };

  const applyChoice = (choice: ExpeditionChoice) => {
    if (!activeEncounter) return;
    dispatchSimulation({ type: 'resolveEncounter', milestone: activeEncounter, choice });
  };

  const returnToCouncil = () => {
    dispatchSimulation({ type: 'returnToCouncil' });
    setSelectedStop(null);
    setActiveCharacter(null);
  };

  const handleSelectStop = (stop: VikingStop) => {
    setSelectedStop(stop);
    setActiveCharacter(null);
    stopDialogueSpeech();
    audio.playSelection(stop.year + stop.name.length);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(12);
  };

  const navigateStory = (direction: -1 | 1) => {
    if (!selectedStop) return;
    const index = activeRoute.stops.findIndex((stop) => stop.id === selectedStop.id);
    handleSelectStop(activeRoute.stops[(index + direction + activeRoute.stops.length) % activeRoute.stops.length]);
  };

  return (
    <main className={`app-shell game-shell game-shell--${simulation.stage} ${introOpen ? 'game-shell--intro' : ''}`}>
      <div className="scene-layer">
        <SceneErrorBoundary resetKey={sceneResetKey} onRetry={() => setSceneResetKey((key) => key + 1)}>
          <Suspense fallback={<div className="scene-loading"><span /><strong>Строим исторический мир</strong><small>Фьорд, рельеф, судно и экспедиционный маршрут</small></div>}>
            <VikingScene
              key={sceneResetKey}
              routes={routes}
              activeRouteId={activeRoute.id}
              timelineYear={timelineYear}
              voyageProgress={simulation.progress}
              stage={simulation.stage}
              selectedStop={selectedStop}
              renderQuality={renderQuality}
              isMobile={isMobile}
              readyCharacters={readyCrew}
              environment={environment}
              onSelectStop={handleSelectStop}
              onSpeakCharacter={openDialogue}
            />
          </Suspense>
        </SceneErrorBoundary>
      </div>
      <header className="game-topbar">
        <div className="game-brand"><span className="game-brand__mark">ᚠ</span><div><span>Viking Chronology</span><small>Историческая экспедиция · 750–1021</small></div></div>
        <div className="game-topbar__center">
          <span><History size={14} /> {Math.round(timelineYear)} · {environment.seasonLabel}</span>
          <strong>{selectedChapter.title}</strong>
          <span title={`${environment.weatherLabel}, ${environment.temperatureC} °C`}><ShieldCheck size={14} /> мораль {Math.round(simulation.crew.morale)} · корпус {Math.round(simulation.ship.hull)}</span>
        </div>
        <div className="game-topbar__actions"><button type="button" onClick={() => void audio.toggle()} aria-label="Переключить звук">{audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><button type="button" className="mobile-game-menu" onClick={() => setMobilePanelOpen((value) => !value)} aria-label="Открыть управление">{mobilePanelOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
      </header>
      <div className={`game-left-panel ${mobilePanelOpen ? 'game-left-panel--open' : ''}`}>
        <ExpeditionHUD
          chapters={expeditionChapters}
          selected={selectedChapter}
          simulation={simulation}
          onSelect={selectChapter}
          onResourceChange={handleResourceChange}
          onLaunch={launch}
          onReturn={returnToCouncil}
        />
      </div>
      <div className="game-timeline-wrap"><Timeline minYear={timelineBounds.min} maxYear={timelineBounds.max} year={timelineYear} playing={simulation.stage === 'voyage'} playbackSpeed={1} onYearChange={() => undefined} onTogglePlaying={() => undefined} onReset={returnToCouncil} onPlaybackSpeedChange={() => undefined} /></div>
      {selectedStop && <StoryPanel stop={selectedStop} route={activeRoute} onClose={() => setSelectedStop(null)} onPrevious={() => navigateStory(-1)} onNext={() => navigateStory(1)} />}
      {activeCharacter && <DialoguePanel character={activeCharacter} lineIndex={dialogueIndex} speechSupported={canSpeakDialogue()} onSpeak={() => speakReconstructedNorse(activeCharacter.lines[dialogueIndex].oldNorse)} onNext={advanceDialogue} onClose={() => { setActiveCharacter(null); stopDialogueSpeech(); }} />}
      {activeEncounter && <EncounterPanel milestone={activeEncounter} onChoose={applyChoice} />}
      {!audio.enabled && !introOpen && <button type="button" className="sound-invitation" onClick={() => void audio.toggle()}><Headphones size={18} /><span><strong>Включить звуковой мир</strong><small>море, дерево, ветер и музыкальная реконструкция</small></span></button>}
      <div className="historical-ribbon"><BookOpen size={13} /> Реконструкция отделена от подтверждённых фактов и снабжена источниками</div>
      {introOpen && <section className="cinematic-intro"><div className="cinematic-intro__veil" /><div className="cinematic-intro__content"><span className="cinematic-intro__runes">ᚠ ᚢ ᚦ ᚬ ᚱ ᚴ ᚼ ᚾ ᛁ ᛅ ᛋ</span><p className="eyebrow">Историческая 3D-игра-хронология</p><h1>Пути северных мореходов</h1><p className="cinematic-intro__lead">Начните во фьорде. Соберите совет. Подготовьте корабль. Пройдите исторический коридор и отделите свидетельства от реконструкции.</p><div className="cinematic-intro__facts"><span><Compass size={16} /> 3 экспедиции</span><span><Anchor size={16} /> 19 исторических точек</span><span><ShieldCheck size={16} /> русские субтитры</span></div><button type="button" onClick={() => { setIntroOpen(false); if (!audio.enabled) void audio.toggle(); }}><span>Войти в хронику</span><Compass size={19} /></button><small>Лучший опыт: наушники · WebGL 2 · горизонтальная ориентация на телефоне</small></div></section>}
    </main>
  );
}

export default App;
