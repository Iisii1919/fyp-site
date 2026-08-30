'use client';

import { motion } from 'framer-motion';

interface PostTest2Props {
  onComplete: () => void;
}

export default function PostTest2({ onComplete }: PostTest2Props) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}>
      {/* 棕色裝飾（右上角斜切） */}
      <div
        className="absolute top-0 right-0 h-full w-[22%] opacity-35 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2">Post-Test Questionnaire (2)</h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4">後測問卷（二）</h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please complete the second post-test questionnaire. This is the final questionnaire.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請完成第二份後測問卷，這是最後一份問卷。
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
          src="https://docs.google.com/forms/d/e/1FAIpQLSfZEBVOQxauanG6meZdXM8-7_6iGO6wck8WeR_uDAazH7_QzA/viewform?embedded=true"
          width="100%"
          height="3914"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Post-Test Questionnaire 2"
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
          After submitting the form, scroll down to finish the study.
        </p>
        <p className="text-[#8a8a8a] text-xs mb-6">
          提交問卷後，向下滾動完成研究。
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
