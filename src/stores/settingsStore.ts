import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>('light')

  function applyTheme(mode: ThemeMode) {
    const actual = mode === 'system' ? getSystemTheme() : mode
    const root = document.documentElement
    root.dataset.theme = actual
    root.classList.toggle('theme-dark', actual === 'dark')
  }

  function initTheme() {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'light'
    theme.value = saved
    applyTheme(theme.value)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  }

  watch(theme, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    applyTheme(val)
  })

  return {
    theme,
    initTheme,
    applyTheme
  }
})
