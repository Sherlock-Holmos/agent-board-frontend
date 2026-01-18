<template>
  <el-dialog
    v-model="visible"
    title="Agent"
    width="980px"
    @close="handleClose"
  >
    <div class="agent-layout">
      <div class="agent-nav">
        <div class="agent-nav-title">Agent</div>
        <div class="agent-nav-group">
          <button class="agent-nav-item" :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">对话面板</button>
          <button class="agent-nav-item" :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">数据面板</button>
          <button class="agent-nav-item" :class="{ active: activeTab === 'persona' }" @click="activeTab = 'persona'">画像面板</button>
        </div>
      </div>

      <div class="agent-content">
        <div v-if="activeTab === 'chat'" class="panel">
          <div class="panel-header">
            <span>对话面板</span>
            <el-tag type="info" effect="light">实时协作</el-tag>
          </div>
          <div class="panel-body chat-body">
            <div class="bubble user">帮我规划本周任务优先级</div>
            <div class="bubble agent">已根据紧急/重要进行排序，并生成建议日程。</div>
            <div class="bubble agent">需要我把高优先级安排到上午吗？</div>
          </div>
          <div class="panel-footer">
            <el-input placeholder="输入指令..." />
            <el-button type="primary">发送</el-button>
          </div>
        </div>

        <div v-else-if="activeTab === 'data'" class="panel">
          <div class="panel-header">
            <span>数据面板</span>
            <el-tag type="success" effect="light">待办洞察</el-tag>
          </div>
          <div class="panel-body">
            <div class="metric">
              <span>总任务</span>
              <strong>{{ totalCount }}</strong>
            </div>
            <div class="metric">
              <span>今日</span>
              <strong>{{ todayCount }}</strong>
            </div>
            <div class="metric">
              <span>最近7天</span>
              <strong>{{ weekCount }}</strong>
            </div>

            <div class="section-title">最近操作</div>
            <div class="activity" v-for="item in recentItems" :key="item.id">
              {{ item.title }}
              <span class="muted">{{ item.dateLabel }}</span>
            </div>
          </div>
        </div>

        <div v-else class="panel">
          <div class="panel-header">
            <span>画像面板</span>
            <el-tag type="warning" effect="light">建议参考</el-tag>
          </div>
          <div class="panel-body">
            <div class="persona-item">
              <span>偏好时间</span>
              <strong>上午专注 / 下午沟通</strong>
            </div>
            <div class="persona-item">
              <span>任务类型</span>
              <strong>计划型 + 低碎片</strong>
            </div>
            <div class="persona-item">
              <span>安排策略</span>
              <strong>先难后易，留缓冲</strong>
            </div>
            <div class="persona-item">
              <span>Agent 要求</span>
              <strong>提醒优先级 & 自动拆解</strong>
            </div>
            <p class="persona-tip">
              画像由近期任务与操作习惯推断，仅供安排参考。
            </p>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(false)

const taskStore = useTaskStore()
const totalCount = computed(() => taskStore.taskCounts.all)
const todayCount = computed(() => taskStore.taskCounts.today)
const weekCount = computed(() => taskStore.taskCounts.last7days)
const activeTab = ref<'chat' | 'data' | 'persona'>('chat')

const recentItems = computed(() => {
  return [...taskStore.tasks]
    .slice(-5)
    .reverse()
    .map(task => ({
      id: task.id,
      title: task.title,
      dateLabel: task.date ? new Date(task.date).toLocaleDateString('zh-CN') : '无日期'
    }))
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
}
</script>

<style scoped>
.agent-layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
  height: 520px;
}

.agent-nav {
  border-right: 1px solid var(--app-border);
  padding-right: 12px;
  overflow: auto;
}

.agent-nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 10px;
}

.agent-nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-nav-item {
  text-align: left;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--app-text);
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.agent-nav-item.active {
  background: rgba(59, 130, 246, 0.12);
  color: var(--app-accent);
  font-weight: 600;
}

.agent-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel {
  border: 1px solid var(--app-border);
  border-radius: 16px;
  padding: 14px;
  background: var(--app-surface);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--app-text);
  font-weight: 600;
  font-size: 14px;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow: auto;
}

.panel-body strong {
  color: var(--app-text);
}

.chat-body {
  min-height: 0;
}

.bubble {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 85%;
}

.bubble.user {
  align-self: flex-end;
  background: #e0f2fe;
  color: #0f172a;
}

.bubble.agent {
  align-self: flex-start;
  background: #f1f5f9;
  color: #0f172a;
}

.panel-footer {
  display: flex;
  gap: 8px;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}

.section-title {
  font-size: 12px;
  color: var(--app-muted);
  margin-top: 6px;
}

.activity {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--app-border);
}

.muted {
  color: var(--app-muted);
  font-size: 12px;
}

.persona-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}

.persona-tip {
  font-size: 12px;
  color: var(--app-muted);
  margin-top: 4px;
}

@media (max-width: 960px) {
  .agent-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .agent-nav {
    border-right: none;
    border-bottom: 1px solid var(--app-border);
    padding-right: 0;
    padding-bottom: 10px;
  }
}
</style>
