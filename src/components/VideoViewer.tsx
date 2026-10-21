'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParticipant, type Group } from '@/lib/participant';

interface VideoViewerProps {
  onProgress: (progress: number) => void;
  progress: number;
  onAllComplete?: () => void;
  group?: Group;
}

interface Clip {
  id: number;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  duration: string;
  src: string;
}

// sadness 組：原 5 支反思片，2026-09-09 依使用者要求精簡為 4 支（移除 Se7en / 七宗罪）。
// 5 片段備份見 sadnessClips.5clip.backup.ts（sadnessClips5）。
const sadnessClips: Clip[] = [
  { id: 1, title: 'Aftersun', titleZh: '日麗', desc: 'A young girl recalls a holiday with her father in Turkey. In the home videos, he often seems quietly withdrawn. She later realises that trip was the last time she saw him, as he died by suicide shortly after. The excerpt here is the scene where she gathers strangers to sing him a birthday song, yet it only deepens his melancholy.', descZh: '女孩在家中找到了小時候與父親去土耳其旅遊的錄像，父親在錄像中總是鬱鬱寡歡，女孩回想起那次是她最後一次見到父親。右邊的片段是女孩召集了途人為父親唱生日歌，卻只引來了父親的憂鬱。', duration: '2:23', src: 'aftersun-3.mov' },
  { id: 2, title: 'Didi', titleZh: '弟弟', desc: 'A Chinese-American boy born in the United States struggles deeply with his sense of identity, which leaves him unable to form stable relationships. In a heated argument he unleashes all his anger on his mother, and in his despair he comes to see himself as a disgrace to the family.', descZh: '生於美國的華裔男孩對於自己的身份認同有很大的困惑，使得他很難得到穩定的人際關係。他在一次爭吵中將全部怒氣拋給母親，極度傷心的他認爲自己是家庭的耻辱。', duration: '4:47', src: 'didi-2.mov' },
  { id: 3, title: 'Manchester by the Sea', titleZh: '情繫海邊之城', desc: 'After his brother\'s sudden death, he returns to the hometown he had long left behind, and is overwhelmed once more by the guilt he carries for himself. Years ago, a drunken accident sparked a fire that killed his three children; he tried to take his own life but was stopped. To this day he cannot live with his own fault, and cannot bring himself to stay in that town.', descZh: '因爲哥哥突然死亡而回到了離開已久的家鄉，也回想起了對自己的悔恨。當年醉酒意外觸發火災害死了自己三個子女，試圖自殺但被阻止。他到今天也無法忍受自己的過失，無法待在家鄉。', duration: '5:45', src: 'manchester-1.mov' },
  { id: 4, title: 'All About Lily Chou-Chou', titleZh: '青春電幻物語', desc: 'everyday beauty and anguish are intertwined； a girl coerced into prostitution after her weakness is exploited laughs cheerfully, then falls from a great height; the raving of online trolls; a bellowing bully; and a boy who retreats into music to escape reality.', descZh: '日常美好與苦惱交織的畫面；被抓住弱點而被迫援交的女孩歡快地笑著，隨後又從高處墜下;網絡上的瘋言瘋語；咆哮的霸凌者；沉浸於音樂以逃避現實的少年。', duration: '5:10', src: 'lily-chou-1.mov' },
];

