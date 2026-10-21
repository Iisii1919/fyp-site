'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PostTest1 from './PostTest1';
import PostTest2 from './PostTest2';
import PostTestErq from './PostTestErq';
import StepFooter from './StepFooter';
import QuestionnaireProgress from './QuestionnaireProgress';
import { useAutoAdvance } from '@/lib/useAutoAdvance';

// 進度小工具顯示的標籤。用**量表全名**而不是編號。
// ⚠️ 順序要跟下面 render 的順序一致：MLQ → CD-RISC-10 → ERQ。
const LABELS = ['生命意義感量表', '簡易心理彈性量表', '情緒調節問卷'];

interface PostTestProps {
  /** 三份後測問卷「都」送出後，自動前往完成頁。 */
  onNext: () => void;
}

// 將三份後測問卷疊在同一頁（PostTest1 → 分隔線 → PostTest2 → 分隔線 → ERQ）。
//
// ⚠️ 一定要「三份都提交」才前進，理由同 PreTest：
// 只監聽最後一份的話，參與者跳過前面幾份也會被帶走，那些資料就缺了。
export default function PostTest({ onNext }: PostTestProps) {
  const [done, setDone] = useState([false, false, false]);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const thirdRef = useRef<HTMLDivElement>(null);
  const trigger = useAutoAdvance(onNext);

  const markDone = useCallback((index: number) => {
    setDone((prev) => (prev[index] ? prev : prev.map((d, i) => (i === index ? true : d))));
  }, []);

  useEffect(() => {
    if (done.every(Boolean)) trigger();
  }, [done, trigger]);

  const jumpTo = useCallback((index: number) => {
    const el = [firstRef, secondRef, thirdRef][index]?.current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="w-full relative pb-36">
      <div ref={firstRef}>
        <PostTest1 submitted={done[0]} onSubmitted={() => markDone(0)} />
      </div>

      <Separator />

      <div ref={secondRef}>
        <PostTest2 submitted={done[1]} onSubmitted={() => markDone(1)} />
      </div>

      <Separator />

      <div ref={thirdRef}>
        <PostTestErq submitted={done[2]} onSubmitted={() => markDone(2)} />
      </div>

      {/* 進度提示：讓參與者看得出還剩哪幾份沒做 */}
      <div className="w-full px-4 py-10">
        <QuestionnaireProgress labels={LABELS} done={done} onJumpTo={jumpTo} />
      </div>

      <StepFooter />
    </div>
  );
}

/** 相鄰兩份問卷之間的小分隔（金色裝飾）。 */
function Separator() {
  return (
    <div className="w-full py-12 flex items-center justify-center" aria-hidden>
      <div className="flex items-center gap-4 max-w-xs w-full px-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4bfff]/40" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#d4bfff]/60" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4bfff]/40" />
      </div>
    </div>
  );
}
