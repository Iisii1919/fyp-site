'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { isSubmitted, markSubmitted } from '@/lib/submissions';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { viewingFeedbackHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PostViewFeedbackProps {
  /** 送出後自動前往下一步（這一頁只有這份問卷）。 */
  onComplete?: () => void;
}

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLScO2-onh0sjZlL6LsvLmhnqztt5FQf7XXtZBFqiS8j5ZpVo4Q/viewform?embedded=true';

export default function PostViewFeedback({ onComplete }: PostViewFeedbackProps) {
  const participant = useParticipant();
  // participant 就緒前保持 null：iframe 只會用帶 prefill 的網址載入「一次」（原因見下方渲染處註解）
  const [src, setSrc] = useState<string | null>(null);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(viewingFeedbackHeightForWidth, viewingFeedbackHeightForWidth(768));
  const triggerAdvance = useAutoAdvance(onComplete);

  // 「上次已送出」的恢復狀態：返回／刷新回到這頁時直接顯示收合完成態＋Next 鈕，
  // 不再要求重送（資料已在 Google），也不重複自動跳轉把按返回的人又往前推
  // （標記的存取見 src/lib/submissions.ts）。
  const [restoredDone, setRestoredDone] = useState(false);

  // 只有「這次掛載真的送出」才寫標記＋自動跳轉。
  const handleSubmitted = useCallback(() => {
    if (participant) markSubmitted(participant.id, 'viewingFeedback');
    triggerAdvance();
  }, [participant, triggerAdvance]);

  useEffect(() => {
    if (!participant) return; // participant 就緒才產生 src（原因見下方渲染處註解）
    // 「上次已送出」的恢復標記：participant 一到就查
    setRestoredDone(isSubmitted(participant.id, 'viewingFeedback'));
    setSrc(buildPrefill(FORM_SRC, 'viewingFeedback', participant));
  }, [participant]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>Viewing Feedback</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>觀後回饋</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please share your immediate thoughts and feelings after watching the films.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看影片後，請分享你的即時想法與感受。
        </p>
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應；送出後自動收合並自動繼續） */}
      <div ref={wrapRef} className="w-full max-w-3xl">
        {/* ⚠️ src 為 null（participant 未就緒）時刻意**不掛 iframe**。原因見 PreTest1.tsx
            的同位置註解：先掛無 prefill 網址再換 src，會在聯合 session history 多生
            entry，參與者按「返回」會把 iframe 導回沒有 prefill 的網址。 */}
        {src ? (
          <GoogleFormEmbed
            src={src}
            height={formHeight}
            title="Viewing Feedback"
            onSubmitted={handleSubmitted}
            startCollapsed={restoredDone}
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
      <p className={`text-[#8a8a8a] text-xs mt-8 text-center ${restoredDone ? '' : 'mb-24'}`}>
        {restoredDone ? (
          <>
            You have already submitted this form — press “Next · 下一頁” to continue.
            <br />
            你已提交過這份問卷，按「下一頁」即可繼續。
          </>
        ) : (
          <>
            After submitting, you will automatically continue to the next step.
            <br />
            提交後會自動繼續下一步。
          </>
        )}
      </p>

      {/* 已送過的人按返回／刷新回來：給一顆明確的「下一頁」，不用再送一次。
          平時刻意沒有這顆按鈕（防止跳過問卷），只有恢復完成態才出現。 */}
      {restoredDone && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 mb-24 inline-flex items-center gap-3 px-7 py-3 rounded-full border border-[rgba(198,168,248,0.45)] bg-[rgba(198,168,248,0.12)] text-[#d4bfff] hover:bg-[rgba(198,168,248,0.24)] hover:border-[rgba(198,168,248,0.8)] transition-colors"
        >
          <span className="text-sm md:text-base font-medium tracking-wide whitespace-nowrap">
            Next · 下一頁
          </span>
          <svg className="w-5 h-5 md:w-6 md:h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
