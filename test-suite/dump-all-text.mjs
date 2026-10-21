// 走遍所有步驟與隱藏狀態，傾印每一行可見文字，供中英對照檢查。
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3114;
const CDP_PORT = 9475;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}
const profile = mkdtempSync(join(tmpdir(), 'fyptext-'));
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
// 傾印可見文字：逐元素收集 innerText 的葉層，去掉重複與空行
const dump = async (label) => {
  const lines = await ev(`(() => {
    const skip = (el) => el.closest('iframe') || el.tagName === 'SCRIPT' || el.tagName === 'STYLE';
    const out = [];
    const walk = (el) => {
      if (!el || skip(el)) return;
      if (el.offsetParent === null && el.tagName !== 'BODY') return; // 不可見
      const kids = [...el.children].filter((c) => c.nodeType === 1);
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean);
      for (const t of own) out.push(t);
      for (const k of kids) walk(k);
    };
    walk(document.body);
    return out;
  })()`);
  return `===== ${label} =====\n` + (lines || []).join('\n') + '\n';
};

let report = '';
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await sleep(5000);
report += await dump('Step 0 Hero');
await clickText('button', 'Next · 下一頁');
await sleep(2000);
report += await dump('Step 1 資格篩選（未填）');
// 不符合路徑
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '31 歲或以上 / 31 or above'); age.dispatchEvent(new Event('change', { bubbles: true }));
  const uni = document.querySelector('select[aria-label="University"]');
  set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true }));
  [...document.querySelectorAll('[role="radiogroup"]')].forEach((g) => {
    const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合'));
    if (l) l.click();
  });
  return true;
})()`);
await sleep(1000);
report += await dump('Step 1b 資格篩選（不符合）');
// 下拉選單的全部選項也抓出來（option 不會出現在 innerText）
report += '===== Step 1c 下拉選項 =====\n' + (await ev(`[...document.querySelectorAll('option')].map((o) => o.textContent.trim()).join('\\n')`)) + '\n';
// 改回符合
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await sleep(1000);
report += await dump('Step 1d 資格篩選（符合，含「接下來」卡）');
await clickText('button', 'Continue');
await waitFor(`document.body.innerText.includes('Information Sheet')`);
await sleep(1500);
report += await dump('Step 2 研究資訊');
await clickText('label', '我已閱讀並理解');
await sleep(600);
report += await dump('Step 2b 研究資訊（已勾選）');
await clickText('button', 'I Agree');
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
await sleep(3000);
report += await dump('Step 3 同意書（iframe 外）');
await escapeNext();
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
await sleep(4000);
report += await dump('Step 4 前測（iframe 外，含進度卡）');
// 接續提示
await send('Page.reload');
await waitFor(`document.body.innerText.includes('接續上次進度')`);
await sleep(1000);
report += await dump('接續提示');
await clickText('button', '接續上次進度');
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
await sleep(2000);
await escapeNext();
await waitFor(`document.body.innerText.includes('Preparing Your Session')`);
await sleep(1500);
report += await dump('Step 5 準備觀影');
await waitFor(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue to Videos'))`);
await clickText('button', 'Continue to Videos');
await waitFor(`document.querySelectorAll('video').length >= 1`);
await sleep(3000);
report += await dump('Step 6 影片（頂部）');
// 滾到第一段影片看看播放器控制文字
await ev(`(() => { const v = document.querySelector('video'); if (v) v.scrollIntoView({ block: 'center' }); return true; })()`);
await sleep(1500);
report += await dump('Step 6b 影片播放器');
await ev(`window.scrollTo(0, 0)`);
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
await sleep(3000);
report += await dump('Step 7 觀影回饋（iframe 外）');
await escapeNext();
await waitFor(`document.body.innerText.includes('感謝你的回饋')`);
await sleep(1500);
report += await dump('Step 8 分隔頁');
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
await sleep(4000);
report += await dump('Step 9 後測（iframe 外）');
await escapeNext();
await waitFor(`document.body.innerText.includes('Thank You')`);
await sleep(2500);
report += await dump('Step 10 感謝頁');

writeFileSync('test-results/all-visible-text.txt', report, 'utf8');
console.log('已輸出 test-results/all-visible-text.txt');
chrome.kill();
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(300);
process.exit(0);
