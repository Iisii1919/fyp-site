'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GoogleFormEmbedProps {
  src: string;
  height: number;
  title: string;
  /**
   * 表單頁數（預設 1）。
   *
   * 1 = 單頁：整份表單只有一個頁面，送出是唯一會讓 iframe「同一個 src 再載入一次」的原因
   *     → 可以安全地自動收合，並可進一步自動前往下一步。
   * >1 = 多頁：按「繼續 / 返回」翻頁時 Google 會重新載入整份文件，iframe 一樣會再 load 一次。
   *     跨網域讀不到 iframe 內容，無法分辨「翻頁」與「送出」，自動判斷必然誤收合，
   *     因此多頁表單只提供手動收合，不做自動判斷。
   */
  pages?: number;
  /** 偵測到「已送出」時呼叫。只有單頁表單（pages <= 1）才會觸發，且只觸發一次。 */
  onSubmitted?: () => void;
  /**
   * 參與者按「展開繼續作答」時呼叫 —— 代表上一則「已送出」的判定是錯的，
   * 父層應該把「已完成」取消掉。沒有這個，誤判就會把問卷永久標成做完。
   */
  onUnsubmit?: () => void;
  /**
   * 掛載時直接呈現「已送出」的收合狀態（2026-10-22）。
   *
   * 用在「這位參與者上次已經送過這份表單」的恢復情境（返回鍵／刷新回來，
   * 標記存在 src/lib/submissions.ts）：不再要求重送，也不會重複觸發
   * onSubmitted（fired 一開始就是 true，自動跳轉不會被重新點燃）。
   * 只在掛載當下生效；之後 prop 改變不影響（一般送出的收合走路徑不變）。
   * 參與者仍可按「展開繼續作答」撤銷 —— 那會走既有的 onUnsubmit 路徑。
   */
  startCollapsed?: boolean;
}

// 嵌入 Google Form 的白底卡片。
//
// 為什麼需要這個元件：
// 表單送出後 Google 只顯示一小塊確認頁（約 400px），iframe 卻還維持原本高度，
// 下方就留下一大片空白，很不美觀。所以在「確認已送出」後把高度收合。
//
// 判斷方式（2026-09-13 以 CDP 實際驅動 Chrome 驗證）：
//   - iframe 再次 load 且 src 沒有改變 → 這才是「同一個表單被重新載入」。
//     用 src 是否改變來排除「帶入 prefill 造成的重新載入」這個誤判來源。
//   - 翻頁（繼續／返回）也會重新載入文件、也會再 load 一次 → 所以 pages > 1 時不自動判斷。
//   - Google 的嵌入表單不會對外送 postMessage（實測 0 則），故不採用該訊號。
// 收合後仍提供「展開表單」按鈕，即使判斷有誤使用者也能自行復原。
const SUBMITTED_HEIGHT = 460;

// 🔴 「同一個 src 又載入一次」這個訊號不完美，處理方式見下方 handleLoad 與 handleToggle。
//
// 背景（2026-10-21 實測）：在問卷頁把 iframe 的 src 重新指一次（＝任何讓表單文件
// 重新導覽的原因），只觸發 1 次 load，就會被判定「已送出」→ 高度由 3420px 收合成 460px，
// 但表單內容仍然是題目。真實會踩到的情況：Google 表單載入時若偵測到上次的草稿，
// 會跳「繼續使用目前的草稿？」對話框；參與者按下之後表單會重新導覽一次。
//
// ⚠️ 曾經用「時間守門」（8 秒內的重新載入不算送出）來擋，**結果誤傷正常提交**：
//    使用者在 8 秒內填完並送出，也被當成草稿重新載入 → 表單不收合、進度顯示未提交。
//    時間門檻無法區分這兩件事，所以**不再用時間判斷**。
//
// ✅ 現在的做法：**照樣立刻判定送出，但讓它可以撤銷**。
//    按下方「表單已收起 · 還沒填完？展開繼續作答」時，除了展開，
//    也會呼叫 `onUnsubmit` 讓父層把「已完成」取消掉。
//    → 誤判的代價從「資料被標成完成、可能跳頁」降成「按一下展開就好」。

