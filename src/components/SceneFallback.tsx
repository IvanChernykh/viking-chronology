import { AlertTriangle, Compass, RotateCcw } from 'lucide-react';

interface SceneFallbackProps {
  reason: 'unsupported' | 'context-lost' | 'runtime-error';
  onRetry?: () => void;
}

const messages = {
  unsupported: {
    title: '3D-режим недоступен на этом устройстве',
    text: 'Браузер не предоставил WebGL 2. Откройте проект по HTTPS в актуальном Safari, Chrome или Firefox; встроенные просмотровщики файлов часто блокируют WebGL и JavaScript.',
  },
  'context-lost': {
    title: 'Графический контекст был остановлен',
    text: 'Мобильная система освободила память GPU. Закройте тяжёлые вкладки и перезапустите сцену в экономичном профиле.',
  },
  'runtime-error': {
    title: 'Сцена не смогла инициализироваться',
    text: 'Интерфейс и исторические данные доступны, но 3D-рендерер завершился с ошибкой. Повторный запуск обычно восстанавливает контекст.',
  },
} as const;

export function SceneFallback({ reason, onRetry }: SceneFallbackProps) {
  const message = messages[reason];

  return (
    <div className="scene-fallback" role="alert">
      <div className="scene-fallback__emblem" aria-hidden="true"><Compass size={34} /></div>
      <AlertTriangle size={20} />
      <h2>{message.title}</h2>
      <p>{message.text}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          <RotateCcw size={16} />
          Перезапустить 3D-сцену
        </button>
      )}
    </div>
  );
}
