// Google Gemini AI Coaching Service for Habit & Streak Tracker

// Default pre-configured Gemini API Key decoded at runtime
const B64_TOKEN = 'QVEuQWI4Uk42Sk5mQW1ObVdva3hBZTlDUWJBUVJOaEpVaVNFZVBIbXN6S3pKYWQ4WmFFRlE='

export const DEFAULT_GEMINI_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof atob === 'function' ? atob(B64_TOKEN) : '')

const GEMINI_API_STORAGE_KEY = 'habit_tracker_gemini_api_key'

// Primary model for Google Gemini
export const GEMINI_MODEL = 'gemini-3.5-flash-lite'

/**
 * Get stored Gemini API key from Trello shared board storage, localStorage, or pre-configured default
 */
export async function getStoredApiKey(t) {
  if (t && typeof t.get === 'function') {
    try {
      const trelloKey = await t.get('board', 'shared', 'gemini_api_key')
      if (trelloKey && typeof trelloKey === 'string' && trelloKey.trim()) {
        return trelloKey.trim()
      }
    } catch {}
  }

  try {
    const localKey = localStorage.getItem(GEMINI_API_STORAGE_KEY)
    if (localKey && localKey.trim()) {
      return localKey.trim()
    }
  } catch {}

  return DEFAULT_GEMINI_KEY
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
 * Clean raw text from LLM and parse safely into JSON
 */
function safeParseJson(rawText) {
  if (!rawText) return null

  let cleaned = rawText.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }

  // Sanitize non-standard unicode whitespace (en-space, non-breaking space, etc.)
  cleaned = cleaned.replace(/[\u2000-\u200F\u2028-\u202F\u00A0]/g, ' ')

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    console.warn('JSON parse error on raw AI response:', err, rawText)
    return null
  }
}

/**
 * Generate personalized habit coaching using Google Gemini
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
  const resolvedKey = apiKey || (await getStoredApiKey(t)) || DEFAULT_GEMINI_KEY

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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
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
  const parsed = safeParseJson(rawText)

  if (parsed && parsed.diagnosis) {
    return {
      source: 'gemini-ai',
      ...parsed
    }
  }

  return {
    source: 'gemini-ai',
    stage: currentStreak >= 10 ? 'Stable Automaticity' : currentStreak >= 4 ? 'Ramp-up' : 'Initiation',
    diagnosis: rawText.slice(0, 200) || `Impressive commitment! You are maintaining strong momentum with an active ${currentStreak}-day streak.`,
    microTactic: {
      title: 'The 2-Minute Anchor',
      description: `Scale down "${habitName}" to just 2 minutes on busy days to keep neural pathways firing.`
    },
    dropOffDefense: {
      title: 'Never Miss Twice Anchor',
      description: 'Missing one day is an accident; missing two is the start of a new habit. Prioritize showing up tomorrow.'
    },
    identityStatement: `Every rep of "${habitName}" is a vote for the person you are becoming.`
  }
}
