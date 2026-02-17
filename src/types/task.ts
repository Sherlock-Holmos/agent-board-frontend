export interface Task {
  id: string
  title: string
  completed: boolean
  date?: Date | null
  checklist: string
  priority?: 'p1' | 'p2' | 'p3' | 'p4'
  tags?: string[]
  subtasks?: Subtask[]
  reminders?: Reminder[]
  recurrenceRules?: RecurrenceRule[]
  attachments?: Attachment[]
  activityLogs?: ActivityLog[]
  // 四象限属性
  important?: boolean  // 重要性
  urgent?: boolean     // 紧急度
}

export interface Subtask {
  id?: string
  title: string
  completed?: boolean
  sortOrder?: number
}

export interface Reminder {
  id?: string
  remindAt: Date | string
  channel?: string
  status?: string
}

export interface RecurrenceRule {
  id?: string
  rrule: string
  timezone?: string
  nextRunAt?: Date | string | null
  active?: boolean
}

export interface Attachment {
  id?: string
  filename: string
  url: string
  mimeType?: string
  sizeBytes?: number
}

export interface ActivityLog {
  id?: string
  action: string
  payload?: string
  createdAt?: Date | string | null
}

export interface Checklist {
  id: string
  name: string
  icon?: string
}

export type FilterType = 'all' | 'today' | 'last7days' | 'inbox' | 'completed' | 'trash' | 'list' | 'quadrant'

export type QuadrantType = 'I' | 'II' | 'III' | 'IV'