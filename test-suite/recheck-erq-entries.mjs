// 正確統計 entry 編號在 ERQ 表單 HTML 中的出現（修正運算優先序 bug）
const FORMS = {
  preTestErq: '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw',
  postTestErq: '1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg',
};
for (const [key, id] of Object.entries(FORMS)) {
  const html = await (await fetch(`https://docs.google.com/forms/d/e/${id}/viewform`)).text();
  console.log('=== ' + key + ' ===');
  for (const entry of ['1372470842', '1789914533', '1270226348', '655340620']) {
    const count = html.split(entry).length - 1;
    console.log(`  ${entry}: 出現 ${count} 次`);
  }
  // 看 entry.1372470842 出現的上下文（是否為題目編號結構）
  const i = html.indexOf('1372470842');
  if (i >= 0) console.log('  上下文: …' + html.slice(i - 60, i + 90).replace(/\s+/g, ' ').slice(0, 150) + '…');
}
