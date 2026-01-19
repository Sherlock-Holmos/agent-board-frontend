<template>
  <div class="pomodoro">
    <div class="pomodoro-main">
      <div class="pomodoro-header">
        <h2 class="title">番茄专注</h2>
        <div class="mode-switch">
          <el-segmented v-model="mode" :options="modes" size="small" />
        </div>
      </div>

      <div class="timer-card">
        <div class="timer-circle">
          <div class="time">{{ timeLabel }}</div>
          <div class="phase-label" v-if="mode === 'pomodoro'">{{ phaseLabel }}</div>
        </div>
        <div class="timer-actions">
          <el-button type="primary" class="timer-btn" @click="toggleTimer">
            {{ isRunning ? '暂停' : '开始' }}
          </el-button>
          <el-button class="timer-btn" type="primary" plain @click="saveManualRecord" :disabled="!canSaveRecord">
            +
          </el-button>
        </div>
      </div>
    </div>

    <div class="pomodoro-side">
      <div class="side-card">
        <div class="side-title">概览</div>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">今日番茄</span>
            <span class="stat-value">{{ todayPomodoros }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日专注时长</span>
            <span class="stat-value">{{ formatDuration(todayFocusSeconds) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总番茄</span>
            <span class="stat-value">{{ totalPomodoros }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总专注时长</span>
            <span class="stat-value">{{ formatDuration(totalFocusSeconds) }}</span>
          </div>
        </div>
      </div>

      <div class="side-card">
        <div class="side-header">
          <div class="side-title">专注记录</div>
        </div>
        <div class="record" v-for="record in displayRecords" :key="record.id">
          <div class="record-date">{{ record.date }}</div>
          <div class="record-item">
            <span class="dot"></span>
            <div class="record-info">
              <div class="record-time">{{ record.time }}</div>
              <div class="record-title">{{ record.title }}</div>
            </div>
            <div class="record-duration">{{ record.duration }}</div>
            <el-button
              class="record-delete"
              size="small"
              text
              type="danger"
              @click="removeRecord(record.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
userStore.initUser()

const mode = ref('pomodoro')
const modes = [
  { label: '番茄计时', value: 'pomodoro' },
  { label: '正计时', value: 'countup' }
]

const focusDurationSeconds = 25 * 60
const shortBreakSeconds = 5 * 60
const longBreakSeconds = 15 * 60
const cyclesBeforeLongBreak = 4

const isRunning = ref(false)
const phase = ref<'focus' | 'shortBreak' | 'longBreak'>('focus')
const remainingSeconds = ref(focusDurationSeconds)
let timerId: number | null = null

const elapsedSeconds = ref(0)
const pomodoroCount = ref(0)
const focusStartAt = ref<number | null>(null)
const countupStartAt = ref<number | null>(null)

const timeLabel = computed(() => {
  const total = mode.value === 'pomodoro' ? remainingSeconds.value : elapsedSeconds.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const phaseLabel = computed(() => {
  if (phase.value === 'focus') return '专注中'
  if (phase.value === 'shortBreak') return '短休息'
  return '长休息'
})

const focusElapsedSeconds = computed(() => Math.max(0, focusDurationSeconds - remainingSeconds.value))

function tick() {
  if (mode.value === 'pomodoro') {
    if (remainingSeconds.value <= 0) {
      advancePomodoroPhase()
      return
    }
    remainingSeconds.value -= 1
  } else {
    elapsedSeconds.value += 1
  }
}

function startTimer() {
  if (isRunning.value) return
  isRunning.value = true
  if (mode.value === 'pomodoro' && phase.value === 'focus' && !focusStartAt.value) {
    focusStartAt.value = Date.now()
  }
  if (mode.value === 'countup' && !countupStartAt.value) {
    countupStartAt.value = Date.now()
  }
  if (timerId === null) {
    timerId = window.setInterval(tick, 1000)
  }
}

function stopTimer() {
  isRunning.value = false
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

watch(mode, (val) => {
  stopTimer()
  if (val === 'pomodoro') {
    phase.value = 'focus'
    remainingSeconds.value = focusDurationSeconds
    focusStartAt.value = null
  } else {
    elapsedSeconds.value = 0
    countupStartAt.value = null
  }
})

onBeforeUnmount(() => {
  stopTimer()
})

type FocusRecord = {
  id: string
  userId: string
  mode: 'pomodoro' | 'countup'
  phase: 'focus'
  title: string
  startAt: number
  endAt: number
  durationSeconds: number
}

const userId = computed(() => String(userStore.user?.id ?? 'guest'))
const storageKey = computed(() => `pomodoro_records_${userId.value}`)
const records = ref<FocusRecord[]>([])

const displayRecords = computed(() => {
  return records.value
    .slice()
    .sort((a, b) => b.endAt - a.endAt)
    .map((record) => ({
      id: record.id,
      date: formatDate(record.endAt),
      time: formatTimeRange(record.startAt, record.endAt),
      title: record.title,
      duration: formatDuration(record.durationSeconds)
    }))
})

const todayKey = computed(() => formatDateKey(Date.now()))
const todayRecords = computed(() => records.value.filter((record) => formatDateKey(record.endAt) === todayKey.value))
const todayPomodoros = computed(() => todayRecords.value.filter((record) => record.mode === 'pomodoro').length)
const totalPomodoros = computed(() => records.value.filter((record) => record.mode === 'pomodoro').length)
const todayFocusSeconds = computed(() => todayRecords.value.reduce((sum, record) => sum + record.durationSeconds, 0))
const totalFocusSeconds = computed(() => records.value.reduce((sum, record) => sum + record.durationSeconds, 0))

const canSaveRecord = computed(() => {
  if (mode.value === 'pomodoro') {
    return phase.value === 'focus' && focusElapsedSeconds.value > 0
  }
  return elapsedSeconds.value > 0
})

function loadRecords() {
  const raw = localStorage.getItem(storageKey.value)
  if (!raw) {
    records.value = []
    return
  }
  try {
    const parsed = JSON.parse(raw)
    records.value = Array.isArray(parsed) ? parsed : []
  } catch {
    records.value = []
  }
}

function persistRecords() {
  localStorage.setItem(storageKey.value, JSON.stringify(records.value))
}

watch(storageKey, () => {
  loadRecords()
})

watch(records, () => {
  persistRecords()
}, { deep: true })

loadRecords()

function advancePomodoroPhase() {
  if (phase.value === 'focus') {
    createRecord({
      startAt: focusStartAt.value ?? Date.now() - focusDurationSeconds * 1000,
      endAt: Date.now(),
      durationSeconds: focusDurationSeconds,
      mode: 'pomodoro'
    })
    pomodoroCount.value += 1
    focusStartAt.value = null
    if (pomodoroCount.value % cyclesBeforeLongBreak === 0) {
      phase.value = 'longBreak'
      remainingSeconds.value = longBreakSeconds
    } else {
      phase.value = 'shortBreak'
      remainingSeconds.value = shortBreakSeconds
    }
    return
  }

  phase.value = 'focus'
  remainingSeconds.value = focusDurationSeconds
  if (isRunning.value) {
    focusStartAt.value = Date.now()
  }
}

function saveManualRecord() {
  if (!canSaveRecord.value) return

  if (mode.value === 'pomodoro') {
    const durationSeconds = focusElapsedSeconds.value
    if (durationSeconds <= 0) return
    const endAt = Date.now()
    const startAt = focusStartAt.value ?? endAt - durationSeconds * 1000
    createRecord({ startAt, endAt, durationSeconds, mode: 'pomodoro' })
    stopTimer()
    phase.value = 'focus'
    remainingSeconds.value = focusDurationSeconds
    focusStartAt.value = null
    return
  }

  const durationSeconds = elapsedSeconds.value
  const endAt = Date.now()
  const startAt = countupStartAt.value ?? endAt - durationSeconds * 1000
  createRecord({ startAt, endAt, durationSeconds, mode: 'countup' })
  stopTimer()
  elapsedSeconds.value = 0
  countupStartAt.value = null
}

function removeRecord(id: string) {
  const index = records.value.findIndex((record) => record.id === id)
  if (index >= 0) {
    records.value.splice(index, 1)
  }
}

function createRecord(payload: { startAt: number; endAt: number; durationSeconds: number; mode: 'pomodoro' | 'countup' }) {
  const record: FocusRecord = {
    id: `${payload.endAt}-${Math.random().toString(16).slice(2)}`,
    userId: userId.value,
    mode: payload.mode,
    phase: 'focus',
    title: '专注',
    startAt: payload.startAt,
    endAt: payload.endAt,
    durationSeconds: Math.max(1, Math.floor(payload.durationSeconds))
  }
  records.value.unshift(record)
}

function formatDateKey(timestamp: number) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function formatTimeRange(startAt: number, endAt: number) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const startText = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  const endText = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
  return `${startText} - ${endText}`
}

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return `${seconds}s`
}
</script>

<style scoped>
.pomodoro {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  animation: fade-up 420ms ease;
}

.pomodoro-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pomodoro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--app-text);
}

.timer-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding-top: 12px;
  animation: float-in 520ms ease;
}

.timer-circle {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 8px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--app-surface);
  transition: transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.timer-circle:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  border-color: #bfdbfe;
}

.time {
  font-size: 40px;
  font-weight: 600;
  color: var(--app-text);
  transition: transform 240ms ease;
}

.timer-circle:hover .time {
  transform: scale(1.02);
}

.timer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-btn {
  transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
}

.timer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.timer-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.phase-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--app-muted);
}

