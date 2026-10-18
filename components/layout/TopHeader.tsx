'use client'

import { useAppStore } from '@/lib/store'
import { useStreakStore } from '@/lib/streakStore'
import { formatDateReadable } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { AppMode, TabId } from '@/lib/types'

const MODES: { id: AppMode; label: string }[] = [
  { id: 'ALL', label: 'Todo' },
  { id: 'CLUB', label: '🏋️ Gym' },
  { id: 'HOME', label: '🏠 Casa' },
]

export function TopHeader() {
  const { mode, setMode, currentDate, changeDay, setCurrentDate, setActiveTab } = useAppStore()
  const { currentStreak, shieldsLeft, zenMode, toggleZen } = useStreakStore()

  return (
    <header className="studio-card rounded-2xl p-3 space-y-2.5 mx-3 mt-3">
      {/* Row 1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg shadow-emerald-500/20">
            ⚡
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-white leading-tight">LifeOS Studio</h2>
            <p className="text-[11px] text-emerald-400 font-semibold capitalize truncate max-w-[160px]">
              {formatDateReadable(currentDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Streak badge */}
          <button
            onClick={() => setActiveTab('weekly' as TabId)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-extrabold text-amber-400 flex items-center gap-1"
          >
            {zenMode ? '👻' : '🔥'} {currentStreak}d
          </button>

          {/* Shields */}
          <button
            onClick={toggleZen}
            title={zenMode ? 'Salir del Modo Zen' : 'Activar Modo Zen/Fantasma'}
            className={cn(
              'px-2 py-1.5 rounded-xl text-xs font-bold border transition-all',
              zenMode
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            )}
          >
            🛡️{shieldsLeft}
          </button>

          {/* Voice */}
          <button
            onClick={() => {
              const msg = new SpeechSynthesisUtterance(`Hola, estás en LifeOS Studio. Día ${formatDateReadable(currentDate)}. Racha actual: ${currentStreak} días.`)
              msg.lang = 'es-ES'
              window.speechSynthesis.speak(msg)
            }}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 transition-all"
          >
            🎙️ <span className="hidden sm:inline">Voz</span>
          </button>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        {/* Date selector */}
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() => changeDay(-1)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            ◀
          </button>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent text-xs font-bold font-mono text-white text-center focus:outline-none w-[108px]"
          />
          <button
            onClick={() => changeDay(1)}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            ▶
          </button>
        </div>

        {/* Mode switcher */}
        <div className="flex items-center gap-0.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all',
                mode === m.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
