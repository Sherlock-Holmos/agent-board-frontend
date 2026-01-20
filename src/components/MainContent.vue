<template>
  <div class="main-content">
    <div class="header">
      <el-icon class="menu-icon"><Menu /></el-icon>
      <h2 class="title">{{ currentTitle }}</h2>
      <div class="header-actions">
        <el-dropdown @command="handleHeaderCommand">
          <span class="more-trigger">
            <el-icon class="more-icon"><MoreFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="toggle-hide-completed">
                {{ hideCompleted ? '显示已完成' : '隐藏已完成' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div v-if="currentView === 'normal'" class="task-input-wrapper">
      <el-input
        v-model="newTaskTitle"
        :placeholder="inputPlaceholder"
        @keyup.enter="handleAddTask"
        class="task-input"
      >
        <template #prefix>
          <el-icon><Plus /></el-icon>
        </template>
        <template #suffix>
          <div class="agent-switch">
            <span class="agent-label">Agent</span>
            <el-switch v-model="agentEnabled" size="small" />
          </div>
        </template>
      </el-input>
    </div>
    <div v-if="currentView === 'calendar' || currentView === 'quadrant'" class="floating-dock">
      <el-button
        class="dock-toggle"
        :class="{ hidden: floatingOpen }"
        circle
        @click="floatingOpen = !floatingOpen"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
      <transition name="dock-pop">
        <div v-show="floatingOpen" class="floating-input" :class="{ open: floatingOpen }">
          <div class="floating-card">
            <div class="floating-header">
              <div class="floating-title">快速添加</div>
              <el-button class="dock-close" circle size="small" @click="floatingOpen = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-input
              v-model="newTaskTitle"
              :placeholder="inputPlaceholderShort"
              @keyup.enter="handleAddTask"
              class="task-input"
            >
              <template #prefix>
                <el-icon><Plus /></el-icon>
              </template>
              <template #suffix>
                <div class="agent-switch">
                  <span class="agent-label">Agent</span>
                  <el-switch v-model="agentEnabled" size="small" />
                </div>
              </template>
            </el-input>
            <div class="floating-hint">回车创建任务，支持设置日期与优先级</div>
          </div>
        </div>
      </transition>
    </div>
    <div class="task-list">
      <!-- 四象限视图 -->
      <template v-if="currentView === 'quadrant'">
        <div class="quadrant-grid">
          <div v-for="quadrant in quadrants" :key="quadrant.type" class="quadrant-card">
            <div class="quadrant-header">
              <el-icon class="quadrant-header-icon" :style="{ color: quadrant.color }">
                <component :is="quadrant.icon" />
              </el-icon>
              <span class="quadrant-header-title">{{ quadrant.label }}</span>
              <el-icon 
                class="collapse-icon"
                :class="{ collapsed: collapsedQuadrants[quadrant.type] }"
                @click="toggleQuadrant(quadrant.type)"
              >
                <ArrowDown />
              </el-icon>
            </div>
            <div v-if="!collapsedQuadrants[quadrant.type]" class="quadrant-content">
              <template v-if="hasTasksInQuadrant(quadrant.type)">
                <div 
                  v-for="(dateGroup, dateKey) in getQuadrantTasksGrouped(quadrant.type)" 
                  :key="dateKey"
                  class="date-group"
                >
                  <!-- 待办任务按日期分组 -->
                  <div v-if="dateGroup.pending.length > 0" class="status-group">
                    <div class="status-group-header">
                      <el-icon 
                        class="collapse-icon"
                        :class="{ collapsed: collapsedGroups[`${quadrant.type}-${dateKey}-pending`] }"
                        @click="toggleGroup(`${quadrant.type}-${dateKey}-pending`)"
                      >
                        <ArrowDown />
                      </el-icon>
                      <span class="status-group-title">{{ dateKey }} {{ dateGroup.pending.length }}</span>
                    </div>
                    <div v-if="!collapsedGroups[`${quadrant.type}-${dateKey}-pending`]" class="status-group-content">
                      <task-item
                        v-for="task in dateGroup.pending"
                        :key="task.id"
                        :task="task"
                        @toggle="(val) => handleToggleTask(task.id, val)"
                        @edit="() => handleEditTask(task)"
                        @view="() => handleEditTask(task)"
                      />
                    </div>
                  </div>
                </div>

                <!-- 已完成任务合并显示 -->
                <div v-if="getQuadrantCompletedTasks(quadrant.type).length > 0" class="status-group">
                  <div class="status-group-header">
                    <el-icon 
                      class="collapse-icon"
                      :class="{ collapsed: collapsedGroups[`${quadrant.type}-completed`] }"
                      @click="toggleGroup(`${quadrant.type}-completed`)"
                    >
                      <ArrowDown />
                    </el-icon>
                    <span class="status-group-title">
                      已完成 {{ getQuadrantCompletedTasks(quadrant.type).length }}
                    </span>
                  </div>
                  <div v-if="!collapsedGroups[`${quadrant.type}-completed`]" class="status-group-content">
                    <task-item
                      v-for="task in getQuadrantCompletedTasks(quadrant.type)"
                      :key="task.id"
                      :task="task"
                      @toggle="(val) => handleToggleTask(task.id, val)"
                      @edit="() => handleEditTask(task)"
                      @view="() => handleEditTask(task)"
                    />
                    <div v-if="getQuadrantCompletedTasks(quadrant.type).length >= 5" class="view-more">
                      <a href="#" @click.prevent>查看更多</a>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="empty-quadrant">
                没有任务
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 日历视图 -->
      <template v-else-if="currentView === 'calendar'">
        <CalendarView :tasks="filteredTasks" @edit="handleEditTask" />
      </template>

      <!-- 番茄钟视图 -->
      <template v-else-if="currentView === 'pomodoro'">
        <PomodoroView />
      </template>

      <!-- 普通视图 -->
      <template v-else>
        <div v-for="(tasks, dateKey) in tasksByDate" :key="dateKey" class="task-group">
          <div class="group-header">
            <el-icon 
              class="collapse-icon"
              :class="{ collapsed: collapsedGroups[dateKey] }"
              @click="toggleGroup(dateKey)"
            >
              <ArrowDown />
            </el-icon>
            <span class="group-title">{{ dateKey }} {{ tasks.length }}</span>
          </div>
          <div v-if="!collapsedGroups[dateKey]" class="group-content">
        <task-item
          v-for="task in tasks" 
          :key="task.id" 
          :task="task"
          :trash-mode="currentFilter === 'trash'"
          @toggle="(val) => handleToggleTask(task.id, val)"
          @edit="() => handleEditTask(task)"
          @view="() => handleEditTask(task)"
          @restore="() => handleRestoreTask(task)"
          @hard-delete="() => handleHardDeleteTask(task)"
        />
          </div>
        </div>
        <div v-if="Object.keys(tasksByDate).length === 0" class="empty-state">
          <div>暂无任务</div>
          <div v-if="lastFetchError" class="empty-error">{{ lastFetchError }}</div>
          <div v-else-if="lastFetchAt" class="empty-hint">最近刷新：{{ new Date(lastFetchAt).toLocaleString('zh-CN') }}</div>
        </div>
      </template>
    </div>
    <div class="watermark">
      <div class="watermark-item">☕</div>
      <div class="watermark-item">📓</div>
      <div class="watermark-item">✏️</div>
      <div class="watermark-item">📋</div>
      <div class="watermark-item">😊</div>
    </div>
    <task-dialog
      v-model="dialogVisible"
      :task="editingTask"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import { WarningFilled, InfoFilled, Plus, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiExecuteAgent } from '@/api/agent'
import TaskItem from './TaskItem.vue'
import TaskDialog from './TaskDialog.vue'
import CalendarView from './CalendarView.vue'
import PomodoroView from './PomodoroView.vue'
import type { QuadrantType, Task } from '@/types/task'

const taskStore = useTaskStore()
const userStore = useUserStore()
const newTaskTitle = ref('')
const agentEnabled = ref(false)
const floatingOpen = ref(false)
const collapsedGroups = reactive<Record<string, boolean>>({})
const collapsedQuadrants = reactive<Record<string, boolean>>({})
const editingTask = ref<Task | null>(null)
const dialogVisible = ref(false)
const isCreatingTask = ref(false)
const agentProcessing = ref(false)

const { currentView, currentFilter, hideCompleted, tasksByDate, tasksByQuadrant, lastFetchError, lastFetchAt, filteredTasks } = storeToRefs(taskStore)

const currentTitle = computed(() => {
  if (currentView.value === 'quadrant') {
    return '四象限'
  }
  if (currentView.value === 'calendar') {
    return '日历'
  }
  if (currentView.value === 'pomodoro') {
    return '番茄专注'
  }
  const map: Record<string, string> = {
    all: '所有',
    today: '今天',
    last7days: '最近7天',
    inbox: '收集箱',
    trash: '垃圾桶',
  }
  return map[currentFilter.value] || '所有'
})

const inputPlaceholder = computed(() => {
  if (agentEnabled.value) {
    return '告诉 Agent 你的需求，让它生成待办内容'
  }
  return '输入任务，回车创建'
})

const inputPlaceholderShort = computed(() => {
  if (agentEnabled.value) {
    return '告诉 Agent 你的需求...'
  }
  return '输入任务...'
})

watch(
  () => userStore.token,
  async (token) => {
    if (token) {
      await taskStore.fetchTodosForCurrentFilter()
      if (lastFetchError.value) {
        ElMessage.error(lastFetchError.value)
      }
    }
  },
  { immediate: true }
)


const quadrants = [
  {
    type: 'I' as QuadrantType,
    label: 'I. 重要且紧急',
    color: '#f56c6c',
    icon: WarningFilled
  },
  {
    type: 'II' as QuadrantType,
    label: 'II. 重要不紧急',
    color: '#e6a23c',
    icon: InfoFilled
  },
  {
    type: 'III' as QuadrantType,
    label: 'III. 不重要但紧急',
    color: '#409eff',
    icon: InfoFilled
  },
  {
    type: 'IV' as QuadrantType,
    label: 'IV. 不重要不紧急',
    color: '#67c23a',
    icon: InfoFilled
  }
]

function hasTasksInQuadrant(quadrantType: QuadrantType): boolean {
  const quadrant = tasksByQuadrant.value[quadrantType]
  return quadrant.completed.length > 0 || quadrant.pending.length > 0
}

function getQuadrantTasksGrouped(quadrantType: QuadrantType) {
  const quadrant = tasksByQuadrant.value[quadrantType]
  const allTasks = [...quadrant.pending, ...quadrant.completed]
  const grouped = taskStore.groupTasksByDateAndStatus(allTasks)
  
  // 对日期进行排序：无日期在前，然后按日期倒序
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === '无日期') return -1
    if (b === '无日期') return 1
    return b.localeCompare(a)
  })
  
  const sorted: Record<string, { completed: Task[], pending: Task[] }> = {}
  sortedKeys.forEach(key => {
    sorted[key] = grouped[key]
  })
  
  return sorted
}

