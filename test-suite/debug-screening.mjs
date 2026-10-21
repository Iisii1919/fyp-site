// 最小除錯：篩選頁填完後 Continue 到底發生什麼事
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3108;
const CDP_PORT = 9469;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}
const profile = mkdtempSync(join(tmpdir(), 'fypdbg-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio', '--lang=en-US', '--window-size=1440,900',
  ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
  '--ignore-certificate-errors', 'about:blank'], { stdio: 'ignore' });
let page = null;
for (let i = 0; i < 40; i++) {
  try { const t = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json(); page = t.find((x) => x.type === 'page'); if (page) break; } catch {}
  await sleep(500);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = id++; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await sleep(4000);
console.log('hero 狀態:', (await ev(`document.body.innerText.slice(0, 40)`)));
// 點 Next
console.log('點 Next:', await ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Next · 下一頁')); if (b) { b.click(); return 'clicked'; } return 'not found'; })()`));
await sleep(2000);
console.log('現在頁面:', (await ev(`document.body.innerText.slice(0, 60)`)));
// 填表
console.log('填表:', await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  if (!age) return 'age select not found';
  set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true }));
  const uni = document.querySelector('select[aria-label="University"]');
  set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true }));
  const groups = [...document.querySelectorAll('[role="radiogroup"]')];
  groups.forEach((g) => { const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合')); if (l) l.click(); });
  return 'filled, radiogroups=' + groups.length;
})()`));
await sleep(1200);
console.log('填後狀態:', await ev(`(() => {
  const age = document.querySelector('select[aria-label="Age range"]');
  const uni = document.querySelector('select[aria-label="University"]');
  const checked = [...document.querySelectorAll('[role="radiogroup"] input:checked')].length;
  const btns = [...document.querySelectorAll('button')].map((b) => b.innerText.slice(0, 25).replace(/\\n/g, '/'));
  return JSON.stringify({ age: age && age.value.slice(0, 12), uni: uni && uni.value.slice(0, 12), checkedRadios: checked, buttons: btns });
})()`));
console.log('點 Continue:', await ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Continue')); if (b) { b.click(); return 'clicked: ' + b.innerText.slice(0, 30).replace(/\\n/g, '/'); } return 'not found'; })()`));
await sleep(2500);
console.log('點後頁面:', (await ev(`document.body.innerText.slice(0, 60)`)));
chrome.kill();
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(300);
process.exit(0);
