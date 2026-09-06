import type { DocxItem } from '../DocxView';

// Extracted from "C:\EdU\FYP\dark film\document\Consent form.docx"
// (script: .workbuddy-ai/tmp/extract_docx.py)
export const consentFormItems: DocxItem[] = [
  { type: 'p', text: '香港教育大學', bold: true },
  { type: 'p', text: '心理學系', bold: true },
  { type: 'p', text: '參與研究同意書', bold: true },
  { type: 'p', text: '傷感電影對增強心理韌性的影響', bold: true },
  {
    type: 'p',
    text:
      '本人同意參加由陳志樂博士負責監督，林家權負責執行的研究項目。她／他們是香港教育大學心理學系的教員和學生。',
    bold: false,
  },
  {
    type: 'p',
    text:
      '本人理解此研究所獲得的資料可用於未來的研究和學術發表。然而本人有權保護本人的隱私，本人的個人資料將不能洩漏。',
    bold: false,
  },
  {
    type: 'p',
    text:
      '研究員已將所附資料的有關步驟向本人作了充分的解釋。本人理解可能會出現的風險。本人是自願參與這項研究。',
    bold: false,
  },
  {
    type: 'p',
    text:
      '本人理解本人有權在研究過程中提出問題,並在任何時候決定退出研究，更不會因此而對研究工作產生的影響負有任何責任。',
    bold: false,
  },
  {
    type: 'table',
    rows: [
      ['參加者姓名:', '', ''],
      ['參加者簽署：', '', ''],
      ['日期：', '', ''],
    ],
  },
  { type: 'p', text: 'THE EDUCATION UNIVERSITY OF HONG KONGDepartment of Psychology', bold: true },
  { type: 'p', text: 'CONSENT TO PARTICIPATE IN RESEARCH', bold: true },
  {
    type: 'p',
    text: 'The Influence of Sadness Film on Enhancing Psychological Resilience',
    bold: true,
  },
  {
    type: 'p',
    text:
      'I,                     , hereby consent to participate in the captioned research supervised by Dr Lawrance Chan Chi Lok and conducted by LIN Jiaquan, who are staff and student of the Department of Psychology in The Education University of Hong Kong.',
    bold: false,
  },
  {
    type: 'p',
    text:
      'I understand that information obtained from this research may be used in future research and may be published. However, my right to privacy will be retained, i.e., my personal details will not be revealed.',
    bold: false,
  },
  {
    type: 'p',
    text:
      'The procedure as set out in the attached information sheet has been fully explained. I understand the benefits and risks involved. My participation in the project is voluntary.',
    bold: true,
  },
  {
    type: 'p',
    text:
      'I acknowledge that I have the right to question any part of the procedure and can withdraw at any time without negative consequences.',
    bold: false,
  },
  {
    type: 'table',
    rows: [
      ['Name of Participant:', ''],
      ['Signature of Participant:', '', ''],
      ['Date:', ''],
    ],
  },
];