'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import { consentHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// ⚠️ 同意書表單目前有幾頁。
// 2026-09-13：已把 Google Form 的「簽名區段」並回第一頁，現在是「單頁」→ 設 1，
// 送出後會自動收合 + 自動前往前測問卷。
// 若日後又在表單裡加入新的區段（變回多頁），務必改回 2：
// 多頁表單按「繼續」翻頁也會重新載入文件，會被誤判成已送出。
const CONSENT_FORM_PAGES = 1;

interface ConsentSignatureProps {
  onNext?: () => void;
}

export default function ConsentSignature({ onNext }: ConsentSignatureProps) {
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(consentHeightForWidth, consentHeightForWidth(768));
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  // 送出後停留一下讓參與者看到「已成功遞交」，再自動前往前測。
  const handleSubmitted = useAutoAdvance(onNext);

  // 把 Participant ID / Group 帶進同意書表單（表單需先有這兩個簡答題）。
  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'consentSignature', participant));
  }, [participant]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Consent Form</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">同意書簽署</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please read the consent form below, tick the boxes, then type your name to sign and submit.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請細閱以下同意書、勾選確認，然後輸入姓名完成簽署並遞交。
        </p>
      </motion.div>

      {/* Google Form iframe（高度依寬度自適應）。
          pages 由 CONSENT_FORM_PAGES 決定；合併成單頁後就會自動收合 + 自動進入前測。 */}
      <div ref={wrapRef} className="w-full max-w-3xl">
        <GoogleFormEmbed
          src={src}
          height={formHeight}
          title="Consent to Participate in Research"
          pages={CONSENT_FORM_PAGES}
          onSubmitted={handleSubmitted}
        />
      </div>

      {/* 表單下方的小提示（不擋 StepFooter）。
          表單合併成單頁後，簽名也在同一頁，所以不再有「下一頁」可以輸入姓名。 */}
      <p className="text-[#8a8a8a] text-xs mt-4 mb-24 text-center">
        遞交後會自動繼續前往前測問卷，不需要再按其他按鈕。
      </p>
    </div>
  );
}
