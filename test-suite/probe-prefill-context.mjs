// 精確版：檢查預填值出現在 HTML 的「什麼位置」。
// 真的填進欄位 = 出現在 <input ... value="測試值"> 或 data-params 結構裡與 entry 編號相鄰。
// 假陽性 = 只出現在 Google 回聲 URL 參數的 JS 區塊。
const TEST_PID = 'FYP-TEST00AB12';
const TEST_GROUP = 'K7';

async function probe(label, id, pidEntry, grpEntry) {
  const url = `https://docs.google.com/forms/d/e/${id}/viewform?embedded=true&hl=en&entry.${pidEntry}=${TEST_PID}&entry.${grpEntry}=${TEST_GROUP}`;
  const html = await (await fetch(url)).text();
  console.log(`=== ${label}（entry.${pidEntry} / entry.${grpEntry}）===`);
  // 1. input value 屬性裡有沒有
  const asInputValue = html.includes(`value="${TEST_PID}"`);
  // 2. 所有出現位置的上下文
  let idx = -1, n = 0;
  const contexts = [];
  while ((idx = html.indexOf(TEST_PID, idx + 1)) >= 0 && n < 5) {
    contexts.push(html.slice(idx - 90, idx + 30).replace(/\s+/g, ' '));
    n++;
  }
  console.log(`  作為 input value="${TEST_PID}": ${asInputValue ? '是 ✓' : '否'}`);
  console.log(`  出現 ${n} 次（最多列 5 處上下文）:`);
  contexts.forEach((c, i) => console.log(`    [${i}] …${c}…`));
  const gAsValue = html.includes(`value="${TEST_GROUP}"`) || html.includes(`"${TEST_GROUP}"`);
  console.log(`  Group「${TEST_GROUP}」出現: ${gAsValue ? '是' : '否'}`);
  let gi = html.indexOf(TEST_GROUP);
  if (gi >= 0) console.log(`    Group 上下文: …${html.slice(gi - 90, gi + 20).replace(/\s+/g, ' ')}…`);
  console.log('');
}

await probe('preTest1（已知正確）', '1FAIpQLScVhr-y__tyvPHGai_h0jRF9Db6pPLZdqTE-O6GeC5qd9oj6A', '553754490', '646478281');
await probe('preTestErq 舊編號（formPrefill.ts 現值）', '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw', '1372470842', '1789914533');
await probe('preTestErq 新編號（線上實際）', '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw', '1270226348', '655340620');
