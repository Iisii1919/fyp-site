'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * 表單送出後自動前往下一步。
 *
 * 為什麼要延遲：參與者按下「提交」後，Google 會顯示一小塊「我們已經收到您回覆的表單」確認頁。
 * 立刻跳走的話他們看不到那句確認，會懷疑自己到底送出成功沒有，所以先停留一下再跳。
 *
 * 只會觸發一次（即使 iframe 又載入一次也不會重複排程），元件卸載時會清掉計時器。
 */
export function useAutoAdvance(onNext?: () => void, delayMs = 1600) {
  const timer = useRef<number | null>(null);

  const trigger = useCallback(() => {
    if (timer.current !== null) return;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      onNext?.();
    }, delayMs);
  }, [onNext, delayMs]);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        // 一定要歸零：只 clearTimeout 而留著舊 id 的話，之後再呼叫 trigger()
        // 會被「timer.current !== null」這個守衛擋掉，變成永遠不會跳頁。
        timer.current = null;
      }
    },
    [],
  );

  return trigger;
}
