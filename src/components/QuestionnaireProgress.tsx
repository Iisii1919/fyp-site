'use client';

import { motion } from 'framer-motion';

interface QuestionnaireProgressProps {
  /** 每份問卷的名稱（顯示用，順序＝頁面由上到下的順序）。 */
  labels: string[];
  /** 對應 labels，是否已提交。 */
  done: boolean[];
  /** 點「回到未完成的問卷」時呼叫，參數是第幾份（0-based）。 */
  onJumpTo?: (index: number) => void;
}

/**
 * 同一頁有多份問卷時的進度提示。
 *
 * 為什麼需要這個：
 * 一頁疊兩份問卷時，參與者可能只做完第二份就以為結束了，
 * 第一份的資料就會缺漏（而且他們自己也無從得知）。
 * 所以除了「兩份都送出才前進」這個硬性規則外，
 * 還要讓他們隨時看得出還剩哪一份沒做，並且能一鍵跳回去補。
 */
export default function QuestionnaireProgress({ labels, done, onJumpTo }: QuestionnaireProgressProps) {
  const finished = done.filter(Boolean).length;
  const allDone = finished === done.length;
  const firstMissing = done.findIndex((d) => !d);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-3xl mx-auto glass-card px-6 py-5"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <span className="text-[#d4bfff] text-sm font-medium">
          問卷進度 <span className="text-[#EAECEF]">{finished}</span> / {done.length}
        </span>

        {/* 進度點：實心＝已提交 */}
        <div className="flex items-center gap-2" aria-hidden>
          {done.map((d, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: d ? 28 : 14,
                background: d ? '#C6A8F8' : 'rgba(198,168,248,0.22)',
              }}
            />
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {labels.map((label, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 text-[11px]"
              style={
                done[i]
                  ? { background: 'rgba(198,168,248,0.9)', color: '#2a1a3a' }
                  : { border: '1px solid rgba(198,168,248,0.35)', color: '#8a8a8a' }
              }
            >
              {done[i] ? '✓' : i + 1}
            </span>
            <span className={done[i] ? 'text-[#9a9a9a] line-through' : 'text-[#EAECEF]'}>
              {label}
            </span>
            <span className="text-xs text-[#8a8a8a] ml-auto">
              {done[i] ? '已提交' : '未提交'}
            </span>
          </li>
        ))}
      </ul>

      {!allDone ? (
        <div className="mt-5 pt-4 border-t border-[rgba(198,168,248,0.12)]">
          <p className="text-[#9a9a9a] text-xs leading-relaxed mb-3">
            請完成全部 {done.length} 份問卷才會繼續下一步。
            <br />
            Please submit all {done.length} questionnaires to continue.
          </p>
          {onJumpTo && firstMissing >= 0 && (
            <button
              type="button"
              onClick={() => onJumpTo(firstMissing)}
              className="text-xs px-4 py-2 rounded-full border border-[rgba(198,168,248,0.45)] bg-[rgba(198,168,248,0.12)] text-[#d4bfff] hover:bg-[rgba(198,168,248,0.24)] transition-colors"
            >
              ↑ 回到「{labels[firstMissing]}」
            </button>
          )}
        </div>
      ) : (
        <p className="mt-5 pt-4 border-t border-[rgba(198,168,248,0.12)] text-[#d4bfff] text-xs">
          兩份都已完成，正在前往下一步…
        </p>
      )}
    </motion.div>
  );
}
