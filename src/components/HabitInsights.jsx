import React, { useState } from 'react'
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Lightbulb,
  Zap,
  ShieldCheck
} from 'lucide-react'

export default function HabitInsights({
  currentStreak = 12,
  bestStreak = 18,
  weeklyPercent = 57,
  monthlyPercent = 96
}) {
  const [showCoachModal, setShowCoachModal] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">
              Personalized Habit Insights
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 tracking-wide">
              BEHAVIORAL ENGINE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCoachModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Deep AI Coach</span>
        </button>
      </div>

      {/* Main Momentum Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100/80">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
          Exceptional momentum! You are in the <strong className="text-blue-700 font-bold">Stable stage</strong> with an active {currentStreak}-day streak and {weeklyPercent}% weekly execution.
        </p>
      </div>

      {/* Two Insight Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consistency Strengths */}
        <div className="rounded-xl p-5 border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-slate-900">Consistency Strengths</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  Impressive active streak of <strong className="text-slate-800 font-semibold">{currentStreak} consecutive days</strong>. You have strong muscle memory!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  Consistently maintained at <strong className="text-slate-800 font-semibold">{monthlyPercent}% adherence</strong> this month—placing you in the top 15% of consistent performers.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Drop-Off Pattern Alert */}
        <div className="rounded-xl p-5 border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-slate-900">Drop-Off Pattern Alert</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-semibold">Inconsistent pacing:</strong> Missing 2 days in a row breaks momentum. Focus on the <strong className="text-amber-800 font-semibold bg-amber-100/60 px-1 py-0.5 rounded">&apos;Never Miss Twice&apos;</strong> rule.
            </p>
          </div>
        </div>
      </div>

      {/* Deep AI Coach Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <h4 className="font-bold text-base text-white">Deep AI Habit Coach</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Personalized Diagnosis</span>
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Your current active streak is <strong>{currentStreak} days</strong>, with your peak at <strong>{bestStreak} days</strong>. You have crossed the 10-day automaticity threshold where resistance drops by 43%.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Behavioral Recommendations
                </h5>

                <div className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-slate-800">The 2-Minute Anchor</h6>
                    <p className="text-xs text-slate-600 mt-0.5">
                      On busy days, reduce the friction: do just 2 minutes of the habit instead of skipping entirely. This preserves neural groove continuity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-slate-800">Implementation Intentions</h6>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pre-commit: <em>&ldquo;When I finish morning standup, I will immediately execute my habit.&rdquo;</em>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Got it, let&apos;s keep the streak!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
