import { http } from './http'
import type {
  AgentPlanResponse,
  UserProfileDTO,
  UserAvailabilityDTO,
  UserFeedbackDTO,
  UserProfilePolicyDTO,
  UserPreferenceDTO
} from './types'

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

export async function apiGetProfile() {
  const { data } = await http.get<UserProfileDTO>('/agent/profile')
  return data
}

export async function apiUpdateProfile(payload: UserProfileDTO) {
  const { data } = await http.put<UserProfileDTO>('/agent/profile', payload)
  return data
}

export async function apiGetBaseProfile() {
  const { data } = await http.get<UserProfileDTO>('/agent/profile/base')
  return data
}

export async function apiUpdateBaseProfile(payload: UserProfileDTO) {
  const { data } = await http.put<UserProfileDTO>('/agent/profile/base', payload)
  return data
}

export async function apiGetRecentProfile() {
  const { data } = await http.get<UserProfileDTO>('/agent/profile/recent')
  return data
}

export async function apiUpdateRecentProfile(payload: UserProfileDTO) {
  const { data } = await http.put<UserProfileDTO>('/agent/profile/recent', payload)
  return data
}

export async function apiUpdateRecentProfileSummary(summary: string) {
  const { data } = await http.put<UserProfileDTO>('/agent/profile/recent/summary', { summary })
  return data
}

export async function apiGetProfilePolicy() {
  const { data } = await http.get<UserProfilePolicyDTO>('/agent/profile/policy')
  return data
}

export async function apiUpdateProfilePolicy(payload: UserProfilePolicyDTO) {
  const { data } = await http.put<UserProfilePolicyDTO>('/agent/profile/policy', payload)
  return data
}

export async function apiGetPreference() {
  const { data } = await http.get<UserPreferenceDTO>('/agent/preference')
  return data
}

export async function apiUpdatePreference(payload: UserPreferenceDTO) {
  const { data } = await http.put<UserPreferenceDTO>('/agent/preference', payload)
  return data
}

export async function apiGetAvailability() {
  const { data } = await http.get<UserAvailabilityDTO[]>('/agent/availability')
  return data
}

export async function apiUpdateAvailability(slots: UserAvailabilityDTO[]) {
  const { data } = await http.put<UserAvailabilityDTO[]>('/agent/availability', { slots })
  return data
}

export async function apiGetPlan(date?: string) {
  const { data } = await http.get<AgentPlanResponse>('/agent/plan', {
    params: date ? { date } : undefined
  })
  return data
}

export async function apiGeneratePlan(date?: string) {
  const { data } = await http.post<AgentPlanResponse>('/agent/plan', date ? { planDate: date } : {})
  return data
}

export async function apiCreateFeedback(payload: UserFeedbackDTO) {
  const { data } = await http.post<UserFeedbackDTO>('/agent/feedback', payload)
  return data
}
