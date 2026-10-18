import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppMode, TabId } from './types'

interface AppStore {
  mode: AppMode
  activeTab: TabId
  currentDate: string   // ISO "2026-10-18"
  setMode: (mode: AppMode) => void
  setActiveTab: (tab: TabId) => void
  setCurrentDate: (date: string) => void
  changeDay: (delta: number) => void
}

function offsetDate(base: string, delta: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      mode: 'ALL',
      activeTab: 'home',
      currentDate: todayISO(),

      setMode: (mode) => set({ mode }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCurrentDate: (date) => set({ currentDate: date }),
      changeDay: (delta) =>
        set({ currentDate: offsetDate(get().currentDate, delta) }),
    }),
    { name: 'lifeos-app' }
  )
)
