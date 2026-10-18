'use client'

import { useDayStore } from '@/lib/dayStore'
import { useGymStore } from '@/lib/gymStore'
import { useStreakStore } from '@/lib/streakStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { formatMinutes, todayISO } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TabId } from '@/lib/types'

const DEMO_FRIENDS = [
  { name: 'Carlos', emoji: '🦁', title: 'Día de Espalda', vol: 8240, min: 55, reactions: 7 },
  { name: 'María',  emoji: '🐯', title: 'Piernas 🔥',    vol: 6100, min: 42, reactions: 12 },
  { name: 'Javi',   emoji: '🦊', title: 'Full Body',      vol: 4890, min: 38, reactions: 3 },
]

const MOODS = ['😤', '😐', '🙂', '😊', '🔥'] as const

export function HomeTab() {
  const { currentDate, setActiveTab } = useAppStore()
  const dayStore = useDayStore()
  const gymStore = useGymStore()
  const { currentStreak } = useStreakStore()
  const day = dayStore.getDay(currentDate)

  const [mealInput, setMealInput] = useState('')
  const [studyInput, setStudyInput] = useState('')
  const [carInput, setCarInput] = useState('')

  const totalWorkoutVol = day.workouts.reduce((s, w) => s + w.volumeKg, 0)
  const turkeyDone = [day.turkeyTasks.fedMorning, day.turkeyTasks.waterGiven, day.turkeyTasks.fedEvening]
    .filter((t) => t?.done).length

  function addMeal() {
    if (!mealInput.trim()) return
    dayStore.addMeal(currentDate, mealInput.trim())
    setMealInput('')
  }

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          color="emerald" icon="🏋️" label="Fuerza Hoy"
          value={totalWorkoutVol > 0 ? `${totalWorkoutVol.toLocaleString()} kg` : '0 kg'}
          sub="Abrir Estudio ➔"
          onClick={() => setActiveTab('gym' as TabId)}
        />
        <StatCard
          color="cyan" icon="👣" label="Pasos & Bici"
          value={`${day.steps.toLocaleString()} pasos`}
          sub={`${day.bikeKm.toFixed(1)} km bici`}
          onClick={() => setActiveTab('bike' as TabId)}
        />
        <StatCard
          color="amber" icon="🦃" label="Pavos / Hogar"
          value={`${turkeyDone}/3 turnos`}
          sub="Ver hogar ➔"
          onClick={() => setActiveTab('hogar' as TabId)}
        />
        <StatCard
          color="violet" icon="📚" label="Estudio & Coche"
          value={formatMinutes(day.studyMin)}
          sub={`${day.carMin} min coche`}
          onClick={() => setActiveTab('journal' as TabId)}
        />
      </div>

      {/* Quick Log */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">⏱️ Registro Rápido</h3>
          <button onClick={() => setActiveTab('weekly' as TabId)} className="text-[11px] text-emerald-400 font-bold">
            Balance 7 días 📊
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Study */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-violet-400 block">📚 Estudio</span>
            <span className="text-base font-extrabold font-mono text-white">{formatMinutes(day.studyMin)}</span>
            <div className="flex gap-1 mt-2">
              <button onClick={() => dayStore.addStudyMin(currentDate, 30)}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-xs font-bold text-violet-300">+30m</button>
              <button onClick={() => dayStore.addStudyMin(currentDate, 60)}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-xs font-bold text-violet-300">+1h</button>
            </div>
          </div>
          {/* Car */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400 block">🚗 Coche</span>
            <span className="text-base font-extrabold font-mono text-white">{formatMinutes(day.carMin)}</span>
            <div className="flex gap-1 mt-2">
              <button onClick={() => dayStore.addCarMin(currentDate, 15)}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-xs font-bold text-amber-300">+15m</button>
              <button onClick={() => dayStore.addCarMin(currentDate, 30)}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-xs font-bold text-amber-300">+30m</button>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
          <div className="flex gap-1">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => dayStore.setMood(currentDate, m)}
                className={`text-lg transition-transform ${day.mood === m ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div>
          <div className="flex gap-1.5">
            <input
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMeal()}
              placeholder="🥗 Anotar comida (ej. Pollo con arroz)..."
              className="flex-1 studio-input rounded-xl px-3 py-2 text-xs"
            />
            <button onClick={addMeal}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">
              + Comida
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <AnimatePresence>
              {day.meals.map((meal, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => dayStore.removeMeal(currentDate, i)}
                  className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-300 transition-colors"
                  title="Toca para borrar"
                >
                  {meal}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </StudioCard>

      {/* Social Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-white">🏆 Sesiones (Tú y Amigos)</h3>
          <button onClick={() => setActiveTab('gym' as TabId)} className="text-xs font-bold text-emerald-400">
            Ir a Fuerza ➔
          </button>
        </div>

        {/* Own workouts */}
        {day.workouts.map((w) => (
          <StudioCard key={w.id} className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-white">{w.title}</p>
                <p className="text-[11px] text-slate-400">
                  {w.exercises.length} ejercicios · {Math.round(w.durationSec / 60)} min · {w.volumeKg.toLocaleString()} kg
                </p>
              </div>
              <span className="text-lg">⚡</span>
            </div>
          </StudioCard>
        ))}

        {/* Demo friends */}
        {DEMO_FRIENDS.map((f) => (
          <StudioCard key={f.name} className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-base">{f.emoji}</span>
                <div>
                  <p className="text-xs font-extrabold text-white">{f.name} · {f.title}</p>
                  <p className="text-[11px] text-slate-400">{f.vol.toLocaleString()} kg · {f.min} min</p>
                </div>
              </div>
              <button className="px-2.5 py-1 rounded-xl bg-slate-800 text-sm">
                💪 {f.reactions}
              </button>
            </div>
          </StudioCard>
        ))}
      </div>
    </div>
  )
}

function StatCard({ color, icon, label, value, sub, onClick }: {
  color: string; icon: string; label: string; value: string; sub: string; onClick?: () => void
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-400 hover:border-emerald-500/40',
    cyan: 'text-cyan-400 hover:border-cyan-500/40',
    amber: 'text-amber-400 hover:border-amber-500/40',
    violet: 'text-violet-400 hover:border-violet-500/40',
  }
  return (
    <div
      onClick={onClick}
      className={`studio-card rounded-2xl p-3 cursor-pointer transition-all ${colors[color]}`}
    >
      <span className={`text-[10px] font-bold uppercase block ${colors[color].split(' ')[0]}`}>
        {icon} {label}
      </span>
      <span className="text-sm sm:text-base font-extrabold text-white block mt-0.5">{value}</span>
      <span className="text-[10px] text-slate-500">{sub}</span>
    </div>
  )
}
