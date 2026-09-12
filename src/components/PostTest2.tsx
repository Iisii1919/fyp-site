'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';

interface PostTest2Props {
  /** 送出後自動前往下一步（這是後測頁的最後一份問卷）。 */
  onComplete?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSfZEBVOQxauanG6meZdXM8-7_6iGO6wck8WeR_uDAazH7_QzA/viewform?embedded=true';

export default function PostTest2({ onComplete }: PostTest2Props) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  const handleSubmitted = useAutoAdvance(onComplete);

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'postTest2', participant));
  }, [participant]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 棕色裝飾（右上角斜切） */}
      <div
        className="absolute top-0 right-0 h-full w-[22%] opacity-35 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Post-Test Questionnaire (2)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">後測問卷（二）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the second post-test questionnaire. This is the final questionnaire.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請完成第二份後測問卷，這是最後一份問卷。
        </p>
      </motion.div>

      {/* Google Form iframe（送出後自動收合，並自動完成研究） */}
      <GoogleFormEmbed
        src={src}
        height={3914}
        title="Post-Test Questionnaire 2"
        onSubmitted={handleSubmitted}
      />

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        提交問卷後會自動完成研究。
      </p>
    </div>
  );
}
