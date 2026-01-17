<template>
  <div class="app-container">
    <Sidebar />
    <MainContent />
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import MainContent from '@/components/MainContent.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>