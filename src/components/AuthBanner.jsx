import React, { useState } from 'react'
import { Key, ShieldCheck, ExternalLink, LogOut, ChevronDown, ChevronUp, User } from 'lucide-react'
import { authorizeWithTrello, clearAuthToken, saveApiKey } from '../services/trelloAuth'

export default function AuthBanner({
  t,
  isAuthorized,
  apiKey,
  memberProfile,
  onAuthChange
}) {
  const [inputKey, setInputKey] = useState(apiKey || '')
  const [isEditingKey, setIsEditingKey] = useState(!apiKey && !isAuthorized)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuthorize = async () => {
    if (!inputKey.trim()) {
      setErrorMsg('Please enter your 32-character Trello API Key.')
      return
    }

    setErrorMsg('')
    setIsLoading(true)

    try {
      await saveApiKey(t, inputKey.trim())
      await authorizeWithTrello(t, inputKey.trim())
      onAuthChange(true, inputKey.trim())
      setIsEditingKey(false)
    } catch (err) {
      setErrorMsg(err.message || 'Authorization failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    await clearAuthToken(t)
    onAuthChange(false, inputKey)
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Trello Account Authorization</h4>
            <p className="text-xs text-slate-500">
              Connect with your Trello account to synchronize habits across all your boards.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingKey(!isEditingKey)}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 p-1 rounded cursor-pointer"
        >
          <span>{isEditingKey ? 'Hide' : 'Configure'}</span>
          {isEditingKey ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isEditingKey && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Trello API Key
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter 32-character Trello API Key..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAuthorize}
                className="px-4 py-2 bg-[#00875a] hover:bg-[#007048] disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                {isLoading ? 'Authorizing...' : 'Authorize with Trello'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Don&apos;t have your API Key?</span>
            <a
              href="https://trello.com/power-ups/admin"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Get API Key from Trello Power-Up Admin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
