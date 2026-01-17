import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/components/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/components/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// 使用 async guard 以便在首次进入受保护页面时拉取 /auth/me
router.beforeEach(async (to) => {
  const userStore = useUserStore()
  userStore.initUser()

  if (to.path === '/login') {
    return true
  }

  if (to.meta.requiresAuth) {
    if (!userStore.token) {
      return '/login'
    }

    // 有 token 但还没有用户信息时，拉取一次当前用户
    if (!userStore.user) {
      await userStore.fetchMe()
      if (!userStore.token) {
        // fetchMe 里遇到 401 会 logout
        return '/login'
      }
    }
  }

  return true
})

export default router