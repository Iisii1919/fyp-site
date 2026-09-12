// 備份檔：sadness 組「5 片段」版本（含 Se7en / 七宗罪）。
// 使用者於 2026-09-09 要求將 sadness 組（原 dark 組）精簡為 4 片段（移除 Se7en / 七宗罪），
// 但要求保留此 5 片段版本，以備未來使用。
//
// 若需還原為 5 片段，將下方 sadnessClips5 陣列貼回 VideoViewer.tsx 的 sadnessClips 即可。
// 注意：此備份為「刪除 Se7en 之前」的原始 5 片段版本；其後使用者曾要求從 Aftersun
// 的中文描述中移除「因為父親那天之後就自殺身亡了」一句，還原時請視需求自行決定是否保留該句。

export interface ClipBackup {
  id: number;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  duration: string;
  src: string;
}

export const sadnessClips5: ClipBackup[] = [
  { id: 1, title: 'Aftersun', titleZh: '日麗', desc: 'A young girl recalls a holiday with her father in Turkey. In the home videos, he often seems quietly withdrawn. She later realises that trip was the last time she saw him, as he died by suicide shortly after. The excerpt here is the scene where she gathers strangers to sing him a birthday song, yet it only deepens his melancholy.', descZh: '女孩在家中找到了小時候與父親去土耳其旅遊的錄像，父親在錄像中總是鬱鬱寡歡，女孩回想起那次是她最後一次見到父親，因為父親那天之後就自殺身亡了。右邊的片段是女孩召集了途人為父親唱生日歌，卻只引來了父親的憂鬱。', duration: '2:23', src: 'aftersun-3.mov' },
  { id: 2, title: 'Didi', titleZh: '弟弟', desc: 'A Chinese-American boy born in the United States struggles deeply with his sense of identity, which leaves him unable to form stable relationships. In a heated argument he unleashes all his anger on his mother, and in his despair he comes to see himself as a disgrace to the family.', descZh: '生於美國的華裔男孩對於自己的身份認同有很大的困惑，使得他很難得到穩定的人際關係。他在一次爭吵中將全部怒氣拋給母親，極度傷心的他認爲自己是家庭的耻辱。', duration: '4:47', src: 'didi-2.mov' },
  { id: 3, title: 'Se7en', titleZh: '七宗罪', desc: 'A dutiful detective finally captures a serial killer. After striking a deal with him, the detective is taken to a remote spot as agreed — when a truck suddenly drives in, delivering the severed head of the detective\'s wife. Consumed by despair, the detective cannot restrain himself from shooting the killer, which is exactly what the murderer intended.', descZh: '盡忠職守的警探抓到了連環殺手，警探與殺手交易按要求去到郊外，一輛貨車突然駛入，送來的竟是警探妻子的頭顱，絕望的警探不能克制自己開槍殺死殺手，正好滿足了殺手的意圖。', duration: '4:21', src: 'seven-2.mov' },
  { id: 4, title: 'Manchester by the Sea', titleZh: '情繫海邊之城', desc: 'After his brother\'s sudden death, he returns to the hometown he had long left behind, and is overwhelmed once more by the guilt he carries for himself. Years ago, a drunken accident sparked a fire that killed his three children; he tried to take his own life but was stopped. To this day he cannot live with his own fault, and cannot bring himself to stay in that town.', descZh: '因爲哥哥突然死亡而回到了離開已久的家鄉，也回想起了對自己的悔恨。當年醉酒意外觸發火災害死了自己三個子女，試圖自殺但被阻止。他到今天也無法忍受自己的過失，無法待在家鄉。', duration: '5:45', src: 'manchester-1.mov' },
  { id: 5, title: 'All About Lily Chou-Chou', titleZh: '青春電幻物語', desc: 'everyday beauty and anguish are intertwined； a girl coerced into prostitution after her weakness is exploited laughs cheerfully, then falls from a great height; the raving of online trolls; a bellowing bully; and a boy who retreats into music to escape reality.', descZh: '日常美好與苦惱交織的畫面；被抓住弱點而被迫援交的女孩歡快地笑著，隨後又從高處墜下;網絡上的瘋言瘋語；咆哮的霸凌者；沉浸於音樂以逃避現實的少年。', duration: '5:10', src: 'lily-chou-1.mov' },
];
