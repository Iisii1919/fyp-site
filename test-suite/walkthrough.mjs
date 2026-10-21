// FYP site end-to-end walkthrough (desktop & mobile), self-contained.
//
//   node test-suite/walkthrough.mjs            → desktop 1440×900
//   node test-suite/walkthrough.mjs --mobile   → iPhone-ish 390×844 + touch
//
// 走的流程與真實參與者相同，只有兩個刻意的例外：
//   1. 不真的「送出」任何 Google 表單（避免污染研究資料）——
//      問卷頁用研究員逃生鍵 Shift+Alt+N 前進（會過 confirm 對話框）。
//   2. 影片不看完，只驗證能載入、能播放，然後用頁面自帶的 chevron 前進。
//
// 檢查項目：每步地標文字、水平溢出、console 錯誤、例外、失敗請求、
// iframe 載入與高度（內容高度 vs 外框高度）、prefill 參數、影片播放、
// 中途重新載入的「接續上次進度」提示、（手機版）觸控滑動與輕點。

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MOBILE = process.argv.includes('--mobile');
const IPAD = process.argv.includes('--ipad');
const IPAD_LANDSCAPE = process.argv.includes('--ipad-landscape');
const TOUCH = MOBILE || IPAD || IPAD_LANDSCAPE;
const WIDTH = MOBILE ? 390 : IPAD ? 820 : IPAD_LANDSCAPE ? 1180 : 1440;
const HEIGHT = MOBILE ? 844 : IPAD ? 1180 : IPAD_LANDSCAPE ? 820 : 900;
const MODE = MOBILE ? 'mobile' : IPAD ? 'ipad' : IPAD_LANDSCAPE ? 'ipad-landscape' : 'desktop';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const CDP_PORT = MOBILE ? 9461 : IPAD ? 9462 : IPAD_LANDSCAPE ? 9463 : 9460;
const SITE_PORT = 3100;
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
const profile = mkdtempSync(join(tmpdir(), 'fypwalk-'));
const chrome = spawn(CHROME, [
  '--disable-component-update', '--disable-background-networking', '--disable-sync',
  '--disable-client-side-phishing-detection', '--disable-domain-reliability',
  '--disable-default-apps', '--no-service-autorun', '--disable-breakpad',
  '--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
  '--lang=en-US', `--window-size=${WIDTH},${HEIGHT}`,
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
const iframeSessions = new Map(); // sessionId → url
const consoleErrors = [], consoleWarnings = [], exceptions = [], badResponses = [], failedRequests = [], dialogs = [];

ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
  const p = msg.params || {};
  switch (msg.method) {
    case 'Target.attachedToTarget':
      iframeSessions.set(p.sessionId, p.targetInfo?.url || '');
      break;
    case 'Target.detachedFromTarget':
      iframeSessions.delete(p.sessionId);
      break;
    case 'Runtime.consoleAPICalled':
      if (p.type === 'error') consoleErrors.push(p.args?.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300));
      if (p.type === 'warning') consoleWarnings.push(p.args?.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300));
      break;
    case 'Runtime.exceptionThrown':
      exceptions.push((p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || '').slice(0, 300));
      break;
    case 'Network.responseReceived': {
      const { response } = p;
      if (response.status >= 400) badResponses.push(`${response.status} ${response.url.slice(0, 140)}`);
      break;
    }
    case 'Network.loadingFailed':
      if (!p.canceled && p.errorText !== 'net::ERR_ABORTED') {
        failedRequests.push(`${p.errorText} ${(p.request?.url || '').slice(0, 120)}`);
      }
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
await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });

