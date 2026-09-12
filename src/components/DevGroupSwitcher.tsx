'use client';

import { useEffect, useState } from 'react';
import { useParticipant, getParticipant, type Group } from '@/lib/participant';

const STORAGE_KEY = 'fyp_participant';

// 僅在本機（localhost / 127.0.0.1）顯示的開發用組別切換器。
// 正式部署到 Netlify 網域時會自動隱藏，不影響真實參與者。
export default function DevGroupSwitcher() {
  const [isLocal, setIsLocal] = useState(false);
  const participant = useParticipant();

  useEffect(() => {
    const h = window.location.hostname;
    setIsLocal(h === 'localhost' || h === '127.0.0.1');
  }, []);

  if (!isLocal) return null;

  const forceGroup = (group: Group) => {
    try {
      const existing = getParticipant();
      const id = existing?.id ?? `FYP-DEV-${group.toUpperCase()}`;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, group }));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div
      className="fixed top-4 right-4 z-[200] flex items-center gap-2 px-3 py-2 rounded-full text-xs"
      style={{ background: 'rgba(20,20,20,0.7)', border: '1px solid rgba(198,168,248,0.25)', backdropFilter: 'blur(8px)' }}
    >
      <span className="text-[#9a9a9a] tracking-wider uppercase">DEV 組別</span>
      <span className="font-semibold" style={{ color: participant?.group === 'neutral' ? '#FFD27F' : '#C6A8F8' }}>
        {participant ? (participant.group === 'neutral' ? 'Neutral' : 'Sadness') : '…'}
      </span>
      <button
        onClick={() => forceGroup('sadness')}
        className="px-2.5 py-1 rounded-full border border-[rgba(198,168,248,0.4)] text-[#EAECEF] hover:bg-[rgba(198,168,248,0.15)] transition-colors"
      >
        Sadness
      </button>
      <button
        onClick={() => forceGroup('neutral')}
        className="px-2.5 py-1 rounded-full border border-[rgba(255,210,127,0.45)] text-[#EAECEF] hover:bg-[rgba(255,210,127,0.15)] transition-colors"
      >
        Neutral
      </button>
    </div>
  );
}
