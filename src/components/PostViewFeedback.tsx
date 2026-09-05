'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface PostViewFeedbackProps {
  onComplete: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLScO2-onh0sjZlL6LsvLmhnqztt5FQf7XXtZBFqiS8j5ZpVo4Q/viewform?embedded=true';

// 讓整份表單一次顯示完、不產生 iframe 內頁捲軸。
// 實測表單初始渲染高度（含標題與送出鈕）：
//   寬 768px → 1174px ／ 640px → 1208px ／ 480px → 1318px ／ 390px → 1438px
// 以下高度 = 實測值 + 約 145px 緩衝（長文輸入框會隨作答內容長高）。
// 緩衝用盡時仍會出現捲軸（寧可捲、也不要裁掉送出鈕），故不使用 scrolling="no"。
const heightForWidth = (w: number) => {
  if (w >= 720) return 1320;
  if (w >= 560) return 1400;
  if (w >= 440) return 1480;
  return 1580;
};

export default function PostViewFeedback({ onComplete }: PostViewFeedbackProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(1320);

  // 依容器實際寬度決定 iframe 高度（視窗縮放時自動更新）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const next = heightForWidth(el.clientWidth);
      setFormHeight((prev) => (prev === next ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Viewing Feedback</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">觀後回饋</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please share your immediate thoughts and feelings after watching the films.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看影片後，請分享你的即時想法與感受。
        </p>
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應，避免內頁捲軸） */}
      <motion.div
        ref={wrapRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[rgba(198,168,248,0.18)]"
      >
        <iframe
          src={FORM_SRC}
          width="100%"
          height={formHeight}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Viewing Feedback"
          style={{ display: 'block' }}
        >
          載入中… Loading…
        </iframe>
      </motion.div>

      {/* 滾動提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 mb-12 text-center"
      >
        <p className="text-[#9a9a9a] text-sm mb-2">
          After submitting the form, scroll down to continue to the next questionnaire.
        </p>
        <p className="text-[#8a8a8a] text-xs mb-6">
          提交問卷後，向下滾動繼續填寫下一份問卷。
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