if (TOUCH) {
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setUserAgentOverride', {
    userAgent: IPAD || IPAD_LANDSCAPE
      ? 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
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
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
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
async function swipeUp() {
  const x = Math.round(WIDTH / 2), y0 = Math.round(HEIGHT * 0.77), y1 = Math.round(HEIGHT * 0.3);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= 5; i++) {
    await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 5 }] });
    await sleep(30);
  }
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function escapeNext() {
  await ev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n', shiftKey: true, altKey: true, bubbles: true }))`);
  await sleep(300); // 等 confirm 被自動接受
}
async function iframeReport() {
  // 父頁的 iframe 元素
  const frames = await ev(`[...document.querySelectorAll('iframe')].map((f) => ({
    src: f.src, height: Math.round(f.getBoundingClientRect().height), title: f.title,
  }))`);
  // iframe 文件高度：優先用 attached target session，否則用 isolated world
  const docs = [];
  const seen = new Set();
  for (const [sid, url] of iframeSessions) {
    if (!url.includes('docs.google.com')) continue;
    const r = await send('Runtime.evaluate', {
      expression: 'document.documentElement ? document.documentElement.scrollHeight : 0',
      returnByValue: true,
    }, sid);
    docs.push({ url, docHeight: r.result?.result?.value ?? -1 });
    seen.add(url.slice(0, 60));
  }
  if (docs.length === 0) {
    // fallback：跨來源 iframe 若在同程序（無獨立 target），用 isolated world 量
    const tree = await send('Page.getFrameTree');
    const stack = [tree.result?.frameTree];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      const fr = node.frame;
      if (fr && fr.url && fr.url.includes('docs.google.com')) {
        const w = await send('Page.createIsolatedWorld', { frameId: fr.id, worldName: 'measure', grantUniveralAccess: true });
        const ctxId = w.result?.contextId;
        if (ctxId) {
          const r = await send('Runtime.evaluate', {
            expression: 'document.documentElement ? document.documentElement.scrollHeight : 0',
            returnByValue: true, contextId: ctxId,
          });
          docs.push({ url: fr.url, docHeight: r.result?.result?.value ?? -1 });
        }
      }
      (node.childFrames || []).forEach((c) => stack.push(c));
    }
  }
  return { frames: frames || [], docs };
}
async function checkFormIframes(stepName, expectedCount) {
  const ok = await waitFor(`${stepName} iframe 出現`, `document.querySelectorAll('iframe').length >= ${expectedCount}`, 25000);
  check(`${stepName}：iframe 數量 = ${expectedCount}`, ok);
  if (!ok) return;
  // 等 prefill 套用（src 帶 entry.）
  await waitFor(`${stepName} prefill`, `[...document.querySelectorAll('iframe')].every((f) => f.src.includes('entry.'))`, 10000);
  const rep = await iframeReport();
  const googleFrames = rep.frames.filter((f) => f.src.includes('docs.google.com'));
  check(`${stepName}：Google iframe 數量`, googleFrames.length === expectedCount, `${googleFrames.length}/${expectedCount}`);
  for (const f of googleFrames) {
    check(`${stepName}：iframe 帶 hl=en`, f.src.includes('hl=en'));
    check(`${stepName}：iframe 帶 prefill entry`, f.src.includes('entry.'));
    break; // 同頁規則一致，查一個代表即可
  }
  // 等表單文件載入
  await waitFor(`${stepName} 表單文件`, `(${iframeSessions.size} >= 0) && true`, 1000); // session 由事件建立
  await sleep(4000);
  const rep2 = await iframeReport();
  for (const d of rep2.docs) {
    const frameEl = rep2.frames.find((f) => d.url.startsWith(f.src.split('&entry.')[0].slice(0, 60)) || f.src.slice(0, 60) === d.url.slice(0, 60));
    const outer = frameEl?.height ?? -1;
    check(`${stepName}：表單內容高度 ${d.docHeight}px ≤ 外框 ${outer}px`, d.docHeight > 0 && outer > 0 && d.docHeight <= outer, `doc=${d.docHeight} outer=${outer}`);
  }
  if (rep2.docs.length === 0) note(stepName, '沒有抓到 iframe session，無法量內容高度');
}

