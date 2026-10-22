'use client';

/**
 * 每份表單「已送出」的持久化標記（2026-10-22）。
 *
 * 解決的問題：問卷頁刻意沒有「下一頁」按鈕，前進唯一靠「偵測到送出」。
 * 參與者按返回／刷新回到已送出的表單頁時，該頁重新掛載、什麼都不記得，
 * 結果只好把同一份表單再送一次 —— 既麻煩，又會在 Google Forms 留下重複回應。
 *
 * 做法：偵測到送出時把表單代號記進 localStorage；重新掛載時若查到
 * 「這位參與者已送過這份」，頁面直接呈現收合後的完成狀態並亮起 Next 鈕，
 * 不再要求重送（資料本來就已經在 Google 那邊了）。
 *
 * ⚠️ 記錄**綁 participant id**：同一台裝置換下一位參與者時，舊標記對新 id
 *    完全不可見；clearParticipant() 另會整份清掉（雙保險），
 *    否則新參與者會看到「表單都做好了」的假象。
 *
 * ⚠️ 只記「已送出」。填到一半沒送出的內容從未離開過裝置，這裡救不了，
 *    也不該假裝救得了。
 */

const STORAGE_KEY = 'fyp_submissions';

/** 與 src/lib/formPrefill.ts 的 FORM_PREFILL 鍵一致。 */
export type FormKey =
  | 'consentSignature'
  | 'preTest1'
  | 'preTest2'
  | 'preTestErq'
  | 'viewingFeedback'
  | 'postTest1'
  | 'postTest2'
  | 'postTestErq';

interface SubmissionRecord {
  pid: string;
  forms: FormKey[];
}

function read(): SubmissionRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SubmissionRecord>;
    if (typeof parsed?.pid !== 'string' || !Array.isArray(parsed?.forms)) return null;
    return { pid: parsed.pid, forms: parsed.forms as FormKey[] };
  } catch {
    return null;
  }
}

function write(rec: SubmissionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  } catch {
    // localStorage 不可用（無痕模式等）→ 當作沒有持久化，行為退回本次修正前的樣子
  }
}

/** 這位參與者是否已送出過這份表單。 */
export function isSubmitted(pid: string, formKey: FormKey): boolean {
  const rec = read();
  return !!rec && rec.pid === pid && rec.forms.includes(formKey);
}

/** 記錄「這位參與者送出了這份表單」。冪等，重複呼叫無害。 */
export function markSubmitted(pid: string, formKey: FormKey): void {
  const rec = read();
  if (rec && rec.pid === pid) {
    if (!rec.forms.includes(formKey)) write({ pid, forms: [...rec.forms, formKey] });
    return;
  }
  // 沒有記錄、或記錄屬於另一位參與者（舊場次殘留）→ 以當前參與者為準重開
  write({ pid, forms: [formKey] });
}

/** 撤銷標記（參與者按「展開繼續作答」時 —— 代表先前的送出判定是誤判）。 */
export function unmarkSubmitted(pid: string, formKey: FormKey): void {
  const rec = read();
  if (!rec || rec.pid !== pid) return;
  write({ pid, forms: rec.forms.filter((f) => f !== formKey) });
}

/** 場次結束時整份清掉（由 clearParticipant() 呼叫，不需單獨使用）。 */
export function clearSubmissions(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
