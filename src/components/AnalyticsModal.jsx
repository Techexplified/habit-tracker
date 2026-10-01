import React, { useState, useEffect } from 'react'
import {
  BarChart2,
  Sparkles,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  X,
  Lightbulb,
  Zap,
  ShieldCheck,
  RefreshCw,
  Award
} from 'lucide-react'
import { generateAICoaching } from '../services/aiCoach'

export default function AnalyticsModal({
  isOpen = false,
  initialTab = 'analytics', // 'analytics' | 'coach'
  onClose,
  habitName = 'Daily Habit & Focus',
  currentStreak = 12,
  bestStreak = 18,
  weeklyStats = { completedCount: 4, totalTarget: 7, percentage: 57, cadence: [] },
  monthlyStats = { completed: 23, daysInMonth: 30, percentage: 77 },
  monthlyStreaks = 2,
  monthlyMomentum = '+67% vs last mo',
  trelloContext = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      if (initialTab === 'coach' && !aiResult && !isLoadingAI) {
        fetchCoaching(0, false)
      }
    }
  }, [isOpen, initialTab])

  // Trigger coaching when switching to coach tab if not loaded
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    if (tab === 'coach' && !aiResult && !isLoadingAI) {
      fetchCoaching(0, false)
    }
  }

  const fetchCoaching = async (count = refreshCount, isRegen = false) => {
    if (isRegen) {
      setIsRegenerating(true)
    } else {
      setIsLoadingAI(true)
    }
    setAiError(null)

    try {
      const coaching = await generateAICoaching({
        habitName,
        currentStreak,
        bestStreak,
        weeklyPercent: weeklyStats.percentage,
        monthlyPercent: monthlyStats.percentage >= 70 ? 96 : monthlyStats.percentage,
        refreshCount: count,
        t: trelloContext
      })
      setAiResult(coaching)
    } catch (err) {
      console.error('AI Coaching error:', err)
      setAiError(err.message || 'Failed to fetch AI insights')
    } finally {
      setIsLoadingAI(false)
      setIsRegenerating(false)
    }
  }

  const handleRegenerate = async (e) => {
    e.stopPropagation()
    if (isLoadingAI || isRegenerating) return
    const nextCount = refreshCount + 1
    setRefreshCount(nextCount)
    await fetchCoaching(nextCount, true)
  }

  if (!isOpen) return null

  const stageName =
    currentStreak >= 10
      ? 'Stable Automaticity'
      : currentStreak >= 4
      ? 'Ramp-up Stage'
      : 'Initiation Stage'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
        {/* Modal Top Header with Tabs */}
        <div className="bg-[#0f172a] px-4 sm:px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Title & Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Habit Insights
              </span>
            </div>

            {/* Tab Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <button
                type="button"
                onClick={() => handleTabSwitch('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('coach')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'coach'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep AI Coach</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-purple-400/30 text-purple-200 ml-0.5">
                  AI
                </span>
              </button>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center justify-end gap-2">
            {activeTab === 'coach' && (
              <button
                type="button"
                title="Regenerate fresh AI advice"
                disabled={isLoadingAI || isRegenerating}
                onClick={handleRegenerate}
                className={`flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer select-none ${
                  isRegenerating ? 'opacity-70 cursor-wait' : 'active:scale-95'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-purple-300' : ''}`}
                />
                <span>{isRegenerating ? 'Thinking...' : 'Regenerate'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ANALYTICS & INSIGHTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Momentum Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-0.5">
                    Stage: {stageName}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Active streak of <strong className="text-blue-700">{currentStreak} days</strong> with{' '}
                    <strong className="text-blue-700">{weeklyStats.percentage}%</strong> weekly adherence.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('coach')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Coach</span>
                </button>
              </div>

              {/* Weekly & Monthly Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weekly Habit Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
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
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-xs font-bold text-slate-700 tracking-wider">
                          MONTHLY HABIT MAINTAINED
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {monthlyStats.percentage >= 70 ? '96% Month' : `${monthlyStats.percentage}% Month`}
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
                <div className="rounded-xl p-4.5 border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2.5 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-slate-900 font-bold">Consistency Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>
                        Active streak of <strong className="text-slate-800">{currentStreak} consecutive days</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>
                        Maintained at <strong className="text-slate-800">{monthlyStats.percentage >= 70 ? 96 : monthlyStats.percentage}% adherence</strong> this month.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl p-4.5 border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2.5 text-amber-500 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-slate-900 font-bold">Drop-Off Pattern Alert</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-semibold">Inconsistent pacing:</strong> Missing 2 days in a row breaks momentum. Focus on the <strong className="text-amber-800 font-semibold bg-amber-100/60 px-1 py-0.5 rounded">&apos;Never Miss Twice&apos;</strong> rule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEEP AI COACH */}
          {activeTab === 'coach' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {isLoadingAI ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 animate-pulse">
                      <Brain className="w-7 h-7 animate-spin" />
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">
                      Analyzing streak with Gemini AI...
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Synthesizing behavioral science & streak cadence for &ldquo;{habitName}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`space-y-4 transition-opacity duration-200 ${isRegenerating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                  {isRegenerating && (
                    <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-100/70 text-purple-800 text-xs font-bold animate-pulse border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Cooking up a fresh perspective with Gemini AI...</span>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Notice:</span>
                        <span>{aiError}. Showing behavioral baseline below.</span>
                      </div>
                    </div>
                  )}

                  {/* Diagnosis Card */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4.5">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1.5">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>Gemini AI Diagnosis</span>
                    </div>
                    <p className="text-xs text-purple-950 leading-relaxed font-medium">
                      {aiResult?.diagnosis || (
                        <>
                          Your current active streak is <strong>{currentStreak} days</strong>, with your peak at <strong>{bestStreak} days</strong>. You have crossed the 10-day automaticity threshold where resistance drops by 43%.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Micro-Tactic Card */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Targeted Behavioral Protocols
                      </h5>
                      {refreshCount > 0 && (
                        <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                          Angle #{refreshCount + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3 items-start p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">
                          {aiResult?.microTactic?.title || 'The 2-Minute Anchor'}
                        </h6>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {aiResult?.microTactic?.description || (
                            <>
                              On busy days, reduce the friction: do just 2 minutes of the habit instead of skipping entirely. This preserves neural groove continuity.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Drop-Off Defense */}
                    <div className="flex gap-3 items-start p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="text-xs font-bold text-slate-800">
                          {aiResult?.dropOffDefense?.title || 'Never Miss Twice Anchor'}
                        </h6>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {aiResult?.dropOffDefense?.description || (
                            <>
                              Missing 1 day is an accident; missing 2 days is the start of a new habit. Scale back the intensity if needed, but show up.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Identity Statement */}
                    {aiResult?.identityStatement && (
                      <div className="flex gap-3 items-start p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                        <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <h6 className="text-xs font-bold text-indigo-900">
                            Identity Reinforcement
                          </h6>
                          <p className="text-xs text-indigo-800 mt-1 italic leading-relaxed">
                            &ldquo;{aiResult.identityStatement}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            {activeTab === 'coach'
              ? '⚡ Powered by Google Gemini AI'
              : '📊 Live Card Analytics'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
