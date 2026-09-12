'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// 讓整份同意書一次顯示完、不產生 iframe 內頁捲軸。
// 以真實裝置視口（Emulation.setDeviceMetricsOverride）實測兩頁表單內容高度：
//   第 1 頁（同意書正文 + 確認勾選）：
//     寬 768px → 1402px ／ 640px → 1530px ／ 480px → 1774px ／ 390px → 2033px
//   第 2 頁（電子簽署）不隨寬度重排：約 1480px（寬 767px 時略高於第 1 頁）
// 以下高度 = 兩頁取較高者 + 約 25px 緩衝，確保翻頁後送出鈕不因內頁捲軸被裁掉。
const heightForWidth = (w: number) => {
  if (w >= 720) return 1505;
  if (w >= 560) return 1555;
  if (w >= 440) return 1800;
  return 2060;
};

export default function ConsentSignature() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(1505);
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  // 把 Participant ID / Group 帶進同意書表單（表單需先有這兩個簡答題）。
  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'consentSignature', participant));
  }, [participant]);

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
    <div className="w-full min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Consent Form</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">同意書簽署</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please read the consent form below, tick the boxes, then type your name on the next page to sign.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請細閱以下同意書、勾選確認，然後於下一頁輸入姓名完成簽署。
        </p>
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應；提交後自動收合，避免留下大片空白） */}
      <div ref={wrapRef} className="w-full max-w-3xl">
        <GoogleFormEmbed src={src} height={formHeight} title="Consent to Participate in Research" />
      </div>

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#9a9a9a] text-sm mt-8 mb-4 text-center">
        After you have submitted the signed form, continue to the pre-test questionnaire.
      </p>
      <p className="text-[#8a8a8a] text-xs mb-24 text-center">
        完成簽署並遞交後，即可繼續填寫前測問卷。
      </p>
    </div>
  );
}
