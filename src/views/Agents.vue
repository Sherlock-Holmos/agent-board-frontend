<template>
  <div class="agents-page">
    <div class="agents-header">
      <div>
        <h2 class="title">Agent 模块预览</h2>
        <p class="subtitle">选择你喜欢的展示方式，后续再接入真实 Agent 能力。</p>
      </div>
      <el-segmented v-model="active" :options="options" />
    </div>

    <div class="agents-content">
      <AgentLayoutChat v-if="active === 'chat'" />
      <AgentLayoutPipeline v-else-if="active === 'pipeline'" />
      <AgentLayoutDashboard v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AgentLayoutChat from '@/components/agents/AgentLayoutChat.vue'
import AgentLayoutPipeline from '@/components/agents/AgentLayoutPipeline.vue'
import AgentLayoutDashboard from '@/components/agents/AgentLayoutDashboard.vue'

const options = [
  { label: '对话面板', value: 'chat' },
  { label: '流程看板', value: 'pipeline' },
  { label: '数据面板', value: 'dashboard' }
]

const active = ref('chat')
</script>

<style scoped>
.agents-page {
  padding: 24px;
}

.agents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.agents-content {
  background: #f8fafc;
  border-radius: 18px;
  padding: 16px;
}
</style>
