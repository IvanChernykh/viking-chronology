export type RenderQuality = 'auto' | 'high' | 'balanced' | 'battery';

export type Confidence = 'high' | 'medium' | 'low';

export interface HistoricalSource {
  title: string;
  url: string;
}

export interface VikingStop {
  id: string;
  name: string;
  modernCountry: string;
  lat: number;
  lon: number;
  year: number;
  yearLabel: string;
  kind: 'homeland' | 'raid' | 'trade' | 'settlement' | 'court' | 'archaeology';
  headline: string;
  story: string;
  evidence: string;
  confidence: Confidence;
  sources: HistoricalSource[];
}

export interface VikingRoute {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  accent: string;
  startYear: number;
  endYear: number;
  distanceLabel: string;
  stops: VikingStop[];
}
