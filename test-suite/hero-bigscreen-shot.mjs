// Hero 大螢幕（2560×1400，觸發基礎字級層）截圖：驗證 2026-10-21 的字級縮減在使用者螢幕上的效果。
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3105;
const CDP_PORT = 9467;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync('test-results/desktop', { recursive: true });

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}

const profile = mkdtempSync(join(tmpdir(), 'fypbig-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
  '--lang=en-US', '--window-size=2560,1400',
  ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
  '--ignore-certificate-errors', 'about:blank',
], { stdio: 'ignore' });
let page = null;
for (let i = 0; i < 40; i++) {
  try {
    const t = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
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
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await sleep(6000); // 等 hydration + 進場動畫跑完
const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78 });
writeFileSync('test-results/desktop/00c-hero-bigscreen.jpg', Buffer.from(r.result.data, 'base64'));
const size = await send('Runtime.evaluate', {
  expression: `(() => { const h = document.querySelector('.hero-title'); if (!h) return 'no hero-title'; const cs = getComputedStyle(h); return 'hero-title font-size=' + cs.fontSize + ' / viewport=' + innerWidth + 'x' + innerHeight; })()`,
  returnByValue: true,
});
console.log(size.result?.result?.value);
chrome.kill();
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
process.exit(0);
