import { http } from './http'

export type AgentExecuteResponse = {
  status: 'success' | 'error'
  response?: string
  error?: string
}

export async function apiExecuteAgent(query: string) {
  const { data } = await http.post<AgentExecuteResponse>('/agent/execute', { query })
  return data
}
