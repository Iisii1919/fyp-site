'use client';

import { useEffect, useState } from 'react';

interface DevStepJumperProps {
  /** 目前步驟索引（0-based）。 */
  step: number;
  /** 步驟標籤（index = 步驟編號）。 */
  labels: string[];
  /** 跳到指定步驟。 */
  onJump: (step: number) => void;
}

/**
 * 僅在本機（localhost / 127.0.0.1）顯示的開發用**步驟跳轉器**。
 *
 * 為什麼需要：每次自己測試某一頁（例如觀後回饋）都得先把前測填完，
 * 一輪要花十幾分鐘，而且 Google 表單會一直累積測試回應。
 * 有了這個就能直接跳到任何一頁。
 *
 * 🔴 正式部署到 Netlify 網域時會自動隱藏（同 DevGroupSwitcher 的做法），
 *    真實參與者看不到，不影響研究流程。
 */
export default function DevStepJumper({ step, labels, onJump }: DevStepJumperProps) {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const h = window.location.hostname;
    setIsLocal(h === 'localhost' || h === '127.0.0.1');
  }, []);

  if (!isLocal) return null;

  return (
    <div
      // ⚠️ top-16 而不是 top-4：DevGroupSwitcher 也在 top-4（右側），
      // 390px 手機上兩者寬度相加會超過螢幕 → 直接疊在一起（實測「DEV 頁面」壓住「組別」）。
      className="fixed top-16 left-4 z-[200] flex items-center gap-2 px-3 py-2 rounded-full text-xs"
      style={{
        background: 'rgba(20,20,20,0.7)',
        border: '1px solid rgba(198,168,248,0.25)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="text-[#9a9a9a] tracking-wider uppercase whitespace-nowrap">DEV 頁</span>
      <select
        value={step}
        onChange={(e) => onJump(Number(e.target.value))}
        aria-label="跳到指定頁面"
        className="rounded-full px-2 py-1 text-[#EAECEF] outline-none cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(198,168,248,0.4)' }}
      >
        {labels.map((label, i) => (
          <option key={i} value={i} style={{ background: '#1a1a1a', color: '#EAECEF' }}>
            {i}. {label}
          </option>
        ))}
      </select>
    </div>
  );
}
