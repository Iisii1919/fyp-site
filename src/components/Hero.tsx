'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, type Variants } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onMouseMove?: (e: MouseEvent) => void;
}

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
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

  return (
    <div
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #5e5e5e 0%, #545454 50%, #3d3d3d 100%)' }}
    >
      {/* 環境光暈 */}
      <div className="ambient-glow" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(198,168,248,0.16) 0%, transparent 70%)', top: '-10%', right: '-5%', transition: 'transform 0.3s ease-out' }} />
      <div className="ambient-glow" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(107,83,64,0.12) 0%, transparent 70%)', bottom: '-15%', left: '-10%', transition: 'transform 0.3s ease-out' }} />
      <div className="ambient-glow" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(169,138,107,0.09) 0%, transparent 70%)', top: '40%', left: '50%', transition: 'transform 0.3s ease-out' }} />

      {/* 深棕色幾何裝飾（右側斜切多邊形） */}
      <div
        className="absolute top-0 right-0 h-full w-[35%] opacity-60"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />
      <div
        className="absolute top-0 right-0 h-full w-[20%] opacity-40"
        style={{
          background: 'linear-gradient(135deg, #4d3d2e 0%, #3c2d1e 100%)',
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 20% 100%)',
        }}
      />

      {/* 細網格背景 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(198,168,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(198,168,248,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* 內容區刻意只佔「視窗高度 − 112px」。
          StepFooter 是 absolute bottom-0 且固定佔 112px，如果把內容置中於整個
          100vh，視窗高度剛好時最後一行文字會落在頁腳帶裡被「Next · 下一頁」按鈕蓋住
          （實測 inner height 760–920px 都會發生）。限制高度後按鈕永遠不會壓到內容。 */}
      <div className="hero-rhythm relative z-10 h-[calc(100vh-112px)] w-full flex items-center justify-center overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center px-6 max-w-5xl mx-auto"
      >
        {/* 徽章 */}
        <motion.div variants={itemVariants} className="mb-[var(--hero-gap)]">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-[rgba(198,168,248,0.28)] bg-[rgba(198,168,248,0.06)] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4bfff] animate-pulse"></span>
            <span className="text-xs tracking-[0.2em] uppercase text-[#d4bfff] font-medium">
              Final Year Project · 畢業專題研究
            </span>
          </div>
        </motion.div>

        {/* 主標題 */}
        <motion.div variants={itemVariants} className="mb-[calc(var(--hero-gap)*0.5)]">
          <h1 className="hero-title font-serif font-bold leading-[1.05]">
            <span className="block text-[#FFFFFF]">Sadness Film</span>
            <span className="block text-accent-gradient italic mt-2">on Resilience</span>
          </h1>
        </motion.div>

        {/* 副標題 */}
        <motion.div variants={itemVariants} className="mb-[var(--hero-gap)]">
          <h2 className="text-[#EAECEF] font-serif font-medium tracking-wide">
            傷感電影與心理韌性研究
          </h2>
        </motion.div>

        {/* 分隔線 */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-[var(--hero-gap)]">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#d4bfff]/50"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#d4bfff]/60"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#d4bfff]/50"></div>
        </motion.div>

        {/* 描述 */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-[calc(var(--hero-gap)*1.25)]">
          <p className="text-[#c4c4c4] text-lg leading-relaxed">
            This study aims to explore the influence of sadness film on psychological resilience.
          </p>
          <p className="text-[#9a9a9a] text-base mt-3 leading-relaxed">
            本研究旨在探討傷感電影對心理韌性的影響。
          </p>
        </motion.div>

        {/* 三個特色卡片 */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-5 mb-[calc(var(--hero-gap)*1.25)] max-w-4xl mx-auto">
          {[
            { en: 'Watch Videos', zh: '觀看精心準備的影片片段' },
            { en: 'Complete Tasks', zh: '完成問卷與數據收集任務' },
            { en: 'Research Study', zh: '助力學術研究進展' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="glass-card p-6 text-center group cursor-default"
            >
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#d4bfff]/50 to-transparent mx-auto mb-4"></div>
              <h3 className="text-[#EAECEF] font-serif text-lg mb-2">{item.en}</h3>
              <p className="text-[#9a9a9a] text-sm leading-relaxed">{item.zh}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 時間說明（取代原本的「Start Study」按鈕） */}
        <motion.div variants={itemVariants} className="mt-[var(--hero-gap)] max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#d4bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeWidth={1.5} d="M12 7v5l3 2" />
            </svg>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4bfff] font-medium">~ 30 min</span>
          </div>
          <p className="text-[#c4c4c4] text-base leading-relaxed">
            The full study takes about 30 minutes. Please reserve enough time to participate.
          </p>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mt-2">
            整個流程約需 30 分鐘，請預留足夠時間參加。
          </p>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
