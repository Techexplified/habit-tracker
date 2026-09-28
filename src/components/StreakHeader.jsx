import React from 'react'
import { Sparkles, Check } from 'lucide-react'

export default function StreakHeader({
  currentStreak = 12,
  isMarkedToday = true,
  onToggleToday
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Streak icon and info */}
      <div className="flex items-center gap-4">
        {/* Flame Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <svg
            className="w-8 h-8 text-white drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.399 8.163L12 18.896l-7.333 3.861 1.399-8.163-5.934-5.784 8.2-1.192zm0 5.702l-2.072 4.198-4.633.673 3.353 3.268-.79 4.612L12 16.858l4.142 2.18-.79-4.612 3.353-3.268-4.633-.673z" className="hidden" />
            <path d="M17.556 7.847C16.86 4.093 13.905 1.5 12 1.5c-.296 0-.58.077-.827.22-3.14 1.82-5.173 5.412-5.173 9.03 0 4.28 3.477 7.75 7.75 7.75 4.032 0 7.35-3.084 7.697-7.003.023-.263-.087-.523-.29-.687a.784.784 0 0 0-.6-.163h-.001zm-5.806 8.653c-2.481 0-4.5-2.019-4.5-4.5 0-1.895 1.178-3.904 2.87-4.908.435 1.554 1.488 2.825 2.898 3.522-.162.775-.027 1.597.408 2.274.339.527.42 1.168.223 1.761-.59.967-1.139 1.851-1.899 1.851z" />
          </svg>
        </div>

        {/* Text Details */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {currentStreak} Day Streak
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              ON FIRE
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isMarkedToday
              ? 'Great job! You maintained your streak for today.'
              : 'Keep the momentum going! Log today’s habit.'}
          </p>
        </div>
      </div>

      {/* Right: Primary Action Button */}
      <button
        type="button"
        onClick={onToggleToday}
        className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 ${
          isMarkedToday
            ? 'bg-[#00875a] hover:bg-[#007048] text-white shadow-emerald-700/20'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
        }`}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isMarkedToday ? 'bg-white/20' : 'bg-white/30'
        }`}>
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        </div>
        <span>{isMarkedToday ? 'Marked Today (Undo?)' : 'Mark Today as Complete'}</span>
      </button>
    </div>
  )
}
