# Архитектура Viking Chronology 3.0

## Принцип

Приложение разделено на игровой state machine, исторический domain layer и независимую WebGL-сцену. React не управляет каждым кадром: он фиксирует главы, диалоги, ресурсы, год и крупные переходы; Three.js интерполирует камеру, корабль, воду, туман и idle-анимации внутри render loop.

## Game state

```text
planning ── requirements met ──> ready ── launch ──> voyage ──> arrived
   ▲                                                           │
   └────────────────────── return to settlement ────────────────┘
```

Состояние включает:

- выбранную экспедиционную главу;
- запасы провизии, древесины и парусины;
- персонажей, с которыми игрок поговорил;
- фазу экспедиции;
- прогресс пути;
- текущий исторический год;
- выбранную точку и активный диалог.

## Поток данных

1. `ExpeditionHUD` меняет подготовку и выбранную главу.
2. `App` проверяет требования и запускает state transition.
3. Путевой progress обновляется в RAF, но React commits ограничены по частоте.
4. Год интерполируется между датами выбранной главы.
5. `VikingScene` получает только крупное доменное состояние.
6. `CameraRig`, `GroundRoute`, `ExplorationFog` и `WorldDecor` интерполируют визуальную часть независимо.

## Слои WebGL

```text
Sky + atmospheric fog + lights
    ↓
MapSurface
    ├── displaced terrain geometry
    ├── vertex colours
    ├── land mask
    ├── animated water shader
    └── terrain skirt
    ↓
WorldDecor
    ├── instanced forest
    ├── rocks
    └── revealed settlements
    ↓
GroundRoute + LongshipModel
    ↓
WorldStopMarker + VikingCamp + VikingActor
    ↓
ExplorationFog
    ↓
CameraControls rig
    ↓
Desktop cinematic post-processing
```

## Рельеф

`flatMap.ts` выполняет:

- проекцию широты/долготы в world coordinates;
- построение маски суши из `world-atlas`;
- sampling land mask для размещения объектов;
- simplex-noise микрорельеф;
- региональные mountain envelopes;
- генерацию vertex-coloured terrain geometry;
- ground curves для маршрутов.

## Камера

`CameraControls` используется как ограниченный постановочный rig:

- polar и azimuth angles зафиксированы;
- один палец выполняет `TOUCH_TRUCK`;
- два пальца — `TOUCH_DOLLY_TRUCK`;
- вращение отключено;
- выбор точки вызывает плавный `setLookAt`;
- во время voyage камера следует за активным сегментом маршрута.

## Исторический слой

- `routes.ts` хранит даты, координаты, narrative, evidence, confidence и источники;
- `expeditions.ts` группирует события в три игровые главы;
- `dialogues.ts` хранит маркированные реконструированные реплики;
- UI не выдаёт маршрутный коридор за один GPS-трек;
- TTS остаётся необязательным и не влияет на субтитры.

## Границы отказа

- WebGL 2 support check до инициализации Canvas;
- Error Boundary вокруг ленивой сцены;
- recovery после `webglcontextlost`;
- service worker регистрируется только на HTTPS;
- звук/речь запускаются только после user gesture;
- `battery` profile отключает самые дорогие эффекты;
- Pages workflow проверяет публичный HTTP-ответ после deployment.
