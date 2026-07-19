import type { ExpeditionId } from '../../data/expeditions';
import {
  createInitialExpeditionState,
  EXPEDITION_SAVE_VERSION,
  type ExpeditionSimulationState,
} from './expeditionState';

const SAVE_KEY = `viking-chronology.expedition.v${EXPEDITION_SAVE_VERSION}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
}

export function normaliseExpeditionState(
  value: unknown,
  fallbackChapterId: ExpeditionId,
): ExpeditionSimulationState {
  const fallback = createInitialExpeditionState(fallbackChapterId);
  if (!isRecord(value) || value.version !== EXPEDITION_SAVE_VERSION) return fallback;

  const resources = isRecord(value.resources) ? value.resources : {};
  const ship = isRecord(value.ship) ? value.ship : {};
  const crew = isRecord(value.crew) ? value.crew : {};
  const stage = value.stage === 'planning' || value.stage === 'voyage' || value.stage === 'arrived'
    ? value.stage
    : fallback.stage;
  const selectedChapterId = value.selectedChapterId === 'western-shore'
    || value.selectedChapterId === 'river-road'
    || value.selectedChapterId === 'north-atlantic'
    ? value.selectedChapterId
    : fallbackChapterId;
  const consequences = Array.isArray(value.consequences)
    ? value.consequences.filter((entry): entry is ExpeditionSimulationState['consequences'][number] => {
        if (!isRecord(entry) || !isRecord(entry.effects)) return false;
        return typeof entry.id === 'string'
          && typeof entry.encounterId === 'string'
          && typeof entry.choiceId === 'string'
          && typeof entry.year === 'number'
          && typeof entry.title === 'string'
          && typeof entry.summary === 'string';
      }).slice(-24)
    : [];

  return {
    version: EXPEDITION_SAVE_VERSION,
    selectedChapterId,
    stage,
    progress: Math.min(1, Math.max(0, finiteNumber(value.progress, 0))),
    elapsedDays: Math.max(0, finiteNumber(value.elapsedDays, 0)),
    resources: {
      food: Math.min(100, Math.max(0, finiteNumber(resources.food, fallback.resources.food))),
      timber: Math.min(100, Math.max(0, finiteNumber(resources.timber, fallback.resources.timber))),
      sailcloth: Math.min(100, Math.max(0, finiteNumber(resources.sailcloth, fallback.resources.sailcloth))),
    },
    ship: {
      hull: Math.min(100, Math.max(0, finiteNumber(ship.hull, fallback.ship.hull))),
      rigging: Math.min(100, Math.max(0, finiteNumber(ship.rigging, fallback.ship.rigging))),
      sail: Math.min(100, Math.max(0, finiteNumber(ship.sail, fallback.ship.sail))),
    },
    crew: {
      morale: Math.min(100, Math.max(0, finiteNumber(crew.morale, fallback.crew.morale))),
      fatigue: Math.min(100, Math.max(0, finiteNumber(crew.fatigue, fallback.crew.fatigue))),
      health: Math.min(100, Math.max(0, finiteNumber(crew.health, fallback.crew.health))),
      discipline: Math.min(100, Math.max(0, finiteNumber(crew.discipline, fallback.crew.discipline))),
      loyalty: Math.min(100, Math.max(0, finiteNumber(crew.loyalty, fallback.crew.loyalty))),
    },
    silver: Math.max(0, Math.round(finiteNumber(value.silver, fallback.silver))),
    renown: Math.max(0, Math.round(finiteNumber(value.renown, fallback.renown))),
    readyCrewIds: stringArray(value.readyCrewIds),
    handledMilestoneIds: stringArray(value.handledMilestoneIds),
    activeEncounterId: typeof value.activeEncounterId === 'string' ? value.activeEncounterId : null,
    consequences,
    updatedAt: finiteNumber(value.updatedAt, Date.now()),
  };
}

export function loadExpeditionState(fallbackChapterId: ExpeditionId): ExpeditionSimulationState {
  if (typeof window === 'undefined') return createInitialExpeditionState(fallbackChapterId);
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialExpeditionState(fallbackChapterId);
    return normaliseExpeditionState(JSON.parse(raw) as unknown, fallbackChapterId);
  } catch {
    return createInitialExpeditionState(fallbackChapterId);
  }
}

export function saveExpeditionState(state: ExpeditionSimulationState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing or constrained webviews.
  }
}

export function clearExpeditionState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Reset is best-effort for the same reason as saving.
  }
}
