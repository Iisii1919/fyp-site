// Google Form 嵌入高度表（iframe 高度）。
//
// ⚠️ 這裡的數字全部是「實測」出來的，不是估的。
// 只要在對應的 Google Form 新增／刪除題目或區段，就必須重新量測並更新這裡，
// 否則會出現內頁捲軸（高度太小）或下方留一大片空白（高度太大）。
//
// 量測方法（CDP 驅動 headless Chrome）：
//   把表單載進一個 iframe，**iframe 高度先設 300px 讓內容溢出**，
//   再讀 iframe 內文件的 document.documentElement.scrollHeight。
//   （iframe 比內容高時 scrollHeight 會被夾在 viewport 高度，量到的是錯的數字。）
//   腳本：`node ~/.workbuddy-ai/tmp/formtest/measure-form.mjs <formId>`
//
// 表格式：[最小寬度, 該寬度下的內容高度]，由寬到窄排列。
// 查表取「該級距最小寬度」的量測值（寬度越小、內容越高），再加一點緩衝。
//
// 2026-09-13 全面重測：同意書合併成單頁後變高，且發現 5 份問卷原本寫死的高度
// 全部都不夠（都出現內頁捲軸），因此統一改成依容器寬度查表。

type HeightTable = ReadonlyArray<readonly [minWidth: number, contentHeight: number]>;

/** 依容器寬度查表，回傳 iframe 該給的高度。 */
function makeHeightFn(table: HeightTable, buffer = 30) {
  return (w: number) => {
    for (const [minWidth, height] of table) {
      if (w >= minWidth) return height + buffer;
    }
    return table[table.length - 1][1] + buffer;
  };
}

// 同意書（單頁：正文＋勾選＋簽名＋日期＋確認）
// 實測 768/720 → 2399 ／ 640 → 2527 ／ 560 → 2571 ／ 480 → 2775 ／ 440 → 2859
//      390 → 3010 ／ 360 → 3158 ／ 340 → 3310 ／ 320 → 3434 ／ 300 → 3534
//      288 → 3646 ／ 276 → 3834
export const consentHeightForWidth = makeHeightFn([
  [720, 2399],
  [640, 2527],
  [560, 2571],
  [480, 2775],
  [440, 2859],
  [390, 3010],
  [360, 3158],
  [340, 3310],
  [320, 3434],
  [300, 3534],
  [288, 3646],
  [276, 3834],
]);

// 前測（一）：實測 720 → 2763 ／ 640 → 2860 ／ 560 → 2884 ／ 480 → 2904 ／ 440 → 2976
//              390 → 3068 ／ 360 → 3136 ／ 340 → 3240 ／ 320 → 3444 ／ 300 → 3588 ／ 288 → 3791
export const preTest1HeightForWidth = makeHeightFn([
  [720, 2763],
  [640, 2860],
  [560, 2884],
  [480, 2904],
  [440, 2976],
  [390, 3068],
  [360, 3136],
  [340, 3240],
  [320, 3444],
  [300, 3588],
  [288, 3791],
]);

// 前測（二）與後測（二）是同一份復原力量表（10 題），實測高度完全相同：
//   720 → 4041 ／ 640 → 4094 ／ 560 → 4166 ／ 480 → 4238 ／ 440 → 4378
//   390 → 4542 ／ 360 → 4610 ／ 340 → 4654 ／ 320 → 4726 ／ 300 → 4842 ／ 288 → 4909
const RESILIENCE_TABLE: HeightTable = [
  [720, 4041],
  [640, 4094],
  [560, 4166],
  [480, 4238],
  [440, 4378],
  [390, 4542],
  [360, 4610],
  [340, 4654],
  [320, 4726],
  [300, 4842],
  [288, 4909],
];

export const preTest2HeightForWidth = makeHeightFn(RESILIENCE_TABLE);
export const postTest2HeightForWidth = makeHeightFn(RESILIENCE_TABLE);

// 後測（一）：實測 720 → 2811 ／ 640 → 2884 ／ 560 → 2980 ／ 480 → 3068 ／ 440 → 3116
//              390 → 3208 ／ 360 → 3276 ／ 340 → 3356 ／ 320 → 3608 ／ 300 → 3776 ／ 288 → 4003
export const postTest1HeightForWidth = makeHeightFn([
  [720, 2811],
  [640, 2884],
  [560, 2980],
  [480, 3068],
  [440, 3116],
  [390, 3208],
  [360, 3276],
  [340, 3356],
  [320, 3608],
  [300, 3776],
  [288, 4003],
]);

// 觀看回饋：實測 720 → 1474 ／ 640 → 1508 ／ 560 → 1532 ／ 480 → 1618 ／ 440 → 1666
//           390 → 1738 ／ 360 → 1762 ／ 340 → 1762 ／ 320 → 1872 ／ 300 → 1916 ／ 288 → 1940
export const viewingFeedbackHeightForWidth = makeHeightFn([
  [720, 1474],
  [640, 1508],
  [560, 1532],
  [480, 1618],
  [440, 1666],
  [390, 1738],
  [360, 1762],
  [340, 1762],
  [320, 1872],
  [300, 1916],
  [288, 1940],
]);
