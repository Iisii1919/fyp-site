'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// 讓整份同意書一次顯示完、不產生 iframe 內頁捲軸。
// 以真實裝置視口（Emulation.setDeviceMetricsOverride）實測兩頁表單內容高度：
//   第 1 頁（同意書正文 + 確認勾選）：
//     寬 768px → 1402px ／ 640px → 1530px ／ 480px → 1774px ／ 390px → 2033px
//   第 2 頁（電子簽署）不隨寬度重排：約 1480px（寬 767px 時略高於第 1 頁）
// 以下高度 = 兩頁取較高者 + 約 25px 緩衝，確保翻頁後送出鈕不因內頁捲軸被裁掉。
const heightForWidth = (w: number) => {
  if (w >= 720) return 1505;
  if (w >= 560) return 1555;
  if (w >= 440) return 1800;
  return 2060;
};

// ⚠️ 同意書表單目前有幾頁。
// 現況是「兩頁」：第一頁同意書正文＋確認勾選，第二頁簽名／日期／確認。
// 兩頁表單翻頁時 Google 會重新載入整份文件，與「送出」長得一模一樣，
// 跨網域無法分辨，所以 pages=2 時不做任何自動判斷（只給手動收合鈕）。
//
// 在 Google Form 把兩個區段合併成「單頁」之後，把這裡改成 1，
// 就會自動啟用：送出後自動收合 + 自動前往前測問卷。
const CONSENT_FORM_PAGES = 2;

interface ConsentSignatureProps {
  onNext?: () => void;
}

export default function ConsentSignature({ onNext }: ConsentSignatureProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(1505);
  const participant = useParticipant();
  const [src, setSrc] = useState(FORM_SRC);
  const advanceTimer = useRef<number | null>(null);

  // 把 Participant ID / Group 帶進同意書表單（表單需先有這兩個簡答題）。
  useEffect(() => {
    setSrc(buildPrefill(FORM_SRC, 'consentSignature', participant));
  }, [participant]);

  // 送出後先讓參與者看到「已成功遞交」，再自動前往前測問卷。
  const handleSubmitted = useCallback(() => {
    if (advanceTimer.current !== null) return;
    advanceTimer.current = window.setTimeout(() => onNext?.(), 1600);
  }, [onNext]);

  useEffect(
    () => () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

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
