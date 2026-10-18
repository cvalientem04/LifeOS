'use client'

import { useState, useEffect, useRef } from 'react'
import { useGymStore, EXERCISE_CATALOGUE } from '@/lib/gymStore'
import { useDayStore } from '@/lib/dayStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { calcOneRM, calcSessionVolume, formatSec, uid } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { motion, AnimatePresence } from 'framer-motion'
import type { MuscleGroup, WorkoutSession } from '@/lib/types'

const ALL_MUSCLES: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']

type SubView = 'hub' | 'active' | 'save' | 'trophy'

export function GymTab() {
  const [subview, setSubview] = useState<SubView>('hub')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [restSec, setRestSec] = useState(0)
  const [saveTitle, setSaveTitle] = useState('')
  const [saveNotes, setSaveNotes] = useState('')
  const [trophySession, setTrophySession] = useState<WorkoutSession | null>(null)
  const [newRoutineName, setNewRoutineName] = useState('')

  const gym = useGymStore()
  const dayStore = useDayStore()
  const { currentDate } = useAppStore()

  // Cronómetro
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (subview === 'active' && gym.sessionStartTs) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - gym.sessionStartTs!) / 1000))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [subview, gym.sessionStartTs])

  // Descanso
  useEffect(() => {
    if (restSec <= 0) return
    const t = setTimeout(() => setRestSec((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [restSec])

  const volume = calcSessionVolume(gym.liveExercises)
  const totalSets = gym.liveExercises.reduce((s, ex) => s + ex.sets.filter((st) => st.done).length, 0)
  const totalSetsPossible = gym.liveExercises.reduce((s, ex) => s + ex.sets.length, 0)
  const progress = totalSetsPossible ? (totalSets / totalSetsPossible) * 100 : 0

  const filteredExercises = EXERCISE_CATALOGUE.filter((ex) => {
    const matchMuscle = !muscleFilter || ex.muscle === muscleFilter
    const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
    return matchMuscle && matchSearch
  })

  function startRoutine(routineId: string, title: string) {
    gym.startSession(routineId, title)
    setSaveTitle(title)
    setElapsed(0)
    setSubview('active')
  }

  function startFree() {
    gym.startSession(null, 'Sesión Libre')
    setSaveTitle('Sesión Libre')
    setElapsed(0)
    setSubview('active')
  }

  function confirmPicker() {
    selected.forEach((id) => gym.addExerciseToSession(id))
    setSelected([])
    setPickerOpen(false)
  }

  function saveWorkout() {
    const session: WorkoutSession = {
      id: uid(),
      routineId: gym.activeRoutineId ?? undefined,
      title: saveTitle,
      date: currentDate,
      durationSec: elapsed,
      exercises: gym.liveExercises,
      volumeKg: volume,
      notes: saveNotes,
      postedToFeed: true,
    }
    dayStore.saveWorkout(currentDate, session)
    gym.incrementSessionCount()
    gym.discardSession()
    setTrophySession(session)
    setSubview('trophy')
  }

  // ─── HUB ───────────────────────────────────────────────────────────────────
  if (subview === 'hub') return (
    <div className="space-y-4">
      <StudioCard className="p-4 bg-gradient-to-br from-[#111927] to-[#0d121c] border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">LifeOS Performance Studio</span>
            <h2 className="text-xl font-black text-white">Tus Planes de Fuerza</h2>
          </div>
          <button onClick={startFree}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all">
            ⚡ Sesión Libre
          </button>
        </div>
        <p className="text-xs text-slate-400">Elige un día para abrirlo con cronómetro, marcas anteriores y cálculo de 1RM en tiempo real.</p>
      </StudioCard>

      {/* Create routine */}
      <div className="flex gap-2">
        <input
          value={newRoutineName}
          onChange={(e) => setNewRoutineName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newRoutineName.trim()) {
              gym.addRoutine(newRoutineName.trim(), '💪')
              setNewRoutineName('')
            }
          }}
          placeholder="Nombre nuevo plan... (Enter para crear)"
          className="flex-1 studio-input rounded-xl px-3 py-2 text-xs"
        />
        <button
          onClick={() => { if (newRoutineName.trim()) { gym.addRoutine(newRoutineName.trim(), '💪'); setNewRoutineName('') } }}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
          ➕
        </button>
      </div>

      {/* Routine cards */}
      <div className="space-y-3">
        {gym.routines.map((r) => (
          <StudioCard key={r.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">{r.emoji} {r.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.exercises.length} ejercicios</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startRoutine(r.id, r.name)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all">
                  ▶ Iniciar
                </button>
                <button
                  onClick={() => gym.removeRoutine(r.id)}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 text-xs transition-all">
                  🗑️
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {r.exercises.slice(0, 4).map((re) => {
                const ex = EXERCISE_CATALOGUE.find((e) => e.id === re.exerciseId)
                return (
                  <span key={re.exerciseId} className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                    {ex?.name ?? re.exerciseId}
                  </span>
                )
              })}
              {r.exercises.length > 4 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-500">
                  +{r.exercises.length - 4} más
                </span>
              )}
            </div>
          </StudioCard>
        ))}
      </div>

      <p className="text-center text-xs text-slate-600 py-2">
        Total sesiones registradas: <span className="text-emerald-400 font-bold">{gym.sessionCount}</span>
      </p>
    </div>
  )

  // ─── ACTIVE SESSION ────────────────────────────────────────────────────────
  if (subview === 'active') return (
    <div className="space-y-4">
      {/* Sticky header */}
      <StudioCard className="p-4 sticky top-2 z-30 shadow-2xl border-t-2 border-t-emerald-500">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <button onClick={() => setSubview('hub')}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-xs">⌄</button>
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Sesión Activa</span>
              <span className="text-sm font-extrabold text-white">{gym.sessionTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRestSec(90)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs font-mono font-bold text-amber-300">
              ⏳ {restSec > 0 ? `${restSec}s` : 'Descanso'}
            </button>
            <button onClick={() => setSubview('save')}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md">
              Terminar ✓
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Live metrics */}
        <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[9px] uppercase text-slate-400 block">Tiempo</span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-400">{formatSec(elapsed)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 block">Tonelaje</span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-white">{volume.toLocaleString()} kg</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 block">Series ✓</span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-cyan-400">{totalSets}/{totalSetsPossible}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 block">1RM Pico</span>
            <span className="text-xs sm:text-sm font-extrabold font-mono text-amber-400">
              {gym.liveExercises.flatMap((ex) => ex.sets).filter((s) => s.oneRM).reduce((max, s) => Math.max(max, s.oneRM ?? 0), 0)} kg
            </span>
          </div>
        </div>
      </StudioCard>

      {/* Exercises */}
      {gym.liveExercises.map((ex, ei) => (
        <StudioCard key={ei} className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">{ex.name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">{ex.muscle}</span>
          </div>

          {/* Set headers */}
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-1.5 text-[9px] uppercase text-slate-500 font-bold px-1">
            <span>#</span><span>Anterior</span><span>KG</span><span>Reps</span><span>✓</span>
          </div>

          {ex.sets.map((set, si) => (
            <motion.div
              key={set.id}
              animate={set.done ? { backgroundColor: 'rgba(16,185,129,0.12)' } : { backgroundColor: 'rgba(15,23,42,0)' }}
              className={cn(
                'grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-1.5 items-center p-2 rounded-xl border transition-colors',
                set.done ? 'set-row-done border-emerald-500/40' : 'border-slate-800'
              )}
            >
              <span className="text-[10px] text-slate-500 font-mono text-center">{si + 1}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {set.oneRM ? `1RM: ${set.oneRM}kg` : '—'}
              </span>
              <input
                type="number"
                value={set.weightKg}
                onChange={(e) => gym.updateSet(ei, si, 'weightKg', +e.target.value)}
                className="studio-input rounded-lg px-2 py-1 text-xs font-mono text-center w-full"
              />
              <input
                type="number"
                value={set.reps}
                onChange={(e) => gym.updateSet(ei, si, 'reps', +e.target.value)}
                className="studio-input rounded-lg px-2 py-1 text-xs font-mono text-center w-full"
              />
              <button
                onClick={() => gym.toggleSetDone(ei, si)}
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all',
                  set.done
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-emerald-500/40 shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}
              >
                ✓
              </button>
            </motion.div>
          ))}

          <button
            onClick={() => gym.addSetToExercise(ei)}
            className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 font-bold transition-colors">
            + Serie
          </button>
        </StudioCard>
      ))}

      <button
        onClick={() => setPickerOpen(true)}
        className="w-full py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs transition-all">
        + Añadir Ejercicios (Selector Visual)
      </button>

      <button
        onClick={() => { gym.discardSession(); setSubview('hub') }}
        className="w-full py-3 rounded-xl studio-card text-rose-400 hover:bg-rose-500/10 font-extrabold text-xs transition-all">
        🗑️ Descartar Sesión
      </button>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="studio-card rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-700"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <button onClick={() => setPickerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Cancelar</button>
                <span className="text-sm font-extrabold text-white">Seleccionar Ejercicios</span>
                <button onClick={confirmPicker}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-xs font-extrabold text-slate-950">
                  Añadir ({selected.length})
                </button>
              </div>

              <div className="p-3 space-y-2.5 border-b border-slate-800">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Buscar ejercicio..."
                  className="w-full studio-input rounded-xl px-3.5 py-2 text-xs"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setMuscleFilter(null)}
                    className={cn('px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all',
                      !muscleFilter ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'border-slate-700 text-slate-400'
                    )}>Todos</button>
                  {ALL_MUSCLES.map((m) => {
                    const count = selected.filter((id) =>
                      EXERCISE_CATALOGUE.find((e) => e.id === id)?.muscle === m
                    ).length
                    return (
                      <button
                        key={m}
                        onClick={() => setMuscleFilter(muscleFilter === m ? null : m)}
                        className={cn('px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all',
                          muscleFilter === m ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'border-slate-700 text-slate-400'
                        )}>
                        {m} {count > 0 && `(${count})`}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 p-2">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelected((s) =>
                      s.includes(ex.id) ? s.filter((i) => i !== ex.id) : [...s, ex.id]
                    )}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left',
                      selected.includes(ex.id) ? 'bg-emerald-500/15 text-emerald-300' : 'hover:bg-slate-800 text-slate-300'
                    )}
                  >
                    <span className="text-xs font-semibold">{ex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{ex.muscle}</span>
                      {selected.includes(ex.id) && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-slate-950 font-black">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // ─── SAVE SCREEN ──────────────────────────────────────────────────────────
  if (subview === 'save') return (
    <StudioCard className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button onClick={() => setSubview('active')}
          className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">←</button>
        <span className="text-sm font-extrabold text-white">Guardar Entrenamiento</span>
        <button onClick={saveWorkout}
          className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">
          Publicar ✓
        </button>
      </div>

      <input
        value={saveTitle}
        onChange={(e) => setSaveTitle(e.target.value)}
        className="w-full bg-transparent text-lg font-extrabold text-white border-b border-slate-800 pb-2 focus:outline-none"
      />

      <div className="grid grid-cols-3 gap-2 text-center bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">Duración</span>
          <span className="text-sm font-extrabold text-emerald-400">{formatSec(elapsed)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Volumen</span>
          <span className="text-sm font-extrabold text-white">{volume.toLocaleString()} kg</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Series</span>
          <span className="text-sm font-extrabold text-cyan-400">{totalSets}</span>
        </div>
      </div>

      <textarea
        value={saveNotes}
        onChange={(e) => setSaveNotes(e.target.value)}
        rows={3}
        placeholder="Notas del entrenamiento (cómo te sentiste, récords, molestias)..."
        className="w-full studio-input rounded-xl p-3 text-xs"
      />
    </StudioCard>
  )

  // ─── TROPHY ────────────────────────────────────────────────────────────────
  if (subview === 'trophy' && trophySession) return (
    <StudioCard className="p-6 text-center space-y-5 rounded-3xl">
      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
          ¡SESIÓN COMPLETADA! 🏆
        </span>
        <h2 className="text-2xl font-black text-white mt-2">¡Gran Trabajo!</h2>
        <p className="text-xs text-slate-400 mt-0.5">Sesión #{gym.sessionCount} registrada en tu historial</p>
      </div>

      <div className="bg-gradient-to-br from-[#0d1f1d] via-[#0f172a] to-[#090d16] border border-emerald-500/40 rounded-3xl p-5 text-left shadow-2xl">
        <h3 className="text-lg font-black text-white">{trophySession.title}</h3>
        <div className="space-y-1 mt-2">
          {trophySession.exercises.slice(0, 4).map((ex) => {
            const best = ex.sets.reduce((m, s) => s.done && s.oneRM && s.oneRM > m ? s.oneRM : m, 0)
            return (
              <p key={ex.exerciseId} className="text-xs text-slate-300">
                <span className="text-slate-500">▸</span> {ex.name}
                {best > 0 && <span className="text-emerald-400 ml-1">· 1RM {best}kg</span>}
              </p>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 font-bold border-t border-slate-700 pt-3">
          <span>⚡ LIFEOS STUDIO</span>
          <span className="text-emerald-400 font-mono">{trophySession.volumeKg.toLocaleString()} kg</span>
        </div>
      </div>

      <button
        onClick={() => { setSubview('hub'); setTrophySession(null) }}
        className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all">
        Continuar al Resumen Principal ➔
      </button>
    </StudioCard>
  )

  return null
}
