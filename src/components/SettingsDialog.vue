<template>
  <el-dialog
    v-model="visible"
    title="设置"
    width="780px"
    @close="handleClose"
  >
    <div class="settings-layout">
      <div class="settings-nav">
        <div class="nav-title">设置</div>
        <div class="nav-group">
          <div class="nav-item active">账号与安全</div>
          <div class="nav-item">高级会员</div>
        </div>
        <div class="nav-group">
          <div class="nav-item">功能模块</div>
          <div class="nav-item">智能清单</div>
          <div class="nav-item">提醒与通知</div>
          <div class="nav-item">日期与时间</div>
          <div class="nav-item">外观</div>
          <div class="nav-item">更多设置</div>
        </div>
        <div class="nav-group">
          <div class="nav-item">关联与导入</div>
          <div class="nav-item">共享协作</div>
          <div class="nav-item">快捷键</div>
          <div class="nav-item">关于</div>
        </div>
      </div>

      <div class="settings-content">
        <div class="profile">
          <el-avatar :size="64" class="profile-avatar">
            {{ (userName || 'U').slice(0, 1).toUpperCase() }}
          </el-avatar>
          <div class="profile-name">{{ userName || '未设置用户名' }}</div>
          <div class="profile-sub">查看会员特权</div>
        </div>

        <div class="section">
          <div class="section-row">
            <span>邮箱</span>
            <el-button type="primary" link>设置邮箱</el-button>
          </div>
          <div class="section-row">
            <span>手机号</span>
            <span class="muted">{{ maskedPhone }}</span>
          </div>
          <div class="section-row">
            <span>密码</span>
            <el-button type="primary" link>修改密码</el-button>
          </div>
          <div class="section-row">
            <span>双重验证</span>
            <el-button type="primary" link>设置</el-button>
          </div>
        </div>

        <div class="section">
          <div class="section-row">
            <span>主题</span>
            <el-select v-model="theme" size="small" style="width: 140px">
              <el-option label="浅色" value="light" />
              <el-option label="深色" value="dark" />
              <el-option label="跟随系统" value="system" />
            </el-select>
          </div>
          <div class="section-row">
            <span>紧凑模式</span>
            <el-switch v-model="compact" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)

const visible = ref(false)

const compact = ref(false)
const defaultList = ref('收集箱')
const hideCompleted = ref(false)
const reminder = ref(true)
const reminderTime = ref('09:00')

const userName = computed(() => userStore.user?.name || '-')
const maskedPhone = computed(() => {
  const phone = userStore.user?.phone || ''
  if (phone.length < 7) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
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
.settings-layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
}

:deep(.el-dialog__body) {
  background: var(--app-surface);
  color: var(--app-text);
}

.settings-nav {
  border-right: 1px solid var(--app-border);
  padding-right: 10px;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 10px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.nav-item {
  font-size: 13px;
  color: var(--app-text);
  padding: 6px 10px;
  border-radius: 8px;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.12);
  color: var(--app-accent);
  font-weight: 600;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.profile-avatar {
  background: #e0ecff;
  color: #2563eb;
  font-weight: 600;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text);
}

.profile-sub {
  font-size: 12px;
  color: #f59e0b;
}

.section {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--app-surface);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 2px;
  font-size: 13px;
  color: var(--app-text);
}

.muted {
  color: var(--app-muted);
}

@media (max-width: 960px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    border-right: none;
    border-bottom: 1px solid var(--app-border);
    padding-right: 0;
    padding-bottom: 10px;
  }
}
</style>
