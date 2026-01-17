import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  account: string
  name: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  function login(userData: User) {
    user.value = userData
    isLoggedIn.value = true
    // 可以在这里保存到 localStorage
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  function initUser() {
    // 如果已经初始化过，不再重复初始化
    if (user.value !== null || isLoggedIn.value) {
      return
    }
    
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        isLoggedIn.value = true
      } catch (e) {
        console.error('Failed to parse user data', e)
      }
    }
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    initUser
  }
})