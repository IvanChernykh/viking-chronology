import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const assetsDir = resolve(root, 'standalone-dist', 'assets');
const assetNames = await readdir(assetsDir);
const cssName = assetNames.find((name) => name.endsWith('.css'));
const jsName = assetNames.find((name) => name.endsWith('.js'));

if (!cssName || !jsName) {
  throw new Error('Standalone build assets were not found.');
}

const css = (await readFile(resolve(assetsDir, cssName), 'utf8')).replaceAll('</style', '<\/style');
const js = (await readFile(resolve(assetsDir, jsName), 'utf8')).replaceAll('</script', '<\/script');
const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
    <meta name="theme-color" content="#0a0907" />
    <meta name="color-scheme" content="dark" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>Пути северных мореходов — 3D-карта</title>
    <style>
      html,body,#root{width:100%;height:100%;margin:0;background:#0a0907;color:#f2e5c5}
      #boot-status{position:fixed;inset:0;z-index:9999;display:grid;place-content:center;gap:14px;padding:28px;text-align:center;background:radial-gradient(circle at 50% 42%,#2a1c13,#0a0907 58%);font-family:Georgia,serif}
      #boot-status strong{font-size:22px;color:#ead49f}#boot-status span{max-width:420px;color:#b9a985;font:13px/1.55 Arial,sans-serif}
      #boot-status i{width:42px;height:42px;margin:auto;border:2px solid rgba(212,179,108,.24);border-top-color:#d4b36c;border-radius:50%;animation:boot-spin .8s linear infinite}
      #boot-status[data-error="true"] i{display:none}#boot-status[data-error="true"] strong{color:#d99b86}
      @keyframes boot-spin{to{transform:rotate(360deg)}}
      ${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <div id="boot-status" role="status"><i></i><strong>Подготовка исторического атласа</strong><span>На телефоне открывайте файл именно в Safari или Chrome. Встроенный просмотрщик файлов может блокировать JavaScript и WebGL.</span></div>
    <script>
      (function(){
        var status=document.getElementById('boot-status');
        var fail=function(message){if(!status)return;status.dataset.error='true';status.querySelector('strong').textContent='Не удалось запустить 3D-карту';status.querySelector('span').textContent=message||'Откройте файл в актуальном браузере либо используйте размещённую HTTPS-версию.'};
        window.addEventListener('error',function(event){fail(event.message);});
        window.addEventListener('unhandledrejection',function(){fail('Браузер остановил инициализацию приложения. Попробуйте экономичный режим или HTTPS-версию.');});
        window.__vikingBootComplete=function(){if(status)status.remove();};
        setTimeout(function(){if(status&&document.getElementById('root').childElementCount>0)status.remove();},2500);
        setTimeout(function(){if(status)fail('Инициализация заняла слишком много времени. На мобильном устройстве используйте опубликованную HTTPS-версию, а не предпросмотр файла.');},15000);
      })();
    </script>
    <script>${js}</script>
  </body>
</html>`;

await writeFile(resolve(root, 'viking-chronology-standalone.html'), html, 'utf8');
console.log('Created viking-chronology-standalone.html');
