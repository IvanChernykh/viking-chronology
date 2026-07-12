# Viking Chronology — release notes

## 3.0.0 — Expedition quality release

### Игровой цикл

- добавлены три экспедиционные главы;
- добавлены ресурсы: провизия, древесина и парусина;
- запуск требует подготовки и разговоров с командой;
- добавлены фазы `planning`, `ready`, `voyage`, `arrived`;
- прогресс путешествия синхронизирован с годом и финальной точкой.

### Мир и графика

- плоская текстурная карта заменена displaced terrain geometry;
- добавлены land mask, simplex-noise и mountain envelopes;
- вода получила отдельный shader с волнами, мелководьем и пеной;
- fog-of-war получил анимированный procedural noise;
- добавлены instanced forests, rocks и revealed settlements;
- longship и персонажи переработаны в более детальные процедурные модели;
- desktop получил SMAA, сдержанный bloom, vignette и ACES tone mapping.

### Камера и mobile

- `MapControls` заменён на `CameraControls`;
- камера стала фиксированным постановочным rig;
- один палец выполняет truck, два — dolly + truck;
- камера автоматически следует за активной экспедицией;
- HTML HUD отделён от жестов Canvas;
- mobile отключает дорогие эффекты и сокращает geometry budget.

### PWA и Pages

- добавлена HTTPS-only регистрация service worker;
- Pages build создаёт `.nojekyll`, `404.html` и `version.txt`;
- workflow публикует официальный artifact и fallback `gh-pages` branch;
- после deployment выполняется реальная HTTP-проверка публичного URL;
- release считается успешным только при HTTP 200 и найденной сигнатуре приложения.

### Quality gate

- добавлен production verifier;
- CI использует locked `npm ci`;
- полный `npm run check` включает lint, strict TypeScript, production build, production verification, standalone build и standalone verification.
