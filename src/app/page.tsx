'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import InformedConsent from '@/components/InformedConsent';
import ConsentSignature from '@/components/ConsentSignature';
import PreTest1 from '@/components/PreTest1';
import PreTest2 from '@/components/PreTest2';
import VideoViewer from '@/components/VideoViewer';
import PostTest1 from '@/components/PostTest1';
import PostTest2 from '@/components/PostTest2';
import PostViewFeedback from '@/components/PostViewFeedback';
import ThankYou from '@/components/ThankYou';

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= -100 && rect.top <= 100) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 自訂垂直吸附：比原生慢、有變速 easing，且問卷區（no-snap、距離遠）不吸附
  useEffect(() => {
    const SNAP_DURATION = 800; // ms，越慢越從容
    let animating = false;

    const getTargets = (): number[] => {
      const els = document.querySelectorAll('section:not(.no-snap), .scroll-snap-start');
      const tops: number[] = [];
      els.forEach((el) => {
        const top = Math.round((el as HTMLElement).getBoundingClientRect().top + window.scrollY);
        if (!Number.isNaN(top)) tops.push(top);
      });
      return tops.sort((a, b) => a - b);
    };

    const tweenTo = (targetY: number) => {
      const startY = window.scrollY;
      const dist = targetY - startY;
      if (Math.abs(dist) < 2) return;
      animating = true;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / SNAP_DURATION);
        // easeInOutCubic —— 開頭慢、中段快、尾段再慢（變速感）
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, Math.round(startY + dist * e));
        if (t < 1) requestAnimationFrame(step);
        else animating = false;
      };
      requestAnimationFrame(step);
    };

    // 找下一個吸附點；距離超過門檻（通常是問卷區）就回傳 undefined（自由滾動）
    const findTarget = (dir: number): number | undefined => {
      const tops = getTargets();
      const cur = window.scrollY;
      const threshold = window.innerHeight * 1.6;
      if (dir > 0) {
        for (const y of tops) {
          if (y > cur + 4) return y - cur <= threshold ? y : undefined;
        }
        return undefined;
      }
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] < cur - 4) return cur - tops[i] <= threshold ? tops[i] : undefined;
      }
      return undefined;
    };

    const onWheel = (e: WheelEvent) => {
      if (document.fullscreenElement || animating) {
        if (animating) e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;
      const target = findTarget(e.deltaY > 0 ? 1 : -1);
      if (target === undefined) return; // 問卷區等：不吸附，交給原生滾動
      e.preventDefault();
      tweenTo(target);
    };

    // 觸控：輕掃結束後吸附到最近分頁
    let touchStartY = 0;
    let touchMoved = false;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY) > 12) touchMoved = true;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (document.fullscreenElement || animating) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (!touchMoved || Math.abs(dy) < 30) return;
      const target = findTarget(dy > 0 ? 1 : -1);
      if (target !== undefined) tweenTo(target);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // 可靠的跳轉函數：臨時關閉滾動吸附，滾動後恢復
  // behavior 預設 'auto'（瞬時，用於問卷遞進）；'smooth' 用於同意書 → 前測的平滑滾動
  const scrollToSection = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    const element = document.querySelector(`[data-section="${index}"]`);
    if (!element) return;

    // 臨時關閉滾動吸附，避免干擾程序化滾動
    const html = document.documentElement;
    const originalSnapType = html.style.scrollSnapType;
    html.style.scrollSnapType = 'none';

    // 計算目標位置
    const targetTop = element.getBoundingClientRect().top + window.pageYOffset;

    // smooth 平滑滾動；auto 瞬時跳轉
    window.scrollTo({ top: targetTop, behavior });

    // 平滑滾動需要較長時間，等滾動結束再恢復吸附，避免被打斷
    const restoreDelay = behavior === 'smooth' ? 1100 : 100;
    setTimeout(() => {
      html.style.scrollSnapType = originalSnapType || '';
    }, restoreDelay);
  }, []);

  const handleConsentAccepted = () => {
    setConsentAccepted(true);
    setTimeout(() => scrollToSection(2, 'smooth'), 200);
  };

  const handleSignatureComplete = () => {
    setTimeout(() => scrollToSection(3), 200);
  };

  const handlePreTest1Complete = () => {
    setTimeout(() => scrollToSection(4), 200);
  };

  const handlePreTest2Complete = () => {
    setTimeout(() => scrollToSection(5), 200);
  };

  const handleVideoProgress = useCallback((progress: number) => {
    setVideoProgress(progress);
  }, []);

  const handleAllVideosComplete = useCallback(() => {
    setTimeout(() => scrollToSection(6), 200);
  }, []);

  const handleFeedbackComplete = () => {
    setTimeout(() => scrollToSection(7), 200);
  };

  const handlePostTest1Complete = () => {
    setTimeout(() => scrollToSection(8), 200);
  };

  const handlePostTest2Complete = () => {
    setTimeout(() => scrollToSection(9), 200);
  };

  return (
    <main className="bg-[#3d3d3d]">
      {/* 0: 首頁 Hero */}
      <section data-section="0" className="h-screen w-full overflow-hidden">
        <Hero />
      </section>

      {/* 1: 知情同意書 Informed Consent */}
      <div className="snap-point"></div>
      <section data-section="1" className="w-full no-snap">
        <InformedConsent onAccepted={handleConsentAccepted} />
      </section>

      {/* 2: 同意書簽署 Consent Signature */}
      <div className="snap-point"></div>
      <section data-section="2" className="w-full no-snap">
        <ConsentSignature onComplete={handleSignatureComplete} />
      </section>

      {/* 3: 前測一 Pre-Test 1 */}
      <div className="snap-point"></div>
      <section data-section="3" className="w-full no-snap">
        <PreTest1 onComplete={handlePreTest1Complete} />
      </section>

      {/* 4: 前測二 Pre-Test 2 */}
      <div className="snap-point"></div>
      <section data-section="4" className="w-full no-snap">
        <PreTest2 onComplete={handlePreTest2Complete} />
      </section>

      {/* 5: 影片區 Video Viewer（外層不吸附，內部各視頻/過渡頁獨立吸附） */}
      <section data-section="5" className="w-full no-snap">
        <VideoViewer
          onProgress={handleVideoProgress}
          progress={videoProgress}
          onAllComplete={handleAllVideosComplete}
        />
      </section>

      {/* 6: 觀後回饋 Viewing Feedback */}
      <div className="snap-point"></div>
      <section data-section="6" className="w-full no-snap">
        <PostViewFeedback onComplete={handleFeedbackComplete} />
      </section>

      {/* 7: 分隔頁 — 回饋完成 → 後測 */}
      <div className="snap-point"></div>
      <section data-section="7" className="h-screen w-full relative overflow-hidden no-snap flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #4a4a4a 0%, #3d3d3d 100%)' }}>
        <div className="ambient-glow" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(198,168,248,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 px-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, rgba(198,168,248,0.15), rgba(198,168,248,0.05))', border: '1px solid rgba(198,168,248,0.3)' }}>
            <svg className="w-7 h-7 text-[#d4bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-serif text-[#EAECEF] text-3xl md:text-4xl font-bold mb-3">感謝你的回饋</h2>
          <p className="text-[#C6A8F8] text-lg mb-2">Thank you for your feedback</p>
          <p className="text-[#9a9a9a] text-sm mt-6">接下來請完成後測問卷</p>
          <p className="text-[#8a8a8a] text-xs mt-1">Next, please complete the post-test questionnaire</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mt-8"
          >
            <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* 8: 後測一 Post-Test 1 */}
      <div className="snap-point"></div>
      <section data-section="8" className="w-full no-snap">
        <PostTest1 onComplete={handlePostTest1Complete} />
      </section>

      {/* 9: 後測二 Post-Test 2 */}
      <div className="snap-point"></div>
      <section data-section="9" className="w-full no-snap">
        <PostTest2 onComplete={handlePostTest2Complete} />
      </section>

      {/* 10: 感謝頁 Thank You */}
      <section data-section="10" className="h-screen w-full overflow-hidden">
        <ThankYou participantName="" />
      </section>
    </main>
  );
}
