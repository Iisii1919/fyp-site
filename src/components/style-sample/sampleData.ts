// Sample-only content. Deliberately a COPY of the wording that already exists
// on the live site, so that what the user is comparing is *style*, not new copy.
// Nothing in this file is imported by the live site.
//
// Sources mirrored:
//   * class list        -> src/components/VideoViewer.tsx (sadnessClips / neutralClips)
//   * project metadata  -> src/components/data/infoSheet.ts
//   * consent statement -> src/components/data/consentForm.ts
//   * ERQ items         -> build_erq.js in the workspace root

export const VIDEO_BASE = 'https://pub-6560cd0b7f214bf8a5e6476cfdb4afa9.r2.dev';

export interface SampleClip {
  id: number;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  duration: string;
  src: string;
  year: string;
}

export const SADNESS_CLIPS: SampleClip[] = [
  {
    id: 1,
    title: 'Aftersun',
    titleZh: '日麗',
    year: '2022',
    desc:
      'A young girl recalls a holiday with her father in Turkey. In the home videos he often seems quietly withdrawn. She later realises that trip was the last time she saw him. The excerpt is the scene where she gathers strangers to sing him a birthday song, yet it only deepens his melancholy.',
    descZh: '女孩在家中找到了小時候與父親去土耳其旅遊的錄像，父親在錄像中總是鬱鬱寡歡。',
    duration: '2:23',
    src: 'aftersun-3.mov',
  },
  {
    id: 2,
    title: 'Didi',
    titleZh: '弟弟',
    year: '2024',
    desc:
      'A Chinese-American boy struggles deeply with his sense of identity, which leaves him unable to form stable relationships. In a heated argument he unleashes all his anger on his mother, and in his despair he comes to see himself as a disgrace to the family.',
    descZh: '生於美國的華裔男孩對於自己的身份認同有很大的困惑，他在一次爭吵中將全部怒氣拋給母親。',
    duration: '4:47',
    src: 'didi-2.mov',
  },
  {
    id: 3,
    title: 'Manchester by the Sea',
    titleZh: '情繫海邊之城',
    year: '2016',
    desc:
      'After his brother\u2019s sudden death he returns to the hometown he had long left behind, and is overwhelmed once more by guilt. Years ago a drunken accident sparked a fire that killed his three children. To this day he cannot live with his own fault, and cannot bring himself to stay in that town.',
    descZh: '因爲哥哥突然死亡而回到了離開已久的家鄉，也回想起了對自己的悔恨。',
    duration: '5:45',
    src: 'manchester-1.mov',
  },
  {
    id: 4,
    title: 'All About Lily Chou-Chou',
    titleZh: '青春電幻物語',
    year: '2001',
    desc:
      'Everyday beauty and anguish are intertwined: a girl coerced into prostitution after her weakness is exploited laughs cheerfully, then falls from a great height; the raving of online trolls; a bellowing bully; and a boy who retreats into music to escape reality.',
    descZh: '日常美好與苦惱交織的畫面；被抓住弱點而被迫援交的女孩歡快地笑著，隨後又從高處墜下。',
    duration: '5:10',
    src: 'lily-chou-1.mov',
  },
];

export const PROJECT = {
  titleEn: 'The Influence of Sadness Film on Enhancing Psychological Resilience and the Meaning of Life',
  titleZh: '傷感電影對增強心理韌性的影響',
  researcher: 'Lin Jiaquan',
  researcherZh: '林家權',
  supervisor: 'Dr Lawrence Chan',
  dept: 'Department of Psychology',
  institution: 'The Education University of Hong Kong',
  email: 's1160702@s.eduhk.hk',
  supervisorEmail: 'cchilok@eduhk.hk',
  ethicsEmail: 'hrec@eduhk.hk',
  participantId: 'FYP-7K2M9QX4TB',
};

/** The four consent statements, EN + ZH, exactly as the live consent form has them. */
export const CONSENT_STATEMENTS: { en: string; zh: string }[] = [
  {
    en: 'I, hereby consent to participate in the captioned research supervised by Dr Lawrence Chan and conducted by LIN Jiaquan, who are staff and student of the Department of Psychology in The Education University of Hong Kong.',
    zh: '本人同意參加由陳志樂博士負責監督，林家權負責執行的研究項目。她／他們是香港教育大學心理學系的教員和學生。',
  },
  {
    en: 'I understand that information obtained from this research may be used in future research and may be published. However, my right to privacy will be retained, i.e., my personal details will not be revealed.',
    zh: '本人理解此研究所獲得的資料可用於未來的研究和學術發表。然而本人有權保護本人的隱私，本人的個人資料將不能洩漏。',
  },
  {
    en: 'The procedure as set out in the attached information sheet has been fully explained. I understand the benefits and risks involved. My participation in the project is voluntary.',
    zh: '研究員已將所附資料的有關步驟向本人作了充分的解釋。本人理解可能會出現的風險。本人是自願參與這項研究。',
  },
  {
    en: 'I acknowledge that I have the right to question any part of the procedure and can withdraw at any time without negative consequences.',
    zh: '本人理解本人有權在研究過程中提出問題，並在任何時候決定退出研究。',
  },
];

/** A few ERQ reappraisal items, verbatim, to demonstrate the scale treatment. */
export const ERQ_SAMPLE = [
  {
    n: '01',
    en: 'When I want to feel more positive emotion, I change the way I\u2019m thinking about the situation.',
    zh: '當我想感受更多正向情緒時，我會改變我對當下情境的想法。',
  },
  {
    n: '03',
    en: 'When I want to feel less negative emotion, I change the way I\u2019m thinking about the situation.',
    zh: '當我想減少負向情緒時，我會改變我對當下情境的想法。',
  },
  {
    n: '05',
    en: 'When I\u2019m faced with a stressful situation, I make myself think about it in a way that helps me stay calm.',
    zh: '當我面對壓力情境時，我會讓自己以有助於保持平靜的方式思考它。',
  },
];
