<template>
  <div class="login-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="32" color="#409eff"><CircleCheck /></el-icon>
        </div>
        <span class="logo-text">滴答清单</span>
      </div>
      <div class="register-section">
        <span class="register-text">还没有账号?</span>
        <el-button type="primary" class="register-btn" @click="handleRegister">注册</el-button>
      </div>
    </div>

    <!-- 中央登录卡片 -->
    <div class="login-card">
      <h1 class="login-title">登录</h1>
      
      <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="手机号/邮箱"
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
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
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
import { ref, reactive } from 'vue'
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
  password: ''
})

const rules: FormRules = {
  account: [
    { required: true, message: '请输入手机号或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

function handleLogin() {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        userStore.login({
          account: loginForm.account,
          name: loginForm.account
        })
        ElMessage.success('登录成功')
        router.push('/')
      }, 1000)
    }
  })
}

function handleRegister() {
  ElMessage.info('注册功能开发中')
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
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
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
  font-weight: 500;
  color: #333;
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
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 32px 0;
  text-align: center;
}

.login-form {
  width: 100%;
}

.login-input {
  width: 100%;
}

:deep(.el-input__inner) {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
}

:deep(.el-input__inner):focus {
  border-color: #409eff;
}

.login-btn {
  width: 100%;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.forgot-password {
  text-align: center;
  margin-top: 16px;
}

.forgot-password a {
  font-size: 13px;
  color: #999;
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
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  padding: 20px 0 40px;
  background-color: transparent;
}

.footer-text {
  font-size: 14px;
  color: #999;
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