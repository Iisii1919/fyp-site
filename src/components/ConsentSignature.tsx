'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import GoogleFormEmbed from '@/components/GoogleFormEmbed';
import { useParticipant } from '@/lib/participant';
import { buildPrefill } from '@/lib/formPrefill';
import { isSubmitted, markSubmitted } from '@/lib/submissions';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import { consentHeightForWidth } from '@/lib/formHeights';
import { useFormHeight } from '@/lib/useFormHeight';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSdsPN6zMjcZmsLTYfugdrTYpKOVxzYAZZsAo6UKDGE-LFPK3A/viewform?embedded=true';

// ⚠️ 同意書表單目前有幾頁。
// 2026-09-13：已把 Google Form 的「簽名區段」並回第一頁，現在是「單頁」→ 設 1，
// 送出後會自動收合 + 自動前往前測問卷。
// 若日後又在表單裡加入新的區段（變回多頁），務必改回 2：
// 多頁表單按「繼續」翻頁也會重新載入文件，會被誤判成已送出。
const CONSENT_FORM_PAGES = 1;

/**
 * 今天的日期，格式 `YYYY-MM-DD`（給 `<input type="date">` 與表單預填用）。
 *
 * ⚠️ 用本地時區自己組字串，**不要用 `toISOString()`** —— 那會轉成 UTC，
 *    在香港／台灣的晚上（UTC+8 的 00:00–08:00）會算成「昨天」。
 */
function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface ConsentSignatureProps {
  onNext?: () => void;
}

