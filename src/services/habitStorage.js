// Storage and calculation engine for Habit & Streak Tracker

const STORAGE_KEY = 'habit_tracker_data_v1'

export function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Generate dynamic initial seed data relative to the current real date
export function getInitialSeedData() {
  const today = new Date()
  const dates = []

  // Pre-fill active streak ending on today (e.g. today and past 5 days)
  for (let i = 0; i <= 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(formatDateKey(d))
  }

  // Pre-fill some earlier days in the current month
  for (let i = 8; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(formatDateKey(d))
  }

  return {
    habitName: 'Daily Habit & Focus',
    targetDaysPerWeek: 7,
    markedDates: [...new Set(dates)].sort(),
    bestAllTimeStreak: 18,
    monthlyStreaksCount: 2,
    monthlyMomentum: '+67% vs last mo',
    customCoachNotes: []
  }
}

export const DEFAULT_SEED_DATA = getInitialSeedData()

/**
 * Calculates the current active streak counting backwards from today or yesterday.
 */
export function calculateCurrentStreak(markedDates, referenceDate = new Date()) {
  const markedSet = new Set(markedDates)
  const ref = new Date(referenceDate)
  ref.setHours(0, 0, 0, 0)

  const todayKey = formatDateKey(ref)
  let checkDate = new Date(ref)
  let streak = 0

  if (markedSet.has(todayKey)) {
    while (markedSet.has(formatDateKey(checkDate))) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  } else {
    checkDate.setDate(checkDate.getDate() - 1)
    while (markedSet.has(formatDateKey(checkDate))) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  return streak
}

/**
 * Calculates the longest streak ever in markedDates.
 */
export function calculateBestStreak(markedDates, recordedBest = 18) {
  if (!markedDates || markedDates.length === 0) return recordedBest

  const sortedDates = [...new Set(markedDates)].sort()
  let longest = 0
  let current = 0
  let prevDate = null

  for (const dateStr of sortedDates) {
    const curDate = parseDateKey(dateStr)
    if (!prevDate) {
      current = 1
    } else {
      const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        current++
      } else {
        current = 1
      }
    }
    if (current > longest) longest = current
    prevDate = curDate
  }

  return Math.max(longest, recordedBest)
}

/**
 * Calculates Monday-Sunday weekly cadence for the week containing referenceDate.
 */
export function calculateWeeklyCadence(markedDates, referenceDate = new Date()) {
  const markedSet = new Set(markedDates)
  const d = new Date(referenceDate)
  d.setHours(0, 0, 0, 0)
  
  const dayOfWeek = d.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  let completedCount = 0

  const cadence = days.map((dayName, index) => {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + index)
    const key = formatDateKey(dayDate)
    const isCompleted = markedSet.has(key)
    if (isCompleted) completedCount++

    return {
      dayName,
      dateKey: key,
      dayNumber: dayDate.getDate(),
      isCompleted
    }
  })

  return {
    cadence,
    completedCount,
    totalTarget: 7,
    percentage: Math.round((completedCount / 7) * 100)
  }
}

/**
 * Calculates monthly statistics for the given year and month (0-indexed).
 */
export function calculateMonthlyStats(markedDates, year, month) {
  const markedSet = new Set(markedDates)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let completed = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (markedSet.has(key)) {
      completed++
    }
  }

  const percentage = Math.round((completed / daysInMonth) * 100)
  return {
    completed,
    daysInMonth,
    percentage
  }
}

/**
 * Load habit data from Trello (if in iframe) or localStorage fallback.
 */
export async function loadHabitData(t) {
  if (t && typeof t.get === 'function') {
    try {
      const trelloData = await Promise.race([
        t.get('card', 'shared', 'habit_data'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ])
      if (trelloData && Array.isArray(trelloData.markedDates)) {
        return trelloData
      }
    } catch (err) {
      console.warn('Trello storage unavailable or timed out, using fallback:', err)
    }
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) {
      const parsed = JSON.parse(local)
      if (parsed && Array.isArray(parsed.markedDates)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Could not read from localStorage:', err)
  }

  return getInitialSeedData()
}

/**
 * Save habit data to Trello and localStorage.
 */
export async function saveHabitData(t, habitData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habitData))
  } catch (err) {
    console.warn('Failed to save to localStorage:', err)
  }

  if (t && typeof t.set === 'function') {
    try {
      await t.set('card', 'shared', 'habit_data', habitData)
    } catch (err) {
      console.warn('Failed to save to Trello storage:', err)
    }
  }
}
