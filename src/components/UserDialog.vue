<template>
  <el-dialog
    v-model="visible"
    title="用户信息"
    width="460px"
    @close="handleClose"
  >
    <div class="content">
      <template v-if="!isEditing">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ userStore.user?.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userStore.user?.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userStore.user?.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="密码">
            {{ maskedPassword }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formattedCreateTime }}
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <template v-else>
        <el-form :model="form" label-width="80px">
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
            <el-input
              v-model="form.newPassword"
              type="password"
              show-password
              placeholder="不修改可留空"
            />
          </el-form-item>
          <el-form-item label="确认">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="再次输入新密码"
            />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="footer">
        <div class="footer-left">
          <el-button @click="handleLogout">登出</el-button>
          <el-button type="danger" plain @click="handleDeleteAccount">注销</el-button>
        </div>
        <div class="footer-right">
          <el-button v-if="isEditing" @click="handleCancelEdit">取消编辑</el-button>
          <el-button v-else @click="isEditing = true">编辑</el-button>
          <el-button v-if="isEditing" type="primary" @click="handleSave">保存</el-button>
          <el-button v-else @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const userStore = useUserStore()

const visible = ref(false)
const isEditing = ref(false)
const form = ref({
  name: '',
  email: '',
  phone: '',
  newPassword: '',
  confirmPassword: ''
})

const maskedPassword = computed(() => {
  // 后端不会返回明文密码，这里只做掩码展示
  return '••••••••'
})

const formattedCreateTime = computed(() => {
  const raw = userStore.user?.createTime
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
      userStore.fetchMe().catch(() => {
        // 忽略：fetchMe 内部遇到 401 会自动 logout
      })
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
  isEditing.value = false
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
      handleClose()
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
    handleClose()
    router.push('/login')
  } catch {
    // 用户取消
  }
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm('确定要注销吗？该操作仅会清除本地登录信息。', '提示', {
      type: 'warning',
      confirmButtonText: '注销',
      cancelButtonText: '取消'
    })
    await userStore.deleteAccount()
    handleClose()
    ElMessage.success('已注销')
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
