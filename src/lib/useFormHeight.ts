'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 依容器實際寬度決定 iframe 高度，視窗縮放時自動更新。
 *
 * 用法：
 *   const [wrapRef, formHeight] = useFormHeight(consentHeightForWidth, consentHeightForWidth(768));
 *   <div ref={wrapRef} className="w-full max-w-3xl">
 *     <GoogleFormEmbed src={src} height={formHeight} title="..." />
 *   </div>
 *
 * `heightForWidth` 必須是穩定的模組層級函式（formHeights.ts 匯出的那些），
 * 否則每次 render 都會重新建立 ResizeObserver。
 */
export function useFormHeight(heightForWidth: (w: number) => number, initial: number) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(initial);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const next = heightForWidth(el.clientWidth);
      setHeight((prev) => (prev === next ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [heightForWidth]);

  return [wrapRef, height] as const;
}
