# Performance budget

## Production snapshot

| Asset group | Raw | Gzip |
|---|---:|---:|
| CSS | ~39.8 KB | ~9.3 KB |
| App UI | ~70.4 KB | ~22.9 KB |
| VikingScene | ~42.5 KB | ~14.1 KB |
| Geo data | ~109.3 KB | ~39.4 KB |
| React vendor | ~196.0 KB | ~61.6 KB |
| Three.js + postprocessing | ~1.14 MB | ~338.2 KB |

Heavy WebGL code is loaded through the lazy `VikingScene` boundary after the initial React interface.

## Render profiles

| Profile | DPR | Shadows | Geometry/effects |
|---|---:|---|---|
| `high` | до 1.70 | 2048 map | full terrain, decor and desktop post-processing |
| `balanced` | до 1.28 | 1024 map | medium terrain/decor, no resolution oscillation |
| `battery` | 0.72–0.96 | disabled | reduced terrain, trees, route points and ship details |

## Основные решения

- displaced terrain создаётся один раз через `useMemo`;
- land mask и textures освобождаются при unmount;
- леса и скалы используют instancing;
- fog-of-war выполняется одним shader mesh;
- water — один shader plane без дорогих screen-space reflections;
- voyage progress интерполируется в Three.js, React commits throttled;
- camera uses damped `setLookAt`, а не React state per frame;
- ContactShadows рендерятся один раз и только desktop;
- Bloom/SMAA/Vignette отключаются на mobile/battery;
- quality guard может только понизить профиль и не вызывает DPR oscillation.

## Проверки

`scripts/verify-production.mjs` проверяет:

- относительные пути assets;
- manifest и app shell;
- raw JS budget менее 1.8 MB;
- mobile camera actions;
- прокрутку HTML-панелей.

`scripts/verify-standalone.mjs` подтверждает classic-IIFE совместимость автономного HTML.
