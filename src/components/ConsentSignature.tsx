'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { useAutoAdvance } from '@/lib/useAutoAdvance';

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// 讓整份同意書一次顯示完、不產生 iframe 內頁捲軸。
//
// 2026-09-13 重測：表單已從「兩頁」合併成「單頁」（同意書正文＋勾選＋簽名＋日期＋確認都在同一頁），
// 內容變高很多，原本的 1505px 已經不夠 → 出現內頁捲軸。
// 以 CDP 實際量測 iframe 內文件的 scrollHeight（iframe 設 300px 高讓內容溢出才量得到真實高度）：
//   768px → 2399 ／ 640px → 2527 ／ 560px → 2571 ／ 480px → 2775 ／ 440px → 2859
//   390px → 3010 ／ 360px → 3158 ／ 340px → 3310 ／ 320px → 3434
//   300px → 3534 ／ 288px → 3646 ／ 276px → 3834
// 每個級距取「該級距最小寬度」的量測值 + 約 30px 緩衝（寬度越小內容越高）。
const heightForWidth = (w: number) => {
  if (w >= 720) return 2430; // 量測 2399（容器 max-w-3xl，實際不會超過 768）
  if (w >= 640) return 2560; // 量測 2527
  if (w >= 560) return 2600; // 量測 2571
  if (w >= 480) return 2810; // 量測 2775
  if (w >= 440) return 2890; // 量測 2859
  if (w >= 390) return 3040; // 量測 3010
  if (w >= 360) return 3190; // 量測 3158
  if (w >= 340) return 3340; // 量測 3310
  if (w >= 320) return 3470; // 量測 3434
  if (w >= 300) return 3570; // 量測 3534
  if (w >= 280) return 3690; // 量測 3646
  return 3880; // 量測 3834（276px）
};

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(2430);
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);

  // 送出後停留一下讓參與者看到「已成功遞交」，再自動前往前測。
  const handleSubmitted = useAutoAdvance(onNext);

  // 把 Participant ID / Group 帶進同意書表單（表單需先有這兩個簡答題）。
  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'consentSignature', participant));
  }, [participant]);

  // 依容器實際寬度決定 iframe 高度（視窗縮放時自動更新）
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const next = heightForWidth(el.clientWidth);
      setFormHeight((prev) => (prev === next ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
          Please read the consent form below, tick the boxes, then type your name on the next page to sign.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請細閱以下同意書、勾選確認，然後於下一頁輸入姓名完成簽署。
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

      {/* 繼續按鈕：放在表單正下方，送出後不用再滑到底部找箭頭。
          合併成單頁表單後，送出會自動前往，這顆就只是備援。 */}
      {onNext && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn-gold text-base font-semibold inline-flex items-center gap-3 mt-8"
        >
          <span>Continue</span>
          <span className="text-xs opacity-70 font-normal">已完成簽署，繼續</span>
        </motion.button>
      )}

      {/* 表單下方的小提示（不擋 StepFooter） */}
      <p className="text-[#8a8a8a] text-xs mt-4 mb-24 text-center">
        完成簽署並遞交後，即可繼續填寫前測問卷。
      </p>
    </div>
  );
}
