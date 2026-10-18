import type { MuscleGroup } from './types'

// ─── 1RM EPLEY FORMULA ───────────────────────────────────────────────────────
export function calcOneRM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// ─── RELATIVE STRENGTH ───────────────────────────────────────────────────────
export function relativeStrength(oneRM: number, bodyweightKg: number): string {
  if (!bodyweightKg) return '—'
  const ratio = oneRM / bodyweightKg
  return ratio.toFixed(2) + '×'
}

// ─── SESSION VOLUME ──────────────────────────────────────────────────────────
export function calcSessionVolume(exercises: { sets: { weightKg: number; reps: number; done: boolean }[] }[]): number {
  return exercises.reduce((total, ex) =>
    total + ex.sets.reduce((s, set) =>
      s + (set.done ? set.weightKg * set.reps : 0), 0), 0)
}

// ─── DATE HELPERS ────────────────────────────────────────────────────────────
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDateReadable(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getLast7Days(fromDate: string): string[] {
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(fromDate + 'T00:00:00')
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export function dayLabel(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })
}

// ─── SPEED → COLOR ──────────────────────────────────────────────────────────
export function speedToColor(kmh: number): string {
  if (kmh < 12) return '#3b82f6'      // blue
  if (kmh < 22) return '#10b981'      // emerald
  if (kmh < 30) return '#f59e0b'      // amber
  return '#ef4444'                     // red
}

// ─── IMC ─────────────────────────────────────────────────────────────────────
export function calcIMC(weightKg: number, heightCm: number): number {
  if (!heightCm) return 0
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

// ─── MUSCLE EMOJI ─────────────────────────────────────────────────────────────
export const MUSCLE_EMOJI: Record<MuscleGroup, string> = {
  Pecho: '💪',
  Espalda: '🦅',
  Piernas: '🦵',
  Hombros: '🏔️',
  Brazos: '💪',
  Core: '⚡',
  Cardio: '🏃',
}

// ─── FORMAT DURATION ────────────────────────────────────────────────────────
export function formatSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}min`
  }
  return m > 0 ? `${m}min ${s}s` : `${s}s`
}

export function formatMinutes(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }
  return `${min} min`
}

// ─── WEEKLY SCORE ────────────────────────────────────────────────────────────
export function calcDayScore(data: {
  steps: number
  bikeKm: number
  studyMin: number
  workouts: unknown[]
  turkeyDone: number
}): number {
  let score = 0
  if (data.steps >= 10000) score += 30
  else if (data.steps >= 6000) score += 20
  else if (data.steps >= 3000) score += 10

  if (data.bikeKm >= 10) score += 20
  else if (data.bikeKm > 0) score += 10

  if (data.studyMin >= 60) score += 20
  else if (data.studyMin >= 30) score += 10

  if (data.workouts.length > 0) score += 20

  if (data.turkeyDone >= 3) score += 10
  else if (data.turkeyDone >= 1) score += 5

  return Math.min(score, 100)
}

// ─── RANDOM ID ───────────────────────────────────────────────────────────────
export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
