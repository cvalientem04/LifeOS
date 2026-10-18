import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Routine, Exercise, LiveExercise, LiveSet, MuscleGroup } from './types'

function uid() { return Math.random().toString(36).slice(2, 10) }

// ─── EJERCICIO CATÁLOGO ───────────────────────────────────────────────────────
export const EXERCISE_CATALOGUE: Exercise[] = [
  // Pecho
  { id: 'bench_bar', name: 'Press Banca (Barra)', muscle: 'Pecho' },
  { id: 'bench_db', name: 'Press Banca (Mancuernas)', muscle: 'Pecho' },
  { id: 'incline_bar', name: 'Press Inclinado (Barra)', muscle: 'Pecho' },
  { id: 'incline_db', name: 'Press Inclinado (Mancuernas)', muscle: 'Pecho' },
  { id: 'dips', name: 'Fondos en Paralelas', muscle: 'Pecho' },
  { id: 'fly_db', name: 'Aperturas (Mancuernas)', muscle: 'Pecho' },
  { id: 'cable_cross', name: 'Cruce de Poleas', muscle: 'Pecho' },
  { id: 'pushup', name: 'Flexiones', muscle: 'Pecho' },
  // Espalda
  { id: 'deadlift', name: 'Peso Muerto (Barra)', muscle: 'Espalda' },
  { id: 'pullup', name: 'Dominadas', muscle: 'Espalda' },
  { id: 'row_bar', name: 'Remo con Barra', muscle: 'Espalda' },
  { id: 'row_db', name: 'Remo con Mancuerna', muscle: 'Espalda' },
  { id: 'lat_pull', name: 'Jalón al Pecho (Polea)', muscle: 'Espalda' },
  { id: 'seated_row', name: 'Remo Sentado (Polea)', muscle: 'Espalda' },
  { id: 'pullover', name: 'Pull-Over (Mancuerna)', muscle: 'Espalda' },
  // Piernas
  { id: 'squat', name: 'Sentadilla (Barra)', muscle: 'Piernas' },
  { id: 'leg_press', name: 'Prensa de Piernas', muscle: 'Piernas' },
  { id: 'rdl', name: 'Peso Muerto Rumano', muscle: 'Piernas' },
  { id: 'lunges', name: 'Zancadas', muscle: 'Piernas' },
  { id: 'leg_curl', name: 'Curl Femoral (Máquina)', muscle: 'Piernas' },
  { id: 'leg_ext', name: 'Extensión de Piernas', muscle: 'Piernas' },
  { id: 'calf_raise', name: 'Elevación de Talones', muscle: 'Piernas' },
  { id: 'hip_thrust', name: 'Hip Thrust (Barra)', muscle: 'Piernas' },
  // Hombros
  { id: 'ohp', name: 'Press Militar (Barra)', muscle: 'Hombros' },
  { id: 'ohp_db', name: 'Press Hombros (Mancuernas)', muscle: 'Hombros' },
  { id: 'lat_raise', name: 'Elevaciones Laterales', muscle: 'Hombros' },
  { id: 'front_raise', name: 'Elevaciones Frontales', muscle: 'Hombros' },
  { id: 'face_pull', name: 'Face Pull (Polea)', muscle: 'Hombros' },
  { id: 'shrugs', name: 'Encogimientos (Barra)', muscle: 'Hombros' },
  // Brazos
  { id: 'curl_bar', name: 'Curl Bíceps (Barra)', muscle: 'Brazos' },
  { id: 'curl_db', name: 'Curl Bíceps (Mancuerna)', muscle: 'Brazos' },
  { id: 'hammer_curl', name: 'Curl Martillo', muscle: 'Brazos' },
  { id: 'tricep_push', name: 'Extensión Tríceps Polea', muscle: 'Brazos' },
  { id: 'skull_crusher', name: 'Skull Crusher', muscle: 'Brazos' },
  { id: 'close_bench', name: 'Press Cerrado (Barra)', muscle: 'Brazos' },
  // Core
  { id: 'plank', name: 'Plancha', muscle: 'Core' },
  { id: 'crunch', name: 'Crunch Abdominal', muscle: 'Core' },
  { id: 'leg_raise', name: 'Elevación de Piernas', muscle: 'Core' },
  { id: 'ab_wheel', name: 'Rueda Abdominal', muscle: 'Core' },
]

// ─── RUTINAS POR DEFECTO ──────────────────────────────────────────────────────
const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'r-pecho', name: 'Día de Pecho', emoji: '💪', muscleGroups: ['Pecho'],
    createdAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'bench_bar', sets: 4, repsTarget: 8, weightTarget: 80 },
      { exerciseId: 'incline_db', sets: 3, repsTarget: 10, weightTarget: 24 },
      { exerciseId: 'fly_db', sets: 3, repsTarget: 12, weightTarget: 16 },
      { exerciseId: 'dips', sets: 3, repsTarget: 12, weightTarget: 0 },
    ],
  },
  {
    id: 'r-espalda', name: 'Día de Espalda', emoji: '🦅', muscleGroups: ['Espalda'],
    createdAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'deadlift', sets: 4, repsTarget: 5, weightTarget: 120 },
      { exerciseId: 'pullup', sets: 4, repsTarget: 8, weightTarget: 0 },
      { exerciseId: 'row_bar', sets: 3, repsTarget: 10, weightTarget: 70 },
      { exerciseId: 'lat_pull', sets: 3, repsTarget: 12, weightTarget: 60 },
    ],
  },
  {
    id: 'r-piernas', name: 'Día de Piernas', emoji: '🦵', muscleGroups: ['Piernas'],
    createdAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'squat', sets: 4, repsTarget: 6, weightTarget: 100 },
      { exerciseId: 'leg_press', sets: 3, repsTarget: 12, weightTarget: 180 },
      { exerciseId: 'rdl', sets: 3, repsTarget: 10, weightTarget: 80 },
      { exerciseId: 'leg_curl', sets: 3, repsTarget: 12, weightTarget: 50 },
      { exerciseId: 'calf_raise', sets: 4, repsTarget: 15, weightTarget: 60 },
    ],
  },
  {
    id: 'r-hombros', name: 'Día de Hombros', emoji: '🏔️', muscleGroups: ['Hombros', 'Brazos'],
    createdAt: new Date().toISOString(),
    exercises: [
      { exerciseId: 'ohp', sets: 4, repsTarget: 8, weightTarget: 60 },
      { exerciseId: 'lat_raise', sets: 4, repsTarget: 15, weightTarget: 10 },
      { exerciseId: 'face_pull', sets: 3, repsTarget: 15, weightTarget: 30 },
      { exerciseId: 'curl_bar', sets: 3, repsTarget: 10, weightTarget: 40 },
      { exerciseId: 'tricep_push', sets: 3, repsTarget: 12, weightTarget: 35 },
    ],
  },
]

