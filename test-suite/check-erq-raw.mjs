const FORMS = {
  preTestErq: '1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw',
  postTestErq: '1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg',
};
for (const [key, id] of Object.entries(FORMS)) {
  const html = await (await fetch(`https://docs.google.com/forms/d/e/${id}/viewform`)).text();
  console.log('=== ' + key + ' ===');
  for (const entry of ['1372470842', '1789914533', '1270226348', '655340620']) {
    console.log('  entry.' + entry + ' 出現次數: ' + html.split(entry).length - 1);
  }
  // 印出 Participant ID / Group 附近的結構（前 120 字元）
  for (const label of ['Participant ID', '"Group"']) {
    const i = html.indexOf(label);
    if (i >= 0) console.log('  [' + label + ' 前文] …' + html.slice(i - 120, i + 40).replace(/\s+/g, ' '));
  }
}
