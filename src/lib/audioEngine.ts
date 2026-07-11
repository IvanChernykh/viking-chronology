export type AudioScene = 'open-sea' | 'coast' | 'river' | 'settlement';

interface AudioMix {
  master: number;
  ambience: number;
  music: number;
}

const DEFAULT_MIX: AudioMix = {
  master: 0.72,
  ambience: 0.78,
  music: 0.46,
};

function makeNoiseBuffer(context: AudioContext, seconds = 3): AudioBuffer {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const channel = buffer.getChannelData(0);
  let previous = 0;

  for (let index = 0; index < channel.length; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * 0.985 + white * 0.015;
    channel[index] = white * 0.56 + previous * 0.44;
  }

  return buffer;
}

function makeImpulse(context: AudioContext, seconds = 2.2): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channelIndex = 0; channelIndex < impulse.numberOfChannels; channelIndex += 1) {
    const channel = impulse.getChannelData(channelIndex);
    for (let index = 0; index < length; index += 1) {
      const decay = Math.pow(1 - index / length, 2.8);
      channel[index] = (Math.random() * 2 - 1) * decay;
    }
  }

  return impulse;
}

function setGainSmoothly(node: GainNode | null, value: number, context: AudioContext | null): void {
  if (!node || !context) return;
  const now = context.currentTime;
  node.gain.cancelScheduledValues(now);
  node.gain.setTargetAtTime(value, now, 0.22);
}

