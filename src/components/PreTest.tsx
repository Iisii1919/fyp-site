'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PreTest1 from './PreTest1';
import PreTest2 from './PreTest2';
import PreTestErq from './PreTestErq';
import StepFooter from './StepFooter';
import QuestionnaireProgress from './QuestionnaireProgress';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import { useParticipant } from '@/lib/participant';
import { isSubmitted } from '@/lib/submissions';

// 三份前測在 submissions 標記裡的代號，順序與下面 render 的順序一致。
const FORM_KEYS = ['preTest1', 'preTest2', 'preTestErq'] as const;

// 進度小工具顯示的標籤。用**量表全名**而不是編號。
// ⚠️ 順序要跟下面 render 的順序一致：MLQ → CD-RISC-10 → ERQ。
// ⚠️ 這裡刻意用**中文全名**（比縮寫長很多），因為進度卡是參與者最常回頭看的地方。
//    窄螢幕會折行；若之後覺得太擠，可以只把這裡換回縮寫，不影響頁面標題。
const LABELS = ['生命意義感量表', '簡易心理彈性量表', '情緒調節問卷'];
// 進度卡是中英對照的，所以英文名稱也要一起傳進去（英文顯示在上面）。
const LABELS_EN = [
  'Meaning in Life Questionnaire',
  '10-Item Connor-Davidson Resilience Scale',
  'Emotion Regulation Questionnaire',
];

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
  const participant = useParticipant();

  // 「三份都是從上次標記恢復的」= true。恢復回來的人多半是**按返回**回來的，
  // 這時絕不能再自動往前跳，所以用它擋住下面的自動跳轉，改亮頁尾 Next 鈕。
  const [restoredAll, setRestoredAll] = useState(false);

  // participant 一到就查三份前測的已送出標記：送過的直接標完成（葉子表單
  // 會跟著收合，不用再送一次）。只送過一部分也可以 —— 剩下沒送的這次照樣填，
  // 補齊時 restoredAll 是 false，自動跳轉正常生效。
  useEffect(() => {
    if (!participant) return;
    const restored = FORM_KEYS.map((k) => isSubmitted(participant.id, k));
    if (restored.every(Boolean)) setRestoredAll(true);
    setDone((prev) => prev.map((d, i) => d || restored[i]));
  }, [participant]);

  const markDone = useCallback((index: number) => {
    // 這次掛載有「真的送出」發生 → 不再是純恢復狀態
    setRestoredAll(false);
    setDone((prev) => (prev[index] ? prev : prev.map((d, i) => (i === index ? true : d))));
    // 送出後把**下一份的開頭**帶到畫面上方。
    // ⚠️ 一定要等收合動畫跑完（GoogleFormEmbed 的高度轉場是 600ms）再捲。
    //    在動畫期間捲，頁面高度還在縮小，scrollIntoView 算出的目標位置會立刻過時，
    //    結果就是「捲過頭、直接停在下一份的中間」—— 也就是使用者回報的現象。
    const next = [firstRef, secondRef, thirdRef][index + 1];
    if (next?.current) {
      window.setTimeout(() => {
        next.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 750);
    }
  }, []);

  /**
   * 撤銷「已完成」。
   * 由 GoogleFormEmbed 在參與者按「展開繼續作答」時呼叫 ——
   * 代表剛才那次「已送出」的判定是錯的（例如草稿對話框造成的重新導覽），
   * 必須把進度改回未提交，否則問卷會永久標成做完、甚至觸發自動跳頁。
   */
  const unmarkDone = useCallback((index: number) => {
    // 有人把某份展開重填 → 已經不是「三份都恢復」的狀態了
    setRestoredAll(false);
    setDone((prev) => (prev[index] ? prev.map((d, i) => (i === index ? false : d)) : prev));
  }, []);

  // 三份都提交才排程跳轉（useAutoAdvance 內部保證只跳一次）。
  // ⚠️ 恢復回來（restoredAll）時不跳：按返回回來的人不該被直接推去下一步，
  //    改用頁尾的 Next 鈕讓他自己按。
  useEffect(() => {
    if (done.every(Boolean) && !restoredAll) trigger();
  }, [done, trigger, restoredAll]);

  const jumpTo = useCallback((index: number) => {
    const el = [firstRef, secondRef, thirdRef][index]?.current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="w-full relative pb-36">
      <div ref={firstRef}>
        <PreTest1 submitted={done[0]} onSubmitted={() => markDone(0)} onUnsubmit={() => unmarkDone(0)} />
      </div>

      <Separator />

      <div ref={secondRef}>
        <PreTest2 submitted={done[1]} onSubmitted={() => markDone(1)} onUnsubmit={() => unmarkDone(1)} />
      </div>

      <Separator />

      <div ref={thirdRef}>
        <PreTestErq submitted={done[2]} onSubmitted={() => markDone(2)} onUnsubmit={() => unmarkDone(2)} />
      </div>

      {/* 進度提示：讓參與者看得出還剩哪幾份沒做 */}
      <div className="w-full px-4 py-10">
        <QuestionnaireProgress labels={LABELS} labelsEn={LABELS_EN} done={done} onJumpTo={jumpTo} />
      </div>

      {/* 平時刻意不給 Next（防止跳過問卷）；只有三份都從上次標記恢復時，
          才亮頁尾 Next 鈕讓按返回回來的人繼續。 */}
      <StepFooter onNext={onNext} canNext={restoredAll} />
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
