import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VikingAudioEngine, type AudioScene } from '../lib/audioEngine';

export interface VikingAudioControls {
  supported: boolean;
  enabled: boolean;
  ambienceEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
  ambienceVolume: number;
  musicVolume: number;
  toggle: () => Promise<void>;
  setAmbienceEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMasterVolume: (value: number) => void;
  setAmbienceVolume: (value: number) => void;
  setMusicVolume: (value: number) => void;
  setScene: (scene: AudioScene) => void;
  playSelection: (seed: number) => void;
  playTimelineTick: (year: number) => void;
}

export function useVikingAudio(): VikingAudioControls {
  const engineRef = useRef<VikingAudioEngine | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ambienceEnabled, setAmbienceState] = useState(true);
  const [musicEnabled, setMusicState] = useState(true);
  const [masterVolume, setMasterState] = useState(0.72);
  const [ambienceVolume, setAmbienceVolumeState] = useState(0.78);
  const [musicVolume, setMusicVolumeState] = useState(0.46);
  const supported = VikingAudioEngine.isSupported();

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new VikingAudioEngine();
    return engineRef.current;
  }, []);

  useEffect(() => () => engineRef.current?.destroy(), []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    const engine = getEngine();
    if (next) await engine.start();
    engine.setEnabled(next);
    setEnabled(next);
  }, [enabled, getEngine]);

  const setAmbienceEnabled = useCallback(
    (next: boolean) => {
      setAmbienceState(next);
      getEngine().setAmbienceEnabled(next);
    },
    [getEngine],
  );

  const setMusicEnabled = useCallback(
    (next: boolean) => {
      setMusicState(next);
      getEngine().setMusicEnabled(next);
    },
    [getEngine],
  );

  const updateMasterVolume = useCallback(
    (next: number) => {
      setMasterState(next);
      getEngine().setMasterVolume(next);
    },
    [getEngine],
  );

  const updateAmbienceVolume = useCallback(
    (next: number) => {
      setAmbienceVolumeState(next);
      getEngine().setAmbienceVolume(next);
    },
    [getEngine],
  );

  const updateMusicVolume = useCallback(
    (next: number) => {
      setMusicVolumeState(next);
      getEngine().setMusicVolume(next);
    },
    [getEngine],
  );

  const setScene = useCallback((scene: AudioScene) => getEngine().setScene(scene), [getEngine]);
  const playSelection = useCallback((seed: number) => getEngine().playSelection(seed), [getEngine]);
  const playTimelineTick = useCallback(
    (year: number) => getEngine().playTimelineTick(year),
    [getEngine],
  );

  return useMemo(
    () => ({
      supported,
      enabled,
      ambienceEnabled,
      musicEnabled,
      masterVolume,
      ambienceVolume,
      musicVolume,
      toggle,
      setAmbienceEnabled,
      setMusicEnabled,
      setMasterVolume: updateMasterVolume,
      setAmbienceVolume: updateAmbienceVolume,
      setMusicVolume: updateMusicVolume,
      setScene,
      playSelection,
      playTimelineTick,
    }),
    [
      ambienceEnabled,
      ambienceVolume,
      enabled,
      masterVolume,
      musicEnabled,
      musicVolume,
      playSelection,
      playTimelineTick,
      setAmbienceEnabled,
      setMusicEnabled,
      setScene,
      supported,
      toggle,
      updateAmbienceVolume,
      updateMasterVolume,
      updateMusicVolume,
    ],
  );
}
