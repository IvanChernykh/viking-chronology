<div align="center">

# ᚠ VIKING CHRONOLOGY ᚱ

### Хроника северных путей · исторический 3D-мир · 750–1021

**Плоская экспедиционная карта · боковая камера · fog of war · персонажи · древнескандинавская реконструкция · русские субтитры**

</div>

---

<p align="center">
  <a href="#запуск">
    <img alt="Run locally" src="https://img.shields.io/badge/RUN_LOCALLY-D4B36C?style=for-the-badge&logo=vite&logoColor=17110C" />
  </a>
  <a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/ci.yml">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/ci.yml?branch=main&style=for-the-badge&label=QUALITY_GATE" />
  </a>
  <a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/pages.yml">
    <img alt="Pages workflow" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/pages.yml?branch=main&style=for-the-badge&label=PAGES_WORKFLOW" />
  </a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-r185-111111?style=flat-square&logo=threedotjs&logoColor=white" />
  <img alt="WebGL" src="https://img.shields.io/badge/WebGL-2.0-990000?style=flat-square&logo=webgl&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-6F8D77?style=flat-square" />
</p>

<h1 align="center">Viking Chronology</h1>
<p align="center"><strong>Историческая 3D-игра-хронология · VIII–XI века</strong></p>
<p align="center">
  Плоский экспедиционный мир, открывающийся по мере путешествий, с персонажами,
  реконструированной речью, русскими субтитрами и проверяемой доказательной базой.
</p>

<p align="center">
  <a href="#игровой-вертикальный-срез"><strong>Gameplay</strong></a>
  ·
  <a href="#историческая-и-языковая-дисциплина">Историчность</a>
  ·
  <a href="#мобильное-управление">Mobile</a>
  ·
  <a href="#архитектура">Архитектура</a>
  ·
  <a href="#запуск">Запуск</a>
</p>

> [!IMPORTANT]
> Кнопка публичного запуска не показывается как рабочая, пока GitHub Pages не завершит реальный deployment. Сейчас гарантированный вариант — запустить проект локально; standalone генерируется командой `npm run standalone`. Workflow Pages уже настроен и запускается при каждом push в `main`.

---

<table>
<tr>
<td align="center" width="20%"><strong>750–1021</strong><br/><sub>хронология</sub></td>
<td align="center" width="20%"><strong>19</strong><br/><sub>исторических локаций</sub></td>
<td align="center" width="20%"><strong>3</strong><br/><sub>маршрутных коридора</sub></td>
<td align="center" width="20%"><strong>3</strong><br/><sub>интерактивных персонажа</sub></td>
<td align="center" width="20%"><strong>3</strong><br/><sub>GPU-профиля</sub></td>
</tr>
</table>

## Игровой вертикальный срез

Проект больше не использует глобус. Игровое пространство представляет собой **плоский 3D-мир**, показанный с низкой боковой камеры. В 750 году игрок видит Скандинавию и поселение; остальные территории скрыты туманом неизвестности. Хронология, маршруты и посещённые точки постепенно раскрывают Атлантику, Западную Европу, речные системы Востока и Северную Америку.

<table>
<tr>
<td width="33%" valign="top">

### Исследование мира

- один палец или левая кнопка — перемещение карты;
- два пальца или колесо — масштаб;
- угол камеры фиксирован и не ломается жестами;
- автовращение отсутствует;
- выбор точки переводит камеру к месту события.

</td>
<td width="33%" valign="top">

### Живая хроника

- маршруты проявляются по историческому времени;
- fog-of-war открывает только известные игроку области;
- корабли движутся вдоль поверхности воды;
- поселения, леса и горный рельеф появляются вместе с расширением мира.

</td>
<td width="33%" valign="top">

### Персонажи

- кормчая Рагнхильд;
- корабельный мастер Кетиль;
- скальд Аса;
- древнескандинавские реплики;
- русские субтитры и контекст реконструкции.

</td>
</tr>
</table>

## Что изменилось после глобуса

| Было | Стало |
|---|---|
| Сферическая карта и высокие дуги | Плоский мир с маршрутами на поверхности |
| Корабли визуально «летали» | Корабль следует наземной `CatmullRomCurve3` на уровне воды |
| Вращение двумя жестами конфликтовало с UI | `MapControls`: один палец — pan, два — dolly/pan, rotation отключён |
| Сразу виден весь мир | Shader fog-of-war с раскрытием по годам и остановкам |
| Только точки и карточки | Поселение, здания, деревья, рельеф и интерактивные NPC |
| Только процедурная среда | Музыка, ambience и браузерная озвучка диалогов |

## Визуальная система

- стилизованный физический стол-карта с объёмным основанием;
- картографическая текстура из открытых данных `world-atlas`;
- процедурная вода с лёгкой волной;
- направленный свет, туман, тени и адаптивный quality budget;
- низкополигональные здания, хвойные леса, горы, персонажи и длинный корабль;
- маршруты без вертикальных арок и телепортации между сегментами.

## Историческая и языковая дисциплина

Маршруты остаются **многолетними историческими коридорами**, а не GPS-треком одной флотилии. Каждая точка содержит датировку, современную географию, контекст, основание реконструкции, уровень уверенности и институциональные источники.

