<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <div class="month-title">
        <el-icon class="calendar-icon"><Calendar /></el-icon>
        <span>{{ displayTitle }}</span>
      </div>
      <div class="calendar-actions">
        <el-segmented v-model="viewMode" :options="viewModes" size="small" class="view-mode" />
        <el-button size="small" @click="goToday">今天</el-button>
        <el-button size="small" @click="goPrev">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button size="small" @click="goNext">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <template v-if="viewMode === 'month'">
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
    </template>

    <template v-else>
      <div class="week-view">
        <div class="week-header">
          <div class="week-spacer"></div>
          <div v-for="day in weekDaysData" :key="day.key" class="week-day-header" :class="{ today: day.isToday }">
            <div class="week-day-name">{{ day.label }}</div>
            <div class="week-day-date">{{ day.dateLabel }}</div>
          </div>
        </div>

        <div class="week-grid">
          <div class="time-cell all-day">全天</div>
          <div v-for="day in weekDaysData" :key="`${day.key}-allday`" class="all-day-cell">
            <div
              v-for="task in day.tasks"
              :key="task.id"
              class="week-task"
              :style="{ backgroundColor: taskColor(task.id) }"
              :title="task.title"
            >
              {{ task.title }}
            </div>
          </div>

          <template v-for="time in timeSlots" :key="time">
            <div class="time-cell">{{ time }}</div>
            <div v-for="day in weekDaysData" :key="`${day.key}-${time}`" class="time-slot"></div>
          </template>
        </div>
      </div>
    </template>
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
const viewMode = ref<'month' | 'week'>('month')
const viewModes = [
  { label: '月视图', value: 'month' },
  { label: '周视图', value: 'week' }
]

const currentDate = ref(new Date())

const displayTitle = computed(() => {
  const date = currentDate.value
  if (viewMode.value === 'week') {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

function goPrev() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setMonth(date.getMonth() - 1)
  }
  currentDate.value = date
}

function goNext() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
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

const weekDaysData = computed(() => {
  const start = getWeekStart(currentDate.value)
  const days: Array<{ key: string; label: string; dateLabel: string; date: Date; isToday: boolean; tasks: Task[] }> = []
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const key = toDateKey(date)
    days.push({
      key,
      date,
      label: weekDays[i],
      dateLabel: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      isToday: isSameDay(date, new Date()),
      tasks: taskMap.value.get(key) ?? []
    })
  }
  return days
})

const timeSlots = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)

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

function formatDate(date: Date) {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function getWeekStart(date: Date) {
  const base = new Date(date)
  const day = (base.getDay() + 6) % 7
  base.setDate(base.getDate() - day)
  base.setHours(0, 0, 0, 0)
  return base
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

.view-mode :deep(.el-segmented__group) {
  border-radius: 14px;
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

.week-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-header {
  display: grid;
  grid-template-columns: 64px repeat(7, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  padding: 0 2px;
}

.week-spacer {
  height: 1px;
}

.week-day-header {
  padding: 6px 8px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  text-align: center;
}

.week-day-header.today {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.week-day-name {
  font-size: 12px;
  color: #64748b;
}

.week-day-date {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.week-grid {
  display: grid;
  grid-template-columns: 64px repeat(7, minmax(0, 1fr));
  grid-template-rows: 48px repeat(13, 44px);
  gap: 0;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.time-cell {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
  font-size: 11px;
  color: #94a3b8;
  border-right: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
  background: #f8fafc;
}

.time-cell.all-day {
  align-items: center;
  font-weight: 600;
  color: #64748b;
}

.all-day-cell {
  border-bottom: 1px solid #eef2f7;
  border-right: 1px solid #eef2f7;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.week-task {
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 6px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-slot {
  border-right: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.08) 0, rgba(255, 255, 255, 0) 55%);
}
</style>