.timer-btn {
  height: 36px;
  min-width: 120px;
  border-radius: 18px;
  padding: 0 18px;
}

.pomodoro-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  padding: 16px;
  background: var(--app-surface);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
}

.side-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
}

.side-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 12px;
}

.side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stat-item {
  background: var(--el-fill-color-light);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--app-muted);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text);
}

.record {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  animation: fade-up 360ms ease;
}

.record-date {
  font-size: 12px;
  color: var(--app-muted);
}

.record-item {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 220ms ease, transform 220ms ease;
  border-radius: 10px;
  padding: 6px 8px;
}

.record-item:hover {
  background: var(--el-fill-color-light);
  transform: translateX(2px);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  animation: pulse 2.4s ease infinite;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-time {
  font-size: 12px;
  color: var(--app-muted);
}

.record-title {
  font-size: 13px;
  color: var(--app-text);
}

.record-duration {
  font-size: 12px;
  color: var(--app-muted);
}

.record-delete {
  margin-left: 6px;
  opacity: 0.7;
  transition: opacity 200ms ease, transform 200ms ease;
}

.record-delete:hover {
  opacity: 1;
  transform: translateY(-1px);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.35);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@media (max-width: 960px) {
  .pomodoro {
    grid-template-columns: 1fr;
  }
}
</style>
