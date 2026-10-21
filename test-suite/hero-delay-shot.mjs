// Hero 延遲截圖：確認首頁空白只是進場動畫時序，還是真的不渲染。
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3104;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync('test-results', { recursive: true });

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}

async function shotAfterDelay(mobile, port, file) {
  const profile = mkdtempSync(join(tmpdir(), 'fyphero-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
    '--lang=en-US', `--window-size=${mobile ? '390,844' : '1440,900'}`,
    ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
    '--ignore-certificate-errors', 'about:blank',
  ], { stdio: 'ignore' });
  let page = null;
  for (let i = 0; i < 40; i++) {
    try {
      const t = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      page = t.find((x) => x.type === 'page');
      if (page) break;
    } catch {}
    await sleep(500);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 1; const pending = new Map();
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = id++; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  if (mobile) {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  }
  await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
  await sleep(6000); // 等 hydration + 進場動畫跑完
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 75 });
  writeFileSync(file, Buffer.from(r.result.data, 'base64'));
  // 順便讀 hero 標題的實際透明度，看動畫有沒有跑
  const op = await send('Runtime.evaluate', {
    expression: `(() => { const h = document.querySelector('.hero-title') || document.querySelector('h1'); if (!h) return 'no h1'; const cs = getComputedStyle(h); return 'opacity=' + cs.opacity + ' transform=' + cs.transform.slice(0, 40); })()`,
    returnByValue: true,
  });
  console.log(`${mobile ? '手機' : '桌機'} hero h1 狀態:`, op.result?.result?.value);
  chrome.kill();
}

await shotAfterDelay(false, 9465, 'test-results/desktop/00b-hero-after-6s.jpg');
await shotAfterDelay(true, 9466, 'test-results/mobile/00b-hero-after-6s.jpg');
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
process.exit(0);