Реплики персонажей используют нормализованную древнескандинавскую орфографию, но являются специально написанными учебными реконструкциями. Они **не выдаются за дословные цитаты эпохи**. Браузер выбирает ближайший доступный исландский или северогерманский TTS-голос; такое произношение является приближением, а не достоверной записью речи IX века.

Подробности: [`docs/HISTORICAL-METHODOLOGY.md`](docs/HISTORICAL-METHODOLOGY.md)

## Мобильное управление

Главная цель новой сцены — устранить застревание и борьбу жестов с камерой:

- rotation полностью отключён;
- один touch всегда перемещает карту;
- два touch выполняют масштабирование и pan;
- Canvas использует `touch-action: none` и `overscroll-behavior: none`;
- HTML-карточки сохраняют собственный `touch-action: pan-y`;
- mobile DPR ограничен, тени и детализация уменьшаются по device profile;
- крупные невидимые hit-зоны остаются вокруг точек и персонажей;
- диалог и историческая карточка не закрываются случайным касанием мира.

Подробная матрица: [`docs/MOBILE-COMPATIBILITY.md`](docs/MOBILE-COMPATIBILITY.md)

## Звук и озвучка

| Слой | Реализация |
|---|---|
| Окружение | море, ветер, река, дерево и вёсла через Web Audio API |
| Музыка | процедурный дрон, рог и щипковые тембры |
| Диалоги | `SpeechSynthesisUtterance` с приоритетом `is-IS`, затем других северогерманских голосов |
| Субтитры | русская строка всегда показывается независимо от наличия TTS |
| Безопасность | воспроизведение запускается только после действия пользователя |

## Архитектура

<p align="center">
  <img src="docs/architecture-map.svg" alt="Viking Chronology architecture" width="100%" />
</p>

```text
src/
├── components/
│   ├── VikingScene.tsx        # Canvas, side camera, MapControls, quality guard
│   ├── MapSurface.tsx         # physical map table and procedural water
│   ├── ExplorationFog.tsx     # chronological shader fog-of-war
│   ├── GroundRoute.tsx        # surface routes and longship animation
│   ├── WorldStopMarker.tsx    # touch-safe historical points
│   ├── VikingCamp.tsx         # Scandinavian settlement and characters
│   ├── WorldDecor.tsx         # terrain, forests and revealed settlements
│   ├── DialoguePanel.tsx      # Old Norse line, Russian subtitle, voice controls
│   ├── StoryPanel.tsx         # evidence, narrative and sources
│   └── Timeline.tsx           # chronological progression
├── data/
│   ├── routes.ts              # 19 locations and source model
│   └── dialogues.ts           # reconstructed character dialogue
├── lib/
│   ├── flatMap.ts             # projection, map texture and ground curves
│   ├── dialogueSpeech.ts      # browser TTS selection and playback
│   ├── audioEngine.ts         # procedural music and ambience
│   └── deviceProfile.ts       # adaptive quality policy
└── styles/                    # responsive game HUD and mobile panels
```

Полное описание: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Производительность

- ES2018 production target;
- lazy-loaded Three.js scene;
- stable DPR instead of continuous resolution oscillation;
- `high`, `balanced`, `battery` profiles;
- one-way quality downgrade after sustained low FPS;
- reduced terrain, shadows, trees and ship detail on mobile;
- throttled React timeline commits;
- classic IIFE standalone without module script.

Подробности: [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md)

## Запуск

Требования: **Node.js 22+**.

```bash
git clone https://github.com/IvanChernykh/viking-chronology.git
cd viking-chronology
npm install
npm run dev
```

Полная проверка:

```bash
npm run check
```

Production:

```bash
npm run build
npm run preview
```

Автономный HTML:

```bash
npm run standalone
```

Результат: `viking-chronology-standalone.html`.

## GitHub Pages

`.github/workflows/pages.yml` выполняет build, создаёт Pages artifact и deploy в окружение `github-pages` при каждом push в `main`. В репозитории также находится `public/.nojekyll`, а Vite использует относительный base path.

Для нового репозитория владелец должен выбрать **Settings → Pages → Source → GitHub Actions**. После выбора следующий push в `main` запускает deployment. До получения успешного deployment и реального HTTP-ответа README не объявляет Pages-сайт рабочим.

## Следующий масштабный этап

Текущая версия — проверяемый игровой vertical slice. Следующий production-этап требует отдельных наборов ассетов и исторической редакции:

- полноценные персонажные модели, анимации лица и motion capture;
- профессиональные актёры и консультация специалиста по древнескандинавскому;
- главы, задания, экономика путешествия и решения игрока;
- погодные системы, смена времени суток и мореходная навигация;
- дополнительные языки Британских островов, Восточной Европы и Византии;
- сохранения, accessibility settings и device lab на реальных iOS/Android устройствах.

## Документация

[Architecture](docs/ARCHITECTURE.md) · [Historical methodology](docs/HISTORICAL-METHODOLOGY.md) · [Mobile compatibility](docs/MOBILE-COMPATIBILITY.md) · [Performance](docs/PERFORMANCE.md) · [Release notes](docs/RELEASE.md) · [Security](SECURITY.md)

## License

Код распространяется по лицензии [MIT](LICENSE). Исторические источники и внешние материалы принадлежат соответствующим правообладателям.

---

<p align="center">
  <strong>Evidence-led historical game world.</strong><br/>
  <sub>Не фэнтезийный глобус. Не летающие корабли. Хронология, мир и источники.</sub>
</p>
