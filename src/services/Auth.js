export function parseJwt(token) {
  try {
    const parts = String(token).split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64
    const decoded = atob(padded)
    const json = decodeURIComponent(Array.from(decoded).map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function isTokenExpired(token) {
  const claims = parseJwt(token)
  if (!claims) return false
  if (!claims.exp) return false
  const expMs = Number(claims.exp) * 1000
  return Date.now() >= expMs
}

export function getTokenExpirySeconds(token) {
  const claims = parseJwt(token)
  if (!claims || !claims.exp) return null
  return Number(claims.exp)
}
