// Vercel Serverless Function Proxy for Gemini AI Habit Coach
// Uses process.env.GEMINI_API_KEY when configured on Vercel

export default async function handler(req, res) {
  // Set CORS headers for Trello iframe domain
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Server GEMINI_API_KEY not configured' })
  }

  const { habitName = 'Daily Habit', currentStreak = 0, bestStreak = 0, weeklyPercent = 0, monthlyPercent = 0 } = req.body || {}

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

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      })
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return res.status(geminiRes.status).json({ error: 'Gemini upstream error', details: err })
    }

    const data = await geminiRes.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    let cleaned = rawText.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process AI coaching', message: err.message })
  }
}
