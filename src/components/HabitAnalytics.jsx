import React, { useState } from 'react'
import {
  BarChart2,
  ChevronUp,
  ChevronDown,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2
} from 'lucide-react'

export default function HabitAnalytics({
  weeklyStats = { completedCount: 4, totalTarget: 7, percentage: 57, cadence: [] },
  monthlyStats = { completed: 23, daysInMonth: 30, percentage: 77 },
  bestStreak = 18,
  monthlyStreaks = 2,
  monthlyMomentum = '+67% vs last mo'
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="space-y-4">
      {/* Dark Collapsible Header */}
      <div className="bg-[#0f172a] rounded-2xl p-4 sm:p-5 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-white">
              Habit Analytics & Insights
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Weekly & Monthly metrics, streak health, and personalized coaching
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Analytics Cards */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Habit Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            {/* Top pill & Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span className="text-xs font-bold text-slate-600 tracking-wider">
                    WEEKLY HABIT MAINTAINED
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {weeklyStats.percentage}% Met
                </span>
              </div>

              {/* Big metric */}
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  {weeklyStats.completedCount}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  of {weeklyStats.totalTarget} days target
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weeklyStats.percentage)}%` }}
                />
              </div>

              {/* Weekly streak badge */}
              <div className="bg-amber-50/70 border border-amber-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2 mb-5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium text-slate-700">
                  Weekly Streak: <strong className="text-slate-900 font-bold">2 weeks on track</strong>
                </span>
              </div>
            </div>

            {/* Cadence Pills */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2.5">
                <span>Current Week Cadence</span>
                <span className="font-bold text-slate-700">
                  {weeklyStats.completedCount}/{weeklyStats.totalTarget} days
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {weeklyStats.cadence.map((day) => (
                  <div
                    key={day.dayName}
                    className={`rounded-lg py-2 flex flex-col items-center justify-center transition-all ${
                      day.isCompleted
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-[10px] tracking-tight">{day.dayName}</span>
                    <div className="mt-1">
                      {day.isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Habit Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            {/* Top pill & Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-bold text-slate-600 tracking-wider">
                    MONTHLY HABIT MAINTAINED
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {monthlyStats.percentage >= 70 ? '96% Month' : `${monthlyStats.percentage}% Month`}
                </span>
              </div>

              {/* Big metric */}
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  {monthlyStats.completed}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  of {monthlyStats.daysInMonth} days logged
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, monthlyStats.percentage)}%` }}
                />
              </div>

              {/* Two mini stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Monthly Streaks
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-base font-bold text-slate-900">
                      {monthlyStreaks} streaks
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Best All-Time Streak
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span className="text-base font-bold text-slate-900">
                      {bestStreak} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Momentum */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Monthly Momentum</span>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {monthlyMomentum}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
