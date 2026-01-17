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
  const { data } = await http.post<ApiResponse<UserLoginResponse>>('/user/auth/login', payload)
  return data
}

export async function apiRegister(payload: UserCreateRequest) {
  const { data } = await http.post<ApiResponse<UserDTO>>('/user/auth/register', payload)
  return data
}

export async function apiMe() {
  const { data } = await http.get<ApiResponse<UserDTO>>('/user/auth/me')
  return data
}

export async function apiUpdateUser(payload: UserUpdateRequest) {
  const { data } = await http.put<ApiResponse<UserDTO>>('/user/auth/update', payload)
  return data
}

export async function apiDeleteUser(id: number) {
  const { data } = await http.delete<ApiResponse<unknown>>(`/user/auth/delete/${id}`)
  return data
}
