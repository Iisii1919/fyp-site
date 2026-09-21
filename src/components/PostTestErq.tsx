'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { postTestErqHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PostTestErqProps {
  /** 這份問卷是否已提交（由 PostTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PostTest。是否跳頁由 PostTest 依「全部完成」判斷。 */
  onSubmitted?: () => void;
}

// 後測 ERQ（認知重評子量表）—— 接在 PostTest2 之後。
//
// 與前測 ERQ 是同一份量表、同一組題目，只有表單不同（分別收進不同回應表）。
// 真正要分析的是前後測的差距／穩定性，所以兩份的題目與順序必須完全一致。
//
// ⚠️ 題號沿用 ERQ 原始編號（1/3/5/7/8/10），不可重新編號，理由見 PreTestErq.tsx。
const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSf4dqWthqMj6ZaZk0FVltBMCmi6GM_cqpT-bosuB8iU03z-Fg/viewform?embedded=true';

export default function PostTestErq({ submitted = false, onSubmitted }: PostTestErqProps) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(
    postTestErqHeightForWidth,
    postTestErqHeightForWidth(768),
  );

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'postTestErq', participant));
  }, [participant]);

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
          Emotion Regulation Questionnaire
        </h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>
          情緒調節問卷（認知重評）
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
        <GoogleFormEmbed
          src={src}
          height={formHeight}
          title="Emotion Regulation Questionnaire (Post-Viewing)"
          onSubmitted={onSubmitted}
        />
      </div>

      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        這是最後一份問卷，完成後即結束本研究。
      </p>
    </div>
  );
}
