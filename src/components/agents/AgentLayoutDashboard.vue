<template>
  <div class="dashboard">
    <div class="metric-card">
      <div class="metric-title">今日处理</div>
      <div class="metric-value">12</div>
      <div class="metric-sub">任务协助</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">自动化</div>
      <div class="metric-value">6</div>
      <div class="metric-sub">流程已触发</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">待确认</div>
      <div class="metric-value">3</div>
      <div class="metric-sub">需要你的确认</div>
    </div>

    <div class="timeline">
      <div class="timeline-title">最近活动</div>
      <div class="timeline-item">生成本周计划</div>
      <div class="timeline-item">汇总风险清单</div>
      <div class="timeline-item">提醒：下午会议</div>
    </div>

    <div class="action-panel">
      <div class="action-title">一键动作</div>
      <el-button type="primary" plain>生成日报</el-button>
      <el-button type="primary" plain>整理项目</el-button>
      <el-button type="primary" plain>生成检查表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  border: 1px solid #e0ecff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.metric-title {
  font-size: 12px;
  color: #64748b;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 6px 0;
}

.metric-sub {
  font-size: 12px;
  color: #94a3b8;
}

.timeline,
.action-panel {
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  border: 1px solid #eef2f7;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.timeline {
  grid-column: span 2;
}

.timeline-title,
.action-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
}

.timeline-item {
  padding: 8px 10px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  margin-bottom: 8px;
  font-size: 13px;
  color: #0f172a;
}
</style>
