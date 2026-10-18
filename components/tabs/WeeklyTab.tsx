'use client'

import { useDayStore } from '@/lib/dayStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { getLast7Days, dayLabel, calcDayScore } from '@/lib/utils'
import { cn } from '@/lib/cn'

export function WeeklyTab() {
  const { currentDate } = useAppStore()
  const dayStore = useDayStore()
  const dates = getLast7Days(currentDate)

  const weekData = dates.map((date) => {
    const d = dayStore.getDay(date)
    const turkeyDone = [d.turkeyTasks.fedMorning, d.turkeyTasks.waterGiven, d.turkeyTasks.fedEvening]
      .filter((t) => t?.done).length
    const score = calcDayScore({
      steps: d.steps,
      bikeKm: d.bikeKm,
      studyMin: d.studyMin,
      workouts: d.workouts,
      turkeyDone,
    })
    return { date, label: dayLabel(date), ...d, turkeyDone, score }
  })

  const avgScore = Math.round(weekData.reduce((s, d) => s + d.score, 0) / 7)
  const totalWorkouts = weekData.reduce((s, d) => s + d.workouts.length, 0)
  const totalVolume = weekData.reduce((s, d) => s + d.workouts.reduce((ws, w) => ws + w.volumeKg, 0), 0)
  const totalSteps = weekData.reduce((s, d) => s + d.steps, 0)
  const totalKm = weekData.reduce((s, d) => s + d.bikeKm, 0)
  const totalStudy = weekData.reduce((s, d) => s + d.studyMin, 0)

  function scoreColor(s: number) {
    if (s >= 80) return 'text-emerald-400'
    if (s >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }

  const maxSteps = Math.max(...weekData.map((d) => d.steps), 1)

  return (
    <div className="space-y-4">
      {/* Global header */}
      <StudioCard className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400">Últimos 7 días</span>
            <h3 className="text-lg font-extrabold text-white">Balance de tu Semana</h3>
          </div>
          <span className={`text-2xl font-black font-mono ${scoreColor(avgScore)}`}>{avgScore}%</span>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: '🏋️', label: 'Entrenamientos', val: `${totalWorkouts}`, sub: `${totalVolume.toLocaleString()} kg total` },
            { icon: '👣', label: 'Total Pasos', val: totalSteps.toLocaleString(), sub: `⌀ ${Math.round(totalSteps / 7).toLocaleString()}/día` },
            { icon: '🚴', label: 'Km en Bici', val: `${totalKm.toFixed(1)} km`, sub: 'esta semana' },
            { icon: '📚', label: 'Estudio', val: `${Math.round(totalStudy / 60)}h ${totalStudy % 60}min`, sub: 'esta semana' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-base">{s.icon}</span>
              <p className="text-xs font-extrabold text-white mt-1">{s.val}</p>
              <p className="text-[10px] text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </StudioCard>

      {/* Day-by-day */}
      <div className="space-y-2">
        {weekData.map((d) => (
          <StudioCard key={d.date} className="p-3.5">
            <div className="flex items-center gap-3">
              {/* Score circle */}
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0', {
                'bg-emerald-500/20 text-emerald-400': d.score >= 80,
                'bg-amber-500/20 text-amber-400': d.score >= 50 && d.score < 80,
                'bg-slate-800 text-slate-500': d.score < 50,
              })}>
                {d.score}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white capitalize">{d.label} {d.date === currentDate ? '(hoy)' : ''}</span>
                  <span className="text-[10px] text-slate-500">{d.date}</span>
                </div>

                {/* Bars */}
                <div className="mt-1.5 space-y-1">
                  {/* Steps bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-12 shrink-0">👣 pasos</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${(d.steps / 10000) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 w-12 text-right">{d.steps.toLocaleString()}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {d.workouts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold">
                      🏋️ {d.workouts.length > 1 ? `${d.workouts.length} sesiones` : d.workouts[0]?.title}
                    </span>
                  )}
                  {d.bikeKm > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-bold">
                      🚴 {d.bikeKm.toFixed(1)} km
                    </span>
                  )}
                  {d.studyMin > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 text-[9px] font-bold">
                      📚 {d.studyMin}min
                    </span>
                  )}
                  {d.turkeyDone > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold">
                      🦃 {d.turkeyDone}/3
                    </span>
                  )}
                </div>
              </div>
            </div>
          </StudioCard>
        ))}
      </div>
    </div>
  )
}
