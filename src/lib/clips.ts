/**
 * 影片片段資料 —— **影片頁與「觀後回饋」頁共用同一份**。
 *
 * ⚠️ 為什麼抽到這裡：影片頁要播放、回饋頁要顯示劇情回顧，兩邊必須一致。
 *    留在 VideoViewer.tsx 裡面會變成兩處各有一份，改文案時一定不同步。
 *    **只有這一份，改這裡就好。**
 */

export interface Clip {
  id: number;
  title: string;
  titleZh: string;
  /** 影片頁顯示的完整描述。 */
  desc: string;
  descZh: string;
  duration: string;
  src: string;
  /**
   * 「觀後回饋」頁的一行劇情提醒（英文）。
   *
   * 🔴 撰寫原則（刻意這樣，不要改壞）：
   *   - **只寫劇情**，不寫情緒評價、不寫「這是一部悲傷／開心的電影」。
   *     回饋頁要在參與者回答前**避免給框架**，否則會影響他們怎麼描述感受。
   *   - **不提組別**（不要出現 sadness / neutral 這類字）。
   *   - 一句為限，讓回饋頁不會變成一堵字牆。
   */
  recall: string;
  /** 同上，中文。 */
  recallZh: string;
}

// sadness 組：原 5 支反思片，2026-09-09 依使用者要求精簡為 4 支（移除 Se7en / 七宗罪）。
// 5 片段備份見 sadnessClips.5clip.backup.ts（sadnessClips5）。
export const sadnessClips: Clip[] = [
  {
    id: 1,
    title: 'Aftersun',
    titleZh: '日麗',
    desc: 'A young girl recalls a holiday with her father in Turkey. In the home videos, he often seems quietly withdrawn. She later realises that trip was the last time she saw him, as he died by suicide shortly after. The excerpt here is the scene where she gathers strangers to sing him a birthday song, yet it only deepens his melancholy.',
    descZh: '女孩在家中找到了小時候與父親去土耳其旅遊的錄像，父親在錄像中總是鬱鬱寡歡，女孩回想起那次是她最後一次見到父親。右邊的片段是女孩召集了途人為父親唱生日歌，卻只引來了父親的憂鬱。',
    duration: '2:23',
    src: 'aftersun-3.mov',
    recall: 'A daughter looks back on holiday footage of her father in Turkey; the birthday song she arranges for him does not lift his mood.',
    recallZh: '女兒重看與父親在土耳其度假的錄像；她為父親安排的生日歌並沒有讓他開朗起來。',
  },
  {
    id: 2,
    title: 'Didi',
    titleZh: '弟弟',
    desc: 'A Chinese-American boy born in the United States struggles deeply with his sense of identity, which leaves him unable to form stable relationships. In a heated argument he unleashes all his anger on his mother, and in his despair he comes to see himself as a disgrace to the family.',
    descZh: '生於美國的華裔男孩對於自己的身份認同有很大的困惑，使得他很難得到穩定的人際關係。他在一次爭吵中將全部怒氣拋給母親，極度傷心的他認爲自己是家庭的耻辱。',
    duration: '4:47',
    src: 'didi-2.mov',
    recall: 'A Chinese-American teenager struggles with who he is, and during one argument turns all his anger on his mother.',
    recallZh: '華裔少年對自己的身份感到困惑，在一次爭執中把怒氣全發在母親身上。',
  },
  {
    id: 3,
    title: 'Manchester by the Sea',
    titleZh: '情繫海邊之城',
    desc: "After his brother's sudden death, he returns to the hometown he had long left behind, and is overwhelmed once more by the guilt he carries for himself. Years ago, a drunken accident sparked a fire that killed his three children; he tried to take his own life but was stopped. To this day he cannot live with his own fault, and cannot bring himself to stay in that town.",
    descZh: '因爲哥哥突然死亡而回到了離開已久的家鄉，也回想起了對自己的悔恨。當年醉酒意外觸發火災害死了自己三個子女，試圖自殺但被阻止。他到今天也無法忍受自己的過失，無法待在家鄉。',
    duration: '5:45',
    src: 'manchester-1.mov',
    recall: 'After his brother dies he returns to his hometown, where memories surface of the fire that killed his three children.',
    recallZh: '哥哥離世後回到家鄉，往事隨之浮現：一場火災奪去了他的三個孩子。',
  },
  {
    id: 4,
    title: 'All About Lily Chou-Chou',
    titleZh: '青春電幻物語',
    desc: 'everyday beauty and anguish are intertwined； a girl coerced into prostitution after her weakness is exploited laughs cheerfully, then falls from a great height; the raving of online trolls; a bellowing bully; and a boy who retreats into music to escape reality.',
    descZh: '日常美好與苦惱交織的畫面；被抓住弱點而被迫援交的女孩歡快地笑著，隨後又從高處墜下;網絡上的瘋言瘋語；咆哮的霸凌者；沉浸於音樂以逃避現實的少年。',
    duration: '5:10',
    src: 'lily-chou-1.mov',
    recall: 'Fragments of adolescence: a girl who is exploited and later falls from a height, taunts online, a bully, and a boy who retreats into music.',
    recallZh: '青春期的片段：被利用的女孩後來從高處墜下、網絡上的嘲諷、霸凌者，以及躲進音樂裡的少年。',
  },
];

