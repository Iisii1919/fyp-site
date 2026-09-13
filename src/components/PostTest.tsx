'use client';

import PostTest1 from './PostTest1';
import PostTest2 from './PostTest2';
import StepFooter from './StepFooter';

interface PostTestProps {
  /** 第二份（最後一份）問卷送出後自動完成研究。 */
  onNext: () => void;
}

// 將兩份後測問卷疊在同一頁（PostTest1 → 分隔線 → PostTest2）。
// 第二份送出後會自動跳到完成頁，所以這裡不再放前進箭頭（StepFooter 只留裝飾星點）。
export default function PostTest({ onNext }: PostTestProps) {
  return (
    <div className="w-full relative pb-36">
      <PostTest1 />

      {/* 兩份問卷之間的小分隔（金色裝飾） */}
      <div className="w-full py-12 flex items-center justify-center" aria-hidden>
        <div className="flex items-center gap-4 max-w-xs w-full px-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4bfff]/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#d4bfff]/60" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4bfff]/40" />
        </div>
      </div>

      {/* 第二份是最後一份問卷 → 送出後自動完成研究 */}
      <PostTest2 onComplete={onNext} />

      <StepFooter />
    </div>
  );
}
