'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';

interface PostTest1Props {
  onComplete?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSepV_Z8H_1MAGhKSCvIg3IBaIxPKmqzPpaUzuz4QaZ3XNGMcA/viewform?embedded=true';

// 讓整份問卷一次顯示完、不產生 iframe 內頁捲軸。
//
// 2026-09-13 重測：原本寫死 height={2568}，但表單實際需要 2811px（寬 768px），
// 短少 243px 所以會出現內頁捲軸。而且它隨寬度變化很大（288px 寬時要 4003px），
// 寫死一個數字行不通，改成跟其他問卷一樣依容器寬度決定高度。
// 以 CDP 實際量測 iframe 內文件的 scrollHeight（iframe 設 300px 高讓內容溢出才量得到真實高度）：
//   768px → 2811 ／ 640px → 2884 ／ 560px → 2980 ／ 480px → 3068 ／ 440px → 3116
//   390px → 3208 ／ 360px → 3276 ／ 340px → 3356 ／ 320px → 3608 ／ 300px → 3776 ／ 288px → 4003
// 每個級距取「該級距最小寬度」的量測值 + 約 30px 緩衝。
const heightForWidth = (w: number) => {
  if (w >= 720) return 2841; // 量測 2811（容器 max-w-3xl，實際不會超過 768）
  if (w >= 640) return 2914; // 量測 2884
  if (w >= 560) return 3010; // 量測 2980
  if (w >= 480) return 3098; // 量測 3068
  if (w >= 440) return 3146; // 量測 3116
  if (w >= 390) return 3238; // 量測 3208
  if (w >= 360) return 3306; // 量測 3276
  if (w >= 340) return 3386; // 量測 3356
  if (w >= 320) return 3638; // 量測 3608
  if (w >= 300) return 3806; // 量測 3776
  return 4033; // 量測 4003（288px）
};

export default function PostTest1({ onComplete: _onComplete }: PostTest1Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(2841);
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'postTest1', participant));
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
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Post-Test Questionnaire (1)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">後測問卷（一）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the first post-test questionnaire after watching all videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看所有影片後，請完成第一份後測問卷。
        </p>
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應；提交後自動收合） */}
      <div ref={wrapRef} className="w-full max-w-3xl">
        <GoogleFormEmbed src={src} height={formHeight} title="Post-Test Questionnaire 1" />
      </div>

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        提交問卷後，請繼續填寫下一份問卷。
      </p>
    </div>
  );
}