interface GymStore {
  routines: Routine[]
  // Live session
  activeRoutineId: string | null
  liveExercises: LiveExercise[]
  sessionTitle: string
  sessionStartTs: number | null
  // History (all saved sessions)
  sessionCount: number

  // Routines
  addRoutine: (name: string, emoji: string) => void
  removeRoutine: (id: string) => void
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void

  // Live session
  startSession: (routineId: string | null, title: string) => void
  addExerciseToSession: (exerciseId: string) => void
  addSetToExercise: (exerciseIdx: number) => void
  updateSet: (exerciseIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => void
  toggleSetDone: (exerciseIdx: number, setIdx: number) => void
  discardSession: () => void
  incrementSessionCount: () => void
}

export const useGymStore = create<GymStore>()(
  persist(
    (set, get) => ({
      routines: DEFAULT_ROUTINES,
      activeRoutineId: null,
      liveExercises: [],
      sessionTitle: '',
      sessionStartTs: null,
      sessionCount: 0,

      addRoutine(name, emoji) {
        const r: Routine = {
          id: uid(), name, emoji, muscleGroups: [], exercises: [],
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ routines: [...s.routines, r] }))
      },

      removeRoutine(id) {
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }))
      },

      addExerciseToRoutine(routineId, exerciseId) {
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id !== routineId ? r : {
              ...r,
              exercises: [...r.exercises, { exerciseId, sets: 3, repsTarget: 10, weightTarget: 0 }],
            }
          ),
        }))
      },

      startSession(routineId, title) {
        const routine = routineId
          ? get().routines.find((r) => r.id === routineId)
          : null

        const liveExercises: LiveExercise[] = (routine?.exercises ?? []).map((re) => {
          const ex = EXERCISE_CATALOGUE.find((e) => e.id === re.exerciseId)!
          return {
            exerciseId: re.exerciseId,
            name: ex?.name ?? re.exerciseId,
            muscle: ex?.muscle ?? 'Core',
            sets: Array.from({ length: re.sets }, () => ({
              id: uid(),
              weightKg: re.weightTarget,
              reps: re.repsTarget,
              done: false,
            })),
          }
        })

        set({
          activeRoutineId: routineId,
          liveExercises,
          sessionTitle: title,
          sessionStartTs: Date.now(),
        })
      },

      addExerciseToSession(exerciseId) {
        const ex = EXERCISE_CATALOGUE.find((e) => e.id === exerciseId)
        if (!ex) return
        const newEx: LiveExercise = {
          exerciseId,
          name: ex.name,
          muscle: ex.muscle,
          sets: [{ id: uid(), weightKg: 0, reps: 10, done: false }],
        }
        set((s) => ({ liveExercises: [...s.liveExercises, newEx] }))
      },

      addSetToExercise(exerciseIdx) {
        set((s) => ({
          liveExercises: s.liveExercises.map((ex, i) => {
            if (i !== exerciseIdx) return ex
            const last = ex.sets[ex.sets.length - 1]
            return {
              ...ex,
              sets: [...ex.sets, { id: uid(), weightKg: last?.weightKg ?? 0, reps: last?.reps ?? 10, done: false }],
            }
          }),
        }))
      },

      updateSet(exerciseIdx, setIdx, field, value) {
        set((s) => ({
          liveExercises: s.liveExercises.map((ex, i) =>
            i !== exerciseIdx ? ex : {
              ...ex,
              sets: ex.sets.map((st, j) =>
                j !== setIdx ? st : { ...st, [field]: value }
              ),
            }
          ),
        }))
      },

      toggleSetDone(exerciseIdx, setIdx) {
        set((s) => ({
          liveExercises: s.liveExercises.map((ex, i) =>
            i !== exerciseIdx ? ex : {
              ...ex,
              sets: ex.sets.map((st, j) =>
                j !== setIdx ? st : {
                  ...st,
                  done: !st.done,
                  oneRM: !st.done
                    ? Math.round(st.weightKg * (1 + st.reps / 30))
                    : undefined,
                }
              ),
            }
          ),
        }))
      },

      discardSession() {
        set({ activeRoutineId: null, liveExercises: [], sessionTitle: '', sessionStartTs: null })
      },

      incrementSessionCount() {
        set((s) => ({ sessionCount: s.sessionCount + 1 }))
      },
    }),
    { name: 'lifeos-gym' }
  )
)
