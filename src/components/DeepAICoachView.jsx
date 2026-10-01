import React, { useState, useEffect } from 'react'
import {
  Brain,
  Sparkles,
  RefreshCw,
  Zap,
  Lightbulb,
  ShieldCheck,
  Award,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { generateAICoaching } from '../services/aiCoach'

export default function DeepAICoachView({
  habitName = 'Daily Habit & Focus',
  currentStreak = 12,
  bestStreak = 18,
  weeklyStats = { percentage: 57 },
  monthlyStats = { percentage: 96 },
  trelloContext = null,
  onBackToCalendar
}) {
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)

  // Fetch coaching on initial mount
  useEffect(() => {
    fetchCoaching(0, false)
  }, [])

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
      console.error('Deep AI Coach error:', err)
      setAiError(err.message || 'Failed to fetch AI insights')
    } finally {
      setIsLoadingAI(false)
      setIsRegenerating(false)
    }
  }

  const handleRegenerate = async () => {
    if (isLoadingAI || isRegenerating) return
    const nextCount = refreshCount + 1
    setRefreshCount(nextCount)
    await fetchCoaching(nextCount, true)
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-in fade-in duration-150">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
                Deep AI Habit Coach
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Personalized guidance for &ldquo;{habitName}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Generate a fresh coaching angle"
            disabled={isLoadingAI || isRegenerating}
            onClick={handleRegenerate}
            className={`flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs ${
              isRegenerating ? 'opacity-70 cursor-wait' : 'active:scale-95'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-purple-600' : ''}`}
            />
            <span>{isRegenerating ? 'Cooking advice...' : 'Regenerate'}</span>
          </button>

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

      {/* Main Content Area */}
      {isLoadingAI ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 animate-pulse">
              <Brain className="w-7 h-7 animate-spin" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <h5 className="font-bold text-base text-slate-800">
              Consulting Gemini AI Coach...
            </h5>
            <p className="text-xs text-slate-500 mt-1">
              Synthesizing behavioral science & streak cadence
            </p>
          </div>
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity duration-200 ${isRegenerating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {isRegenerating && (
            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-100/70 text-purple-800 text-xs font-bold animate-pulse border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
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

          {/* AI Diagnosis Card */}
          <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/50 border border-purple-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Gemini AI Diagnosis</span>
            </div>
            <p className="text-sm text-purple-950 leading-relaxed font-medium">
              {aiResult?.diagnosis || (
                <>
                  Your current active streak is <strong>{currentStreak} days</strong>, with your peak at <strong>{bestStreak} days</strong>. You have crossed the 10-day automaticity threshold where resistance drops by 43%.
                </>
              )}
            </p>
          </div>

          {/* Targeted Behavioral Protocols */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Targeted Behavioral Protocols
              </h4>
              {refreshCount > 0 && (
                <span className="text-[11px] text-purple-700 font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                  Perspective #{refreshCount + 1}
                </span>
              )}
            </div>

            {/* Micro Tactic */}
            <div className="flex gap-3.5 items-start p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">
                  {aiResult?.microTactic?.title || 'The 2-Minute Anchor'}
                </h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {aiResult?.microTactic?.description || (
                    <>
                      On busy days, reduce the friction: do just 2 minutes of the habit instead of skipping entirely. This preserves neural groove continuity.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Drop Off Defense */}
            <div className="flex gap-3.5 items-start p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">
                  {aiResult?.dropOffDefense?.title || 'Never Miss Twice Anchor'}
                </h5>
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
              <div className="flex gap-3.5 items-start p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-indigo-900">
                    Identity Reinforcement
                  </h5>
                  <p className="text-xs text-indigo-800 mt-1 italic leading-relaxed">
                    &ldquo;{aiResult.identityStatement}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          ⚡ Powered by Google Gemini AI · Streak: {currentStreak} days
        </span>
        {onBackToCalendar && (
          <button
            type="button"
            onClick={onBackToCalendar}
            className="font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
          >
            ← Back to Calendar
          </button>
        )}
      </div>
    </div>
  )
}
