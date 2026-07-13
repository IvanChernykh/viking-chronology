import { AlertTriangle, BookOpen, ChevronRight, X } from 'lucide-react';
import type { ExpeditionChoice, ExpeditionMilestone } from '../data/expeditions';

interface EncounterPanelProps {
  milestone: ExpeditionMilestone;
  onChoose: (choice: ExpeditionChoice) => void;
  onClose?: () => void;
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
            <span><strong>{choice.label}</strong><small>{choice.consequence}</small></span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      <div className="encounter-panel__source"><BookOpen size={14} /><span>{milestone.sourceNote}</span></div>
    </section>
  );
}
