'use client';

import { motion } from 'framer-motion';

interface StepFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  canBack?: boolean;
  canNext?: boolean;
  /** 隱藏中央的 Next chevron（當該頁已有自己的前進按鈕時用） */
  hideNext?: boolean;
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

export default function StepFooter({ onBack, onNext, canBack = false, canNext = false, hideNext = false }: StepFooterProps) {
  return (
    // 絕對定位在父層（section）底部 = 每頁自己的頁腳
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none" aria-label="Page navigation">
      {/* 背景：星點 + 底部黑色漸層（讓 chevron 在淺色背景也可讀） */}
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
        <div
          className="absolute bottom-0 left-0 right-0 h-28"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
        />
      </div>

      {/* 按鈕列：左 Back / 中 Next chevron / 右 留白維持 chevron 置中 */}
      <div className="relative z-10 pointer-events-auto flex items-center justify-center min-h-[112px] py-6 px-6 md:px-12">
        {/* 左：返回（可選） */}
        {canBack && onBack && (
          <motion.button
            onClick={onBack}
            className="group absolute left-6 md:left-12 flex items-center gap-2 text-[#9a9a9a] hover:text-[#d4bfff] focus:outline-none focus-visible:text-[#d4bfff] transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Previous step"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-xs tracking-[0.2em] uppercase hidden sm:inline">Back</span>
          </motion.button>
        )}

        {/* 中：Next chevron（與 Back 相同的大小與交互效果；hideNext 時不顯示） */}
        {canNext && onNext && !hideNext && (
          <motion.button
            onClick={onNext}
            className="group relative flex items-center gap-2 text-[#9a9a9a] hover:text-[#d4bfff] focus:outline-none focus-visible:text-[#d4bfff] transition-colors"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Next step"
          >
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </motion.button>
        )}

        {/* 右：留白（讓 chevron 視覺置中） */}
        <div className="absolute right-6 md:right-12 w-20" aria-hidden />
      </div>
    </div>
  );
}