export default function ConsentSignature({ onNext }: ConsentSignatureProps) {
  // iframe 高度依容器寬度查表（高度表與量測說明在 src/lib/formHeights.ts）
  const [wrapRef, formHeight] = useFormHeight(consentHeightForWidth, consentHeightForWidth(768));
  const participant = useParticipant();
  // participant 就緒前保持 null：iframe 只會用帶 prefill 的網址載入「一次」（原因見下方渲染處註解）
  const [src, setSrc] = useState<string | null>(null);

  /**
   * 簽署日期 —— 為什麼要自己在網站上做一個日期選擇器：
   *
   * Google Forms 的 **DATE 題型在手機／iPad 上沒有日曆**，會被拆成「日 / 月 / 年」
   * 三個數字框，參與者得一格一格打（只有桌面版才有日曆）。
   * 而 `<input type="date">` 在手機上**會叫出系統日曆**，所以改成：
   * 這裡先讓參與者選（預設今天），再用預填把值帶進表單 → 他們完全不用碰那一題。
   * （預填格式見 src/lib/formPrefill.ts 的 FormPrefillFields.date，2026-10-22 已實測有效。）
   *
   * ⚠️ 初始值刻意是空字串、掛載後才設成今天：
   *    `useState(() => todayISO())` 在 SSR 也會執行，伺服器（UTC）與使用者（UTC+8）
   *    可能算出不同日期 → hydration 不一致。先空再填就沒這個問題。
   */
  const [signDate, setSignDate] = useState('');

  // 送出後停留一下讓參與者看到「已成功遞交」，再自動前往前測。
  const triggerAdvance = useAutoAdvance(onNext);

  // 「上次已送出」的恢復狀態：返回／刷新回到這頁時直接顯示收合完成態＋Next 鈕，
  // 不再要求重送（資料已在 Google），也不重複自動跳轉把按返回的人又往前推
  // （標記的存取見 src/lib/submissions.ts）。
  const [restoredDone, setRestoredDone] = useState(false);

  // 只有「這次掛載真的送出」才寫標記＋自動跳轉。
  const handleSubmitted = useCallback(() => {
    if (participant) markSubmitted(participant.id, 'consentSignature');
    triggerAdvance();
  }, [participant, triggerAdvance]);

  useEffect(() => {
    setSignDate(todayISO());
  }, []);

  // 把 Participant ID / Group / 簽署日期帶進同意書表單。
  // ⚠️ 兩個條件都就緒才組網址 —— 這樣 iframe 只會用「完整 prefill」的網址載入一次，
  //    不會先載入一次沒有日期的版本（多一次載入＝多一個 history entry，見下方註解）。
  useEffect(() => {
    if (!participant) return;
    // 「上次已送出」的恢復標記與日期無關，participant 一到就查
    setRestoredDone(isSubmitted(participant.id, 'consentSignature'));
    if (!signDate) return;
    setSrc(buildPrefill(FORM_SRC, 'consentSignature', participant, signDate));
  }, [participant, signDate]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>Consent Form</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>同意書簽署</h2>
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
        {/* 簽署日期：先選好，再填下面的表單。
            為什麼要這個：Google Forms 的 DATE 題在手機／iPad 上沒有日曆（只有桌面版有），
            會被拆成日／月／年三個數字框。`<input type="date">` 在手機上會叫出系統日曆，
            選好之後用預填帶進表單，參與者就不用碰那一題了。
            ⚠️ 改日期會讓下面的 iframe 重新載入（prefill 在網址上），
               所以提示寫「先選好再開始填」，避免填到一半改日期而丟失內容。
            恢復完成態（已送過）時不顯示：表單已收合，日期不用再選。 */}
        {!restoredDone && (
        <div className="mb-4 px-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2">
          <label htmlFor="sign-date" className="shrink-0 leading-snug">
            <span className="block text-[#d4bfff] text-sm font-medium">Date of signature</span>
            <span className="block text-[#9a9a9a] text-xs">簽署日期</span>
          </label>
          <input
            id="sign-date"
            type="date"
            value={signDate}
            onChange={(e) => setSignDate(e.target.value)}
            className="bg-[rgba(198,168,248,0.12)] border border-[rgba(198,168,248,0.4)] rounded-lg px-3 py-2 text-[#EAECEF] text-sm w-full sm:w-auto focus:outline-none focus-visible:border-[rgba(198,168,248,0.9)]"
            // 讓原生日曆彈出層配合深色底（Chrome/Edge 支援；其他瀏覽器會忽略）
            style={{ colorScheme: 'dark' }}
          />
          <span className="text-[#8a8a8a] text-xs leading-snug">
            <span className="block">Filled into the form below — choose it before you start.</span>
            <span className="block">已填入下方表格，請先選好再開始填。</span>
          </span>
        </div>
        )}

        {/* ⚠️ src 為 null（participant 未就緒）時刻意**不掛 iframe**。原因見 PreTest1.tsx
            的同位置註解：先掛無 prefill 網址再換 src，會在聯合 session history 多生
            entry，參與者按「返回」會把 iframe 導回沒有 prefill 的網址。 */}
        {src ? (
          <GoogleFormEmbed
            src={src}
            height={formHeight}
            title="Consent to Participate in Research"
            pages={CONSENT_FORM_PAGES}
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

      {/* 表單下方的小提示（不擋 StepFooter）。
          表單合併成單頁後，簽名也在同一頁，所以不再有「下一頁」可以輸入姓名。 */}
      <p className={`text-[#8a8a8a] text-xs mt-4 text-center ${restoredDone ? '' : 'mb-24'}`}>
        {restoredDone ? (
          <>
            You have already submitted this form — press “Next · 下一頁” to continue.
            <br />
            你已提交過這份同意書，按「下一頁」即可繼續。
          </>
        ) : (
          <>
            After you submit, you will automatically continue to the pre-test questionnaires — no need to press any other button.
            <br />
            遞交後會自動繼續前往前測問卷，不需要再按其他按鈕。
          </>
        )}
      </p>

      {/* 已送過的人按返回／刷新回來：給一顆明確的「下一頁」，不用再送一次。
          平時刻意沒有這顆按鈕（防止跳過同意書），只有恢復完成態才出現。 */}
      {restoredDone && onNext && (
        <button
          type="button"
          onClick={onNext}
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