// ---------- 開始走查 ----------
console.log(`\n== ${MODE.toUpperCase()} 走查開始 ==`);
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
await waitFor('首頁載入', `document.body && document.body.innerText.includes('傷感電影')`, 20000);

// STEP 0 — Hero
console.log('\n-- Step 0: Hero --');
check('Hero 地標', /傷感電影與心理韌性/.test(await bodyText() || ''));
check('Hero 無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await sleep(2200); // Hero 進場動畫是交錯淡入，等跑完再截圖
await shot('00-hero');
if (TOUCH) {
  check('Hero 用觸控輕點前進', await tapCenterOf('button', 'Next · 下一頁'));
} else {
  check('Hero 按 Next 前進', await clickByText('button', 'Next · 下一頁'));
}
await waitFor('進入資格篩選', `document.body.innerText.includes('資格') || document.body.innerText.includes('Eligib')`, 8000);

// STEP 1 — EligibilityScreening
console.log('\n-- Step 1: 資格篩選 --');
check('篩選頁地標', /年齡|Age range/i.test(await bodyText() || ''));
await shot('01-screening-empty');
const clickConfirmYes = () => ev(`[...document.querySelectorAll('[role="radiogroup"]')].map((g) => {
  const l = [...g.querySelectorAll('label')].find((x) => x.innerText.includes('是，我符合'));
  if (l) { l.click(); return true; }
  return false;
})`);
// 先測「不符合」路徑：31 歲以上 + 任一大學 + 所有確認題選「是」
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '31 歲或以上 / 31 or above'); age.dispatchEvent(new Event('change', { bubbles: true }));
  const uni = document.querySelector('select[aria-label="University"]');
  set.call(uni, '香港大學 / The University of Hong Kong'); uni.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await clickConfirmYes();
