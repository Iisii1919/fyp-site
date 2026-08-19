'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onMouseMove?: (e: MouseEvent) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Hero({ onMouseMove }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPos = (clientX - innerWidth / 2) / innerWidth;
      const yPos = (clientY - innerHeight / 2) / innerHeight;

      const glows = heroRef.current.querySelectorAll('.ambient-glow');
      glows.forEach((glow, i) => {
        const factor = (i + 1) * 20;
        (glow as HTMLElement).style.transform = `translate(${xPos * factor}px, ${yPos * factor}px)`;
      });

      if (onMouseMove) onMouseMove(e);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [onMouseMove]);

  const scrollToConsent = () => {
    setTimeout(() => {
      const consentSection = document.querySelector('[data-section="1"]');
      consentSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1620 0%, #0e0d10 50%, #08070a 100%)' }}
    >
      {/* 環境光暈 */}
      <div
        className="ambient-glow"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div
        className="ambient-glow"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(168,137,79,0.1) 0%, transparent 70%)',
          bottom: '-15%',
          left: '-10%',
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div
        className="ambient-glow"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(224,201,148,0.08) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* 細網格背景 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 內容 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* 徽章 */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.05)] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse"></span>
            <span className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] font-medium">
              Final Year Project · 畢業專題研究
            </span>
          </div>
        </motion.div>

        {/* 主標題 */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-serif font-bold leading-[1.05]">
            <span className="block text-[#f5f0e8]">Study Experience</span>
            <span className="block text-gold-gradient italic mt-2">Research Platform</span>
          </h1>
        </motion.div>

        {/* 副標題 */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-[#d4cdc0] font-serif font-medium tracking-wide">
            研究體驗平台
          </h2>
        </motion.div>

        {/* 分隔線 */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#c9a96e]/50"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a96e]/60"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#c9a96e]/50"></div>
        </motion.div>

        {/* 描述 */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-14">
          <p className="text-[#9a9288] text-lg leading-relaxed">
            Welcome to our research study. We invite you to explore and participate in our experiment.
          </p>
          <p className="text-[#6b645c] text-base mt-3 leading-relaxed">
            歡迎參加我們的研究實驗。我們誠摯邀請您探索並參與這項研究過程。
          </p>
        </motion.div>

        {/* 三個特色卡片 */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-5 mb-14 max-w-4xl mx-auto">
          {[
            { icon: '🎬', en: 'Watch Videos', zh: '觀看精心準備的影片片段' },
            { icon: '📝', en: 'Complete Tasks', zh: '完成問卷與數據收集任務' },
            { icon: '🔬', en: 'Research Study', zh: '助力學術研究進展' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="glass-card p-6 text-left group cursor-default"
            >
              <div className="text-3xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
              <h3 className="text-[#e0c994] font-serif text-lg mb-2">{item.en}</h3>
              <p className="text-[#6b645c] text-sm leading-relaxed">{item.zh}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 開始按鈕 */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToConsent}
            className="btn-gold text-base font-semibold inline-flex items-center gap-3"
          >
            <span>Start Study</span>
            <span className="text-xs opacity-70 font-normal">開始研究</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 滾動提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-6 h-10 rounded-full border border-[rgba(201,169,110,0.3)] flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-[#c9a96e]"
          />
        </div>
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#6b645c]">Scroll</span>
      </motion.div>
    </div>
  );
}
