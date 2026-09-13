'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { postTest1HeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';

interface PostTest1Props {
  /** 這份問卷是否已提交（由 PostTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PostTest。 */
  onSubmitted?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSepV_Z8H_1MAGhKSCvIg3IBaIxPKmqzPpaUzuz4QaZ3XNGMcA/viewform?embedded=true';

export default function PostTest1({ submitted = false, onSubmitted }: PostTest1Props) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(postTest1HeightForWidth, postTest1HeightForWidth(768));

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

        {/* 已提交標記：讓參與者一眼看出這份完成了沒 */}
        {submitted && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full border border-[rgba(198,168,248,0.45)] bg-[rgba(198,168,248,0.12)]">
            <span className="text-[#d4bfff] text-xs">✓ 已提交 Submitted</span>
          </div>
        )}
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應；提交後自動收合） */}
      <div ref={wrapRef} className="w-full max-w-3xl">
        <GoogleFormEmbed
          src={src}
          height={formHeight}
          title="Post-Test Questionnaire 1"
          onSubmitted={onSubmitted}
        />
      </div>

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        提交問卷後，請繼續填寫第二份問卷。
      </p>
    </div>
  );
}
