'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { markSubmitted, unmarkSubmitted } from '@/lib/submissions';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { preTestErqHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PreTestErqProps {
  /** 這份問卷是否已提交（由 PreTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PreTest。是否跳頁由 PreTest 依「全部完成」判斷。 */
  onSubmitted?: () => void;
  /** 參與者按「展開繼續作答」→ 撤銷「已完成」。 */
  onUnsubmit?: () => void;
}

// 前測 ERQ（認知重評子量表）—— 接在 PreTest2 之後。
//
// 這份和 PreTest1 / PreTest2 不同的地方：它量的是「平常慣用的情緒調節策略」，
// 屬於穩定的個人傾向（baseline / moderator），而不是看完影片當下的狀態。
// 前後測各做一次，是為了看慣用策略會不會影響（或調節）影片的效果。
//
// ⚠️ 題目順序不可打亂：Gross & John (2003) 的 ERQ 原本是重評與抑制題混排、
// 交替出現，本站只取重評子量表，因此正確的題號是 1/3/5/7/8/10，
// 表單裡已經沿用原始題號，切勿重新編號（重編會讓分析時對不回原始量表）。
//
// ---------------------------------------------------------------
// ⚠️ 頁面標題：**直接寫出量表名稱**（使用者 2026-10-21 指定）
// ---------------------------------------------------------------
// 2026-10-13 曾刻意把標題改成「前測問卷（三）」，理由是怕在作答當下
// 提示研究假設（這份量的是穩定慣用傾向，最容易被「猜到在問什麼」影響）。
//
// **2026-10-21 使用者改成要求顯示量表名稱**，理由是編號對參與者沒有意義、
// 看不出自己在填什麼。已改回「Pre-Test: ERQ／前測：ERQ」。
//
// 這個取捨本身是合理的：資訊表（step 2，在所有問卷之前）本來就已經寫明
// CD-RISC-10、MLQ、ERQ 與 cognitive reappraisal (Gross, 1998) ——
// 所以「隱藏名稱」實際上擋不住什麼，只是讓頁面變得不清楚。
//
// ⚠️ 題目順序仍然不可打亂、題號仍是原始編號，那與標題無關，見下。
const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw/viewform?embedded=true';

export default function PreTestErq({ submitted = false, onSubmitted, onUnsubmit }: PreTestErqProps) {
  const participant = useParticipant();
  // participant 就緒前保持 null：iframe 只會用帶 prefill 的網址載入「一次」（原因見下方渲染處註解）
  const [src, setSrc] = useState<string | null>(null);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(
    preTestErqHeightForWidth,
    preTestErqHeightForWidth(768),
  );

  useEffect(() => {
    if (!participant) return; // participant 就緒才產生 src（原因見下方渲染處註解）
    setSrc(buildPrefill(FORM_SRC, 'preTestErq', participant));
  }, [participant]);

  // 送出／撤銷時同步寫入持久化標記：返回或刷新回到這頁就不用重送（見 submissions.ts）。
  // 只有「這次掛載真的偵測到送出」才會走到這裡；恢復的完成態不會重複觸發。
  const handleSubmitted = useCallback(() => {
    if (participant) markSubmitted(participant.id, 'preTestErq');
    onSubmitted?.();
  }, [participant, onSubmitted]);
  const handleUnsubmit = useCallback(() => {
    if (participant) unmarkSubmitted(participant.id, 'preTestErq');
    onUnsubmit?.();
  }, [participant, onUnsubmit]);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}
    >
      {/* 棕色裝飾（右上角斜切） */}
      <div
        className="absolute top-0 right-0 h-full w-[22%] opacity-35 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>
          Pre-Test: Emotion Regulation Questionnaire
        </h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>
          前測：情緒調節問卷
        </h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please answer according to how you usually are, not what you are feeling right now.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請依你「平常」的真實情況作答，而不是此刻的感受。
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
            title="Pre-Test: ERQ"
            onSubmitted={handleSubmitted}
            onUnsubmit={handleUnsubmit}
            startCollapsed={submitted}
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

      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        There are no right or wrong answers — please answer with your first instinct.
        <br />
        這份問卷沒有對錯，請依直覺作答即可。
      </p>
    </div>
  );
}
