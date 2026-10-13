'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  AGE_BANDS,
  CONFIRM_NO,
  CONFIRM_YES,
  OTHER_UNIVERSITY,
  UNIVERSITIES,
} from '@/components/eligibilityQuestions';
import { useAutoAdvance } from '@/lib/useAutoAdvance';
import { H1_PAGE, H2_PAGE } from '@/lib/headingSizes';

// ⚠️ 這一頁是整個研究流程的**最前面一頁**，排在資訊表 / 同意書之前。
//
// 目的：先確認參與者符不符合招募條件（16–30 歲 + 香港的大學生），
// 不符合的人在這一頁就會被擋掉，不會進到研究流程、也不會看到同意書。
//
// ===============================================================
// 2026-10-13：由「嵌入 Google 表單」改成「網站原生表單」
// ===============================================================
// 原本這一頁是 iframe 嵌入一份 Google 篩選表單。改成原生表單的原因是
// 跨來源限制（same-origin policy）讓網站**讀不到** iframe 裡的答案：
//
//   * docs.google.com 與本站不同來源 → contentDocument 永遠是 null、
//     contentWindow 一讀就丟例外；連 Google 自己的嵌入表單也**不發任何 postMessage**
//     （GoogleFormEmbed.tsx 的量測紀錄）。→ 我們唯一收得到的訊號是
//     「同一個 src 又 load 了一次」，那只證明「送出」，**不含答案內容**。
//   * 後果：網站端無法自己再判斷一次資格。原本的做法是**參與者自己按**
//     「已符合資格，繼續」，而按鈕沒有辦法擋住「表單沒填就按繼續」的人 ——
//     真正擋人的只有 Google 表單本身。
//
// 改成原生表單後，答案就在本地 state 裡 → 網站能即時、準確地判斷資格，
// 不符合的人**看不到繼續按鈕**，符合的人自動前進。這正是原本做不到的事。
//
// （另一條路「保留 Google 表單 + Apps Script 當 API」評估後放棄：
//  trigger 是非同步的，網站只能輪詢；而且篩選表單是匿名的，
//  回應裡沒有任何欄位能對應回站在螢幕前的這個人 —— 猜錯就等於放錯人進來。
//  詳見當日紀錄。）
//
// ---------------------------------------------------------------
// ⚠️ 篩選結果**刻意不存**（使用者明確決定）
// ---------------------------------------------------------------
// 這一頁在答題時，參與者編號（Participant ID）其實已經存在了
// （ParticipantProvider mount 時就產生，同意書要用它）。但這一頁
// **刻意不把它讀出來、也不把答案寫進 localStorage**，篩選階段保持匿名。
//
// 理由：如果存了一筆答案卻沒有（也不能有）Participant ID 當鍵，
// 那筆紀錄就是**不可逆的匿名資料** —— 事後無法對應到任何人，
// 對研究分析沒有用處，卻多了一批「有紀錄的個人資料」要交代。
// 收一份沒有用途、只增加風險的資料，不如不收。
//
// 所以：年齡級距與院校都只活在 component state 裡，離開這一頁就沒了。
// ⚠️ 這段是刻意的取捨，不要為了「方便統計招募漏斗」擅自加上持久化。
//
// ---------------------------------------------------------------
// ⚠️ 這一頁之後還有資訊表與同意書，畫面上不寫出名稱細節
// ---------------------------------------------------------------
// 這頁的「接下來」說明只講「還有 3 個部分、需要再花一點時間」這種層級。
// 理由是資訊表本身就會說明流程與時長，這裡先講一次既重複，
// 又等於讓還沒同意的人先讀到簡化版的流程說明。
// （也避免下游的文字偵測器把這裡的敘述誤判成同意書內容。）

interface EligibilityScreeningProps {
  /** 參與者確認符合資格時呼叫。 */
  onContinue: () => void;
}

