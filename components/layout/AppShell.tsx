'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { TopHeader } from './TopHeader'
import { BottomDock } from './BottomDock'
import { SideNav } from './SideNav'
import { HomeTab } from '@/components/tabs/HomeTab'
import { GymTab } from '@/components/tabs/GymTab'
import { BikeTab } from '@/components/tabs/BikeTab'
import { HogarTab } from '@/components/tabs/HogarTab'
import { WeeklyTab } from '@/components/tabs/WeeklyTab'
import { JournalTab } from '@/components/tabs/JournalTab'

const tabComponents: Record<string, React.ComponentType> = {
  home: HomeTab,
  gym: GymTab,
  bike: BikeTab,
  hogar: HogarTab,
  weekly: WeeklyTab,
  journal: JournalTab,
}

export function AppShell() {
  const { activeTab } = useAppStore()
  const TabComponent = tabComponents[activeTab] ?? HomeTab

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base">
      <SideNav />

      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopHeader />

        <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-5 pt-4 pb-28 lg:pb-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <TabComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomDock />
    </div>
  )
}
