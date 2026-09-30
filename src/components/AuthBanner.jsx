import React, { useState } from 'react'
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react'
import { authorizeWithTrello, clearAuthToken } from '../services/trelloAuth'

export default function AuthBanner({
  t,
  isAuthorized,
  apiKey,
  memberProfile,
  onAuthChange
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuthorize = async () => {
    setErrorMsg('')
    setIsLoading(true)

    try {
      await authorizeWithTrello(t, apiKey)
      onAuthChange(true, apiKey)
    } catch (err) {
      setErrorMsg(err.message || 'Authorization failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    await clearAuthToken(t)
    onAuthChange(false, apiKey)
  }

  if (isAuthorized) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold">Connected to Trello</span>
            {memberProfile ? (
              <span className="text-emerald-700 font-medium">
                as <strong>{memberProfile.fullName || memberProfile.username}</strong>
                {memberProfile.username && ` (@${memberProfile.username})`}
              </span>
            ) : (
              <span className="text-emerald-600 hidden sm:inline">• Auth Active</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-white/80 transition-colors cursor-pointer shrink-0"
          title="Disconnect Trello Account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-xl p-3 sm:px-4 sm:py-3 border border-blue-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">Connect your Trello Account</h4>
          <p className="text-[11px] text-slate-500">
            Link your Trello profile for personalized streak insights.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {errorMsg && (
          <span className="text-xs text-rose-600 font-medium">{errorMsg}</span>
        )}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleAuthorize}
          className="inline-flex items-center justify-center px-4 py-1.5 bg-[#00875a] hover:bg-[#007048] disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          {isLoading ? 'Authorizing...' : 'Authorize with Trello'}
        </button>
      </div>
    </div>
  )
}
