'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import DevStepJumper from '@/components/DevStepJumper';
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

/**
 * step 8（「感謝你的回饋」分隔頁）停留多久後自動前往後測問卷。
 *
 * 3.5 秒：進場動畫 0.8 秒，剩下約 2.7 秒讀中英兩句。太短會來不及讀，
 * 太長則失去「自動」的意義（使用者在意的是參與者以為結束了就離開）。
 */
const SEPARATOR_AUTO_ADVANCE_MS = 3500;

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
  // 影片步驟是否已看完四段。
  // 🔴 放在 page 而不是 VideoViewer 內部：按「返回」回到影片頁時 VideoViewer 會重新掛載，
  //    內部的 completedVideos 會歸零 → 前進鈕會消失，參與者就卡死了。
  //    存在這裡（page 不重新掛載）才能做到「看完、返回、仍有下一頁」。
  const [videosDone, setVideosDone] = useState(false);

  // ---- 瀏覽器返回鍵整合（2026-10-22）----
  // 背景：本站是單頁 wizard（URL 永遠是 /）。以往按「返回」會直接離開網站；
  // 而且表單 iframe 換 src 會在聯合 session history 留下 entry，返回會先把
  // iframe 導回舊網址（prefill 消失、表單被誤判送出）。現在每進入一步就 push
  // 一條 history entry，popstate 時對回對應步驟 —— 返回 = 上一步，不再離站。
  /** bfcache 恢復計數：當 key 用，強制重掛目前步驟（iframe／影片可能已被凍結壞掉） */
  const [navEpoch, setNavEpoch] = useState(0);
  /** 本次 step 改變來自 popstate 時為 true —— 不再重複 pushState */
  const popNavRef = useRef(false);
  /** 最近一次已寫進 history 的步驟：避免 progressLoaded／resumeAt 翻轉造成重複 push */
  const lastPushedRef = useRef(0);
  /** 這個 session 到過的最遠步驟：擋住「重新開始後按返回回到上一場的步驟」 */
  const maxStepRef = useRef(0);
  /** popstate handler 只註冊一次，但要讀到最新的 step */
  const stepRef = useRef(0);

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

  // 掛載時：把目前這條 history entry 標上 fypStep:0，並接管 popstate / bfcache 恢復。
  useEffect(() => {
    try {
      window.history.replaceState({ ...(window.history.state ?? {}), fypStep: 0 }, '');
      // 步驟切換時我們自己捲回頂部（下方另一個 effect），不要瀏覽器的捲動還原插手
      window.history.scrollRestoration = 'manual';
    } catch {
      // 極少數環境禁止觸碰 history —— 降級為無返回整合，不影響主流程
    }

    const onPopState = (e: PopStateEvent) => {
      const raw = (e.state as { fypStep?: unknown } | null)?.fypStep;
      const target =
        typeof raw === 'number' && Number.isInteger(raw)
          ? Math.max(0, Math.min(TOTAL_STEPS - 1, raw))
          : 0;
      // 「重新開始」後歷史裡仍留著上一場的 entry；回到比本次最遠步驟更後面的位置
      // 會跳過同意書等必要步驟 → 擋下，重新壓回目前步驟。
      if (target > maxStepRef.current) {
        try {
          window.history.pushState({ ...(window.history.state ?? {}), fypStep: stepRef.current }, '');
        } catch {
          // ignore
        }
        return;
      }
      popNavRef.current = true;
      // 接續提示若還開著，返回鍵視同「直接去那一步」（關掉提示）
      setResumeAt(null);
      setStep(target);
    };

    const onPageShow = (e: PageTransitionEvent) => {
      // 從 bfcache 恢復：React state 原樣回來，但 Google 表單 iframe／影片很可能
      // 已被凍結壞掉（手機 Chrome／Safari 的已知行為）→ 重掛目前步驟救回來。
      if (e.persisted) setNavEpoch((n) => n + 1);
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  // 記錄目前步驟。等使用者回答完接續提示才開始寫，否則會蓋掉要接續的值。
  useEffect(() => {
    if (!progressLoaded || resumeAt !== null) return;
    // 最後一步（完成頁）不需要接續，存 0 等於清除
    saveProgress(step >= TOTAL_STEPS - 1 ? 0 : step);
  }, [step, resumeAt, progressLoaded]);

  // 每進入新的一步就 push 一條 history entry（popstate 造成的改變不重複 push）。
  useEffect(() => {
    stepRef.current = step;
    if (step > maxStepRef.current) maxStepRef.current = step;
    if (!progressLoaded || resumeAt !== null) return;
    if (popNavRef.current) {
      popNavRef.current = false;
      lastPushedRef.current = step;
      return;
    }
    if (lastPushedRef.current === step) return;
    lastPushedRef.current = step;
    try {
      window.history.pushState({ ...(window.history.state ?? {}), fypStep: step }, '');
    } catch {
      // ignore（見上方 mount effect）
    }
  }, [step, progressLoaded, resumeAt]);

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

  /**
   * 分隔頁（step 8「感謝你的回饋」）自動前往後測問卷。
   *
   * 🔴 為什麼要自動跳（2026-10-22 使用者提出）：這一頁只有一句感謝＋一個 chevron，
   *    參與者很容易以為「研究到這裡結束了」就直接關掉分頁，
   *    於是**後測問卷整段收不到資料**。改成自動跳，他們就算不按也會被帶到下一步。
   *
   * ⚠️ chevron 仍然保留（見下面那頁的 StepFooter）—— 自動跳是「一定會發生」，
   *    但萬一計時器被瀏覽器凍結（切到別的 app、鎖屏、省電模式），參與者還有手動的路。
   * ⚠️ step 一改變（自動跳或手動按）就會 cleanup 清掉計時器，不會重複跳。
   */
  useEffect(() => {
    if (step !== 8) return;
    const t = window.setTimeout(() => goNext(), SEPARATOR_AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [step, goNext]);

  /**
   * 是否啟用自訂垂直吸附。
   *
   * 🔴 2026-10-22 使用者兩次回報後定案：**手機不啟用**。
   *    原因：影片段落是 `min-h-screen`，但文字長的時候整段會**比螢幕高**，
   *    影片與它的控制條（含全屏鈕）被推到畫面外；而吸附在滑動結束時會直接跳到
   *    **下一個吸附點**（＝下一段影片的開頭），導致參與者**根本捲不到這一段的影片**。
   *    桌面（≥lg）是左右分欄、一屏放得下，吸附才是有意義的，所以只在那裡啟用。
   *
   * ⚠️ 用 matchMedia + change 監聽，而不是掛載時只看一次 —— 旋轉手機、
   *    或把視窗拉大／縮小才會跟著切換。
   */
  const [snapEnabled, setSnapEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setSnapEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // 自訂垂直吸附：只影響目前顯示的步驟內容。wizard 模式下主要用在影片步驟內
  // 片段之間的吸附；問卷步驟無吸附點 → 自由滾動。
  useEffect(() => {
    // 手機／平板直立：不啟用（原因見上面 snapEnabled 的說明）
    if (!snapEnabled) return;
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

    // bfcache 恢復時若吸附動畫旗標卡在 true（頁面被凍結時動畫正在跑），
    // 整頁滾動會被下面的 preventDefault 永久鎖死 —— 恢復時重置旗標。
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) animating = false;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [snapEnabled]);

  const handleVideoProgress = useCallback((progress: number) => {
    setVideoProgress(progress);
  }, []);

  const handleAllVideosComplete = useCallback(() => {
    // 先記錄「已看完」再前進：這樣按返回回到影片頁時，前進鈕還在（見 videosDone 的註解）
    setVideosDone(true);
    goNext();
  }, [goNext]);

  return (
    <ParticipantProvider>
      <main className="bg-[#3d3d3d] min-h-screen">
        <DevGroupSwitcher />
        {/* 開發用跳頁（僅 localhost 顯示）—— 測單一頁面時不必先填完前測 */}
        <DevStepJumper step={step} labels={STEP_LABELS} onJump={setStep} />

        {resumeAt !== null && (
          <ResumePrompt
            label={STEP_LABELS[resumeAt] ?? '上一頁'}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        )}

        {/* key = navEpoch：bfcache 恢復時整棵步驟子樹重掛（表單 iframe／影片凍結後復原）。
            display:contents 讓這層 wrapper 不產生任何版面影響。 */}
        <div key={navEpoch} className="contents">

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
            {/* 🔴 沒看完四段就不給前進（2026-10-30 使用者要求）。
                以前 chevron 一律顯示 → 參與者可以不看影片直接跳過，
                結果收到「沒看過介入、卻填完問卷」的資料。
                看完會自動跳到回饋頁；按返回回到這頁時 videosDone 仍是 true，
                所以 chevron 還在（不會卡死）。
                ⚠️ 真的載不出來的影片，播放器錯誤卡片上有「仍然繼續」可以逐段跳過，
                   不會把參與者困在這裡。 */}
            {videosDone ? (
              <StepFooter onNext={goNext} canNext />
            ) : (
              <div className="absolute bottom-8 left-0 right-0 z-40 text-center px-6 pointer-events-none">
                <p className="text-[#b9b9b9] text-xs">看完四段影片後即可繼續</p>
                <p className="text-[#9a9a9a] text-xs mt-1">Watch all four clips to continue</p>
              </div>
            )}
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

              {/* 自動前往後測的視覺提示：一條會填滿的細線＋文字。
                  目的是讓參與者知道「還有下一步、正在自動前往」，
                  而不是以為研究在此結束就關掉分頁（使用者提出的擔憂）。 */}
              <div
                className="mt-8 w-40 h-0.5 mx-auto rounded-full overflow-hidden"
                style={{ background: 'rgba(198,168,248,0.2)' }}
                aria-hidden
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: SEPARATOR_AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                  className="h-full bg-[#d4bfff]"
                />
              </div>
              <p className="text-[#8a8a8a] text-[11px] mt-3 leading-snug">
                Continuing to the post-test automatically…
                <span className="block">正在自動前往後測問卷…</span>
              </p>
            </motion.div>
            {/* 這一頁會在 SEPARATOR_AUTO_ADVANCE_MS 後自動前往後測；
                chevron 留著作為備援 —— 計時器被瀏覽器凍結時仍可手動前進。 */}
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
        </div>
      </main>
    </ParticipantProvider>
  );
}
