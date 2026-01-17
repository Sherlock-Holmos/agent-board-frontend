import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiDeleteUser, apiLogin, apiMe, apiUpdateUser } from '@/api/auth'
import type { UserDTO, UserLoginRequest, UserUpdateRequest } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserDTO | null>(null)
  const token = ref<string | null>(null)
  const isLoggedIn = ref(false)

  function persist() {
    if (token.value) {
      localStorage.setItem('token', token.value)
    } else {
      localStorage.removeItem('token')
    }

    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
    } else {
      localStorage.removeItem('user')
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isLoggedIn.value = false
    persist()
  }

  async function loginByApi(payload: UserLoginRequest) {
    let resp
    try {
      resp = await apiLogin(payload)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message
      throw new Error(message || '登录失败')
    }

    const loginData = resp.data
    if (!loginData?.token) {
      throw new Error(resp.message || '登录失败')
    }
    token.value = loginData.token
    user.value = loginData.user
    isLoggedIn.value = true
    persist()
  }

  async function fetchMe() {
    if (!token.value) return
    const resp = await apiMe()
    if (resp.code === 401) {
      logout()
      return
    }
    if (resp.data) {
      user.value = resp.data
      isLoggedIn.value = true
      persist()
    }
  }

  async function updateUserInfo(updates: UserUpdateRequest) {
    const resp = await apiUpdateUser(updates)
    if (resp.code === 401) {
      logout()
      throw new Error('未登录或登录已过期')
    }
    if (!resp.data) {
      throw new Error(resp.message || '更新失败')
    }
    user.value = resp.data
    persist()
  }

  async function deleteAccount() {
    const id = user.value?.id
    if (!id) {
      throw new Error('缺少用户ID')
    }
    const resp = await apiDeleteUser(id)
    if (resp.code === 401) {
      logout()
      throw new Error('未登录或登录已过期')
    }
    logout()
  }

  function initUser() {
    if (isLoggedIn.value) return

    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    token.value = savedToken

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        user.value = null
      }
    }

    isLoggedIn.value = Boolean(token.value)
  }

  return {
    user,
    token,
    isLoggedIn,
    logout,
    deleteAccount,
    initUser,
    loginByApi,
    fetchMe,
    updateUserInfo
  }
})