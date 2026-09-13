'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DocxItemView, groupDocxItems } from './DocxView';
import { infoSheetItems } from './data/infoSheet';
import { H1_SHEET, H2_PAGE, H3_SHEET_FLAT } from '@/lib/headingSizes';

interface InformedConsentProps {
  onAccepted: () => void;
}

// 將 INFORMATION SHEET 的內容依「粗體標題」分組成一個個段落區塊
const groups = groupDocxItems(infoSheetItems);

export default function InformedConsent({ onAccepted }: InformedConsentProps) {
  const [isChecked, setIsChecked] = useState(false);

  // ⚠️ 內容卡片是「一屏內可捲動」的設計（max-h-[46vh] overflow-y-auto），
  // 但實測內容約 2841px、可見只有約 412px —— **85~88% 的內容在卡片下方看不到**，
  // 而同意勾選框在卡片外面、永遠可見，於是參與者可以在幾乎沒讀到的情況下就勾同意。
  // 這裡只補「卡片可以捲動」的提示（不改同意流程本身）：
  // 卡片確實有溢出、而且還沒捲到底時才顯示，捲到底就消失。
  // 是否要進一步「必須捲到底才能勾同意」屬於同意流程的變更，需先確認倫理審批。
  const cardRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [reachedBottom, setReachedBottom] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => {
      const overflows = el.scrollHeight > el.clientHeight + 4;
      setCanScroll(overflows);
      setReachedBottom(!overflows || el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  const handleSubmit = () => {
    if (isChecked) {
      onAccepted();
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center pt-4 px-4 pb-44 md:pt-8 md:px-8 md:pb-48 relative"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #545454 0%, #3d3d3d 60%, #3d3d3d 100%)' }}
    >
      {/* 環境光 */}
      <div
        className="ambient-glow"
        style={{
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(198,168,248,0.1) 0%, transparent 70%)',
          top: '10%', right: '5%',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-4xl w-full relative z-10 my-auto"
      >
        {/* 標題區 */}
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-[#FFFFFF] text-2xl md:text-3xl mb-1" style={H1_SHEET}>
            Information Sheet
          </h1>
          <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-5" style={H2_PAGE}>
            研究資料
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-5"></div>

          {/* 研究資訊 */}
          <div className="text-sm space-y-1">
            <p className="text-[#EAECEF] font-serif font-semibold">The Influence of Sadness Film on Enhancing Psychological Resilience</p>
            <p className="text-[#C6A8F8] text-xs">
              LIN Jiaquan &middot; Department of Psychology &middot; Supervisor: Dr. Lawrence Chan
            </p>
            <p className="text-[#9a9a9a] text-xs">
              <a href="mailto:s1160702@s.eduhk.hk" className="hover:text-[#d4bfff] transition-colors">s1160702@s.eduhk.hk</a>
            </p>
          </div>
        </div>

        {/* 內容卡片 */}
        {/* ⚠️ 提示做成「覆蓋在卡片底部」而不是卡片下方的另一行文字：
            這一頁的內容本來就已經超過一個視窗高（實測 1440×900 時同意按鈕底部在 1023px），
            在卡片下方多一行會把按鈕推得更下面。覆蓋層不佔任何版面高度。 */}
        <div className="relative mb-6">
          <div ref={cardRef} className="glass-card p-6 md:p-8 max-h-[46vh] overflow-y-auto pr-2">
            <div className="space-y-5">
              {groups.map((group, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                  className="border-l-2 border-[rgba(198,168,248,0.24)] pl-5 py-1"
                >
                  {group.title && (
                    <div className="mb-2">
                      <h3 className="font-serif text-[#EAECEF] text-base font-semibold" style={H3_SHEET_FLAT}>{group.title}</h3>
                    </div>
                  )}

                  {group.items.length > 0 && (
                    <div className="space-y-2">
                      {group.items.map((item, j) => (
                        <DocxItemView key={j} item={item} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 捲動提示：內容有溢出、且還沒捲到底時才出現 */}
          {canScroll && !reachedBottom && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl h-16 flex items-end justify-center pb-1.5"
              style={{ background: 'linear-gradient(to top, rgba(43,43,43,0.97) 45%, rgba(43,43,43,0))' }}
              aria-hidden
            >
              <span className="text-[#C6A8F8] text-xs text-center px-4">
                ↓ 向下捲動閱讀完整資訊
                <span className="block text-[#8a8a8a] text-[11px]">Scroll down to read the full sheet</span>
              </span>
            </div>
          )}
        </div>

        {/* 同意勾選 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card p-4 md:p-5 mb-6"
        >
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                isChecked
                  ? 'bg-[#d4bfff] border-[#d4bfff]'
                  : 'border-[rgba(198,168,248,0.34)] group-hover:border-[#d4bfff]'
              }`}>
                {isChecked && (
                  <svg className="w-4 h-4 text-[#3d3d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[#c4c4c4] text-sm leading-relaxed">
              I have read and understood the above information. I voluntarily agree to participate in this research study.
              <br />
              <span className="text-[#9a9a9a]">我已閱讀並理解上述資訊。我自願同意參與這項研究。</span>
            </span>
          </label>
        </motion.div>

        {/* 按鈕 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.button
            whileHover={isChecked ? { scale: 1.03 } : {}}
            whileTap={isChecked ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={!isChecked}
            className="btn-gold text-base font-semibold inline-flex items-center gap-3"
          >
            <span>I Agree &amp; Continue</span>
            <span className="text-xs opacity-70 font-normal">我同意並繼續</span>

          </motion.button>

          {/* 按鈕在未勾選時是 disabled（透明度 0.4）。只把按鈕變淡、不說原因的話，
              參與者會以為「按了沒反應」而卡住，所以在這裡說明為什麼還不能按。 */}
          {!isChecked && (
            <p className="text-[#9a9a9a] text-xs mt-3 text-center">
              請先勾選上方同意欄位
              <span className="block text-[#8a8a8a] mt-0.5">Please tick the consent box above first</span>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
