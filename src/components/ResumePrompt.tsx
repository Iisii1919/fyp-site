'use client';

import { motion } from 'framer-motion';

interface ResumePromptProps {
  /** 該步驟的中文名稱，讓參與者看得懂「上次做到哪」。 */
  label: string;
  onResume: () => void;
  onRestart: () => void;
}

/**
 * 重新載入後詢問「要接續上次進度嗎？」。
 *
 * 為什麼要問而不是直接接續：見 src/lib/progress.ts 的說明 ——
 * 瀏覽器分不出「同一人重新載入」與「換下一位參與者」。
 * 直接接續的話，上一場沒做完的殘留進度會被下一位默默接手；
 * 直接歸零的話，誤按 F5 的人就得從頭再做一次並重複送出問卷。
 * 問一句就能同時避開這兩件事。
 *
 * ⚠️ 刻意做成不可關閉的模態：一定要選一個，不能按 Esc 或點背景消失，
 * 否則參與者可能停在這一步不知道要做什麼。
 */
export default function ResumePrompt({ label, onResume, onRestart }: ResumePromptProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(18,18,18,0.9)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-card w-full max-w-md p-7 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(198,168,248,0.15), rgba(198,168,248,0.05))',
            border: '1px solid rgba(198,168,248,0.3)',
          }}
        >
          <svg className="w-6 h-6 text-[#d4bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h2
          id="resume-title"
          className="font-serif text-[#EAECEF] font-semibold mb-1"
          // ⚠️ 用 inline style 而不是 Tailwind 的 text-xl。
          // globals.css 有一條未包在 @layer 裡的 `h2 { font-size: clamp(...) }`，
          // 而未分層的規則在 CSS cascade layer 制下**一律勝過** @layer utilities，
          // 所以 text-xl 會被蓋掉（實測：44px 而非 20px，標題因此折成兩行）。
          // 這裡只針對這個元件修正；全站同類問題見 MEMORY.md 的記錄。
          style={{ fontSize: '1.25rem' }}
        >
          偵測到未完成的進度
        </h2>
        <p className="text-[#C6A8F8] text-sm">Unfinished session found</p>

        <p className="text-[#9a9a9a] text-sm mt-5 leading-relaxed">
          這個瀏覽器上次進行到「{label}」。要從那裡接續嗎？
          <br />
          <span className="text-[#8a8a8a] text-xs">
            This browser stopped at “{label}”. Continue from there?
          </span>
        </p>

        <div className="flex flex-col gap-3 mt-7">
          <button type="button" onClick={onResume} className="btn-gold text-sm font-semibold">
            接續上次進度
            <span className="block text-xs opacity-70 font-normal mt-0.5">Continue where I left off</span>
          </button>
          <button type="button" onClick={onRestart} className="btn-outline text-sm">
            重新開始
            <span className="block text-xs opacity-70 font-normal mt-0.5">Start over</span>
          </button>
        </div>

        <p className="text-[#8a8a8a] text-xs mt-5 leading-relaxed">
          這台電腦要換下一位參與者，請選「重新開始」（會產生新的參與者編號）。
          <br />
          Starting a new participant? Choose “Start over”.
        </p>
      </motion.div>
    </div>
  );
}
