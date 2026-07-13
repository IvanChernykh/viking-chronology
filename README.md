<p align="center">
  <img src="docs/hero-v4.svg" alt="Viking Chronology — Пути северных мореходов" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/ci.yml">
    <img alt="Quality gate" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/ci.yml?branch=main&style=for-the-badge&label=QUALITY_GATE" />
  </a>
  <a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/pages.yml">
    <img alt="Pages release" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/pages.yml?branch=main&style=for-the-badge&label=PAGES_RELEASE" />
  </a>
  <a href="#локальный-запуск">
    <img alt="Run locally" src="https://img.shields.io/badge/RUN_LOCALLY-D4B36C?style=for-the-badge&logo=vite&logoColor=17110C" />
  </a>
</p>

<p align="center">
  <img alt="Release" src="https://img.shields.io/badge/release-4.0.0-6F8D77?style=flat-square" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-r185-111111?style=flat-square&logo=threedotjs&logoColor=white" />
  <img alt="WebGL" src="https://img.shields.io/badge/WebGL-2.0-990000?style=flat-square&logo=webgl&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-6F8D77?style=flat-square" />
</p>

<h1 align="center">Viking Chronology</h1>
<p align="center"><strong>Историческая 3D-игра-хронология о северных экспедициях · 750–1021</strong></p>
<p align="center">
  Игрок начинает во фьорде, собирает совет, готовит корабль, принимает решения в пути
  и открывает исторические точки вместе с доказательствами, источниками и уровнем уверенности.
</p>

<p align="center">
  <a href="#игровой-цикл"><strong>Игровой цикл</strong></a>
  ·
  <a href="#историческая-дисциплина">Историчность</a>
  ·
  <a href="#мобильная-версия">Mobile</a>
  ·
  <a href="#архитектура">Архитектура</a>
  ·
  <a href="#локальный-запуск">Запуск</a>
</p>

> [!IMPORTANT]
> Публичный адрес добавляется как основной launch-button только после того, как workflow `Pages Release` сам получает **HTTP 200** и подтверждает SHA опубликованного commit через `version.txt`. Успешная сборка без проверки сайта не считается релизом.

---

<table>
<tr>
<td align="center" width="20%"><strong>3</strong><br/><sub>экспедиционные главы</sub></td>
<td align="center" width="20%"><strong>19</strong><br/><sub>исторических локаций</sub></td>
<td align="center" width="20%"><strong>3</strong><br/><sub>члена команды</sub></td>
<td align="center" width="20%"><strong>750–1021</strong><br/><sub>хронология</sub></td>
<td align="center" width="20%"><strong>3</strong><br/><sub>GPU-профиля</sub></td>
</tr>
</table>

## Не атлас с летающими кораблями. Экспедиционная хроника.

Viking Chronology построен вокруг одного законченного цикла: **подготовить экспедицию → пройти маршрут → принять решения → открыть исторический результат**. Карта представлена как плоский физический 3D-мир с низкой постановочной камерой. Корабль движется вдоль поверхности воды, а неизвестные территории раскрываются вместе с хронологией и действиями игрока.

<table>
<tr>
<td width="50%" valign="top">

### Постановочная desktop-сцена

Низкая боковая камера, expedition HUD, маршрут на поверхности воды и отдельный режим путешествия. Камера не вращается произвольно и автоматически сопровождает судно во время перехода.

</td>
<td width="50%" valign="top">

### Отдельный mobile-контракт

Один палец перемещает мир, два пальца управляют масштабом. Карточки прокручиваются независимо, safe-area учитывается, а battery-профиль отключает тяжёлые эффекты.

</td>
</tr>
</table>

## Игровой цикл

<p align="center">
  <img src="docs/gameplay-flow-v4.svg" alt="Игровой цикл Viking Chronology" width="100%" />
</p>

<table>
<tr>
<td width="25%" valign="top">

### I. Совет

- выбор исторической главы;
- цель и риск экспедиции;
- разговоры с кормчей, мастером и скальдом;
- явная граница между фактом и реконструкцией.

</td>
<td width="25%" valign="top">

### II. Подготовка

- провизия, древесина и парусина;
- состояние корабля;
- мораль команды;
- проверяемые условия готовности к выходу.

</td>
<td width="25%" valign="top">

### III. Путешествие

- судно на поверхности воды;
- боковая кинематографическая камера;
- fog-of-war;
- события и решения с последствиями.

</td>
<td width="25%" valign="top">

### IV. Хроника

- открытие исторической точки;
- свидетельства и уровень уверенности;
- институциональные источники;
- возвращение и следующая глава.

</td>
</tr>
</table>

## Три экспедиционные главы

| Глава | Период | Исторический коридор | Игровой риск |
|---|---:|---|---|
| **Западный берег** | 793–866 | Скандинавия → Британские острова | высокий |
| **Речной путь** | 860–907 | Балтика → речные системы Восточной Европы | умеренный |
| **Северная Атлантика** | 874–1021 | Исландия → Гренландия → североамериканский горизонт | крайний |

Главы объединяют несколько документированных процессов и не изображаются как дословный маршрут одной исторической команды.

## Мир и визуальная система

<table>
<tr>
<td width="50%" valign="top">

### Плоский 3D-мир

- land-mask из открытых геоданных `world-atlas`;
- displaced terrain вместо текстурированной плоскости;
- локальный микрорельеф и береговая зона;
- поселения, леса, скалы и реквизит;
- раскрытие территорий по времени и прогрессу.

</td>
<td width="50%" valign="top">

### Море и атмосфера

