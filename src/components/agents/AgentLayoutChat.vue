<template>
  <div class="layout-card">
    <div class="panel">
      <div class="panel-header">
        <div class="title">Agent 对话</div>
        <el-tag type="info" effect="light">多轮推理</el-tag>
      </div>
      <div ref="chatBodyRef" class="panel-body">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="bubble"
          :class="msg.role"
        >
          <span v-html="renderMessage(msg.text)"></span>
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
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { apiExecuteAgent, apiGetRecentProfile } from '@/api/agent'

const prompt = ref('')
const messages = ref<Array<{ role: 'user' | 'agent'; text: string }>>([])
const sending = ref(false)
const storageKey = 'agent_chat_messages'
const profileSummary = ref('')
const chatBodyRef = ref<HTMLDivElement | null>(null)

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseRow(line: string) {
  return line
    .split('|')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

function trimEmptyLines(lines: string[]) {
  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift()
  }
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop()
  }
  return lines
}

function renderMessage(text: string) {
  const escaped = escapeHtml(text)
  const lines = trimEmptyLines(escaped.split(/\r?\n/))
  const parts: string[] = []
  const separatorPattern = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const next = i + 1 < lines.length ? lines[i + 1] : ''
    if (line.includes('|') && separatorPattern.test(next)) {
      const headerCells = parseRow(line)
      i += 2
      const bodyRows: string[][] = []
      while (i < lines.length && lines[i].includes('|')) {
        const rowCells = parseRow(lines[i])
        if (rowCells.length > 0) {
          bodyRows.push(rowCells)
        }
        i += 1
      }
      const headerHtml = headerCells.map(cell => `<th>${cell}</th>`).join('')
      const bodyHtml = bodyRows
        .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`)
        .join('')
      parts.push(`<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`)
      continue
    }
    parts.push(line)
    i += 1
  }

  return parts.join('<br>')
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) messages.value = JSON.parse(raw)
  } catch {
    // ignore parse errors
  }
  void loadProfileSummary()
})

async function loadProfileSummary() {
  try {
    const recent = await apiGetRecentProfile()
    profileSummary.value = recent.summary?.trim() || ''
  } catch {
    profileSummary.value = ''
  }
}

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

const handleSend = async () => {
  const text = prompt.value.trim()
  if (!text || sending.value) return
  messages.value.push({ role: 'user', text })
  prompt.value = ''
  sending.value = true
  try {
    const res = await apiExecuteAgent(text, profileSummary.value, true)
    if (res.status === 'success' && res.response) {
      messages.value.push({ role: 'agent', text: res.response })
      if (res.profile) {
        profileSummary.value = res.profile
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

const handleClear = () => {
  messages.value = []
  localStorage.removeItem(storageKey)
}

</script>

<style scoped>
.layout-card {
  display: block;
}

.panel {
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 420px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-weight: 600;
  color: #0f172a;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
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

.bubble {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 80%;
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


.bubble table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin: 4px 0;
}

.bubble th,
.bubble td {
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
  text-align: left;
}

.bubble th {
  background: #f8fafc;
  font-weight: 600;
}

.panel-footer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.panel-footer :deep(.el-input) {
  flex: 1;
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
</style>
