import { http } from './http'
import type { ApiResponse, TodoDTO, TodoUpdateRequest, SubtaskDTO, ReminderDTO, RecurrenceRuleDTO, AttachmentDTO, ActivityLogDTO } from './types'

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

export async function apiHardDeleteTodo(id: number) {
  await http.delete(`/todos/${id}/hard-delete`)
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

export async function apiGetActiveTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/active')
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

export async function apiGetTodosByList(listName: string) {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>(`/todos/list/${encodeURIComponent(listName)}`)
  return extractData(data, [])
}

export async function apiGetActiveTodosByList(listName: string) {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>(`/todos/list/${encodeURIComponent(listName)}/active`)
  return extractData(data, [])
}

export async function apiGetTodoLists() {
  const { data } = await http.get<ApiResponse<string[]> | string[]>('/todos/lists')
  return extractData(data, [])
}

export async function apiGetDeletedTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/deleted')
  return extractData(data, [])
}

export async function apiGetCompletedTodos() {
  const { data } = await http.get<ApiResponse<TodoDTO[]> | TodoDTO[]>('/todos/completed')
  return extractData(data, [])
}

export async function apiGetSubtasks(todoId: number) {
  const { data } = await http.get<ApiResponse<SubtaskDTO[]> | SubtaskDTO[]>(`/todos/${todoId}/subtasks`)
  return extractData(data, [])
}

export async function apiCreateSubtask(todoId: number, payload: SubtaskDTO) {
  const { data } = await http.post<ApiResponse<SubtaskDTO> | SubtaskDTO>(`/todos/${todoId}/subtasks`, payload)
  return extractData(data, {} as SubtaskDTO)
}

export async function apiUpdateSubtask(todoId: number, subtaskId: number, payload: SubtaskDTO) {
  const { data } = await http.patch<ApiResponse<SubtaskDTO> | SubtaskDTO>(`/todos/${todoId}/subtasks/${subtaskId}`, payload)
  return extractData(data, {} as SubtaskDTO)
}

export async function apiDeleteSubtask(todoId: number, subtaskId: number) {
  await http.delete(`/todos/${todoId}/subtasks/${subtaskId}`)
}

export async function apiGetReminders(todoId: number) {
  const { data } = await http.get<ApiResponse<ReminderDTO[]> | ReminderDTO[]>(`/todos/${todoId}/reminders`)
  return extractData(data, [])
}

export async function apiCreateReminder(todoId: number, payload: ReminderDTO) {
  const { data } = await http.post<ApiResponse<ReminderDTO> | ReminderDTO>(`/todos/${todoId}/reminders`, payload)
  return extractData(data, {} as ReminderDTO)
}

export async function apiUpdateReminder(todoId: number, reminderId: number, payload: ReminderDTO) {
  const { data } = await http.patch<ApiResponse<ReminderDTO> | ReminderDTO>(`/todos/${todoId}/reminders/${reminderId}`, payload)
  return extractData(data, {} as ReminderDTO)
}

export async function apiDeleteReminder(todoId: number, reminderId: number) {
  await http.delete(`/todos/${todoId}/reminders/${reminderId}`)
}

export async function apiGetRecurrenceRules(todoId: number) {
  const { data } = await http.get<ApiResponse<RecurrenceRuleDTO[]> | RecurrenceRuleDTO[]>(`/todos/${todoId}/recurrence-rules`)
  return extractData(data, [])
}

export async function apiCreateRecurrenceRule(todoId: number, payload: RecurrenceRuleDTO) {
  const { data } = await http.post<ApiResponse<RecurrenceRuleDTO> | RecurrenceRuleDTO>(`/todos/${todoId}/recurrence-rules`, payload)
  return extractData(data, {} as RecurrenceRuleDTO)
}

export async function apiUpdateRecurrenceRule(todoId: number, ruleId: number, payload: RecurrenceRuleDTO) {
  const { data } = await http.patch<ApiResponse<RecurrenceRuleDTO> | RecurrenceRuleDTO>(`/todos/${todoId}/recurrence-rules/${ruleId}`, payload)
  return extractData(data, {} as RecurrenceRuleDTO)
}

export async function apiDeleteRecurrenceRule(todoId: number, ruleId: number) {
  await http.delete(`/todos/${todoId}/recurrence-rules/${ruleId}`)
}

export async function apiGetAttachments(todoId: number) {
  const { data } = await http.get<ApiResponse<AttachmentDTO[]> | AttachmentDTO[]>(`/todos/${todoId}/attachments`)
  return extractData(data, [])
}

export async function apiCreateAttachment(todoId: number, payload: AttachmentDTO) {
  const { data } = await http.post<ApiResponse<AttachmentDTO> | AttachmentDTO>(`/todos/${todoId}/attachments`, payload)
  return extractData(data, {} as AttachmentDTO)
}

export async function apiUpdateAttachment(todoId: number, attachmentId: number, payload: AttachmentDTO) {
  const { data } = await http.patch<ApiResponse<AttachmentDTO> | AttachmentDTO>(`/todos/${todoId}/attachments/${attachmentId}`, payload)
  return extractData(data, {} as AttachmentDTO)
}

export async function apiDeleteAttachment(todoId: number, attachmentId: number) {
  await http.delete(`/todos/${todoId}/attachments/${attachmentId}`)
}

export async function apiGetActivityLogs(todoId: number) {
  const { data } = await http.get<ApiResponse<ActivityLogDTO[]> | ActivityLogDTO[]>(`/todos/${todoId}/activity-logs`)
  return extractData(data, [])
}

export async function apiCreateActivityLog(todoId: number, payload: ActivityLogDTO) {
  const { data } = await http.post<ApiResponse<ActivityLogDTO> | ActivityLogDTO>(`/todos/${todoId}/activity-logs`, payload)
  return extractData(data, {} as ActivityLogDTO)
}

