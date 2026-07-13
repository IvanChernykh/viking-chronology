import { Anchor, BookOpen, Compass, Headphones, History, Menu, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { DialoguePanel } from './components/DialoguePanel';
import { EncounterPanel } from './components/EncounterPanel';
import { ExpeditionHUD } from './components/ExpeditionHUD';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import { StoryPanel } from './components/StoryPanel';
import { Timeline } from './components/Timeline';
import type { VikingCharacter } from './data/dialogues';
import { defaultResources, expeditionChapters, type ExpeditionChoice, type ExpeditionMilestone, type ExpeditionResources } from './data/expeditions';
import { routes, timelineBounds } from './data/routes';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useVikingAudio } from './hooks/useVikingAudio';
import { canSpeakDialogue, speakReconstructedNorse, stopDialogueSpeech } from './lib/dialogueSpeech';
import type { RenderQuality, VikingStop } from './types';

const VikingScene = lazy(() => import('./components/VikingScene').then((module) => ({ default: module.VikingScene })));
type GameStage = 'planning' | 'voyage' | 'arrived';
function clampResource(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }

function App() {
  const isMobile = useMediaQuery('(max-width: 760px)');
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const [introOpen, setIntroOpen] = useState(true);
  const [selectedChapterId, setSelectedChapterId] = useState(expeditionChapters[0].id);
  const [stage, setStage] = useState<GameStage>('planning');
  const [voyageProgress, setVoyageProgress] = useState(0);
  const [resources, setResources] = useState<ExpeditionResources>(defaultResources);
  const [morale, setMorale] = useState(76);
  const [readyCrew, setReadyCrew] = useState<Set<string>>(new Set());
  const [handledMilestones, setHandledMilestones] = useState<Set<string>>(new Set());
  const [activeEncounter, setActiveEncounter] = useState<ExpeditionMilestone | null>(null);
  const [selectedStop, setSelectedStop] = useState<VikingStop | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<VikingCharacter | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [renderQuality] = useState<RenderQuality>('auto');
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [sceneResetKey, setSceneResetKey] = useState(0);
  const previousFrame = useRef<number | null>(null);
  const audio = useVikingAudio();
  const selectedChapter = useMemo(() => expeditionChapters.find((chapter) => chapter.id === selectedChapterId) ?? expeditionChapters[0], [selectedChapterId]);
  const activeRoute = useMemo(() => routes.find((route) => route.id === selectedChapter.routeId) ?? routes[0], [selectedChapter.routeId]);
  const timelineYear = useMemo(() => selectedChapter.startYear + (selectedChapter.endYear - selectedChapter.startYear) * voyageProgress, [selectedChapter, voyageProgress]);

  useEffect(() => { window.__vikingBootComplete?.(); }, []);
  useEffect(() => { audio.setScene(stage === 'voyage' ? (selectedChapter.routeId === 'eastern-rivers' ? 'river' : 'open-sea') : 'settlement'); }, [audio, selectedChapter.routeId, stage]);
  useEffect(() => {
    if (stage !== 'voyage' || activeEncounter) { previousFrame.current = null; return; }
    let frameId = 0;
    const tick = (timestamp: number) => {
      if (previousFrame.current === null) previousFrame.current = timestamp;
      const delta = document.hidden ? 0 : Math.min((timestamp - previousFrame.current) / 1000, 0.08);
      previousFrame.current = timestamp;
      setVoyageProgress((current) => Math.min(1, current + delta * (isMobile ? 0.018 : 0.022)));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeEncounter, isMobile, stage]);
  useEffect(() => {
    if (stage !== 'voyage') return;
    const nextMilestone = selectedChapter.milestones.find((milestone) => voyageProgress >= milestone.progress && !handledMilestones.has(milestone.id));
    if (nextMilestone && !activeEncounter) {
      const timer = window.setTimeout(() => { setActiveEncounter(nextMilestone); audio.playSelection(nextMilestone.year); }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [activeEncounter, audio, handledMilestones, selectedChapter.milestones, stage, voyageProgress]);
  useEffect(() => {
    if (stage === 'voyage' && voyageProgress >= 0.999) {
      const timer = window.setTimeout(() => { setStage('arrived'); setSelectedStop(activeRoute.stops[activeRoute.stops.length - 1] ?? null); audio.playSelection(selectedChapter.endYear); }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [activeRoute.stops, audio, selectedChapter.endYear, stage, voyageProgress]);
  useEffect(() => { audio.playTimelineTick(Math.round(timelineYear / 5) * 5); }, [audio, timelineYear]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedStop(null); setActiveCharacter(null); setActiveEncounter(null); setMobilePanelOpen(false); stopDialogueSpeech();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectChapter = (chapter: typeof selectedChapter) => {
    if (stage === 'voyage') return;
    setSelectedChapterId(chapter.id); setVoyageProgress(0); setSelectedStop(null); setHandledMilestones(new Set()); setActiveEncounter(null); setResources(defaultResources); setMorale(76);
  };
  const handleResourceChange = (key: keyof ExpeditionResources, value: number) => setResources((current) => ({ ...current, [key]: clampResource(value) }));
  const openDialogue = (character: VikingCharacter) => {
    setActiveCharacter(character); setDialogueIndex(0); setSelectedStop(null); setReadyCrew((current) => new Set(current).add(character.id));
    speakReconstructedNorse(character.lines[0].oldNorse); audio.playSelection(character.id.length * 79);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(10);
  };
  const advanceDialogue = () => {
    if (!activeCharacter) return;
    const next = (dialogueIndex + 1) % activeCharacter.lines.length; setDialogueIndex(next); speakReconstructedNorse(activeCharacter.lines[next].oldNorse);
  };
  const launch = () => {
    setStage('voyage'); setVoyageProgress(0.005); setSelectedStop(null); setActiveCharacter(null); setHandledMilestones(new Set()); setActiveEncounter(null); stopDialogueSpeech();
    audio.playSelection(selectedChapter.startYear); if (!audio.enabled) void audio.toggle();
  };
  const applyChoice = (choice: ExpeditionChoice) => {
    setResources((current) => ({ food: clampResource(current.food + (choice.effects.food ?? 0)), timber: clampResource(current.timber + (choice.effects.timber ?? 0)), sailcloth: clampResource(current.sailcloth + (choice.effects.sailcloth ?? 0)) }));
    setMorale((current) => clampResource(current + (choice.effects.morale ?? 0)));
    if (activeEncounter) setHandledMilestones((current) => new Set(current).add(activeEncounter.id));
    setActiveEncounter(null);
  };
  const returnToCouncil = () => { setStage('planning'); setVoyageProgress(0); setSelectedStop(null); setActiveEncounter(null); setResources(defaultResources); setMorale(76); };
  const handleSelectStop = (stop: VikingStop) => {
    setSelectedStop(stop); setActiveCharacter(null); stopDialogueSpeech(); audio.playSelection(stop.year + stop.name.length);
    if (isCoarsePointer && 'vibrate' in navigator) navigator.vibrate(12);
  };
  const navigateStory = (direction: -1 | 1) => {
    if (!selectedStop) return;
    const index = activeRoute.stops.findIndex((stop) => stop.id === selectedStop.id);
    handleSelectStop(activeRoute.stops[(index + direction + activeRoute.stops.length) % activeRoute.stops.length]);
  };

  return (
    <main className={`app-shell game-shell game-shell--${stage} ${introOpen ? 'game-shell--intro' : ''}`}>
      <div className="scene-layer">
        <SceneErrorBoundary resetKey={sceneResetKey} onRetry={() => setSceneResetKey((key) => key + 1)}>
          <Suspense fallback={<div className="scene-loading"><span /><strong>Строим исторический мир</strong><small>Фьорд, рельеф, судно и экспедиционный маршрут</small></div>}>
            <VikingScene key={sceneResetKey} routes={routes} activeRouteId={activeRoute.id} timelineYear={timelineYear} voyageProgress={voyageProgress} stage={stage} selectedStop={selectedStop} renderQuality={renderQuality} isMobile={isMobile} readyCharacters={readyCrew} onSelectStop={handleSelectStop} onSpeakCharacter={openDialogue} />
          </Suspense>
        </SceneErrorBoundary>
      </div>
      <header className="game-topbar">
        <div className="game-brand"><span className="game-brand__mark">ᚠ</span><div><span>Viking Chronology</span><small>Историческая экспедиция · 750–1021</small></div></div>
        <div className="game-topbar__center"><span><History size={14} /> {Math.round(timelineYear)}</span><strong>{selectedChapter.title}</strong><span><ShieldCheck size={14} /> мораль {morale}</span></div>
        <div className="game-topbar__actions"><button type="button" onClick={() => void audio.toggle()} aria-label="Переключить звук">{audio.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><button type="button" className="mobile-game-menu" onClick={() => setMobilePanelOpen((value) => !value)} aria-label="Открыть управление">{mobilePanelOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
      </header>
      <div className={`game-left-panel ${mobilePanelOpen ? 'game-left-panel--open' : ''}`}>
        <ExpeditionHUD chapters={expeditionChapters} selected={selectedChapter} resources={resources} morale={morale} readyCrew={readyCrew.size} stage={stage} voyageProgress={voyageProgress} onSelect={selectChapter} onResourceChange={handleResourceChange} onLaunch={launch} onReturn={returnToCouncil} />
      </div>
      <div className="game-timeline-wrap"><Timeline minYear={timelineBounds.min} maxYear={timelineBounds.max} year={timelineYear} playing={stage === 'voyage'} playbackSpeed={1} onYearChange={() => undefined} onTogglePlaying={() => undefined} onReset={returnToCouncil} onPlaybackSpeedChange={() => undefined} /></div>
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
