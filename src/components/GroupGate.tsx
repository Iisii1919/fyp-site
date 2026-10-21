'use client';

import { motion } from 'framer-motion';
import { useParticipant } from '@/lib/participant';

interface GroupGateProps {
  onContinue: () => void;
}

// ⚠️ 這一頁刻意「不顯示組別」（sadness / neutral 都不顯示）。
// 原因：觀影前讓參與者知道自己屬於哪一組，會造成需求效應（demand characteristics），
// 影響後續自評量表的作答。組別代號仍然存在於 participant.group，只是不呈現在畫面上。
// 兩組看到的文字完全相同，僅參與者編號不同。
export default function GroupGate({ onContinue }: GroupGateProps) {
  const participant = useParticipant();

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden no-snap" style={{ background: 'radial-gradient(ellipse at center, #545454 0%, #3d3d3d 70%)' }}>
      <div className="ambient-glow" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(198,168,248,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-6 w-full max-w-2xl"
      >
        <p className="text-[#9a9a9a] text-xs tracking-[0.3em] uppercase mb-4">Preparing Your Session · 準備你的觀影</p>
        {participant ? (
          <>
            <h1 className="font-serif font-bold text-3xl md:text-5xl mb-4 tracking-wide" style={{ color: '#C6A8F8' }}>
              觀影即將開始
            </h1>
            <p className="text-[#C6A8F8] text-lg md:text-xl font-serif mb-2">Your session is about to begin</p>
            <p className="text-[#9a9a9a] text-sm mb-4">You will watch a series of short film excerpts. Take your time.</p>
            <p className="text-[#8a8a8a] text-xs mb-6">你將觀看一系列短片片段，請慢慢觀賞。</p>

            {/* 只顯示參與者編號，不顯示組別 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="text-[#8a8a8a] text-[10px] tracking-wider uppercase">Participant · 參與者</span>
              <span className="text-[#EAECEF] text-xs font-mono">{participant.id}</span>
            </div>

            {/* 觀影前的兩個提醒：耳機 + Wi-Fi。
                ⚠️ 兩張卡刻意長得一樣（同色系、同尺寸），讓它們讀起來是一組提醒，
                   而不是一張警告加一張說明。
                ⚠️ Wi-Fi 那張不是客套話：8 支片段合計 1.6–1.9 GB（2026-10-13 實測），
                   用行動數據看完一支片就會吃掉大半個月的流量。
                   所以文案要講「為什麼」，不要只寫「請用 Wi-Fi」。 */}
            <div className="flex flex-col gap-3 max-w-md mx-auto mb-8">
              {/* 耳機提示：影片有聲音，先提醒參與者戴耳機（剪影圖示 + 中英文字）。
                  放在按鈕正上方，因為參與者按下按鈕前一定會看到這裡。 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left"
                style={{ background: 'rgba(198,168,248,0.10)', border: '1px solid rgba(198,168,248,0.32)' }}
              >
                <svg
                  className="w-8 h-8 shrink-0"
                  viewBox="0 0 24 24"
                  style={{ color: '#C6A8F8' }}
                  role="img"
                  aria-label="Headphones"
                >
                  {/* 耳機剪影：粗頭帶（描邊）＋ 兩側實心耳罩 */}
                  <path d="M3.5 14.5V12a8.5 8.5 0 0 1 17 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  <rect x="1.5" y="13.5" width="5" height="8" rx="2.5" fill="currentColor" />
                  <rect x="17.5" y="13.5" width="5" height="8" rx="2.5" fill="currentColor" />
                </svg>
                <span className="leading-snug">
                  <span className="block text-[#EAECEF] text-sm font-medium">戴上耳機，效果更佳</span>
                  <span className="block text-[#9a9a9a] text-xs mt-1">
                    Headphones recommended for the best experience
                  </span>
                </span>
              </motion.div>

              {/* Wi-Fi 提示 */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left"
                style={{ background: 'rgba(198,168,248,0.10)', border: '1px solid rgba(198,168,248,0.32)' }}
              >
                <svg
                  className="w-8 h-8 shrink-0"
                  viewBox="0 0 24 24"
                  style={{ color: '#C6A8F8' }}
                  role="img"
                  aria-label="Wi-Fi"
                >
                  {/* Wi-Fi 剪影：三段同心弧 + 圓點 */}
                  <path d="M4.2 9.6a11.5 11.5 0 0 1 15.6 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M7.4 13.2a7 7 0 0 1 9.2 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M10.4 16.7a2.7 2.7 0 0 1 3.2 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="19.6" r="1.5" fill="currentColor" />
                </svg>
                <span className="leading-snug">
                  <span className="block text-[#EAECEF] text-sm font-medium">請連接 Wi-Fi 觀看</span>
                  <span className="block text-[#9a9a9a] text-xs mt-1">
                    Please use Wi-Fi — the film clips are large and would use a lot of mobile data
                  </span>
                </span>
              </motion.div>
            </div>

            <div>
              <motion.button
                onClick={onContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full font-semibold text-[#3d3d3d] text-base"
                style={{ background: 'linear-gradient(135deg, #d4bfff, #9b7fd4)' }}
              >
                Continue to Videos · 開始觀影
              </motion.button>
            </div>
          </>
        ) : (
          <p className="text-[#9a9a9a]">Preparing… 準備中…</p>
        )}
      </motion.div>
    </div>
  );
}
