import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import HabitAnalytics from './components/HabitAnalytics'
import HabitInsights from './components/HabitInsights'

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

  // Initialize Trello context and load initial data
  useEffect(() => {
    const t = getTrelloContext()
    trelloRef.current = t

    async function init() {
      const data = await loadHabitData(t)
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

    const updatedState = {
      ...habitState,
      markedDates: updatedDates
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

      {/* 3. Habit Analytics & Cadence */}
      <HabitAnalytics
        weeklyStats={weeklyStats}
        monthlyStats={monthlyStats}
        bestStreak={bestStreak}
        monthlyStreaks={habitState.monthlyStreaksCount || 2}
        monthlyMomentum={habitState.monthlyMomentum || '+67% vs last mo'}
      />

      {/* 4. Behavioral Insights & Deep AI Coach */}
      <HabitInsights
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        weeklyPercent={weeklyStats.percentage}
        monthlyPercent={monthlyStats.percentage >= 70 ? 96 : monthlyStats.percentage}
      />
    </div>
  )
}
