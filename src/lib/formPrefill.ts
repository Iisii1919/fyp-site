// Google Forms prefill wiring.
//
// The participant's id + group are appended to every form's iframe URL as URL-encoded
// prefill parameters, e.g.
//   .../viewform?embedded=true&entry.123456=PARTICIPANT_ID&entry.789012=K7
//
// HOW TO ACTIVATE: open each Google Form in edit mode, add TWO SHORT-ANSWER questions —
// 「Participant ID」and「Group」— then grab each field's `entry.XXXX` id from the form's
// prefill link (取得預填連結). Paste them into the table below. Until then the IDs are
// empty, so nothing is appended and the forms behave exactly as before (safe no-op).

import type { Participant, Group } from './participant';

export interface FormPrefillFields {
  // "Participant ID" 簡答題的 entry 編號（全部 5 份表單）。
  // 填 `123456789` 或 `entry.123456789` 都可以，見 entryKey()。
  participantId?: string;
  // "Group" 簡答題的 entry 編號（全部 5 份表單，含兩份前測）。
  group?: string;
}

// ⚠️ 表單「Group」欄位寫入的代碼，刻意不用 sadness / neutral。
// 原因：前測也要記錄組別（才能和對應的後測做對比），但若直接寫入組別名稱，
// 參與者在填前測時就會看到自己屬於哪一組，可能造成需求效應、影響基線作答。
// 用中性代碼則看不出任何意義。請自行留存這組對照（分析時需要）：
//   K7 = sadness（傷感組）
//   M3 = neutral（中性組）
const GROUP_CODE: Record<Group, string> = {
  sadness: 'K7',
  neutral: 'M3',
};

// 容錯：Google Forms 的預填參數是 `entry.<編號>`。
// 這裡允許你只貼編號，或連 `entry.` 一起貼，兩種寫法都會被正規化成正確的參數名。
function entryKey(id: string): string {
  return id.startsWith('entry.') ? id : `entry.${id}`;
}

// entry 編號由 scripts/get-entry-ids.mjs 自動讀出（2026-09-13）。
// 若日後表單新增／刪除題目，重跑該腳本即可確認編號有沒有變。
//
// 2026-09-13 追加兩份 ERQ（前測／後測）。這兩份是同一份表單複製而成，
// 因此 Participant ID / Group 的 entry 編號兩份完全相同 —— 這很正常，
// 但分析時務必靠「表單來源（回應分頁）」區分前後測，不要只看編號。
export const FORM_PREFILL: Record<string, FormPrefillFields> = {
  consentSignature: { participantId: 'entry.796871681', group: 'entry.674025608' },
  preTest1: { participantId: 'entry.553754490', group: 'entry.646478281' },
  preTest2: { participantId: 'entry.225204019', group: 'entry.2096796238' },
  preTestErq: { participantId: 'entry.1372470842', group: 'entry.1789914533' },
  viewingFeedback: { participantId: 'entry.500717267', group: 'entry.1622817753' },
  postTest1: { participantId: 'entry.88952271', group: 'entry.951195966' },
  postTest2: { participantId: 'entry.1397709291', group: 'entry.1995913222' },
  postTestErq: { participantId: 'entry.1372470842', group: 'entry.1789914533' },
};

// Returns `baseSrc` with prefill params appended, or `baseSrc` unchanged when no IDs are set
// or no participant is available yet.
export function buildPrefill(baseSrc: string, formKey: string, p: Participant | null): string {
  const fields = FORM_PREFILL[formKey];
  if (!p || !fields) return baseSrc;
  const params = new URLSearchParams();
  if (fields.participantId) params.set(entryKey(fields.participantId), p.id);
  if (fields.group) params.set(entryKey(fields.group), GROUP_CODE[p.group]);
  const query = params.toString();
  return query ? `${baseSrc}&${query}` : baseSrc;
}
