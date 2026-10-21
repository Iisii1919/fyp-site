// 直接驗證 Google 是否接受各表單的 prefill entry 編號：
// 帶 entry.xxx=測試值 請求表單頁，看回應 HTML 有沒有把值渲染進去。
// 這就是 prefill 的運作原理 —— 值出現在 HTML = 填入會成功。
const TEST_PID = 'FYP-TEST00AB12';
const TEST_GROUP = 'K7';

// [表單名, formId, 目前 formPrefill.ts 設定的 pid entry, group entry]
const FORMS = [
  ['consentSignature 同意書', '1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A', '796871681', '674025608'],
  ['preTest1 前測一', '1FAIpQLScVhr-y__tyvPHGai_h0jRF9Db6pPLZdqTE-O6GeC5qd9oj6A', '553754490', '646478281'],
  ['preTest2 前測二', '1FAIpQLSdhW3ivEplLsKicsqOdBVn7aY0kmuI_w8Mml_DcJst1htX4bw', '225204019', '2096796238'],
  ['preTestErq 前測ERQ', '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw', '1372470842', '1789914533'],
  ['viewingFeedback 觀影回饋', '1FAIpQLScO2-onh0sjZlL6LsvLmhnqztt5FQf7XXtZBFqiS8j5ZpVo4Q', '500717267', '1622817753'],
  ['postTest1 後測一', '1FAIpQLSepV_Z8H_1MAGhKSCvIg3IBaIxPKmqzPpaUzuz4QaZ3XNGMcA', '88952271', '951195966'],
  ['postTest2 後測二', '1FAIpQLSfZEBVOQxauanG6meZdXM8-7_6iGO6wck8WeR_uDAazH7_QzA', '1397709291', '1995913222'],
  ['postTestErq 後測ERQ', '1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg', '1372470842', '1789914533'],
];

console.log(`測試值：Participant ID = ${TEST_PID}，Group = ${TEST_GROUP}\n`);
for (const [name, id, pidEntry, grpEntry] of FORMS) {
  const url = `https://docs.google.com/forms/d/e/${id}/viewform?embedded=true&hl=en&entry.${pidEntry}=${TEST_PID}&entry.${grpEntry}=${TEST_GROUP}`;
  const html = await (await fetch(url)).text();
  const pidOk = html.includes(TEST_PID);
  const grpOk = html.includes(TEST_GROUP);
  console.log(`${pidOk && grpOk ? '✓' : '✗'} ${name}: Participant ID ${pidOk ? '填入成功' : '** 沒有進去 **'}，Group ${grpOk ? '填入成功' : '** 沒有進去 **'}`);
}

// ERQ 用「線上實際」的 entry 編號再試一次
console.log('\n--- ERQ 改用線上實際編號（1270226348 / 655340620）---');
for (const [name, id] of [
  ['preTestErq 前測ERQ', '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw'],
  ['postTestErq 後測ERQ', '1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg'],
]) {
  const url = `https://docs.google.com/forms/d/e/${id}/viewform?embedded=true&hl=en&entry.1270226348=${TEST_PID}&entry.655340620=${TEST_GROUP}`;
  const html = await (await fetch(url)).text();
  const pidOk = html.includes(TEST_PID);
  const grpOk = html.includes(TEST_GROUP);
  console.log(`${pidOk && grpOk ? '✓' : '✗'} ${name}: Participant ID ${pidOk ? '填入成功' : '** 沒有進去 **'}，Group ${grpOk ? '填入成功' : '** 沒有進去 **'}`);
}
