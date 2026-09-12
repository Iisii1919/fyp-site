'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';

interface PreTest2Props {
  onComplete?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdhW3ivEplLsKicsqOdBVn7aY0kmuI_w8Mml_DcJst1htX4bw/viewform?embedded=true';

export default function PreTest2({ onComplete: _onComplete }: PreTest2Props) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'preTest2', participant));
  }, [participant]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 棕色裝飾（右上角斜切） */}
      <div
        className="absolute top-0 right-0 h-full w-[20%] opacity-35 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Pre-Test Questionnaire (2)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">前測問卷（二）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the second pre-test questionnaire before watching the videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看影片前，請完成第二份前測問卷。
        </p>
      </motion.div>

      {/* Google Form iframe（提交後自動收合，避免下方留下大片空白） */}
      <GoogleFormEmbed src={src} height={3894} title="Pre-Test Questionnaire 2" />

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        提交問卷後，請點擊下方 ▼ 觀看影片。
      </p>
    </div>
  );
}
