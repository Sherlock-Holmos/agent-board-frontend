<template>
  <el-dialog
    v-model="visible"
    title="Agent"
    width="980px"
    @close="handleClose"
  >
    <div class="agent-layout">
      <div class="agent-nav">
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
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="bubble"
              :class="msg.role"
            >
              {{ msg.text }}
            </div>
            <div v-if="sending" class="bubble agent typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
          <div class="panel-footer">
            <el-input
              v-model="prompt"
              placeholder="输入指令..."
              @keyup.enter="handleSend"
              :disabled="sending"
            />
            <el-button type="primary" :loading="sending" @click="handleSend">发送</el-button>
            <el-button type="default" @click="handleClear" :disabled="sending">清理记录</el-button>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { apiExecuteAgent } from '@/api/agent'

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
const prompt = ref('')
const messages = ref<Array<{ role: 'user' | 'agent'; text: string }>>([])
const sending = ref(false)
const storageKey = 'agent_dialog_messages'

onMounted(() => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) messages.value = JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
})

watch(
  messages,
  (val) => {
    localStorage.setItem(storageKey, JSON.stringify(val))
  },
  { deep: true }
)

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

async function handleSend() {
  const text = prompt.value.trim()
  if (!text || sending.value) return
  messages.value.push({ role: 'user', text })
  prompt.value = ''
  sending.value = true
  try {
    const res = await apiExecuteAgent(text)
    if (res.status === 'success' && res.response) {
      messages.value.push({ role: 'agent', text: res.response })
    } else {
      messages.value.push({ role: 'agent', text: res.error || 'Agent 调用失败' })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Agent 调用失败'
    messages.value.push({ role: 'agent', text: message })
  } finally {
    sending.value = false
  }
}

function handleClear() {
  messages.value = []
  localStorage.removeItem(storageKey)
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
  min-height: 0;
  overflow: hidden;
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
  min-height: 0;
  overflow: hidden;
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
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.55) transparent;
  scroll-behavior: smooth;
}

.panel-body::-webkit-scrollbar {
  width: 8px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.45), rgba(14, 165, 233, 0.35));
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.75), rgba(14, 165, 233, 0.6));
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
  animation: bubble-in 220ms ease-out;
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

.bubble.typing {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bubble.typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typing-bounce 1.2s infinite ease-in-out;
}

.bubble.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.bubble.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

.panel-footer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.panel-footer :deep(.el-input) {
  flex: 1;
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

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
