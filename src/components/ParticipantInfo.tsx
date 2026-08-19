'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ParticipantInfoProps {
  onSubmit: (data: { name: string; email: string; age: string; gender: string }) => void;
  consentAccepted: boolean;
}

const fields = [
  { name: 'name', label: 'Full Name', labelZh: '姓名', type: 'text', placeholder: 'Enter your full name / 輸入您的姓名' },
  { name: 'email', label: 'Email Address', labelZh: '電郵地址', type: 'email', placeholder: 'your.email@example.com' },
  { name: 'age', label: 'Age', labelZh: '年齡', type: 'number', placeholder: 'Enter your age / 輸入您的年齡', min: 18, max: 100 },
];

const genderOptions = [
  { value: 'male', label: 'Male', labelZh: '男' },
  { value: 'female', label: 'Female', labelZh: '女' },
  { value: 'other', label: 'Other', labelZh: '其他' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say', labelZh: '不願透露' },
];

export default function ParticipantInfo({ onSubmit, consentAccepted }: ParticipantInfoProps) {
  const [formData, setFormData] = useState({ name: '', email: '', age: '', gender: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name / 請輸入姓名';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email / 請輸入電郵地址';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email / 請輸入有效的電郵地址';
    }
    if (!formData.age.trim()) {
      newErrors.age = 'Please enter your age / 請輸入年齡';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 100) {
      newErrors.age = 'Age must be between 18-100 / 年齡必須在 18-100 之間';
    }
    if (!formData.gender) newErrors.gender = 'Please select your gender / 請選擇性別';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, type: 'participant_info' }),
        });
      } catch { /* continue regardless */ }
      onSubmit(formData);
      setTimeout(() => {
        document.querySelector('[data-section="3"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  if (!consentAccepted) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at center, #131116 0%, #08070a 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass-card p-12">
          <div className="text-6xl mb-6 opacity-60">🔒</div>
          <h2 className="font-serif text-[#e0c994] text-2xl mb-4">Please accept the consent form first</h2>
          <p className="text-[#6b645c]">請先閱讀並同意知情同意書</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-auto relative"
      style={{ background: 'radial-gradient(ellipse at 70% 40%, #141218 0%, #0a090c 60%, #08070a 100%)' }}
    >
      <div className="ambient-glow" style={{ width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)', bottom: '10%', left: '5%' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-xl w-full relative z-10"
      >
        {/* 標題 */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(201,169,110,0.1)] border border-[rgba(201,169,110,0.2)] mb-6"
          >
            <span className="text-2xl">👤</span>
          </motion.div>
          <h1 className="font-serif font-bold text-[#f5f0e8] mb-2">Participant Information</h1>
          <h2 className="font-serif text-gold-gradient text-2xl md:text-3xl font-medium mb-6">參與者資料</h2>
          <div className="gold-divider max-w-xs mx-auto mb-6"></div>
          <p className="text-[#6b645c] text-sm">Please fill in your basic information to continue</p>
          <p className="text-[#5a544c] text-xs mt-1">請填寫基本資料以繼續</p>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-10 space-y-6">
          {fields.map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            >
              <label className="block mb-2.5">
                <span className="text-[#e0c994] font-serif text-sm font-medium">{field.label}</span>
                <span className="text-[#8a7650] text-xs ml-2">{field.labelZh}</span>
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                min={field.min}
                max={field.max}
                placeholder={field.placeholder}
                className={`input-luxury ${errors[field.name] ? 'error' : ''}`}
              />
              {errors[field.name] && (
                <p className="text-[#c95454] text-xs mt-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors[field.name]}
                </p>
              )}
            </motion.div>
          ))}

          {/* 性別選擇 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block mb-2.5">
              <span className="text-[#e0c994] font-serif text-sm font-medium">Gender</span>
              <span className="text-[#8a7650] text-xs ml-2">性別</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, gender: opt.value }));
                    if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  className={`px-4 py-3 rounded-lg text-sm transition-all duration-300 text-left ${
                    formData.gender === opt.value
                      ? 'bg-[rgba(201,169,110,0.12)] border border-[#c9a96e] text-[#e0c994]'
                      : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(201,169,110,0.1)] text-[#9a9288] hover:border-[rgba(201,169,110,0.3)]'
                  }`}
                >
                  <span className="block font-medium">{opt.label}</span>
                  <span className="block text-xs opacity-60 mt-0.5">{opt.labelZh}</span>
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="text-[#c95454] text-xs mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.gender}
              </p>
            )}
          </motion.div>

          {/* 提交按鈕 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex justify-center pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn-gold text-base font-semibold inline-flex items-center gap-3"
            >
              <span>Continue to Study</span>
              <span className="text-xs opacity-70 font-normal">繼續參與研究</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
