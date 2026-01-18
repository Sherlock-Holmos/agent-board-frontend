<template>
  <div class="pipeline">
    <div class="column">
      <div class="column-title">输入</div>
      <div class="card">需求描述</div>
      <div class="card">约束与目标</div>
      <div class="card">数据来源</div>
    </div>
    <div class="column">
      <div class="column-title">Agent 流程</div>
      <div class="card primary">意图识别</div>
      <div class="card primary">分解任务</div>
      <div class="card primary">生成方案</div>
      <div class="card primary">验证与优化</div>
    </div>
    <div class="column">
      <div class="column-title">输出</div>
      <div class="card">任务计划</div>
      <div class="card">提醒策略</div>
      <div class="card">执行清单</div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.pipeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.column {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.column-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.card {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  font-size: 13px;
  color: #0f172a;
  margin-bottom: 8px;
}

.card.primary {
  background: #e0f2fe;
  border-color: #bae6fd;
}
</style>
