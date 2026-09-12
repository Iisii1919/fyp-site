'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GoogleFormEmbedProps {
  src: string;
  height: number;
  title: string;
}

// 嵌入 Google Form 的白底卡片。
//
// 為什麼需要這個元件：
// 表單未提交前內容很長（例如 2568px），但提交後 Google 只顯示一小塊確認頁
// （「我們已經收到您回覆的表單」約 400px），iframe 卻還維持原本高度，
// 下方就留下一大片空白，很不美觀。
//
// 做法：跨網域 iframe 讀不到內容，無法直接得知是否已提交，因此用兩個訊號判斷——
//   1) iframe 再次 load 且 src 沒有改變：Google Form 在 iframe 內換頁（下一頁）是
//      前端行為、不會重新載入文件；但「提交」會導覽到 formResponse 確認頁 → 會再 load
//      一次。用 src 是否改變來排除「帶入 prefill 造成的重新載入」這個誤判來源。
//   2) docs.google.com 送來的 postMessage（若有帶 submit 字樣）作為輔助訊號。
// 收合後仍提供「重新展開問卷」按鈕，即使判斷有誤使用者也能自行復原。
const SUBMITTED_HEIGHT = 460;

export default function GoogleFormEmbed({ src, height, title }: GoogleFormEmbedProps) {
  // 記住「上一次載入完成時的 src」。
  // 這個判斷很關鍵：頁面一開始用未帶 prefill 的網址，等 participant 就緒後會換成
  // 帶 prefill 的網址，iframe 因此會多載入一次。若把那一次算成提交，
  // 表單會在剛載入時就被收合。所以只有「src 沒變卻又 reload」才視為提交。
  const lastLoadedSrc = useRef<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.origin.includes('docs.google.com')) return;
      const data = typeof e.data === 'string' ? e.data : '';
      if (/form_?submit/i.test(data)) setSubmitted(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const collapsed = submitted && !forceOpen;

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
            // 首次載入、或 src 變更（帶入 prefill）造成的重新載入 → 不算提交
            if (prev === null || prev !== src) return;
            setSubmitted(true);
          }}
        >
          載入中… Loading…
        </iframe>
      </motion.div>

      {submitted && (
        <button
          type="button"
          onClick={() => setForceOpen((v) => !v)}
          className="text-[#8a8a8a] hover:text-[#d4bfff] text-xs mt-3 transition-colors"
        >
          {forceOpen ? '收起問卷' : '問卷還沒填完？點此重新展開'}
        </button>
      )}
    </>
  );
}