- отдельный water shader;
- волны, мелководье и береговая пена;
- анимированный fog-of-war;
- ACES filmic tone mapping;
- desktop bloom/vignette и облегчённый mobile render path.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Корабль

- процедурный longship с корпусом, палубой, щитами и вёслами;
- анимированный парус;
- `CatmullRomCurve3` по поверхности маршрута;
- ориентация по касательной;
- ограниченная качка без «полёта» над картой.

</td>
<td width="50%" valign="top">

### Поселение и персонажи

- стартовый фьорд Хавнфьорд;
- длинный дом, мастерская, причал и костёр;
- Рагнхильд, Кетиль и Аса;
- отдельные силуэты и idle-анимация;
- древнескандинавская строка и русский перевод.

</td>
</tr>
</table>

## Историческая дисциплина

Маршруты представлены как **многолетние исторические коридоры**, а не как выдуманный GPS-трек одной флотилии. Каждая локация содержит:

1. датировку и современную географию;
2. исторический контекст;
3. основание реконструкции;
4. уровень уверенности;
5. проверяемые источники.

Реплики используют нормализованную древнескандинавскую орфографию, но являются специально написанными реконструкциями. Browser TTS — только фонетический fallback и не объявляется аутентичной записью речи IX века.

Подробно: [`docs/HISTORICAL-METHODOLOGY.md`](docs/HISTORICAL-METHODOLOGY.md)

## Мобильная версия

Камера не является свободным 3D-viewer. Её угол ограничен, а жесты разделены между миром и интерфейсом.

| Жест | Действие |
|---|---|
| один палец | перемещение мира без вращения |
| два пальца | масштабирование и pan |
| касание персонажа или точки | выбор объекта без конфликта с камерой |
| запуск главы | переход в voyage camera |
| завершение пути | фокус на финальной исторической точке |

Дополнительно:

- `touch-action: none` и `overscroll-behavior: none` на Canvas;
- собственный `pan-y` у карточек и диалогов;
- safe-area для iPhone;
- сниженный DPR, LOD, тени и плотность декора на слабых устройствах;
- post-processing отключён в battery-профиле;
- Error Boundary и восстановление после `webglcontextlost`.

Матрица: [`docs/MOBILE-COMPATIBILITY.md`](docs/MOBILE-COMPATIBILITY.md)

## Архитектура

<p align="center">
  <img src="docs/architecture-v4.svg" alt="Production architecture Viking Chronology" width="100%" />
</p>

```text
src/
├── components/
│   ├── ExpeditionHUD.tsx      # главы, ресурсы, мораль и readiness
│   ├── EncounterPanel.tsx     # события и решения в пути
│   ├── VikingScene.tsx        # WebGL, камера, свет, quality guard
│   ├── MapSurface.tsx         # terrain и water shader
│   ├── ExplorationFog.tsx     # хронологический fog-of-war
│   ├── GroundRoute.tsx        # маршрут и движение корабля
│   ├── LongshipModel.tsx      # longship и парус
│   ├── VikingCamp.tsx         # поселение и интерактивные объекты
│   ├── VikingActor.tsx        # персонажи и hit areas
│   └── DialoguePanel.tsx      # реплика, перевод и voice fallback
├── data/
│   ├── expeditions.ts         # главы, требования и события
│   ├── routes.ts              # 19 локаций, даты и источники
│   └── dialogues.ts           # реконструированные диалоги
├── lib/
│   ├── voyagePath.ts          # путь путешествия и контроль высоты
│   ├── flatMap.ts             # проекция и land mask
│   ├── audioEngine.ts         # музыка и ambience
│   └── deviceProfile.ts       # high / balanced / battery
└── styles/                    # responsive HUD и mobile sheets
```

Полное описание: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Quality gate

`npm run check` выполняет полный релизный набор:

```text
ESLint
strict TypeScript
production Vite build
production asset/path verifier
standalone classic-IIFE build
standalone compatibility verifier
```

Проверенный production bundle:

| Слой | Gzip |
|---|---:|
| CSS | ~10.2 KB |
| игровой UI | ~21.7 KB |
| VikingScene | ~11.9 KB |
| React vendor | ~61.5 KB |
| Three.js / R3F | ~332.6 KB |

## Pages release

`.github/workflows/pages.yml`:

1. запускает полный `npm run check`;
2. создаёт `404.html`, `.nojekyll` и `version.txt`;
3. загружает официальный Pages artifact;
4. публикует резервную ветку `gh-pages`;
5. выполняет deployment в окружение `github-pages`;
6. проверяет публичный HTTP 200 и совпадение SHA релиза.

Workflow не считается успешным, пока опубликованный сайт не вернул ожидаемый commit marker.

## Локальный запуск

Требования: **Node.js 22+**.

```bash
git clone https://github.com/IvanChernykh/viking-chronology.git
cd viking-chronology
npm install
npm run dev
```

Production:

```bash
npm run build
npm run preview
```

Полная проверка:

```bash
npm run check
```

Standalone:

```bash
npm run standalone
```

Результат: `viking-chronology-standalone.html`.

## Документация

[Architecture](docs/ARCHITECTURE.md) · [Historical methodology](docs/HISTORICAL-METHODOLOGY.md) · [Mobile compatibility](docs/MOBILE-COMPATIBILITY.md) · [Performance](docs/PERFORMANCE.md) · [Release notes](docs/RELEASE.md) · [Security](SECURITY.md)

## License

Код распространяется по лицензии [MIT](LICENSE). Исторические источники и внешние материалы принадлежат соответствующим правообладателям.

---

<p align="center">
  <strong>Build only what can be verified.</strong><br/>
  <sub>Хронология, путешествие, решения и источники — без фэнтезийной подмены истории.</sub>
</p>
