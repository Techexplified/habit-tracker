// Google Gemini 1.5 Flash AI Coaching Service for Habit & Streak Tracker

const GEMINI_API_STORAGE_KEY = 'habit_tracker_gemini_api_key'

/**
 * Get stored Gemini API key from Trello shared board storage or localStorage
 */
export async function getStoredApiKey(t) {
  if (t && typeof t.get === 'function') {
    try {
      const trelloKey = await t.get('board', 'shared', 'gemini_api_key')
      if (trelloKey && typeof trelloKey === 'string' && trelloKey.trim()) {
        return trelloKey.trim()
      }
    } catch {
      // Fall through to localStorage
    }
  }

  try {
    const localKey = localStorage.getItem(GEMINI_API_STORAGE_KEY)
    if (localKey && localKey.trim()) {
      return localKey.trim()
    }
  } catch {}

  // Check build-time environment variable if configured
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY.trim()
  }

  return ''
}

/**
 * Save Gemini API key to Trello shared board data and localStorage
 */
export async function saveStoredApiKey(t, key) {
  const cleanKey = (key || '').trim()
  try {
    if (cleanKey) {
      localStorage.setItem(GEMINI_API_STORAGE_KEY, cleanKey)
    } else {
      localStorage.removeItem(GEMINI_API_STORAGE_KEY)
    }
  } catch {}

  if (t && typeof t.set === 'function') {
    try {
      await t.set('board', 'shared', 'gemini_api_key', cleanKey)
    } catch (err) {
      console.warn('Failed to save API key to Trello board data:', err)
    }
  }
}

/**
 * Generate personalized habit coaching using Google Gemini 1.5 Flash
 */
export async function generateAICoaching({
  habitName = 'Daily Habit',
  currentStreak = 0,
  bestStreak = 0,
  weeklyPercent = 0,
  monthlyPercent = 0,
  apiKey = '',
  t = null
}) {
  const resolvedKey = apiKey || (await getStoredApiKey(t))

  // 1. Try serverless backend proxy first if on Vercel deployment without client key
  if (!resolvedKey) {
    try {
      const serverlessRes = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitName,
          currentStreak,
          bestStreak,
          weeklyPercent,
          monthlyPercent
        })
      })

      if (serverlessRes.ok) {
        const data = await serverlessRes.json()
        if (data && data.diagnosis) {
          return {
            source: 'gemini-serverless',
            ...data
          }
        }
      }
    } catch {
      // Serverless proxy not present or failed, fall back
    }
  }

  // If still no key, throw to indicate key setup needed
  if (!resolvedKey) {
    throw new Error('NO_API_KEY')
  }

  // Construct structured behavioral prompt
  const prompt = `You are an elite behavioral science habit coach combining James Clear's "Atomic Habits" and BJ Fogg's "Tiny Habits".
Analyze this user's habit progress and provide hyper-personalized, concise coaching:

Habit Name / Card: "${habitName}"
Current Active Streak: ${currentStreak} consecutive days
Best All-Time Streak: ${bestStreak} days
Weekly Adherence: ${weeklyPercent}%
Monthly Adherence: ${monthlyPercent}%

Respond ONLY with a valid JSON object matching this exact schema (no markdown fences, no extra text):
{
  "stage": "Initiation" (if 1-3d) OR "Ramp-up" (if 4-9d) OR "Stable Automaticity" (if 10+d),
  "diagnosis": "1 concise, empowering sentence assessing their momentum and neurological habit stage.",
  "microTactic": {
    "title": "A punchy 3-4 word tactic name",
    "description": "Specific 1-2 sentence behavioral tactic tailored directly to the habit '${habitName}'."
  },
  "dropOffDefense": {
    "title": "Never Miss Twice Anchor",
    "description": "1 sentence rule on how to protect their ${currentStreak}-day streak when schedule or energy drops."
  },
  "identityStatement": "1 short identity-reinforcing mantra for this habit (e.g. 'I am someone who never skips my daily focus')."
}`

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
    resolvedKey
  )}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error?.message || `HTTP ${response.status} error`
    throw new Error(`Gemini API Error: ${errorMessage}`)
  }

  const result = await response.json()
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Clean and parse JSON
  let cleaned = rawText.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }

  try {
    const parsed = JSON.parse(cleaned)
    return {
      source: 'gemini-1.5-flash',
      ...parsed
    }
  } catch (parseErr) {
    console.warn('Failed to parse Gemini JSON output, falling back to raw:', parseErr)
    return {
      source: 'gemini-1.5-flash',
      stage: currentStreak >= 10 ? 'Stable Automaticity' : currentStreak >= 4 ? 'Ramp-up' : 'Initiation',
      diagnosis: rawText.slice(0, 200),
      microTactic: {
        title: 'The 2-Minute Anchor',
        description: `Scale down ${habitName} to just 2 minutes on busy days to keep neural pathways firing.`
      },
      dropOffDefense: {
        title: 'Never Miss Twice Anchor',
        description: 'Missing one day is an accident; missing two is the start of a new, bad habit.'
      },
      identityStatement: `Every rep of ${habitName} is a vote for the person you are becoming.`
    }
  }
}