// ⚠️ 載入失敗的救援機制（2026-09-13 新增）
//
// 為什麼需要：問卷頁（step 2 / 3 / 6 / 8）**刻意沒有任何「下一頁」按鈕**，
// 唯一的往前路徑就是「表單送出後自動跳轉」。這在正常情況下沒問題，
// 但如果 iframe 載入失敗（斷網、場地網路擋掉 docs.google.com、Google 端異常），
// 不會有送出、也就不會自動跳轉 → 而頁面上又沒有按鈕 →
// **參與者只能盯著一片空白，完全沒有前進的路**，而且畫面上沒有任何錯誤訊息。
//
// 怎麼偵測（實測結論，別改成憑感覺的寫法）：
//   ❌ 不能只用「N 秒內沒有 load 事件」判斷 —— 以 CDP 封鎖 docs.google.com 實測，
//      Chrome 會照樣提交錯誤頁並**在約 3.5 秒時正常觸發 load**。
//      健康的表單和錯誤頁在所有可觀察面向完全一樣：都會 load、
//      contentDocument 都是 null、contentWindow.length 都是 0。DOM 沒有任何訊號可分辨。
//   ❌ `navigator.onLine` 沒用 —— 封鎖該網域時它仍然是 true（只反映網卡狀態）。
//   ✅ 唯一可靠的是**獨立探測主機是否連得到**：對表單網址送一個 no-cors 的 HEAD 請求。
//      同源政策不適用於 no-cors，所以不需要 CORS 標頭；
//      連得到 → resolve（不透明回應），連不到 → reject。
//      實測：正常 426ms resolve；封鎖時 1ms reject。乾淨可辨。
//
// 另外保留一個「N 秒內沒有 load」的計時器，用來涵蓋「請求卡住、連錯誤頁都沒有」的情況。
//
// 救援面板只在偵測到失敗時出現，正常流程下參與者看不到，
// 因此不會成為「跳過問卷」的漏洞。面板另有一個不明顯的關閉鈕，
// 萬一探測誤判（例如瀏覽器外掛擋掉了探測請求）參與者仍能回到正常畫面。
const FALLBACK_HEIGHT = 320;
/** 沒有 load 事件就當成「可能載不出來」。刻意寬鬆：慢速網路不該被誤判。 */
const LOAD_TIMEOUT_MS = 15000;
/** 探測請求自己的上限。逾時只代表「不知道」，不能當成連不上。 */
const PROBE_TIMEOUT_MS = 10000;

/**
 * 確保 Google 表單網址帶 `hl=en`，讓介面文字（提交／必填／繼續）固定是英文。
 *
 * 為什麼需要：Google 表單的介面語言**跟隨表單本身的語言，不跟隨瀏覽者**。
 * 2026-10-21 實測：把瀏覽器 locale 設成 en-US、Accept-Language 送 en-US，
 * 表單仍然顯示「提交」「必填」（`<html lang="zh">`）；只有網址加 `hl=en` 才會變英文。
 * 這幾份表單是從中文帳號建立的，所以預設是中文。
 *
 * 加了之後**所有人一致看到英文介面**，與本站「英文在上」的雙語慣例一致，
 * 也避免英文參與者看到雙語題目卻只有中文按鈕。
 *
 * ⚠️ 已經有 `hl=` 的網址不動（尊重呼叫端）。
 */
function ensureEnglishUI(src: string): string {
  if (!src) return src;
  if (/[?&]hl=/.test(src)) return src;
  return src.includes('?') ? `${src}&hl=en` : `${src}?hl=en`;
}

