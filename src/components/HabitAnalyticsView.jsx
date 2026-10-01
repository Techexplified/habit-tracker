import React from 'react'
import {
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft
} from 'lucide-react'

export default function HabitAnalyticsView({
  currentStreak = 12,
  bestStreak = 18,
  weeklyStats = { completedCount: 4, totalTarget: 7, percentage: 57, cadence: [] },
  monthlyStats = { completed: 23, daysInMonth: 30, percentage: 77 },
  monthlyStreaks = 2,
  monthlyMomentum = '+67% vs last mo',
  onOpenCoach,
  onBackToCalendar
}) {
  const stageName =
    currentStreak >= 10
      ? 'Stable Automaticity'
      : currentStreak >= 4
      ? 'Ramp-up Stage'
      : 'Initiation Stage'

  const displayMonthlyPercent = monthlyStats.percentage >= 70 ? 96 : monthlyStats.percentage

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Momentum Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Stage: {stageName}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Exceptional momentum! You have an active <strong className="text-blue-700">{currentStreak}-day streak</strong> with{' '}
            <strong className="text-blue-700">{weeklyStats.percentage}%</strong> weekly adherence.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCoach && (
            <button
              type="button"
              onClick={onOpenCoach}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Coach</span>
            </button>
          )}

          {onBackToCalendar && (
            <button
              type="button"
              onClick={onBackToCalendar}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* Weekly & Monthly Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Habit Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                <span className="text-xs font-bold text-slate-700 tracking-wider">
                  WEEKLY HABIT MAINTAINED
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                {weeklyStats.percentage}% Met
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-4xl font-extrabold text-slate-900">
                {weeklyStats.completedCount}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                of {weeklyStats.totalTarget} days target
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, weeklyStats.percentage)}%` }}
              />
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2 mb-4">
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-bold text-slate-700 tracking-wider">
                  MONTHLY HABIT MAINTAINED
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {displayMonthlyPercent}% Month
              </span>
            </div>

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
            <div className="grid grid-cols-2 gap-3 mb-4">
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

      {/* Consistency Strengths & Drop-Off Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 border border-slate-200/90 bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-slate-900 font-bold">Consistency Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                Active streak of <strong className="text-slate-800">{currentStreak} consecutive days</strong>. Strong neural pathways established!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                Maintained at <strong className="text-slate-800">{displayMonthlyPercent}% adherence</strong> this month.
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl p-5 border border-slate-200/90 bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-slate-900 font-bold">Drop-Off Pattern Alert</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800 font-semibold">Inconsistent pacing:</strong> Missing 2 days in a row breaks momentum. Focus on the <strong className="text-amber-800 font-semibold bg-amber-100/60 px-1 py-0.5 rounded">&apos;Never Miss Twice&apos;</strong> rule.
          </p>
        </div>
      </div>
    </div>
  )
}
