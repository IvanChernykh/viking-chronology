import { AlertTriangle, BookOpen, ChevronRight, X } from 'lucide-react';
import type { ExpeditionChoice, ExpeditionEffects, ExpeditionMilestone } from '../data/expeditions';

interface EncounterPanelProps {
  milestone: ExpeditionMilestone;
  onChoose: (choice: ExpeditionChoice) => void;
  onClose?: () => void;
}

const effectMeta: Array<[keyof ExpeditionEffects, string, boolean]> = [
  ['food', 'провизия', false],
  ['timber', 'древесина', false],
  ['sailcloth', 'парусина', false],
  ['hull', 'корпус', false],
  ['rigging', 'рангоут', false],
  ['sail', 'парус', false],
  ['morale', 'мораль', false],
  ['fatigue', 'усталость', true],
  ['health', 'здоровье', false],
  ['discipline', 'дисциплина', false],
  ['loyalty', 'лояльность', false],
  ['silver', 'серебро', false],
  ['renown', 'слава', false],
];

function ChoiceEffects({ choice }: { choice: ExpeditionChoice }) {
  const entries = effectMeta.flatMap(([key, label, inverse]) => {
    const value = choice.effects[key];
    if (typeof value !== 'number' || value === 0) return [];
    const beneficial = inverse ? value < 0 : value > 0;
    return [{ key, label, value, beneficial }];
  });

  return (
    <div className="encounter-effects" aria-label="Последствия решения">
      {entries.map((entry) => (
        <span key={entry.key} className={entry.beneficial ? 'is-positive' : 'is-negative'}>
          {entry.label} {entry.value > 0 ? '+' : ''}{entry.value}
        </span>
      ))}
    </div>
  );
}

export function EncounterPanel({ milestone, onChoose, onClose }: EncounterPanelProps) {
  return (
    <section className="encounter-panel glass-panel" role="dialog" aria-modal="true" aria-label={milestone.title}>
      <div className="encounter-panel__header">
        <div className="encounter-panel__icon"><AlertTriangle size={18} /></div>
        <div>
          <span className="eyebrow">Событие пути · {milestone.year}</span>
          <h2>{milestone.title}</h2>
        </div>
        {onClose && <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={17} /></button>}
      </div>
      <p className="encounter-panel__body">{milestone.body}</p>
      <div className="encounter-panel__choices">
        {milestone.choices.map((choice) => (
          <button key={choice.id} type="button" onClick={() => onChoose(choice)}>
            <span>
              <strong>{choice.label}</strong>
              <small>{choice.consequence}</small>
              <ChoiceEffects choice={choice} />
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      <div className="encounter-panel__source"><BookOpen size={14} /><span>{milestone.sourceNote}</span></div>
    </section>
  );
}