function getQuadrantCompletedTasks(quadrantType: QuadrantType): Task[] {
  const quadrant = tasksByQuadrant.value[quadrantType]
  return [...quadrant.completed].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    return bTime - aTime
  })
}

function parseQuickTask(raw: string) {
  const now = new Date()
  const text = raw.trim()
  let date: Date | null = null

  const isoMatch = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (isoMatch) {
    const [_, y, m, d] = isoMatch
    date = new Date(Number(y), Number(m) - 1, Number(d))
  }

  if (!date) {
    const mdMatch = text.match(/(\d{1,2})月(\d{1,2})日/)
    if (mdMatch) {
      const [_, m, d] = mdMatch
      date = new Date(now.getFullYear(), Number(m) - 1, Number(d))
    }
  }

  if (!date) {
    const dayMatch = text.match(/(\d{1,2})号/)
    if (dayMatch) {
      const day = Number(dayMatch[1])
      date = new Date(now.getFullYear(), now.getMonth(), day)
    }
  }

  if (!date) {
    if (text.includes('明天')) {
      date = new Date(now)
      date.setDate(now.getDate() + 1)
    } else if (text.includes('后天')) {
      date = new Date(now)
      date.setDate(now.getDate() + 2)
    } else if (text.includes('今天')) {
      date = new Date(now)
    }
  }

  if (date) {
    date.setHours(12, 0, 0, 0)
  }

  let title = text
    .replace(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/g, '')
    .replace(/\d{1,2}月\d{1,2}日/g, '')
    .replace(/\d{1,2}号/g, '')
    .replace(/今天|明天|后天/g, '')
    .replace(/我要|我想|需要|去|要/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!title) {
    title = text
  }

  return { title, date }
}

