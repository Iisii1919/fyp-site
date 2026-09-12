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

// Clears the stored participant so a fresh random group is assigned on next visit.
// Handy for local previewing both groups (or wire a dev "re-roll" button to this).
export function clearParticipant(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
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
