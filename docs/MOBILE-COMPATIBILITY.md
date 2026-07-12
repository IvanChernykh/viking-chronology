# Мобильная совместимость

## Управление

Сцена не использует свободное вращение. `CameraControls` настроен как игровой боковой rig:

- один палец — `TOUCH_TRUCK`;
- два пальца — `TOUCH_DOLLY_TRUCK`;
- третий жест отключён;
- polar/azimuth angles зафиксированы;
- camera drag не вызывает browser scroll;
- HTML HUD и карточки сохраняют `touch-action: pan-y`.

Это устраняет прежнюю ситуацию, когда браузер, камера и карточка одновременно обрабатывали один touch.

## Компоновка

- Expedition HUD становится нижним sheet на узких экранах;
- внутренние области имеют собственный vertical scroll;
- используются `safe-area-inset-*`;
- основные действия имеют touch targets не менее 44 px;
- portrait и landscape имеют отдельные ограничения высоты;
- voyage HUD занимает меньше экрана, чем planning HUD.

## GPU-политика

| Условие | Реакция |
|---|---|
| mobile device | ограничение DPR, выключение cinematic post-processing |
| слабый CPU/RAM | старт в `battery` или `balanced` |
| средний FPS ниже 31 | однонаправленное понижение качества |
| context loss | fallback с повторным запуском в `battery` |
| reduced motion | CSS-анимации сокращаются |

На mobile уменьшаются:

- разрешение terrain geometry;
- количество деревьев и скал;
- детализация longship;
- shadow map и динамические тени;
- количество route points;
- частота React commits прогресса.

## Совместимость запуска

- production target ES2018;
- standalone — classic IIFE без module script;
- legacy fallback для `MediaQueryList.addListener`;
- service worker включается только по HTTPS;
- Pages build использует относительные asset paths;
- `404.html` копирует app shell для project Pages.

## Проверка

Автоматический verifier проверяет:

- относительные production assets;
- наличие manifest;
- JS budget;
- фиксированные camera control contracts;
- наличие mobile `pan-y` для HTML-панелей;
- отсутствие module script/import-meta/dynamic import в standalone.

Физическая проверка iOS/Android всё ещё необходима перед объявлением полного device certification.
