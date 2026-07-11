import {
  Gauge,
  Info,
  Map,
  Music2,
  Ship,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import type { RenderQuality, VikingRoute } from '../types';

interface ControlPanelProps {
  routes: VikingRoute[];
  activeRouteId: string;
  shipsEnabled: boolean;
  shipSpeed: number;
  renderQuality: RenderQuality;
  audioSupported: boolean;
  audioEnabled: boolean;
  ambienceEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
  ambienceVolume: number;
  musicVolume: number;
  onRouteChange: (routeId: string) => void;
  onShipsChange: (enabled: boolean) => void;
  onShipSpeedChange: (speed: number) => void;
  onRenderQualityChange: (quality: RenderQuality) => void;
  onAudioToggle: () => Promise<void>;
  onAmbienceChange: (enabled: boolean) => void;
  onMusicChange: (enabled: boolean) => void;
  onMasterVolumeChange: (value: number) => void;
  onAmbienceVolumeChange: (value: number) => void;
  onMusicVolumeChange: (value: number) => void;
}

export function ControlPanel({
  routes,
  activeRouteId,
  shipsEnabled,
  shipSpeed,
  renderQuality,
  audioSupported,
  audioEnabled,
  ambienceEnabled,
  musicEnabled,
  masterVolume,
  ambienceVolume,
  musicVolume,
  onRouteChange,
  onShipsChange,
  onShipSpeedChange,
  onRenderQualityChange,
  onAudioToggle,
  onAmbienceChange,
  onMusicChange,
  onMasterVolumeChange,
  onAmbienceVolumeChange,
  onMusicVolumeChange,
}: ControlPanelProps) {
  return (
    <aside className="control-panel glass-panel" aria-label="Управление картой">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Книга путей</span>
          <h2>Маршруты</h2>
        </div>
        <Map size={18} aria-hidden="true" />
      </div>

      <div className="route-list">
        <button
          type="button"
          className={`route-card ${activeRouteId === 'all' ? 'route-card--active' : ''}`}
          onClick={() => onRouteChange('all')}
        >
          <span className="route-card__dot route-card__dot--all" />
          <span>
            <strong>Все направления</strong>
            <small>Общая сеть VIII–XI веков</small>
          </span>
        </button>

        {routes.map((route) => (
          <button
            key={route.id}
            type="button"
            className={`route-card ${activeRouteId === route.id ? 'route-card--active' : ''}`}
            onClick={() => onRouteChange(route.id)}
            style={{ '--route-color': route.color } as React.CSSProperties}
          >
            <span className="route-card__dot" />
            <span>
              <strong>{route.shortName}</strong>
              <small>{route.distanceLabel} · {route.stops.length} точек</small>
            </span>
          </button>
        ))}
      </div>

      <div className="panel-divider" />

      <div className="panel-heading panel-heading--compact">
        <div>
          <span className="eyebrow">Зрительный зал</span>
          <h3>Сцена</h3>
        </div>
        <SlidersHorizontal size={17} aria-hidden="true" />
      </div>

      <label className="toggle-row">
        <span><Ship size={16} />Движение кораблей</span>
        <input
          type="checkbox"
          checked={shipsEnabled}
          onChange={(event) => onShipsChange(event.target.checked)}
        />
        <span className="toggle" aria-hidden="true" />
      </label>


      <label className="range-row">
        <span>Скорость кораблей<strong>{shipSpeed.toFixed(1)}×</strong></span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={shipSpeed}
          onChange={(event) => onShipSpeedChange(Number(event.target.value))}
        />
      </label>

      <label className="select-row">
        <span><Gauge size={16} />Качество 3D</span>
        <select
          value={renderQuality}
          onChange={(event) => onRenderQualityChange(event.target.value as RenderQuality)}
        >
          <option value="auto">Авто</option>
          <option value="high">Высокое</option>
          <option value="balanced">Баланс</option>
          <option value="battery">Экономия</option>
        </select>
      </label>

      <div className="panel-divider" />

      <div className="panel-heading panel-heading--compact">
        <div>
          <span className="eyebrow">Звуковая реконструкция</span>
          <h3>Море и музыка</h3>
        </div>
        {audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </div>

      <button
        type="button"
        className={`sound-master-button ${audioEnabled ? 'sound-master-button--active' : ''}`}
        disabled={!audioSupported}
        onClick={() => void onAudioToggle()}
      >
        {audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        <span>{audioEnabled ? 'Звук включён' : 'Включить звук'}</span>
        <small>{audioSupported ? 'Требуется действие пользователя' : 'Web Audio недоступен'}</small>
      </button>

      <label className="toggle-row">
        <span><Waves size={16} />Море, ветер, дерево</span>
        <input
          type="checkbox"
          checked={ambienceEnabled}
          disabled={!audioEnabled}
          onChange={(event) => onAmbienceChange(event.target.checked)}
        />
        <span className="toggle" aria-hidden="true" />
      </label>

      <label className="toggle-row">
        <span><Music2 size={16} />Инструментальный слой</span>
        <input
          type="checkbox"
          checked={musicEnabled}
          disabled={!audioEnabled}
          onChange={(event) => onMusicChange(event.target.checked)}
        />
        <span className="toggle" aria-hidden="true" />
      </label>

      <label className="range-row range-row--compact">
        <span>Общая громкость<strong>{Math.round(masterVolume * 100)}%</strong></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={masterVolume}
          disabled={!audioEnabled}
          onChange={(event) => onMasterVolumeChange(Number(event.target.value))}
        />
      </label>

      <label className="range-row range-row--compact">
        <span>Окружение<strong>{Math.round(ambienceVolume * 100)}%</strong></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={ambienceVolume}
          disabled={!audioEnabled || !ambienceEnabled}
          onChange={(event) => onAmbienceVolumeChange(Number(event.target.value))}
        />
      </label>

      <label className="range-row range-row--compact">
        <span>Музыка<strong>{Math.round(musicVolume * 100)}%</strong></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={musicVolume}
          disabled={!audioEnabled || !musicEnabled}
          onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
        />
      </label>

      <div className="accuracy-note">
        <Info size={15} />
        <p>
          Это не «запись эпохи»: звучание синтезировано по известным типам материалов,
          инструментов и морской практике. Современные киношные хоры намеренно исключены.
        </p>
      </div>
    </aside>
  );
}
