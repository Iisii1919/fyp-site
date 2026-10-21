// 組別分配實測：用 ?new=1 連續抽 40 位新參與者，統計組別分佈；
// 再驗證「同一位參與者重新載入組別不變」。
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SITE_PORT = 3112;
const CDP_PORT = 9473;
const DRAWS = 40;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('cmd', ['/c', 'npx', 'next', 'start', '-p', String(SITE_PORT)], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://localhost:${SITE_PORT}/`); if (r.status) break; } catch {}
  await sleep(1000);
}
const profile = mkdtempSync(join(tmpdir(), 'fypgrp-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio', '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
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

const readParticipant = async () => {
  for (let i = 0; i < 20; i++) {
    const raw = await ev(`localStorage.getItem('fyp_participant')`);
    if (raw) return JSON.parse(raw);
    await sleep(300);
  }
  return null;
};

let sadness = 0, neutral = 0, bad = 0;
const ids = new Set();
for (let i = 0; i < DRAWS; i++) {
  // 先直接清掉 localStorage，再載入 —— 保證抽到的是全新的一位
  await ev(`localStorage.removeItem('fyp_participant')`);
  await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
  const p = await readParticipant();
  if (!p || !/^FYP-[0-9A-Z]{10}$/.test(p.id)) { bad++; continue; }
  ids.add(p.id);
  if (p.group === 'sadness') sadness++;
  else if (p.group === 'neutral') neutral++;
  else bad++;
}
console.log(`\n== ${DRAWS} 次新抽籤 ==`);
console.log(`  sadness: ${sadness}（${((sadness / DRAWS) * 100).toFixed(1)}%）`);
console.log(`  neutral: ${neutral}（${((neutral / DRAWS) * 100).toFixed(1)}%）`);
console.log(`  無效: ${bad}`);
console.log(`  ID 唯一數: ${ids.size}/${DRAWS}`);

// 同一位重新載入兩次，組別與 ID 應不變
await ev(`localStorage.removeItem('fyp_participant')`);
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
const first = await readParticipant();
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
const second = await readParticipant();
await send('Page.navigate', { url: `http://localhost:${SITE_PORT}/` });
const third = await readParticipant();
console.log(`\n== 穩定性 ==`);
console.log(`  三次讀到: ${first?.id}/${first?.group} → ${second?.id}/${second?.group} → ${third?.id}/${third?.group}`);
console.log(`  不變: ${first?.id === second?.id && second?.id === third?.id && first?.group === second?.group && second?.group === third?.group ? '✓' : '✗'}`);

chrome.kill();
try { spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
await sleep(300);
process.exit(0);
