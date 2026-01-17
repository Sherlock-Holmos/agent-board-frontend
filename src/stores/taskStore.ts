import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, FilterType, QuadrantType } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([
    {
      id: '1',
      title: '完成网页报告',
      completed: false,
      date: null,
      checklist: '收集箱',
      important: false,
      urgent: false
    },
    {
      id: '2',
      title: '项目手册',
      completed: true,
      date: new Date('2024-12-01'),
      checklist: '收集箱',
      important: true,
      urgent: false
    },
    {
      id: '3',
      title: '打印六级准考证',
      completed: true,
      date: new Date('2024-12-06'),
      checklist: '收集箱',
      important: false,
      urgent: false
    },
    {
      id: '4',
      title: '考六级',
      completed: true,
      date: new Date('2024-12-14'),
      checklist: '收集箱',
      important: false,
      urgent: false
    },
    {
      id: '5',
      title: '完成农业作业',
      completed: true,
      date: new Date('2024-11-06'),
      checklist: '收集箱',
      important: false,
      urgent: false
    },
    {
      id: '6',
      title: '开始着手计网实验报告',
      completed: true,
      date: new Date('2024-11-06'),
      checklist: '收集箱',
      important: false,
      urgent: false
    },
    {
      id: '7',
      title: '完成网页',
      completed: true,
      date: new Date('2024-11-06'),
      checklist: '收集箱',
      important: false,
      urgent: false
    }
  ])

  const currentFilter = ref<FilterType>('all')
  const currentView = ref<'normal' | 'quadrant'>('normal')

  const filteredTasks = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (currentFilter.value) {
      case 'today':
        return tasks.value.filter(task => {
          if (!task.date) return false
          const taskDate = new Date(task.date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === today.getTime()
        })
      case 'last7days':
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return tasks.value.filter(task => {
          if (!task.date) return false
          const taskDate = new Date(task.date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate >= sevenDaysAgo && taskDate <= today
        })
      case 'inbox':
        return tasks.value.filter(task => task.checklist === '收集箱')
      default:
        return tasks.value
    }
  })

  // 获取任务的四象限类型
  function getQuadrantType(task: Task): QuadrantType {
    if (task.important && task.urgent) return 'I'
    if (task.important && !task.urgent) return 'II'
    if (!task.important && task.urgent) return 'III'
    if (!task.important && !task.urgent) return 'IV'
    return null
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
      inbox: tasks.value.filter(task => task.checklist === '收集箱').length
    }
  })

  function addTask(task: Omit<Task, 'id'>) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    }
    tasks.value.push(newTask)
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  function deleteTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index > -1) {
      tasks.value.splice(index, 1)
    }
  }

  function setFilter(filter: FilterType) {
    currentFilter.value = filter
    // 设置过滤器时，如果不是四象限视图，确保是普通视图
    if (currentView.value === 'quadrant' && filter !== 'quadrant') {
      currentView.value = 'normal'
    }
  }

  function setView(view: 'normal' | 'quadrant') {
    currentView.value = view
    // 切换到四象限视图时，如果当前过滤器是 quadrant，改为 all
    if (view === 'quadrant' && currentFilter.value === 'quadrant') {
      currentFilter.value = 'all'
    }
  }

  function updateTask(id: string, updates: Partial<Task>) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      Object.assign(task, updates)
    }
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

  return {
    tasks,
    currentFilter,
    currentView,
    filteredTasks,
    tasksByDate,
    tasksByQuadrant,
    taskCounts,
    addTask,
    toggleTask,
    deleteTask,
    setFilter,
    setView,
    updateTask,
    formatTaskDate,
    getQuadrantType,
    groupTasksByDateAndStatus
  }
})