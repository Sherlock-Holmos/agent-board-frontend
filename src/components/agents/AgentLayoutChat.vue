<template>
  <div class="layout-card">
    <div class="panel">
      <div class="panel-header">
        <div class="title">Agent 对话</div>
        <el-tag type="info" effect="light">多轮推理</el-tag>
      </div>
      <div class="panel-body">
        <div class="bubble user">帮我整理本周待办与风险</div>
        <div class="bubble agent">好的，我会先读取当前任务并按优先级整理。</div>
        <div class="bubble agent">已生成：本周计划、阻塞项、提醒清单。</div>
      </div>
      <div class="panel-footer">
        <el-input placeholder="输入指令..." />
        <el-button type="primary">发送</el-button>
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
</script>

<style scoped>
.layout-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 16px;
}

.panel {
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  max-height: 260px;
  overflow: auto;
}

.bubble {
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 80%;
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
</style>
