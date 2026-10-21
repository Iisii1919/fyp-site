'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { clearParticipant } from '@/lib/participant';

interface ThankYouProps {
  participantName?: string;
}

export default function ThankYou({ participantName }: ThankYouProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ⚠️ 研究到此結束 → 清掉參與者身分，這是必要的，不是清理雜物。
  // 不清的話，同一台電腦的下一位參與者會沿用這一位的 Participant ID 與組別
  // （組別只隨機決定一次），兩人的資料會被併成同一列，而且整台電腦的人都落在同一組，
  // 50/50 隨機分派就失效了。詳細說明見 src/lib/participant.tsx 的 clearParticipant()。
  useEffect(() => {
    clearParticipant();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const colors = ['#d4bfff', '#EAECEF', '#9b7fd4', '#b99a7d', '#C6A8F8'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8 - 0.3,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div
      className="h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #5a5a5a 0%, #4a4a4a 50%, #3d3d3d 100%)' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: 0.6 }} />

      {/* 環境光 */}
      <div className="ambient-glow" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(198,168,248,0.14) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* 棕色裝飾（右下角斜切） */}
      <div
        className="absolute bottom-0 right-0 h-full w-[25%] opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center z-10 px-6 max-w-3xl mx-auto"
      >
        {/* 完成徽章 */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
          style={{ background: 'linear-gradient(135deg, #d4bfff, #9b7fd4)', boxShadow: '0 0 60px rgba(198,168,248,0.34)' }}
        >
          <svg className="w-10 h-10 text-[#3d3d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* 標題 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-serif font-bold mb-3"
        >
          <span className="block text-[#FFFFFF] text-4xl md:text-5xl">Thank You</span>
          <span className="block text-gold-gradient italic text-3xl md:text-4xl mt-2">感謝您的參與</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="gold-divider max-w-[200px] mx-auto my-8"
        />

        {/* 感謝信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="glass-card p-8 md:p-10 max-w-xl mx-auto mb-8"
        >
          <p className="text-[#EAECEF] text-lg leading-relaxed font-serif mb-3">
            Thank you for participating in our research study{participantName ? `, ${participantName}` : ''}.
          </p>
          <p className="text-[#C6A8F8] text-sm leading-relaxed">
            感謝您參與我們的研究{participantName ? `，${participantName}` : ''}。
          </p>
          <div className="border-t border-[rgba(198,168,248,0.12)] pt-6 mt-6">
            <p className="text-[#9a9a9a] text-sm leading-relaxed">
              Your contribution helps advance scientific knowledge and understanding.
            </p>
            <p className="text-[#8a8a8a] text-xs mt-2">
              您的貢獻有助於推進科學知識和理解。
            </p>
          </div>
        </motion.div>

        {/* 研究資訊 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mb-10 text-xs"
        >
          {[
            { label: 'Duration', value: '20-30 min', zh: '時長' },
            { label: 'Confidential', value: 'Anonymous · 匿名', zh: '數據保密' },
            { label: 'Contact', value: 's1160702@s.eduhk.hk', zh: '聯絡' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-[#8a8a8a] uppercase tracking-wider text-[10px]">{item.label} · {item.zh}</p>
              <p className="text-[#d4bfff] text-sm font-medium mt-1">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* 可關閉頁面提示（中英文） */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="text-center text-[#b0a89e] text-sm leading-relaxed mt-2 mb-8"
        >
          You can now close this page.
          <br />
          你現在可以關閉頁面。
        </motion.p>
      </motion.div>
    </div>
  );
}
