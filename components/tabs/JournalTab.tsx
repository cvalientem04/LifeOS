'use client'

import { useState, useRef } from 'react'
import { useDayStore } from '@/lib/dayStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { formatDateReadable, formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { motion, AnimatePresence } from 'framer-motion'

export function JournalTab() {
  const { currentDate } = useAppStore()
  const dayStore = useDayStore()
  const day = dayStore.getDay(currentDate)

  const [text, setText] = useState(day.journalText ?? '')
  const [dictating, setDictating] = useState(false)
  const recognitionRef = useRef<any>(null)

  function startDictation() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba Chrome.')
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'es-ES'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setText((prev) => prev + ' ' + transcript)
    }
    rec.onend = () => setDictating(false)
    rec.start()
    recognitionRef.current = rec
    setDictating(true)
  }

  function stopDictation() {
    recognitionRef.current?.stop()
    setDictating(false)
  }

  function saveJournal() {
    dayStore.saveJournal(currentDate, text)
  }

  function speakSummary() {
    const d = dayStore.getDay(currentDate)
    const summary = `
      Resumen del día ${formatDateReadable(currentDate)}.
      ${d.steps.toLocaleString()} pasos.
      ${d.bikeKm.toFixed(1)} kilómetros en bici.
      ${d.studyMin} minutos de estudio.
      ${d.workouts.length} entrenamientos.
      ${d.journalText ? 'Diario: ' + d.journalText.slice(0, 200) : 'Sin diario escrito.'}
    `
    const msg = new SpeechSynthesisUtterance(summary)
    msg.lang = 'es-ES'
    msg.rate = 1.05
    window.speechSynthesis.speak(msg)
  }

  // All days with journal entries
  const allDays = Object.values(dayStore.days)
    .filter((d) => d.journalText)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      {/* Editor */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white">
              📓 Diario Personal <span className="text-emerald-400 text-sm">({formatDateShort(currentDate)})</span>
            </h3>
            <p className="text-[11px] text-slate-400">Escribe o pulsa el micrófono para dictar</p>
          </div>
          <button
            onClick={dictating ? stopDictation : startDictation}
            className={cn(
              'px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-all',
              dictating
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            )}
          >
            🎙️ {dictating ? 'Detener dictado' : 'Dictar mi Día'}
          </button>
        </div>

        {/* Mood badges */}
        {day.mood && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-400">Estado:</span>
            <span className="text-lg">{day.mood}</span>
          </div>
        )}

        {/* Day stats badges */}
        <div className="flex flex-wrap gap-1.5">
          {day.steps > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[10px] font-bold">
              👣 {day.steps.toLocaleString()} pasos
            </span>
          )}
          {day.bikeKm > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
              🚴 {day.bikeKm.toFixed(1)} km
            </span>
          )}
          {day.workouts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              🏋️ {day.workouts.reduce((s, w) => s + w.volumeKg, 0).toLocaleString()} kg
            </span>
          )}
          {day.studyMin > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold">
              📚 {day.studyMin} min estudio
            </span>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Escribe o dicta cómo te has sentido hoy, qué has aprendido, tus reflexiones..."
          className="w-full studio-input rounded-xl p-3 text-xs resize-none"
        />

        <div className="flex gap-2">
          <button onClick={saveJournal}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all">
            💾 Guardar Diario
          </button>
          <button onClick={speakSummary}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition-all"
            title="Escuchar resumen del día en voz alta">
            🔊 Escuchar
          </button>
        </div>
      </StudioCard>

      {/* History */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase text-slate-400 px-1">
          📚 Archivo de Días ({allDays.length} entradas)
        </h4>
        <AnimatePresence>
          {allDays.map((d) => {
            const vol = d.workouts.reduce((s, w) => s + w.volumeKg, 0)
            return (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="studio-card rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white capitalize">
                    {formatDateShort(d.date)}
                  </span>
                  {d.mood && <span className="text-base">{d.mood}</span>}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {d.journalText}
                </p>
                <div className="flex flex-wrap gap-1">
                  {d.steps > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 text-[10px]">👣 {d.steps.toLocaleString()}</span>
                  )}
                  {d.bikeKm > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px]">🚴 {d.bikeKm.toFixed(1)} km</span>
                  )}
                  {vol > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px]">🏋️ {vol.toLocaleString()} kg</span>
                  )}
                  {d.studyMin > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px]">📚 {d.studyMin}min</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {allDays.length === 0 && (
          <div className="studio-card rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">📓</p>
            <p className="text-sm font-bold text-slate-300">Sin entradas en el diario</p>
            <p className="text-xs text-slate-500 mt-1">Empieza escribiendo cómo fue tu día</p>
          </div>
        )}
      </div>
    </div>
  )
}
