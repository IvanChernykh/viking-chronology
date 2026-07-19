import type {
  ExpeditionChapter,
  ExpeditionChoice,
  ExpeditionEffects,
  ExpeditionId,
  ExpeditionMilestone,
  ExpeditionResources,
} from '../../data/expeditions';
import { defaultResources } from '../../data/expeditions';
import type { EnvironmentSnapshot } from '../environment/environmentModel';
import type { GameStage } from '../types';

export const EXPEDITION_SAVE_VERSION = 1 as const;

export interface ShipCondition {
  hull: number;
  rigging: number;
  sail: number;
}

export interface CrewCondition {
  morale: number;
  fatigue: number;
  health: number;
  discipline: number;
  loyalty: number;
}

export interface ConsequenceRecord {
  id: string;
  encounterId: string;
  choiceId: string;
  year: number;
  title: string;
  summary: string;
  effects: ExpeditionEffects;
}

export interface ExpeditionSimulationState {
  version: typeof EXPEDITION_SAVE_VERSION;
  selectedChapterId: ExpeditionId;
  stage: GameStage;
  progress: number;
  elapsedDays: number;
  resources: ExpeditionResources;
  ship: ShipCondition;
  crew: CrewCondition;
  silver: number;
  renown: number;
  readyCrewIds: string[];
  handledMilestoneIds: string[];
  activeEncounterId: string | null;
  consequences: ConsequenceRecord[];
}

export interface ReadinessAssessment {
  ready: boolean;
  requirementsMet: boolean;
  blockers: string[];
}

export type ExpeditionAction =
  | { type: 'selectChapter'; chapterId: ExpeditionId }
  | { type: 'adjustResource'; key: keyof ExpeditionResources; value: number }
  | { type: 'markCrewReady'; crewId: string }
  | { type: 'launch'; chapter: ExpeditionChapter }
  | {
      type: 'advance';
      deltaSeconds: number;
      chapter: ExpeditionChapter;
      environment: EnvironmentSnapshot;
    }
  | {
      type: 'resolveEncounter';
      milestone: ExpeditionMilestone;
      choice: ExpeditionChoice;
    }
  | { type: 'returnToCouncil' }
  | { type: 'hydrate'; state: ExpeditionSimulationState };

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const clampPercent = (value: number): number => Math.round(clamp(value, 0, 100) * 10) / 10;
const clampCurrency = (value: number): number => Math.max(0, Math.round(value));

export function createInitialExpeditionState(chapterId: ExpeditionId): ExpeditionSimulationState {
  return {
    version: EXPEDITION_SAVE_VERSION,
    selectedChapterId: chapterId,
    stage: 'planning',
    progress: 0,
    elapsedDays: 0,
    resources: { ...defaultResources },
    ship: { hull: 94, rigging: 88, sail: 86 },
    crew: { morale: 76, fatigue: 8, health: 92, discipline: 68, loyalty: 70 },
    silver: 24,
    renown: 0,
    readyCrewIds: [],
    handledMilestoneIds: [],
    activeEncounterId: null,
    consequences: [],
  };
}

export function deriveSeaworthiness(ship: ShipCondition): number {
  return clampPercent(ship.hull * 0.46 + ship.rigging * 0.31 + ship.sail * 0.23);
}

export function assessReadiness(
  state: ExpeditionSimulationState,
  chapter: ExpeditionChapter,
): ReadinessAssessment {
  const blockers: string[] = [];
  const requirementsMet = (Object.keys(chapter.requirements) as Array<keyof ExpeditionResources>)
    .every((key) => state.resources[key] >= chapter.requirements[key]);

  if (!requirementsMet) blockers.push('Не выполнены требования по запасам.');
  if (state.readyCrewIds.length < 2) blockers.push('Совет должен включать минимум двух членов команды.');
  if (deriveSeaworthiness(state.ship) < 62) blockers.push('Судно недостаточно мореходно для выхода.');
  if (state.crew.health < 55) blockers.push('Здоровье команды не позволяет начать переход.');
  if (state.crew.loyalty < 35) blockers.push('Лояльность команды критически низкая.');

  return { ready: blockers.length === 0, requirementsMet, blockers };
}

