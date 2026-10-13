'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { preTestErqHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

interface PreTestErqProps {
  /** 這份問卷是否已提交（由 PreTest 追蹤，用來顯示進度）。 */
  submitted?: boolean;
  /** 偵測到送出時通知 PreTest。是否跳頁由 PreTest 依「全部完成」判斷。 */
  onSubmitted?: () => void;
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
// ⚠️ 畫面上**刻意不寫出「情緒調節問卷 / Emotion Regulation Questionnaire」**
// ---------------------------------------------------------------
// 這一頁的標題只叫「前測問卷（三）」，與 PreTest1 / PreTest2 連號。
// 這不是漏寫，是刻意的：
//   1. 直接告訴參與者「我們在量你的情緒調節策略」等於把研究假設講出來。
//      參與者知道在量什麼之後可能順著調整作答（demand characteristics），
//      而這份量表量的正是**穩定傾向**，被提示後最容易受影響 ——
//      一旦作答被影響，前後測的比較也就失去意義。
//   2. 與 Google 表單本身的標題一致：表單叫「觀前問卷3 Pre-Viewing Questionnaire3」，
//      網站寫成「前測問卷（三）」才對得起來。
//   → **不要把描述性名稱改回來。** 要知道這份是 ERQ，看這段註解就夠了。
const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSeeFbUWQOaH48D-HQ2VfbO7526s52gnZbOF61vhiAjX3xgIaw/viewform?embedded=true';

export default function PreTestErq({ submitted = false, onSubmitted }: PreTestErqProps) {
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(
    preTestErqHeightForWidth,
    preTestErqHeightForWidth(768),
  );

  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'preTestErq', participant));
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
          Pre-Test Questionnaire (3)
        </h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>
          前測問卷（三）
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
          title="Pre-Test Questionnaire 3"
          onSubmitted={onSubmitted}
        />
      </div>

      <p className="text-[#8a8a8a] text-xs mt-8 mb-24 text-center">
        這份問卷沒有對錯，請依直覺作答即可。
      </p>
    </div>
  );
}
