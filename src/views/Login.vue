<template>
  <div class="login-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="32" color="#409eff"><CircleCheck /></el-icon>
        </div>
        <span class="logo-text">AgentBoard</span>
      </div>
    </div>

    <!-- 中央登录卡片 -->
    <div class="login-card">
      <h1 class="login-title">登录</h1>

      <div class="card-illustration" aria-hidden="true">
        <svg viewBox="0 0 320 120" class="illustration">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#60a5fa" />
              <stop offset="100%" stop-color="#93c5fd" />
            </linearGradient>
          </defs>
          <rect x="8" y="18" width="120" height="80" rx="16" fill="url(#lg)" opacity="0.18" />
          <rect x="28" y="34" width="180" height="12" rx="6" fill="#e5e7eb" />
          <rect x="28" y="56" width="220" height="12" rx="6" fill="#e5e7eb" />
          <rect x="28" y="78" width="140" height="12" rx="6" fill="#e5e7eb" />
          <circle cx="255" cy="40" r="20" fill="#dbeafe" />
          <circle cx="255" cy="40" r="12" fill="#60a5fa" opacity="0.65" />
        </svg>
      </div>
      
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="formRef"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="用户名/邮箱"
            size="large"
            class="login-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            class="login-input"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha" class="captcha-item">
          <div class="captcha-row">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              size="large"
              class="login-input captcha-input"
            />
            <div class="captcha-box" @click="refreshCaptcha" title="点击刷新验证码">
              <canvas ref="captchaRef" width="120" height="40"></canvas>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            native-type="submit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="forgot-password">
        <a href="#" @click.prevent="handleForgotPassword">忘记密码</a>
      </div>

      <div class="wechat-login">
        <el-button class="wechat-btn" size="large" @click="handleWeChatLogin">
          <div class="wechat-icon-wrapper">
            <svg class="wechat-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.598-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .653-.52 1.182-1.162 1.182-.642 0-1.162-.529-1.162-1.182 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .653-.52 1.182-1.162 1.182-.642 0-1.162-.529-1.162-1.182 0-.651.52-1.18 1.162-1.18zm8.151 2.712c-1.884 0-3.422 1.45-3.422 3.22 0 1.77 1.538 3.22 3.422 3.22.242 0 .48-.028.712-.075a.428.428 0 0 1 .343.067l1.012.592a.219.219 0 0 0 .199.01.222.222 0 0 0 .133-.14l.25-.95a.576.576 0 0 1 .207-.334c1.304-.96 2.144-2.377 2.144-3.95 0-1.77-1.538-3.22-3.422-3.22zm-1.93 2.21c.36 0 .652.293.652.654 0 .36-.292.653-.652.653-.36 0-.652-.293-.652-.653 0-.36.292-.654.652-.654zm2.878 0c.36 0 .652.293.652.654 0 .36-.292.653-.652.653-.36 0-.652-.293-.652-.653 0-.36.292-.654.652-.654z"/>
            </svg>
          </div>
          <span>微信</span>
        </el-button>
      </div>

      <div class="more-login">
        <a href="#" @click.prevent="handleMoreLogin">更多登录方式</a>
      </div>
    </div>

    <!-- 底部注册提示 -->
    <div class="footer">
      <span class="footer-text">还没有账号?</span>
      <a href="#" class="footer-link" @click.prevent="handleRegister">注册</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
  captcha: ''
})

const rules: FormRules = {
  account: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位', trigger: 'blur' }
  ]
}

const captchaRef = ref<HTMLCanvasElement | null>(null)
const captchaValue = ref('')

function randomCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let text = ''
  for (let i = 0; i < 4; i += 1) {
    text += chars[Math.floor(Math.random() * chars.length)]
  }
  return text
}

function drawCaptcha(text: string) {
  const canvas = captchaRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 6; i += 1) {
    ctx.strokeStyle = `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    ctx.font = `${Math.floor(Math.random() * 6) + 22}px Arial`
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80 + 20)}, ${Math.floor(
      Math.random() * 80 + 20
    )}, ${Math.floor(Math.random() * 120 + 60)})`
    const x = 12 + i * 24
    const y = 28 + Math.random() * 6
    const angle = (Math.random() * 30 - 15) * (Math.PI / 180)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }
}

function refreshCaptcha() {
  captchaValue.value = randomCaptcha()
  drawCaptcha(captchaValue.value)
}

function handleLogin() {
  formRef.value?.validate((valid) => {
    if (valid) {
      if (loginForm.captcha.trim().toUpperCase() !== captchaValue.value) {
        ElMessage.error('验证码不正确')
        refreshCaptcha()
        loginForm.captcha = ''
        return
      }
      loading.value = true
      userStore
        .loginByApi({
          name: loginForm.account.trim(),
          password: loginForm.password
        })
        .then(() => {
          ElMessage.success('登录成功')
          router.push('/')
        })
        .catch((err: unknown) => {
          const anyErr = err as any
          const backendMessage = anyErr?.response?.data?.message || anyErr?.response?.data?.error
          const message = backendMessage || (err instanceof Error ? err.message : '登录失败')
          ElMessage.error(message)
        })
        .finally(() => {
          loading.value = false
          refreshCaptcha()
          loginForm.captcha = ''
        })
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})

function handleRegister() {
  router.push('/register')
}

function handleForgotPassword() {
  ElMessage.info('忘记密码功能开发中')
}

function handleWeChatLogin() {
  ElMessage.info('微信登录功能开发中')
}

function handleMoreLogin() {
  ElMessage.info('更多登录方式开发中')
}
</script>

<style scoped>
.login-page {
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

.register-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.register-text {
  font-size: 14px;
  color: #666;
}

.register-btn {
  border-radius: 6px;
  padding: 8px 20px;
}

/* 中央登录卡片 */
.login-card {
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

.login-title {
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

.login-form {
  width: 100%;
}

.login-input {
  width: 100%;
}

.captcha-item {
  align-items: center;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-box {
  width: 120px;
  height: 40px;
  margin-left: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.captcha-box:hover {
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.login-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  box-shadow: none;
  padding: 2px 6px;
  transition: all 0.2s ease;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
  background-color: #fff;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.login-input :deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 10px 10px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.forgot-password {
  text-align: center;
  margin-top: 18px;
}

.forgot-password a {
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
}

.forgot-password a:hover {
  color: #409eff;
}

.wechat-login {
  width: 100%;
  margin-top: 24px;
}

.wechat-btn {
  width: 100%;
  background-color: #07c160;
  border-color: #07c160;
  color: #fff;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(7, 193, 96, 0.25);
}

.wechat-btn:hover {
  background-color: #06ad56;
  border-color: #06ad56;
}

.wechat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.more-login {
  text-align: center;
  margin-top: 16px;
}

.more-login a {
  font-size: 13px;
  color: #999;
  text-decoration: none;
}

.more-login a:hover {
  color: #409eff;
}

/* 底部注册提示 */
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

@media (max-width: 900px) {
  .header {
    padding: 16px 20px;
  }

  .login-card {
    padding: 32px 20px;
    margin: 0 16px;
    max-width: none;
    border-radius: 12px;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .captcha-row {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-box {
    width: 100%;
    margin-left: 0;
  }

  .footer {
    padding: 20px 0 32px;
  }
}
</style>
