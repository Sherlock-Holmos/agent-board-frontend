<template>
  <div class="settings-page">
    <div class="settings-header">
      <h2 class="title">设置</h2>
      <p class="subtitle">偏好与账号设置</p>
    </div>

    <div class="settings-grid">
      <div class="card">
        <div class="card-title">外观</div>
        <el-form label-width="90px">
          <el-form-item label="主题">
            <el-select v-model="theme" placeholder="选择主题">
              <el-option label="浅色" value="light" />
              <el-option label="深色" value="dark" />
              <el-option label="跟随系统" value="system" />
            </el-select>
          </el-form-item>
          <el-form-item label="紧凑模式">
            <el-switch v-model="compact" />
          </el-form-item>
        </el-form>
      </div>

      <div class="card">
        <div class="card-title">任务</div>
        <el-form label-width="90px">
          <el-form-item label="默认清单">
            <el-input v-model="defaultList" placeholder="收集箱" />
          </el-form-item>
          <el-form-item label="隐藏已完成">
            <el-switch v-model="hideCompleted" />
          </el-form-item>
        </el-form>
      </div>

      <div class="card">
        <div class="card-title">通知</div>
        <el-form label-width="90px">
          <el-form-item label="到期提醒">
            <el-switch v-model="reminder" />
          </el-form-item>
          <el-form-item label="提醒时间">
            <el-time-picker v-model="reminderTime" placeholder="09:00" />
          </el-form-item>
        </el-form>
      </div>

      <div class="card">
        <div class="card-title">账户</div>
        <div class="account-row">
          <span>当前用户</span>
          <span class="account-value">{{ userName }}</span>
        </div>
        <div class="account-actions">
          <el-button type="primary" plain>修改资料</el-button>
          <el-button>退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const theme = ref('light')
const compact = ref(false)
const defaultList = ref('收集箱')
const hideCompleted = ref(false)
const reminder = ref(true)
const reminderTime = ref('09:00')

const userName = computed(() => userStore.user?.name || '-')
</script>

<style scoped>
.settings-page {
  padding: 24px;
}

.settings-header {
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

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 12px;
}

.account-value {
  color: #64748b;
}

.account-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 960px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
