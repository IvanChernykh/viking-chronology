import type { GameStage } from '../types';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherKind = 'clear' | 'overcast' | 'fog' | 'rain' | 'storm' | 'snow';

export interface EnvironmentSnapshot {
  timeOfDay: number;
  season: Season;
  seasonLabel: string;
  weather: WeatherKind;
  weatherLabel: string;
  temperatureC: number;
  daylight: number;
  cloudCover: number;
  precipitation: number;
  windStrength: number;
  windDirection: readonly [number, number];
  seaState: number;
  visibility: number;
  wetness: number;
  snowCoverage: number;
  sunDirection: readonly [number, number, number];
  sunColor: string;
  skyColor: string;
  horizonColor: string;
  fogColor: string;
  ambientColor: string;
  groundColor: string;
  exposure: number;
}

interface ClimateProfile {
  seed: number;
  cloudBias: number;
  windBias: number;
  precipitationBias: number;
  temperatureBias: number;
  seasonStart: number;
  seasonTravel: number;
}

interface EnvironmentInput {
  chapterId: string;
  stage: GameStage;
  progress: number;
  year: number;
}

const CLIMATES: Record<string, ClimateProfile> = {
  'western-shore': {
    seed: 793,
    cloudBias: 0.56,
    windBias: 0.58,
    precipitationBias: 0.46,
    temperatureBias: 0.08,
    seasonStart: 0.34,
    seasonTravel: 0.31,
  },
  'river-road': {
    seed: 862,
    cloudBias: 0.42,
    windBias: 0.3,
    precipitationBias: 0.38,
    temperatureBias: 0.14,
    seasonStart: 0.19,
    seasonTravel: 0.29,
  },
  'north-atlantic': {
    seed: 985,
    cloudBias: 0.68,
    windBias: 0.72,
    precipitationBias: 0.58,
    temperatureBias: -0.22,
    seasonStart: 0.36,
    seasonTravel: 0.48,
  },
};

const DEFAULT_CLIMATE: ClimateProfile = {
  seed: 750,
  cloudBias: 0.48,
  windBias: 0.45,
  precipitationBias: 0.4,
  temperatureBias: 0,
  seasonStart: 0.28,
  seasonTravel: 0.3,
};

const SEASON_LABELS: Record<Season, string> = {
  spring: 'весна',
  summer: 'лето',
  autumn: 'осень',
  winter: 'зима',
};

const WEATHER_LABELS: Record<WeatherKind, string> = {
  clear: 'ясно',
  overcast: 'пасмурно',
  fog: 'туман',
  rain: 'дождь',
  storm: 'шторм',
  snow: 'снег',
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const normalized = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
}

function hash(seed: number, index: number): number {
  const value = Math.sin(seed * 91.17 + index * 173.31) * 43758.5453123;
  return fract(value);
}

function noise(seed: number, value: number): number {
  const left = Math.floor(value);
  const blend = smoothstep(0, 1, fract(value));
  const a = hash(seed, left);
  const b = hash(seed, left + 1);
  return a + (b - a) * blend;
}

function resolveSeason(phase: number): Season {
  const wrapped = fract(phase);
  if (wrapped < 0.25) return 'spring';
  if (wrapped < 0.5) return 'summer';
  if (wrapped < 0.75) return 'autumn';
  return 'winter';
}

function resolveDayPalette(timeOfDay: number, cloudCover: number): Pick<EnvironmentSnapshot, 'sunColor' | 'skyColor' | 'horizonColor' | 'fogColor' | 'ambientColor' | 'groundColor'> {
  const darkening = cloudCover > 0.72;
  if (timeOfDay < 5.2 || timeOfDay >= 21.2) {
    return {
      sunColor: '#9fbad0',
      skyColor: darkening ? '#03090b' : '#07131b',
      horizonColor: '#13262e',
      fogColor: '#071216',
      ambientColor: '#6e8790',
      groundColor: '#07100f',
    };
  }
  if (timeOfDay < 8.1) {
    return {
      sunColor: '#ffd0a0',
      skyColor: darkening ? '#263037' : '#54758a',
      horizonColor: '#d69a72',
      fogColor: '#536a70',
      ambientColor: '#b9c5bf',
      groundColor: '#15231f',
    };
  }
  if (timeOfDay < 17.3) {
    return {
      sunColor: '#fff0c8',
      skyColor: darkening ? '#34424a' : '#7ca7bb',
      horizonColor: darkening ? '#8a918c' : '#c7d7d4',
      fogColor: darkening ? '#42565c' : '#769096',
      ambientColor: '#d8dfd3',
      groundColor: '#1a2a24',
    };
  }
  return {
    sunColor: '#ffbd82',
    skyColor: darkening ? '#2d3138' : '#625b6d',
    horizonColor: '#d37d5f',
    fogColor: '#5e5352',
    ambientColor: '#c3b5a2',
    groundColor: '#17201d',
  };
}

