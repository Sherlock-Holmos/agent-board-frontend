import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

export const http = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAuthEndpoint = url.startsWith('/auth/login') || url.startsWith('/auth/register')
  const token = localStorage.getItem('token')
  if (token && !isAuthEndpoint) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
