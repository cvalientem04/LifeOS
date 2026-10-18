'use client'

import { useState } from 'react'
import { useDayStore } from '@/lib/dayStore'
import { useAppStore } from '@/lib/store'
import { StudioCard } from '@/components/ui/StudioCard'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'

type TurkeyKey = 'fedMorning' | 'waterGiven' | 'fedEvening'

const TURKEY_TASKS: { key: TurkeyKey; icon: string; label: string }[] = [
  { key: 'fedMorning', icon: '🌾', label: 'Mañana' },
  { key: 'waterGiven', icon: '💧', label: 'Agua' },
  { key: 'fedEvening', icon: '🌽', label: 'Tarde' },
]

export function HogarTab() {
  const { currentDate } = useAppStore()
  const dayStore = useDayStore()
  const day = dayStore.getDay(currentDate)

  const [shopInput, setShopInput] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expDesc, setExpDesc] = useState('')

  const totalExpenses = day.expenses.reduce((s, e) => s + e.amount, 0)

  function addShop() {
    if (!shopInput.trim()) return
    dayStore.addShoppingItem(shopInput.trim())
    setShopInput('')
  }

  function addExp() {
    const amt = parseFloat(expAmount)
    if (!amt || !expDesc.trim()) return
    dayStore.addExpense(currentDate, amt, expDesc.trim())
    setExpAmount('')
    setExpDesc('')
  }

  return (
    <div className="space-y-4">
      {/* Turkey Tasks */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">🦃 Cuidado de los Pavos</h3>
            <p className="text-[11px] text-slate-400">Toca para registrar la hora exacta</p>
          </div>
          <button
            onClick={() => dayStore.addTurkeyFeedToShop()}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all hover:bg-amber-500/30">
            + Falta Pienso
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TURKEY_TASKS.map(({ key, icon, label }) => {
            const task = day.turkeyTasks[key]
            return (
              <motion.button
                key={key}
                onClick={() => dayStore.toggleTurkeyTask(currentDate, key)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-3 rounded-xl border flex flex-col items-center text-center transition-all',
                  task?.done
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-emerald-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-900'
                )}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-bold text-white mt-1">{label}</span>
                <span className={cn('text-[10px] font-mono mt-0.5', task?.done ? 'text-emerald-400' : 'text-slate-500')}>
                  {task?.done ? `✓ ${task.time}` : 'Pendiente'}
                </span>
              </motion.button>
            )
          })}
        </div>
      </StudioCard>

      {/* Shopping List */}
      <StudioCard className="p-4 space-y-3">
        <h3 className="text-base font-extrabold text-white">🛒 Lista de la Compra</h3>
        <div className="flex gap-2">
          <input
            value={shopInput}
            onChange={(e) => setShopInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addShop()}
            placeholder="Añadir producto (ej. Leche, Huevos, Pienso)..."
            className="flex-1 studio-input rounded-xl px-3 py-2 text-xs"
          />
          <button onClick={addShop}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
            + Añadir
          </button>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {day.shoppingList.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-900/50"
              >
                <button
                  onClick={() => dayStore.toggleShoppingItem(item.id, currentDate)}
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center text-[10px] border transition-all shrink-0',
                    item.done
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black'
                      : 'border-slate-600'
                  )}>
                  {item.done && '✓'}
                </button>
                <span className={cn('flex-1 text-xs', item.done ? 'line-through text-slate-500' : 'text-white')}>
                  {item.name}
                </span>
                <button
                  onClick={() => dayStore.removeShoppingItem(item.id, currentDate)}
                  className="text-slate-600 hover:text-rose-400 text-xs transition-colors">
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {day.shoppingList.length === 0 && (
            <p className="text-center text-xs text-slate-600 py-4">Lista vacía. ¡Todo comprado! 🎉</p>
          )}
        </div>
      </StudioCard>

      {/* Expenses */}
      <StudioCard className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white">💶 Gastos del Día (€)</h3>
          <span className="text-sm font-extrabold font-mono text-emerald-400">
            {totalExpenses.toFixed(2)} €
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            placeholder="€"
            className="w-20 studio-input rounded-xl px-3 py-2 text-xs font-mono"
          />
          <input
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExp()}
            placeholder="Concepto (ej. Mercadona, Gasolina)..."
            className="flex-1 studio-input rounded-xl px-3 py-2 text-xs"
          />
          <button onClick={addExp}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
            + Gasto
          </button>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {day.expenses.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/50"
              >
                <span className="text-xs text-white">{exp.description}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">{exp.amount.toFixed(2)} €</span>
                  <button
                    onClick={() => dayStore.removeExpense(currentDate, exp.id)}
                    className="text-slate-600 hover:text-rose-400 text-xs transition-colors">
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {day.expenses.length === 0 && (
            <p className="text-center text-xs text-slate-600 py-3">Sin gastos registrados hoy</p>
          )}
        </div>
      </StudioCard>
    </div>
  )
}
