import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StreakState } from './types'

const WEEKLY_SHIELD_MAX = 2
const MIN_STEPS_FOR_ACTIVE = 6000

interface StreakStore extends StreakState {
  checkAndUpdateStreak: (date: string, steps: number) => void
  useShield: () => void
  toggleZen: () => void
  resetWeeklyShields: () => void
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
  )
}

const initialState: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  shieldsLeft: WEEKLY_SHIELD_MAX,
  shieldsUsedThisWeek: 0,
  zenMode: false,
  activeDays: [],
}

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      checkAndUpdateStreak(date, steps) {
        const state = get()
        const isActive = steps >= MIN_STEPS_FOR_ACTIVE
        if (!isActive) return
        if (state.activeDays.includes(date)) return   // already counted

        const last = state.lastActiveDate
        let newStreak = state.currentStreak

        if (!last) {
          newStreak = 1
        } else {
          const gap = daysBetween(last, date)
          if (gap === 1) {
            newStreak += 1
          } else if (gap > 1) {
            // Check if shields can cover the gap
            const shieldsNeeded = gap - 1
            if (state.shieldsLeft >= shieldsNeeded) {
              newStreak += 1
              set({ shieldsLeft: state.shieldsLeft - shieldsNeeded })
            } else {
              newStreak = 1
            }
          }
          // gap === 0 → same day, no change
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          lastActiveDate: date,
          activeDays: [...state.activeDays, date],
        })
      },

      useShield() {
        const { shieldsLeft } = get()
        if (shieldsLeft > 0) {
          set({ shieldsLeft: shieldsLeft - 1, shieldsUsedThisWeek: get().shieldsUsedThisWeek + 1 })
        }
      },

      toggleZen() {
        set((s) => ({ zenMode: !s.zenMode }))
      },

      resetWeeklyShields() {
        set({ shieldsLeft: WEEKLY_SHIELD_MAX, shieldsUsedThisWeek: 0 })
      },
    }),
    { name: 'lifeos-streak' }
  )
)
