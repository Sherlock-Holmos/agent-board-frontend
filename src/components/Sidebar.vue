<template>
  <div class="sidebar">
    <div class="icon-bar">
      <el-avatar :size="36" :icon="User" class="avatar-icon" />
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
        :class="{ active: currentView === 'quadrant' }"
        @click="handleIconClick('quadrant')"
      >
        <Grid />
      </el-icon>
      <el-icon class="icon" :size="24"><Aim /></el-icon>
      <el-icon class="icon" :size="24"><Clock /></el-icon>
      <el-icon class="icon" :size="24"><Search /></el-icon>
      <el-icon class="icon" :size="24"><Refresh /></el-icon>
      <el-icon class="icon" :size="24"><Bell /></el-icon>
      <el-icon class="icon" :size="24"><QuestionFilled /></el-icon>
      <el-icon class="icon" :size="24"><Setting /></el-icon>
    </div>
    <div class="nav-content">
      <div class="nav-list">
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
      <div v-if="currentView === 'quadrant'" class="quadrant-section">
        <h3 class="quadrant-title">四象限</h3>
        <div 
          v-for="quadrant in quadrants" 
          :key="quadrant.type"
          class="quadrant-item"
          :class="{ active: selectedQuadrant === quadrant.type }"
          @click="handleQuadrantClick(quadrant.type)"
        >
          <el-icon class="quadrant-icon" :style="{ color: quadrant.color }">
            <component :is="quadrant.icon" />
          </el-icon>
          <span class="quadrant-label">{{ quadrant.label }}</span>
        </div>
      </div>
      <div class="info-sections">
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
      <div class="bottom-actions">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { 
  User, 
  Document, 
  Calendar, 
  Box,
  WarningFilled,
  InfoFilled,
  Trophy
} from '@element-plus/icons-vue'
import type { FilterType, QuadrantType } from '@/types/task'

const taskStore = useTaskStore()
const selectedQuadrant = ref<QuadrantType>(null)

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

function handleNavClick(key: FilterType) {
  taskStore.setFilter(key)
  // 切换到普通视图
  if (taskStore.currentView === 'quadrant') {
    taskStore.setView('normal')
  }
  selectedQuadrant.value = null
}

function handleIconClick(view: 'normal' | 'quadrant') {
  if (view === 'quadrant') {
    taskStore.setView('quadrant')
    taskStore.setFilter('all') // 切换到四象限视图时，使用 all 过滤器
  } else {
    taskStore.setView('normal')
    // 如果当前没有选中任何导航项，默认选中"所有"
    if (!taskStore.currentFilter || taskStore.currentFilter === 'quadrant') {
      taskStore.setFilter('all')
    }
  }
  selectedQuadrant.value = null
}

function handleQuadrantClick(quadrant: QuadrantType) {
  selectedQuadrant.value = quadrant
  // 四象限点击时保持四象限视图，但可以用于后续的筛选功能
}
</script>

<style scoped>
.sidebar {
  display: flex;
  width: 280px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.nav-content {
  background-color: #f8f9fa;
}

.icon-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  width: 56px;
  background-color: #2c3e50;
  gap: 12px;
}

.avatar-icon {
  margin-bottom: 4px;
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