function applyEffects(
  state: ExpeditionSimulationState,
  effects: ExpeditionEffects,
): ExpeditionSimulationState {
  return {
    ...state,
    resources: {
      food: clampPercent(state.resources.food + (effects.food ?? 0)),
      timber: clampPercent(state.resources.timber + (effects.timber ?? 0)),
      sailcloth: clampPercent(state.resources.sailcloth + (effects.sailcloth ?? 0)),
    },
    ship: {
      hull: clampPercent(state.ship.hull + (effects.hull ?? 0)),
      rigging: clampPercent(state.ship.rigging + (effects.rigging ?? 0)),
      sail: clampPercent(state.ship.sail + (effects.sail ?? 0)),
    },
    crew: {
      morale: clampPercent(state.crew.morale + (effects.morale ?? 0)),
      fatigue: clampPercent(state.crew.fatigue + (effects.fatigue ?? 0)),
      health: clampPercent(state.crew.health + (effects.health ?? 0)),
      discipline: clampPercent(state.crew.discipline + (effects.discipline ?? 0)),
      loyalty: clampPercent(state.crew.loyalty + (effects.loyalty ?? 0)),
    },
    silver: clampCurrency(state.silver + (effects.silver ?? 0)),
    renown: clampCurrency(state.renown + (effects.renown ?? 0)),
  };
}

function advanceVoyage(
  state: ExpeditionSimulationState,
  deltaSeconds: number,
  chapter: ExpeditionChapter,
  environment: EnvironmentSnapshot,
): ExpeditionSimulationState {
  if (state.stage !== 'voyage' || state.activeEncounterId || deltaSeconds <= 0) return state;

  const seaworthiness = deriveSeaworthiness(state.ship) / 100;
  const weatherDrag = environment.seaState * 0.18 + environment.precipitation * 0.08;
  const propulsion = 0.78 + environment.windStrength * 0.2 + seaworthiness * 0.18 - weatherDrag;
  const secondsPerVoyageDay = 0.72;
  const progressDelta = clamp(
    (deltaSeconds / Math.max(1, chapter.estimatedDays * secondsPerVoyageDay)) * propulsion,
    0,
    0.04,
  );
  const nextProgress = clamp(state.progress + progressDelta, 0, 1);
  const daysDelta = progressDelta * chapter.estimatedDays;
  const foodLoss = daysDelta * chapter.crewSize * 0.025;
  const lowFoodStress = state.resources.food < 28 ? 0.18 : state.resources.food < 45 ? 0.07 : 0;
  const fatigueGain = daysDelta * (0.3 + environment.seaState * 0.46 + environment.precipitation * 0.1);
  const moraleLoss = daysDelta * (0.055 + lowFoodStress + Math.max(0, state.crew.fatigue - 72) * 0.0025);
  const hullDamage = daysDelta * environment.seaState * environment.seaState * 0.12;
  const riggingDamage = daysDelta * environment.windStrength * environment.seaState * 0.13;
  const sailDamage = daysDelta * environment.windStrength * (0.035 + environment.precipitation * 0.05);
  const healthLoss = daysDelta * (
    (state.resources.food < 18 ? 0.16 : 0)
    + (state.crew.fatigue > 86 ? 0.1 : 0)
    + (environment.temperatureC < -5 ? 0.06 : 0)
  );

  let next: ExpeditionSimulationState = {
    ...state,
    progress: nextProgress,
    elapsedDays: Math.round((state.elapsedDays + daysDelta) * 10) / 10,
    resources: {
      ...state.resources,
      food: clampPercent(state.resources.food - foodLoss),
    },
    ship: {
      hull: clampPercent(state.ship.hull - hullDamage),
      rigging: clampPercent(state.ship.rigging - riggingDamage),
      sail: clampPercent(state.ship.sail - sailDamage),
    },
    crew: {
      ...state.crew,
      morale: clampPercent(state.crew.morale - moraleLoss),
      fatigue: clampPercent(state.crew.fatigue + fatigueGain),
      health: clampPercent(state.crew.health - healthLoss),
    },
  };

  const nextMilestone = chapter.milestones.find(
    (milestone) => nextProgress >= milestone.progress && !state.handledMilestoneIds.includes(milestone.id),
  );
  if (nextMilestone) next = { ...next, activeEncounterId: nextMilestone.id };

  if (nextProgress >= 0.999 && !next.activeEncounterId) {
    const completionRenown = Math.round(8 + next.crew.health * 0.04 + deriveSeaworthiness(next.ship) * 0.04);
    next = {
      ...next,
      stage: 'arrived',
      progress: 1,
      renown: next.renown + completionRenown,
    };
  }

  return next;
}

