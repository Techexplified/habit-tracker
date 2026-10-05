// Serverless Function Proxy for Deep AI Habit Coach

const B64_TOKEN = 'c2stb3ItdjEtNDBkMTI2NTIwOTBiMTRhZTFiN2Y0NThlM2M0M2U0YWE3YTljN2RiOWQ3MGQxNWJkNjRjNWUzOTQxMWQ0MTVlMg=='

export default async function handler(req, res) {
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

  const defaultKey = Buffer.from(B64_TOKEN, 'base64').toString('utf-8')
  const apiKey = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || defaultKey
  const {
    habitName = 'Daily Habit',
    currentStreak = 0,
    bestStreak = 0,
    weeklyPercent = 0,
    monthlyPercent = 0,
    angle = 'Focus on fresh behavioral micro-tactics.'
  } = req.body || {}

  const prompt = `You are an elite behavioral science habit coach combining James Clear's "Atomic Habits" and BJ Fogg's "Tiny Habits".
Analyze this user's habit progress and provide hyper-personalized, concise coaching:

Habit Name / Card: "${habitName}"
Current Active Streak: ${currentStreak} consecutive days
Best All-Time Streak: ${bestStreak} days
Weekly Adherence: ${weeklyPercent}%
Monthly Adherence: ${monthlyPercent}%
Focus Perspective: ${angle}
Iteration Seed: ${Date.now()}

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no extra commentary):
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

  try {
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://trello.com',
        'X-Title': 'Habit Tracker Power-Up',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        models: ['liquid/lfm-2.5-2.6b:free', 'cohere/north-mini-code:free'],
        max_tokens: 1500,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!aiRes.ok) {
      const err = await aiRes.text()
      return res.status(aiRes.status).json({ error: 'AI upstream error', details: err })
    }

    const data = await aiRes.json()
    const rawText = data.choices?.[0]?.message?.content || ''
    let cleaned = rawText.trim()

    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim()
    } else {
      const first = cleaned.indexOf('{')
      const last = cleaned.lastIndexOf('}')
      if (first !== -1 && last !== -1 && last > first) {
        cleaned = cleaned.slice(first, last + 1)
      }
    }
    cleaned = cleaned.replace(/[\u2000-\u200F\u2028-\u202F\u00A0]/g, ' ')

    const parsed = JSON.parse(cleaned)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process AI coaching', message: err.message })
  }
}
