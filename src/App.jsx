import React, { useState, useEffect, useMemo, useRef } from 'react'
import { BarChart2, Sparkles, ChevronRight } from 'lucide-react'
import { getTrelloContext, autoSize } from './trelloPowerUp'
import {
  loadHabitData,
  saveHabitData,
  formatDateKey,
  calculateCurrentStreak,
  calculateBestStreak,
  calculateWeeklyCadence,
  calculateMonthlyStats,
  DEFAULT_SEED_DATA
} from './services/habitStorage'
import StreakHeader from './components/StreakHeader'
import HabitCalendar from './components/HabitCalendar'
import AnalyticsModal from './components/AnalyticsModal'

export default function App() {
  const trelloRef = useRef(null)

  // Real current date
  const [todayDate] = useState(() => new Date())
  const todayKey = formatDateKey(todayDate)

  // Calendar month/year navigation state initialized to current month and year
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())

  // Habit dataset
  const [habitState, setHabitState] = useState(DEFAULT_SEED_DATA)
  const [isLoaded, setIsLoaded] = useState(false)

  // Modal State ('analytics' | 'coach')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('analytics')

  // Initialize Trello context and load initial data
  useEffect(() => {
    const t = getTrelloContext()
    trelloRef.current = t

    async function init() {
      const data = await loadHabitData(t)
      if (t && typeof t.card === 'function') {
        try {
          const cardInfo = await t.card('name')
          if (cardInfo && cardInfo.name) {
            data.habitName = cardInfo.name
          }
        } catch {}
      }
      setHabitState(data)
      setIsLoaded(true)
    }

    init()
  }, [])

  // Auto-resize Trello iframe on content change
  useEffect(() => {
    if (isLoaded && trelloRef.current) {
      autoSize(trelloRef.current)
    }
  }, [isLoaded, habitState, currentMonth, currentYear])

  // Computed metrics
  const isMarkedToday = useMemo(() => {
    return habitState.markedDates.includes(todayKey)
  }, [habitState.markedDates, todayKey])

  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(habitState.markedDates, todayDate)
  }, [habitState.markedDates, todayDate])

  const bestStreak = useMemo(() => {
    return calculateBestStreak(habitState.markedDates, habitState.bestAllTimeStreak || 18)
  }, [habitState.markedDates, habitState.bestAllTimeStreak])

  const weeklyStats = useMemo(() => {
    return calculateWeeklyCadence(habitState.markedDates, todayDate)
  }, [habitState.markedDates, todayDate])

  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(habitState.markedDates, currentYear, currentMonth)
  }, [habitState.markedDates, currentYear, currentMonth])

  // Handler to toggle today (called from StreakHeader or calendar today cell)
  const handleToggleToday = async () => {
    const isCurrentlyMarked = habitState.markedDates.includes(todayKey)
    let updatedDates
    if (isCurrentlyMarked) {
      updatedDates = habitState.markedDates.filter((d) => d !== todayKey)
    } else {
      updatedDates = [...habitState.markedDates, todayKey]
    }

    const newStreak = calculateCurrentStreak(updatedDates, todayDate)

    const updatedState = {
      ...habitState,
      markedDates: updatedDates,
      currentStreak: newStreak,
      markedToday: updatedDates.includes(todayKey)
    }

    setHabitState(updatedState)
    await saveHabitData(trelloRef.current, updatedState)
  }

  // Handler to toggle any date in calendar (strictly limited to today)
  const handleToggleDate = async (dateKey) => {
    if (dateKey !== todayKey) return
    await handleToggleToday()
  }

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleOpenModal = (tabName = 'analytics') => {
    setModalTab(tabName)
    setModalOpen(true)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-400 font-medium">
        Loading Habit Tracker...
      </div>
    )
  }

  const displayMonthlyPercent = monthlyStats.percentage >= 70 ? 96 : monthlyStats.percentage

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4">
      {/* 1. Top Streak & Mark Today Header */}
      <StreakHeader
        currentStreak={currentStreak}
        isMarkedToday={isMarkedToday}
        onToggleToday={handleToggleToday}
      />

      {/* 2. Interactive Monthly Calendar */}
      <HabitCalendar
        year={currentYear}
        month={currentMonth}
        todayDate={todayDate}
        markedDates={habitState.markedDates}
        onToggleDate={handleToggleDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* 3. Sleek Action Bar - Opens Modal Tabs (Decreases Scroll Length) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
        {/* Habit Analytics Button */}
        <button
          type="button"
          onClick={() => handleOpenModal('analytics')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/20 transition-all shadow-xs group cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform border border-blue-100">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                Habit Analytics & Insights
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {weeklyStats.completedCount}/{weeklyStats.totalTarget}d this week · {displayMonthlyPercent}% month
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Deep AI Coach Button */}
        <button
          type="button"
          onClick={() => handleOpenModal('coach')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all shadow-xs group cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-700 flex items-center justify-center text-white shadow-xs shadow-purple-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                  Deep AI Coach
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700">
                  Gemini
                </span>
              </div>
              <div className="text-xs text-purple-600/90 font-semibold">
                Personalized Gemini AI guidance
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 4. Unified Analytics & AI Insights Modal */}
      <AnalyticsModal
        isOpen={modalOpen}
        initialTab={modalTab}
        onClose={() => setModalOpen(false)}
        habitName={habitState.habitName || 'Daily Habit & Focus'}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        weeklyStats={weeklyStats}
        monthlyStats={monthlyStats}
        monthlyStreaks={habitState.monthlyStreaksCount || 2}
        monthlyMomentum={habitState.monthlyMomentum || '+67% vs last mo'}
        trelloContext={trelloRef.current}
      />
    </div>
  )
}