export class VikingAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private riverGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private activeSources: AudioScheduledSourceNode[] = [];
  private intervals: number[] = [];
  private scene: AudioScene = 'open-sea';
  private enabled = false;
  private ambienceEnabled = true;
  private musicEnabled = true;
  private mix: AudioMix = { ...DEFAULT_MIX };
  private phraseIndex = 0;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined';
  }

  async start(): Promise<void> {
    if (!VikingAudioEngine.isSupported()) return;

    if (!this.context) {
      this.createGraph();
    }

    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }

    this.enabled = true;
    this.applyMix();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.applyMix();
  }

  setAmbienceEnabled(enabled: boolean): void {
    this.ambienceEnabled = enabled;
    this.applyMix();
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.applyMix();
  }

  setMasterVolume(value: number): void {
    this.mix.master = Math.max(0, Math.min(1, value));
    this.applyMix();
  }

  setAmbienceVolume(value: number): void {
    this.mix.ambience = Math.max(0, Math.min(1, value));
    this.applyMix();
  }

  setMusicVolume(value: number): void {
    this.mix.music = Math.max(0, Math.min(1, value));
    this.applyMix();
  }

  setScene(scene: AudioScene): void {
    this.scene = scene;
    this.applySceneMix();
  }

  playSelection(seed: number): void {
    if (!this.enabled || !this.context || !this.effectsGain) return;
    const scale = [146.83, 164.81, 196, 220, 246.94, 293.66];
    const frequency = scale[Math.abs(seed) % scale.length];
    this.playPluck(frequency, this.context.currentTime, 0.24, this.effectsGain);
    window.setTimeout(() => this.playWoodTap(seed), 70);
  }

  playTimelineTick(year: number): void {
    if (!this.enabled || !this.context || !this.effectsGain) return;
    if (year % 25 !== 0) return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 92 + (year % 100) * 0.35;
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.032, this.context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.18);
    oscillator.connect(gain).connect(this.effectsGain);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.2);
  }

  destroy(): void {
    this.intervals.forEach((interval) => window.clearInterval(interval));
    this.intervals = [];
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Source may already have stopped.
      }
    });
    this.activeSources = [];
    void this.context?.close();
    this.context = null;
  }

  private createGraph(): void {
    const context = new AudioContext({ latencyHint: 'interactive' });
    this.context = context;
    this.noiseBuffer = makeNoiseBuffer(context);

    this.masterGain = context.createGain();
    this.ambienceGain = context.createGain();
    this.musicGain = context.createGain();
    this.effectsGain = context.createGain();
    this.windGain = context.createGain();
    this.waterGain = context.createGain();
    this.riverGain = context.createGain();
    this.droneGain = context.createGain();
    this.reverb = context.createConvolver();
    this.reverb.buffer = makeImpulse(context);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 18;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.32;

    this.ambienceGain.connect(this.masterGain);
    this.musicGain.connect(this.reverb).connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.effectsGain.connect(this.reverb).connect(this.masterGain);
    this.effectsGain.connect(this.masterGain);
    this.masterGain.connect(compressor).connect(context.destination);

    this.createWindBed();
    this.createWaterBed();
    this.createRiverBed();
    this.createDrone();
    this.startSchedulers();
    this.applySceneMix();
    this.applyMix();
  }

  private createLoopingNoise(
    filterType: BiquadFilterType,
    frequency: number,
    q: number,
    target: GainNode,
  ): AudioBufferSourceNode | null {
    if (!this.context || !this.noiseBuffer || !this.ambienceGain) return null;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    source.connect(filter).connect(target).connect(this.ambienceGain);
    source.start();
    this.activeSources.push(source);
    return source;
  }

  private createWindBed(): void {
    if (!this.context || !this.windGain) return;
    this.createLoopingNoise('bandpass', 860, 0.48, this.windGain);
    const lfo = this.context.createOscillator();
    const amount = this.context.createGain();
    lfo.frequency.value = 0.055;
    amount.gain.value = 0.026;
    lfo.connect(amount).connect(this.windGain.gain);
    lfo.start();
    this.activeSources.push(lfo);
  }

  private createWaterBed(): void {
    if (!this.context || !this.waterGain) return;
    this.createLoopingNoise('lowpass', 340, 0.7, this.waterGain);
    const lfo = this.context.createOscillator();
    const amount = this.context.createGain();
    lfo.frequency.value = 0.085;
    amount.gain.value = 0.04;
    lfo.connect(amount).connect(this.waterGain.gain);
    lfo.start();
    this.activeSources.push(lfo);
  }

  private createRiverBed(): void {
    if (!this.context || !this.riverGain) return;
    this.createLoopingNoise('bandpass', 540, 0.85, this.riverGain);
  }

  private createDrone(): void {
    if (!this.context || !this.droneGain || !this.musicGain) return;
    const low = this.context.createOscillator();
    const fifth = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    low.type = 'sine';
    fifth.type = 'triangle';
    low.frequency.value = 73.42;
    fifth.frequency.value = 110;
    filter.type = 'lowpass';
    filter.frequency.value = 430;
    filter.Q.value = 0.45;
    low.connect(filter);
    fifth.connect(filter);
    filter.connect(this.droneGain).connect(this.musicGain);
    low.start();
    fifth.start();
    this.activeSources.push(low, fifth);
  }

  private startSchedulers(): void {
    const musicInterval = window.setInterval(() => this.schedulePhrase(), 4200);
    const environmentInterval = window.setInterval(() => {
      if (!this.enabled || !this.ambienceEnabled) return;
      const choice = Math.random();
      if (choice < 0.45) this.playWoodCreak();
      else if (choice < 0.82) this.playSplash();
      else this.playDistantHorn();
    }, 5100);
    this.intervals.push(musicInterval, environmentInterval);
    this.schedulePhrase();
  }

  private schedulePhrase(): void {
    if (!this.enabled || !this.musicEnabled || !this.context || !this.musicGain) return;
    const scales: Record<AudioScene, number[]> = {
      'open-sea': [146.83, 174.61, 196, 220, 261.63],
      coast: [130.81, 146.83, 174.61, 196, 220],
      river: [146.83, 164.81, 196, 220, 246.94],
      settlement: [130.81, 164.81, 196, 220, 261.63],
    };
    const scale = scales[this.scene];
    const pattern = [0, 2, 1, 4, 2, 3];
    const start = this.context.currentTime + 0.04;

    pattern.forEach((offset, index) => {
      const note = scale[(offset + this.phraseIndex) % scale.length];
      this.playPluck(note, start + index * 0.48, index === 0 ? 0.13 : 0.08, this.musicGain as GainNode);
    });
    this.phraseIndex = (this.phraseIndex + 1) % scale.length;
  }

  private playPluck(frequency: number, start: number, level: number, destination: AudioNode): void {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const overtone = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();

    oscillator.type = 'triangle';
    overtone.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    overtone.frequency.setValueAtTime(frequency * 2.01, start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2100, start);
    filter.frequency.exponentialRampToValueAtTime(540, start + 1.55);
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.7);

    oscillator.connect(filter);
    overtone.connect(filter);
    filter.connect(gain).connect(destination);
    oscillator.start(start);
    overtone.start(start);
    oscillator.stop(start + 1.75);
    overtone.stop(start + 1.75);
  }

  private playWoodTap(seed: number): void {
    if (!this.context || !this.effectsGain) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(118 + (Math.abs(seed) % 26), now);
    oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.15);
    filter.type = 'bandpass';
    filter.frequency.value = 220;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(filter).connect(gain).connect(this.effectsGain);
    oscillator.start();
    oscillator.stop(now + 0.2);
  }

  private playWoodCreak(): void {
    if (!this.context || !this.effectsGain) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(62 + Math.random() * 18, now);
    oscillator.frequency.linearRampToValueAtTime(42 + Math.random() * 12, now + 0.65);
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 2.4;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.028, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    oscillator.connect(filter).connect(gain).connect(this.effectsGain);
    oscillator.start();
    oscillator.stop(now + 0.75);
  }

  private playSplash(): void {
    if (!this.context || !this.noiseBuffer || !this.effectsGain) return;
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = this.scene === 'river' ? 720 : 480;
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    source.connect(filter).connect(gain).connect(this.effectsGain);
    source.start(now, Math.random() * 1.5, 0.45);
  }

  private playDistantHorn(): void {
    if (!this.context || !this.effectsGain || this.scene === 'settlement') return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = this.scene === 'open-sea' ? 98 : 110;
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 1.3;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.014, now + 0.45);
    gain.gain.linearRampToValueAtTime(0.009, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
    oscillator.connect(filter).connect(gain).connect(this.effectsGain);
    oscillator.start();
    oscillator.stop(now + 2);
  }

  private applyMix(): void {
    const master = this.enabled ? this.mix.master : 0;
    const ambience = this.enabled && this.ambienceEnabled ? this.mix.ambience : 0;
    const music = this.enabled && this.musicEnabled ? this.mix.music : 0;
    setGainSmoothly(this.masterGain, master, this.context);
    setGainSmoothly(this.ambienceGain, ambience, this.context);
    setGainSmoothly(this.musicGain, music, this.context);
    setGainSmoothly(this.effectsGain, this.enabled ? 0.58 : 0, this.context);
    setGainSmoothly(this.droneGain, this.musicEnabled ? 0.018 : 0, this.context);
  }

  private applySceneMix(): void {
    const sceneMix: Record<AudioScene, { wind: number; water: number; river: number }> = {
      'open-sea': { wind: 0.11, water: 0.15, river: 0 },
      coast: { wind: 0.075, water: 0.1, river: 0.015 },
      river: { wind: 0.035, water: 0.025, river: 0.12 },
      settlement: { wind: 0.025, water: 0.035, river: 0.012 },
    };
    const mix = sceneMix[this.scene];
    setGainSmoothly(this.windGain, mix.wind, this.context);
    setGainSmoothly(this.waterGain, mix.water, this.context);
    setGainSmoothly(this.riverGain, mix.river, this.context);
  }
}
