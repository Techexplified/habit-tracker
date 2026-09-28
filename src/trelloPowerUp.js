// Trello Power-Up Context Helper for Modal and Card-Back Iframe

export function isInsideTrello() {
  if (typeof window === 'undefined') return false
  try {
    return window.self !== window.top
  } catch {
    // If accessing window.top throws a security exception, we are inside a cross-origin iframe (Trello)
    return true
  }
}

export function getTrelloContext() {
  if (typeof window === 'undefined') return null

  // If running directly in browser outside an iframe, skip Trello client to prevent postMessage hangs
  if (!isInsideTrello()) {
    return null
  }

  if (window.TrelloPowerUp && typeof window.TrelloPowerUp.iframe === 'function') {
    try {
      return window.TrelloPowerUp.iframe()
    } catch (e) {
      console.warn('Failed to initialize Trello iframe context:', e)
      return null
    }
  }

  return null
}

export function autoSize(t) {
  if (t && typeof t.sizeTo === 'function') {
    try {
      t.sizeTo('#root').catch(() => {})
    } catch {}
  }
}