function parseReschedule(raw: string) {
  const text = raw.trim()
  const match = text.match(/^(将|把)?(.+?)(移动到|改到|改为|调整到|移到)(.+)$/)
  if (!match) return null
  const title = match[2].trim()
  const dateText = match[4].trim()
  const parsed = parseQuickTask(dateText)
  return { title, date: parsed.date }
}

function extractDeleteTitle(raw: string) {
  return raw
    .replace(/^(删除|移除|清理)/, '')
    .replace(/待办|任务/g, '')
    .trim()
}

async function tryQuickDelete(input: string) {
  const deleteKeywords = /(删除|移除|清理)/
  let target = ''

  if (deleteKeywords.test(input)) {
    target = extractDeleteTitle(input)
  } else {
    // 没有明确删除关键词时，如果输入完全匹配已有标题，则按删除处理
    const match = taskStore.tasks.find(t => t.title === input)
    if (match) {
      target = match.title
    }
  }

  if (!target) return false

  const matches = taskStore.tasks.filter(t => t.title === target)
  if (matches.length === 0) {
    ElMessage.warning('未找到可删除的任务')
    return true
  }
  if (matches.length > 1) {
    ElMessage.warning('存在多个同名任务，请使用完整标题或先进入任务列表删除')
    return true
  }

  await taskStore.deleteTask(matches[0].id)
  ElMessage.success('已删除任务')
  return true
}

