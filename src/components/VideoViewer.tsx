'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoViewerProps {
  onProgress: (progress: number) => void;
  progress: number;
}

const videoClips = [
  { id: 1, title: 'Research Concept', titleZh: '研究概念', desc: 'The first video segment introducing the research concept and objectives.', descZh: '第一個影片片段，介紹研究概念與目標。', duration: '2:30' },
  { id: 2, title: 'Methodology', titleZh: '研究方法', desc: 'The second segment explores the methodology and framework used in this study.', descZh: '第二個片段探討本研究所使用的方法論與框架。', duration: '3:15' },
  { id: 3, title: 'Experimental Design', titleZh: '實驗設計', desc: 'This segment presents the experimental conditions, variables, and procedures.', descZh: '這個片段展示實驗條件、變數與程序。', duration: '2:45' },
  { id: 4, title: 'Intervention', titleZh: '干預技術', desc: 'The fourth segment demonstrates the intervention technique in detail.', descZh: '第四個片段詳細演示干預技術。', duration: '3:00' },
  { id: 5, title: 'Key Findings', titleZh: '主要發現', desc: 'The final segment summarizes the key findings, conclusions, and implications.', descZh: '最後一個片段總結主要發現、結論與啟示。', duration: '2:20' },
];

// 單個全屏視頻播放器
function VideoPlayer({
  clip,
  index,
  total,
  isCompleted,
  onComplete,
}: {
  clip: typeof videoClips[0];
  index: number;
  total: number;
  isCompleted: boolean;
  onComplete: (id: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete(clip.id);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      className="h-screen w-full flex items-center justify-center relative scroll-snap-start"
      style={{ background: index % 2 === 0
        ? 'radial-gradient(ellipse at 30% 50%, #131116 0%, #0a090c 60%, #060508 100%)'
        : 'radial-gradient(ellipse at 70% 50%, #141218 0%, #0a090c 60%, #060508 100%)'
      }}
    >
      {/* 環境光 */}
      <div className="ambient-glow" style={{
        width: '500px', height: '500px',
        background: `radial-gradient(circle, rgba(201,169,110,${index % 2 === 0 ? 0.06 : 0.04}) 0%, transparent 70%)`,
        top: '10%', right: index % 2 === 0 ? '5%' : 'auto', left: index % 2 === 0 ? 'auto' : '5%',
      }} />

      <div className="w-full max-w-5xl px-4 md:px-8 relative z-10">
        {/* 視頻標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-all ${
              isCompleted ? 'text-[#08070a]' : 'text-[#c9a96e] border border-[rgba(201,169,110,0.3)]'
            }`}
            style={isCompleted ? { background: 'linear-gradient(135deg, #c9a96e, #a8894f)' } : { background: 'rgba(201,169,110,0.08)' }}
          >
            {isCompleted ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : clip.id}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-[#e0c994] text-xl md:text-2xl font-semibold">{clip.title}</h3>
              <span className="text-[#5a544c] text-xs">·</span>
              <span className="text-[#8a7650] text-sm">{clip.titleZh}</span>
            </div>
          </div>
          <div className="text-[#5a544c] text-xs flex items-center gap-1 flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {clip.duration}
          </div>
        </motion.div>

        {/* 視頻播放器 */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden border border-[rgba(201,169,110,0.12)] cursor-pointer group"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.04)' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onClick={togglePlay}
        >
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
            />

            {/* 中央播放圖標（暫停時顯示） */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(20,18,24,0.7) 0%, rgba(8,7,10,0.85) 100%)' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #c9a96e, #a8894f)', boxShadow: '0 8px 40px rgba(201,169,110,0.4)' }}
                  >
                    <svg className="w-9 h-9 md:w-10 md:h-10 text-[#08070a] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部控制條（懸停顯示） */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 左側：播放/暫停小圖標 + 標題 */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </button>
                    <span className="text-white/70 text-xs font-medium truncate max-w-[200px]">{clip.title} · {clip.titleZh}</span>
                  </div>

                  {/* 右側：全屏按鈕 */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    title={isFullscreen ? 'Exit Fullscreen / 退出全屏' : 'Fullscreen / 全屏'}
                  >
                    {isFullscreen ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 描述 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-center"
        >
          <p className="text-[#6b645c] text-sm leading-relaxed max-w-2xl mx-auto">{clip.desc}</p>
          <p className="text-[#5a544c] text-xs mt-1.5">{clip.descZh}</p>
        </motion.div>

        {/* 滾動提示（最後一個視頻不顯示） */}
        {index < total - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#5a544c]">Scroll for next video</span>
            <div className="w-5 h-9 rounded-full border border-[rgba(201,169,110,0.25)] flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-[#c9a96e]"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VideoViewer({ onProgress, progress }: VideoViewerProps) {
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);

  const handleComplete = (id: number) => {
    if (!completedVideos.includes(id)) {
      const newCompleted = [...completedVideos, id];
      setCompletedVideos(newCompleted);
      onProgress((newCompleted.length / videoClips.length) * 100);
    }
  };

  const allCompleted = completedVideos.length === videoClips.length;

  return (
    <div className="w-full relative">
      {/* 頂部進度指示（固定在視頻區頂部） */}
      <div className="sticky top-0 z-50 pointer-events-none">
        <div className="h-0.5 w-full bg-[rgba(255,255,255,0.05)]">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #a8894f, #c9a96e, #e0c994)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 5 個全屏視頻 */}
      {videoClips.map((clip, index) => (
        <VideoPlayer
          key={clip.id}
          clip={clip}
          index={index}
          total={videoClips.length}
          isCompleted={completedVideos.includes(clip.id)}
          onComplete={handleComplete}
        />
      ))}

      {/* 全部完成提示 */}
      {allCompleted && (
        <div className="h-screen w-full flex items-center justify-center relative" style={{ background: 'radial-gradient(ellipse at center, #131116 0%, #060508 100%)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8" style={{ background: 'linear-gradient(135deg, #c9a96e, #a8894f)', boxShadow: '0 0 60px rgba(201,169,110,0.3)' }}>
              <svg className="w-10 h-10 text-[#08070a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-serif text-[#e0c994] text-3xl md:text-4xl font-bold mb-3">All Videos Completed!</h2>
            <p className="text-[#8a7650] text-lg mb-2">全部影片已完成</p>
            <p className="text-[#5a544c] text-sm">Scroll down to continue to the questionnaire · 向下滾動進入問卷</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-8 inline-block"
            >
              <svg className="w-6 h-6 text-[#c9a96e] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* 視頻與問卷之間的大間隔（視覺上隔得很遠，滾動時直接吸附到問卷） */}
      <div className="h-[75vh] w-full flex items-center justify-center relative overflow-hidden">
        <div className="ambient-glow" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <svg className="w-8 h-8 text-[#5a544c] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>
          <p className="text-[#3d3833] text-xs tracking-[0.3em] uppercase">Questionnaire Ahead</p>
          <p className="text-[#3d3833] text-[10px] mt-1 tracking-wider">問卷就在前方</p>
        </div>
      </div>
    </div>
  );
}
