'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { postTest2HeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PostTest2Props {
  /** 這份問卷是否已提交（由 PostTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PostTest。是否跳頁由 PostTest 依「三份都完成」判斷。 */
  onSubmitted?: () => void;
  /** 參與者按「展開繼續作答」→ 撤銷「已完成」。 */
  onUnsubmit?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSfZEBVOQxauanG6meZdXM8-7_6iGO6wck8WeR_uDAazH7_QzA/viewform?embedded=true';

export default function PostTest2({ submitted = false, onSubmitted, onUnsubmit }: PostTest2Props) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(postTest2HeightForWidth, postTest2HeightForWidth(768));

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
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>Post-Test: 10-Item Connor-Davidson Resilience Scale</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>後測：簡易心理彈性量表</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the 10-Item Connor-Davidson Resilience Scale.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請完成簡易心理彈性量表。
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
          title="Post-Test: CD-RISC-10"
          onSubmitted={onSubmitted}
          onUnsubmit={onUnsubmit}
        />
      </div>

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        After submitting, please continue to the final questionnaire: the Emotion Regulation Questionnaire.
        <br />
        提交後，請繼續填寫最後一份問卷：情緒調節問卷。
      </p>
    </div>
  );
}
