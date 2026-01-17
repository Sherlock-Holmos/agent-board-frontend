import { http } from './http'
import type {
  ApiResponse,
  UserDTO,
  UserCreateRequest,
  UserLoginRequest,
  UserLoginResponse,
  UserUpdateRequest
} from './types'

export async function apiLogin(payload: UserLoginRequest) {
  const { data } = await http.post<ApiResponse<UserLoginResponse>>('/auth/login', payload)
  return data
}

export async function apiRegister(payload: UserCreateRequest) {
  const { data } = await http.post<ApiResponse<UserDTO>>('/auth/register', payload)
  return data
}

export async function apiMe() {
  const { data } = await http.get<ApiResponse<UserDTO>>('/auth/me')
  return data
}

export async function apiUpdateUser(payload: UserUpdateRequest) {
  const { data } = await http.put<ApiResponse<UserDTO>>('/auth/update', payload)
  return data
}

export async function apiDeleteUser(id: number) {
  const { data } = await http.delete<ApiResponse<unknown>>(`/auth/delete/${id}`)
  return data
}
