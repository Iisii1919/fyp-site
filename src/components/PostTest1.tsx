'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';

interface PostTest1Props {
  onComplete?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSepV_Z8H_1MAGhKSCvIg3IBaIxPKmqzPpaUzuz4QaZ3XNGMcA/viewform?embedded=true';

export default function PostTest1({ onComplete: _onComplete }: PostTest1Props) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'postTest1', participant));
  }, [participant]);

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

      {/* Google Form iframe（提交後自動收合，避免下方留下大片空白） */}
      <GoogleFormEmbed src={src} height={2568} title="Post-Test Questionnaire 1" />

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        提交問卷後，請繼續填寫下一份問卷。
      </p>
    </div>
  );
}
