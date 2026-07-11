import { BookOpen, ExternalLink, Landmark, X } from 'lucide-react';
import { kindMeta } from '../lib/kindMeta';
import type { VikingRoute, VikingStop } from '../types';

interface StoryPanelProps {
  stop: VikingStop;
  route: VikingRoute;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const confidenceLabels = {
  high: 'Высокая доказательная уверенность',
  medium: 'Средняя доказательная уверенность',
  low: 'Гипотетическая реконструкция',
} as const;

export function StoryPanel({ stop, route, onClose, onPrevious, onNext }: StoryPanelProps) {
  const meta = kindMeta[stop.kind];

  return (
    <aside className="story-panel glass-panel" aria-live="polite" aria-label={`История: ${stop.name}`}>
      <div className="story-panel__handle" aria-hidden="true" />
      <button type="button" className="story-panel__close icon-button" onClick={onClose} title="Закрыть">
        <X size={18} />
      </button>

      <div className="story-panel__route" style={{ '--route-color': route.color } as React.CSSProperties}>
        <span className="route-card__dot" />
        {route.name}
      </div>

      <div className="story-panel__folio">
        <Landmark size={14} />
        <span>Историческая карточка</span>
        <strong>{stop.yearLabel}</strong>
      </div>
      <h2>{stop.name}</h2>
      <p className="story-panel__country">Современная география: {stop.modernCountry}</p>

      <div className="story-panel__type">
        <span>{meta.symbol}</span>
        <div>
          <strong>{meta.label}</strong>
          <small>{meta.description}</small>
        </div>
      </div>

      <h3>{stop.headline}</h3>
      <p>{stop.story}</p>

      <div className="evidence-card">
        <BookOpen size={17} />
        <div>
          <strong>Основание реконструкции</strong>
          <p>{stop.evidence}</p>
        </div>
      </div>

      <div className={`confidence confidence--${stop.confidence}`}>
        <span />
        {confidenceLabels[stop.confidence]}
      </div>

      <div className="source-list">
        <span className="eyebrow">Проверяемые источники</span>
        {stop.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            <span>{source.title}</span>
            <ExternalLink size={14} />
          </a>
        ))}
      </div>

      <div className="story-panel__navigation">
        <button type="button" onClick={onPrevious}>← Предыдущая точка</button>
        <button type="button" onClick={onNext}>Следующая точка →</button>
      </div>
    </aside>
  );
}
