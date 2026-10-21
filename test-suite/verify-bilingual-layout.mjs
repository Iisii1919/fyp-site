// 雙語排版驗證：走完整流程，對「新增的中英對照行」逐一截圖（電腦版 + 手機版）。
//
//   node test-suite/verify-bilingual-layout.mjs            → desktop 1440×900
//   node test-suite/verify-bilingual-layout.mjs --mobile   → iPhone-ish 390×844 + touch
//
// 基於 walkthrough.mjs 精簡（跳過不符合路徑、接續重載測試），新增：
//   - 每處新增雙語行的 bodyText 斷言（EN + ZH 都在）
//   - 捲動到各問卷頁下方提示句並截圖（原本截圖只拍到視窗頂部）
//   - 影片頁「Scroll for next video / 向下滾動觀看下一段影片」截圖
//   - 後測 CD-RISC 不再出現「This is the final questionnaire」
//   - 感謝頁 Anonymous · 匿名、真實電郵；不得再出現 research@example.edu
//
// 刻意不測：表單收合切換鈕（要真的送出表單才出現）與載入失敗救援面板
// （要斷網才出現）——這兩處由建置與程式碼審查覆蓋。

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MOBILE = process.argv.includes('--mobile');
const MODE = MOBILE ? 'bilingual-mobile' : 'bilingual-desktop';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const CDP_PORT = MOBILE ? 9471 : 9470;
const SITE_PORT = 3102;
const OUT_DIR = join(process.cwd(), 'test-results', MODE);
mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}${detail ? '  [' + detail + ']' : ''}`); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log(`  FAIL  ${name}${detail ? '  [' + detail + ']' : ''}`); }
};
const note = (n, d) => console.log(`  NOTE  ${n} — ${d}`);

// ---------- 啟動 next start ----------
console.log(`\n== 啟動網站（port ${SITE_PORT}）==`);
const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
let siteUp = false;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://localhost:${SITE_PORT}/`);
    if (r.status) { siteUp = true; break; }
  } catch {}
  await sleep(1000);
}
if (!siteUp) { console.log('網站起不來'); process.exit(2); }
console.log('  網站已就緒');

// ---------- 啟動 headless Chrome ----------
const profile = mkdtempSync(join(tmpdir(), 'fypbi-'));
const chrome = spawn(CHROME, [
  '--disable-component-update', '--disable-background-networking', '--disable-sync',
  '--disable-client-side-phishing-detection', '--disable-domain-reliability',
  '--disable-default-apps', '--no-service-autorun', '--disable-breakpad',
  '--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
  '--lang=en-US', `--window-size=${MOBILE ? '390,844' : '1440,900'}`,
  ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
  '--ignore-certificate-errors', 'about:blank',
], { stdio: 'ignore' });

let page = null;
for (let i = 0; i < 40; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (page) break;
  } catch {}
  await sleep(500);
}
if (!page) { console.log('Chrome 起不來'); process.exit(2); }

// ---------- CDP 連線 ----------
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 1;
const pending = new Map();
const consoleErrors = [], exceptions = [], dialogs = [];

ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
  const p = msg.params || {};
  switch (msg.method) {
    case 'Runtime.consoleAPICalled':
      if (p.type === 'error') consoleErrors.push(p.args?.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300));
      break;
    case 'Runtime.exceptionThrown':
      exceptions.push((p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || '').slice(0, 300));
      break;
    case 'Page.javascriptDialogOpening':
      dialogs.push((p.message || '').slice(0, 80));
      send('Page.handleJavaScriptDialog', { accept: true });
      break;
  }
};
function send(method, params = {}, sessionId) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');

if (MOBILE) {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.exception?.description || 'eval error' };
  return r.result?.result?.value;
}
async function waitFor(name, expr, timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (await ev(expr)) return true;
    await sleep(400);
  }
  note('waitFor 逾時', name);
  return false;
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
  if (r.result?.data) writeFileSync(join(OUT_DIR, `${name}.jpg`), Buffer.from(r.result.data, 'base64'));
}
const bodyText = () => ev('document.body ? document.body.innerText : ""');
const overflowPx = () => ev('document.documentElement.scrollWidth - window.innerWidth');

