# 外部依賴清單 / External Dependencies

> 本文件列出這個專案（`fyp-site`）連接到的所有**專案以外**的檔案與服務，
> 方便日後搬遷電腦、移交他人或重新部署時逐一核對。
> 整理日期：2026-10-01

---

## 總覽

這個專案本體只是「前端網站」。真正重要的東西分散在：

| 類別 | 位置 | 失效後果 |
| --- | --- | --- |
| 影片檔（8 支） | Cloudflare R2 | 網站播放頁黑屏 |
| 問卷（8 份） | Google Forms | 流程卡在表單頁 |
| 回應資料合併 | Google 試算表 + Apps Script | 無法產出分析用寬表 |
| 網站部署 | Netlify | 線上網站消失 |
| 程式碼倉庫 | GitHub | 失去版本歷史與備份 |
| 研究文件（docx） | 本機 `C:\EdU\FYP\` | 僅影響溯源，不影響運行 |
| 本機環境變數 | `.env.local`（本機） | 本機開發時影片 404 |

---

## 1. Cloudflare R2 —— 影片託管

- **公開基礎網址**：`https://pub-6560cd0b7f214bf8a5e6476cfdb4afa9.r2.dev`
  （寫在 `netlify.toml` 的 `NEXT_PUBLIC_VIDEO_BASE_URL`；本機開發用同名變數放在 `.env.local`）
- **使用方式**：`src/components/VideoViewer.tsx` 的 `videoUrl()` 會把檔名接在基礎網址後面。
  若變數為空則退回本地 `/videos/`（目前 `public/videos/` 只有 README，沒有影片本體）。
- **R2 上必須存在的 8 個檔案**：

| 組別 | 檔名 | 影片 | 時長 |
| --- | --- | --- | --- |
| 傷感組 sadness | `aftersun-3.mov` | Aftersun／日麗 | 2:23 |
| 傷感組 sadness | `didi-2.mov` | Didi／弟弟 | 4:47 |
| 傷感組 sadness | `manchester-1.mov` | Manchester by the Sea／情繫海邊之城 | 5:45 |
| 傷感組 sadness | `lily-chou-1.mov` | All About Lily Chou-Chou／青春電幻物語 | 5:10 |
| 中性組 neutral | `before-sunset-1.mov` | Before Sunset／日落巴黎 | 4:06 |
| 中性組 neutral | `taxa-paris-1.mov` | Paris, Texas／德州巴黎 | 2:30 |
| 中性組 neutral | `the-pursuit-1.mov` | The Pursuit of Happyness／尋找快樂的故事 | 3:35 |
| 中性組 neutral | `about-time-1.mov` | About Time／真愛每一天 | 3:05 |

- ⚠️ 傷感組原本有 5 支（含 Se7en／七宗罪），2026-09-09 精簡為 4 支；
  舊清單備份在 `src/components/sadnessClips.5clip.backup.ts`。
- ⚠️ 影片原始檔**不在此專案內**。搬遷前請確認 R2 bucket 裡的 8 個檔案有另外備份。

## 2. Google Forms —— 8 份嵌入式問卷

網站以 iframe 嵌入下列表單，回應直接存入各表單的 Google 後台。
`src/lib/formPrefill.ts` 會把 Participant ID 與組別代碼預填進每份表單。

| 流程順序 | 表單 | 元件 | 表單 ID | Participant ID 欄位 | Group 欄位 |
| --- | --- | --- | --- | --- | --- |
| 1 | 同意簽署 | `ConsentSignature.tsx` | `1FAIpQLSdsPN…` | `entry.796871681` | `entry.674025608` |
| 2 | 前測 1 | `PreTest1.tsx` | `1FAIpQLScVhr…` | `entry.553754490` | `entry.646478281` |
| 3 | 前測 2 | `PreTest2.tsx` | `1FAIpQLSdhW3…` | `entry.225204019` | `entry.2096796238` |
| 4 | 前測 ERQ | `PreTestErq.tsx` | `1FAIpQLSeeFb…` | `entry.1372470842` | `entry.1789914533` |
| 5 | 觀後回饋 | `PostViewFeedback.tsx` | `1FAIpQLScO2-…` | `entry.500717267` | `entry.1622817753` |
| 6 | 後測 1 | `PostTest1.tsx` | `1FAIpQLSepV_…` | `entry.88952271` | `entry.951195966` |
| 7 | 後測 2 | `PostTest2.tsx` | `1FAIpQLSfZEB…` | `entry.1397709291` | `entry.1995913222` |
| 8 | 後測 ERQ | `PostTestErq.tsx` | `1FAIpQLSf4dq…` | `entry.1372470842` | `entry.1789914533` |

- ⚠️ **表單 ID 刻意只留前 12 碼。** 本 repo 是公開的，而表單是「任何知道網址的人都能填」，
  所以完整 ID 不寫在這裡。**要知道完整 ID 就讀上表「元件」欄那個檔案** ——
  每個元件的 `FORM_SRC` 常數就是完整網址，那是唯一真實來源（single source of truth）。
  也就是說這張表的功能是「索引」而不是「副本」：它告訴你哪個檔案對應哪份表單。
