const ANON_KEY   = 'anon_id'
const FOLLOW_KEY = 'followed_teams'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // HTTP 環境 (非 Secure Context) 用フォールバック
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export function getAnonId(): string {
  const stored = localStorage.getItem(ANON_KEY)
  if (stored) return stored
  const id = generateUUID()
  localStorage.setItem(ANON_KEY, id)
  return id
}

export function getFollowedTeams(): string[] {
  const stored = localStorage.getItem(FOLLOW_KEY)
  try {
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

export function toggleFollowTeam(slug: string): boolean {
  const teams = getFollowedTeams()
  const idx = teams.indexOf(slug)
  if (idx === -1) {
    teams.push(slug)
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(teams))
    return true
  }
  teams.splice(idx, 1)
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(teams))
  return false
}

export function isFollowingTeam(slug: string): boolean {
  return getFollowedTeams().includes(slug)
}
