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
        </div>
        <el-button type="primary" class="start-btn" @click="toggleTimer">
          {{ isRunning ? '暂停' : '开始' }}
        </el-button>
      </div>
    </div>

    <div class="pomodoro-side">
      <div class="side-card">
        <div class="side-title">概览</div>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">今日番茄</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">今日专注时长</span>
            <span class="stat-value">0m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总番茄</span>
            <span class="stat-value">8</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总专注时长</span>
            <span class="stat-value">27h19m</span>
          </div>
        </div>
      </div>

      <div class="side-card">
        <div class="side-header">
          <div class="side-title">专注记录</div>
          <el-button size="small" type="primary" plain>+</el-button>
        </div>
        <div class="record" v-for="record in records" :key="record.id">
          <div class="record-date">{{ record.date }}</div>
          <div class="record-item">
            <span class="dot"></span>
            <div class="record-info">
              <div class="record-time">{{ record.time }}</div>
              <div class="record-title">{{ record.title }}</div>
            </div>
            <div class="record-duration">{{ record.duration }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const mode = ref('pomodoro')
const modes = [
  { label: '番茄计时', value: 'pomodoro' },
  { label: '正计时', value: 'countup' }
]

const isRunning = ref(false)
const remainingSeconds = ref(60 * 60)
let timerId: number | null = null

const timeLabel = computed(() => {
  const total = mode.value === 'pomodoro' ? remainingSeconds.value : elapsedSeconds.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const elapsedSeconds = ref(0)

function tick() {
  if (mode.value === 'pomodoro') {
    if (remainingSeconds.value <= 0) {
      stopTimer()
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
    remainingSeconds.value = 60 * 60
  } else {
    elapsedSeconds.value = 0
  }
})

onBeforeUnmount(() => {
  stopTimer()
})

const records = ref([
  { id: 1, date: '2024年11月1日', time: '22:00 - 23:00', title: '专注', duration: '1h' },
  { id: 2, date: '2024年10月31日', time: '23:42 - 0:42', title: '专注', duration: '1h' },
  { id: 3, date: '2024年10月29日', time: '13:29 - 13:49', title: '计划', duration: '20m' }
])
</script>

<style scoped>
.pomodoro {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 24px;
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
  justify-content: center;
  gap: 20px;
}

.timer-circle {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 8px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-surface);
}

.time {
  font-size: 40px;
  font-weight: 600;
  color: var(--app-text);
}

.start-btn {
  width: 140px;
  border-radius: 20px;
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
}

.record-date {
  font-size: 12px;
  color: var(--app-muted);
}

.record-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
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

@media (max-width: 960px) {
  .pomodoro {
    grid-template-columns: 1fr;
  }
}
</style>
