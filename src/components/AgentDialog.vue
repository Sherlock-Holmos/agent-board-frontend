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
          <div ref="chatBodyRef" class="panel-body chat-body">
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
          <div class="panel-header persona-header-flex">
            <span class="persona-title">画像面板</span>
            <el-tag type="warning" effect="light">建议参考</el-tag>
          </div>
          <div class="panel-body persona-body-flex">
            <div v-if="profileFeatures.length === 0 && !profileSummaryLine" class="persona-empty">
              暂无画像信息，请先与 Agent 对话。
            </div>
            <template v-else>
              <div class="persona-list-bubble-bg">
                <div class="persona-bubble-bg-illust"></div>
                <div class="persona-list-bubble">
                  <span
                    v-for="(line, idx) in profileFeatures"
                    :key="idx"
                    class="persona-bubble-colored"
                    :style="bubbleStyle(idx)"
                  >
                    {{ line }}
                  </span>
                </div>
              </div>
              <div v-if="profileSummaryLine" class="persona-summary-bold">{{ profileSummaryLine }}</div>
            </template>
            <div class="persona-bottom-row">
              <span class="persona-tip persona-tip-bottom">画像由近期对话推断，仅供安排参考。</span>
              <el-button size="small" type="danger" plain @click="handleClearProfile" class="persona-clear-btn">
                清空画像
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { apiExecuteAgent } from '@/api/agent'
import { clearAgentProfile, loadAgentProfile, saveAgentProfile } from '@/utils/agentProfile'

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
const profileSummary = ref('')
const chatBodyRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) messages.value = JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
  profileSummary.value = loadAgentProfile()
})

watch(
  messages,
  (val) => {
    localStorage.setItem(storageKey, JSON.stringify(val))
    nextTick(() => {
      if (chatBodyRef.value) {
        chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
      }
    })
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

const profileLines = computed(() => {
  const summary = profileSummary.value.trim()
  if (!summary) return []
  return summary.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
})

const profileSummaryLine = computed(() => {
  if (profileLines.value.length === 0) return ''
  const last = profileLines.value[profileLines.value.length - 1]
  if (last.startsWith('总结：') || last.startsWith('总结:')) {
    return last.replace(/^总结[:：]\s*/, '')
  }
  return ''
})

const profileFeatures = computed(() => {
  if (profileLines.value.length === 0) return []
  const lines = profileSummaryLine.value
    ? profileLines.value.slice(0, -1)
    : profileLines.value
  const tokens = lines
    .join(' ')
    .split(/[，,、;；\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
  if (tokens.length <= 1 && tokens[0] && tokens[0].length >= 8) {
    return chunkText(tokens[0], 4)
  }
  return tokens
})

function chunkText(text: string, size: number) {
  const result: string[] = []
  let buffer = ''
  for (const char of text) {
    buffer += char
    if (buffer.length >= size) {
      result.push(buffer)
      buffer = ''
    }
  }
  if (buffer) result.push(buffer)
  return result
}

const bubblePalette = [
  { bg: '#e0f2fe', color: '#075985' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#ecfccb', color: '#365314' },
  { bg: '#ede9fe', color: '#5b21b6' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#dcfce7', color: '#166534' },
  { bg: '#ffe4e6', color: '#9f1239' }
]

const bubbleStyle = (index: number) => {
  const palette = bubblePalette[index % bubblePalette.length]
  return {
    backgroundColor: palette.bg,
    color: palette.color
  }
}

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
    const updateProfile = profileSummary.value.trim().length === 0
    const res = await apiExecuteAgent(text, profileSummary.value, updateProfile)
    if (res.status === 'success' && res.response) {
      messages.value.push({ role: 'agent', text: res.response })
      if (res.profile) {
        profileSummary.value = res.profile
        saveAgentProfile(res.profile)
      }
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

function handleClearProfile() {
  profileSummary.value = ''
  clearAgentProfile()
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


.persona-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.persona-title {
  font-weight: 700;
  font-size: 16px;
}
.persona-body-flex {
  display: flex;
  flex-direction: column;
  min-height: 260px;
  gap: 10px;
}
.persona-list-bubble-bg {
  position: relative;
  min-height: 120px;
  margin-bottom: 12px;
}
.persona-bubble-bg-illust {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
  background: url('https://cdn.jsdelivr.net/gh/element-plus/element-plus@dev/docs/public/images/element-plus-logo.svg') no-repeat center 60px/180px, linear-gradient(120deg, #f0f4ff 0%, #f8fafc 100%);
  opacity: 0.18;
  border-radius: 16px;
}
.persona-list-bubble {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
  padding: 18px 8px 8px 8px;
  min-height: 120px;
  align-items: flex-start;
  justify-content: flex-start;
}
.persona-bubble-colored {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.10);
  background: linear-gradient(120deg, #409eff 60%, #66b1ff 100%);
  transition: transform 0.18s, box-shadow 0.18s;
  min-width: 60px;
  margin-right: 0;
  word-break: keep-all;
  white-space: pre;
}
.persona-bubble-colored:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.18);
}
.persona-summary-bold {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  margin-top: 2px;
}
.persona-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.persona-tip-bottom {
  font-size: 12px;
  color: #b0b3b8;
  margin: 0;
}
.persona-clear-btn {
  margin-left: 12px;
}

.persona-empty {
  padding: 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}

.persona-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.persona-summary {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(120deg, #f8fafc, #eef2ff);
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.persona-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.persona-section + .persona-section {
  margin-top: 12px;
}

.persona-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.08em;
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
