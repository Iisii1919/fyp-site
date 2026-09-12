'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GoogleFormEmbedProps {
  src: string;
  height: number;
  title: string;
  /**
   * 表單頁數（預設 1）。
   *
   * 1 = 單頁：整份表單只有一個頁面，送出是唯一會讓 iframe「同一個 src 再載入一次」的原因
   *     → 可以安全地自動收合。
   * >1 = 多頁：按「繼續 / 返回」翻頁時 Google 會重新載入整份文件，iframe 一樣會再 load 一次。
   *     跨網域讀不到 iframe 內容，無法分辨「翻頁」與「送出」，自動判斷必然誤收合，
   *     因此多頁表單只提供手動收合，不做自動判斷。
   */
  pages?: number;
}

// 嵌入 Google Form 的白底卡片。
//
// 為什麼需要這個元件：
// 表單送出後 Google 只顯示一小塊確認頁（約 400px），iframe 卻還維持原本高度，
// 下方就留下一大片空白，很不美觀。所以在「確認已送出」後把高度收合。
//
// 判斷方式（2026-09-13 以 CDP 實際驅動 Chrome 驗證）：
//   - iframe 再次 load 且 src 沒有改變 → 這才是「同一個表單被重新載入」。
//     用 src 是否改變來排除「帶入 prefill 造成的重新載入」這個誤判來源。
//   - 翻頁（繼續／返回）也會重新載入文件、也會再 load 一次 → 所以 pages > 1 時不自動收合。
//   - Google 的嵌入表單不會對外送 postMessage（實測 0 則），故不採用該訊號。
// 收合後仍提供「展開表單」按鈕，即使判斷有誤使用者也能自行復原。
const SUBMITTED_HEIGHT = 460;

export default function GoogleFormEmbed({ src, height, title, pages = 1 }: GoogleFormEmbedProps) {
  // 記住「上一次載入完成時的 src」。
  // 這個判斷很關鍵：頁面一開始用未帶 prefill 的網址，等 participant 就緒後會換成
  // 帶 prefill 的網址，iframe 因此會多載入一次。若把那一次算成送出，
  // 表單會在剛載入時就被收合。所以只有「src 沒變卻又 reload」才視為送出。
  const lastLoadedSrc = useRef<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // 只有單頁表單可以自動判斷送出；多頁表單的翻頁會造成誤判。
  const autoCollapse = pages <= 1;
  // 多頁表單永遠顯示手動收合鈕；單頁表單只在（自動）收合後顯示，用來復原。
  const showToggle = collapsed || !autoCollapse;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[rgba(198,168,248,0.18)]"
      >
        <iframe
          src={src}
          width="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title={title}
          style={{
            display: 'block',
            height: collapsed ? SUBMITTED_HEIGHT : height,
            transition: 'height 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onLoad={() => {
            const prev = lastLoadedSrc.current;
            lastLoadedSrc.current = src;
            if (!autoCollapse) return;
            // 首次載入、或 src 變更（帶入 prefill）造成的重新載入 → 不算送出
            if (prev === null || prev !== src) return;
            setCollapsed(true);
          }}
        >
          載入中… Loading…
        </iframe>
      </motion.div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-[#8a8a8a] hover:text-[#d4bfff] text-xs mt-3 transition-colors"
        >
          {collapsed ? '展開表單' : '已遞交？收起表單'}
        </button>
      )}
    </>
  );
}
