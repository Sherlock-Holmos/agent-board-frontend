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
          <button class="nav-item" :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'">
            <el-icon class="nav-icon"><User /></el-icon>
            账号与安全
          </button>
        </div>
        <div class="nav-group">
          <button class="nav-item" :class="{ active: activeTab === 'modules' }" @click="activeTab = 'modules'">
            <el-icon class="nav-icon"><Grid /></el-icon>
            功能模块
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'smart' }" @click="activeTab = 'smart'">
            <el-icon class="nav-icon"><MagicStick /></el-icon>
            智能清单
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'notify' }" @click="activeTab = 'notify'">
            <el-icon class="nav-icon"><Bell /></el-icon>
            提醒与通知
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'datetime' }" @click="activeTab = 'datetime'">
            <el-icon class="nav-icon"><Calendar /></el-icon>
            日期与时间
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'appearance' }" @click="activeTab = 'appearance'">
            <el-icon class="nav-icon"><Brush /></el-icon>
            外观
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'more' }" @click="activeTab = 'more'">
            <el-icon class="nav-icon"><MoreFilled /></el-icon>
            更多设置
          </button>
        </div>
        <div class="nav-group">
          <button class="nav-item" :class="{ active: activeTab === 'import' }" @click="activeTab = 'import'">
            <el-icon class="nav-icon"><Link /></el-icon>
            关联与导入
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'collab' }" @click="activeTab = 'collab'">
            <el-icon class="nav-icon"><Share /></el-icon>
            共享协作
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'shortcut' }" @click="activeTab = 'shortcut'">
            <el-icon class="nav-icon"><Pointer /></el-icon>
            快捷键
          </button>
          <button class="nav-item" :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">
            <el-icon class="nav-icon"><InfoFilled /></el-icon>
            关于
          </button>
        </div>
      </div>

      <div class="settings-content">
        <div v-if="activeTab === 'account'" class="section-block">
          <div class="profile">
          <el-avatar :size="64" class="profile-avatar">
            {{ (userName || 'U').slice(0, 1).toUpperCase() }}
          </el-avatar>
          <div class="profile-name">{{ userName || '未设置用户名' }}</div>
          </div>

          <div class="section">
            <div class="section-head">
              <span>用户信息</span>
              <el-button v-if="!isEditing" type="primary" link @click="isEditing = true">编辑</el-button>
            </div>
            <template v-if="!isEditing">
              <div class="section-row">
                <span>用户名</span>
                <span class="muted">{{ userStore.user?.name || '-' }}</span>
              </div>
              <div class="section-row">
                <span>邮箱</span>
                <span class="muted">{{ userStore.user?.email || '-' }}</span>
              </div>
              <div class="section-row">
                <span>手机号</span>
                <span class="muted">{{ maskedPhone }}</span>
              </div>
              <div class="section-row">
                <span>密码</span>
                <span class="muted">••••••••</span>
              </div>
              <div class="section-row">
                <span>创建时间</span>
                <span class="muted">{{ formattedCreateTime }}</span>
              </div>
            </template>
            <template v-else>
              <el-form :model="form" label-width="80px" class="edit-form">
                <el-form-item label="用户名">
                  <el-input v-model="form.name" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-divider content-position="left">修改密码</el-divider>
                <el-form-item label="新密码">
                  <el-input v-model="form.newPassword" type="password" show-password placeholder="不修改可留空" />
                </el-form-item>
                <el-form-item label="确认">
                  <el-input v-model="form.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
                </el-form-item>
                <div class="edit-actions">
                  <el-button @click="handleCancelEdit">取消</el-button>
                  <el-button type="primary" @click="handleSave">保存</el-button>
                </div>
              </el-form>
            </template>
          </div>

          <div class="account-actions">
            <div class="account-actions-info">
              <div class="account-actions-title">安全操作</div>
              <div class="account-actions-sub">登出将清除本地登录信息，注销将移除账号数据。</div>
            </div>
            <div class="account-actions-buttons">
              <el-button class="logout-btn" @click="handleLogout">登出</el-button>
              <el-button type="danger" class="danger-btn" @click="handleDeleteAccount">注销账号</el-button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'appearance'" class="section-block">
          <div class="section">
            <div class="section-head">
              <span>外观设置</span>
            </div>
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

        <div v-else-if="activeTab === 'about'" class="section-block">
          <div class="about-header">
            <div class="about-title">{{ aboutSection?.title || '关于' }}</div>
            <div class="about-intro">{{ aboutSection?.intro }}</div>
          </div>

          <div v-for="block in aboutSection?.blocks" :key="block.title" class="about-block">
            <div class="about-block-title">{{ block.title }}</div>
            <ul class="about-list">
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div v-if="aboutSection?.note" class="about-note">{{ aboutSection.note }}</div>
        </div>

        <div v-else class="section-block">
          <div class="section">
            <div class="section-head">
              <span>功能设置</span>
            </div>
            <div class="section-row">
              <span>此模块功能开发中</span>
              <el-button type="primary" link>查看计划</el-button>
            </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { helpSections } from '@/help/guideContent'
