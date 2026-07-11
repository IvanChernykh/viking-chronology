# Мобильная совместимость

## Главное изменение управления

Сферическая камера и жест вращения удалены. Новая сцена использует `MapControls` с фиксированным боковым углом:

- **один палец** — перемещение плоской карты;
- **два пальца** — масштабирование и одновременный pan;
- rotation отключён полностью;
- `touch-action: none` и `overscroll-behavior: none` закреплены на Canvas;
- информационные и диалоговые панели используют собственный вертикальный scroll.

Это устраняет основной конфликт, при котором мобильный браузер, OrbitControls и карточка одновременно пытались обработать один жест.

## Поддерживаемый способ запуска

Предпочтительна опубликованная HTTPS-версия. Пока Pages не подтверждён успешным deployment, используйте локальный dev server или скачанный standalone. Встроенные просмотрщики ChatGPT, Telegram, GitHub и iOS Files могут отображать HTML как документ и блокировать JavaScript/WebGL.

## Целевые браузеры

- Safari на актуальных iOS/iPadOS;
- Chrome и Firefox на актуальном Android;
- Samsung Internet с WebGL 2.

## Защитные механизмы

- production target ES2018;
- classic-IIFE standalone без module script;
- fallback старого `MediaQueryList.addListener`;
- stable DPR и профили `high`, `balanced`, `battery`;
- WebGL diagnostics и recovery после `webglcontextlost`;
- safe-area, portrait/landscape и touch-targets от 44 px;
- mobile quality отключает дорогие тени и сокращает геометрию мира.

## Диагностика

1. Открыть HTTPS-ссылку непосредственно в Safari или Chrome.
2. Проверить, что Pages workflow завершён зелёным deployment job.
3. Закрыть тяжёлые вкладки и отключить browser-level data saver.
4. Выбрать профиль `battery`, если устройство теряет WebGL-контекст.
5. Для проверки жестов начинать движение на свободной области мира, а не на HTML-панели.