// neutral 組 — four short film excerpts (hosted on R2).
// ⚠️ 4 支影片的中英文片名（title / titleZh）已由研究人員從截圖確認為「香港翻譯」版本
// （2026-09-08 提供），請勿修改。中文描述（descZh）與對應英文描述（desc）
// 於 2026-09-12 依使用者提供的最新截圖再次修訂。
// 仍可調整的是 src（檔名）與 duration（影片秒數的 fallback）。
// ⚠️ duration 必須等於檔案實際長度（2026-09-14 用 check-videos.mjs 以真實 Chrome 讀 loadedmetadata 校正過）。
// 原本的 4 個值（1:25 / 2:00 / 2:30 / 2:00）來自早期規格，與 R2 上的檔案不符，已改成實測值。
// 它會顯示在每支片段的時長徽章上，也是 metadata 未載入時進度條／seek 的 fallback，所以不能亂填。
export const neutralClips: Clip[] = [
  {
    id: 1,
    title: 'Before Sunset',
    titleZh: '日落巴黎',
    desc: 'A man and a woman are reluctant to part, lingering even though they will miss their flight. They talk and laugh, and the itinerary no longer matters.',
    descZh: '男女對彼此依依不捨，即使趕不上飛機也不捨得離開，他們有說有笑，行程早已不重要。',
    duration: '4:06',
    src: 'before-sunset-1.mov',
    recall: 'Two people keep talking and laughing, unwilling to part even if it means missing their flight.',
    recallZh: '兩人有說有笑、捨不得分開，即使趕不上飛機也不在意。',
  },
  {
    id: 2,
    title: 'Paris, Texas',
    titleZh: '德州巴黎',
    desc: "A child separated from his mother by his parents' divorce finally meets her again, and they hold each other tightly. The father chooses to step away, leaving the space to mother and son.",
    descZh: '因父母離異而與母親分離的孩子終於和母親見面，他們緊緊相擁在一起，而父親則是選擇離開，將空間留給母子。',
    duration: '2:30',
    src: 'taxa-paris-1.mov',
    recall: 'A child separated from his mother by divorce finally meets her again; the father steps back and leaves them together.',
    recallZh: '因父母離異而與母親分開的孩子終於再見到她；父親退開，把空間留給母子。',
  },
  {
    id: 3,
    title: 'The Pursuit of Happyness',
    titleZh: '尋找快樂的故事',
    desc: 'A man finally gets the job he has always dreamed of. He hugs his son tightly and sighs that the hardest days are now behind them.',
    descZh: '男人得到了夢寐以求的工作，他緊緊擁抱兒子，感嘆最辛苦的日子已經過去。',
    duration: '3:35',
    src: 'the-pursuit-1.mov',
    recall: 'A father finally gets the job he has been hoping for, and hugs his son.',
    recallZh: '父親終於得到夢寐以求的工作，緊緊擁抱兒子。',
  },
  {
    id: 4,
    title: 'About Time',
    titleZh: '真愛每一天',
    desc: 'A man learns to live in the present. In everyday life, his wife and daughter already make him deeply happy; he decides to stop worrying about what he might miss, and instead welcome a new day.',
    descZh: '男人學會了活在當下，日常中他的妻女已經令他感到很幸福，他決定不再擔心錯過，而是迎接新的一天。',
    duration: '3:05',
    src: 'about-time-1.mov',
    recall: 'A man decides to stop worrying about what he might miss, and to enjoy ordinary days with his wife and daughter.',
    recallZh: '男人決定不再擔心錯過什麼，好好享受與妻女共度的平常日子。',
  },
];
