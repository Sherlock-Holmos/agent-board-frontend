import { http } from './http'

export type AgentExecuteResponse = {
  status: 'success' | 'error'
  response?: string
  profile?: string
  error?: string
}

export async function apiExecuteAgent(query: string, profile?: string) {
  const payload: Record<string, string> = { query }
  if (profile !== undefined) {
    payload.profile = profile
  }
  const { data } = await http.post<AgentExecuteResponse>('/agent/execute', payload)
  return data
}
