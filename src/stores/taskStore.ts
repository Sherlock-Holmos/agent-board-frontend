import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, FilterType, QuadrantType, Subtask, Reminder, RecurrenceRule, Attachment } from '@/types/task'
import {
  apiCreateTodo,
  apiCompleteTodo,
  apiDeleteTodo,
  apiGetDeletedTodos,
  apiGetCompletedTodos,
  apiGetAllTodos,
  apiGetActiveTodos,
  apiGetInboxTodos,
  apiGetNext7DaysTodos,
  apiGetTodayTodos,
  apiGetTodoLists,
  apiGetTodosByList,
  apiGetActiveTodosByList,
  apiHardDeleteTodo,
  apiPatchTodo,
  apiRestoreTodo,
  apiUncompleteTodo,
  apiGetSubtasks,
  apiCreateSubtask,
  apiUpdateSubtask,
  apiDeleteSubtask,
  apiGetReminders,
  apiCreateReminder,
  apiUpdateReminder,
  apiDeleteReminder,
  apiGetRecurrenceRules,
  apiCreateRecurrenceRule,
  apiUpdateRecurrenceRule,
  apiDeleteRecurrenceRule,
  apiGetAttachments,
  apiCreateAttachment,
  apiUpdateAttachment,
  apiDeleteAttachment
} from '@/api/todos'
import type { TodoDTO, TodoUpdateRequest, SubtaskDTO, ReminderDTO, RecurrenceRuleDTO, AttachmentDTO } from '@/api/types'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const lastFetchError = ref<string | null>(null)
  const lastFetchAt = ref<Date | null>(null)

  const currentFilter = ref<FilterType>('all')
  const currentListName = ref<string | null>(null)
  const listNames = ref<string[]>([])
  const currentView = ref<'normal' | 'quadrant' | 'calendar' | 'pomodoro'>('normal')
  const hideCompleted = ref(false)
  const HIDE_COMPLETED_KEY = 'hideCompleted'

  try {
    const saved = localStorage.getItem(HIDE_COMPLETED_KEY)
    if (saved != null) {
      hideCompleted.value = saved === 'true'
    }
  } catch {
    // ignore storage errors
  }

  function toDate(value?: string | Date | null) {
    if (!value) return null
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    const trimmed = value.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const dateOnly = new Date(`${trimmed}T00:00:00`)
      return Number.isNaN(dateOnly.getTime()) ? null : dateOnly
    }
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  function toLocalDateTime(value: Date) {
    const pad = (num: number) => String(num).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }

  function toLocalDate(value: Date) {
    const pad = (num: number) => String(num).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }

  function mapTodoToTask(todo: TodoDTO): Task {
    const title = todo.title || todo.name || ''
    const completed = todo.completed ?? todo.isCompleted ?? false
    const date = toDate(todo.dueAt || todo.dueDate || todo.date || todo.todoDate)
    const dueAt = toDate(todo.dueAt)
    const rawPriority = (todo.priority ?? '').toString().toUpperCase()
    let priority: Task['priority'] | undefined

    switch (rawPriority) {
      case 'P1':
        priority = 'p1'
        break
      case 'P2':
        priority = 'p2'
        break
      case 'P3':
        priority = 'p3'
        break
      case 'P4':
        priority = 'p4'
        break
      case 'HIGH':
        priority = 'p1'
        break
      case 'MEDIUM':
        priority = 'p2'
        break
      case 'LOW':
        priority = 'p4'
        break
      default:
        priority = undefined
    }

    const important = priority === 'p1' || priority === 'p2'
    const urgent = priority === 'p1' || priority === 'p3'

    return {
      id: String(todo.id ?? Date.now()),
      title,
      completed,
      date,
      dueAt,
      checklist: todo.listName || '收集箱',
      priority,
      tags: todo.tags ? todo.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      estimatedMinutes: todo.estimatedMinutes ?? null,
      effortLevel: todo.effortLevel,
      context: todo.context,
      location: todo.location,
      energyRequired: todo.energyRequired,
      deadlineStrict: todo.deadlineStrict ?? false,
      importanceWeight: todo.importanceWeight ?? null,
      important,
      urgent
    }
  }

  function toQuadrantPriority(important?: boolean, urgent?: boolean): Task['priority'] {
    if (important && urgent) return 'p1'
    if (important && !urgent) return 'p2'
    if (!important && urgent) return 'p3'
    return 'p4'
  }

  async function fetchTodosForCurrentFilter() {
    lastFetchError.value = null
    let list: TodoDTO[] = []
    try {
      switch (currentFilter.value) {
        case 'today':
          list = await apiGetTodayTodos()
          break
        case 'last7days':
          list = await apiGetNext7DaysTodos()
          break
        case 'inbox':
          list = await apiGetInboxTodos()
          break
        case 'list':
          if (currentListName.value) {
            list = hideCompleted.value
              ? await apiGetActiveTodosByList(currentListName.value)
              : await apiGetTodosByList(currentListName.value)
          } else {
            list = hideCompleted.value
              ? await apiGetActiveTodos()
              : await apiGetAllTodos()
          }
          break
        case 'trash':
          list = await apiGetDeletedTodos()
          break
        case 'completed':
          list = await apiGetCompletedTodos()
          break
        case 'all':
        default:
          list = hideCompleted.value
            ? await apiGetActiveTodos()
            : await apiGetAllTodos()
          break
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取任务失败'
      lastFetchError.value = message
      list = []
    }
    tasks.value = list.map(mapTodoToTask)
    lastFetchAt.value = new Date()

    try {
      listNames.value = await apiGetTodoLists()
    } catch {
      // ignore list fetch errors
    }
  }

  const filteredTasks = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let baseTasks: Task[]

    switch (currentFilter.value) {
      case 'today':
        baseTasks = tasks.value.filter(task => {
          if (!task.date) return false
          const taskDate = new Date(task.date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === today.getTime()
        })
        break
      case 'last7days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        baseTasks = tasks.value.filter(task => {
          if (!task.date) return false
          const taskDate = new Date(task.date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate >= sevenDaysAgo && taskDate <= today
        })
        break
      case 'inbox':
        baseTasks = tasks.value.filter(task => task.checklist === '收集箱')
        break
      default:
        baseTasks = tasks.value
        break
    }

    if (hideCompleted.value) {
      return baseTasks.filter(task => !task.completed)
    }

    return baseTasks
  })

  // 获取任务的四象限类型
  function getQuadrantType(task: Task): QuadrantType {
    if (task.important && task.urgent) return 'I'
    if (task.important && !task.urgent) return 'II'
    if (!task.important && task.urgent) return 'III'
    if (!task.important && !task.urgent) return 'IV'
    return 'IV'
  }

  // 按四象限分组任务
  const tasksByQuadrant = computed(() => {
    const quadrants: Record<string, { completed: Task[], pending: Task[] }> = {
      'I': { completed: [], pending: [] },
      'II': { completed: [], pending: [] },
      'III': { completed: [], pending: [] },
      'IV': { completed: [], pending: [] }
    }

    filteredTasks.value.forEach(task => {
      const quadrant = getQuadrantType(task)
      if (quadrant) {
        if (task.completed) {
          quadrants[quadrant].completed.push(task)
        } else {
          quadrants[quadrant].pending.push(task)
        }
      } else {
        // 如果没有设置重要性和紧急度，默认归入第四象限
        if (task.completed) {
          quadrants['IV'].completed.push(task)
        } else {
          quadrants['IV'].pending.push(task)
        }
      }
    })

    return quadrants
  })

  // 按日期和完成状态分组任务（用于四象限视图）
  function groupTasksByDateAndStatus(tasks: Task[]) {
    const groups: Record<string, { completed: Task[], pending: Task[] }> = {}
    
    tasks.forEach(task => {
      let dateKey: string
      if (!task.date) {
        dateKey = '无日期'
      } else {
        const taskDate = new Date(task.date)
        dateKey = taskDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = { completed: [], pending: [] }
      }
      
      if (task.completed) {
        groups[dateKey].completed.push(task)
      } else {
        groups[dateKey].pending.push(task)
      }
    })
    
    return groups
  }

  const tasksByDate = computed(() => {
    const groups: Record<string, Task[]> = {}
    
    filteredTasks.value.forEach(task => {
      let key: string
      if (!task.date) {
        key = '无日期'
      } else {
        const taskDate = new Date(task.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        taskDate.setHours(0, 0, 0, 0)
        
        if (taskDate.getTime() === today.getTime()) {
          key = '今天'
        } else {
          key = taskDate.toLocaleDateString('zh-CN', { 
            month: 'short', 
            day: 'numeric' 
          })
        }
      }
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
    })
    
    return groups
  })

  const taskCounts = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return {
      all: tasks.value.length,
      today: tasks.value.filter(task => {
        if (!task.date) return false
        const taskDate = new Date(task.date)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === today.getTime()
      }).length,
      last7days: tasks.value.filter(task => {
        if (!task.date) return false
        const taskDate = new Date(task.date)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate >= sevenDaysAgo && taskDate <= today
      }).length,
      inbox: tasks.value.filter(task => task.checklist === '收集箱').length,
      completed: tasks.value.filter(task => task.completed).length
    }
  })

  async function addTask(task: Omit<Task, 'id'>) {
    const baseDate = task.date ?? task.dueAt ?? null
    const payload: TodoDTO = {
      title: task.title,
      description: undefined,
      completed: task.completed,
      dueDate: baseDate ? toLocalDate(baseDate) : null,
      dueAt: task.dueAt ? toLocalDateTime(task.dueAt) : null,
      listName: task.checklist,
      priority: (task.priority ?? toQuadrantPriority(task.important, task.urgent))?.toUpperCase(),
      tags: task.tags ? task.tags.join(',') : undefined,
      estimatedMinutes: task.estimatedMinutes ?? null,
      effortLevel: task.effortLevel,
      context: task.context,
      location: task.location,
      energyRequired: task.energyRequired,
      deadlineStrict: task.deadlineStrict ?? false,
      importanceWeight: task.importanceWeight ?? null
    }

    const created = await apiCreateTodo(payload)
    const newTask = mapTodoToTask(created)
    tasks.value.push(newTask)
    return newTask
  }

  async function toggleTask(id: string, completed?: boolean) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const nextCompleted = typeof completed === 'boolean' ? completed : !task.completed
    const numericId = Number(id)
    const prevCompleted = task.completed
    task.completed = nextCompleted

    try {
      const updated = nextCompleted
        ? await apiCompleteTodo(numericId)
        : await apiUncompleteTodo(numericId)
      const mapped = mapTodoToTask(updated)
      Object.assign(task, mapped)
    } catch (err: unknown) {
      task.completed = prevCompleted
      throw err
    }
  }

  async function deleteTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return
    const numericId = Number(id)
    await apiDeleteTodo(numericId)
    tasks.value.splice(index, 1)
  }

  async function hardDeleteTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return
    const numericId = Number(id)
    await apiHardDeleteTodo(numericId)
    tasks.value.splice(index, 1)
  }

  async function restoreTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return
    const numericId = Number(id)
    await apiRestoreTodo(numericId)
    tasks.value.splice(index, 1)
  }

  function setFilter(filter: FilterType) {
    currentFilter.value = filter
    if (filter !== 'list') {
      currentListName.value = null
    }
    // 设置过滤器时，如果不是四象限视图，确保是普通视图
    if (currentView.value === 'quadrant' && filter !== 'quadrant') {
      currentView.value = 'normal'
    }

    void fetchTodosForCurrentFilter()
  }

  function setListFilter(listName: string) {
    currentListName.value = listName
    setFilter('list')
  }

  function setView(view: 'normal' | 'quadrant' | 'calendar' | 'pomodoro') {
    currentView.value = view
    // 切换到四象限视图时，如果当前过滤器是 quadrant，改为 all
    if (view === 'quadrant' && currentFilter.value === 'quadrant') {
      currentFilter.value = 'all'
    }

    if (view === 'quadrant' || view === 'calendar' || view === 'pomodoro') {
      void fetchTodosForCurrentFilter()
    }
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const numericId = Number(id)
    const payload: TodoUpdateRequest = {}

    if (updates.title !== undefined && updates.title !== task.title) {
      payload.title = updates.title
    }

    if (updates.completed !== undefined && updates.completed !== task.completed) {
      payload.completed = updates.completed
    }

    if (updates.date !== undefined || updates.dueAt !== undefined) {
      const nextDateSource = updates.date ?? updates.dueAt ?? null
      const nextDate = nextDateSource ? toLocalDate(nextDateSource) : null
      const currentDate = task.date ? toLocalDate(task.date) : null
      const nextDateTime = updates.dueAt ? toLocalDateTime(updates.dueAt) : null
      const currentDateTime = task.dueAt ? toLocalDateTime(task.dueAt) : null
      if (nextDate !== currentDate || nextDateTime !== currentDateTime) {
        payload.dueDate = nextDate
        payload.dueAt = nextDateTime
        if (!nextDate && (currentDate || currentDateTime)) {
          payload.clearDueDate = true
        }
      }
    }

    if (updates.checklist !== undefined && updates.checklist !== task.checklist) {
      payload.listName = updates.checklist
    }

    if (updates.priority !== undefined && updates.priority !== task.priority) {
      payload.priority = updates.priority ? updates.priority.toUpperCase() : undefined
    }

    if (updates.important !== undefined || updates.urgent !== undefined) {
      const nextImportant = updates.important ?? task.important ?? false
      const nextUrgent = updates.urgent ?? task.urgent ?? false
      const nextPriority = toQuadrantPriority(nextImportant, nextUrgent)
      if (nextPriority && nextPriority !== task.priority) {
        payload.priority = nextPriority.toUpperCase()
      }
    }

    if (updates.tags !== undefined) {
      const nextTags = updates.tags ? updates.tags.join(',') : undefined
      const currentTags = task.tags ? task.tags.join(',') : undefined
      if (nextTags !== currentTags) {
        payload.tags = nextTags
      }
    }

    if (updates.estimatedMinutes !== undefined && updates.estimatedMinutes !== task.estimatedMinutes) {
      payload.estimatedMinutes = updates.estimatedMinutes
    }

    if (updates.effortLevel !== undefined && updates.effortLevel !== task.effortLevel) {
      payload.effortLevel = updates.effortLevel
    }

    if (updates.context !== undefined && updates.context !== task.context) {
      payload.context = updates.context
    }

    if (updates.location !== undefined && updates.location !== task.location) {
      payload.location = updates.location
    }

    if (updates.energyRequired !== undefined && updates.energyRequired !== task.energyRequired) {
      payload.energyRequired = updates.energyRequired
    }

    if (updates.deadlineStrict !== undefined && updates.deadlineStrict !== task.deadlineStrict) {
      payload.deadlineStrict = updates.deadlineStrict
    }

    if (updates.importanceWeight !== undefined && updates.importanceWeight !== task.importanceWeight) {
      payload.importanceWeight = updates.importanceWeight
    }

    if (Object.keys(payload).length === 0) return

    const updated = await apiPatchTodo(numericId, payload)
    const mapped = mapTodoToTask(updated)
    Object.assign(task, mapped)
    return task
  }

  function toSubtaskDTO(subtask: Subtask): SubtaskDTO {
    return {
      id: subtask.id ? Number(subtask.id) : undefined,
      title: subtask.title,
      completed: subtask.completed ?? false,
      sortOrder: subtask.sortOrder ?? 0
    }
  }

  function toReminderDTO(reminder: Reminder): ReminderDTO {
    const remindAt = reminder.remindAt instanceof Date
      ? reminder.remindAt.toISOString()
      : reminder.remindAt
    return {
      id: reminder.id ? Number(reminder.id) : undefined,
      remindAt,
      channel: reminder.channel,
      status: reminder.status
    }
  }

  function toRecurrenceRuleDTO(rule: RecurrenceRule): RecurrenceRuleDTO {
    const nextRunAt = rule.nextRunAt instanceof Date
      ? rule.nextRunAt.toISOString()
      : rule.nextRunAt
    return {
      id: rule.id ? Number(rule.id) : undefined,
      rrule: rule.rrule,
      timezone: rule.timezone,
      nextRunAt,
      active: rule.active
    }
  }

  function toAttachmentDTO(attachment: Attachment): AttachmentDTO {
    return {
      id: attachment.id ? Number(attachment.id) : undefined,
      filename: attachment.filename,
      url: attachment.url,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes
    }
  }

  async function syncSubtasks(todoId: number, nextSubtasks?: Subtask[]) {
    if (!nextSubtasks) return
    const existing = await apiGetSubtasks(todoId)
    const existingById = new Map<number, SubtaskDTO>()
    existing.forEach(item => {
      if (item.id != null) existingById.set(item.id, item)
    })

    const nextIds = new Set<number>()
    for (const subtask of nextSubtasks) {
      const dto = toSubtaskDTO(subtask)
      if (dto.id != null) {
        nextIds.add(dto.id)
        const current = existingById.get(dto.id)
        const changed = !current
          || current.title !== dto.title
          || (current.completed ?? false) !== (dto.completed ?? false)
          || (current.sortOrder ?? 0) !== (dto.sortOrder ?? 0)
        if (changed) {
          await apiUpdateSubtask(todoId, dto.id, dto)
        }
      } else {
        await apiCreateSubtask(todoId, dto)
      }
    }

    for (const current of existing) {
      if (current.id != null && !nextIds.has(current.id)) {
        await apiDeleteSubtask(todoId, current.id)
      }
    }
  }

  async function syncReminders(todoId: number, nextReminders?: Reminder[]) {
    if (!nextReminders) return
    const existing = await apiGetReminders(todoId)
    const existingById = new Map<number, ReminderDTO>()
    existing.forEach(item => {
      if (item.id != null) existingById.set(item.id, item)
    })

    const nextIds = new Set<number>()
    for (const reminder of nextReminders) {
      const dto = toReminderDTO(reminder)
      if (dto.id != null) {
        nextIds.add(dto.id)
        const current = existingById.get(dto.id)
        const currentTime = current?.remindAt ? new Date(current.remindAt).toISOString() : null
        const nextTime = dto.remindAt ? new Date(dto.remindAt).toISOString() : null
        const changed = !current
          || currentTime !== nextTime
          || (current.channel ?? '') !== (dto.channel ?? '')
          || (current.status ?? '') !== (dto.status ?? '')
        if (changed) {
          await apiUpdateReminder(todoId, dto.id, dto)
        }
      } else {
        await apiCreateReminder(todoId, dto)
      }
    }

    for (const current of existing) {
      if (current.id != null && !nextIds.has(current.id)) {
        await apiDeleteReminder(todoId, current.id)
      }
    }
  }

  async function syncRecurrenceRules(todoId: number, nextRules?: RecurrenceRule[]) {
    if (!nextRules) return
    const existing = await apiGetRecurrenceRules(todoId)
    const existingById = new Map<number, RecurrenceRuleDTO>()
    existing.forEach(item => {
      if (item.id != null) existingById.set(item.id, item)
    })

    const nextIds = new Set<number>()
    for (const rule of nextRules) {
      const dto = toRecurrenceRuleDTO(rule)
      if (dto.id != null) {
        nextIds.add(dto.id)
        const current = existingById.get(dto.id)
        const currentTime = current?.nextRunAt ? new Date(current.nextRunAt).toISOString() : null
        const nextTime = dto.nextRunAt ? new Date(dto.nextRunAt).toISOString() : null
        const changed = !current
          || (current.rrule ?? '') !== (dto.rrule ?? '')
          || (current.timezone ?? '') !== (dto.timezone ?? '')
          || currentTime !== nextTime
          || (current.active ?? true) !== (dto.active ?? true)
        if (changed) {
          await apiUpdateRecurrenceRule(todoId, dto.id, dto)
        }
      } else {
        await apiCreateRecurrenceRule(todoId, dto)
      }
    }

    for (const current of existing) {
      if (current.id != null && !nextIds.has(current.id)) {
        await apiDeleteRecurrenceRule(todoId, current.id)
      }
    }
  }

  async function syncAttachments(todoId: number, nextAttachments?: Attachment[]) {
    if (!nextAttachments) return
    const existing = await apiGetAttachments(todoId)
    const existingById = new Map<number, AttachmentDTO>()
    existing.forEach(item => {
      if (item.id != null) existingById.set(item.id, item)
    })

    const nextIds = new Set<number>()
    for (const attachment of nextAttachments) {
      const dto = toAttachmentDTO(attachment)
      if (dto.id != null) {
        nextIds.add(dto.id)
        const current = existingById.get(dto.id)
        const changed = !current
          || (current.filename ?? '') !== (dto.filename ?? '')
          || (current.url ?? '') !== (dto.url ?? '')
          || (current.mimeType ?? '') !== (dto.mimeType ?? '')
          || (current.sizeBytes ?? 0) !== (dto.sizeBytes ?? 0)
        if (changed) {
          await apiUpdateAttachment(todoId, dto.id, dto)
        }
      } else {
        await apiCreateAttachment(todoId, dto)
      }
    }

    for (const current of existing) {
      if (current.id != null && !nextIds.has(current.id)) {
        await apiDeleteAttachment(todoId, current.id)
      }
    }
  }

  async function syncTaskExtras(todoId: string, extras: { subtasks?: Subtask[]; reminders?: Reminder[]; recurrenceRules?: RecurrenceRule[]; attachments?: Attachment[] }) {
    const numericId = Number(todoId)
    await syncSubtasks(numericId, extras.subtasks)
    await syncReminders(numericId, extras.reminders)
    await syncRecurrenceRules(numericId, extras.recurrenceRules)
    await syncAttachments(numericId, extras.attachments)
  }

  function toggleHideCompleted() {
    hideCompleted.value = !hideCompleted.value
    try {
      localStorage.setItem(HIDE_COMPLETED_KEY, String(hideCompleted.value))
    } catch {
      // ignore storage errors
    }
    void fetchTodosForCurrentFilter()
  }

  function formatTaskDate(task: Task): string {
    if (!task.date) return ''
    const date = new Date(task.date)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  void fetchTodosForCurrentFilter()

  return {
    tasks,
    currentFilter,
    currentListName,
    listNames,
    currentView,
    hideCompleted,
    lastFetchError,
    lastFetchAt,
    filteredTasks,
    tasksByDate,
    tasksByQuadrant,
    taskCounts,
    addTask,
    toggleTask,
    deleteTask,
    hardDeleteTask,
    restoreTask,
    setListFilter,
    setFilter,
    setView,
    updateTask,
    syncTaskExtras,
    formatTaskDate,
    getQuadrantType,
    groupTasksByDateAndStatus,
    toggleHideCompleted,
    fetchTodosForCurrentFilter
  }
})