async function clickByText(selector, text) {
  return ev(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const el = els.find((e) => (e.innerText || e.value || '').includes(${JSON.stringify(text)}));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  })()`);
}
async function tapCenterOf(selector, text) {
  const rect = await ev(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const el = els.find((e) => (e.innerText || '').includes(${JSON.stringify(text)}));
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!rect) return false;
  for (const type of ['touchStart', 'touchEnd']) {
    await send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: rect.x, y: rect.y }] });
  }
  return true;
}
// 捲到含某段文字的元素置中，等動畫沉降後截圖
async function shotAt(text, name, settleMs = 900) {
  const found = await ev(`(() => {
    const els = [...document.querySelectorAll('p, span, h1, h2, h3, button, div')];
    const cand = els.filter((e) => (e.innerText || '').includes(${JSON.stringify(text)}));
    if (!cand.length) return false;
    const el = cand[cand.length - 1]; // 最內層
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  })()`);
  if (!found) { note('shotAt 找不到文字', text.slice(0, 40)); return false; }
  await sleep(settleMs);
  await shot(name);
  return true;
}
async function escapeNext() {
  await ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n', shiftKey: true, altKey: true, bubbles: true }))`);
  await sleep(400);
}

// ---------- 開始走查 ----------
console.log(`\n== ${MODE.toUpperCase()} 走查開始 ==`);
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await waitFor('首頁載入', `document.body && document.body.innerText.includes('傷感電影')`, 20000);

// STEP 0 — Hero
console.log('\n-- Step 0: Hero --');
await shot('00-hero');
if (MOBILE) {
  check('Hero 用觸控輕點前進', await tapCenterOf('button', 'Next · 下一頁'));
} else {
  check('Hero 按 Next 前進', await clickByText('button', 'Next · 下一頁'));
}
await waitFor('進入資格篩選', `document.body.innerText.includes('資格') || document.body.innerText.includes('Eligib')`, 8000);

// STEP 1 — EligibilityScreening（直接走符合路徑）
console.log('\n-- Step 1: 資格篩選 --');
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true }));
  const uni = document.querySelector('select[aria-label="University"]');
  set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await ev(`[...document.querySelectorAll('[role="radiogroup"]')].map((g) => {
  const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合'));
  if (l) { l.click(); return true; }
  return false;
})`);
await sleep(800);
await shot('01-screening');
await clickByText('button', 'Continue');
await waitFor('進入研究資訊頁', `document.body.innerText.includes('Information Sheet')`, 8000);

