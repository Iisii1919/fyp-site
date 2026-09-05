'use client';

import { motion } from 'framer-motion';

interface PreTest1Props {
  onComplete: () => void;
}

export default function PreTest1({ onComplete }: PreTest1Props) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Pre-Test Questionnaire (1)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">前測問卷（一）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the first pre-test questionnaire before watching the videos.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          觀看影片前，請先完成第一份前測問卷。
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
          src="https://docs.google.com/forms/d/e/1FAIpQLScVhr-y__tyvPHGai_h0jRF9Db6pPLZdqTE-O6GeC5qd9oj6A/viewform?embedded=true"
          width="100%"
          height="2568"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Pre-Test Questionnaire 1"
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
          After submitting the form, scroll down to continue to the next questionnaire.
        </p>
        <p className="text-[#8a8a8a] text-xs mb-6">
          提交問卷後，向下滾動繼續填寫下一份問卷。
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