- 表單完整網址格式：`https://docs.google.com/forms/d/e/<表單ID>/viewform?embedded=true`
- ⚠️ 兩份 ERQ 是同一份表單複製出來的，entry 編號完全相同——分析時要靠
  「回應分頁來源」區分前後測，不能只看編號。
- 表單端已設定的防竄改規則（詳見 `scripts/fyp-sheet-merge.gs` 開頭註解）：
  - Participant ID：簡答題，驗證運算式 `^FYP-[0-9A-Z]{10}$`，必填
  - Group：建議下拉選單只放 `K7`、`M3`，必填
- **組別代碼對照**（刻意中性化，避免需求效應）：
  `K7 = 傷感組（sadness）`、`M3 = 中性組（neutral）`
- 若表單題目有增刪，重跑 `node scripts/get-entry-ids.mjs` 重新核對 entry 編號。
  （注意：該腳本的 FORMS 清單只列了 6 份，未含兩份 ERQ，需要的話要手動補。）

## 3. Google 試算表 + Apps Script —— 資料整合

- **腳本**：`scripts/fyp-sheet-merge.gs`（245 行），貼到一份 Google 試算表
  （例如 `FYP_Data`）的「擴充功能 → Apps Script」中執行。
- **前置條件**：8 份表單的回應目的地都指向同一份試算表
  （表單 → 回覆 → ⋮ → 選取回應目的地 → 選取現有試算表）。
- **產出**：「整合」分頁（Participant ID | Group | Group 解碼 | 各題欄位），
  每位參與者一列，供「前測 vs 對應後測」配對分析。
- **注意**：腳本用 `getActiveSpreadsheet()`，必須**從試算表內**開 Apps Script，
  獨立 Apps Script 專案抓不到試算表。

## 4. Netlify —— 部署

- **設定檔**：`netlify.toml`
  - build command：`npm run build`，publish：`.next`
  - 環境變數：`NODE_VERSION = 20`、`NEXT_PUBLIC_VIDEO_BASE_URL`（R2 網址）
  - 外掛：`@netlify/plugin-nextjs`
- 搬遷／重部署時，Netlify 站台的環境變數要重新設定一次
  （`.env.local` 不會進 Git，不會自動帶過去）。

## 5. GitHub —— 程式碼倉庫

- **遠端**：`https://github.com/Iisii1919/fyp-site.git`（origin）
- 最新提交：`f34c8d8 feat: embed the ERQ reappraisal subscale after PreTest2 / PostTest2`

## 6. 本機外部檔案 —— 研究文件

網站的同意書與資訊單張文字，是從下列檔案抽出後**硬編碼**進程式碼的
（運行時不讀取這些檔案，搬走不會弄壞網站，但會失去溯源依據）：

| 程式檔 | 來源檔案 |
| --- | --- |
| `src/components/data/consentForm.ts` | `C:\EdU\FYP\dark film\document\Consent form.docx` |
| `src/components/data/infoSheet.ts` | `C:\EdU\FYP\dark film\document\INFORMATION SHEET .docx` |

`C:\EdU\FYP\dark film\document\` 內共 15 個檔案，包括：
Capstone Proposal、Ethical Application、Consent Form / Information Sheet
（docx + pdf 各版本）、倫理審查申請表、採購申請表等（完整清單見該資料夾）。

## 7. 本機環境變數 —— `.env.local`

- 存在於專案根目錄，**不進 Git**（已在 `.gitignore`），內容不在本文件記錄。
- 本機開發若要直接測試 R2 影片，需自行設定：
  `NEXT_PUBLIC_VIDEO_BASE_URL=https://pub-6560cd0b7f214bf8a5e6476cfdb4afa9.r2.dev`

## 8. 參與者端本機狀態（非檔案，但交接時要知道）

- Participant ID 格式：`FYP-` + 10 位英數字（`src/lib/participant.tsx` 的 `generateId()`）。
- 參與者身分與流程進度存在**參與者瀏覽器的 localStorage**；
  換電腦／無痕模式視為新參與者。組別首次訪問時 50/50 隨機分配。

---

## 搬遷檢查清單（搬家前照著打勾）

1. [ ] `git push` 確認 GitHub 倉庫是最新的
2. [ ] R2 bucket 的 8 支影片另外下載備份一份
3. [ ] 8 份 Google Form 的擁有者帳號可登入（或轉移擁有權／複製給接手人）
4. [ ] `FYP_Data` 試算表與 Apps Script 已轉移或匯出
5. [ ] 已收集的回應資料匯出備份（CSV 或整份試算表下載）
6. [ ] `C:\EdU\FYP\` 整個資料夾備份（研究文件＋可能的影片原始檔）
7. [ ] Netlify 站台環境變數記錄下來（尤其是 `NEXT_PUBLIC_VIDEO_BASE_URL`）
8. [ ] `.env.local` 的內容手動抄到新機器（不會隨 Git 走）
