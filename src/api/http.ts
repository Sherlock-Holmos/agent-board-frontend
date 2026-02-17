import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

function resolveApiBaseUrl(raw?: string) {
  if (!raw) return '/api'
  const trimmed = raw.replace(/\/+$/, '')
  if (trimmed.endsWith('/api')) return trimmed
  return `${trimmed}/api`
}

export const http = axios.create({
  baseURL: resolveApiBaseUrl(API_BASE_URL),
  timeout: 120000
})

http.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAuthEndpoint = url.startsWith('/user/auth/login') || url.startsWith('/user/auth/register')
  const isTodoEndpoint = url.startsWith('/todos') || url.startsWith('/api/todos')
  const isAgentEndpoint = url.startsWith('/agent') || url.startsWith('/api/agent')
  const token = localStorage.getItem('token')
  if (token && !isAuthEndpoint) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isTodoEndpoint || isAgentEndpoint) {
    try {
      const userRaw = localStorage.getItem('user')
      const user = userRaw ? JSON.parse(userRaw) : null
      const userId = user?.id
      if (userId) {
        config.headers = config.headers ?? {}
        config.headers['X-User-Id'] = userId
      }
    } catch {
      // ignore parse errors
    }
  }
  return config
})
