<template>
  <div class="sidebar" :class="{ compact }">
    <div class="icon-bar">
      <div class="icon-group">
        <el-dropdown trigger="click" @command="handleAvatarCommand">
          <el-avatar
            :size="36"
            :icon="User"
            class="avatar-icon"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="Setting" command="settings">设置</el-dropdown-item>
              <el-dropdown-item :icon="DataAnalysis" command="stats">统计</el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-icon 
          class="icon" 
          :size="24"
          :class="{ active: currentView === 'normal' }"
          @click="handleIconClick('normal')"
        >
          <CircleCheck />
        </el-icon>
        <el-icon 
          class="icon" 
          :size="24"
          :class="{ active: currentView === 'calendar' }"
          @click="handleIconClick('calendar')"
        >
          <Calendar />
        </el-icon>
        <el-icon 
          class="icon" 
          :size="24"
          :class="{ active: currentView === 'quadrant' }"
          @click="handleIconClick('quadrant')"
        >
          <Aim />
        </el-icon>
        <el-icon class="icon" :size="24"><Clock /></el-icon>
        <el-icon class="icon" :size="24"><Search /></el-icon>
      </div>

      <div class="icon-spacer"></div>

      <div class="icon-group">
        <el-icon class="icon" :size="24" @click="handleRefresh">
          <Refresh :class="{ spinning: isRefreshing }" />
        </el-icon>
        <el-icon class="icon" :size="24" @click="notificationVisible = true"><Bell /></el-icon>
        <el-icon class="icon" :size="24"><QuestionFilled /></el-icon>
        <el-icon
          class="icon"
          :size="24"
          :class="{ active: agentDialogVisible }"
          @click="handleAgent"
        >
          <Cpu />
        </el-icon>
      </div>
    </div>
    <div class="nav-content">
      <div v-if="currentView !== 'quadrant'" class="nav-list">
        <div 
          v-for="item in navItems" 
          :key="item.key"
          class="nav-item"
          :class="{ active: currentFilter === item.key }"
          @click="handleNavClick(item.key)"
        >
          <el-icon v-if="item.icon" class="nav-icon" :class="item.iconClass">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.count !== undefined" class="nav-count">{{ item.count }}</span>
          <el-icon v-if="currentFilter === item.key" class="check-icon"><Check /></el-icon>
        </div>
      </div>
      <div v-if="currentView !== 'quadrant'" class="info-sections">
        <div class="info-section">
          <h4>清单</h4>
          <p>用清单来分类收集、组织和管理你的任务和笔记</p>
        </div>
        <div class="info-section">
          <h4>过滤器</h4>
          <p>根据清单、时间、优先级、标签等过滤出特定的任务</p>
        </div>
        <div class="info-section">
          <h4>标签</h4>
          <p>以标签的维度展示不同清单的任务。在添加任务时输入"#"可快速选择标签</p>
        </div>
      </div>
      <div v-if="currentView !== 'quadrant'" class="bottom-actions">
        <div class="action-item">
          <el-icon><Checked /></el-icon>
          <span>已完成</span>
        </div>
        <div class="action-item">
          <el-icon><Delete /></el-icon>
          <span>垃圾桶</span>
        </div>
      </div>
    </div>

    <SettingsDialog v-model="settingsDialogVisible" />
    <AgentDialog v-model="agentDialogVisible" />
    <NotificationDrawer v-model="notificationVisible" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import SettingsDialog from './SettingsDialog.vue'
import AgentDialog from './AgentDialog.vue'
import NotificationDrawer from './NotificationDrawer.vue'
import { 
  User, 
  Document, 
  Calendar, 
  Box,
  Cpu
} from '@element-plus/icons-vue'
import { Setting, DataAnalysis, SwitchButton } from '@element-plus/icons-vue'
import type { FilterType } from '@/types/task'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  compact?: boolean
}>()

const taskStore = useTaskStore()
const settingsDialogVisible = ref(false)
const agentDialogVisible = ref(false)
const notificationVisible = ref(false)
const isRefreshing = ref(false)
const router = useRouter()
const userStore = useUserStore()

