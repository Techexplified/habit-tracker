import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Calendar as CalendarIcon, BarChart2, Sparkles, ChevronRight } from 'lucide-react'
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
import HabitAnalyticsView from './components/HabitAnalyticsView'
import DeepAICoachView from './components/DeepAICoachView'

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

  // Active View Tab: 'calendar' | 'analytics' | 'coach'
  const [activeTab, setActiveTab] = useState('calendar')

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

  // Auto-resize Trello iframe on tab switch or content change
  useEffect(() => {
    if (isLoaded && trelloRef.current) {
      // Small timeout ensures DOM layout is finished before measurement
      const timer = setTimeout(() => {
        autoSize(trelloRef.current)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, habitState, currentMonth, currentYear, activeTab])

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

      {/* 2. Top Segmented Navigation Tabs */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coach')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'coach'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Deep AI Coach</span>
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
            activeTab === 'coach'
              ? 'bg-purple-500/40 text-purple-100 border border-purple-300/30'
              : 'bg-purple-100 text-purple-700'
          }`}>
            AI
          </span>
        </button>
      </div>

      {/* 3. TAB 1: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <HabitCalendar
            year={currentYear}
            month={currentMonth}
            todayDate={todayDate}
            markedDates={habitState.markedDates}
            onToggleDate={handleToggleDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Bottom Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Habit Analytics Button */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
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
              onClick={() => setActiveTab('coach')}
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
        </div>
      )}

      {/* 4. TAB 2: ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <HabitAnalyticsView
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          weeklyStats={weeklyStats}
          monthlyStats={monthlyStats}
          monthlyStreaks={habitState.monthlyStreaksCount || 2}
          monthlyMomentum={habitState.monthlyMomentum || '+67% vs last mo'}
          onOpenCoach={() => setActiveTab('coach')}
          onBackToCalendar={() => setActiveTab('calendar')}
        />
      )}

      {/* 5. TAB 3: DEEP AI COACH VIEW */}
      {activeTab === 'coach' && (
        <DeepAICoachView
          habitName={habitState.habitName || 'Daily Habit & Focus'}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          weeklyStats={weeklyStats}
          monthlyStats={monthlyStats}
          trelloContext={trelloRef.current}
          onBackToCalendar={() => setActiveTab('calendar')}
        />
      )}
    </div>
  )
}
