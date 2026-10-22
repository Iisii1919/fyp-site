'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { postTest1HeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PostTest1Props {
  /** 這份問卷是否已提交（由 PostTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PostTest。 */
  onSubmitted?: () => void;
  /** 參與者按「展開繼續作答」→ 撤銷「已完成」。 */
  onUnsubmit?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSepV_Z8H_1MAGhKSCvIg3IBaIxPKmqzPpaUzuz4QaZ3XNGMcA/viewform?embedded=true';

export default function PostTest1({ submitted = false, onSubmitted, onUnsubmit }: PostTest1Props) {
  const participant = useParticipant();
  // participant 就緒前保持 null：iframe 只會用帶 prefill 的網址載入「一次」（原因見下方渲染處註解）
  const [src, setSrc] = useState<string | null>(null);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(postTest1HeightForWidth, postTest1HeightForWidth(768));

  useEffect(() => {
    if (!participant) return; // participant 就緒才產生 src（原因見下方渲染處註解）
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
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>Post-Test: Meaning in Life Questionnaire</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>後測：生命意義感量表</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the Meaning in Life Questionnaire after watching all videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看所有影片後，請完成生命意義感量表。
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
        {/* ⚠️ src 為 null（participant 未就緒）時刻意**不掛 iframe**。原因見 PreTest1.tsx
            的同位置註解：先掛無 prefill 網址再換 src，會在聯合 session history 多生
            entry，參與者按「返回」會把 iframe 導回沒有 prefill 的網址。 */}
        {src ? (
          <GoogleFormEmbed
            src={src}
            height={formHeight}
            title="Post-Test: MLQ"
            onSubmitted={onSubmitted}
            onUnsubmit={onUnsubmit}
          />
        ) : (
          // 佔位卡片：撐住表單高度，避免 participant 就緒的一瞬間版面跳動
          <div
            className="w-full bg-white rounded-2xl border border-[rgba(198,168,248,0.18)] shadow-2xl"
            style={{ height: formHeight }}
            aria-label="表單載入中 Form loading"
          />
        )}
      </div>

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        After submitting, please continue to the next questionnaire.
        <br />
        提交問卷後，請繼續填寫下一份問卷。
      </p>
    </div>
  );
}
