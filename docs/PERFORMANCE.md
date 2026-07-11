# Performance budget

## Профили

| Profile | DPR | Тени | Мир |
|---|---:|---|---|
| `high` | до 1.65 | 1536 shadow map | полная вода, рельеф, корабль и ContactShadows |
| `balanced` | до 1.25 | 768 shadow map | средняя детализация |
| `battery` | 0.76–1.0 | выключены | сокращённые деревья, вода, корабль и hit geometry |

## Mobile-first решения

- фиксированная боковая камера не пересчитывает orientation при каждом touch;
- MapControls обрабатывает pan/dolly без rotate;
- fog-of-war выполняется одним shader plane;
- картографическая текстура создаётся один раз и освобождается при unmount;
- линии маршрутов используют 34 точки на compact и 64 на desktop;
- React timeline commits ограничены примерно 11 обновлениями/сек. на mobile;
- Three.js scene остаётся lazy chunk.

## Quality guard

После пяти секунд измерения средний FPS ниже 31 переводит `high → balanced` или `balanced → battery`. Профиль не повышается автоматически, поэтому разрешение не пульсирует.
