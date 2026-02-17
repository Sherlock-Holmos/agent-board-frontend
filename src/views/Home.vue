<template>
  <div class="app-container">
    <Sidebar :compact="currentView === 'quadrant' || currentView === 'pomodoro' || currentView === 'calendar'" />
    <MainContent />
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import MainContent from '@/components/MainContent.vue'
import { useTaskStore } from '@/stores/taskStore'
import { computed } from 'vue'

const taskStore = useTaskStore()
const currentView = computed(() => taskStore.currentView)
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--app-bg);
}

@media (max-width: 900px) {
  .app-container {
    flex-direction: column;
    padding-bottom: 72px;
  }
}
</style>