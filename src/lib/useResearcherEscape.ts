'use client';

import { useEffect } from 'react';

/**
 * 研究員專用逃生鍵：Shift + Alt + N → 強制前往下一步。
 *
 * 為什麼需要：
 * 本站多數頁面刻意沒有「下一頁」按鈕（問卷頁靠送出後自動跳轉、影片頁靠看完自動跳轉），
 * 這是為了不讓參與者跳過資料。但代價是：只要自動跳轉的條件沒有成立，
 * 參與者就完全沒有前進的路。已知的失敗來源都有對應處理
 * （表單載入失敗 → GoogleFormEmbed 的救援面板；影片載不出來 → 影片頁的 chevron），
 * 但不可能窮舉所有狀況（瀏覽器擴充功能、瀏覽器版本、Google 端改版、
 * 參與者把筆電闔上再打開導致影片 `ended` 事件沒觸發……）。
 * 這個逃生鍵是最後手段，讓研究員當場把場次救回來。
 *
 * ⚠️ 刻意不做成畫面按鈕、也不提示：參與者看到就會按，會直接跳過整份問卷，
 *    資料缺了而且不會有人發現。這是給知道快捷鍵的研究員用的。
 * ⚠️ 一定要保留 confirm 確認框：Shift+Alt+N 不是容易誤觸的組合，但誤觸的代價是
 *    整份問卷的資料，所以要再多一道確認。
 */
export function useResearcherEscape(onForceNext: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || !e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.code !== 'KeyN') return;
      e.preventDefault();
      const ok = window.confirm(
        '研究員專用：強制前往下一步？\n\n' +
          'Researcher only: force the next step?\n\n' +
          '（參與者請按「取消」／If you are a participant, press Cancel.）',
      );
      if (ok) onForceNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onForceNext]);
}
