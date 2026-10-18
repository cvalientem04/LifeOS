// ─── APP MODES & TABS ───────────────────────────────────────────────────────
export type AppMode = 'ALL' | 'CLUB' | 'HOME'
export type TabId = 'home' | 'gym' | 'bike' | 'hogar' | 'weekly' | 'journal'

// ─── DAY DATA ────────────────────────────────────────────────────────────────
export interface DayData {
  date: string           // ISO: "2026-10-18"
  studyMin: number
  carMin: number
  steps: number
  bikeKm: number
  meals: string[]
  weight?: number
  mood?: MoodEmoji
  journalText?: string
  journalSavedAt?: string
  turkeyTasks: TurkeyTasks
  expenses: Expense[]
  shoppingList: ShoppingItem[]
  bikeRoutes: BikeRoute[]
  workouts: WorkoutSession[]
}

export type MoodEmoji = '😤' | '😐' | '🙂' | '😊' | '🔥'

// ─── TURKEY / ANIMAL TASKS ───────────────────────────────────────────────────
export interface TurkeyTasks {
  fedMorning?: TaskRecord
  waterGiven?: TaskRecord
  fedEvening?: TaskRecord
}

export interface TaskRecord {
  done: boolean
  time: string    // "HH:MM"
  who?: string
}

// ─── SHOPPING & EXPENSES ─────────────────────────────────────────────────────
export interface ShoppingItem {
  id: string
  name: string
  done: boolean
  addedAt: string
}

export interface Expense {
  id: string
  amount: number
  description: string
  createdAt: string
}

// ─── GYM / WORKOUT ───────────────────────────────────────────────────────────
export interface Routine {
  id: string
  name: string
  emoji: string
  muscleGroups: MuscleGroup[]
  exercises: RoutineExercise[]
  createdAt: string
}

export interface RoutineExercise {
  exerciseId: string
  sets: number
  repsTarget: number
  weightTarget: number
}

export interface Exercise {
  id: string
  name: string
  muscle: MuscleGroup
  equipment?: string
}

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Brazos'
  | 'Core'
  | 'Cardio'

export interface WorkoutSession {
  id: string
  routineId?: string
  title: string
  date: string
  durationSec: number
  exercises: LiveExercise[]
  volumeKg: number
  photoDataUrl?: string
  notes?: string
  postedToFeed: boolean
}

export interface LiveExercise {
  exerciseId: string
  name: string
  muscle: MuscleGroup
  sets: LiveSet[]
}

export interface LiveSet {
  id: string
  weightKg: number
  reps: number
  done: boolean
  oneRM?: number        // Epley: weight * (1 + reps/30)
}

// ─── BIKE / GPS ───────────────────────────────────────────────────────────────
export interface BikeRoute {
  id: string
  date: string
  startedAt: string
  finishedAt: string
  durationMin: number
  distanceKm: number
  avgSpeedKmh: number
  maxSpeedKmh: number
  coords: RouteCoord[]
}

export interface RouteCoord {
  lat: number
  lng: number
  speedKmh: number
  ts: number
}

// ─── STREAK SYSTEM ───────────────────────────────────────────────────────────
export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  shieldsLeft: number          // 0–2, resets weekly
  shieldsUsedThisWeek: number
  zenMode: boolean
  activeDays: string[]         // ISO dates of all active days
}

// ─── SOCIAL FEED ─────────────────────────────────────────────────────────────
export interface FeedPost {
  id: string
  authorName: string
  authorEmoji: string
  workoutTitle: string
  volumeKg: number
  durationMin: number
  date: string
  reactions: number
  isOwn: boolean
}

// ─── WEEKLY BALANCE ──────────────────────────────────────────────────────────
export interface WeekDay {
  date: string
  label: string           // "Lun", "Mar"…
  steps: number
  bikeKm: number
  studyMin: number
  workoutCount: number
  turkeyDone: number
  score: number           // 0–100
}
