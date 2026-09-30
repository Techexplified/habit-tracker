import React from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateKey, parseDateKey } from '../services/habitStorage'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function HabitCalendar({
  year,
  month,
  todayDate = new Date(),
  markedDates = [],
  onToggleDate,
  onPrevMonth,
  onNextMonth
}) {
  const markedSet = new Set(markedDates)
  const todayKey = formatDateKey(todayDate)

  const todayStart = new Date(todayDate)
  todayStart.setHours(0, 0, 0, 0)

  // Calculate days in month and offsets for Monday-first calendar
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // First day of current month: 0=Sun, 1=Mon, ..., 6=Sat
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  // Offset for Monday start: Mon=0, Tue=1, ..., Sun=6
  const prevMonthPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // Monthly stats
  let completedInMonth = 0
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (markedSet.has(key)) completedInMonth++
  }
  const monthlyPercent = Math.round((completedInMonth / daysInCurrentMonth) * 100)

  // Build grid days
  const calendarCells = []

  // 1. Previous month trailing days
  for (let i = prevMonthPadding - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i
    const prevMonthIdx = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const dateKey = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    calendarCells.push(buildCell(dateKey, dayNum, false))
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    calendarCells.push(buildCell(dateKey, dayNum, true))
  }

  // 3. Next month leading days (to complete 35 or 42 cells)
  const remainingCells = 35 - calendarCells.length >= 0 ? 35 - calendarCells.length : 42 - calendarCells.length
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    const dateKey = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    calendarCells.push(buildCell(dateKey, dayNum, false))
  }

  function buildCell(dateKey, dayNumber, isCurrentMonth) {
    const cellDate = parseDateKey(dateKey)
    cellDate.setHours(0, 0, 0, 0)
    const isToday = dateKey === todayKey
    const isFuture = cellDate > todayStart
    const isPast = cellDate < todayStart

    return {
      dayNumber,
      dateKey,
      isCurrentMonth,
      isMarked: markedSet.has(dateKey),
      isToday,
      isFuture,
      isPast
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-600">
            <span className="text-slate-900 font-bold">{completedInMonth}</span> of {daysInCurrentMonth} days ({monthlyPercent}%)
          </span>

          <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={onPrevMonth}
              title="Previous Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 my-auto" />
            <button
              type="button"
              onClick={onNextMonth}
              title="Next Month"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2.5 my-4 text-center">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-xs font-bold text-slate-400 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Cells Grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {calendarCells.map((cell) => {
          const { dayNumber, dateKey, isCurrentMonth, isMarked, isToday, isFuture } = cell

          return (
            <button
              key={dateKey}
              type="button"
              disabled={!isToday}
              onClick={isToday ? () => onToggleDate(dateKey) : undefined}
              title={
                isToday
                  ? 'Today: Click to toggle habit'
                  : isFuture
                  ? 'Future date (cannot be toggled)'
                  : isMarked
                  ? 'Completed habit (past history)'
                  : 'Incomplete day (past history)'
              }
              className={`relative aspect-square sm:aspect-auto sm:h-16 rounded-xl flex flex-col items-center justify-center p-1 transition-all select-none group ${
                isToday
                  ? isMarked
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-amber-400 ring-offset-2 cursor-pointer hover:scale-[1.03] active:scale-95'
                    : 'bg-white hover:bg-amber-50/50 border-2 border-amber-400 text-slate-800 shadow-sm cursor-pointer hover:scale-[1.03] active:scale-95'
                  : isMarked
                  ? 'bg-blue-600/90 text-white cursor-default'
                  : isFuture
                  ? 'bg-slate-50/40 border border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                  : isCurrentMonth
                  ? 'bg-white border border-slate-200 text-slate-600 cursor-default'
                  : 'bg-slate-50/30 border border-slate-100 text-slate-300 cursor-default'
              }`}
            >
              <span
                className={`text-sm sm:text-base font-bold leading-none ${
                  isMarked
                    ? 'text-white'
                    : isToday
                    ? 'text-slate-900 font-extrabold'
                    : isCurrentMonth
                    ? 'text-slate-600'
                    : 'text-slate-300'
                }`}
              >
                {dayNumber}
              </span>

              {/* Flame icon for marked days */}
              {isMarked && (
                <span className="text-xs sm:text-sm mt-1 filter drop-shadow-sm select-none">
                  🔥
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend & Hint */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block shadow-xs" />
            <span className="text-slate-600 font-medium">Marked / Streak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-white border-2 border-amber-400 inline-block" />
            <span className="text-slate-600 font-medium">Today (Click to toggle)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-white border border-slate-200 inline-block" />
            <span className="text-slate-600 font-medium">Empty Day</span>
          </div>
        </div>

        <p className="text-slate-500 font-medium">
          💡 You can only toggle habit completion for Today
        </p>
      </div>
    </div>
  )
}
