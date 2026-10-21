'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PreTest1 from './PreTest1';
import PreTest2 from './PreTest2';
import PreTestErq from './PreTestErq';
import StepFooter from './StepFooter';
import QuestionnaireProgress from './QuestionnaireProgress';
import { useAutoAdvance } from '@/lib/useAutoAdvance';

// 進度小工具顯示的標籤。用**量表名稱**而不是「前測問卷（一）」這種編號：
// 編號對參與者沒有意義，看不出自己在填什麼。
// ⚠️ 順序要跟下面 render 的順序一致：MLQ → CD-RISC-10 → ERQ。
const LABELS = ['MLQ', 'CD-RISC-10', 'ERQ'];

interface PreTestProps {
  /** 三份前測問卷「都」送出後，自動前往下一步。 */
  onNext: () => void;
}

// 將三份前測問卷疊在同一頁（PreTest1 → 分隔線 → PreTest2 → 分隔線 → ERQ）。
//
// ⚠️ 一定要「三份都提交」才前進。
// 之前的作法是只監聽最後一份的送出就跳頁，結果參與者跳過前面幾份也會被帶走，
// 那些資料就缺了，而且他們自己不會發現。
// 所以改成這裡統一追蹤每一份的狀態，全部完成才觸發自動跳轉。
//
// ⚠️ 新增第四份時，除了 LABELS 與 refs，也要同步更新這裡的 setDone 初始陣列長度
// 以及 done.every(Boolean) 的判斷（它會自動跟著陣列長度走，不用改條件本身）。
export default function PreTest({ onNext }: PreTestProps) {
  const [done, setDone] = useState([false, false, false]);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const thirdRef = useRef<HTMLDivElement>(null);
  const trigger = useAutoAdvance(onNext);

  const markDone = useCallback((index: number) => {
    setDone((prev) => (prev[index] ? prev : prev.map((d, i) => (i === index ? true : d))));
  }, []);

  // 三份都提交才排程跳轉（useAutoAdvance 內部保證只跳一次）
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
        <PreTest1 submitted={done[0]} onSubmitted={() => markDone(0)} />
      </div>

      <Separator />

      <div ref={secondRef}>
        <PreTest2 submitted={done[1]} onSubmitted={() => markDone(1)} />
      </div>

      <Separator />

      <div ref={thirdRef}>
        <PreTestErq submitted={done[2]} onSubmitted={() => markDone(2)} />
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