async function handleAddTask() {
  if (newTaskTitle.value.trim()) {
    if (agentEnabled.value) {
      if (agentProcessing.value) return
      agentProcessing.value = true
      const prompt = newTaskTitle.value.trim()
      newTaskTitle.value = ''
      try {
        const reschedule = parseReschedule(prompt)
        if (reschedule?.title && reschedule.date) {
          const match = taskStore.tasks.find(t => t.title === reschedule.title)
          if (match) {
            await taskStore.updateTask(match.id, { date: reschedule.date })
            ElMessage.success('已更新任务日期')
            agentProcessing.value = false
            return
          }
        }
        if (await tryQuickDelete(prompt)) {
          agentProcessing.value = false
          return
        }
        const quick = parseQuickTask(prompt)
        if (quick.title) {
          await taskStore.addTask({
            title: quick.title,
            completed: false,
            date: quick.date,
            checklist: '收集箱',
            important: false,
            urgent: false
          })
        } else {
          const res = await apiExecuteAgent(prompt)
          if (res.status !== 'success') {
            ElMessage.error(res.error || 'Agent 处理失败')
          }
          await taskStore.fetchTodosForCurrentFilter()
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Agent 处理失败'
        ElMessage.error(message)
      } finally {
        agentProcessing.value = false
      }
      return
    }
    try {
      await taskStore.addTask({
        title: newTaskTitle.value.trim(),
        completed: false,
        date: null,
        checklist: '收集箱',
        important: false,
        urgent: false
      })
      newTaskTitle.value = ''
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建任务失败'
      ElMessage.error(message)
    }
  }
}

function toggleGroup(key: string) {
  collapsedGroups[key] = !collapsedGroups[key]
}

function toggleQuadrant(quadrantType: QuadrantType) {
  collapsedQuadrants[quadrantType] = !collapsedQuadrants[quadrantType]
}

function handleEditTask(task: Task) {
  isCreatingTask.value = false
  editingTask.value = task
  dialogVisible.value = true
}

function handleSaveTask(updates: Partial<Task>) {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, updates)
    return
  }
  if (isCreatingTask.value) {
    taskStore.addTask({
      title: updates.title?.trim() || '未命名任务',
      completed: updates.completed ?? false,
      date: updates.date ?? null,
      checklist: updates.checklist || '收集箱',
      important: updates.important ?? false,
      urgent: updates.urgent ?? false
    })
    isCreatingTask.value = false
  }
}

async function handleDeleteTask(task: Task) {
  try {
    await taskStore.deleteTask(task.id)
    editingTask.value = null
    ElMessage.success('已删除任务')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除任务失败'
    ElMessage.error(message)
  }
}


function handleHeaderCommand(command: string) {
  if (command === 'toggle-hide-completed') {
    taskStore.toggleHideCompleted()
  }
}

