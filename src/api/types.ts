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
  estimatedMinutes?: number | null
  effortLevel?: string
  context?: string
  location?: string
  energyRequired?: string
  deadlineStrict?: boolean
  importanceWeight?: number | null
}

export interface SubtaskDTO {
  id?: number
  todoId?: number
  title?: string
  completed?: boolean
  sortOrder?: number
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
  deleted?: boolean
}

export interface ReminderDTO {
  id?: number
  todoId?: number
  remindAt?: string | Date | null
  channel?: string
  status?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface RecurrenceRuleDTO {
  id?: number
  todoId?: number
  rrule?: string
  timezone?: string
  nextRunAt?: string | Date | null
  active?: boolean
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface AttachmentDTO {
  id?: number
  todoId?: number
  filename?: string
  url?: string
  mimeType?: string
  sizeBytes?: number
  createdAt?: string | Date | null
}

export interface ActivityLogDTO {
  id?: number
  todoId?: number
  userId?: number
  action?: string
  payload?: string
  createdAt?: string | Date | null
}

export interface UserDTO {
  id: number
  name?: string
  email?: string
  phone?: string
  createTime?: string | Date | null
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
  estimatedMinutes?: number | null
  effortLevel?: string
  context?: string
  location?: string
  energyRequired?: string
  deadlineStrict?: boolean
  importanceWeight?: number | null
}

export interface UserProfileDTO {
  id?: number
  userId?: number
  timezone?: string
  workHours?: string
  chronotype?: string
  energyCurve?: string
  defaultTaskDuration?: number | null
  focusBlockMinutes?: number | null
  summary?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface UserProfilePolicyDTO {
  id?: number
  userId?: number
  baseWeight?: number | null
  recentWeight?: number | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface UserPreferenceDTO {
  id?: number
  userId?: number
  timezone?: string
  workHours?: string
  chronotype?: string
  energyCurve?: string
  defaultTaskDuration?: number | null
  focusBlockMinutes?: number | null
  preferredContexts?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface UserAvailabilityDTO {
  id?: number
  userId?: number
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  source?: string
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface AgentPlanDTO {
  id?: number
  userId?: number
  planDate?: string | Date | null
  planJson?: string
  score?: number | null
  version?: number
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export interface AgentRecommendationDTO {
  id?: number
  planId?: number
  todoId?: number
  startAt?: string | Date | null
  endAt?: string | Date | null
  reason?: string
  confidence?: number | null
  createdAt?: string | Date | null
}

export interface AgentPlanResponse {
  plan?: AgentPlanDTO | null
  recommendations?: AgentRecommendationDTO[]
}

export interface UserFeedbackDTO {
  id?: number
  userId?: number
  todoId?: number | null
  planId?: number | null
  action?: string
  reason?: string
  rating?: number | null
  createdAt?: string | Date | null
}

export interface UserLoginRequest {
  name: string
  password: string
}

export interface UserLoginResponse {
  token: string
  user: UserDTO
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
