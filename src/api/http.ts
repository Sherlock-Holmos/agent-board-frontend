import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

export const http = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAuthEndpoint = url.startsWith('/user/auth/login') || url.startsWith('/user/auth/register')
  const isTodoEndpoint = url.startsWith('/todos') || url.startsWith('/api/todos')
  const token = localStorage.getItem('token')
  if (token && !isAuthEndpoint) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isTodoEndpoint) {
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
