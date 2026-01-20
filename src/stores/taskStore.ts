import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, FilterType, QuadrantType } from '@/types/task'
import {
  apiCreateTodo,
  apiCompleteTodo,
  apiDeleteTodo,
  apiGetDeletedTodos,
  apiGetCompletedTodos,
  apiGetAllTodos,
  apiGetInboxTodos,
  apiGetNext7DaysTodos,
  apiGetTodayTodos,
  apiGetTodoLists,
  apiGetTodosByList,
  apiHardDeleteTodo,
  apiPatchTodo,
  apiRestoreTodo,
  apiUncompleteTodo
} from '@/api/todos'
import type { TodoDTO, TodoUpdateRequest } from '@/api/types'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const lastFetchError = ref<string | null>(null)
  const lastFetchAt = ref<Date | null>(null)

  const currentFilter = ref<FilterType>('all')
  const currentListName = ref<string | null>(null)
  const listNames = ref<string[]>([])
  const currentView = ref<'normal' | 'quadrant' | 'calendar' | 'pomodoro'>('normal')
  const hideCompleted = ref(false)

  function toDate(value?: string | Date | null) {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  function mapTodoToTask(todo: TodoDTO): Task {
    const title = todo.title || todo.name || ''
    const completed = todo.completed ?? todo.isCompleted ?? false
    const date = toDate(todo.dueDate || todo.date || todo.todoDate)
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
      checklist: todo.listName || '收集箱',
      priority,
      tags: todo.tags ? todo.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
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
            list = await apiGetTodosByList(currentListName.value)
          } else {
            list = await apiGetAllTodos()
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
          list = await apiGetAllTodos()
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
    const payload: TodoDTO = {
      title: task.title,
      description: undefined,
      completed: task.completed,
      dueDate: task.date ? task.date.toISOString().split('T')[0] : null,
      listName: task.checklist,
      priority: (task.priority ?? toQuadrantPriority(task.important, task.urgent))?.toUpperCase(),
      tags: task.tags ? task.tags.join(',') : undefined
    }

    const created = await apiCreateTodo(payload)
    const newTask = mapTodoToTask(created)
    tasks.value.push(newTask)
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

    if (updates.date !== undefined) {
      const nextDate = updates.date ? updates.date.toISOString().split('T')[0] : null
      const currentDate = task.date ? task.date.toISOString().split('T')[0] : null
      if (nextDate !== currentDate) {
        payload.dueDate = nextDate
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
      if (nextPriority !== task.priority) {
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

    if (Object.keys(payload).length === 0) return

    const updated = await apiPatchTodo(numericId, payload)
    const mapped = mapTodoToTask(updated)
    Object.assign(task, mapped)
  }

  function toggleHideCompleted() {
    hideCompleted.value = !hideCompleted.value
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
    formatTaskDate,
    getQuadrantType,
    groupTasksByDateAndStatus,
    toggleHideCompleted,
    fetchTodosForCurrentFilter
  }
})