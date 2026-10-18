'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import type { TabId, AppMode } from '@/lib/types'

interface NavItem {
  id: TabId
  icon: string
  label: string
  scope: AppMode | 'ALL'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    icon: '🏠', label: 'Inicio',    scope: 'ALL'  },
  { id: 'gym',     icon: '🏋️', label: 'Fuerza',    scope: 'CLUB' },
  { id: 'bike',    icon: '🚴', label: 'Bici',      scope: 'CLUB' },
  { id: 'hogar',   icon: '🛒', label: 'Hogar',     scope: 'HOME' },
  { id: 'journal', icon: '📓', label: 'Diario',    scope: 'ALL'  },
]

export function BottomDock() {
  const { activeTab, setActiveTab, mode } = useAppStore()

  const visible = NAV_ITEMS.filter(
    (item) => mode === 'ALL' || item.scope === 'ALL' || item.scope === mode
  )

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bottom-dock rounded-3xl p-1.5 flex items-center justify-around">
      {visible.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            'flex-1 py-2 rounded-2xl flex flex-col items-center justify-center border transition-all duration-200',
            activeTab === item.id
              ? 'bg-emerald-500/18 border-emerald-500/40 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-white'
          )}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="text-[10px] font-bold mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