const currentFilter = computed(() => taskStore.currentFilter)
const currentView = computed(() => taskStore.currentView)

const navItems = computed(() => [
  { 
    key: 'all' as FilterType, 
    label: '所有', 
    count: taskStore.taskCounts.all,
    icon: Document,
    iconClass: ''
  },
  { 
    key: 'today' as FilterType, 
    label: '今天', 
    count: taskStore.taskCounts.today,
    icon: Calendar,
    iconClass: ''
  },
  { 
    key: 'last7days' as FilterType, 
    label: '最近7天', 
    count: taskStore.taskCounts.last7days,
    icon: Calendar,
    iconClass: ''
  },
  { 
    key: 'inbox' as FilterType, 
    label: '收集箱', 
    count: taskStore.taskCounts.inbox,
    icon: Box,
    iconClass: ''
  },
  { 
    key: 'summary' as FilterType, 
    label: '摘要',
    icon: Document,
    iconClass: ''
  }
])

function handleNavClick(key: FilterType) {
  taskStore.setFilter(key)
  // 切换到普通视图
  if (taskStore.currentView === 'quadrant') {
    taskStore.setView('normal')
  }
}

function handleIconClick(view: 'normal' | 'quadrant' | 'calendar') {
  if (view === 'quadrant') {
    // 先设置过滤器，再切换视图，避免 setFilter 把视图重置为 normal
    taskStore.setFilter('all') // 切换到四象限视图时，使用 all 过滤器
    taskStore.setView('quadrant')
  } else if (view === 'calendar') {
    taskStore.setView('calendar')
  } else {
    taskStore.setView('normal')
    // 如果当前没有选中任何导航项，默认选中"所有"
    if (!taskStore.currentFilter || taskStore.currentFilter === 'quadrant') {
      taskStore.setFilter('all')
    }
  }
}

async function handleRefresh() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await taskStore.fetchTodosForCurrentFilter()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '刷新失败'
    ElMessage.error(message)
  } finally {
    window.setTimeout(() => {
      isRefreshing.value = false
    }, 300)
  }
}

function handleAgent() {
  agentDialogVisible.value = true
}

function handleAvatarCommand(command: string) {
  if (command === 'settings') {
    settingsDialogVisible.value = true
    return
  }
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
    return
  }
  ElMessage.info('功能开发中')
}

</script>

<style scoped>
.sidebar {
  display: flex;
  width: 280px;
  background-color: var(--app-surface);
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.sidebar.compact {
  width: 56px;
  background-color: #2c3e50;
  border-right: none;
}

.sidebar.compact .nav-content {
  display: none;
}

.nav-content {
  background-color: var(--app-bg);
}

.icon-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  width: 56px;
  background-color: #2c3e50;
}

.icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.icon-spacer {
  flex: 1;
}

.avatar-icon {
  margin-bottom: 4px;
  cursor: pointer;
}

.icon {
  font-size: 24px;
  color: #ecf0f1;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.15);
}

.icon.active {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.25);
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.nav-content {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  gap: 8px;
}

.nav-icon {
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.nav-item.active .nav-icon {
  color: #409eff;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #e6f4ff;
  color: #409eff;
}

.nav-label {
  flex: 1;
  font-size: 14px;
}

.nav-count {
  font-size: 13px;
  color: #999;
  margin-left: 8px;
}

.nav-item.active .nav-count {
  color: #409eff;
}

.check-icon {
  font-size: 16px;
  color: #409eff;
  margin-left: 4px;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.info-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-section p {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.bottom-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.action-item:hover {
  background-color: #f5f5f5;
}

.action-item.upgrade {
  color: #409eff;
  margin-top: 4px;
}

.quadrant-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.quadrant-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding: 0 12px;
}

.quadrant-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
}

.quadrant-item:hover {
  background-color: #f5f5f5;
}

.quadrant-item.active {
  background-color: #e6f4ff;
}

.quadrant-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.quadrant-label {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.quadrant-item.active .quadrant-label {
  color: #409eff;
}
</style>