// STEP 2 — InformedConsent（新增：研究全名中文題目）
console.log('\n-- Step 2: 研究資訊 / 知情同意 --');
let t = await bodyText() || '';
check('同意書頁有英文研究全名', t.includes('The Influence of Sadness Film on Enhancing Psychological Resilience'));
check('同意書頁新增中文研究題目', t.includes('傷感電影與心理韌性及生命意義研究'));
check('資訊頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await sleep(1600); // 等進場動畫跑完再截圖
await shot('02-information');
await clickByText('label', '我已閱讀並理解');
await sleep(400);
await clickByText('button', 'I Agree');
await waitFor('進入同意書', `document.body.innerText.includes('同意書簽署') || document.body.innerText.includes('Consent Form')`, 8000);

// STEP 3 — ConsentSignature（新增：表單下方提示句英文化）
console.log('\n-- Step 3: 同意書（Google 表單）--');
await waitFor('同意書 iframe', `document.querySelectorAll('iframe').length >= 1`, 25000);
await sleep(2500);
t = await bodyText() || '';
check('同意書提示句 EN', t.includes('After you submit, you will automatically continue to the pre-test questionnaires'));
check('同意書提示句 ZH', t.includes('遞交後會自動繼續前往前測問卷'));
check('同意書頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shotAt('After you submit, you will automatically', '03b-consent-hint');
await escapeNext();
await waitFor('進入前測', `document.body.innerText.includes('生命意義感量表')`, 8000);

// STEP 4 — PreTest ×3（新增：三句提示句英文化）
console.log('\n-- Step 4: 前測問卷 ×3 --');
await waitFor('前測 iframe ×3', `document.querySelectorAll('iframe').length >= 3`, 25000);
await sleep(2500);
t = await bodyText() || '';
check('前測1 提示句 EN', t.includes('After submitting, please continue to the next questionnaire'));
check('前測2 提示句 EN', t.includes('After submitting, please continue to the final questionnaire: the Emotion Regulation Questionnaire'));
check('前測ERQ 提示句 EN', t.includes('There are no right or wrong answers'));
check('前測ERQ 提示句 ZH', t.includes('這份問卷沒有對錯，請依直覺作答即可'));
check('前測頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shotAt('After submitting, please continue to the next questionnaire', '04b-pretest1-hint');
await shotAt('After submitting, please continue to the final questionnaire', '04c-pretest2-hint');
await shotAt('There are no right or wrong answers', '04d-pretest-erq-hint');
await escapeNext();
await waitFor('進入準備觀影', `document.body.innerText.includes('Preparing Your Session') || document.body.innerText.includes('準備你的觀影')`, 8000);

// STEP 5 — GroupGate（新增：Participant · 參與者）
console.log('\n-- Step 5: 準備觀影 --');
await waitFor('觀影按鈕出現', `[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue to Videos'))`, 20000);
t = await bodyText() || '';
check('準備頁 Participant 標籤雙語', t.toUpperCase().includes('PARTICIPANT') && t.includes('參與者'));
check('準備頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('05-groupgate');
await clickByText('button', 'Continue to Videos');
await waitFor('進入影片頁', `document.querySelectorAll('video').length >= 1`, 15000);

// STEP 6 — VideoViewer（新增：Scroll for next video 下方中文）
console.log('\n-- Step 6: 影片 --');
await sleep(2500);
t = await bodyText() || '';
check('影片頁滾動提示雙語', t.toUpperCase().includes('SCROLL FOR NEXT VIDEO') && t.includes('向下滾動觀看下一段影片'));
await ev(`document.querySelectorAll('video').forEach((v) => { v.muted = true; v.pause(); })`);
check('影片頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shotAt('向下滾動觀看下一段影片', '06b-scroll-hint', 1500);
await clickByText('button', 'Next · 下一頁');
await waitFor('進入觀影回饋', `document.body.innerText.includes('回饋') || document.querySelectorAll('iframe').length >= 1`, 8000);

// STEP 7 — PostViewFeedback（新增：提示句英文化）
console.log('\n-- Step 7: 觀影回饋 --');
await waitFor('回饋 iframe', `document.querySelectorAll('iframe').length >= 1`, 25000);
await sleep(2500);
t = await bodyText() || '';
check('回饋頁提示句 EN', t.includes('After submitting, you will automatically continue to the next step'));
check('回饋頁提示句 ZH', t.includes('提交後會自動繼續下一步'));
check('回饋頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shotAt('After submitting, you will automatically', '07b-feedback-hint');
await escapeNext();
await waitFor('進入分隔頁', `document.body.innerText.includes('感謝你的回饋')`, 8000);

// STEP 8 — 分隔頁
console.log('\n-- Step 8: 分隔頁 --');
await shot('08-divider');
await clickByText('button', 'Next · 下一頁');
await waitFor('進入後測', `document.querySelectorAll('iframe').length >= 3`, 10000);

// STEP 9 — PostTest ×3（新增：三句提示句 + 移除矛盾句）
console.log('\n-- Step 9: 後測問卷 ×3 --');
await sleep(2500);
t = await bodyText() || '';
check('後測1 提示句 EN', t.includes('After submitting, please continue to the next questionnaire'));
check('後測2 提示句 EN', t.includes('After submitting, please continue to the final questionnaire: the Emotion Regulation Questionnaire'));
check('後測ERQ 提示句 EN', t.includes('This is the final questionnaire — the study ends once you complete it'));
check('後測 CD-RISC 已移除矛盾句（EN）', !t.includes('This is the final questionnaire.'));
check('後測 CD-RISC 已移除矛盾句（ZH）', !t.includes('請完成簡易心理彈性量表。這是最後一份問卷。'));
check('後測頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shotAt('After submitting, please continue to the next questionnaire', '09b-posttest1-hint');
await shotAt('After submitting, please continue to the final questionnaire', '09c-posttest2-hint');
await shotAt('This is the final questionnaire — the study ends', '09d-posttest-erq-hint');
await escapeNext();
await waitFor('進入感謝頁', `document.body.innerText.includes('感謝您的參與') || document.body.innerText.includes('Thank You')`, 8000);

// STEP 10 — ThankYou（新增：Anonymous · 匿名 + 真實電郵）
console.log('\n-- Step 10: 感謝頁 --');
t = await bodyText() || '';
check('感謝頁 Anonymous 雙語', t.includes('Anonymous · 匿名'));
check('感謝頁電郵已換真實地址', t.includes('s1160702@s.eduhk.hk'));
check('感謝頁不再有佔位電郵', !t.includes('research@example.edu'));
check('感謝頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await sleep(2600); // 感謝頁進場動畫最長 delay 1.1s + 0.8s，等它跑完
await shot('10-thankyou');

// ---------- 全域訊號 ----------
console.log('\n== 全域訊號 ==');
const ownErrors = consoleErrors.filter((e) => !/favicon|third-party|deprecat/i.test(e));
check('無未捕捉例外', exceptions.length === 0, exceptions.slice(0, 3).join(' | '));
check('無 console.error', ownErrors.length === 0, ownErrors.slice(0, 3).join(' | '));

// ---------- 收尾 ----------
try { chrome.kill(); } catch {}
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
console.log(`\n== ${MODE.toUpperCase()} 結果：${pass} pass / ${fail} fail ==`);
if (failures.length) { console.log('失敗項目：'); failures.forEach((f) => console.log('  - ' + f)); }
process.exit(fail > 0 ? 1 : 0);