export function deriveEnvironmentSnapshot({ chapterId, stage, progress, year }: EnvironmentInput): EnvironmentSnapshot {
  const climate = CLIMATES[chapterId] ?? DEFAULT_CLIMATE;
  const journey = clamp01(progress);
  const activeProgress = stage === 'planning' ? 0 : stage === 'arrived' ? 1 : journey;
  const weatherNoise = noise(climate.seed, activeProgress * 10.5 + year * 0.011);
  const weatherDetail = noise(climate.seed + 19, activeProgress * 27.0 + year * 0.037);
  const windNoise = noise(climate.seed + 41, activeProgress * 13.0 + year * 0.021);
  const season = resolveSeason(climate.seasonStart + activeProgress * climate.seasonTravel);

  const dayCycle = stage === 'planning' ? 0.31 : stage === 'arrived' ? 0.72 : fract(0.22 + journey * 3.4);
  const timeOfDay = dayCycle * 24;
  const solarAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
  const sunHeight = Math.sin(solarAngle);
  const daylight = clamp01(sunHeight * 0.9 + 0.16);

  const seasonalTemperature = season === 'summer' ? 0.45 : season === 'spring' ? 0.16 : season === 'autumn' ? -0.03 : -0.48;
  const temperatureC = Math.round(8 + seasonalTemperature * 17 + climate.temperatureBias * 12 - weatherNoise * 5);
  const cloudCover = clamp01(climate.cloudBias * 0.72 + weatherNoise * 0.48 + weatherDetail * 0.18 - daylight * 0.07);
  const precipitation = clamp01((cloudCover - 0.48) * 1.5 + climate.precipitationBias * 0.35 + weatherDetail * 0.24);
  const windStrength = clamp01(climate.windBias * 0.62 + windNoise * 0.56 + precipitation * 0.2);
  const seaState = clamp01(windStrength * 0.78 + precipitation * 0.34 + (chapterId === 'north-atlantic' ? 0.15 : 0));
  const fogLikelihood = clamp01(cloudCover * 0.55 + (1 - windStrength) * 0.34 + (temperatureC < 5 ? 0.12 : 0));

  let weather: WeatherKind;
  if (temperatureC <= 1 && precipitation > 0.38) weather = 'snow';
  else if (precipitation > 0.73 && windStrength > 0.62) weather = 'storm';
  else if (fogLikelihood > 0.69 && precipitation < 0.5) weather = 'fog';
  else if (precipitation > 0.48) weather = 'rain';
  else if (cloudCover > 0.58) weather = 'overcast';
  else weather = 'clear';

  const visibility = clamp01(1 - cloudCover * 0.22 - precipitation * 0.32 - (weather === 'fog' ? 0.42 : 0) - (weather === 'storm' ? 0.18 : 0));
  const wetness = clamp01(precipitation * 0.86 + (weather === 'storm' ? 0.2 : 0));
  const snowCoverage = clamp01((season === 'winter' ? 0.48 : season === 'autumn' ? 0.08 : 0) + Math.max(0, 2 - temperatureC) * 0.055 + (weather === 'snow' ? 0.32 : 0));
  const windAngle = (noise(climate.seed + 83, activeProgress * 8.0 + year * 0.008) * 2 - 1) * Math.PI;
  const palette = resolveDayPalette(timeOfDay, cloudCover);

  return {
    timeOfDay,
    season,
    seasonLabel: SEASON_LABELS[season],
    weather,
    weatherLabel: WEATHER_LABELS[weather],
    temperatureC,
    daylight,
    cloudCover,
    precipitation,
    windStrength,
    windDirection: [Math.cos(windAngle), Math.sin(windAngle)],
    seaState,
    visibility,
    wetness,
    snowCoverage,
    sunDirection: [Math.cos(solarAngle) * 0.72, Math.max(-0.18, sunHeight), Math.sin(solarAngle) * 0.46],
    ...palette,
    exposure: 0.78 + daylight * 0.42 - cloudCover * 0.09,
  };
}