import { useRouter } from 'vue-router'
import {
  User,
  Grid,
  MagicStick,
  Bell,
  Calendar,
  Brush,
  MoreFilled,
  Link,
  Share,
  Pointer,
  InfoFilled
} from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)
const router = useRouter()

const aboutSection = computed(() => helpSections.find(section => section.key === 'about'))

const visible = ref(false)

const compact = ref(false)
const defaultList = ref('收集箱')
const hideCompleted = ref(false)
const reminder = ref(true)
const reminderTime = ref('09:00')

const activeTab = ref<'account' | 'modules' | 'smart' | 'notify' | 'datetime' | 'appearance' | 'more' | 'import' | 'collab' | 'shortcut' | 'about'>('account')

const isEditing = ref(false)
const form = ref({
  name: '',
  email: '',
  phone: '',
  newPassword: '',
  confirmPassword: ''
})

const userName = computed(() => userStore.user?.name || '-')
const maskedPhone = computed(() => {
  const phone = userStore.user?.phone || ''
  if (phone.length < 7) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
})
const formattedCreateTime = computed(() => {
  const raw = userStore.user?.createdAt || userStore.user?.createTime
  if (!raw) return '-'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString('zh-CN')
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      isEditing.value = false
      userStore.fetchMe().catch(() => {})
      form.value = {
        name: userStore.user?.name ?? '',
        email: userStore.user?.email ?? '',
        phone: userStore.user?.phone ?? '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
}

function handleCancelEdit() {
  isEditing.value = false
  form.value = {
    name: userStore.user?.name ?? '',
    email: userStore.user?.email ?? '',
    phone: userStore.user?.phone ?? '',
    newPassword: '',
    confirmPassword: ''
  }
}

function handleSave() {
  const name = form.value.name.trim()
  if (!name) {
    ElMessage.warning('用户名不能为空')
    return
  }

  const email = form.value.email.trim()
  const phone = form.value.phone.trim()

  const newPassword = form.value.newPassword
  const confirmPassword = form.value.confirmPassword

  if (newPassword || confirmPassword) {
    if (!newPassword || !confirmPassword) {
      ElMessage.warning('请完整填写新密码与确认密码')
      return
    }
    if (newPassword !== confirmPassword) {
      ElMessage.warning('两次输入的新密码不一致')
      return
    }
  }

  userStore
    .updateUserInfo({
      name,
      email,
      phone,
      password: newPassword ? newPassword : undefined
    })
    .then(() => {
      ElMessage.success('已保存')
      isEditing.value = false
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : '保存失败'
      ElMessage.error(message)
    })
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要登出吗？', '提示', {
      type: 'warning',
      confirmButtonText: '登出',
      cancelButtonText: '取消'
    })
    userStore.logout()
    visible.value = false
    router.push('/login')
  } catch {
    // 用户取消
  }
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm('确定要注销吗？该操作会清除账号数据并退出登录。', '提示', {
      type: 'warning',
      confirmButtonText: '注销',
      cancelButtonText: '取消'
    })
    await userStore.deleteAccount()
    ElMessage.success('已注销')
    visible.value = false
    router.push('/login')
  } catch (err: unknown) {
    if (err instanceof Error && err.message) {
      ElMessage.error(err.message)
    }
  }
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
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-icon {
  font-size: 14px;
  color: #94a3b8;
}

.nav-item.active .nav-icon {
  color: #409eff;
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

.section-block {
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

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--app-text);
  margin-bottom: 8px;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 2px;
  font-size: 13px;
  color: var(--app-text);
}

.account-actions {
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: linear-gradient(180deg, rgba(255, 237, 213, 0.6), rgba(255, 255, 255, 0));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.account-actions-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-actions-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
}

.account-actions-sub {
  font-size: 12px;
  color: var(--app-muted);
}

.account-actions-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn {
  border-radius: 10px;
}

.danger-btn {
  border-radius: 10px;
}

.about-header {
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02));
  border: 1px solid rgba(59, 130, 246, 0.16);
}

.about-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 6px;
}

.about-intro {
  font-size: 13px;
  color: var(--app-muted);
}

.about-block {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--app-surface);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.about-block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 6px;
}

.about-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--app-muted);
  font-size: 13px;
}

.about-note {
  font-size: 12px;
  color: var(--app-muted);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed var(--app-border);
}

.edit-form :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
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
