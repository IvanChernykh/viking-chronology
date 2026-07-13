import { Anchor, Check, ChevronRight, Compass, Package, Shield, Users, Wheat, Wrench } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ExpeditionChapter, ExpeditionResources } from '../data/expeditions';

interface ExpeditionHUDProps {
  chapters: ExpeditionChapter[];
  selected: ExpeditionChapter;
  resources: ExpeditionResources;
  morale: number;
  readyCrew: number;
  stage: 'planning' | 'voyage' | 'arrived';
  voyageProgress: number;
  onSelect: (chapter: ExpeditionChapter) => void;
  onResourceChange: (key: keyof ExpeditionResources, value: number) => void;
  onLaunch: () => void;
  onReturn: () => void;
}

const resourceMeta: Record<keyof ExpeditionResources, { label: string; icon: typeof Wheat }> = {
  food: { label: 'Провизия', icon: Wheat },
  timber: { label: 'Древесина', icon: Wrench },
  sailcloth: { label: 'Парусина', icon: Anchor },
};

export function ExpeditionHUD({
  chapters,
  selected,
  resources,
  morale,
  readyCrew,
  stage,
  voyageProgress,
  onSelect,
  onResourceChange,
  onLaunch,
  onReturn,
}: ExpeditionHUDProps) {
  const requirementsMet = (Object.keys(selected.requirements) as Array<keyof ExpeditionResources>)
    .every((key) => resources[key] >= selected.requirements[key]);
  const ready = requirementsMet && readyCrew >= 2;

  return (
    <aside className={`expedition-hud expedition-hud--${stage}`} aria-label="Управление экспедицией">
      <div className="expedition-hud__heading">
        <div>
          <span className="eyebrow">Экспедиционный совет</span>
          <h2>{stage === 'voyage' ? 'Переход в море' : selected.title}</h2>
        </div>
        <div className="expedition-hud__risk"><Shield size={14} /> {selected.risk}</div>
      </div>

      {stage !== 'voyage' && (
        <div className="chapter-selector" role="list">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              className={`chapter-card ${chapter.id === selected.id ? 'chapter-card--active' : ''}`}
              style={{ '--chapter-accent': chapter.accent } as CSSProperties}
              onClick={() => onSelect(chapter)}
            >
              <span>{chapter.period}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.subtitle}</small>
            </button>
          ))}
        </div>
      )}

      <div className="expedition-hud__objective">
        <Compass size={17} />
        <p>{selected.objective}</p>
      </div>

      {stage === 'planning' && (
        <>
          <div className="readiness-row">
            <div><Users size={15} /><span>Совет команды</span><strong>{readyCrew}/3</strong></div>
            <div className={readyCrew >= 2 ? 'status-ok' : ''}>{readyCrew >= 2 ? <Check size={14} /> : <ChevronRight size={14} />} минимум 2</div>
          </div>

          <div className="resource-grid">
            {(Object.keys(resourceMeta) as Array<keyof ExpeditionResources>).map((key) => {
              const meta = resourceMeta[key];
              const Icon = meta.icon;
              const required = selected.requirements[key];
              const sufficient = resources[key] >= required;
              return (
                <label key={key} className={`resource-control ${sufficient ? 'resource-control--ready' : ''}`}>
                  <span><Icon size={14} /> {meta.label}</span>
                  <strong>{resources[key]} <small>/ {required}</small></strong>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={resources[key]}
                    onChange={(event) => onResourceChange(key, Number(event.target.value))}
                  />
                </label>
              );
            })}
          </div>

          <button type="button" className="launch-button" disabled={!ready} onClick={onLaunch}>
            <Package size={17} />
            <span>{ready ? 'Отдать приказ к отплытию' : 'Подготовка не завершена'}</span>
            <ChevronRight size={17} />
          </button>
          {!ready && <p className="launch-hint">Поговорите минимум с двумя членами команды и доведите запасы до требований главы.</p>}
        </>
      )}

      {stage === 'voyage' && (
        <div className="voyage-status">
          <div className="voyage-status__topline">
            <span>Прогресс перехода</span>
            <strong>{Math.round(voyageProgress * 100)}%</strong>
          </div>
          <div className="voyage-status__track"><span style={{ width: `${voyageProgress * 100}%` }} /></div>
          <div className="voyage-status__metrics">
            <span>Мораль <strong>{morale}</strong></span>
            <span>Команда <strong>{selected.crewSize}</strong></span>
            <span>Период <strong>{selected.period}</strong></span>
          </div>
        </div>
      )}

      {stage === 'arrived' && (
        <button type="button" className="launch-button launch-button--return" onClick={onReturn}>
          <Anchor size={17} />
          <span>Вернуться к совету</span>
          <ChevronRight size={17} />
        </button>
      )}

      <p className="expedition-hud__method">{selected.historicalFrame}</p>
    </aside>
  );
}