// neutral 組 — four short film excerpts (hosted on R2).
// ⚠️ 4 支影片的中英文片名（title / titleZh）已由研究人員從截圖確認為「香港翻譯」版本
// （2026-09-08 提供），請勿修改。中文描述（descZh）與對應英文描述（desc）
// 於 2026-09-12 依使用者提供的最新截圖再次修訂。
// 仍可調整的是 src（檔名）與 duration（影片秒數的 fallback）。
// ⚠️ duration 必須等於檔案實際長度（2026-09-14 用 check-videos.mjs 以真實 Chrome 讀 loadedmetadata 校正過）。
// 原本的 4 個值（1:25 / 2:00 / 2:30 / 2:00）來自早期規格，與 R2 上的檔案不符，已改成實測值。
// 它會顯示在每支片段的時長徽章上，也是 metadata 未載入時進度條／seek 的 fallback，所以不能亂填。
const neutralClips: Clip[] = [
  { id: 1, title: 'Before Sunset', titleZh: '日落巴黎', desc: 'A man and a woman are reluctant to part, lingering even though they will miss their flight. They talk and laugh, and the itinerary no longer matters.', descZh: '男女對彼此依依不捨，即使趕不上飛機也不捨得離開，他們有說有笑，行程早已不重要。', duration: '4:06', src: 'before-sunset-1.mov' },
  { id: 2, title: 'Paris, Texas', titleZh: '德州巴黎', desc: 'A child separated from his mother by his parents\' divorce finally meets her again, and they hold each other tightly. The father chooses to step away, leaving the space to mother and son.', descZh: '因父母離異而與母親分離的孩子終於和母親見面，他們緊緊相擁在一起，而父親則是選擇離開，將空間留給母子。', duration: '2:30', src: 'taxa-paris-1.mov' },
  { id: 3, title: 'The Pursuit of Happyness', titleZh: '尋找快樂的故事', desc: 'A man finally gets the job he has always dreamed of. He hugs his son tightly and sighs that the hardest days are now behind them.', descZh: '男人得到了夢寐以求的工作，他緊緊擁抱兒子，感嘆最辛苦的日子已經過去。', duration: '3:35', src: 'the-pursuit-1.mov' },
  { id: 4, title: 'About Time', titleZh: '真愛每一天', desc: 'A man learns to live in the present. In everyday life, his wife and daughter already make him deeply happy; he decides to stop worrying about what he might miss, and instead welcome a new day.', descZh: '男人學會了活在當下，日常中他的妻女已經令他感到很幸福，他決定不再擔心錯過，而是迎接新的一天。', duration: '3:05', src: 'about-time-1.mov' },
];

// 影片來源：預設走本地 /videos/（開發用）。部署時請設 NEXT_PUBLIC_VIDEO_BASE_URL 指向
// Cloudflare R2 公開基礎網址（例如 https://<bucket>.r2.dev 或自訂網域），即可零頻寬成本、
// 零畫質損失地託管影片，Netlify 不再承擔影片流量。
const VIDEO_BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '').replace(/\/$/, '');
function videoUrl(file: string): string {
  return VIDEO_BASE ? `${VIDEO_BASE}/${file}` : `/videos/${file}`;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 將 "3:00" 解析成秒數，作為 duration 載入前的 fallback
function parseDuration(durationStr: string): number {
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
  }
  return 0;
}

// 雙擊分區：左 1/3 倒退、中間 1/3 播放暫停、右 1/3 前進（同 YouTube 手機版）。
type TapZone = 'left' | 'center' | 'right';

// 雙擊後短暫顯示的回饋圖示種類。
type FlashKind = 'play' | 'pause' | 'forward' | 'back';

// 兩次點擊要在這個時間內、且在同一區，才算雙擊。
// ⚠️ 這個值同時是「單擊延遲」—— 太短會讓從容的雙擊被當成兩次單擊（變成播→停），
//    太長會讓單擊感覺遲鈍。280ms 是實務上常見的折衷。
const DOUBLE_TAP_MS = 280;

