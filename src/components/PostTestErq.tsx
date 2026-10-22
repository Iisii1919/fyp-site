'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { markSubmitted, unmarkSubmitted } from '@/lib/submissions';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { postTestErqHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PostTestErqProps {
  /** 這份問卷是否已提交（由 PostTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PostTest。是否跳頁由 PostTest 依「全部完成」判斷。 */
  onSubmitted?: () => void;
  /** 參與者按「展開繼續作答」→ 撤銷「已完成」。 */
  onUnsubmit?: () => void;
}

// 後測 ERQ（認知重評子量表）—— 接在 PostTest2 之後。
//
// 與前測 ERQ 是同一份量表、同一組題目，只有表單不同（分別收進不同回應表）。
// 真正要分析的是前後測的差距／穩定性，所以兩份的題目與順序必須完全一致。
//
// ⚠️ 題號沿用 ERQ 原始編號（1/3/5/7/8/10），不可重新編號，理由見 PreTestErq.tsx。
//
// ⚠️ 頁面標題直接寫出量表名稱（使用者 2026-10-21 指定）。
//    2026-10-13 曾刻意改成「後測問卷（三）」以隱藏量表名，2026-10-21 已改回
//    「Post-Test: ERQ／後測：ERQ」—— 理由與取捨見 PreTestErq.tsx 檔頭說明。
//    **不要把標題改回編號。**
const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg/viewform?embedded=true';

export default function PostTestErq({ submitted = false, onSubmitted, onUnsubmit }: PostTestErqProps) {
  const participant = useParticipant();
  // participant 就緒前保持 null：iframe 只會用帶 prefill 的網址載入「一次」（原因見下方渲染處註解）
  const [src, setSrc] = useState<string | null>(null);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(
    postTestErqHeightForWidth,
    postTestErqHeightForWidth(768),
  );

  useEffect(() => {
    if (!participant) return; // participant 就緒才產生 src（原因見下方渲染處註解）
    setSrc(buildPrefill(FORM_SRC, 'postTestErq', participant));
  }, [participant]);

  // 送出／撤銷時同步寫入持久化標記：返回或刷新回到這頁就不用重送（見 submissions.ts）。
  // 只有「這次掛載真的偵測到送出」才會走到這裡；恢復的完成態不會重複觸發。
  const handleSubmitted = useCallback(() => {
    if (participant) markSubmitted(participant.id, 'postTestErq');
    onSubmitted?.();
  }, [participant, onSubmitted]);
  const handleUnsubmit = useCallback(() => {
    if (participant) unmarkSubmitted(participant.id, 'postTestErq');
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
          Post-Test: Emotion Regulation Questionnaire
        </h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>
          後測：情緒調節問卷
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
            title="Post-Test: ERQ"
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
        This is the final questionnaire — the study ends once you complete it.
        <br />
        這是最後一份問卷，完成後即結束本研究。
      </p>
    </div>
  );
}
