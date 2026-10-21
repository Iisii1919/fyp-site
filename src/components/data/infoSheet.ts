import type { DocxItem } from '../DocxView';

// Source: "C:\EdU\FYP\dark film\last proposal\Consent Form and Information Sheets_Lin Jiaquan_01.docx"
//
// 2026-10-01 — replaced with the REVISED information sheet. Changes vs the previous
// version (extracted from "dark film\document\INFORMATION SHEET .docx"):
//   * The revised sheet is ENGLISH-ONLY. All Chinese fragments below "謝謝閣下有興趣…"
//     were template placeholders (the HREC form's own prompt lines such as
//     「研究方法說明工作及步驟」/「闡述研究項目的目的」) that were being rendered to
//     participants as if they were content. They are gone; do not reintroduce them.
//   * Project title now ends "…and the Meaning of Life".
//   * Procedure numbers corrected — the page now shows THREE questionnaires per
//     sitting, not two. See INFO_SHEET_PROCEDURE_CHECK below; keep it in sync with
//     `useQuestionnaireCount` in src/components/QuestionnaireProgress.tsx.
//   * Supervisor name fixed to "Dr Lawrence Chan" (was "Dr Lawrance Chan Chi Lok").
export const infoSheetItems: DocxItem[] = [
  { type: 'p', text: 'INFORMATION SHEET', bold: true },
  {
    type: 'p',
    text: 'The Influence of Sadness Film on Enhancing Psychological Resilience and the Meaning of Life',
    bold: true,
  },
  {
    type: 'p',
    text:
      'You are invited to participate in the captioned research supervised by Dr Lawrence Chan and conducted by Lin Jiaquan, who are staff and student of the Department of Psychology in The Education University of Hong Kong.',
    bold: false,
  },

  { type: 'p', text: 'The introduction of the research', bold: true },
  {
    type: 'p',
    text:
      "There is a paradox that sadness films have a negative influence on people's mental health. This project aims to design and measure a psychological resilience-enhancing tool based on sadness films.",
    bold: false,
  },
  {
    type: 'p',
    text:
      'This action research project will explore whether watching sadness films would help people enhance psychological resilience, mediated by cognitive reappraisal (Gross, 1998). An interactive website with several sadness film clips and short descriptions or neutral film clips and short descriptions will be used as a resilience-enhancing tool.',
    bold: false,
  },

  { type: 'p', text: 'The methodology of the research', bold: true },
  { type: 'p', text: 'A) Procedure of the research', bold: false },
  {
    type: 'p',
    text:
      'At the beginning, participants have to complete the CD-RISC-10, MLQ and ERQ as a pre-test. Then they will watch 4 sadness film clips or 4 neutral film clips, spending around 20 minutes. Subsequently, they will be asked 4 post-watching questions and they have to write down their feedback. After that, they have to complete the CD-RISC-10, adapted MLQ and ERQ as a post-test.',
    bold: false,
  },
  { type: 'p', text: 'The process will take around 30 minutes.', bold: false },
  {
    type: 'p',
    text: 'B) Potential benefits (including compensation for participation)',
    bold: false,
  },
  {
    type: 'p',
    text:
      'First, the findings of this study may show that the website may become a low-cost, accessible tool for resilience enhancement.',
    bold: false,
  },
  {
    type: 'p',
    text:
      'Second, it can help the public understand that sad or heavy emotional experiences are not necessarily harmful, but they may be beneficial to mental health and reduce resistance to negative emotions.',
    bold: false,
  },

  { type: 'p', text: 'The potential risks of the research (State explicitly if none)', bold: true },
  { type: 'p', text: 'A) Is there any risk or discomfort?', bold: false },
  {
    type: 'p',
    text:
      'Participants may watch film clips related to sadness, tragedy, or desperation, which may cause them psychological stress or anxiety. To address these concerns, participants may withdraw at any time without consequence.',
    bold: false,
  },
  { type: 'p', text: 'B) How to mitigate it?', bold: false },
  {
    type: 'p',
    text:
      'A clear informed consent will be provided before participants engage in the study, the participants have to read and click the box "I have read the informed consent" before they really start.',
    bold: false,
  },
  {
    type: 'p',
    text:
      'Participation in the project is voluntary. Participants have every right to withdraw from the study at any time without negative consequences. All information related to you will remain confidential and will be identifiable by codes known only to the researcher.',
    bold: false,
  },

  { type: 'p', text: 'Describe how results will be potentially disseminated', bold: true },
  {
    type: 'p',
    text: 'The results will be disseminated as a thesis and an oral presentation',
    bold: false,
  },

  {
    type: 'p',
    text:
      'If you would like to obtain more information about this study, please contact me by email at S1160702@s.eduhk.hk or telephone number 55200393, or my supervisor Dr Lawrence Chan by email at cchilok@eduhk.hk.',
    bold: false,
  },
  {
    type: 'p',
    text:
      'If you have any concerns about the conduct of this research study, please do not hesitate to contact the Human Research Ethics Committee by email at hrec@eduhk.hk or by mail to Research and Development Office, The Education University of Hong Kong.',
    bold: false,
  },

  { type: 'p', text: 'Thank you for your interest in participating in this study.', bold: false },
  { type: 'p', text: 'Lin Jiaquan', bold: false },
];

/**
 * How many questionnaires the site actually shows per sitting. Each study phase
 * (pre / post) renders three embedded forms: CD-RISC-10 and MLQ (the combined,
 * shuffled form) plus the ERQ reappraisal subscale.
 *
 * The information sheet tells participants how many instruments they will complete,
 * so the two must agree — this constant exists so the number is stated in ONE place
 * on this side and can be diffed against the sheet text in review. If the site ever
 * changes how many forms a phase renders, update both the sheet text above (the
 * "CD-RISC-10, MLQ and ERQ" sentence) and `LABELS` in PreTest.tsx / PostTest.tsx.
 *
 * ⚠️ On wording: the sheet names the instruments (CD-RISC-10, MLQ, ERQ) because
 * informed consent has to tell people what they will be asked to do, and the
 * questionnaire pages now name them too ("Pre-Test: MLQ" etc.), so the two sides
 * agree. Between 2026-10-13 and 2026-10-21 the page headings were deliberately
 * numbered instead, to avoid announcing the construct while the participant was
 * answering it. That was reverted on 2026-10-21: the sheet already discloses the
 * instruments earlier in the flow, so hiding the names on the page bought no
 * protection and only made the pages harder to tell apart. See PreTestErq.tsx.
 */
export const INFO_SHEET_PER_PHASE = 3;
