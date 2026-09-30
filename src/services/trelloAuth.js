// Trello API and OAuth Management Service

const DEFAULT_API_KEY = import.meta.env.VITE_TRELLO_API_KEY || ''

export async function getTrelloAuthInfo(t) {
  let isAuthorized = false
  let memberToken = null
  let apiKey = DEFAULT_API_KEY
  let memberProfile = null

  // Check localStorage first
  try {
    const localToken = localStorage.getItem('trello_member_token')
    const localKey = localStorage.getItem('trello_api_key')
    if (localToken) memberToken = localToken
    if (localKey && !apiKey) apiKey = localKey
  } catch {}

  // If inside Trello iframe
  if (t && typeof t.get === 'function') {
    try {
      const [token, boardKey] = await Promise.race([
        Promise.all([
          t.get('member', 'private', 'token'),
          t.get('board', 'shared', 'trello_api_key')
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
      ])

      if (token) memberToken = token
      if (boardKey && !apiKey) apiKey = boardKey
    } catch {}
  }

  isAuthorized = Boolean(memberToken && memberToken.length > 10)

  // If authorized and we have apiKey + token, optionally fetch member details
  if (isAuthorized && apiKey) {
    try {
      const res = await fetch(`https://api.trello.com/1/members/me?key=${apiKey}&token=${memberToken}&fields=fullName,username,avatarUrl`)
      if (res.ok) {
        memberProfile = await res.json()
      }
    } catch {}
  }

  return {
    isAuthorized,
    memberToken,
    apiKey,
    memberProfile
  }
}

export async function saveApiKey(t, key) {
  try {
    localStorage.setItem('trello_api_key', key)
  } catch {}

  if (t && typeof t.set === 'function') {
    try {
      await t.set('board', 'shared', 'trello_api_key', key)
    } catch {}
  }
}

export async function clearAuthToken(t) {
  try {
    localStorage.removeItem('trello_member_token')
  } catch {}

  if (t && typeof t.set === 'function') {
    try {
      await t.set('member', 'private', 'token', null)
    } catch {}
  }
}

export function buildAuthorizeUrl(apiKey, returnUrl) {
  const effectiveReturnUrl = returnUrl || `${window.location.origin}/auth-return.html`
  return `https://trello.com/1/authorize?expiration=never&name=${encodeURIComponent('Habit & Streak Tracker')}&scope=read,write&response_type=token&key=${encodeURIComponent(apiKey)}&return_url=${encodeURIComponent(effectiveReturnUrl)}`
}

export function authorizeWithTrello(t, apiKey) {
  const returnUrl = `${window.location.origin}/auth-return.html`
  const authUrl = buildAuthorizeUrl(apiKey, returnUrl)

  return new Promise((resolve, reject) => {
    // If inside Trello iframe with official SDK authorize method
    if (t && typeof t.authorize === 'function') {
      t.authorize(authUrl, {
        height: 680,
        width: 580,
        validToken: (token) => typeof token === 'string' && token.length > 10
      })
        .then(async (token) => {
          try {
            await t.set('member', 'private', 'token', token)
            localStorage.setItem('trello_member_token', token)
          } catch {}
          resolve(token)
        })
        .catch(reject)
      return
    }

    // Outside Trello iframe or fallback: popup window with postMessage listener
    const popup = window.open(authUrl, 'TrelloAuth', 'width=580,height=680')
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site in your browser settings.'))
      return
    }

    const messageHandler = async (event) => {
      if (event.data && event.data.type === 'TRELLO_AUTH_SUCCESS' && event.data.token) {
        window.removeEventListener('message', messageHandler)
        const token = event.data.token
        try {
          localStorage.setItem('trello_member_token', token)
          if (t && typeof t.set === 'function') {
            await t.set('member', 'private', 'token', token)
          }
        } catch {}
        resolve(token)
      }
    }

    window.addEventListener('message', messageHandler)

    // Check if popup closed manually
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer)
        window.removeEventListener('message', messageHandler)
        const token = localStorage.getItem('trello_member_token')
        if (token) {
          resolve(token)
        } else {
          reject(new Error('Authorization window closed before completing'))
        }
      }
    }, 1000)
  })
}
