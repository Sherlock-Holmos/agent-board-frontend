<template>
  <div class="layout-card">
    <div class="panel">
      <div class="panel-header">
        <div class="title">Agent 对话</div>
        <el-tag type="info" effect="light">多轮推理</el-tag>
      </div>
      <div class="panel-body">
        <div class="bubble agent code">
          <pre><code>// 路由2：将访问 /api/user/** 的请求，负载均衡到另一个服务（假设您以后有user-service）
.route("user_route", r -&gt; r
        .path("/api/user/**")
        .filters(f -&gt; f.stripPrefix(1))
        .uri("lb://USER-SERVICE")
)</code></pre>
        </div>
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
    <div class="side">
      <div class="side-card">
        <div class="side-title">上下文</div>
        <div class="side-item">今日任务：8</div>
        <div class="side-item">未完成：12</div>
        <div class="side-item">高优先级：3</div>
      </div>
      <div class="side-card">
        <div class="side-title">快捷指令</div>
        <el-button size="small">生成周报</el-button>
        <el-button size="small">安排提醒</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { apiExecuteAgent } from '@/api/agent'

const prompt = ref('')
const messages = ref<Array<{ role: 'user' | 'agent'; text: string }>>([])
const sending = ref(false)
const storageKey = 'agent_chat_messages'

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

const handleSend = async () => {
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

const handleClear = () => {
  messages.value = []
  localStorage.removeItem(storageKey)
}
</script>

<style scoped>
.layout-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 16px;
  align-items: stretch;
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

.bubble.code {
  padding: 0;
  background: #0f172a;
  color: #e2e8f0;
}

.bubble.code pre {
  margin: 0;
  padding: 10px 12px;
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
  overflow-x: auto;
}

.panel-footer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.panel-footer :deep(.el-input) {
  flex: 1;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.side-card {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.side-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.side-item {
  font-size: 13px;
  color: #0f172a;
  margin-bottom: 6px;
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
