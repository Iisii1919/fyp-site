// 招募資格篩選的題目內容（網站原生，不再用 Google 表單）。
//
// ---------------------------------------------------------------
// 這些文字**直接對應原本那份 Google 篩選表單**（2026-10-13 用 probe-screening-live.mjs
// 重新讀取線上表單的 FB_PUBLIC_LOAD_DATA_ 核對過），所以用字遣詞以雙語並列為準，
// 不要自作主張改寫成更通順的英文 —— 題目在論文附錄裡要能對得起來。
//
// ⚠️ 2026-10-13 起這一頁不再是 iframe，資格判斷改由本地 state 做，
//    所以這裡的 choices **同時是畫面選項也是判斷依據**，改動時要一起看。
// ---------------------------------------------------------------

/** 年齡級距。判斷用：只有 `eligible: true` 的級距能繼續。 */
export interface AgeBand {
  /** 下拉選單顯示的文字（雙語）。 */
  label: string;
  /** 是否符合招募年齡（16–30）。 */
  eligible: boolean;
}

// ⚠️ 為什麼收「級距」而不是收「實際歲數」：
//    1. 這一關只需要「16–30 / 不在範圍內」這個二分結果，逐歲數字對判斷沒有額外貢獻。
//    2. 篩選階段**刻意匿名**（見檔頭說明），任何收進來卻無法對應到參與者的資料
//       都只會變成一份無主紀錄 —— 收得越細，越像在蒐集可識別資訊。
//       所以級距是「剛好夠用」的最小顆粒度。
//
// ⚠️ 級距與原本 Google 表單**不是**一對一：原表單是 15 或以下 / 16 / 17 … / 30 / 31 或以上（17 項）。
//    這裡把符合的 16–30 合併成幾個區間，因為判斷結果完全相同。
//    下方「不符合」的兩級則刻意與原表單一致，方便事後對照。
export const AGE_BANDS: readonly AgeBand[] = [
  { label: '15 歲或以下 / 15 or below', eligible: false },
  { label: '16–18 歲 / years old', eligible: true },
  { label: '19–22 歲 / years old', eligible: true },
  { label: '23–26 歲 / years old', eligible: true },
  { label: '27–30 歲 / years old', eligible: true },
  { label: '31 歲或以上 / 31 or above', eligible: false },
];

/**
 * 「其他」選項。
 *
 * ⚠️ 單獨 export 是因為**它要能與上面 16 所區分開**：
 *    畫面在主觀感上是 16 所 + 其他，但邏輯上必須知道參與者選的是哪一種。
 *    選「其他」不一定代表不符合 —— 有些香港院校本來就不在名單上；
 *    是否放行仍由下面那題確認題決定。這裡把它標記出來，只是為了讓
 *    提示文字能講得準確（選其他時提醒一次「若不是香港的大學請選否」）。
 *
 * ⚠️ 必須宣告在 UNIVERSITIES **之前**：UNIVERSITIES 內部會引用它，
 *    而 const 不像 function 宣告會被提升，寫在後面會直接 ReferenceError/TS2448。
 */
export const OTHER_UNIVERSITY =
  '其他（非上述院校 / 非香港的大學） / Other (not listed / not a HK university)';

/**
 * 就讀院校：16 所香港院校 + 「其他」。
 *
 * ⚠️ 這份名單是**照抄原本的 Google 表單**（使用者明確指定「用現在這樣 Google form 裏面的院校就夠了」），
 *    不要自己增刪院校 —— 名單更動等於改動招募範圍。
 *
 * ⚠️ 名單上的院校**不自動等於符合資格**：清單裡沒有任何一所會直接放行。
 *    真正決定資格的是參與者自己回答的那題「你是否現正就讀香港的大學？」，
 *    這是刻意的 —— 名單可能不完整（例如海外院校、非大學的高等教育機構），
 *    與其讓網站硬判，不如讓參與者依題目說明自行確認，與原表單的行為一致。
 */
export const UNIVERSITIES: readonly string[] = [
  '香港大學 / The University of Hong Kong',
  '香港中文大學 / The Chinese University of Hong Kong',
  '香港科技大學 / The Hong Kong University of Science and Technology',
  '香港城市大學 / City University of Hong Kong',
  '香港理工大學 / The Hong Kong Polytechnic University',
  '香港浸會大學 / Hong Kong Baptist University',
  '香港教育大學 / The Education University of Hong Kong',
  '嶺南大學 / Lingnan University',
  '香港都會大學 / Hong Kong Metropolitan University',
  '聖方濟各大學 / Saint Francis University',
  '香港樹仁大學 / Hong Kong Shue Yan University',
  '香港恒生大學 / The Hang Seng University of Hong Kong',
  '香港演藝學院 / The Hong Kong Academy for Performing Arts',
  '香港珠海學院 / Chu Hai College of Higher Education',
  '東華學院 / Tung Wah College',
  '香港高等教育科技學院 / Technological and Higher Education Institute of Hong Kong',
  OTHER_UNIVERSITY,
];

/** 兩題確認題的共用選項（與原 Google 表單一字不差）。 */
export const CONFIRM_YES = '是，我符合 / Yes, I meet this requirement';
export const CONFIRM_NO = '否，我不符合 / No, I do not meet this requirement';
