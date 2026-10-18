import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DayData, TurkeyTasks, ShoppingItem, Expense, BikeRoute, WorkoutSession, MoodEmoji
} from './types'

function emptyDay(date: string): DayData {
  return {
    date,
    studyMin: 0,
    carMin: 0,
    steps: 0,
    bikeKm: 0,
    meals: [],
    mood: undefined,
    journalText: undefined,
    turkeyTasks: {},
    expenses: [],
    shoppingList: [],
    bikeRoutes: [],
    workouts: [],
  }
}

interface DayStore {
  days: Record<string, DayData>

  getDay: (date: string) => DayData
  addStudyMin: (date: string, min: number) => void
  addCarMin: (date: string, min: number) => void
  setSteps: (date: string, steps: number) => void
  addSteps: (date: string, steps: number) => void
  addMeal: (date: string, meal: string) => void
  removeMeal: (date: string, index: number) => void
  setMood: (date: string, mood: MoodEmoji) => void
  saveJournal: (date: string, text: string) => void

  // Turkey tasks
  toggleTurkeyTask: (date: string, key: keyof TurkeyTasks) => void

  // Shopping
  addShoppingItem: (name: string) => void          // global list (today)
  toggleShoppingItem: (id: string, date: string) => void
  removeShoppingItem: (id: string, date: string) => void
  addTurkeyFeedToShop: () => void

  // Expenses
  addExpense: (date: string, amount: number, description: string) => void
  removeExpense: (date: string, id: string) => void

  // Bike routes
  saveRoute: (date: string, route: BikeRoute) => void

  // Workouts
  saveWorkout: (date: string, session: WorkoutSession) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useDayStore = create<DayStore>()(
  persist(
    (set, get) => ({
      days: {},

      getDay(date) {
        return get().days[date] ?? emptyDay(date)
      },

      _updateDay(date: string, updater: (d: DayData) => DayData) {
        const current = get().days[date] ?? emptyDay(date)
        set((s) => ({ days: { ...s.days, [date]: updater(current) } }))
      },

      addStudyMin(date, min) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, studyMin: d.studyMin + min }))
      },
      addCarMin(date, min) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, carMin: d.carMin + min }))
      },
      setSteps(date, steps) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, steps }))
      },
      addSteps(date, steps) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, steps: d.steps + steps }))
      },
      addMeal(date, meal) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, meals: [...d.meals, meal] }))
      },
      removeMeal(date, index) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          meals: d.meals.filter((_, i) => i !== index),
        }))
      },
      setMood(date, mood) {
        (get() as any)._updateDay(date, (d: DayData) => ({ ...d, mood }))
      },
      saveJournal(date, text) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          journalText: text,
          journalSavedAt: new Date().toISOString(),
        }))
      },

      toggleTurkeyTask(date, key) {
        (get() as any)._updateDay(date, (d: DayData) => {
          const existing = d.turkeyTasks[key]
          const now = new Date()
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          return {
            ...d,
            turkeyTasks: {
              ...d.turkeyTasks,
              [key]: existing?.done
                ? { done: false, time: '' }
                : { done: true, time: timeStr, who: 'Yo' },
            },
          }
        })
      },

      addShoppingItem(name) {
        const date = new Date().toISOString().split('T')[0]
        const item: ShoppingItem = { id: uid(), name, done: false, addedAt: new Date().toISOString() };
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          shoppingList: [...d.shoppingList, item],
        }))
      },
      toggleShoppingItem(id, date) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          shoppingList: d.shoppingList.map((i) =>
            i.id === id ? { ...i, done: !i.done } : i
          ),
        }))
      },
      removeShoppingItem(id, date) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          shoppingList: d.shoppingList.filter((i) => i.id !== id),
        }))
      },
      addTurkeyFeedToShop() {
        get().addShoppingItem('Pienso para los pavos')
      },

      addExpense(date, amount, description) {
        const expense: Expense = { id: uid(), amount, description, createdAt: new Date().toISOString() };
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          expenses: [...d.expenses, expense],
        }))
      },
      removeExpense(date, id) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          expenses: d.expenses.filter((e) => e.id !== id),
        }))
      },

      saveRoute(date, route) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          bikeRoutes: [...d.bikeRoutes, route],
          bikeKm: d.bikeKm + route.distanceKm,
        }))
      },

      saveWorkout(date, session) {
        (get() as any)._updateDay(date, (d: DayData) => ({
          ...d,
          workouts: [...d.workouts, session],
        }))
      },
    }),
    { name: 'lifeos-days' }
  )
)
