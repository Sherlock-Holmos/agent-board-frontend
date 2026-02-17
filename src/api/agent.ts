import { http } from './http'

export type AgentExecuteResponse = {
  status: 'success' | 'error'
  response?: string
  profile?: string
  error?: string
}

export async function apiExecuteAgent(query: string, profile?: string, updateProfile?: boolean) {
  const payload: Record<string, string | boolean> = { query }
  if (profile !== undefined) {
    payload.profile = profile
  }
  if (updateProfile !== undefined) {
    payload.updateProfile = updateProfile
  }
  const { data } = await http.post<AgentExecuteResponse>('/agent/execute', payload)
  return data
}
