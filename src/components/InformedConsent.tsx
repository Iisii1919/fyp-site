'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface InformedConsentProps {
  onAccepted: () => void;
}

const sections = [
  {
    title: 'Research Purpose',
    titleZh: '研究目的',
    icon: '🎯',
    content: 'This study aims to investigate the effects of multimedia content on user engagement and cognitive processing. Your participation will help us understand how people interact with digital media in research settings.',
    contentZh: '本研究旨在調查多媒體內容對用戶參與度和認知處理的影響。您的參與將幫助我們了解人們在研究環境中如何與數字媒體互動。',
  },
  {
    title: 'What You Will Do',
    titleZh: '您將要做什麼',
    icon: '📋',
    items: [
      'Watch 5 video clips（觀看 5 個影片片段）',
      'Complete demographic information（填寫基本資料）',
      'Answer questionnaires（回答問卷）',
      'Estimated time: 20-30 minutes（預計時間：20-30 分鐘）',
    ],
  },
  {
    title: 'Your Rights',
    titleZh: '您的權利',
    icon: '🛡️',
    items: [
      'Participation is completely voluntary（參與完全自願）',
      'You can withdraw at any time without penalty（您可以隨時退出，無需承擔後果）',
      'All data will be kept confidential and anonymous（所有數據將保密且匿名）',
      'You have the right to ask questions at any time（您有權隨時提出問題）',
    ],
  },
  {
    title: 'Contact Information',
    titleZh: '聯絡方式',
    icon: '✉️',
    content: 'If you have any questions or concerns, please contact the research team:',
    email: 'research@example.edu',
  },
];

export default function InformedConsent({ onAccepted }: InformedConsentProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () => {
    if (isChecked) {
      onAccepted();
      setTimeout(() => {
        const participantSection = document.querySelector('[data-section="2"]');
        participantSection?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-auto relative"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #131116 0%, #0a090c 60%, #08070a 100%)' }}
    >
      {/* 環境光 */}
      <div
        className="ambient-glow"
        style={{
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
          top: '10%', right: '5%',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-4xl w-full relative z-10"
      >
        {/* 標題區 */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(201,169,110,0.1)] border border-[rgba(201,169,110,0.2)] mb-6"
          >
            <span className="text-2xl">📜</span>
          </motion.div>
          <h1 className="font-serif font-bold text-[#f5f0e8] mb-2">
            Informed Consent
          </h1>
          <h2 className="font-serif text-gold-gradient text-2xl md:text-3xl font-medium mb-6">
            知情同意書
          </h2>
          <div className="gold-divider max-w-xs mx-auto"></div>
        </div>

        {/* 內容卡片 */}
        <div className="glass-card p-6 md:p-10 mb-8 max-h-[50vh] overflow-y-auto pr-2">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="border-l-2 border-[rgba(201,169,110,0.2)] pl-5 py-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl opacity-70">{section.icon}</span>
                  <div>
                    <h3 className="font-serif text-[#e0c994] text-lg font-semibold">{section.title}</h3>
                    <p className="text-[#8a7650] text-xs">{section.titleZh}</p>
                  </div>
                </div>

                {section.content && (
                  <div className="space-y-2">
                    <p className="text-[#9a9288] text-sm leading-relaxed">{section.content}</p>
                    {section.contentZh && (
                      <p className="text-[#6b645c] text-sm leading-relaxed">{section.contentZh}</p>
                    )}
                    {section.email && (
                      <p className="text-[#c9a96e] text-sm font-medium mt-2">{section.email}</p>
                    )}
                  </div>
                )}

                {section.items && (
                  <ul className="space-y-2 mt-1">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-[#9a9288] text-sm">
                        <span className="text-[#c9a96e] mt-1.5 w-1 h-1 rounded-full bg-[#c9a96e] flex-shrink-0"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 同意勾選 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card p-5 md:p-6 mb-8"
        >
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                isChecked
                  ? 'bg-[#c9a96e] border-[#c9a96e]'
                  : 'border-[rgba(201,169,110,0.3)] group-hover:border-[#c9a96e]'
              }`}>
                {isChecked && (
                  <svg className="w-4 h-4 text-[#08070a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[#9a9288] text-sm leading-relaxed">
              I have read and understood the above information. I voluntarily agree to participate in this research study.
              <br />
              <span className="text-[#6b645c]">我已閱讀並理解上述資訊。我自願同意參與這項研究。</span>
            </span>
          </label>
        </motion.div>

        {/* 按鈕 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={isChecked ? { scale: 1.03 } : {}}
            whileTap={isChecked ? { scale: 0.97 } : {}}
            onClick={handleSubmit}
            disabled={!isChecked}
            className="btn-gold text-base font-semibold inline-flex items-center gap-3"
          >
            <span>I Agree & Continue</span>
            <span className="text-xs opacity-70 font-normal">我同意並繼續</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
