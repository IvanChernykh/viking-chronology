import { Pause, Play, RotateCcw } from 'lucide-react';

interface TimelineProps {
  minYear: number;
  maxYear: number;
  year: number;
  playing: boolean;
  playbackSpeed: number;
  onYearChange: (year: number) => void;
  onTogglePlaying: () => void;
  onReset: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
}

export function Timeline({
  minYear,
  maxYear,
  year,
  playing,
  playbackSpeed,
  onYearChange,
  onTogglePlaying,
  onReset,
  onPlaybackSpeedChange,
}: TimelineProps) {
  const progress = ((year - minYear) / (maxYear - minYear)) * 100;

  return (
    <section className="timeline glass-panel" aria-label="Хронологическая шкала">
      <div className="timeline__topline">
        <div>
          <span className="eyebrow">Летопись маршрутов</span>
          <strong className="timeline__year">{Math.round(year)}</strong>
          <span className="timeline__era">год н. э.</span>
        </div>
        <div className="timeline__actions">
          <button type="button" className="icon-button" onClick={onReset} title="К началу">
            <RotateCcw size={16} />
          </button>
          <button type="button" className="play-button" onClick={onTogglePlaying}>
            {playing ? <Pause size={17} /> : <Play size={17} />}
            <span>{playing ? 'Пауза' : 'Показать развитие'}</span>
          </button>
          <select
            aria-label="Скорость хронологии"
            value={playbackSpeed}
            onChange={(event) => onPlaybackSpeedChange(Number(event.target.value))}
          >
            <option value={0.5}>0,5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </div>
      </div>

      <div className="timeline__track-wrap">
        <div className="timeline__progress" style={{ width: `${progress}%` }} />
        <div className="timeline__thumb" style={{ left: `${progress}%` }} aria-hidden="true" />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={Math.round(year)}
          aria-label={`Год: ${Math.round(year)}`}
          onChange={(event) => onYearChange(Number(event.target.value))}
        />
      </div>
      <div className="timeline__ticks">
        <span>{minYear}</span>
        <span>800</span>
        <span>900</span>
        <span>1000</span>
        <span>{maxYear}</span>
      </div>
    </section>
  );
}
