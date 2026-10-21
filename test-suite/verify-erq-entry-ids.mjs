// 補查兩份 ERQ 表單的 Participant ID / Group entry 編號（get-entry-ids.mjs 沒涵蓋）。
const FORMS = {
  preTestErq: '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw',
  postTestErq: '1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg',
};
const EXPECTED = { participantId: '1372470842', group: '1789914533' };

for (const [key, id] of Object.entries(FORMS)) {
  const url = `https://docs.google.com/forms/d/e/${id}/viewform`;
  const html = await (await fetch(url)).text();
  // FB_PUBLIC_LOAD_DATA_ 裡每題的結構：[entry編號, "題目", ...]
  const pidIdx = html.indexOf('Participant ID');
  const grpIdx = html.indexOf('Group');
  // 往題目前面找最近的 entry 編號（題目在編號之後出現）
  const findEntry = (labelIdx) => {
    if (labelIdx < 0) return null;
    const before = html.slice(Math.max(0, labelIdx - 3000), labelIdx);
    const matches = [...before.matchAll(/\[(\d{6,12}),\s*$/gm)];
    // 備援：找 [數字, 後接題目 的模式
    const m2 = [...before.matchAll(/\[(\d{6,12}),"/g)];
    const all = matches.concat(m2);
    return all.length ? all[all.length - 1][1] : null;
  };
  // 更直接：找 ["entry 數字","Participant ID" 相鄰出現
  const direct = [...html.matchAll(/\[(\d{6,12}),"((?:Participant ID|Group)[^"]*)"/g)];
  console.log(`=== ${key} ===`);
  let pid = null, grp = null;
  for (const m of direct) {
    if (/Participant ID/.test(m[2]) && !pid) pid = m[1];
    if (/^Group/.test(m[2]) && !grp) grp = m[1];
  }
  if (!pid) pid = findEntry(pidIdx);
  if (!grp) grp = findEntry(grpIdx);
  console.log(`  Participant ID → entry.${pid}  ${pid === EXPECTED.participantId ? '✓ 與 formPrefill.ts 一致' : '✗ 不一致！formPrefill.ts 是 entry.' + EXPECTED.participantId}`);
  console.log(`  Group         → entry.${grp}  ${grp === EXPECTED.group ? '✓ 與 formPrefill.ts 一致' : '✗ 不一致！formPrefill.ts 是 entry.' + EXPECTED.group}`);
}
