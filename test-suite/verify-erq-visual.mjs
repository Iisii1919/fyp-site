// 視覺驗證 ERQ 表單的 prefill：走到前測第 3 份（ERQ）和後測第 3 份（ERQ），
// 把表單頂部（Participant ID / Group 欄位所在）截圖下來。
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3110;
const CDP_PORT = 9471;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync('test-results', { recursive: true });

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}
const profile = mkdtempSync(join(tmpdir(), 'fyperq-'));
const chrome = spawn(CHROME, [
  '--disable-component-update', '--disable-background-networking', '--disable-sync',
  '--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
  '--lang=en-US', '--window-size=1440,900',
  ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
  '--ignore-certificate-errors', 'about:blank',
], { stdio: 'ignore' });
let page = null;
for (let i = 0; i < 40; i++) {
  try { const t = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json(); page = t.find((x) => x.type === 'page'); if (page) break; } catch {}
  await sleep(500);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1; const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
  if (msg.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true });
};
const send = (method, params = {}) => new Promise((res) => { const i = id++; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const shot = async (file) => {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  writeFileSync(file, Buffer.from(r.result.data, 'base64'));
  console.log('截圖:', file);
};
const clickText = (sel, text) => ev(`(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => (e.innerText || '').includes(${JSON.stringify(text)}));
  if (el) { el.click(); return true; } return false;
})()`);
const escapeNext = async () => {
  await ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n', shiftKey: true, altKey: true, bubbles: true }))`);
  await sleep(500);
};
const waitFor = async (expr, ms = 25000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(400); }
  console.log('⚠️ 逾時:', expr.slice(0, 50));
  return false;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await sleep(4000);
await clickText('button', 'Next · 下一頁');
await sleep(2000);
// 篩選
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true }));
  const uni = document.querySelector('select[aria-label="University"]');
  set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true }));
  [...document.querySelectorAll('[role="radiogroup"]')].forEach((g) => {
    const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合'));
    if (l) l.click();
  });
  return true;
})()`);
await sleep(1200);
await clickText('button', 'Continue');
await waitFor(`document.body.innerText.includes('Information Sheet')`);
await sleep(1500);
await clickText('label', '我已閱讀並理解');
await sleep(600);
await clickText('button', 'I Agree');
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
console.log('參與者:', await ev(`localStorage.getItem('fyp_participant')`));

// 前測（3 份），滾到第 3 份（ERQ）頂部
await escapeNext();
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
await sleep(9000); // 等表單載入
await ev(`(() => { const f = document.querySelectorAll('iframe')[2]; f.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); return true; })()`);
await sleep(800);
await shot('test-results/erq-pretest-top.jpg');

// 繼續到後測
await escapeNext();
await waitFor(`document.body.innerText.includes('Preparing Your Session')`);
await waitFor(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue to Videos'))`);
await clickText('button', 'Continue to Videos');
await waitFor(`document.querySelectorAll('video').length >= 1`);
await sleep(1000);
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
await escapeNext();
await waitFor(`document.body.innerText.includes('感謝你的回饋')`);
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
await sleep(9000);
await ev(`(() => { const f = document.querySelectorAll('iframe')[2]; f.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); return true; })()`);
await sleep(800);
await shot('test-results/erq-posttest-top.jpg');

chrome.kill();
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(300);
process.exit(0);
