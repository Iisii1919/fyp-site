'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ConsentSignatureProps {
  onComplete: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// 讓整份同意書一次顯示完、不產生 iframe 內頁捲軸。
// 實測表單第一頁初始渲染高度（含標題、條文與「下一頁」鈕）：
//   寬 768px → 1804px ／ 640px → 1952px ／ 480px → 2296px ／ 390px → 2611px
// 以下高度 = 實測值 + 約 30px 緩衝。
// 緩衝用盡時仍會出現捲軸（寧可捲、也不要裁掉送出鈕），故不使用 scrolling="no"。
const heightForWidth = (w: number) => {
  if (w >= 720) return 1835;
  if (w >= 560) return 1985;
  if (w >= 440) return 2330;
  return 2645;
};

export default function ConsentSignature({ onComplete }: ConsentSignatureProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(1835);

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
        className="text-center mb-8"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Consent Signature</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">同意書簽署</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please read the consent form below, tick the boxes, then type your name on the next page to sign.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請細閱以下同意書、勾選確認，然後於下一頁輸入姓名完成簽署。
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
          title="Consent to Participate in Research"
          style={{ display: 'block' }}
        >
          載入中… Loading…
        </iframe>
      </motion.div>

      {/* 簽署完成 → 繼續 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 mb-12 text-center"
      >
        <p className="text-[#9a9a9a] text-sm mb-2">
          After you have submitted the signed form, continue to the pre-test questionnaire.
        </p>
        <p className="text-[#8a8a8a] text-xs mb-6">
          完成簽署並遞交後，即可繼續填寫前測問卷。
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="btn-gold text-base font-semibold inline-flex items-center gap-3"
        >
          <span>I Have Signed &amp; Continue</span>
          <span className="text-xs opacity-70 font-normal">我已簽署並繼續</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.button>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mt-8"
        >
          <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
