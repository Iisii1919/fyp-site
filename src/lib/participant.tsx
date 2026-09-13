'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Group = 'sadness' | 'neutral';

export interface Participant {
  id: string;
  group: Group;
}

const STORAGE_KEY = 'fyp_participant';

// 舊版組別代號 → 新版（2026-09-12：dark → sadness、happy → neutral）。
// 讓已存在於 localStorage 的舊資料無痛沿用，避免既有參與者被重新分配組別。
const LEGACY_GROUP_MAP: Record<string, Group> = {
  dark: 'sadness',
  happy: 'neutral',
};

function normalizeGroup(value: unknown): Group | null {
  if (value === 'sadness' || value === 'neutral') return value;
  if (typeof value === 'string' && value in LEGACY_GROUP_MAP) return LEGACY_GROUP_MAP[value];
  return null;
}

function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `FYP-${ts}${rand}`;
}

// 讀取 localStorage 中的參與者，並把舊代號正規化為新版組別。
function readStored(): Participant | null {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (!existing) return null;
    const parsed = JSON.parse(existing) as Partial<Participant>;
    if (typeof parsed?.id !== 'string') return null;
    const group = normalizeGroup(parsed.group);
    if (!group) return null;
    return { id: parsed.id, group };
  } catch {
    // ignore read/parse errors
    return null;
  }
}

// Ensures a participant exists in localStorage, assigning a 50/50 random group on first call.
// Subsequent calls return the previously stored participant (stable across reloads).
export function assignParticipant(): Participant {
  if (typeof window === 'undefined') {
    // SSR safety — real assignment happens client-side.
    return { id: 'FYP-SSR', group: 'sadness' };
  }
  const stored = readStored();
  if (stored) return stored;
  const participant: Participant = {
    id: generateId(),
    group: Math.random() < 0.5 ? 'sadness' : 'neutral',
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(participant));
  } catch {
    // ignore write errors (private mode, etc.)
  }
  return participant;
}

export function getParticipant(): Participant | null {
  return readStored();
}

// Clears the stored participant so a fresh id AND a fresh random group are
// assigned on the next call.
//
// ⚠️ 這個函式不是可有可無的開發工具 —— 它是研究資料正確性的關鍵。
// ID 與組別都存在 localStorage，而 assignParticipant() 只要讀到舊值就直接沿用，
// 所以同一台電腦的第二位參與者會：
//   1. 沿用第一位的 Participant ID → 兩人的回應在整合分頁被併成同一列，無法區分；
//   2. **沿用第一位的組別** → 組別只在下面那行 Math.random() 決定一次，
//      於是同一台電腦跑的所有人都落在同一組，50/50 隨機分派直接失效。
// （2026-09-13 以 CDP 實測確認：走完整個流程到完成頁後，ID 與組別都仍然不變。）
// 因此：完成研究時（ThankYou 掛載）一定要呼叫一次，見該元件的說明。
export function clearParticipant(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * 研究者的手動重置：用 `?new=1` 開啟網站即可強制換一位新的參與者。
 *
 * 用途：上一次的參與者中途放棄、沒有走到完成頁，因此自動清除沒被觸發，
 * 這時下一位就會沿用他的 ID 與組別。研究者在開始新一場前用這個參數清一次即可。
 * 讀完會立刻把參數從網址移除，避免之後每次重新整理都又清一次。
 *
 * 刻意不做成畫面上的按鈕：參與者看到「重設」有可能誤按，
 * 一按就會被重新分派組別，整個 session 的資料就作廢了。
 */
function applyManualResetParam(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('new') !== '1') return;
    clearParticipant();
    url.searchParams.delete('new');
    // 保留 router state，否則 Next.js 的 history 追蹤會亂掉
    window.history.replaceState(
      window.history.state,
      '',
      url.pathname + (url.search ? url.search : '') + url.hash,
    );
  } catch {
    // ignore
  }
}

interface ParticipantContextValue {
  participant: Participant | null;
}

const ParticipantContext = createContext<ParticipantContextValue>({ participant: null });

// Assigns a stable participant on mount and shares it through context so that every
// form / the video viewer re-renders with the correct id + group once it is ready.
export function ParticipantProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  useEffect(() => {
    // 先處理研究者的手動重置（?new=1），再決定這次的身分
    applyManualResetParam();
    setParticipant(assignParticipant());
  }, []);
  return (
    <ParticipantContext.Provider value={{ participant }}>
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant(): Participant | null {
  return useContext(ParticipantContext).participant;
}
