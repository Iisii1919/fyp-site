'use client';

/**
 * 研究進度（目前走到第幾步）的存取。
 *
 * 為什麼要存：參與者誤按 F5、筆電休眠醒來、瀏覽器當掉時，`step` 這個 React state
 * 會歸零，但參與者身分存在 localStorage 裡、會留著。兩者不一致的結果是：
 * 同一個 Participant ID 下會**重複送出**同意書與四份問卷。
 * （2026-09-14 以 CDP 實測確認：重新載入後 ID 不變、但畫面回到 Hero。）
 *
 * ⚠️ 這裡只負責「記住走到哪」，**不負責決定要不要接續**。
 * 瀏覽器無法分辨「同一個人重新載入」與「下一位參與者坐下來」——
 * 兩者都是同一台電腦、同一個 localStorage。所以接續與否交給使用者決定
 * （page.tsx 會顯示 ResumePrompt 讓他選）。
 * 這是刻意的：靜默接續會讓「上一場沒做完」的殘留進度被下一位直接接手，
 * 可能出現沒簽同意書就看到影片頁的情況。
 *
 * 清除時機：`clearParticipant()`（完成研究、或研究者開 `?new=1`）會一併清掉，
 * 因為那兩者都代表「這一位的 session 結束了」。
 */

const STORAGE_KEY = 'fyp_progress';

/** 讀取上次未完成的步驟；沒有、或值不合理就回 null。 */
export function readProgress(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
  } catch {
    return null;
  }
}

/**
 * 記錄目前步驟。傳 0（或負數）代表「清除」——
 * 第 0 步沒什麼好接續的，存下來只會讓下一次開站多跳出一個沒意義的提示。
 */
export function saveProgress(step: number): void {
  if (typeof window === 'undefined') return;
  try {
    if (!Number.isInteger(step) || step <= 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, String(step));
  } catch {
    // localStorage 不可用（無痕模式等）時就當作沒有續傳功能，不影響流程
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
