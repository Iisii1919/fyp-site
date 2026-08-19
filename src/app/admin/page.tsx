'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Submission {
  id?: string;
  timestamp: string;
  name?: string;
  email?: string;
  age?: string;
  gender?: string;
  type?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
  q9?: string;
  q10?: string;
  ipAddress?: string;
  userAgent?: string;
}

const scaleQuestions = [
  { id: 'q1', label: 'Video Engagement', zh: '影片參與度' },
  { id: 'q2', label: 'Understanding', zh: '理解程度' },
  { id: 'q3', label: 'Attention', zh: '專注度' },
  { id: 'q4', label: 'Video Quality', zh: '影片品質' },
  { id: 'q5', label: 'Recommendation', zh: '推薦意願' },
];

const textQuestions = [
  { id: 'q6', label: 'Main Message', zh: '主要訊息' },
  { id: 'q7', label: 'Questions', zh: '研究問題' },
  { id: 'q8', label: 'Feelings', zh: '觀看感受' },
  { id: 'q9', label: 'Effective Aspects', zh: '有效方面' },
  { id: 'q10', label: 'Comments', zh: '其他意見' },
];

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'complete'>('complete');

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submit');
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setError(null);
    } catch (err) {
      setError('無法載入數據 / Failed to load data');
      console.error('載入錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = filter === 'complete'
    ? submissions.filter(s => s.type === 'complete' || (s.q1 && s.name))
    : submissions;

  const exportToCSV = () => {
    const headers = ['時間', '姓名', '電郵', '年齡', '性別', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];
    const rows = filteredSubmissions.map(sub => [
      new Date(sub.timestamp).toLocaleString(),
      sub.name || '', sub.email || '', sub.age || '', sub.gender || '',
      sub.q1 || '', sub.q2 || '', sub.q3 || '', sub.q4 || '', sub.q5 || '',
      sub.q6 || '', sub.q7 || '', sub.q8 || '', sub.q9 || '', sub.q10 || '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `問卷數據_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const avgScale = (qId: string) => {
    const vals = filteredSubmissions.map(s => Number(s[qId as keyof Submission])).filter(v => !isNaN(v) && v > 0);
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #131116 0%, #060508 100%)' }}>
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[rgba(201,169,110,0.2)] border-t-[#c9a96e]" />
          <p className="text-[#6b645c] text-sm">載入中... Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(ellipse at 20% 0%, #131116 0%, #0a090c 50%, #060508 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* 標題 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a96e, #a8894f)' }}>
                <svg className="w-5 h-5 text-[#08070a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h1 className="font-serif text-[#f5f0e8] text-2xl md:text-3xl font-bold">問卷數據管理後台</h1>
            </div>
            <p className="text-[#6b645c] text-sm ml-13">Questionnaire Data Management Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSubmissions} className="btn-outline text-xs px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              重新載入
            </button>
            <button onClick={exportToCSV} disabled={filteredSubmissions.length === 0} className="btn-gold text-xs px-4 py-2.5 flex items-center gap-2 disabled:opacity-40">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              匯出 CSV
            </button>
            <a href="/" className="btn-outline text-xs px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              首頁
            </a>
          </div>
        </motion.div>

        {/* 統計卡片 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '總提交數', en: 'Total Submissions', value: submissions.length, icon: '📊' },
            { label: '有效問卷', en: 'Complete Responses', value: filteredSubmissions.length, icon: '✅' },
            { label: '參與者數', en: 'Participants', value: new Set(filteredSubmissions.map(s => s.email).filter(Boolean)).size, icon: '👥' },
            { label: '平均參與度', en: 'Avg Engagement', value: avgScale('q1'), icon: '⭐' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5">
              <div className="text-2xl mb-2 opacity-70">{stat.icon}</div>
              <div className="font-serif text-[#e0c994] text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-[#9a9288] text-xs">{stat.label}</div>
              <div className="text-[#5a544c] text-[10px]">{stat.en}</div>
            </div>
          ))}
        </motion.div>

        {/* 量表平均分 */}
        {filteredSubmissions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-8">
            <h3 className="font-serif text-[#e0c994] text-lg font-semibold mb-5">量表題目平均分 / Scale Question Averages</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {scaleQuestions.map(q => {
                const avg = Number(avgScale(q.id));
                const pct = isNaN(avg) ? 0 : (avg / 10) * 100;
                return (
                  <div key={q.id} className="text-center">
                    <div className="font-serif text-[#f5f0e8] text-xl font-bold mb-1">{isNaN(avg) ? '-' : avg}<span className="text-[#5a544c] text-sm">/10</span></div>
                    <div className="text-[#9a9288] text-xs mb-2">{q.label}</div>
                    <div className="text-[#6b645c] text-[10px] mb-2">{q.zh}</div>
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a8894f, #c9a96e)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 篩選 */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[#6b645c] text-xs">篩選 / Filter:</span>
          {(['complete', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-[rgba(201,169,110,0.15)] text-[#c9a96e] border border-[rgba(201,169,110,0.3)]' : 'text-[#6b645c] hover:text-[#9a9288] border border-transparent'}`}>
              {f === 'complete' ? '有效問卷 Complete' : '全部 All'}
            </button>
          ))}
        </div>

        {/* 數據列表 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-50">📭</div>
              <p className="text-[#9a9288]">目前沒有提交數據</p>
              <p className="text-[#5a544c] text-xs mt-1">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(201,169,110,0.1)]">
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">#</th>
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">時間 Time</th>
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">姓名 Name</th>
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">電郵 Email</th>
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">年齡 Age</th>
                    <th className="p-4 text-left text-[#8a7650] text-xs font-semibold uppercase tracking-wider">性別 Gender</th>
                    <th className="p-4 text-center text-[#8a7650] text-xs font-semibold uppercase tracking-wider">操作 Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, index) => (
                    <>
                      <tr key={index} className="border-b border-[rgba(201,169,110,0.05)] hover:bg-[rgba(201,169,110,0.03)] transition-colors">
                        <td className="p-4 text-[#5a544c] text-sm font-mono">{index + 1}</td>
                        <td className="p-4 text-[#9a9288] text-xs whitespace-nowrap">{new Date(sub.timestamp).toLocaleString()}</td>
                        <td className="p-4 text-[#e0c994] text-sm font-medium">{sub.name || '-'}</td>
                        <td className="p-4 text-[#9a9288] text-xs">{sub.email || '-'}</td>
                        <td className="p-4 text-[#9a9288] text-sm">{sub.age || '-'}</td>
                        <td className="p-4 text-[#9a9288] text-sm capitalize">{sub.gender || '-'}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => setSelectedIndex(selectedIndex === index ? null : index)} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${selectedIndex === index ? 'bg-[rgba(201,169,110,0.15)] text-[#c9a96e]' : 'bg-[rgba(255,255,255,0.03)] text-[#6b645c] hover:text-[#c9a96e]'}`}>
                            {selectedIndex === index ? '收起 Collapse' : '查看 View'}
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {selectedIndex === index && (
                          <tr key={`detail-${index}`}>
                            <td colSpan={7} className="p-0">
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-6 border-t border-[rgba(201,169,110,0.1)]" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <h4 className="font-serif text-[#e0c994] text-base font-semibold mb-5">詳細數據 / Detailed Responses</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                  {scaleQuestions.map(q => (
                                    <div key={q.id} className="flex items-center justify-between gap-4 pb-3 border-b border-[rgba(201,169,110,0.06)]">
                                      <div>
                                        <span className="text-[#d4cdc0] text-sm font-medium">{q.label}</span>
                                        <span className="text-[#5a544c] text-xs block">{q.zh}</span>
                                      </div>
                                      <span className="font-serif text-[#c9a96e] text-lg font-bold">{sub[q.id as keyof Submission] || '-'}{sub[q.id as keyof Submission] ? '/10' : ''}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-6 space-y-4">
                                  {textQuestions.map(q => (
                                    <div key={q.id}>
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[#d4cdc0] text-sm font-medium">{q.label}</span>
                                        <span className="text-[#5a544c] text-xs">{q.zh}</span>
                                      </div>
                                      <p className="text-[#9a9288] text-sm leading-relaxed p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(201,169,110,0.06)]">{sub[q.id as keyof Submission] || '-'}</p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* 底部說明 */}
        <div className="mt-8 text-center">
          <p className="text-[#5a544c] text-xs">
            數據存儲於項目目錄 <code className="text-[#8a7650] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded">data/submissions/</code> · Data stored in project directory
          </p>
        </div>
      </div>
    </div>
  );
}
