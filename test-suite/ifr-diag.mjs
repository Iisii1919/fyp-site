import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'ifr-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9464', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
let version = null;
for (let i = 0; i < 30; i++) { try { version = await (await fetch('http://127.0.0.1:9464/json/version')).json(); break; } catch {} await sleep(500); }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 1; const pending = new Map(); const events = [];
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } else if (msg.method && msg.method.startsWith('Target.')) events.push(msg.method + ' ' + (msg.params && msg.params.targetInfo ? msg.params.targetInfo.type : '') + ' ' + (msg.params && msg.params.targetInfo ? (msg.params.targetInfo.url || '').slice(0, 70) : '')); };
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = id++; pending.set(i, res); ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params })); });
await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
const tg = await send('Target.getTargets');
const pageT = tg.result.targetInfos.find((t) => t.type === 'page');
const att = await send('Target.attachToTarget', { targetId: pageT.targetId, flatten: true });
const ps = att.result.sessionId;
await send('Page.enable', {}, ps);
await send('Runtime.evaluate', { expression: `document.body.innerHTML = '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true" width="800" height="2000"></iframe>'` }, ps);
await sleep(10000);
const tree = await send('Page.getFrameTree', {}, ps);
const stack = [tree.result.frameTree];
while (stack.length) {
  const node = stack.pop();
  console.log('FRAME:', node.frame.id.slice(0, 12), node.frame.url.slice(0, 80));
  if (node.frame.url.includes('docs.google.com')) {
    const w = await send('Page.createIsolatedWorld', { frameId: node.frame.id, worldName: 'm', grantUniveralAccess: true }, ps);
    console.log('  createIsolatedWorld →', JSON.stringify(w.result || w.error));
    if (w.result && w.result.contextId) {
      const r = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true, contextId: w.result.contextId }, ps);
      console.log('  scrollHeight →', JSON.stringify(r.result && r.result.result));
    }
  }
  (node.childFrames || []).forEach((c) => stack.push(c));
}
chrome.kill(); process.exit(0);
