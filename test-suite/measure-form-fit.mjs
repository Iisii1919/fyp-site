// 量測 Google 表單 iframe「內容高度 vs 外框高度」——外框太矮會出現表單內捲軸。
// 用瀏覽器級 CDP 連線做 Target.setAutoAttach（iframe 是跨站 OOPIF，頁面級 attach 抓不到）。
//   node test-suite/measure-form-fit.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const SITE_PORT = 3102;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}

async function measureMode(mobile, cdpPort) {
  const profile = mkdtempSync(join(tmpdir(), 'fypfit-'));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio',
    '--lang=en-US', `--window-size=${mobile ? '390,844' : '1440,900'}`,
    ...(PROXY ? [`--proxy-server=${PROXY}`, '--proxy-bypass-list=127.0.0.1;localhost'] : []),
    '--ignore-certificate-errors', 'about:blank',
  ], { stdio: 'ignore' });

  // 瀏覽器級連線
  let version = null;
  for (let i = 0; i < 40; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json(); break; } catch {}
    await sleep(500);
  }
  const bws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => (bws.onopen = r));
  let nextId = 1;
  const pending = new Map();
  const sessions = new Map(); // sessionId → {url, targetId}
  let pageSession = null;
  bws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    if (msg.method === 'Target.attachedToTarget') {
      sessions.set(msg.params.sessionId, { url: msg.params.targetInfo.url, type: msg.params.targetInfo.type });
    }
    if (msg.method === 'Target.detachedFromTarget') sessions.delete(msg.params.sessionId);
  };
  const bsend = (method, params = {}, sessionId) => new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    bws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });

  await bsend('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  // 找到 page target 並 attach
  const { result: { targetInfos } } = await bsend('Target.getTargets');
  const pageT = targetInfos.find((t) => t.type === 'page');
  const att = await bsend('Target.attachToTarget', { targetId: pageT.targetId, flatten: true });
  pageSession = att.result.sessionId;

  const pev = async (expression) => {
    const r = await bsend('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, pageSession);
    return r.result?.result?.value;
  };

  await bsend('Page.enable', {}, pageSession);
  await bsend('Runtime.enable', {}, pageSession);
  if (mobile) {
    await bsend('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, pageSession);
    await bsend('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }, pageSession);
    await bsend('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, pageSession);
  }
  // dialog 自動接受（逃生鍵的 confirm）
  bws.addEventListener?.('message', () => {});
  const origOn = bws.onmessage;
  bws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.method === 'Page.javascriptDialogOpening') bsend('Page.handleJavaScriptDialog', { accept: true }, msg.sessionId);
    origOn({ data: m.data });
  };

  await bsend('Page.navigate', { url: `http://localhost:${SITE_PORT}/` }, pageSession);
  const waitFor = async (expr, ms = 20000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await pev(expr)) return true; await sleep(400); }
    return false;
  };
  await waitFor(`document.body && document.body.innerText.includes('傷感電影')`);
  await sleep(2500); // 等 React hydration，否則按鈕還沒綁事件

  // 走到同意書頁
  await pev(`[...document.querySelectorAll('button')].find((b) => b.innerText.includes('Next · 下一頁'))?.click()`);
  await waitFor(`document.body.innerText.includes('Eligibility')`);
  await sleep(800);
  await pev(`(() => {
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
  await sleep(500);
  await pev(`[...document.querySelectorAll('button')].find((b) => b.innerText.includes('Continue'))?.click()`);
  await waitFor(`document.body.innerText.includes('有關資料')`);
  await pev(`[...document.querySelectorAll('label')].find((l) => l.innerText.includes('我已閱讀並理解'))?.click()`);
  await sleep(300);
  await pev(`[...document.querySelectorAll('button')].find((b) => b.innerText.includes('I Agree'))?.click()`);
  await waitFor(`document.querySelectorAll('iframe').length >= 1`);

  const measure = async (label, expected) => {
    const got = await waitFor(`document.querySelectorAll('iframe').length >= ${expected}`);
    if (!got) console.log(`  [${label}] waitFor iframe 逾時，目前 iframe 數 = ${await pev('document.querySelectorAll("iframe").length')}，頁面文字：${String(await pev('document.body.innerText')).slice(0, 80)}`);
    // 等 Google 表單文件載入
    await sleep(9000);
    const frames = await pev(`[...document.querySelectorAll('iframe')].map((f) => ({ src: f.src, h: Math.round(f.getBoundingClientRect().height), title: f.title }))`);
    console.log(`  [${label}] 父頁 iframe：${(frames || []).map((f) => f.src.slice(0, 50)).join(' | ') || '無'}`);
    // 跨來源 iframe 同程序 → 用 Page.getFrameTree + createIsolatedWorld 量文件高度
    const tree = await bsend('Page.getFrameTree', {}, pageSession);
    const gframes = [];
    const stack = [tree.result?.frameTree];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (node.frame.url && node.frame.url.includes('docs.google.com')) gframes.push(node.frame);
      (node.childFrames || []).forEach((c) => stack.push(c));
    }
    const results = [];
    for (const f of frames.filter((x) => x.src.includes('docs.google.com'))) {
      const gf = gframes.find((g) => g.url.slice(0, 70) === f.src.slice(0, 70)) || gframes.find((g) => g.url.includes(f.src.split('?')[0].split('/e/')[1] || '@@@'));
      let docH = -1;
      if (gf) {
        const w = await bsend('Page.createIsolatedWorld', { frameId: gf.id, worldName: 'measure', grantUniveralAccess: true }, pageSession);
        const ctxId = w.result?.executionContextId ?? w.result?.contextId;
        if (ctxId) {
          const r = await bsend('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true, contextId: ctxId }, pageSession);
          docH = r.result?.result?.value ?? -1;
        }
      }
      results.push({ title: f.title, outer: f.h, doc: docH, ok: docH > 0 && f.h >= docH });
    }
    console.log(`  [${label}]`);
    for (const r of results) {
      console.log(`    ${r.ok ? 'OK  ' : '⚠️  '} ${r.title}: 外框 ${r.outer}px / 內容 ${r.doc}px ${r.doc > r.outer ? `→ 內捲軸！缺 ${r.doc - r.outer}px` : ''}`);
    }
    if (!results.length) console.log('    （沒量到 iframe 文件）');
    return results;
  };

  await measure('同意書', 1);
  // 逃生鍵到前測
  await pev(`window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n', shiftKey: true, altKey: true, bubbles: true }))`);
  await waitFor(`document.querySelectorAll('iframe').length >= 3`);
  await measure('前測 ×3', 3);

  try { chrome.kill(); } catch {}
}

console.log('== 桌機 1440px ==');
await measureMode(false, 9462);
console.log('== 手機 390px ==');
await measureMode(true, 9463);
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(500);
process.exit(0);
