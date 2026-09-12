'use client';

import PreTest1 from './PreTest1';
import PreTest2 from './PreTest2';
import StepFooter from './StepFooter';

interface PreTestProps {
  onBack: () => void;
  onNext: () => void;
}

// 將兩份前測問卷疊在同一頁（PreTest1 → 分隔線 → PreTest2），
// 並在頁面最底下加 StepFooter（Back / Next chevron）。
// 注意：個別子組件仍各自撐高 min-h-screen，外層用 relative 讓 StepFooter 絕對定位。
export default function PreTest({ onBack, onNext }: PreTestProps) {
  return (
    <div className="w-full relative pb-36">
      <PreTest1 />

      {/* 兩份問卷之間的小分隔（金色裝飾） */}
      <div className="w-full py-12 flex items-center justify-center" aria-hidden>
        <div className="flex items-center gap-4 max-w-xs w-full px-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4bfff]/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#d4bfff]/60" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4bfff]/40" />
        </div>
      </div>

      <PreTest2 />

      <StepFooter onBack={onBack} onNext={onNext} canBack canNext />
    </div>
  );
}
