import { Anchor, Check, ChevronRight, Compass, Package, Shield, Users, Wheat, Wrench } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ExpeditionChapter, ExpeditionResources } from '../data/expeditions';
import {
  assessReadiness,
  deriveSeaworthiness,
  type ExpeditionSimulationState,
} from '../game/simulation/expeditionState';

interface ExpeditionHUDProps {
  chapters: ExpeditionChapter[];
  selected: ExpeditionChapter;
  simulation: ExpeditionSimulationState;
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

function conditionTone(value: number, inverse = false): string {
  const score = inverse ? 100 - value : value;
  if (score >= 68) return 'good';
  if (score >= 38) return 'warning';
  return 'critical';
}

function ConditionBar({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const displayValue = Math.round(value);
  return (
    <div className={`condition-bar condition-bar--${conditionTone(value, inverse)}`}>
      <div><span>{label}</span><strong>{displayValue}</strong></div>
      <div className="condition-bar__track"><span style={{ width: `${displayValue}%` }} /></div>
    </div>
  );
}

export function ExpeditionHUD({
  chapters,
  selected,
  simulation,
  onSelect,
  onResourceChange,
  onLaunch,
  onReturn,
}: ExpeditionHUDProps) {
  const readiness = assessReadiness(simulation, selected);
  const seaworthiness = deriveSeaworthiness(simulation.ship);
  const lastConsequences = simulation.consequences.slice(-3).reverse();

  return (
    <aside className={`expedition-hud expedition-hud--${simulation.stage}`} aria-label="Управление экспедицией">
      <div className="expedition-hud__heading">
        <div>
          <span className="eyebrow">Экспедиционный совет</span>
          <h2>{simulation.stage === 'voyage' ? 'Переход в море' : selected.title}</h2>
        </div>
        <div className="expedition-hud__risk"><Shield size={14} /> {selected.risk}</div>
      </div>

      {simulation.stage !== 'voyage' && (
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

      <div className="campaign-meta">
        <span>Серебро <strong>{simulation.silver}</strong></span>
        <span>Слава <strong>{simulation.renown}</strong></span>
        <span>Мореходность <strong>{Math.round(seaworthiness)}</strong></span>
      </div>

      {simulation.stage === 'planning' && (
        <>
          <div className="readiness-row">
            <div><Users size={15} /><span>Совет команды</span><strong>{simulation.readyCrewIds.length}/3</strong></div>
            <div className={simulation.readyCrewIds.length >= 2 ? 'status-ok' : ''}>{simulation.readyCrewIds.length >= 2 ? <Check size={14} /> : <ChevronRight size={14} />} минимум 2</div>
          </div>

          <div className="resource-grid">
            {(Object.keys(resourceMeta) as Array<keyof ExpeditionResources>).map((key) => {
              const meta = resourceMeta[key];
              const Icon = meta.icon;
              const required = selected.requirements[key];
              const sufficient = simulation.resources[key] >= required;
              return (
                <label key={key} className={`resource-control ${sufficient ? 'resource-control--ready' : ''}`}>
                  <span><Icon size={14} /> {meta.label}</span>
                  <strong>{Math.round(simulation.resources[key])} <small>/ {required}</small></strong>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={simulation.resources[key]}
                    onChange={(event) => onResourceChange(key, Number(event.target.value))}
                  />
                </label>
              );
            })}
          </div>

          <div className="simulation-section">
            <div className="simulation-section__title"><Anchor size={14} /> Судно</div>
            <div className="condition-grid">
              <ConditionBar label="Корпус" value={simulation.ship.hull} />
              <ConditionBar label="Рангоут" value={simulation.ship.rigging} />
              <ConditionBar label="Парус" value={simulation.ship.sail} />
            </div>
          </div>

          <div className="simulation-section">
            <div className="simulation-section__title"><Users size={14} /> Команда</div>
            <div className="condition-grid">
              <ConditionBar label="Здоровье" value={simulation.crew.health} />
              <ConditionBar label="Мораль" value={simulation.crew.morale} />
              <ConditionBar label="Усталость" value={simulation.crew.fatigue} inverse />
              <ConditionBar label="Дисциплина" value={simulation.crew.discipline} />
              <ConditionBar label="Лояльность" value={simulation.crew.loyalty} />
            </div>
          </div>

          <button type="button" className="launch-button" disabled={!readiness.ready} onClick={onLaunch}>
            <Package size={17} />
            <span>{readiness.ready ? 'Отдать приказ к отплытию' : 'Подготовка не завершена'}</span>
            <ChevronRight size={17} />
          </button>
          {!readiness.ready && (
            <div className="launch-blockers">
              {readiness.blockers.map((blocker) => <p key={blocker}>{blocker}</p>)}
            </div>
          )}
        </>
      )}

      {simulation.stage === 'voyage' && (
        <div className="voyage-status">
          <div className="voyage-status__topline">
            <span>Прогресс перехода</span>
            <strong>{Math.round(simulation.progress * 100)}%</strong>
          </div>
          <div className="voyage-status__track"><span style={{ width: `${simulation.progress * 100}%` }} /></div>
          <div className="voyage-status__metrics">
            <span>Дни <strong>{simulation.elapsedDays.toFixed(1)}</strong></span>
            <span>Команда <strong>{selected.crewSize}</strong></span>
            <span>Провизия <strong>{Math.round(simulation.resources.food)}</strong></span>
          </div>
          <div className="voyage-condition-stack">
            <ConditionBar label="Корпус" value={simulation.ship.hull} />
            <ConditionBar label="Мораль" value={simulation.crew.morale} />
            <ConditionBar label="Здоровье" value={simulation.crew.health} />
            <ConditionBar label="Усталость" value={simulation.crew.fatigue} inverse />
          </div>
        </div>
      )}

      {simulation.stage === 'arrived' && (
        <>
          <div className="arrival-summary">
            <strong>Экспедиция завершена</strong>
            <span>{simulation.elapsedDays.toFixed(1)} дней · мореходность {Math.round(seaworthiness)} · слава {simulation.renown}</span>
          </div>
          <button type="button" className="launch-button launch-button--return" onClick={onReturn}>
            <Anchor size={17} />
            <span>Вернуться к совету</span>
            <ChevronRight size={17} />
          </button>
        </>
      )}

      {lastConsequences.length > 0 && (
        <div className="consequence-ledger">
          <span className="simulation-section__title">Последствия решений</span>
          {lastConsequences.map((record) => (
            <article key={record.id}>
              <strong>{record.year} · {record.title}</strong>
              <p>{record.summary}</p>
            </article>
          ))}
        </div>
      )}

      <p className="expedition-hud__method">{selected.historicalFrame}</p>
    </aside>
  );
}
