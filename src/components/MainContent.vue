<template>
  <div class="main-content">
    <div class="header">
      <el-icon class="menu-icon"><Menu /></el-icon>
      <h2 class="title">{{ currentTitle }}</h2>
      <div class="header-actions">
        <span class="view-info">{{ filteredTasksCount }}L</span>
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
    <div class="task-input-wrapper">
      <el-input
        v-model="newTaskTitle"
        :placeholder="`+ 添加任务至'${currentChecklist}'`"
        @keyup.enter="handleAddTask"
        class="task-input"
      >
        <template #prefix>
          <el-icon><Plus /></el-icon>
        </template>
      </el-input>
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
                        @toggle="() => taskStore.toggleTask(task.id)"
                        @edit="() => handleEditTask(task)"
                        @view="() => handleViewTask(task)"
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
                      @toggle="() => taskStore.toggleTask(task.id)"
                      @edit="() => handleEditTask(task)"
                      @view="() => handleViewTask(task)"
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
          @toggle="() => taskStore.toggleTask(task.id)"
          @edit="() => handleEditTask(task)"
          @view="() => handleViewTask(task)"
        />
          </div>
        </div>
        <div v-if="Object.keys(tasksByDate).length === 0" class="empty-state">
          暂无任务
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
    />
    <task-detail-dialog
      v-model="detailDialogVisible"
      :task="viewingTask"
      @save="handleSaveDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import TaskItem from './TaskItem.vue'
import TaskDialog from './TaskDialog.vue'
import TaskDetailDialog from './TaskDetailDialog.vue'
import type { QuadrantType, Task } from '@/types/task'

const taskStore = useTaskStore()
const newTaskTitle = ref('')
const collapsedGroups = reactive<Record<string, boolean>>({})
const collapsedQuadrants = reactive<Record<string, boolean>>({})
const editingTask = ref<Task | null>(null)
const dialogVisible = ref(false)
const viewingTask = ref<Task | null>(null)
const detailDialogVisible = ref(false)

const currentView = computed(() => taskStore.currentView)
const currentFilter = computed(() => taskStore.currentFilter)
const hideCompleted = computed(() => taskStore.hideCompleted)

const currentTitle = computed(() => {
  if (currentView.value === 'quadrant') {
    return '四象限'
  }
  const map: Record<string, string> = {
    all: '所有',
    today: '今天',
    last7days: '最近7天',
    inbox: '收集箱',
    summary: '摘要'
  }
  return map[currentFilter.value] || '所有'
})

const currentChecklist = computed(() => {
  return '收集箱'
})

const tasksByDate = computed(() => taskStore.tasksByDate)
const tasksByQuadrant = computed(() => taskStore.tasksByQuadrant)

const filteredTasksCount = computed(() => {
  if (currentView.value === 'quadrant') {
    return Object.values(tasksByQuadrant.value).reduce(
      (sum, q) => sum + q.completed.length + q.pending.length, 
      0
    )
  }
  return Object.values(tasksByDate.value).reduce((sum, tasks) => sum + tasks.length, 0)
})

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

function handleAddTask() {
  if (newTaskTitle.value.trim()) {
    taskStore.addTask({
      title: newTaskTitle.value.trim(),
      completed: false,
      date: null,
      checklist: '收集箱',
      important: false,
      urgent: false
    })
    newTaskTitle.value = ''
  }
}

function toggleGroup(key: string) {
  collapsedGroups[key] = !collapsedGroups[key]
}

function toggleQuadrant(quadrantType: QuadrantType) {
  collapsedQuadrants[quadrantType] = !collapsedQuadrants[quadrantType]
}

function handleEditTask(task: Task) {
  editingTask.value = task
  dialogVisible.value = true
}

function handleViewTask(task: Task) {
  viewingTask.value = task
  detailDialogVisible.value = true
}

function handleSaveTask(updates: Partial<Task>) {
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, updates)
  }
}

function handleSaveDetail(updates: Partial<Task>) {
  if (viewingTask.value) {
    taskStore.updateTask(viewingTask.value.id, updates)
  }
}

function handleHeaderCommand(command: string) {
  if (command === 'toggle-hide-completed') {
    taskStore.toggleHideCompleted()
  }
}
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
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
}

.task-input :deep(.el-input__prefix) {
  color: #94a3b8;
  font-size: 16px;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
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