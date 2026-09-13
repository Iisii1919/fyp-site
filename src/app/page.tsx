'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import InformedConsent from '@/components/InformedConsent';
import ConsentSignature from '@/components/ConsentSignature';
import PreTest from '@/components/PreTest';
import VideoViewer from '@/components/VideoViewer';
import PostTest from '@/components/PostTest';
import PostViewFeedback from '@/components/PostViewFeedback';
import ThankYou from '@/components/ThankYou';
import GroupGate from '@/components/GroupGate';
import StepFooter from '@/components/StepFooter';
import DevGroupSwitcher from '@/components/DevGroupSwitcher';
import { ParticipantProvider } from '@/lib/participant';

// 步驟重編（合併兩份前測 + 兩份後測 → 各一頁）：12 → 10
//  0 Hero
//  1 InformedConsent
//  2 ConsentSignature
//  3 PreTest       （前測 1 + 前測 2）
//  4 GroupGate
//  5 VideoViewer
//  6 PostViewFeedback
//  7 分隔頁「感謝你的回饋」
//  8 PostTest      （後測 1 + 後測 2）
//  9 ThankYou
const TOTAL_STEPS = 10;

export default function Home() {
  const [step, setStep] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), []);

  // 每次跳轉到新一步，先把視窗捲回最上方，讓該步從頂部開始顯示
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step]);

  // 自訂垂直吸附：只影響目前顯示的步驟內容。wizard 模式下主要用在影片步驟內
  // 片段之間的吸附；問卷步驟無吸附點 → 自由滾動。
  useEffect(() => {
    const SNAP_DURATION = 800;
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
      const stepFn = (now: number) => {
        const t = Math.min(1, (now - start) / SNAP_DURATION);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, Math.round(startY + dist * e));
        if (t < 1) requestAnimationFrame(stepFn);
        else animating = false;
      };
      requestAnimationFrame(stepFn);
    };

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
      if (target === undefined) return;
      e.preventDefault();
      tweenTo(target);
    };

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

  const handleVideoProgress = useCallback((progress: number) => {
    setVideoProgress(progress);
  }, []);

  const handleAllVideosComplete = useCallback(() => {
    goNext();
  }, [goNext]);

  return (
    <ParticipantProvider>
      <main className="bg-[#3d3d3d] min-h-screen">
        <DevGroupSwitcher />

        {step === 0 && (
          <section className="relative w-full no-snap">
            <Hero />
            <StepFooter onNext={goNext} canNext />
          </section>
        )}

        {step === 1 && (
          <section className="relative w-full no-snap">
            <InformedConsent onAccepted={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 2 && (
          <section className="relative w-full no-snap">
            <ConsentSignature onNext={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 3 && (
          <section className="relative w-full no-snap">
            <PreTest onNext={goNext} />
          </section>
        )}

        {step === 4 && (
          <section className="relative w-full no-snap">
            <GroupGate onContinue={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 5 && (
          <section className="relative w-full no-snap">
            <VideoViewer
              onProgress={handleVideoProgress}
              progress={videoProgress}
              onAllComplete={handleAllVideosComplete}
            />
            {/* 影片頁看完所有片段會自動跳，但萬一有片段載不出來就卡住 → 保留 chevron 當備援 */}
            <StepFooter onNext={goNext} canNext />
          </section>
        )}

        {step === 6 && (
          <section className="relative w-full no-snap">
            <PostViewFeedback onComplete={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 7 && (
          <section
            className="relative h-screen w-full overflow-hidden no-snap flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, #4a4a4a 0%, #3d3d3d 100%)' }}
          >
            <div
              className="ambient-glow"
              style={{
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(198,168,248,0.08) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center relative z-10 px-6"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(198,168,248,0.15), rgba(198,168,248,0.05))',
                  border: '1px solid rgba(198,168,248,0.3)',
                }}
              >
                <svg className="w-7 h-7 text-[#d4bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-[#EAECEF] text-3xl md:text-4xl font-bold mb-3">感謝你的回饋</h2>
              <p className="text-[#C6A8F8] text-lg mb-2">Thank you for your feedback</p>
              <p className="text-[#9a9a9a] text-sm mt-6">接下來請完成後測問卷</p>
              <p className="text-[#8a8a8a] text-xs mt-1">Next, please complete the post-test questionnaire</p>
            </motion.div>
            {/* 純文字分隔頁，沒有任何按鈕 → 需要 chevron */}
            <StepFooter onNext={goNext} canNext />
          </section>
        )}

        {step === 8 && (
          <section className="relative w-full no-snap">
            <PostTest onNext={goNext} />
          </section>
        )}

        {step === 9 && (
          <section className="relative w-full no-snap">
            <ThankYou participantName="" />
            <StepFooter />
          </section>
        )}
      </main>
    </ParticipantProvider>
  );
}
