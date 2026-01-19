const PROFILE_KEY_PREFIX = 'agent_profile_'

function getUserId(): string {
  try {
    const raw = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    const id = user?.id
    return id ? String(id) : 'guest'
  } catch {
    return 'guest'
  }
}

export function loadAgentProfile(): string {
  const key = PROFILE_KEY_PREFIX + getUserId()
  return localStorage.getItem(key) || ''
}

export function saveAgentProfile(summary?: string | null) {
  const key = PROFILE_KEY_PREFIX + getUserId()
  if (!summary || !summary.trim()) {
    return
  }
  localStorage.setItem(key, summary.trim())
}

export function clearAgentProfile() {
  const key = PROFILE_KEY_PREFIX + getUserId()
  localStorage.removeItem(key)
}
