export interface ApiResponse<T> {
  code: number
  message?: string
  data?: T
  error?: string
  path?: string
  timestamp?: number
}

export interface UserDTO {
  id: number
  name: string
  email: string
  phone: string
  password?: string
  createTime: string
  updateTime: string
}

export interface UserLoginResponse {
  token: string
  user: UserDTO
}

export interface UserLoginRequest {
  name: string
  password: string
}

export interface UserCreateRequest {
  name: string
  email: string
  phone: string
  password: string
}

export interface UserUpdateRequest {
  id?: number
  name?: string
  email?: string
  phone?: string
  password?: string
}
