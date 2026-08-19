'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuestionnaireProps {
  onSubmit: (data: {[key: string]: string}) => void;
  participantData?: { name: string; email: string; age: string; gender: string };
}

const questionnaire = {
  section1: {
    title: 'Video Engagement',
    titleZh: '影片參與度',
    icon: '🎬',
    questions: [
      { id: 'q1', text: 'How engaging did you find the video content?', textZh: '您覺得影片內容有多吸引人？', minLabel: 'Not engaging at all', maxLabel: 'Very engaging' },
      { id: 'q2', text: 'How easy was it to understand the video content?', textZh: '理解影片內容有多容易？', minLabel: 'Very difficult', maxLabel: 'Very easy' },
      { id: 'q3', text: 'How much attention did you pay to the videos?', textZh: '您有多專注於影片？', minLabel: 'Not at all', maxLabel: 'Very much' },
      { id: 'q4', text: 'Rate the overall video quality.', textZh: '評價影片整體品質。', minLabel: 'Poor', maxLabel: 'Excellent' },
      { id: 'q5', text: 'How likely are you to recommend this study?', textZh: '您有多可能向他人推薦這項研究？', minLabel: 'Not likely', maxLabel: 'Very likely' },
    ],
  },
  section2: {
    title: 'Cognitive Response',
    titleZh: '認知反應',
    icon: '💭',
    questions: [
      { id: 'q6', text: 'What was the main message you took from the videos?', textZh: '您從影片中獲得的主要訊息是什麼？' },
      { id: 'q7', text: 'Did you have any questions about the research?', textZh: '您對研究有任何問題嗎？' },
      { id: 'q8', text: 'How did you feel while watching the videos?', textZh: '您在看影片時有什麼感受？' },
      { id: 'q9', text: 'What aspects did you find most effective?', textZh: '您覺得哪些方面最有效？' },
      { id: 'q10', text: 'Any additional comments or suggestions?', textZh: '任何其他意見或建議？' },
    ],
  },
};

export default function Questionnaire({ onSubmit, participantData }: QuestionnaireProps) {
  const [formData, setFormData] = useState<{[key: string]: string}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    [...questionnaire.section1.questions, ...questionnaire.section2.questions].forEach(q => {
      if (!formData[q.id] || formData[q.id].trim() === '') {
        newErrors[q.id] = 'Please answer this question / 請回答此問題';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const completeData = {
        ...participantData,
        ...formData,
        type: 'complete',
      };
      try {
        await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(completeData) });
      } catch { /* continue */ }
      onSubmit(formData);
      setTimeout(() => document.querySelector('[data-section="5"]')?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  };

  const answeredCount = Object.values(formData).filter(v => v && v.trim()).length;
  const totalQuestions = questionnaire.section1.questions.length + questionnaire.section2.questions.length;

  return (
    <div className="w-full flex justify-center px-4 md:px-10 pt-16 pb-24 relative" style={{ background: 'radial-gradient(ellipse at 20% 0%, #131116 0%, #0a090c 50%, #08070a 100%)' }}>
      <div className="w-full max-w-4xl">
        {/* 標題 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 pt-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(201,169,110,0.1)] border border-[rgba(201,169,110,0.2)] mb-6">
            <span className="text-2xl">📝</span>
          </div>
          <h1 className="font-serif font-bold text-[#f5f0e8] text-3xl md:text-4xl mb-2">Questionnaire</h1>
          <h2 className="font-serif text-gold-gradient text-xl md:text-2xl font-medium mb-6">問卷調查</h2>
          <div className="gold-divider max-w-xs mx-auto mb-6"></div>
          <p className="text-[#6b645c] text-sm">Please answer the following questions based on your experience</p>
          <p className="text-[#5a544c] text-xs mt-1">請根據您的體驗回答以下問題</p>

          {/* 進度 */}
          <div className="max-w-xs mx-auto mt-6">
            <div className="flex justify-between text-xs text-[#6b645c] mb-1.5">
              <span>Completed</span>
              <span className="text-[#c9a96e]">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a8894f, #c9a96e)' }} animate={{ width: `${(answeredCount/totalQuestions)*100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: 量表 */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[rgba(201,169,110,0.1)]">
              <span className="text-2xl">{questionnaire.section1.icon}</span>
              <div>
                <h3 className="font-serif text-[#e0c994] text-xl font-semibold">Section 1: {questionnaire.section1.title}</h3>
                <p className="text-[#8a7650] text-xs">第一部分：{questionnaire.section1.titleZh}</p>
              </div>
            </div>

            <div className="space-y-8">
              {questionnaire.section1.questions.map((q, qi) => (
                <motion.div key={q.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + qi * 0.08 }}>
                  <label className="block mb-4">
                    <span className="text-[#d4cdc0] text-sm font-medium leading-relaxed">{q.text}</span>
                    <span className="text-[#6b645c] text-xs block mt-1">{q.textZh}</span>
                  </label>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] text-[#5a544c] uppercase tracking-wider">
                      <span>{q.minLabel}</span>
                      <span>{q.maxLabel}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleChange(q.id, String(num))}
                          className={`scale-btn ${formData[q.id] === String(num) ? 'active' : ''}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors[q.id] && <p className="text-[#c95454] text-xs mt-2">{errors[q.id]}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 2: 文字 */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-[rgba(201,169,110,0.1)]">
              <span className="text-2xl">{questionnaire.section2.icon}</span>
              <div>
                <h3 className="font-serif text-[#e0c994] text-xl font-semibold">Section 2: {questionnaire.section2.title}</h3>
                <p className="text-[#8a7650] text-xs">第二部分：{questionnaire.section2.titleZh}</p>
              </div>
            </div>

            <div className="space-y-7">
              {questionnaire.section2.questions.map((q, qi) => (
                <motion.div key={q.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + qi * 0.08 }}>
                  <label className="block mb-3">
                    <span className="text-[#d4cdc0] text-sm font-medium">{q.text}</span>
                    <span className="text-[#6b645c] text-xs block mt-1">{q.textZh}</span>
                  </label>
                  <textarea
                    name={q.id}
                    value={formData[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    rows={3}
                    placeholder="Type your answer here... / 在此輸入答案..."
                    className={`input-luxury resize-none ${errors[q.id] ? 'error' : ''}`}
                  />
                  {errors[q.id] && <p className="text-[#c95454] text-xs mt-2">{errors[q.id]}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 提交按鈕 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex justify-center pb-10">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="btn-gold text-base font-semibold inline-flex items-center gap-3">
              <span>Submit Questionnaire</span>
              <span className="text-xs opacity-70 font-normal">提交問卷</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
