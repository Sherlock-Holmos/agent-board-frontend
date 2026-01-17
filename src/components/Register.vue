<template>
  <div class="register-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="32" color="#409eff"><CircleCheck /></el-icon>
        </div>
        <span class="logo-text">AgentBoard</span>
      </div>
    </div>

    <!-- 中央注册卡片 -->
    <div class="register-card">
      <h1 class="register-title">注册</h1>

      <div class="card-illustration" aria-hidden="true">
        <svg viewBox="0 0 320 120" class="illustration">
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#60a5fa" />
              <stop offset="100%" stop-color="#a5b4fc" />
            </linearGradient>
          </defs>
          <rect x="12" y="20" width="120" height="76" rx="16" fill="url(#rg)" opacity="0.18" />
          <rect x="30" y="34" width="200" height="12" rx="6" fill="#e5e7eb" />
          <rect x="30" y="56" width="160" height="12" rx="6" fill="#e5e7eb" />
          <rect x="30" y="78" width="210" height="12" rx="6" fill="#e5e7eb" />
          <circle cx="250" cy="42" r="18" fill="#dbeafe" />
          <circle cx="250" cy="42" r="10" fill="#6366f1" opacity="0.7" />
        </svg>
      </div>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="formRef"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="用户名"
            size="large"
            class="register-input"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            size="large"
            class="register-input"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="手机号"
            size="large"
            class="register-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            size="large"
            class="register-input"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            class="register-input"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            native-type="submit"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-tip">
        点击注册即表示你同意相关服务条款
      </div>
    </div>

    <!-- 底部登录提示 -->
    <div class="footer">
      <span class="footer-text">已有账号?</span>
      <a href="#" class="footer-link" @click.prevent="goLogin">登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import { apiRegister } from '@/api/auth'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^\d{6,}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function handleRegister() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const resp = await apiRegister({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        password: registerForm.password
      })
      if (resp.code && resp.code >= 400) {
        throw new Error(resp.message || '注册失败')
      }
      ElMessage.success(resp.message || '注册成功')
      router.push('/login')
    } catch (err: unknown) {
      const anyErr = err as any
      const backendMessage = anyErr?.response?.data?.message || anyErr?.response?.data?.error
      const message = backendMessage || (err instanceof Error ? err.message : '注册失败')
      ElMessage.error(message)
    } finally {
      loading.value = false
    }
  })
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 10% 10%, #e9f2ff 0%, #f7f9fc 45%, #f5f6f8 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  background-color: transparent;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2a37;
  letter-spacing: 0.4px;
}

.login-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-text {
  font-size: 14px;
  color: #666;
}

.login-btn {
  border-radius: 6px;
  padding: 8px 20px;
}

/* 中央注册卡片 */
.register-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
  border: 1px solid #eef2f6;
}

.register-title {
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 22px 0;
  text-align: center;
  line-height: 1.2;
}

.card-illustration {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.illustration {
  width: 100%;
  max-width: 320px;
  height: 120px;
}

.register-form {
  width: 100%;
}

.register-input {
  width: 100%;
}

.register-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  box-shadow: none;
  padding: 2px 6px;
  transition: all 0.2s ease;
}

.register-input :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
  background-color: #fff;
}

.register-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.register-input :deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 10px 10px;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 6px;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.register-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* 底部登录提示 */
.footer {
  text-align: center;
  padding: 24px 0 48px;
  background-color: transparent;
}

.footer-text {
  font-size: 14px;
  color: #6b7280;
  margin-right: 8px;
}

.footer-link {
  font-size: 14px;
  color: #409eff;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
