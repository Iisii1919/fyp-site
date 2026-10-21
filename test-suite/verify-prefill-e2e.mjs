// 端到端 prefill 驗證：走完整個流程，在每一份 Google 表單 iframe「裡面」
// 讀出 Participant ID 與 Group 欄位的實際渲染值，跟網站應該填入的比對。
// 這是最終判準：entry 編號對不對，看表單裡的值有沒有真的進去就知道。
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3106;
const CDP_PORT = 9467;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}

const profile = mkdtempSync(join(tmpdir(), 'fypprefill-'));
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
  try {
    const t = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    page = t.find((x) => x.type === 'page');
    if (page) break;
  } catch {}
  await sleep(500);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 1;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
  if (msg.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true });
};
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });

const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};
const waitFor = async (expr, ms = 25000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(400); }
  console.log('  ⚠️ waitFor 逾時:', expr.slice(0, 60));
  return false;
};
await waitFor(`document.body && document.body.innerText.includes('傷感電影')`);
await sleep(2500);

const clickText = (sel, text) => ev(`(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => (e.innerText || '').includes(${JSON.stringify(text)}));
  if (el) { el.click(); return true; } return false;
})()`);
const escapeNext = async () => {
  await ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n', shiftKey: true, altKey: true, bubbles: true }))`);
  await sleep(400);
};

