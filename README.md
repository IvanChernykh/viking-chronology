<p align="center"><img src="docs/hero-v4.svg" alt="Viking Chronology — Пути северных мореходов" width="100%" /></p>

<p align="center">
<a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/ci.yml"><img alt="Quality gate" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/ci.yml?branch=main&style=for-the-badge&label=QUALITY_GATE" /></a>
<a href="https://github.com/IvanChernykh/viking-chronology/actions/workflows/pages.yml"><img alt="Pages release" src="https://img.shields.io/github/actions/workflow/status/IvanChernykh/viking-chronology/pages.yml?branch=main&style=for-the-badge&label=PAGES_RELEASE" /></a>
<a href="#запуск"><img alt="Run locally" src="https://img.shields.io/badge/RUN_LOCALLY-D4B36C?style=for-the-badge&logo=vite&logoColor=17110C" /></a>
</p>

<p align="center">
<img alt="Release" src="https://img.shields.io/badge/release-4.0.0-6F8D77?style=flat-square" />
<img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img alt="Three.js" src="https://img.shields.io/badge/Three.js-r185-111111?style=flat-square&logo=threedotjs&logoColor=white" />
<img alt="License" src="https://img.shields.io/badge/license-MIT-6F8D77?style=flat-square" />
</p>

<h1 align="center">Viking Chronology</h1>
<p align="center"><strong>Историческая 3D-игра-хронология о северных экспедициях · 750–1021</strong></p>
<p align="center">Фьорд, совет команды, подготовка корабля, кинематографическое путешествие, исторические решения, русские субтитры и проверяемые источники.</p>

> [!IMPORTANT]
> Публичный URL считается релизом только после HTTP 200 и совпадения SHA в `version.txt`. Успешная сборка без проверки сайта не считается публикацией.

<table><tr>
<td align="center"><strong>3</strong><br/><sub>главы</sub></td>
<td align="center"><strong>19</strong><br/><sub>локаций</sub></td>
<td align="center"><strong>3</strong><br/><sub>члена команды</sub></td>
<td align="center"><strong>750–1021</strong><br/><sub>хронология</sub></td>
<td align="center"><strong>3</strong><br/><sub>GPU-профиля</sub></td>
</tr></table>

## Экспедиционная хроника, а не глобусная демонстрация

Игровой цикл: **собрать совет → подготовить экспедицию → пройти маршрут → принять решения → открыть исторический результат**. Мир — плоская физическая 3D-сцена с низкой боковой камерой. Longship движется у поверхности воды; территория раскрывается вместе с хронологией.

<p align="center"><img src="docs/gameplay-flow-v4.svg" alt="Игровой цикл Viking Chronology" width="100%" /></p>

| Система | Реализация |
|---|---|
| **Совет** | три персонажа, диалоги, реконструированные древнескандинавские реплики и русские субтитры |
| **Подготовка** | провизия, древесина, парусина, мораль и условия готовности |
| **Путешествие** | `CatmullRomCurve3`, longship у воды, voyage camera, fog-of-war |
| **События** | выборы с последствиями для ресурсов и морали |
| **Хроника** | датировка, свидетельства, уверенность и институциональные источники |

## Три главы

| Глава | Период | Коридор | Риск |
|---|---:|---|---|
| **Западный берег** | 793–866 | Скандинавия → Британские острова | высокий |
| **Речной путь** | 860–907 | Балтика → Восточная Европа | умеренный |
| **Северная Атлантика** | 874–1021 | Исландия → Гренландия → западный горизонт | крайний |

Главы объединяют многолетние документированные процессы и не изображаются как маршрут одной исторической команды.

## Визуальная система

- land-mask из открытых данных `world-atlas` и displaced terrain;
- отдельный water shader, береговая зона и атмосферная перспектива;
- ACES tone mapping, desktop bloom/vignette и облегчённый mobile path;
- longship с корпусом, палубой, щитами, вёслами и анимированным парусом;
- поселение: длинный дом, мастерская, причал, костёр и растительность;
- три GPU-профиля: `high`, `balanced`, `battery`.

## Историческая дисциплина

Маршруты — **многолетние исторические коридоры**, а не выдуманные GPS-треки. Каждая точка содержит датировку, географию, контекст, основание реконструкции, уровень уверенности и источники. Browser TTS используется только как фонетический fallback и не объявляется записью речи IX века.

## Mobile

- один палец — pan без вращения;
- два пальца — dolly + pan;
- отдельная автоматическая камера во время плавания;
- независимая прокрутка карточек и iPhone safe-area;
- сниженные DPR, LOD, тени и плотность декора;
- восстановление после `webglcontextlost`.

## Архитектура

<p align="center"><img src="docs/architecture-v4.svg" alt="Production architecture Viking Chronology" width="100%" /></p>

## Quality gate и Pages

`npm run check` выполняет ESLint, strict TypeScript, production build, asset/path verifier, standalone classic-IIFE build и compatibility verifier.

`Pages Release` создаёт `404.html`, `.nojekyll` и `version.txt`, загружает официальный artifact, публикует резервную `gh-pages`, выполняет deployment и проверяет публичный HTTP 200 с совпадением SHA.

## Запуск

```bash
git clone https://github.com/IvanChernykh/viking-chronology.git
cd viking-chronology
npm install
npm run dev
```

Production gate: `npm run check`. Standalone: `npm run standalone`.

[Architecture](docs/ARCHITECTURE.md) · [Methodology](docs/HISTORICAL-METHODOLOGY.md) · [Mobile](docs/MOBILE-COMPATIBILITY.md) · [Performance](docs/PERFORMANCE.md) · [Release](docs/RELEASE.md)

---
<p align="center"><strong>Build only what can be verified.</strong><br/><sub>Хронология, путешествие, решения и источники — без фэнтезийной подмены истории.</sub></p>
