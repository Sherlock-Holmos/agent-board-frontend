export interface Task {
  id: string
  title: string
  completed: boolean
  date?: Date | null
  checklist: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  // 四象限属性
  important?: boolean  // 重要性
  urgent?: boolean     // 紧急度
}

export interface Checklist {
  id: string
  name: string
  icon?: string
}

export type FilterType = 'all' | 'today' | 'last7days' | 'inbox' | 'summary' | 'quadrant'

export type QuadrantType = 'I' | 'II' | 'III' | 'IV' | null