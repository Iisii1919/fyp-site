'use client';

import { motion } from 'framer-motion';

interface PreTest2Props {
  onComplete: () => void;
}

export default function PreTest2({ onComplete }: PreTest2Props) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 棕色裝飾（右上角斜切） */}
      <div
        className="absolute top-0 right-0 h-full w-[20%] opacity-35 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Pre-Test Questionnaire (2)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">前測問卷（二）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the second pre-test questionnaire before watching the videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看影片前，請完成第二份前測問卷。
        </p>
      </motion.div>

      {/* Google Form iframe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[rgba(198,168,248,0.18)]"
      >
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdhW3ivEplLsKicsqOdBVn7aY0kmuI_w8Mml_DcJst1htX4bw/viewform?embedded=true"
          width="100%"
          height="3894"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Pre-Test Questionnaire 2"
        >
          載入中… Loading…
        </iframe>
      </motion.div>

      {/* 滾動提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 mb-12 text-center"
      >
        <p className="text-[#9a9a9a] text-sm mb-2">
          After submitting the form, scroll down to continue to the videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mb-6">
          提交問卷後，向下滾動繼續觀看影片。
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