/** 雙擊回饋的圖示。用 SVG 而不是 emoji，避免各平台字型差異。 */
function FlashIcon({ kind }: { kind: FlashKind }) {
  if (kind === 'play') {
    return (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  if (kind === 'pause') {
    return (
      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
      </svg>
    );
  }
  // forward / back：雙箭頭 + 10（跟 YouTube 的提示一致）
  const flip = kind === 'back';
  return (
    <span className="flex items-center gap-1.5">
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <path d="M5 6l6 6-6 6zM12 6l6 6-6 6z" />
      </svg>
      <span className="text-sm font-semibold tabular-nums">10</span>
    </span>
  );
}

// 單個全屏視頻播放器
function VideoPlayer({  clip,
  index,
  total,
  isCompleted,
  onComplete,
}: {
  clip: Clip;
  index: number;
  total: number;
  isCompleted: boolean;
  onComplete: (id: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // 緩衝中：影片檔案很大（單支 371–648 MB），按下播放後要等幾秒才真的動起來。
  // 沒有這個指示，參與者會以為「按了沒反應」而重複點擊 —— 那正是
  // AbortError 的觸發情境，也是使用者回報「一開始播放不了」的真正體感。
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 手勢：單擊播放/暫停、雙擊分區（左 -10s ／ 中 播放暫停 ／ 右 +10s）。
  // 用短延遲區分單擊與雙擊，避免雙擊被當成兩次單擊而連續 toggle。
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 上一次點擊的時間與分區。**必須同一區**才算雙擊（跟 YouTube 一致）——
  // 若不分區，使用者在左邊點一下、右邊再點一下就會被誤判成雙擊而跳 10 秒。
  const lastTapRef = useRef<{ time: number; zone: TapZone } | null>(null);
  // 雙擊後的視覺回饋（像 YouTube 中間浮現的播放/暫停、±10 秒圖示）。
  const [gestureFlash, setGestureFlash] = useState<{ id: number; kind: FlashKind } | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 播放／暫停切換。
   *
   * 🔴 兩個地方很容易寫錯，都會產生使用者看得到的錯誤：
   *
   * 1. **一定要判斷 `v.paused`（影片的真實狀態），不要用 `isPlaying` state。**
   *    `isPlaying` 是「上一次操作後我們以為的狀態」。這些影片檔很大
   *    （單支 371–648 MB，實測），按下播放後 `play()` 的 Promise 可能
   *    **pending 好幾秒**在等緩衝。此時 `isPlaying` 已經被設成 true，
   *    但影片實際上還是 paused。使用者看畫面沒動就會**再點一次**，
   *    於是走進 `pause()` 分支 → **中斷尚未完成的 play()**
   *    → 瀏覽器丟 `AbortError: The play() request was interrupted by a call to pause()`。
   *    這正是 2026-10-21 使用者回報的那個錯誤。
   *
   * 2. **`play()` 回傳 Promise，必須接住 rejection。**
   *    沒接住就會變成 unhandled promise rejection ——
   *    dev 模式會直接跳出紅色錯誤覆蓋層（使用者看到的就是那個）。
   *    ⚠️ 生產環境不會顯示覆蓋層，但錯誤仍然存在，只是安靜地進 console。
   *
   * 另外不再手動 `setIsPlaying`：`onPlay` / `onPause` 事件才是真實來源，
   * 手動設值只會讓 state 與實際狀態不同步。
   */
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {
        /* 被後續的 pause() 中斷、或瀏覽器拒絕（無使用者手勢）都在預期內 */
      });
    } else {
      v.pause();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 顯示雙擊回饋圖示（0.6 秒後自動消失）。
  const showFlash = useCallback((kind: FlashKind) => {
    setGestureFlash({ id: Date.now(), kind });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setGestureFlash(null), 600);
  }, []);

  // 相對快進／倒退（與鍵盤左右鍵共用同樣的 10 秒與邊界處理）。
  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const total = (v.duration && isFinite(v.duration)) ? v.duration : parseDuration(clip.duration);
    const max = total > 0 ? total : Infinity;
    v.currentTime = Math.max(0, Math.min(max, v.currentTime + delta));
    setCurrentTime(v.currentTime);
  }, [clip.duration]);

  /**
   * 播放器上的所有點擊都走這裡（pointerdown），不再用 onClick / onDoubleClick。
   *
   * 為什麼統一在 pointerdown：
   *   同一個手勢若同時掛 onClick 與 onPointerDown，觸控裝置會**兩邊都觸發**
   *   （觸控會依序送出 pointerdown → click），變成一次點擊做兩件事。
   *   收斂成單一入口就沒有這個問題，而且 pointerdown 反應更即時。
   *
   * 分區規則：容器寬度切成左 35% / 中 30% / 右 35%。
   *   * 單擊（任一區）→ 播放 / 暫停（維持原本行為，最直覺）
   *   * 雙擊中間     → 播放 / 暫停
   *   * 雙擊右邊     → 前進 10 秒
   *   * 雙擊左邊     → 倒退 10 秒
   *
   * ⚠️ 滑鼠的雙擊**維持原本的全螢幕**（桌面版 YouTube 的慣例），
   *    分區手勢只在觸控裝置啟用。使用者明確擔心電腦版行為被改掉。
   */
  const handlePlayerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = (e.clientX - rect.left) / rect.width;
    const zone: TapZone = frac < 0.35 ? 'left' : frac > 0.65 ? 'right' : 'center';
    const isTouch = e.pointerType !== 'mouse';
    const now = Date.now();
    const last = lastTapRef.current;
    const isDouble = !!last && now - last.time < DOUBLE_TAP_MS && last.zone === zone;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (isDouble) {
      lastTapRef.current = null;

      // 滑鼠：雙擊 = 全螢幕（桌面慣例，維持不變）
      if (!isTouch) {
        toggleFullscreen();
        return;
      }

      if (zone === 'center') {
        const v = videoRef.current;
        if (!v) return;
        const willPause = !v.paused;
        if (willPause) v.pause();
        else v.play().catch(() => {});
        showFlash(willPause ? 'pause' : 'play');
      } else if (zone === 'right') {
        seekBy(10);
        showFlash('forward');
      } else {
        seekBy(-10);
        showFlash('back');
      }
      return;
    }

    // 第一次點擊：先記下來，若在 DOUBLE_TAP_MS 內沒有第二次才當成單擊。
    lastTapRef.current = { time: now, zone };
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      lastTapRef.current = null;
      togglePlay();
    }, DOUBLE_TAP_MS);
  };

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete(clip.id);
  }, [clip.id, onComplete]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDraggingProgress) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isDraggingProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const seekTo = useCallback((clientX: number) => {
    if (!progressRef.current || !videoRef.current) return;
    // 使用真實 duration，若無則用 clip 標示的時長作 fallback（解決 metadata 沒載入時進度條無效的問題）
    const total = (duration && isFinite(duration)) ? duration : parseDuration(clip.duration);
    if (!total) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * total;
    setCurrentTime(ratio * total);
  }, [duration, clip.duration]);

  const setVolumeTo = useCallback((clientX: number, barRef: React.RefObject<HTMLDivElement | null>) => {
    if (!barRef.current || !videoRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.volume = ratio;
    videoRef.current.muted = ratio === 0;
    setVolume(ratio);
    setIsMuted(ratio === 0);
  }, []);

  // 進度條拖動（用 pointer 事件，覆寫整個文檔直到釋放）
  useEffect(() => {
    if (!isDraggingProgress) return;
    const handleMove = (e: PointerEvent) => { e.preventDefault(); seekTo(e.clientX); };
    const handleUp = () => setIsDraggingProgress(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [isDraggingProgress, seekTo]);

  // 音量條拖動（同上，pointer 事件）
  const volumeBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isDraggingVolume) return;
    const handleMove = (e: PointerEvent) => { e.preventDefault(); setVolumeTo(e.clientX, volumeBarRef); };
    const handleUp = () => setIsDraggingVolume(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [isDraggingVolume, setVolumeTo]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  }, [isPlaying]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 元件卸載時清掉手勢計時器。
  // ⚠️ 一定要清：單擊是延遲 280ms 才執行 togglePlay，若參與者在這段時間內
  //    捲動離開／跳頁，殘留的 timer 會在已卸載的元件上呼叫 play()/pause()。
  useEffect(
    () => () => {
      if (clickTimerRef.current) { clearTimeout(clickTimerRef.current); clickTimerRef.current = null; }
      if (flashTimerRef.current) { clearTimeout(flashTimerRef.current); flashTimerRef.current = null; }
    },
    [],
  );

  // 監聽本視頻是否進入視圖（僅當前可見的視頻才響應鍵盤左右鍵）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 鍵盤左右鍵：每次加 / 減 10 秒
  useEffect(() => {
    if (!isInView) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const v = videoRef.current;
      if (!v) return;
      const total = (v.duration && isFinite(v.duration)) ? v.duration : parseDuration(clip.duration);
      const max = total > 0 ? total : Infinity;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        v.currentTime = Math.min(max, v.currentTime + 10);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isInView]);

  // 所有視頻都用左右分欄佈局；奇數位（1,3,5）文字左/視頻右，偶數位（2,4）視頻左/文字右
  const textOnLeft = index % 2 === 0;
  // 進度百分比：優先用真實 duration；若 metadata 未載入或為 0/Infinity，
  // 則退回 clip 標示的時長，避免進度條永遠停在 0
  const totalDuration = (duration && isFinite(duration) && duration > 0) ? duration : parseDuration(clip.duration);
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // YouTube 風格控制條
  const controlsEl = (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
          onMouseMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          // ⚠️ 一定要擋 pointerdown：播放器容器是用 pointerdown 判斷手勢的，
          //    只擋 onClick 的話，點「播放」按鈕會**同時**觸發容器的手勢邏輯，
          //    變成按下按鈕後又排了一次 toggle → 播放後立刻被暫停。
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* 進度條 */}
          <div
            ref={progressRef}
            className="group/progress relative h-2 mx-3 mt-2 cursor-pointer rounded-full"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              setIsDraggingProgress(true);
              seekTo(e.clientX);
            }}
            onPointerMove={(e) => {
              if (isDraggingProgress) return;
              const total = (duration && isFinite(duration)) ? duration : parseDuration(clip.duration);
              if (!total || !progressRef.current) return;
              const rect = progressRef.current.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoverX(e.clientX - rect.left);
              setHoverTime(ratio * total);
            }}
            onPointerLeave={() => { setHoverTime(null); setHoverX(null); }}
          >
            <div className="absolute inset-0 bg-white/25 rounded-full" />
            <div
              className="absolute left-0 top-0 h-full bg-[#d4bfff] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#d4bfff] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
            {/* 懸停時顯示時間（YouTube 風格） */}
            {hoverTime !== null && hoverX !== null && (
              <div
                className="absolute -top-8 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium tabular-nums pointer-events-none whitespace-nowrap"
                style={{ left: hoverX, transform: 'translateX(-50%)' }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* 控制按鈕行 */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              {/* 播放/暫停 */}
              <button
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              {/* 音量控制 */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                  )}
                </button>
                <div
                  ref={volumeBarRef}
                  className="w-20 h-2 bg-white/25 rounded-full cursor-pointer overflow-hidden relative flex-shrink-0"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                    setIsDraggingVolume(true);
                    setVolumeTo(e.clientX, volumeBarRef);
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-white rounded-full"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  />
                </div>
              </div>

              {/* 時間顯示 */}
              <span className="text-white/90 text-xs font-medium tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 標題 */}
              <span className="text-white/70 text-xs font-medium truncate max-w-[200px] hidden sm:block">{clip.title} · {clip.titleZh}</span>
              {/* 全屏 */}
              <button
                onClick={toggleFullscreen}
                className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
                title={isFullscreen ? 'Exit Fullscreen / 退出全屏' : 'Fullscreen / 全屏'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 視頻播放器元素
  const videoPlayerEl = (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative flex items-center justify-center rounded-xl overflow-hidden cursor-pointer group"
      style={{
        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,168,248,0.1)',
        background: '#000000',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      // 所有點擊（單擊／雙擊、觸控／滑鼠）都收斂到這一個 handler，
      // 理由見 handlePlayerPointerDown 的說明。
      onPointerDown={handlePlayerPointerDown}
    >
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full h-auto block"
          src={videoUrl(clip.src) || undefined}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => { setIsPlaying(false); setIsBuffering(false); }}
          // 緩衝狀態：waiting 開始等資料、playing/canplay 表示可以跑了。
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onVolumeChange={handleVolumeChange}
          playsInline
          preload="metadata"
        />

      </div>

      {/* 緩衝指示：影片檔很大，按下播放後要等幾秒才動。
          沒有這個，參與者會以為「按了沒反應」而重複點擊。
          pointer-events-none 同樣必要，否則會吃掉點擊。 */}
      {isBuffering && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center gap-2 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            role="status"
            aria-live="polite"
          >
            <span
              className="block w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid rgba(198,168,248,0.25)', borderTopColor: '#C6A8F8' }}
              aria-hidden
            />
            <span className="text-[#EAECEF] text-xs">載入中… Loading</span>
          </div>
        </div>
      )}

      {/* 雙擊回饋（YouTube 風格）：中間浮現播放／暫停，兩側浮現 ±10 秒。
          pointer-events-none 是必要的 —— 否則這個覆蓋層會吃掉第二次點擊，
          雙擊就永遠偵測不到。 */}
      {gestureFlash && (
        <motion.div
          key={gestureFlash.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <div
            className={`flex items-center justify-center rounded-full ${gestureFlash.kind === 'forward' || gestureFlash.kind === 'back' ? 'px-5 py-3' : 'w-20 h-20'}`}
            style={{ background: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
          >
            <FlashIcon kind={gestureFlash.kind} />
          </div>
        </motion.div>
      )}

      {controlsEl}
    </motion.div>
  );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative scroll-snap-start"
      style={{ background: index % 2 === 0
        ? 'radial-gradient(ellipse at 30% 50%, #545454 0%, #4a4a4a 60%, #3d3d3d 100%)'
        : 'radial-gradient(ellipse at 70% 50%, #565656 0%, #4a4a4a 60%, #3d3d3d 100%)'
      }}
    >
      {/* 環境光 */}
      <div className="ambient-glow" style={{
        width: '500px', height: '500px',
        background: `radial-gradient(circle, rgba(198,168,248,${index % 2 === 0 ? 0.07 : 0.05}) 0%, transparent 70%)`,
        top: '10%', right: index % 2 === 0 ? '5%' : 'auto', left: index % 2 === 0 ? 'auto' : '5%',
      }} />

      {/* 棕色裝飾（右側） */}
      <div
        className="absolute pointer-events-none opacity-25"
        style={{
          width: '15%',
          height: '100%',
          top: 0,
          right: 0,
          background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      />

      {/* 所有視頻：左右分欄佈局（整體靠右），奇偶交替文字/視頻位置 */}
      {
        <div className="w-full lg:w-[84%] lg:ml-auto flex items-center gap-12 px-12 md:px-20 lg:px-24 relative z-10">
          {/* 文字欄：標題 + 描述 */}
          <div className={`flex-1 max-w-lg ${textOnLeft ? 'order-1' : 'order-2'}`}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                    isCompleted ? 'text-[#3d3d3d]' : 'text-[#d4bfff] border border-[rgba(198,168,248,0.34)]'
                  }`}
                  style={isCompleted ? { background: 'linear-gradient(135deg, #d4bfff, #9b7fd4)' } : { background: 'rgba(198,168,248,0.1)' }}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : clip.id}
                </div>
                <div className="text-[#9a9a9a] text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {clip.duration}
                </div>
              </div>
              <h2 className="font-serif italic text-[#EAECEF] text-2xl md:text-3xl font-semibold underline decoration-[#C6A8F8] decoration-2 underline-offset-4">
                {clip.title} <span className="text-[#C6A8F8]">{clip.titleZh}</span>
              </h2>
            </motion.div>

            {/* 描述 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-left"
            >
              {clip.desc && (
                <p className="font-serif font-semibold text-[#d8d2cb] text-[15px] leading-relaxed tracking-wide indent-[2em]">{clip.desc}</p>
              )}
              <p className="font-serif font-medium text-[#b0a89e] text-sm mt-3 leading-relaxed tracking-wide indent-[2em]">{clip.descZh}</p>
            </motion.div>
          </div>

          {/* 視頻播放器欄（適當大小） */}
          <div className={`flex-1 max-w-4xl ${textOnLeft ? 'order-2' : 'order-1'}`}>
            {videoPlayerEl}
          </div>
        </div>
      }

      {/* 滾動提示（最後一個視頻不顯示） */}
      {index < total - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#9a9a9a]">Scroll for next video</span>
          <span className="text-[9px] text-[#8a8a8a]">向下滾動觀看下一段影片</span>
          <div className="w-5 h-9 rounded-full border border-[rgba(198,168,248,0.3)] flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-[#d4bfff]"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 視頻之間的過渡頁
function TransitionPage({ nextClip, nextIndex }: { nextClip: Clip; nextIndex: number }) {
  return (
    <div
      className="h-screen w-full flex items-center justify-center relative scroll-snap-start overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #4a4a4a 0%, #3d3d3d 100%)' }}
    >
      {/* 環境光 */}
      <div className="ambient-glow" style={{
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(198,168,248,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10 px-6"
      >
        <p className="text-[#9a9a9a] text-xs tracking-[0.3em] uppercase mb-4">Next Up · 接下來</p>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, rgba(198,168,248,0.15), rgba(198,168,248,0.05))', border: '1px solid rgba(198,168,248,0.3)' }}>
          <span className="text-[#d4bfff] font-serif text-2xl font-bold">{nextIndex + 1}</span>
        </div>
        <h2 className="font-serif italic text-[#EAECEF] text-3xl md:text-4xl font-bold mb-2">{nextClip.title}</h2>
        <p className="text-[#C6A8F8] text-lg font-serif italic mb-6">{nextClip.titleZh}</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function VideoViewer({ onProgress, progress, onAllComplete, group }: VideoViewerProps) {
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const participant = useParticipant();

  // 選擇播放清單：neutral 組播 4 支短片，sadness 組播 4 支反思片。
  // 優先使用 props 傳入的 group，否則從 ParticipantContext 讀取既有分配。
  const resolvedGroup = group ?? participant?.group ?? 'sadness';
  const clips = resolvedGroup === 'neutral' ? neutralClips : sadnessClips;

  // 進度更新和全部完成的回調必須放在 effect 裡，
  // 不能寫在 setState updater 內（React 18 會在渲染期間呼叫 updater，
  // 從而導致 "Cannot update a component while rendering a different component" 錯誤）
  const handleComplete = useCallback((id: number) => {
    setCompletedVideos(prev => 
      prev.includes(id) ? prev : [...prev, id]
    );
  }, []);

  useEffect(() => {
    onProgress((completedVideos.length / clips.length) * 100);
    if (completedVideos.length === clips.length && onAllComplete) {
      onAllComplete();
    }
  }, [completedVideos, onProgress, onAllComplete]);

  const allCompleted = completedVideos.length === clips.length;

  return (
    <div className="w-full relative" ref={rootRef}>
      {/* 頂部進度指示 */}
      <div className="sticky top-0 z-50 pointer-events-none">
        <div className="h-0.5 w-full bg-[rgba(255,255,255,0.05)]">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #9b7fd4, #C6A8F8, #d4bfff)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Enjoy the Journey 歡迎頁 */}
      <div className="h-screen w-full relative overflow-hidden no-snap" style={{ background: 'radial-gradient(ellipse at center, #545454 0%, #3d3d3d 70%)' }}>
        <div className="ambient-glow" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(198,168,248,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 px-4 w-full max-w-2xl"
        >
          <h1 className="font-serif font-bold text-accent-gradient text-4xl md:text-6xl mb-4 tracking-wide text-center">
            Enjoy the Journey
          </h1>
          <p className="text-[#C6A8F8] text-lg md:text-xl font-serif mb-2 text-center">享受這段旅程</p>
          <p className="text-[#9a9a9a] text-sm mb-4 text-center">
            You are about to watch {clips.length} short film excerpts. Take your time, and scroll down when you are ready.
          </p>
          <p className="text-[#8a8a8a] text-xs mb-10 text-center">
            你即將觀看 {clips.length} 個短片片段。請慢慢觀賞，準備好後向下滾動。
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* 5 個視頻 + 過渡頁 */}
      {clips.map((clip, index) => (
        <div key={clip.id}>
          <VideoPlayer
            clip={clip}
            index={index}
            total={clips.length}
            isCompleted={completedVideos.includes(clip.id)}
            onComplete={handleComplete}
          />
          {index < clips.length - 1 && (
            <TransitionPage nextClip={clips[index + 1]} nextIndex={index + 1} />
          )}
        </div>
      ))}

      {/* 全部完成提示 */}
      {allCompleted && (
        <div className="h-screen w-full flex items-center justify-center relative scroll-snap-start" style={{ background: 'radial-gradient(ellipse at center, #505050 0%, #3d3d3d 100%)' }}>
          {/* 棕色裝飾 */}
          <div
            className="absolute bottom-0 right-0 h-full w-[22%] opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #3c2d1e 0%, #2d1e0f 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8" style={{ background: 'linear-gradient(135deg, #d4bfff, #9b7fd4)', boxShadow: '0 0 60px rgba(198,168,248,0.32)' }}>
              <svg className="w-10 h-10 text-[#3d3d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-serif text-[#EAECEF] text-3xl md:text-4xl font-bold mb-3">All Videos Completed</h2>
            <p className="text-[#C6A8F8] text-lg mb-2">全部影片已完成</p>
            <p className="text-[#9a9a9a] text-sm mb-8">You may now proceed to the post-viewing feedback and questionnaires.</p>
            <p className="text-[#8a8a8a] text-xs mb-8">你現在可以繼續填寫觀後回饋與後測問卷。</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              <svg className="w-6 h-6 text-[#d4bfff] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* 視頻與問卷之間的大間隔（吸附點） */}
      <div className="h-[75vh] w-full flex items-center justify-center relative overflow-hidden scroll-snap-start">
        <div className="ambient-glow" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(198,168,248,0.06) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <svg className="w-8 h-8 text-[#9a9a9a] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>
          <p className="text-[#8a8a8a] text-xs tracking-[0.3em] uppercase">Questionnaire Ahead</p>
          <p className="text-[#7a7a7a] text-[10px] mt-1 tracking-wider">問卷就在前方</p>
        </div>
      </div>
    </div>
  );
}
