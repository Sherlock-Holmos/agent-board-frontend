import { http } from './http'
import type { ApiResponse, TodoDTO, TodoUpdateRequest } from './types'

function extractData<T>(payload: T | ApiResponse<T> | undefined | null, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const wrapped = payload as ApiResponse<T>
    return (wrapped.data ?? fallback) as T
  }
  return (payload as T) ?? fallback
}

export async function apiCreateTodo(payload: TodoDTO) {
  const { data } = await http.post<ApiResponse<TodoDTO> | TodoDTO>('/todos', payload)
  return extractData(data, {} as TodoDTO)
}

export async function apiGetTodoById(id: number) {
  const { data } = await http.get<ApiResponse<TodoDTO> | TodoDTO>(`/todos/${id}`)
  return extractData(data, {} as TodoDTO)
}

export async function apiUpdateTodo(id: number, payload: TodoDTO) {
  const { data } = await http.put<ApiResponse<TodoDTO> | TodoDTO>(`/todos/${id}`, payload)
  return extractData(data, {} as TodoDTO)
}

export async function apiPatchTodo(id: number, payload: TodoUpdateRequest) {
  const { data } = await http.patch<ApiResponse<TodoDTO> | TodoDTO>(`/todos/${id}`, payload)
  return extractData(data, {} as TodoDTO)
}

export async function apiDeleteTodo(id: number) {
  await http.delete(`/todos/${id}`)
}

export async function apiRestoreTodo(id: number) {
  await http.post(`/todos/${id}/restore`)
}

export async function apiCompleteTodo(id: number) {
  const { data } = await http.post<ApiResponse<TodoDTO> | TodoDTO>(`/todos/${id}/complete`)
  return extractData(data, {} as TodoDTO)
}

export async function apiUncompleteTodo(id: number) {
  const { data } = await http.post<ApiResponse<TodoDTO> | TodoDTO>(`/todos/${id}/uncomplete`)
  return extractData(data, {} as TodoDTO)
}

export async function apiGetAllTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos')
  return extractData(data, [])
}

export async function apiGetTodayTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/today')
  return extractData(data, [])
}

export async function apiGetNext7DaysTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/next-7-days')
  return extractData(data, [])
}

export async function apiGetInboxTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/inbox')
  return extractData(data, [])
}

export async function apiGetCompletedTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/completed')
  return extractData(data, [])
}

export async function apiGetNoDateTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/no-date')
  return extractData(data, [])
}

export async function apiGetDeletedTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/deleted')
  return extractData(data, [])
}
