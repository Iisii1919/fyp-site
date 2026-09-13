'use client';

import { motion } from 'framer-motion';

interface StepFooterProps {
  onNext?: () => void;
  /**
   * 是否顯示中央的 Next chevron。
   *
   * 只有「這一頁沒有其他前進方式」才需要開：
   *   0 Hero（沒有按鈕）、5 VideoViewer（看完所有片段會自動跳，這裡留一個備援）、
   *   7 純文字分隔頁（沒有任何按鈕）。
   * 其他頁面都有自動跳轉或自己的按鈕，所以不顯示。
   *
   * ⚠️ 這裡刻意「沒有」Back 按鈕。
   * 原因：本網站是用 step state 條件渲染，按 Back 會把上一頁的元件重新掛載，
   * 該頁的 iframe 會整份重新載入 → 參與者已經填到一半的答案會全部消失。
   * 再加上多數頁面已改成自動跳轉，往回走之後沒有明顯的前進路徑，容易卡住。
   */
  canNext?: boolean;
}

// 預先計算的星點位置（避免 SSR/CSR 隨機數不一致）
const STARS: { x: number; y: number; size: number; delay: number; dur: number }[] = [
  { x: 6,  y: 30, size: 1.5, delay: 0,    dur: 3.4 },
  { x: 13, y: 70, size: 1,   delay: 0.5,  dur: 4.1 },
  { x: 22, y: 45, size: 1.8, delay: 1.0,  dur: 3.0 },
  { x: 32, y: 85, size: 1,   delay: 1.5,  dur: 4.6 },
  { x: 42, y: 22, size: 1.2, delay: 0.3,  dur: 3.7 },
  { x: 52, y: 60, size: 1.6, delay: 0.8,  dur: 3.2 },
  { x: 62, y: 35, size: 1,   delay: 1.3,  dur: 4.4 },
  { x: 72, y: 80, size: 2,   delay: 0.6,  dur: 3.5 },
  { x: 82, y: 50, size: 1.4, delay: 1.1,  dur: 4.0 },
  { x: 90, y: 18, size: 1,   delay: 0.4,  dur: 3.8 },
  { x: 18, y: 12, size: 1.2, delay: 1.4,  dur: 3.3 },
  { x: 48, y: 90, size: 1,   delay: 0.7,  dur: 4.2 },
  { x: 78, y: 65, size: 1.3, delay: 1.6,  dur: 3.6 },
  { x: 36, y: 55, size: 0.8, delay: 0.9,  dur: 4.5 },
];

export default function StepFooter({ onNext, canNext = false }: StepFooterProps) {
  const showNext = canNext && !!onNext;

  return (
    // 絕對定位在父層（section）底部 = 每頁自己的頁腳
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none" aria-label="Page navigation">
      {/* 背景：星點 +（有 chevron 時）底部黑色漸層讓 chevron 在淺色背景也可讀 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map((star, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#d4bfff]"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: star.dur, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
          />
        ))}
        {showNext && (
          <div
            className="absolute bottom-0 left-0 right-0 h-28"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
          />
        )}
      </div>

      {/* 保留這個高度的空白列，讓上面的星點有高度可以定位；沒有 chevron 時就是純留白。
          這層是 pointer-events-none，否則這條 112px 高的區域會擋住底下內容的點擊；
          只有按鈕本身開 pointer-events-auto。 */}
      <div className="relative z-10 min-h-[112px] py-6 px-6 md:px-12 flex items-center justify-center">
        {showNext && (
          // 光有箭頭參與者會看不出那是按鈕（使用者反映怕看不到），所以做成
          // 有邊框、有底色的膠囊按鈕，並加上「Next · 下一頁」文字。
          <motion.button
            onClick={onNext}
            className="pointer-events-auto inline-flex items-center gap-3 px-7 py-3 rounded-full border border-[rgba(198,168,248,0.45)] bg-[rgba(198,168,248,0.12)] text-[#d4bfff] hover:bg-[rgba(198,168,248,0.24)] hover:border-[rgba(198,168,248,0.8)] focus:outline-none focus-visible:border-[rgba(198,168,248,0.9)] transition-colors"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Next step"
          >
            <span className="text-sm md:text-base font-medium tracking-wide whitespace-nowrap">
              Next · 下一頁
            </span>
            <svg
              className="w-5 h-5 md:w-6 md:h-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}