await sleep(800);
let t = await bodyText() || '';
check('不符合時出現勸退說明', t.includes('不符合本研究的參與資格'), t.slice(0, 60));
const contVisibleRejected = await ev(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue') && b.offsetParent !== null)`);
check('不符合時 Continue 按鈕隱藏', contVisibleRejected === false);
await shot('01b-screening-rejected');
// 改成符合：19–22 歲
await ev(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  const age = document.querySelector('select[aria-label="Age range"]');
  set.call(age, '19–22 歲 / years old'); age.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await sleep(600);
t = await bodyText() || '';
check('符合後勸退說明消失', !t.includes('不符合本研究的參與資格'));
const contVisibleOk = await ev(`[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue') && b.offsetParent !== null)`);
check('符合後 Continue 按鈕出現', contVisibleOk === true);
check('篩選頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('01c-screening-eligible');
await clickByText('button', 'Continue');
await waitFor('進入研究資訊頁', `document.body.innerText.includes('有關資料') || document.body.innerText.includes('Information Sheet')`, 8000);

// STEP 2 — InformedConsent
console.log('\n-- Step 2: 研究資訊 / 知情同意 --');
check('資訊頁地標', /有關資料|Information Sheet/.test(await bodyText() || ''));
const agreeDisabled = await ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('I Agree')); return b ? b.disabled : null; })()`);
check('未勾選時同意鈕 disabled', agreeDisabled === true);
await clickByText('label', '我已閱讀並理解');
await sleep(400);
const agreeEnabled = await ev(`(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('I Agree')); return b ? !b.disabled : null; })()`);
check('勾選後同意鈕可用', agreeEnabled === true);
check('資訊頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('02-information');
await clickByText('button', 'I Agree');
await waitFor('進入同意書', `document.body.innerText.includes('同意書簽署') || document.body.innerText.includes('Consent Form')`, 8000);

// 參與者編號（此時應已產生）
const pid = await ev(`(localStorage.getItem('fyp_participant') || '')`);
check('參與者編號已建立且格式正確', /FYP-[0-9A-Z]{10}/.test(pid) || /FYP-DEV/.test(pid), pid.slice(0, 40));

// STEP 3 — ConsentSignature
console.log('\n-- Step 3: 同意書（Google 表單）--');
check('同意書頁地標', /同意書簽署|Consent Form/.test(await bodyText() || ''));
await checkFormIframes('同意書', 1);
check('同意書頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('03-consent-form');
await escapeNext();
await waitFor('進入前測', `document.body.innerText.includes('生命意義感量表')`, 8000);

// STEP 4 — PreTest（3 份表單）+ 接續測試
console.log('\n-- Step 4: 前測問卷 ×3 --');
await checkFormIframes('前測', 3);
check('前測進度卡', /生命意義感量表/.test(await bodyText() || ''));
check('前測頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
if (TOUCH) {
  const y0 = await ev('window.scrollY');
  await swipeUp();
  await sleep(300);
  const y1 = await ev('window.scrollY');
  check('問卷頁觸控滑動有效', y1 > y0 + 100, `${y0} → ${y1}`);
  // 等慣性滾動完全停下再判定。iPad 尺寸的滑動距離長、慣性可持續 1–2 秒，
  // 固定等 1200ms 經常還在漂，造成假陰性（2026-10-21 連續兩次 1249→2051）。
  let y2 = y1;
  for (let i = 0; i < 12; i++) {
    await sleep(400);
    const yc = await ev('window.scrollY');
    if (Math.abs(yc - y2) < 5) { y2 = yc; break; }
    y2 = yc;
  }
  // 這個測試的本意是防「被捲動吸附拉回去」：停穩後位置不得明顯小於滑動剛結束時。
  // 往前多滑一段是正常慣性，不是 bug，所以不設上限。
  check('問卷頁滑動後不被吸附拉回', y2 >= y1 - 80, `${y1} → ${y2}`);
}
await shot('04-pretest');
// 接續測試：重新載入 → 應出現提示 → 接續後回到前測
await send('Page.reload', { ignoreCache: false });
await waitFor('接續提示出現', `document.body.innerText.includes('接續上次進度')`, 15000);
t = await bodyText() || '';
check('重新載入後出現接續提示', t.includes('接續上次進度'));
check('接續提示指到「前測問卷」', t.includes('前測問卷'));
await shot('04b-resume-prompt');
await clickByText('button', '接續上次進度');
await waitFor('回到前測', `document.querySelectorAll('iframe').length >= 3`, 15000);
check('接續後回到前測頁', (await ev(`document.querySelectorAll('iframe').length`)) >= 3);
await escapeNext();
await waitFor('進入準備觀影', `document.body.innerText.includes('Preparing Your Session') || document.body.innerText.includes('準備你的觀影')`, 8000);

// STEP 5 — GroupGate
console.log('\n-- Step 5: 準備觀影 --');
check('準備頁地標', /Preparing Your Session|準備你的觀影/.test(await bodyText() || ''));
await waitFor('觀影按鈕出現', `[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Continue to Videos'))`, 20000);
check('準備頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('05-groupgate');
await clickByText('button', 'Continue to Videos');
await waitFor('進入影片頁', `document.querySelectorAll('video').length >= 1`, 15000);

// STEP 6 — VideoViewer
console.log('\n-- Step 6: 影片 --');
const videoCount = await ev(`document.querySelectorAll('video').length`);
check('影片元素數量 = 4', videoCount === 4, `count=${videoCount}`);
const vsrc = await ev(`[...document.querySelectorAll('video')].map((v) => v.currentSrc || v.src || (v.querySelector('source') && v.querySelector('source').src) || '')`);
for (const s of vsrc || []) {
  check('影片走 R2 託管', s.includes('r2.dev'), s.slice(0, 80));
}
const play = await ev(`(() => {
  const v = document.querySelector('video');
  if (!v) return { err: 'no video' };
  v.muted = true;
  return v.play().then(() => new Promise((r) => setTimeout(() => r({ t: v.currentTime, rs: v.readyState, err: v.error && v.error.code }), 3000)))
    .catch((e) => ({ playErr: String(e) }));
})()`);
check('影片可播放（3 秒內 currentTime 前進）', play && play.t > 0.3, JSON.stringify(play));
check('影片 readyState ≥ 2', play && play.rs >= 2, `readyState=${play && play.rs}`);
await shot('06-video-playing');
await ev(`document.querySelectorAll('video').forEach((v) => v.pause())`);
check('影片頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
// 往下捲一個視窗高，拍第一支片段的實際排版（平板寬度會走 md 並排版型，要目視確認）
await ev(`window.scrollBy(0, Math.round(window.innerHeight * 1.05))`);
await sleep(1800);
await shot('06b-clip-layout');
await clickByText('button', 'Next · 下一頁');
await waitFor('進入觀影回饋', `document.body.innerText.includes('回饋') || document.body.innerText.includes('Feedback') || document.querySelectorAll('iframe').length >= 1`, 8000);

// STEP 7 — PostViewFeedback
console.log('\n-- Step 7: 觀影回饋 --');
await checkFormIframes('觀影回饋', 1);
await shot('07-feedback');
await escapeNext();
await waitFor('進入分隔頁', `document.body.innerText.includes('感謝你的回饋')`, 8000);

// STEP 8 — 分隔頁
console.log('\n-- Step 8: 分隔頁 --');
check('分隔頁地標', /感謝你的回饋/.test(await bodyText() || ''));
await shot('08-divider');
await clickByText('button', 'Next · 下一頁');
await waitFor('進入後測', `document.querySelectorAll('iframe').length >= 3`, 10000);

// STEP 9 — PostTest
console.log('\n-- Step 9: 後測問卷 ×3 --');
await checkFormIframes('後測', 3);
check('後測頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('09-posttest');
await escapeNext();
await waitFor('進入感謝頁', `document.body.innerText.includes('感謝您的參與') || document.body.innerText.includes('Thank You')`, 8000);

// STEP 10 — ThankYou
console.log('\n-- Step 10: 感謝頁 --');
check('感謝頁地標', /感謝您的參與|Thank You/.test(await bodyText() || ''));
check('感謝頁無水平溢出', (await overflowPx()) <= 1, `overflow=${await overflowPx()}`);
await shot('10-thankyou');

// ---------- 全域訊號 ----------
console.log('\n== 全域訊號 ==');
const ownErrors = consoleErrors.filter((e) => !/favicon|third-party|deprecat/i.test(e));
check('無未捕捉例外', exceptions.length === 0, exceptions.slice(0, 3).join(' | '));
check('無 console.error', ownErrors.length === 0, ownErrors.slice(0, 3).join(' | '));
const ownBad = badResponses.filter((b) => /localhost:3100|r2\.dev|docs\.google\.com/.test(b));
check('本站／R2／表單無 ≥400 回應', ownBad.length === 0, ownBad.slice(0, 4).join(' | '));
if (badResponses.length > ownBad.length) note('其他 ≥400（第三方）', badResponses.filter((b) => !ownBad.includes(b)).slice(0, 3).join(' | '));
if (failedRequests.length) note('失敗請求', failedRequests.slice(0, 3).join(' | '));
if (consoleWarnings.length) note('console 警告數', String(consoleWarnings.length));
note('逃生鍵 confirm 次數', String(dialogs.length));

// ---------- 收尾 ----------
try { chrome.kill(); } catch {}
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
console.log(`\n== ${MODE.toUpperCase()} 結果：${pass} pass / ${fail} fail ==`);
if (failures.length) { console.log('失敗項目：'); failures.forEach((f) => console.log('  - ' + f)); }
process.exit(fail > 0 ? 1 : 0);
