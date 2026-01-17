export interface ApiResponse<T> {
  code: number
  message?: string
  data?: T
  error?: string
  path?: string
  timestamp?: number
}

export interface TodoDTO {
  id?: number
  title?: string
  name?: string
  description?: string
  listName?: string
  tags?: string
  completed?: boolean
  isCompleted?: boolean
  priority?: string
  dueDate?: string | Date | null
  date?: string | Date | null
  todoDate?: string | Date | null
  important?: boolean
  urgent?: boolean
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
  deleted?: boolean
  userId?: number
}

export interface UserDTO {
  id: number
  name?: string
  email?: string
  phone?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface TodoUpdateRequest {
  title?: string
  description?: string
  listName?: string
  tags?: string
  completed?: boolean
  priority?: string
  dueDate?: string | Date | null
  deleted?: boolean
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
