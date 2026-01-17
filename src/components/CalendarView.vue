<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <div class="month-title">
        <el-icon class="calendar-icon"><Calendar /></el-icon>
        <span>{{ displayMonth }}</span>
      </div>
      <div class="calendar-actions">
        <el-button size="small" @click="goToday">今天</el-button>
        <el-button size="small" @click="goPrev">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button size="small" @click="goNext">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
    </div>

    <div class="calendar-grid">
      <div
        v-for="cell in calendarCells"
        :key="cell.key"
        class="calendar-cell"
        :class="{ muted: !cell.isCurrentMonth, today: cell.isToday }"
      >
        <div class="cell-header">
          <span class="day-number">{{ cell.date.getDate() }}</span>
        </div>
        <div class="cell-body">
          <div
            v-for="task in cell.tasks.slice(0, 3)"
            :key="task.id"
            class="task-chip"
            :style="{ backgroundColor: taskColor(task.id) }"
            :title="task.title"
          >
            {{ task.title }}
          </div>
          <div v-if="cell.tasks.length > 3" class="more-tasks">
            +{{ cell.tasks.length - 3 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calendar, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const currentDate = ref(new Date())

const displayMonth = computed(() => {
  const date = currentDate.value
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

function goPrev() {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() - 1)
  currentDate.value = date
}

function goNext() {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + 1)
  currentDate.value = date
}

function goToday() {
  currentDate.value = new Date()
}

const taskMap = computed(() => {
  const map = new Map<string, Task[]>()
  props.tasks.forEach(task => {
    if (!task.date) return
    const key = toDateKey(task.date)
    const list = map.get(key) ?? []
    list.push(task)
    map.set(key, list)
  })
  return map
})

const calendarCells = computed(() => {
  const base = new Date(currentDate.value)
  const year = base.getFullYear()
  const month = base.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = (firstDay.getDay() + 6) % 7 // 周一为0
  const startDate = new Date(year, month, 1 - startOffset)

  const cells: Array<{ key: string; date: Date; isCurrentMonth: boolean; isToday: boolean; tasks: Task[] }> = []
  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(startDate)
    cellDate.setDate(startDate.getDate() + i)
    const key = toDateKey(cellDate)
    const isCurrentMonth = cellDate.getMonth() === month
    const isToday = isSameDay(cellDate, new Date())
    const tasks = taskMap.value.get(key) ?? []
    cells.push({
      key,
      date: cellDate,
      isCurrentMonth,
      isToday,
      tasks
    })
  }
  return cells
})

function toDateKey(date: Date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function taskColor(id: string) {
  const palette = ['#cfe8ff', '#fde68a', '#e2e8f0', '#fecaca', '#bbf7d0', '#ddd6fe']
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % palette.length
  }
  return palette[hash]
}
</script>

<style scoped>
.calendar-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.month-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.calendar-icon {
  color: #3b82f6;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  padding: 0 2px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: #64748b;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.calendar-cell {
  min-height: 110px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calendar-cell.muted {
  background: #f8fafc;
  color: #94a3b8;
}

.calendar-cell.today {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.cell-header {
  display: flex;
  justify-content: flex-end;
}

.day-number {
  font-size: 12px;
  font-weight: 600;
}

.cell-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.task-chip {
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 6px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-tasks {
  font-size: 11px;
  color: #64748b;
}
</style>
