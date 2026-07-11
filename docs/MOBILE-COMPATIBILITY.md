# Мобильная совместимость

## Поддерживаемый способ запуска

Используйте HTTPS-версию GitHub Pages. Ссылка на standalone HTML предназначена для скачивания и диагностики. Встроенные просмотрщики ChatGPT, Telegram, GitHub и iOS Files могут показывать HTML как документ и не обязаны разрешать JavaScript/WebGL.

## Целевые браузеры

- Safari на актуальных версиях iOS/iPadOS;
- Chrome и Firefox на актуальном Android;
- Samsung Internet с WebGL 2.

## Защитные механизмы

- сборка ES2018;
- standalone без `type="module"`, `import.meta` и динамических импортов;
- совместимый обработчик старого `MediaQueryList.addListener`;
- стабильный DPR без `AdaptiveDpr`;
- автоматический профиль GPU по ядрам, памяти и DPR;
- recovery после `webglcontextlost`;
- portrait/landscape, safe-area и touch-targets от 44 px.

## Диагностика

1. Открыть опубликованную HTTPS-ссылку непосредственно в Safari/Chrome.
2. Отключить режим энергосбережения браузера.
3. Закрыть другие тяжёлые вкладки.
4. Выбрать профиль `battery`, если устройство теряет WebGL-контекст.
