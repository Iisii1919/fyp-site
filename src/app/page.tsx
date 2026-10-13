'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import EligibilityScreening from '@/components/EligibilityScreening';
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
import ResumePrompt from '@/components/ResumePrompt';
import { ParticipantProvider, clearParticipant } from '@/lib/participant';
import { readProgress, saveProgress } from '@/lib/progress';
import { useResearcherEscape } from '@/lib/useResearcherEscape';

// 步驟重編：原 10 步 → 11 步（2026-10-13 在最前面插入招募資格篩選）
//  0 Hero
//  1 EligibilityScreening （⚠️ 2026-10-13 新增：招募資格篩選，排在同意書之前）
//  2 InformedConsent      （研究資訊表）
//  3 ConsentSignature     （同意書）
//  4 PreTest              （前測 1 + 前測 2 + ERQ）
//  5 GroupGate
//  6 VideoViewer
//  7 PostViewFeedback
//  8 分隔頁「感謝你的回饋」
//  9 PostTest             （後測 1 + 後測 2 + ERQ）
//  10 ThankYou
const TOTAL_STEPS = 11;

// 給「接續上次進度」提示用的步驟名稱，順序要跟上面的步驟表一致。
// ⚠️ 長度必須等於 TOTAL_STEPS，且**每一項要對到正確的步驟編號**，
//    否則接續提示會指著錯誤的頁面名稱。驗證：verify-screening-step.mjs。
const STEP_LABELS = [
  '開始頁',
  '資格確認',
  '研究資料',
  '同意書',
  '前測問卷',
  '準備觀影',
  '影片',
  '觀影回饋',
  '分隔頁',
  '後測問卷',
  '完成',
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  // 上次未完成的步驟；非 null 時顯示接續提示。null 有兩種意思：
  // 「沒有可接續的進度」與「已經回答過了」，兩者行為相同（正常顯示目前步驟）。
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  // 是否已經讀過儲存的進度。在讀完之前不能寫入，否則 mount 時的
  // saveProgress(0) 會把要接續的進度清掉。
  const [progressLoaded, setProgressLoaded] = useState(false);

  const goNext = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), []);

  // 研究員專用逃生鍵（Shift + Alt + N）：所有自動跳轉都失效時，當場把場次救回來。
  // 詳見 src/lib/useResearcherEscape.ts 的說明 —— 刻意不給參與者任何提示。
  useResearcherEscape(goNext);

  // 讀取上次的進度。放在 effect 而不是 useState 初始值，是因為初始值會在
  // 伺服器端也算一次（那裡沒有 localStorage），會造成 hydration 不一致。
  useEffect(() => {
    const saved = readProgress();
    // 完成頁（最後一步）不需要接續，超出範圍的值一律忽略
    if (saved !== null && saved > 0 && saved < TOTAL_STEPS - 1) setResumeAt(saved);
    setProgressLoaded(true);
  }, []);

  // 記錄目前步驟。等使用者回答完接續提示才開始寫，否則會蓋掉要接續的值。
  useEffect(() => {
    if (!progressLoaded || resumeAt !== null) return;
    // 最後一步（完成頁）不需要接續，存 0 等於清除
    saveProgress(step >= TOTAL_STEPS - 1 ? 0 : step);
  }, [step, resumeAt, progressLoaded]);

  const handleResume = useCallback(() => {
    if (resumeAt !== null) setStep(resumeAt);
    setResumeAt(null);
  }, [resumeAt]);

  // 「重新開始」= 整個 session 重來：清掉身分與進度後重新載入，
  // 讓 assignParticipant() 產生新的參與者編號。
  // 刻意用重新載入而不是只改 state —— 參與者身分是 ParticipantProvider 的 state，
  // 而這裡（Home）在 provider 外面，拿不到它的 setter；
  // 重新載入是唯一保證「新 ID + 乾淨畫面」且不會漏掉任何狀態的做法。
  // 此時參與者還沒做任何事（畫面停在提示上），所以不會損失資料。
  const handleRestart = useCallback(() => {
    clearParticipant();
    window.location.reload();
  }, []);

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

        {resumeAt !== null && (
          <ResumePrompt
            label={STEP_LABELS[resumeAt] ?? '上一頁'}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        )}

        {step === 0 && (
          <section className="relative w-full no-snap">
            <Hero />
            <StepFooter onNext={goNext} canNext />
          </section>
        )}

        {step === 1 && (
          <section className="relative w-full no-snap">
            <EligibilityScreening onContinue={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 2 && (
          <section className="relative w-full no-snap">
            <InformedConsent onAccepted={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 3 && (
          <section className="relative w-full no-snap">
            <ConsentSignature onNext={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 4 && (
          <section className="relative w-full no-snap">
            <PreTest onNext={goNext} />
          </section>
        )}

        {step === 5 && (
          <section className="relative w-full no-snap">
            <GroupGate onContinue={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 6 && (
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

        {step === 7 && (
          <section className="relative w-full no-snap">
            <PostViewFeedback onComplete={goNext} />
            <StepFooter />
          </section>
        )}

        {step === 8 && (
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

        {step === 9 && (
          <section className="relative w-full no-snap">
            <PostTest onNext={goNext} />
          </section>
        )}

        {step === 10 && (
          <section className="relative w-full no-snap">
            <ThankYou participantName="" />
            <StepFooter />
          </section>
        )}
      </main>
    </ParticipantProvider>
  );
}
