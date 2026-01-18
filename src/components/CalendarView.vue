<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <div class="month-title">
        <el-icon class="calendar-icon"><Calendar /></el-icon>
        <span>{{ displayTitle }}</span>
      </div>
      <div class="calendar-actions">
        <div class="view-switch-wrap">
          <div class="view-switch">
            <button
              v-for="item in viewOptions"
              :key="item.value"
              class="view-pill"
              :class="{ active: viewMode === item.value, disabled: !item.enabled }"
              @click="handleViewChange(item)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
        <div class="action-buttons">
          <el-button size="small" @click="goToday">今天</el-button>
          <el-button size="small" @click="goPrev">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button size="small" @click="goNext">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <template v-if="viewMode === 'month'">
      <transition :name="monthTransitionName" mode="out-in">
        <div :key="monthKey" class="calendar-surface">
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
      </transition>
    </template>

    <template v-else>
      <transition :name="weekTransitionName" mode="out-in">
        <div :key="weekKey" class="calendar-surface">
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
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Calendar, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const viewMode = ref<'month' | 'week'>('month')
const pageDirection = ref<'next' | 'prev'>('next')
const viewOptions = [
  { label: '年视图', value: 'year', enabled: false },
  { label: '月视图', value: 'month', enabled: true },
  { label: '周视图', value: 'week', enabled: true },
  { label: '日视图', value: 'day', enabled: false },
  { label: '日程视图', value: 'agenda', enabled: false },
  { label: '多日视图', value: 'multi-day', enabled: false },
  { label: '多周视图', value: 'multi-week', enabled: false }
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

const monthKey = computed(() => {
  const date = currentDate.value
  return `${date.getFullYear()}-${date.getMonth()}`
})

const weekKey = computed(() => {
  const start = getWeekStart(currentDate.value)
  return `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`
})

const monthTransitionName = computed(() => {
  return pageDirection.value === 'next' ? 'month-slide-next' : 'month-slide-prev'
})

const weekTransitionName = computed(() => {
  return pageDirection.value === 'next' ? 'month-slide-next' : 'month-slide-prev'
})

function goPrev() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    pageDirection.value = 'prev'
    date.setMonth(date.getMonth() - 1)
  }
  currentDate.value = date
}

function goNext() {
  const date = new Date(currentDate.value)
  if (viewMode.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    pageDirection.value = 'next'
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

function handleViewChange(item: { label: string; value: string; enabled: boolean }) {
  if (!item.enabled) {
    ElMessage.info('该视图暂未开放')
    return
  }
  if (item.value === 'month' || item.value === 'week') {
    viewMode.value = item.value
  }
}
</script>

<style scoped>
.calendar-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-surface {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  padding: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.month-slide-next-enter-active,
.month-slide-next-leave-active,
.month-slide-prev-enter-active,
.month-slide-prev-leave-active {
  transition: transform 160ms var(--motion-ease),
    opacity 160ms var(--motion-ease);
}

.month-slide-next-enter-from {
  opacity: 0;
  transform: translate3d(18px, 0, 0);
}

.month-slide-next-leave-to {
  opacity: 0;
  transform: translate3d(-18px, 0, 0);
}

.month-slide-prev-enter-from {
  opacity: 0;
  transform: translate3d(-18px, 0, 0);
}

.month-slide-prev-leave-to {
  opacity: 0;
  transform: translate3d(18px, 0, 0);
}

.calendar-header {
  display: grid;
  grid-template-columns: 260px 1fr;
  align-items: center;
  gap: 12px;
  min-height: 36px;
  padding-left: 12px;
  position: relative;
}

.month-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  width: 260px;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-icon {
  color: #3b82f6;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  justify-self: stretch;
  padding-right: 8px;
}

.view-switch-wrap {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  width: max-content;
  pointer-events: auto;
}

.view-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 20px;
  background: #6b7280;
}

.view-pill {
  border: none;
  background: transparent;
  color: #f8fafc;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all var(--motion-fast) var(--motion-ease);
}

.view-pill.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
}

.view-pill.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 156px;
  justify-content: space-between;
}

.calendar-actions :deep(.el-button) {
  min-width: 48px;
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
  min-height: 108px;
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 10px;
  background: var(--app-surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calendar-cell.muted {
  background: var(--el-fill-color-light);
  color: #94a3b8;
}

.calendar-cell.today {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
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
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--app-border);
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
  border: 1px solid var(--app-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--app-surface);
}

.time-cell {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
  font-size: 11px;
  color: #94a3b8;
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
  background: var(--el-fill-color-light);
}

.time-cell.all-day {
  align-items: center;
  font-weight: 600;
  color: #64748b;
}

.all-day-cell {
  border-bottom: 1px solid var(--app-border);
  border-right: 1px solid var(--app-border);
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
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.08) 0, rgba(255, 255, 255, 0) 55%);
}
</style>
