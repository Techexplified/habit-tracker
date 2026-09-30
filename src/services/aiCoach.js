// Google Gemini AI Coaching Service for Habit & Streak Tracker

const B64_TOKEN = 'QVEuQWI4Uk42Sk5mQW1ObVdva3hBZTlDUWJBUVJOaEpVaVNFZVBIbXN6S3pKYWQ4WmFFRlE='

export const DEFAULT_GEMINI_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof atob === 'function' ? atob(B64_TOKEN) : '')

const GEMINI_API_STORAGE_KEY = 'habit_tracker_gemini_api_key'
export const GEMINI_MODEL = 'gemini-3.5-flash-lite'

const COACHING_ANGLES = [
  'Focus on friction reduction, the 2-minute gateway rule, and lowering cognitive effort.',
  'Focus on environmental cues, visual prompts, and habit stacking (attaching to an existing daily routine).',
  'Focus on identity reinforcement, neuroplasticity pride, and shifting from effort to automatic identity.',
  'Focus on emergency contingency plans, busy-day defenses, and the "Never Miss Twice" rule.'
]

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
  refreshCount = 0,
  apiKey = '',
  t = null
}) {
  const angle = COACHING_ANGLES[refreshCount % COACHING_ANGLES.length]
  const resolvedKey = apiKey || (await getStoredApiKey(t)) || DEFAULT_GEMINI_KEY

  const prompt = `You are an elite behavioral science habit coach combining James Clear's "Atomic Habits" and BJ Fogg's "Tiny Habits".
Analyze this user's habit progress and provide hyper-personalized, concise coaching:

Habit Name / Card: "${habitName}"
Current Active Streak: ${currentStreak} consecutive days
Best All-Time Streak: ${bestStreak} days
Weekly Adherence: ${weeklyPercent}%
Monthly Adherence: ${monthlyPercent}%
Focus Perspective: ${angle}
Iteration Seed: ${Date.now()}-${refreshCount}

Respond ONLY with a valid JSON object matching this exact schema (no markdown fences, no extra text):
{
  "stage": "Initiation" (if 1-3d) OR "Ramp-up" (if 4-9d) OR "Stable Automaticity" (if 10+d),
  "diagnosis": "1 concise, empowering sentence assessing their momentum and neurological habit stage with a fresh perspective.",
  "microTactic": {
    "title": "A punchy 3-4 word tactic name",
    "description": "Specific 1-2 sentence behavioral tactic tailored directly to the habit '${habitName}' emphasizing: ${angle}."
  },
  "dropOffDefense": {
    "title": "Never Miss Twice Anchor",
    "description": "1 sentence rule on how to protect their ${currentStreak}-day streak when schedule or energy drops."
  },
  "identityStatement": "1 short identity-reinforcing mantra for this habit (e.g. 'I am someone who never skips my daily focus')."
}`

  // 1. Direct call to Google Gemini endpoint
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
      resolvedKey
    )}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(18000),
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 600
        }
      })
    })

    if (response.ok) {
      const result = await response.json()
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const parsed = safeParseJson(rawText)

      if (parsed && parsed.diagnosis) {
        return {
          source: 'gemini-ai',
          ...parsed
        }
      }
    }
  } catch (directErr) {
    console.warn('Direct Gemini API call failed or timed out, trying serverless fallback:', directErr)
  }

  // 2. Fallback to serverless endpoint if in browser on Vercel
  if (typeof window !== 'undefined') {
    try {
      const serverlessRes = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          habitName,
          currentStreak,
          bestStreak,
          weeklyPercent,
          monthlyPercent,
          refreshCount,
          angle
        })
      })

      if (serverlessRes.ok) {
        const data = await serverlessRes.json()
        if (data && data.diagnosis) {
          return {
            source: 'gemini-ai',
            ...data
          }
        }
      }
    } catch (proxyErr) {
      console.warn('Serverless proxy also failed:', proxyErr)
    }
  }

  // 3. Fallback to dynamic rule-based behavioral science coaching if offline
  return {
    source: 'behavioral-engine',
    stage: currentStreak >= 10 ? 'Stable Automaticity' : currentStreak >= 4 ? 'Ramp-up' : 'Initiation',
    diagnosis: `Impressive commitment! You are in the ${currentStreak >= 10 ? 'Stable Automaticity' : currentStreak >= 4 ? 'Ramp-up' : 'Initiation'} stage with an active ${currentStreak}-day streak and ${weeklyPercent}% weekly execution.`,
    microTactic: {
      title: refreshCount % 2 === 0 ? 'The 2-Minute Gateway' : 'Habit Stacking Anchor',
      description:
        refreshCount % 2 === 0
          ? `Scale down "${habitName}" to just 2 minutes on busy days to keep neural pathways firing.`
          : `Anchor "${habitName}" immediately after an existing anchor routine like morning standup.`
    },
    dropOffDefense: {
      title: 'Never Miss Twice Anchor',
      description: 'Missing 1 day is an accident; missing 2 is the start of a new habit. Prioritize showing up tomorrow.'
    },
    identityStatement: `Every rep of "${habitName}" is a vote for the person you are becoming.`
  }
}
