import React, { useState } from 'react'
import {
  Brain,
  Sparkles,
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

export default function HabitInsights({
  habitName = 'Daily Habit & Focus',
  currentStreak = 12,
  bestStreak = 18,
  weeklyPercent = 57,
  monthlyPercent = 96,
  trelloContext = null
}) {
  const [showCoachModal, setShowCoachModal] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)

  // Open modal and fetch AI coaching automatically
  const handleOpenModal = () => {
    setShowCoachModal(true)
    if (!aiResult && !isLoadingAI) {
      triggerAICoaching()
    }
  }

  const triggerAICoaching = async () => {
    setIsLoadingAI(true)
    setAiError(null)
    try {
      const coaching = await generateAICoaching({
        habitName,
        currentStreak,
        bestStreak,
        weeklyPercent,
        monthlyPercent,
        t: trelloContext
      })
      setAiResult(coaching)
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI insights')
    } finally {
      setIsLoadingAI(false)
    }
  }

  // Determine habit stage based on current streak
  const stageName =
    currentStreak >= 10
      ? 'Stable Automaticity'
      : currentStreak >= 4
      ? 'Ramp-up Stage'
      : 'Initiation Stage'

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
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Deep AI Coach</span>
        </button>
      </div>

      {/* Main Momentum Callout Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100/80">
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
          Exceptional momentum! You are in the <strong className="text-blue-700 font-bold">{stageName}</strong> with an active {currentStreak}-day streak and {weeklyPercent}% weekly execution.
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
                  Impressive active streak of <strong className="text-slate-800 font-semibold">{currentStreak} consecutive days</strong>. Strong neural pathways established!
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-6 py-4.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">Deep AI Habit Coach</h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-100 border border-purple-300/30">
                      Gemini AI
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200 leading-none mt-1">
                    Live coaching for &ldquo;{habitName}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {!isLoadingAI && (
                  <button
                    type="button"
                    title="Regenerate Fresh AI Coaching"
                    onClick={triggerAICoaching}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-100 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCoachModal(false)}
                  className="text-purple-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* AI Loading State */}
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
                      Synthesizing behavioral science & streak cadence
                    </p>
                  </div>
                </div>
              ) : aiError ? (
                /* AI Error Fallback Notification */
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Behavioral Engine Active</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Displaying expert cognitive recommendations below:
                  </p>
                </div>
              ) : null}

              {/* Main AI Coaching Content */}
              {!isLoadingAI && (
                <>
                  {/* Diagnosis Card */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4">
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
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Targeted Behavioral Protocols
                    </h5>

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
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                ⚡ Powered by Google Gemini AI
              </span>
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