export default function GoogleFormEmbed({
  src,
  height,
  title,
  pages = 1,
  onSubmitted,
  onUnsubmit,
  startCollapsed = false,
}: GoogleFormEmbedProps) {
  // 一律走這個（已補 hl=en），下面所有地方都用它，確保 src 比較與 iframe 一致。
  const formSrc = ensureEnglishUI(src);
  // 記住「上一次載入完成時的 src」。
  // 這個判斷很關鍵：頁面一開始用未帶 prefill 的網址，等 participant 就緒後會換成
  // 帶 prefill 的網址，iframe 因此會多載入一次。若把那一次算成送出，
  // 表單會在剛載入時就被收合。所以只有「src 沒變卻又 reload」才視為送出。
  const lastLoadedSrc = useRef<string | null>(null);
  // 恢復「已送出」時一開始就視同已點燃：不再重複觸發 onSubmitted（避免自動跳轉
  // 在參與者按返回回來時又把他往前推）。
  const fired = useRef(startCollapsed);

  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [loadFired, setLoadFired] = useState(false);
  /** null = 還在探測 / 無法判定；false = 確定連不到表單主機 */
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // 參與者自行宣告「已在新視窗提交」。設為 true 後救援面板收起、卡片收合成確認高度。
  const [manualDone, setManualDone] = useState(false);
  // 重試用 key 讓 iframe 整個重新掛載（而不是改 src）。
  const [reloadKey, setReloadKey] = useState(0);

  // 只有單頁表單可以自動判斷送出；多頁表單的翻頁會造成誤判。
  const autoCollapse = pages <= 1;
  // 多頁表單永遠顯示手動收合鈕；單頁表單只在（自動）收合後顯示，用來復原。
  const showToggle = collapsed || !autoCollapse;

  // 每次（重新）掛載都重新探測一次。
  useEffect(() => {
    let cancelled = false;
    setLoadFired(false);
    setReachable(null);
    setTimedOut(false);
    setDismissed(false);

    const ctrl = new AbortController();
    const hardStop = window.setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
    fetch(formSrc, { mode: 'no-cors', method: 'HEAD', cache: 'no-store', signal: ctrl.signal })
      .then(() => {
        if (!cancelled) setReachable(true);
      })
      .catch((err: unknown) => {
        // 只是探測自己逾時 → 不能斷定連不上，交給下方的 load 計時器判斷。
        if ((err as Error)?.name === 'AbortError') return;
        if (!cancelled) setReachable(false);
      })
      .finally(() => window.clearTimeout(hardStop));

    const noLoad = window.setTimeout(() => {
      if (!cancelled) setTimedOut(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearTimeout(hardStop);
      window.clearTimeout(noLoad);
    };
  }, [formSrc, reloadKey]);

  const handleLoad = useCallback(() => {
    setLoadFired(true);

    const prev = lastLoadedSrc.current;
    lastLoadedSrc.current = formSrc;

    if (!autoCollapse) return;
    // 首次載入、或 src 變更（帶入 prefill）造成的重新載入 → 不算送出
    if (prev === null || prev !== formSrc) return;

    // 同 src 又載入 → 判定為送出。
    // ⚠️ 這個判斷偶爾會誤判（草稿對話框被按掉時表單會重新導覽），
    //    但**不再用時間門檻去猜**（會誤傷正常提交）。誤判由 handleToggle 的
    //    「展開」撤銷，見檔頭說明。
    setCollapsed(true);
    if (!fired.current) {
      fired.current = true;
      onSubmitted?.();
    }
  }, [autoCollapse, onSubmitted, formSrc]);

  const retry = useCallback(() => {
    // ⚠️ 一定要把 lastLoadedSrc 歸零。
    // 重試用的是同一個 src，若留著舊值，這次重新載入會被判定成
    // 「同 src 又 load = 已送出」→ 參與者還沒填就自動跳頁，直接損失整份問卷。
    lastLoadedSrc.current = null;
    setReloadKey((k) => k + 1);
  }, []);

  // 參與者在另一個視窗填完後自己按「繼續」。走的是和偵測到送出完全相同的路徑。
  const markSubmittedManually = useCallback(() => {
    setManualDone(true);
    setCollapsed(true);
    if (!fired.current) {
      fired.current = true;
      onSubmitted?.();
    }
  }, [onSubmitted]);

  /**
   * 下方那顆小按鈕：收合／展開表單。
   *
   * 收合 → 同時宣告已遞交（僅單頁表單），給「真的送出但沒被偵測到」的人一條前進的路
   *        （問卷頁刻意沒有下一頁按鈕，沒有這條路就會卡住）。
   * 展開 → 同時**撤銷**「已遞交」，給「被誤判成送出」的人一條回頭的路。
   *        沒有撤銷的話，誤判會讓問卷永久標成完成、甚至自動跳頁。
   * （多頁表單的收合只是方便閱讀，不代表送出，所以兩個方向都不宣告。）
   */
  const handleToggle = useCallback(() => {
    if (collapsed) {
      fired.current = false;
      setCollapsed(false);
      if (autoCollapse) onUnsubmit?.();
      return;
    }
    if (autoCollapse && !fired.current) {
      fired.current = true;
      onSubmitted?.();
    }
    setCollapsed(true);
  }, [collapsed, autoCollapse, onSubmitted, onUnsubmit]);

  // 「連不到主機」單獨就足以判定失敗（錯誤頁也會觸發 load，所以不能反過來要求沒有 load）；
  // 「一直沒有 load」則是涵蓋請求整個卡住的情況。
  const failed = reachable === false || (timedOut && !loadFired);
  const showFallback = failed && !dismissed && !manualDone && !collapsed;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[rgba(198,168,248,0.18)]"
      >
        <iframe
          key={reloadKey}
          src={formSrc}
          width="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title={title}
          style={{
            display: 'block',
            height: collapsed ? SUBMITTED_HEIGHT : showFallback ? FALLBACK_HEIGHT : height,
            transition: 'height 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onLoad={handleLoad}
        >
          載入中… Loading…
        </iframe>

        {showFallback && (
          <div
            role="alert"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 py-6 gap-3 bg-white"
          >
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="關閉提示 Dismiss"
              className="absolute top-2 right-3 text-[#b5b5b5] hover:text-[#7a7a7a] text-lg leading-none transition-colors"
            >
              ×
            </button>

            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c98a3c" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
            </svg>

            <p className="text-[#3d3d3d] font-semibold text-base">
              表單載入失敗
              <span className="block text-[#6b6b6b] font-normal text-xs mt-0.5">The form could not be loaded</span>
            </p>

            <p className="text-[#6b6b6b] text-xs leading-relaxed max-w-md">
              請先嘗試重新載入。若仍然無法載入，可改用新視窗填寫，完成後回來按最下方的「繼續」。
              <br />
              Please try reloading. If it still fails, open the form in a new window, submit it, then press “continue” below.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <button
                type="button"
                onClick={retry}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#d4bfff', color: '#3d3d3d' }}
              >
                Reload the form
                <span className="block text-xs font-normal mt-0.5">重新載入表單</span>
              </button>
              <a
                href={formSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: 'rgba(198,168,248,0.5)', color: '#5a4a72' }}
              >
                Open the form in a new window
                <span className="block text-xs font-normal mt-0.5">在新視窗開啟表單</span>
              </a>
            </div>

            <button
              type="button"
              onClick={markSubmittedManually}
              className="text-[#8a8a8a] hover:text-[#5a5a5a] text-xs underline mt-1 transition-colors"
            >
              Already submitted in the new window? Continue here →
              <span className="block">已在新視窗完成提交？按此繼續 →</span>
            </button>
          </div>
        )}
      </motion.div>

      {showToggle && (
        <button
          type="button"
          onClick={handleToggle}
          className="text-[#8a8a8a] hover:text-[#d4bfff] text-xs mt-3 transition-colors"
        >
          {collapsed ? (
            <>
              Form collapsed · Not finished yet? Expand to keep answering
              <span className="block">表單已收起 · 還沒填完？展開繼續作答</span>
            </>
          ) : (
            <>
              Submitted? Collapse the form and continue
              <span className="block">已遞交？收起表單並繼續</span>
            </>
          )}
        </button>
      )}
    </>
  );
}
