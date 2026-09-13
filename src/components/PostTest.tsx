'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PostTest1 from './PostTest1';
import PostTest2 from './PostTest2';
import StepFooter from './StepFooter';
import QuestionnaireProgress from './QuestionnaireProgress';
import { useAutoAdvance } from '@/lib/useAutoAdvance';

const LABELS = ['後測問卷（一）', '後測問卷（二）'];

interface PostTestProps {
  /** 兩份後測問卷「都」送出後，自動前往完成頁。 */
  onNext: () => void;
}

// 將兩份後測問卷疊在同一頁（PostTest1 → 分隔線 → PostTest2）。
//
// ⚠️ 一定要「兩份都提交」才前進，理由同 PreTest：
// 只監聽第二份的話，參與者跳過第一份也會被帶走，那份資料就缺了。
export default function PostTest({ onNext }: PostTestProps) {
  const [done, setDone] = useState([false, false]);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const trigger = useAutoAdvance(onNext);

  const markDone = useCallback((index: number) => {
    setDone((prev) => (prev[index] ? prev : prev.map((d, i) => (i === index ? true : d))));
  }, []);

  useEffect(() => {
    if (done.every(Boolean)) trigger();
  }, [done, trigger]);

  const jumpTo = useCallback((index: number) => {
    const el = index === 0 ? firstRef.current : secondRef.current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="w-full relative pb-36">
      <div ref={firstRef}>
        <PostTest1 submitted={done[0]} onSubmitted={() => markDone(0)} />
      </div>

      {/* 兩份問卷之間的小分隔（金色裝飾） */}
      <div className="w-full py-12 flex items-center justify-center" aria-hidden>
        <div className="flex items-center gap-4 max-w-xs w-full px-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4bfff]/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#d4bfff]/60" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4bfff]/40" />
        </div>
      </div>

      <div ref={secondRef}>
        <PostTest2 submitted={done[1]} onSubmitted={() => markDone(1)} />
      </div>

      {/* 進度提示：讓參與者看得出還剩哪一份沒做 */}
      <div className="w-full px-4 py-10">
        <QuestionnaireProgress labels={LABELS} done={done} onJumpTo={jumpTo} />
      </div>

      <StepFooter />
    </div>
  );
}
