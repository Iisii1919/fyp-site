/**
 * FYP 資料整合 — Google Apps Script
 * ---------------------------------------------------------------------------
 * 用途：把 8 份 Google Form 的回應合併成「一位參與者一列」的寬表，
 *       方便做「前測 vs 對應後測」的配對比較。
 *
 * 使用步驟
 * 1. 先建立一份新的 Google 試算表（例如 FYP_Data）。
 * 2. 把 8 份表單的回應目的地都指向它：
 *      開表單 → 「回覆」分頁 → 右上「⋮」→「選取回應目的地」→「選取現有試算表」
 *      → 選 FYP_Data。八份都做一次，會自動長出 8 個分頁。
 *      ⚠️ 本腳本是**動態掃描**（見 buildMergedSheet 的 ss.getSheets().filter），
 *         分頁數量不必跟這裡寫的一致 —— 之後再加表單也不用改程式碼。
 * 3. 在 FYP_Data 裡開「擴充功能 → Apps Script」——**一定要從試算表開**，
 *    本腳本用的是 getActiveSpreadsheet()，獨立的專案會抓不到試算表。
 *    把本檔全部貼進去（覆蓋預設的 myFunction），存檔 Ctrl+S。
 * 4. 第一次執行：工具列函式下拉選單選 buildMergedSheet → 按「執行」→ 授權。
 *    授權過之後，重新整理時只要用試算表上方的
 *    「FYP 資料 → 重新整理整合分頁」選單，點一下就跑，不必再開 Apps Script。
 * 5. 試算表會多出一個「整合」分頁：Participant ID | Group | Group (解碼) | 各題欄位。
 *    可重複執行，每次都會清空重寫；原始分頁只讀不寫，不會被改動。
 *
 * Participant ID / Group 防竄改（重要）
 * ---------------------------------------------------------------------------
 * ⚠️ **Google Forms 沒有「唯讀欄位」**，官方不支援把預填的值鎖住，
 *    參與者一律可以編輯（已查證，只能靠第三方外掛 Formfacade 之類，不建議用在正式收資料）。
 *    所以改用「表單端擋掉無效值 + 事後檢查」兩層防護：
 *
 *   表單端（要在 Google Form UI 手動設定，6 份表單都要做）：
 *     a) Participant ID：保持「簡答題」，
 *        設定 → 回應驗證 → 規則「符合運算式」→ 輸入  ^FYP-[0-9A-Z]{10}$
 *        自訂錯誤訊息填「此欄位由系統自動填入，請勿修改」
 *        → 參與者若誤刪或亂改，會**無法送出**，會當場發現而不是默默污染資料。
 *     b) Group：建議把題型改成「下拉式選單」，選項只放 K7 與 M3（並設為必填）。
 *        這樣參與者「只能」在兩個有效代碼之間選，不可能產生無效值。
 *        （若維持簡答題，就同樣用運算式  ^(K7|M3)$  驗證。）
 *     c) 兩題都設為「必填」，並在題目說明寫「由系統自動填入，請勿修改」。
 *
 *   事後檢查：跑 auditParticipantIntegrity()（或上方選單「檢查 ID / Group 是否被改過」），
 *    會把格式不符、跨分頁 Group 不一致、重複遞交的資料列列到「檢查報告」分頁。
 *
 * 組別代碼對照（網站 formPrefill.ts 的 GROUP_CODE）
 *   K7 = sadness（傷感組）
 *   M3 = neutral（中性組）
 */

var MERGED_SHEET = '整合';
var REPORT_SHEET = '檢查報告';

var GROUP_LABEL = {
  K7: 'sadness',
  M3: 'neutral',
};

/**
 * 在試算表上方加入「FYP 資料」選單，之後重新整理只要點一下。
 * 只有「從試算表 → 擴充功能 → Apps Script」建立的綁定專案才有效；
 * 獨立專案不會出現在選單列（那種情況請直接在編輯器按「執行」）。
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('FYP 資料')
    .addItem('重新整理整合分頁', 'buildMergedSheet')
    .addItem('檢查 ID / Group 是否被改過', 'auditParticipantIntegrity')
    .addSeparator()
    .addItem('列出各分頁欄位（除錯）', 'listSheetsAndHeaders')
    .addToUi();
}

/**
 * 建立／更新「整合」分頁。
 * 會自動掃描除了「整合」以外的所有分頁，找出每一頁的
 * 「Participant ID」與「Group」欄位，再用 Participant ID 把所有分頁接起來。
 * 可重複執行，每次都會重新產生（原始分頁不會被改動）。
 */
function buildMergedSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sources = ss.getSheets().filter(function (s) {
    return s.getName() !== MERGED_SHEET && s.getName() !== REPORT_SHEET;
  });

  var byPid = {};
  var keyOrder = [];
  var seen = {};

  sources.forEach(function (sheet) {
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return;

    var header = values[0].map(function (h) {
      return String(h).trim();
    });

    var idCol = -1;
    var groupCol = -1;
    for (var i = 0; i < header.length; i++) {
      if (idCol < 0 && /participant\s*id/i.test(header[i])) idCol = i;
      if (groupCol < 0 && /group/i.test(header[i]) && header[i].indexOf('解碼') < 0) groupCol = i;
    }
    if (idCol < 0) return;

    var sheetName = sheet.getName();
    var otherCols = [];
    for (var j = 0; j < header.length; j++) {
      if (j === idCol || j === groupCol) continue;
      if (!header[j]) continue;
      otherCols.push(j);
      var key = sheetName + ' | ' + header[j];
      if (!seen[key]) {
        seen[key] = true;
        keyOrder.push(key);
      }
    }

    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var pid = String(row[idCol]).trim();
      if (!pid) continue;

      if (!byPid[pid]) byPid[pid] = { group: '', data: {} };
      if (groupCol >= 0 && row[groupCol]) byPid[pid].group = String(row[groupCol]).trim();

      for (var k = 0; k < otherCols.length; k++) {
        var ci = otherCols[k];
        var v = row[ci];
        if (v !== '' && v !== null && v !== undefined) {
          byPid[pid].data[sheetName + ' | ' + header[ci]] = v;
        }
      }
    }
  });

  var out = [['Participant ID', 'Group', 'Group (解碼)'].concat(keyOrder)];
  var pids = Object.keys(byPid).sort();
  pids.forEach(function (pid) {
    var rec = byPid[pid];
    var row = [pid, rec.group, GROUP_LABEL[rec.group] || rec.group];
    keyOrder.forEach(function (key) {
      row.push(rec.data[key] !== undefined ? rec.data[key] : '');
    });
    out.push(row);
  });

  var sheet = ss.getSheetByName(MERGED_SHEET);
  if (!sheet) sheet = ss.insertSheet(MERGED_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, out.length, out[0].length).setValues(out);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, out[0].length).setFontWeight('bold');

  Logger.log('整合完成：' + (out.length - 1) + ' 位參與者、' + keyOrder.length + ' 個欄位。');
}

/**
 * 檢查 Participant ID / Group 有沒有被參與者改過。
 *
 * ⚠️ Google Forms **沒有**「唯讀欄位」這個功能（官方不支援），
 *    預填進去的值參與者一律可以編輯。所以只能靠事後檢查補救。
 *    表單端可以做的防護見下方註解；這裡負責抓出漏網的資料。
 *
 * 會抓三種可疑情況：
 *   1. Participant ID 格式不符 —— 正常是 `FYP-` 加 10 個英數大寫（見 participant.tsx 的 generateId）
 *   2. 同一個 Participant ID 在不同分頁出現不同的 Group 代碼（正常不可能發生）
 *   3. 同一個 Participant ID 在同一分頁重複出現（重複遞交）
 *
 * 結果寫進「檢查報告」分頁；沒有問題就只會有標題列。
 */
function auditParticipantIntegrity() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sources = ss.getSheets().filter(function (s) {
    return s.getName() !== MERGED_SHEET && s.getName() !== REPORT_SHEET;
  });

  var ID_RE = /^FYP-[0-9A-Z]{10}$/;
  var problems = [['分頁', '列號', 'Participant ID', 'Group', '問題']];
  var groupByPid = {};
  var groupSource = {};

  sources.forEach(function (sheet) {
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return;

    var header = values[0].map(function (h) { return String(h).trim(); });
    var idCol = -1;
    var groupCol = -1;
    for (var i = 0; i < header.length; i++) {
      if (idCol < 0 && /participant\s*id/i.test(header[i])) idCol = i;
      if (groupCol < 0 && /group/i.test(header[i]) && header[i].indexOf('解碼') < 0) groupCol = i;
    }
    if (idCol < 0) return;

    var name = sheet.getName();
    var seenHere = {};

    for (var r = 1; r < values.length; r++) {
      var pid = String(values[r][idCol]).trim();
      if (!pid) continue;
      var g = groupCol >= 0 ? String(values[r][groupCol]).trim() : '';

      if (!ID_RE.test(pid)) {
        problems.push([name, r + 1, pid, g, 'Participant ID 格式不符（應為 FYP- 加 10 個英數大寫）']);
      }
      if (seenHere[pid]) {
        problems.push([name, r + 1, pid, g, '同一位參與者在本分頁重複出現']);
      }
      seenHere[pid] = true;

      if (g) {
        if (groupByPid[pid] && groupByPid[pid] !== g) {
          problems.push([name, r + 1, pid, g,
            'Group 與其他分頁不一致（' + groupSource[pid] + ' 記為 ' + groupByPid[pid] + '）']);
        } else if (!groupByPid[pid]) {
          groupByPid[pid] = g;
          groupSource[pid] = name;
        }
      }
    }
  });

  var sheet = ss.getSheetByName(REPORT_SHEET);
  if (!sheet) sheet = ss.insertSheet(REPORT_SHEET);
  sheet.clear();
  sheet.getRange(1, 1, problems.length, problems[0].length).setValues(problems);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, problems[0].length).setFontWeight('bold');

  var n = problems.length - 1;
  Logger.log(n === 0
    ? '檢查完成：沒有發現問題。'
    : '檢查完成：發現 ' + n + ' 個可疑資料列，詳見「' + REPORT_SHEET + '」分頁。');
}

/**
 * 除錯用：列出目前所有分頁名稱與欄位標題，確認腳本抓到的欄位是否正確。
 */
function listSheetsAndHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(function (sheet) {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) {
      Logger.log(sheet.getName() + '：空分頁');
      return;
    }
    var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    Logger.log(sheet.getName() + ' → ' + header.join(' | '));
  });
}
