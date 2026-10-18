'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import type { TabId, AppMode } from '@/lib/types'

interface NavItem { id: TabId; icon: string; label: string; scope: AppMode | 'ALL' }

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    icon: '🏠', label: 'Resumen & Amigos',    scope: 'ALL'  },
  { id: 'gym',     icon: '🏋️', label: 'Estudio de Fuerza',  scope: 'CLUB' },
  { id: 'bike',    icon: '🚴', label: 'GPS Bici & Reloj',   scope: 'CLUB' },
  { id: 'hogar',   icon: '🛒', label: 'Hogar, Pavos & €',   scope: 'HOME' },
  { id: 'weekly',  icon: '📊', label: 'Balance Semanal',    scope: 'ALL'  },
  { id: 'journal', icon: '📓', label: 'Diario & Archivo',   scope: 'ALL'  },
]

export function SideNav() {
  const { activeTab, setActiveTab, mode, setMode } = useAppStore()

  const visible = NAV_ITEMS.filter(
    (item) => mode === 'ALL' || item.scope === 'ALL' || item.scope === mode
  )

  return (
    <aside className="hidden lg:flex lg:w-64 bg-[#0b0f17] border-r border-slate-800/80 flex-col justify-between p-4 lg:fixed lg:h-screen z-30">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-6 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white leading-none">LifeOS Studio</h1>
            <span className="text-[10px] text-emerald-400 font-semibold">Performance Studio</span>
          </div>
        </div>

        {/* Mode filter */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 px-1">
            Filtro de Interfaz
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            {(['ALL', 'CLUB', 'HOME'] as AppMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'py-1.5 rounded-lg transition-all',
                  mode === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                )}
              >
                {m === 'ALL' ? 'Todo' : m === 'CLUB' ? '🏋️ Gym' : '🏠 Casa'}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <nav className="space-y-1">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeTab === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950'
                  : 'text-slate-300 hover:bg-slate-900'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">LifeOS Studio v1.0</p>
      </div>
    </aside>
  )
}
