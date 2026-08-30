'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface InformedConsentProps {
  onAccepted: () => void;
}

const sections = [
  {
    title: '1. Purpose of the Project',
    content: 'This study aims to examine how viewing different types of film excerpts affects viewers\u2019 immediate emotional responses, thought processes, and psychological resilience. You will be asked to watch a series of short film excerpts and complete questionnaires about your feelings and thoughts afterwards.',
  },
  {
    title: '2. Research Procedures',
    items: [
      'Complete a pre-viewing questionnaire (approximately 5 minutes).',
      'Watch five short film excerpts, approximately 10 minutes in total.',
      'Complete a post-viewing questionnaire (approximately 8 minutes).',
      'The total duration of the study is approximately 20\u201325 minutes.',
    ],
  },
  {
    title: '3. Potential Risks and Discomforts',
    content: 'Some of the film excerpts may contain themes of sadness, suffering, or moral distress, which may cause temporary feelings of sadness or discomfort. If you feel uneasy at any point, you may pause or withdraw from the study without giving any reason.',
    extra: (
      <div className="mt-3 p-3 rounded-lg bg-[rgba(198,168,248,0.07)] border border-[rgba(198,168,248,0.12)]">
        <p className="text-[#d4bfff] text-xs font-semibold mb-2">If you experience persistent distress after participation, you are encouraged to contact:</p>
        <ul className="space-y-1">
          <li className="text-[#c4c4c4] text-xs">The Samaritans Hong Kong: <span className="text-[#d4bfff]">2896 0000</span> (24-hour hotline)</li>
          <li className="text-[#c4c4c4] text-xs">The Mental Health Association of Hong Kong: <span className="text-[#d4bfff]">2528 0196</span></li>
        </ul>
      </div>
    ),
  },
  {
    title: '4. Confidentiality and Data Protection',
    content: 'All information collected will be kept strictly confidential and used solely for academic research purposes. Data will be anonymised, and no personally identifiable information will be reported. In accordance with the Personal Data (Privacy) Ordinance (Cap. 486), you have the right to request access to and correction of your personal data. Data will be stored securely and destroyed after the completion of the research project.',
  },
  {
    title: '5. Voluntary Participation and Right to Withdraw',
    content: 'Your participation is entirely voluntary. You have the right to withdraw from the study at any time without penalty or negative consequences. If you withdraw, you may request that your data be excluded from the analysis.',
  },
  {
    title: '6. Contact Information',
    content: 'If you have any questions about this study, please contact:',
    extra: (
      <div className="mt-3 space-y-1">
        <p className="text-[#c4c4c4] text-sm"><span className="text-[#EAECEF] font-medium">Student:</span> LIN Jiaquan</p>
        <p className="text-[#c4c4c4] text-sm"><span className="text-[#EAECEF] font-medium">Email:</span> <a href="mailto:s1160702@s.eduhk.hk" className="text-[#d4bfff] hover:underline">s1160702@s.eduhk.hk</a></p>
        <p className="text-[#c4c4c4] text-sm mt-2"><span className="text-[#EAECEF] font-medium">Supervisor:</span> Dr. Lawrence Chan</p>
        <p className="text-[#c4c4c4] text-sm"><span className="text-[#EAECEF] font-medium">Department:</span> Department of Psychology</p>
      </div>
    ),
  },
  {
    title: '7. Consent Statement',
    content: 'I have read and understood the above information. I understand the purpose, procedures, potential risks, and my rights as a participant. I voluntarily agree to participate in this study. By clicking \u201CI agree\u201D and proceeding to the study, I indicate my informed consent to participate.',
  },
];

export default function InformedConsent({ onAccepted }: InformedConsentProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () => {
    if (isChecked) {
      onAccepted();
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-auto relative"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #545454 0%, #3d3d3d 60%, #3d3d3d 100%)' }}
    >
      {/* 環境光 */}
      <div
        className="ambient-glow"
        style={{
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(198,168,248,0.1) 0%, transparent 70%)',
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
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-[#FFFFFF] text-2xl md:text-3xl mb-1">
            Informed Consent Form
          </h1>
          <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-5">
            知情同意書
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-5"></div>

          {/* 研究資訊 */}
          <div className="text-sm space-y-1">
            <p className="text-[#EAECEF] font-serif font-semibold">The Influence of Dark Film on Enhancing Psychological Resilience</p>
            <p className="text-[#C6A8F8] text-xs">
              LIN Jiaquan &middot; Department of Psychology &middot; Supervisor: Dr. Lawrence Chan
            </p>
            <p className="text-[#9a9a9a] text-xs">
              <a href="mailto:s1160702@s.eduhk.hk" className="hover:text-[#d4bfff] transition-colors">s1160702@s.eduhk.hk</a>
            </p>
          </div>
        </div>

        {/* 內容卡片 */}
        <div className="glass-card p-6 md:p-8 mb-6 max-h-[42vh] overflow-y-auto pr-2">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                className="border-l-2 border-[rgba(198,168,248,0.24)] pl-5 py-1"
              >
                <div className="mb-2">
                  <h3 className="font-serif text-[#EAECEF] text-base font-semibold">{section.title}</h3>
                </div>

                {section.content && (
                  <p className="text-[#c4c4c4] text-sm leading-relaxed">{section.content}</p>
                )}

                {section.items && (
                  <ul className="space-y-1.5 mt-1">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-[#c4c4c4] text-sm">
                        <span className="text-[#d4bfff] mt-1.5 w-1 h-1 rounded-full bg-[#d4bfff] flex-shrink-0"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.extra}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 同意勾選 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card p-4 md:p-5 mb-6"
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
                  ? 'bg-[#d4bfff] border-[#d4bfff]'
                  : 'border-[rgba(198,168,248,0.34)] group-hover:border-[#d4bfff]'
              }`}>
                {isChecked && (
                  <svg className="w-4 h-4 text-[#3d3d3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[#c4c4c4] text-sm leading-relaxed">
              I have read and understood the above information. I voluntarily agree to participate in this research study.
              <br />
              <span className="text-[#9a9a9a]">我已閱讀並理解上述資訊。我自願同意參與這項研究。</span>
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