export function expeditionReducer(
  state: ExpeditionSimulationState,
  action: ExpeditionAction,
): ExpeditionSimulationState {
  switch (action.type) {
    case 'selectChapter':
      if (state.stage === 'voyage') return state;
      return {
        ...state,
        selectedChapterId: action.chapterId,
        stage: 'planning',
        progress: 0,
        elapsedDays: 0,
        readyCrewIds: [],
        handledMilestoneIds: [],
        activeEncounterId: null,
      };
    case 'adjustResource':
      if (state.stage !== 'planning') return state;
      return {
        ...state,
        resources: { ...state.resources, [action.key]: clampPercent(action.value) },
      };
    case 'markCrewReady':
      if (state.readyCrewIds.includes(action.crewId)) return state;
      return {
        ...state,
        readyCrewIds: [...state.readyCrewIds, action.crewId],
      };
    case 'launch':
      if (state.stage !== 'planning' || !assessReadiness(state, action.chapter).ready) return state;
      return {
        ...state,
        stage: 'voyage',
        progress: 0.002,
        elapsedDays: 0,
        handledMilestoneIds: [],
        activeEncounterId: null,
      };
    case 'advance':
      return advanceVoyage(state, action.deltaSeconds, action.chapter, action.environment);
    case 'resolveEncounter': {
      if (state.activeEncounterId !== action.milestone.id) return state;
      const applied = applyEffects(state, action.choice.effects);
      const record: ConsequenceRecord = {
        id: `${action.milestone.id}:${action.choice.id}:${state.consequences.length + 1}`,
        encounterId: action.milestone.id,
        choiceId: action.choice.id,
        year: action.milestone.year,
        title: action.milestone.title,
        summary: action.choice.consequence,
        effects: { ...action.choice.effects },
      };
      return {
        ...applied,
        activeEncounterId: null,
        handledMilestoneIds: [...state.handledMilestoneIds, action.milestone.id],
        consequences: [...state.consequences, record].slice(-24),
      };
    }
    case 'returnToCouncil': {
      const hullRepair = Math.min(7, state.resources.timber * 0.11);
      const rigRepair = Math.min(6, state.resources.timber * 0.08);
      const sailRepair = Math.min(7, state.resources.sailcloth * 0.14);
      return {
        ...state,
        stage: 'planning',
        progress: 0,
        elapsedDays: 0,
        resources: {
          food: clampPercent(state.resources.food + 18),
          timber: clampPercent(state.resources.timber + 8 - hullRepair * 0.45 - rigRepair * 0.35),
          sailcloth: clampPercent(state.resources.sailcloth + 5 - sailRepair * 0.4),
        },
        ship: {
          hull: clampPercent(state.ship.hull + hullRepair),
          rigging: clampPercent(state.ship.rigging + rigRepair),
          sail: clampPercent(state.ship.sail + sailRepair),
        },
        crew: {
          morale: clampPercent(state.crew.morale + 6),
          fatigue: clampPercent(state.crew.fatigue - 28),
          health: clampPercent(state.crew.health + 7),
          discipline: clampPercent(state.crew.discipline + 1),
          loyalty: clampPercent(state.crew.loyalty + 2),
        },
        readyCrewIds: [],
        handledMilestoneIds: [],
        activeEncounterId: null,
      };
    }
    case 'hydrate':
      return action.state;
    default:
      return state;
  }
}