async function handleToggleTask(id: string, completed: boolean) {
  if (currentFilter.value === 'trash') return
  try {
    await taskStore.toggleTask(id, completed)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '更新任务失败'
    ElMessage.error(message)
  }
}

async function handleRestoreTask(task: Task) {
  try {
    await taskStore.restoreTask(task.id)
    ElMessage.success('已还原任务')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '还原任务失败'
    ElMessage.error(message)
  }
}

async function handleHardDeleteTask(task: Task) {
  try {
    await taskStore.hardDeleteTask(task.id)
    ElMessage.success('已彻底删除')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '删除任务失败'
    ElMessage.error(message)
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--app-surface);
  position: relative;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}

.menu-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.title {
  flex: 1;
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-info {
  font-size: 13px;
  color: #999;
}

.more-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
}

.more-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.task-input-wrapper {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.task-input {
  width: 100%;
}

.task-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  box-shadow: none;
  padding: 2px 6px 2px 10px;
  transition: all 0.2s ease;
}

.task-input :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
  background-color: #fff;
}

.task-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.task-input :deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 10px 10px 10px 6px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-input :deep(.el-input__inner::placeholder) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-input :deep(.el-input__prefix) {
  color: #94a3b8;
  font-size: 16px;
}

.task-input :deep(.el-input__suffix) {
  margin-left: 8px;
}

.agent-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.agent-label {
  font-size: 12px;
  color: #94a3b8;
}

.floating-dock {
  position: absolute;
  right: 18px;
  bottom: 22px;
  z-index: 6;
  display: block;
  width: 44px;
  height: 44px;
  position: absolute;
  right: 18px;
  bottom: 22px;
}

.dock-toggle {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #3b82f6;
  color: #fff;
  border: none;
  box-shadow: 0 16px 32px rgba(59, 130, 246, 0.28);
  transition: transform 0.2s ease, opacity 0.2s ease, visibility 0.2s ease;
  position: absolute;
  right: 0;
  bottom: 0;
}

.dock-toggle:hover {
  transform: translate3d(0, -2px, 0);
}

.dock-toggle.hidden {
  opacity: 0;
  transform: scale(0.2);
  pointer-events: none;
  visibility: hidden;
}

.floating-input {
  max-width: 360px;
  width: 320px;
  transform-origin: right bottom;
  position: absolute;
  right: 0;
  bottom: 0;
}

.floating-card {
  border-radius: 16px;
  padding: 14px 14px 12px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.floating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dock-close {
  width: 26px;
  height: 26px;
  border-radius: 999px;
}

.floating-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
}

.floating-hint {
  font-size: 11px;
  color: var(--app-muted);
}

.dock-pop-enter-active,
.dock-pop-leave-active {
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.dock-pop-enter-from,
.dock-pop-leave-to {
  opacity: 0;
  transform: translate3d(20px, 20px, 0) scale(0.2);
}

.dock-pop-enter-to,
.dock-pop-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  scrollbar-gutter: stable both-edges;
}

/* 普通视图样式 */
.task-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.collapse-icon {
  font-size: 14px;
  color: #999;
  transition: transform 0.2s;
  cursor: pointer;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.group-content {
  padding-left: 22px;
}

/* 四象限视图样式 */
.quadrant-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.quadrant-card {
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px 16px;
  min-height: 240px;
}

.quadrant-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 4px 0;
}

.quadrant-header-icon {
  font-size: 18px;
}

.quadrant-header-title {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.quadrant-content {
  padding-left: 0;
}

.empty-quadrant {
  padding: 40px 0;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.date-group {
  margin-bottom: 16px;
}

.status-group {
  margin-bottom: 12px;
}

.status-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.status-group-title {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.status-group-content {
  padding-left: 0;
}

@media (max-width: 960px) {
  .quadrant-grid {
    grid-template-columns: 1fr;
  }
}

.view-more {
  padding: 8px 0;
  font-size: 12px;
}

.view-more a {
  color: #409eff;
  text-decoration: none;
}

.view-more a:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.empty-error {
  margin-top: 8px;
  color: #ef4444;
  font-size: 12px;
}

.empty-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.watermark {
  position: absolute;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  opacity: 0.1;
  pointer-events: none;
  font-size: 32px;
}

.watermark-item {
  font-size: 32px;
}

</style>