// 讀每個 Google iframe 裡的 Participant ID / Group 實際值
async function readIframeValues(label, expectedCount) {
  await waitFor(`[...document.querySelectorAll('iframe')].filter((f) => f.src.includes('docs.google.com') && f.src.includes('entry.')).length >= ${expectedCount}`);
  await sleep(9000); // 等表單文件載入
  const tree = await send('Page.getFrameTree');
  const gframes = [];
  const stack = [tree.result?.frameTree];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    if (node.frame.url && node.frame.url.includes('docs.google.com')) gframes.push(node.frame);
    (node.childFrames || []).forEach((c) => stack.push(c));
  }
  console.log(`-- ${label}（${gframes.length} 份表單）--`);
  const out = [];
  for (const gf of gframes) {
    const w = await send('Page.createIsolatedWorld', { frameId: gf.id, worldName: 'v', grantUniveralAccess: true });
    const ctxId = w.result?.executionContextId ?? w.result?.contextId;
    if (!ctxId) { console.log('  ⚠️ 無法建立 isolated world', gf.url.slice(0, 70)); continue; }
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const inputs = [...document.querySelectorAll('input, textarea')];
        const pidEl = inputs.find((i) => (i.value || '').startsWith('FYP-'));
        const labelledPid = [...document.querySelectorAll('input, textarea')].find((i) => {
          const item = i.closest('[role="listitem"]');
          return item && item.textContent.includes('Participant ID');
        });
        const body = document.body.innerText || '';
        const group = /\\bK7\\b/.test(body) ? 'K7' : /\\bM3\\b/.test(body) ? 'M3' : null;
        const formId = (location.href.match(/\\/d\\/e\\/([^/]+)/) || [])[1] || '';
        return {
          formId: formId.slice(-8),
          pidValue: pidEl ? pidEl.value : null,
          pidFieldExists: !!labelledPid,
          pidFieldEmpty: labelledPid ? !(labelledPid.value || '') : null,
          group,
        };
      })()`,
      returnByValue: true,
      contextId: ctxId,
    });
    const v = r.result?.result?.value;
    if (!v) { console.log('  ⚠️ evaluate 失敗', JSON.stringify(r.result).slice(0, 200)); continue; }
    out.push(v);
    const pidOk = v.pidValue && /^FYP-[0-9A-Z]{10}$/.test(v.pidValue);
    const grpOk = v.group === 'K7' || v.group === 'M3';
    console.log(`  表單 …${v.formId}: Participant ID = ${v.pidValue ?? (v.pidFieldExists ? '（欄位存在但是空的！）' : '（找不到欄位）')} ${pidOk ? '✓' : '✗'}   Group = ${v.group ?? '（未填入）'} ${grpOk ? '✓' : '✗'}`);
  }
  return out;
}

// 走流程
await clickText('button', 'Next · 下一頁');
await waitFor(`document.body.innerText.includes('Eligibility')`);
await sleep(1500);
// 填篩選（含重試：hydration 完成前的點擊會被吃掉）
for (let attempt = 0; attempt < 3; attempt++) {
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
  const ready = await waitFor(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue') && b.offsetParent !== null)`, 6000);
  if (ready) break;
}
// 點了要真的前進才算數（沒生效就再點）
for (let attempt = 0; attempt < 4; attempt++) {
  const r = await clickText('button', 'Continue');
  console.log(`  [debug] 第 ${attempt + 1} 次點 Continue → ${r}`);
  const moved = await waitFor(`document.body.innerText.includes('Information Sheet')`, 5000);
  if (moved) break;
  console.log('  [debug] 狀態:', await ev(`(() => {
    const age = document.querySelector('select[aria-label="Age range"]');
    const checked = [...document.querySelectorAll('[role="radiogroup"] input:checked')].length;
    const btns = [...document.querySelectorAll('button')].map((b) => b.innerText.slice(0, 20).replace(/\\n/g, '/'));
    return JSON.stringify({ age: age && age.value.slice(0, 10), checkedRadios: checked, buttons: btns });
  })()`));
  await ev(`(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    const age = document.querySelector('select[aria-label="Age range"]');
    if (age && !age.value) { set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true })); }
    const uni = document.querySelector('select[aria-label="University"]');
    if (uni && !uni.value) { set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true })); }
    [...document.querySelectorAll('[role="radiogroup"]')].forEach((g) => {
      if (g.querySelector('[aria-checked="true"], input:checked')) return;
      const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合'));
      if (l) l.click();
    });
    return true;
  })()`);
}
await sleep(1200);
for (let attempt = 0; attempt < 4; attempt++) {
  await clickText('label', '我已閱讀並理解');
  await sleep(500);
  const enabled = await ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('I Agree')); return b && !b.disabled; })()`);
  if (!enabled) continue;
  await clickText('button', 'I Agree');
  const moved = await waitFor(`document.querySelectorAll('iframe').length >= 1`, 6000);
  if (moved) break;
}

const participant = JSON.parse(await ev(`localStorage.getItem('fyp_participant')`) || '{}');
console.log(`本次參與者：${participant.id}（${participant.group} → 應填 ${participant.group === 'sadness' ? 'K7' : 'M3'}）\n`);

const results = {};
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
results.consent = await readIframeValues('Step 3 同意書', 1);
await escapeNext();
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
results.pretest = await readIframeValues('Step 4 前測 ×3', 3);
await escapeNext();
await waitFor(`document.body.innerText.includes('Preparing Your Session')`);
await waitFor(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue to Videos'))`);
await clickText('button', 'Continue to Videos');
await waitFor(`document.querySelectorAll('video').length >= 1`);
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 1`);
results.feedback = await readIframeValues('Step 7 觀影回饋', 1);
await escapeNext();
await waitFor(`document.body.innerText.includes('感謝你的回饋')`);
await clickText('button', 'Next · 下一頁');
await waitFor(`document.querySelectorAll('iframe').length >= 3`);
results.posttest = await readIframeValues('Step 9 後測 ×3', 3);

// 小結
const all = [...results.consent, ...results.pretest, ...results.feedback, ...results.posttest];
const pidFilled = all.filter((v) => v.pidValue && /^FYP-/.test(v.pidValue)).length;
const grpFilled = all.filter((v) => v.group === 'K7' || v.group === 'M3').length;
console.log(`\n== 小結：8 份表單中 Participant ID 填入 ${pidFilled}/8，Group 填入 ${grpFilled}/8 ==`);

try { chrome.kill(); } catch {}
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
process.exit(0);