export default function EligibilityScreening({ onContinue }: EligibilityScreeningProps) {
  const [ageBand, setAgeBand] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [ageConfirm, setAgeConfirm] = useState<string>('');
  const [uniConfirm, setUniConfirm] = useState<string>('');

  // 自動前往下一步（沿用其他問卷頁的節奏：先讓參與者看到結果，再跳頁）。
  const trigger = useAutoAdvance(onContinue);

  // 資格判斷。**全部由本地 state 決定** —— 這就是改成本原表單換到的東西。
  //
  // ⚠️ 兩題確認題是**必要條件**，不是裝飾：
  //    原 Google 表單用它們做跳轉（選「否」→ 直接結束），
  //    在原生表單裡它們就是「參與者自己再確認一次」的關卡。
  //    只靠年齡級距與院校清單判斷是不夠的 —— 院校清單本來就可能不完整。
  const selectedAge = AGE_BANDS.find((b) => b.label === ageBand);
  const ageOk = selectedAge?.eligible === true;
  const ageConfirmOk = ageConfirm === CONFIRM_YES;
  const uniConfirmOk = uniConfirm === CONFIRM_YES;
  const uniChosen = university !== '';

  // 有沒有「明確表達不符合」——用來顯示對應的說明，而不是一直顯示「請填完」。
  const ageRejected = ageConfirm === CONFIRM_NO || (selectedAge != null && !selectedAge.eligible);
  const uniRejected = uniConfirm === CONFIRM_NO;

  // 三題都答了才算「已回答」。用來決定要不要顯示不符合的說明區塊。
  const allAnswered = ageBand !== '' && university !== '' && ageConfirm !== '' && uniConfirm !== '';

  const eligible = ageOk && ageConfirmOk && uniConfirmOk && uniChosen;

  // 不符合時具體說出是哪一項不符合，讓參與者知道原因（不要只丟一句「你不符合」）。
  const rejectReasons = useMemo(() => {
    const reasons: string[] = [];
    if (selectedAge && !selectedAge.eligible) {
      reasons.push('這項研究的招募年齡是 16–30 歲。/ This study recruits participants aged 16–30.');
    }
    if (ageRejected && selectedAge?.eligible) {
      reasons.push(
        '你在年齡確認一題選了「否，我不符合」。/ You selected "No" on the age confirmation.',
      );
    }
    if (uniRejected) {
      reasons.push(
        '你在院校確認一題選了「否，我不符合」。本研究只招募現正就讀香港大學的學生。/ You selected "No" on the university confirmation. This study only recruits current university students in Hong Kong.',
      );
    }
    return reasons;
  }, [selectedAge, ageRejected, uniRejected]);

  // ⚠️ 只在「真的符合」時才觸發，而且 useAutoAdvance 內部保證只排程一次。
  //    不符合的人**永遠不會**被帶進下一步 —— 這與原 Google 表單的跳轉行為一致。
  //
  // ⚠️ 放在 useEffect 而不是直接在 render 裡呼叫 trigger()：與 PreTest / PostTest
  //    的作法一致（見 PreTest.tsx 的 done.every(Boolean) → trigger()），
  //    也讓「排程跳頁」這種副作用留在 effect 階段，不混進 render。
  useEffect(() => {
    if (eligible) trigger();
  }, [eligible, trigger]);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #545454 0%, #3d3d3d 50%, #3d3d3d 100%)' }}
    >
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h1 className="font-serif font-bold text-[#FFFFFF] text-3xl md:text-4xl mb-2" style={H1_PAGE}>
          Eligibility Screening
        </h1>
        <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-4" style={H2_PAGE}>
          參與資格確認
        </h2>
        <div className="gold-divider max-w-xs mx-auto mb-4"></div>
        <p className="text-[#9a9a9a] text-sm text-center">
          Please answer the questions below so we can confirm whether you are eligible for
          this study.
        </p>
        <p className="text-[#8a8a8a] text-xs mt-1 text-center">
          請回答以下問題，以確認你是否符合本研究的參與資格。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-3xl flex flex-col gap-5"
      >
        {/* ---------- 年齡 ---------- */}
        <QuestionCard
          en="What is your age?"
          zh="你的年齡是？"
          hint="本研究招募 16–30 歲的參加者。/ This study recruits participants aged 16–30."
        >
          <select
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
            aria-label="Age range"
            className="input-luxury cursor-pointer"
          >
            <option value="">請選擇 / Please select</option>
            {AGE_BANDS.map((b) => (
              <option key={b.label} value={b.label} className="text-[#2a2a2a]">
                {b.label}
              </option>
            ))}
          </select>
        </QuestionCard>

        {/* ---------- 年齡確認題 ---------- */}
        <QuestionCard
          en="Confirmation: Are you between 16 and 30 years old?"
          zh="確認：你是否介乎 16 至 30 歲？"
          hint="請再次確認。本研究只接受 16–30 歲的參加者。/ Please confirm. This study only accepts participants aged 16–30."
        >
          <ConfirmRadios
            name="age-confirm"
            value={ageConfirm}
            onChange={setAgeConfirm}
            groupLabel="Age confirmation"
          />
        </QuestionCard>

        {/* ---------- 院校 ---------- */}
        <QuestionCard
          en="Which university do you attend?"
          zh="你就讀哪一所大學？"
          hint='請選擇你就讀的院校。若你的院校不在名單上，或你並非就讀香港的大學，請選「其他」。/ Please select your institution. If your institution is not listed, or you do not study at a university in Hong Kong, please choose "Other".'
        >
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            aria-label="University"
            className="input-luxury cursor-pointer"
          >
            <option value="">請選擇 / Please select</option>
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u} className="text-[#2a2a2a]">
                {u}
              </option>
            ))}
          </select>

          {/* 選「其他」時多提醒一次 —— 原表單的題目說明有寫，但下拉選單裡看不到。 */}
          {university === OTHER_UNIVERSITY && (
            <p className="text-[#8a8a8a] text-[11px] mt-2 leading-relaxed">
              若你並非就讀香港的大學，請在下一題選「否，我不符合」。
              <span className="block">
                If you do not study at a university in Hong Kong, please select &ldquo;No&rdquo;
                on the next question.
              </span>
            </p>
          )}
        </QuestionCard>

        {/* ---------- 院校確認題 ---------- */}
        <QuestionCard
          en="Confirmation: Are you currently a university student in Hong Kong?"
          zh="確認：你是否現正就讀香港的大學？"
          hint='若你就讀的院校不在名單上，或你並非就讀香港的大學，請選「否」。/ If your institution was not listed, or you do not study at a university in Hong Kong, please choose "No".'
        >
          <ConfirmRadios
            name="uni-confirm"
            value={uniConfirm}
            onChange={setUniConfirm}
            groupLabel="University confirmation"
          />
        </QuestionCard>
      </motion.div>

      {/* ---------- 不符合資格的說明 ----------
          ⚠️ 不符合的人**看不到繼續按鈕**（下面那顆只在 eligible 時出現），
             所以這一塊是他們唯一會看到的「結果」，必須講清楚原因與下一步。 */}
      {allAnswered && !eligible && rejectReasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl mt-6 glass-card p-5"
          role="status"
        >
          <p className="text-[#EAECEF] text-sm font-medium mb-2">
            很抱歉，你暫時不符合本研究的參與資格。
          </p>
          <ul className="text-[#9a9a9a] text-xs leading-relaxed list-disc pl-5 space-y-1">
            {rejectReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="text-[#8a8a8a] text-xs mt-3 leading-relaxed">
            感謝你的時間與興趣。你不需要繼續，可以直接關閉這個頁面。
          </p>
          <p className="text-[#8a8a8a] text-[11px] mt-1 leading-relaxed">
            Thank you for your time and interest. There is no need to continue — you may close
            this page.
          </p>
        </motion.div>
      )}

      {/* ---------- 繼續按鈕 ----------
          ⚠️ 這一顆**只在符合資格時存在**，不是 disabled。
              做成 disabled 的話，不符合的人也看得到按鈕，會以為自己差一步；
              直接不渲染，畫面上就沒有任何通往研究流程的路徑。 */}
      {eligible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mt-8 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="btn-gold text-base font-semibold inline-flex items-center gap-3"
          >
            <span>Continue</span>
            <span className="text-xs opacity-70 font-normal">繼續</span>
          </motion.button>
          <p className="text-[#8a8a8a] text-xs text-center max-w-md">
            你符合參與資格，將自動前往下一步。
            <span className="block mt-0.5">You are eligible — continuing automatically.</span>
          </p>
        </motion.div>
      )}

      {/* 「接下來」說明。
          ⚠️ 刻意不寫出資訊表／同意書的名稱，理由見檔頭。 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-3xl mt-10 glass-card p-5"
      >
        <p className="text-[#EAECEF] text-sm font-medium mb-2">接下來 / What happens next</p>
        <p className="text-[#9a9a9a] text-xs leading-relaxed">
          若你符合資格，還有 3 個部分要完成：研究說明與同意、問卷、以及影片觀看。
          完整細節與所需時間會在下一個部分說明。
        </p>
        <p className="text-[#8a8a8a] text-[11px] mt-2 leading-relaxed">
          If you are eligible, there are 3 more parts: information and consent, the
          questionnaires, and the video viewing. Full details and timings are given in the
          next part.
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 以下是這一頁專用的小元件。                                            */
/* 刻意留在同一個檔案裡：它們只服務這一頁，抽出去只會多一層跳轉。              */
/* ------------------------------------------------------------------ */

interface QuestionCardProps {
  /** 英文題目。 */
  en: string;
  /** 中文題目。 */
  zh: string;
  /** 題目說明（雙語，斜線分隔）。 */
  hint: string;
  children: React.ReactNode;
}

function QuestionCard({ en, zh, hint, children }: QuestionCardProps) {
  return (
    <div className="glass-card p-5">
      <p className="text-[#FFFFFF] text-sm font-medium leading-snug">{en}</p>
      <p className="text-[#EAECEF] text-xs mt-0.5 mb-2">{zh}</p>
      <p className="text-[#8a8a8a] text-[11px] leading-relaxed mb-3">{hint}</p>
      {children}
    </div>
  );
}

interface ConfirmRadiosProps {
  /** radio group 的 name，同一頁兩個確認題必須不同。 */
  name: string;
  value: string;
  onChange: (v: string) => void;
  groupLabel: string;
}

/**
 * 兩題確認題共用的選項。
 *
 * ⚠️ 用真的 radio input 而不是按鈕：
 *    鍵盤可以操作、螢幕閱讀器讀得出來、也能吃到瀏覽器的 focus 樣式。
 *    （原本靠 Google 表單的地方這些都是白拿的，自己刻就要自己顧。）
 */
function ConfirmRadios({ name, value, onChange, groupLabel }: ConfirmRadiosProps) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={groupLabel}>
      {[CONFIRM_YES, CONFIRM_NO].map((opt) => {
        const checked = value === opt;
        return (
          <label
            key={opt}
            className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors"
            style={{
              background: checked ? 'rgba(198,168,248,0.14)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${checked ? 'rgba(198,168,248,0.6)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={checked}
              onChange={() => onChange(opt)}
              className="mt-1 shrink-0 accent-[#C6A8F8]"
            />
            <span className="text-[#EAECEF] text-xs leading-relaxed">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}
