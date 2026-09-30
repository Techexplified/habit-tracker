import React, { useState, useEffect } from 'react'
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
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react'
import {
  generateAICoaching,
  getStoredApiKey,
  saveStoredApiKey
} from '../services/aiCoach'

export default function HabitInsights({
  habitName = 'Daily Habit & Focus',
  currentStreak = 12,
  bestStreak = 18,
  weeklyPercent = 57,
  monthlyPercent = 96,
  trelloContext = null
}) {
  const [showCoachModal, setShowCoachModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [showKeySettings, setShowKeySettings] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  // Load any stored API key on mount
  useEffect(() => {
    async function loadKey() {
      const stored = await getStoredApiKey(trelloContext)
      if (stored) {
        setApiKey(stored)
        setKeyInput(stored)
      }
    }
    loadKey()
  }, [trelloContext])

  // Trigger AI generation when modal opens (if key exists and no result yet)
  const handleOpenModal = () => {
    setShowCoachModal(true)
    if (!aiResult && !isLoadingAI) {
      triggerAICoaching(apiKey)
    }
  }

  const triggerAICoaching = async (keyToUse = apiKey) => {
    setIsLoadingAI(true)
    setAiError(null)
    try {
      const coaching = await generateAICoaching({
        habitName,
        currentStreak,
        bestStreak,
        weeklyPercent,
        monthlyPercent,
        apiKey: keyToUse,
        t: trelloContext
      })
      setAiResult(coaching)
    } catch (err) {
      if (err.message === 'NO_API_KEY') {
        // No key configured yet: fall back cleanly to behavioral engine without error
        setAiResult(null)
      } else {
        setAiError(err.message || 'Failed to generate AI insights')
      }
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleSaveKey = async (e) => {
    e.preventDefault()
    const cleanKey = keyInput.trim()
    await saveStoredApiKey(trelloContext, cleanKey)
    setApiKey(cleanKey)
    setSaveSuccessMsg(cleanKey ? 'API key saved!' : 'Key removed')
    setTimeout(() => setSaveSuccessMsg(''), 2500)

    if (cleanKey) {
      setShowKeySettings(false)
      triggerAICoaching(cleanKey)
    }
  }

  // Determine stage based on current streak
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">Deep AI Habit Coach</h4>
                    {aiResult?.source?.includes('gemini') && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-100 border border-purple-300/30">
                        Gemini 1.5 Flash
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-purple-200 leading-none mt-0.5">
                    Personalized guidance for &ldquo;{habitName}&rdquo;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {apiKey && !isLoadingAI && (
                  <button
                    type="button"
                    title="Regenerate AI Coaching"
                    onClick={() => triggerAICoaching(apiKey)}
                    className="text-purple-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
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
              {/* API Key Toggle Banner */}
              <div className="border border-purple-100 rounded-xl bg-purple-50/50 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setShowKeySettings(!showKeySettings)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-purple-900 hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {apiKey
                        ? 'Google Gemini API Connected (Free)'
                        : 'Connect Free Google Gemini AI API'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600 text-[11px]">
                    <span>{showKeySettings ? 'Hide' : apiKey ? 'Manage Key' : 'Setup (Free)'}</span>
                    {showKeySettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showKeySettings && (
                  <form onSubmit={handleSaveKey} className="p-3.5 pt-1 border-t border-purple-100 space-y-2.5 bg-white">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Google AI Studio provides 100% free Gemini API keys (1,500 requests/day, no credit card required).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Paste your free Gemini API key here..."
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-purple-600 font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Save & Test
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-purple-700 font-bold hover:underline"
                      >
                        <span>Get free key at Google AI Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {saveSuccessMsg && (
                        <span className="text-emerald-600 font-bold">{saveSuccessMsg}</span>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* AI Loading State */}
              {isLoadingAI ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 animate-pulse">
                      <Brain className="w-6 h-6 animate-spin" />
                    </div>
                    <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">
                      Consulting Gemini AI Coach...
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Synthesizing behavioral neuroscience & streak cadence
                    </p>
                  </div>
                </div>
              ) : aiError ? (
                /* AI Error Notification */
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>API Connection Notice</span>
                  </div>
                  <p>{aiError}</p>
                  <p className="text-[11px] text-red-600">
                    Showing local Behavioral Science Engine recommendations below:
                  </p>
                </div>
              ) : null}

              {/* AI or Behavioral Engine Content */}
              {!isLoadingAI && (
                <>
                  {/* Diagnosis Card */}
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1.5">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>
                        {aiResult ? 'Gemini AI Diagnosis' : 'Personalized Diagnosis'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-900 leading-relaxed font-medium">
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
                          {aiResult?.dropOffDefense?.title || 'Implementation Intentions'}
                        </h6>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {aiResult?.dropOffDefense?.description || (
                            <>
                              Pre-commit: <em>&ldquo;When I finish morning standup, I will immediately execute my habit.&rdquo;</em>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Identity Statement (if generated by Gemini) */}
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
                {aiResult?.source?.includes('gemini')
                  ? '⚡ Powered by Google Gemini AI'
                  : '🧠 Powered by Behavioral Science Engine'}
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
