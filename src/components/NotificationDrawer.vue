<template>
  <el-drawer
    v-model="visible"
    size="320px"
    direction="ltr"
    :with-header="false"
    class="notification-drawer"
  >
    <div class="drawer-content">
      <div class="drawer-header">通知中心</div>
      <el-segmented v-model="tab" :options="tabs" class="tab-switch" />

      <div v-if="tab === 'notice'" class="empty-state">
        <div class="empty-illustration">📣</div>
        <div class="empty-title">没有通知</div>
        <div class="empty-sub">共享清单的消息会显示在这里</div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-illustration">🧭</div>
        <div class="empty-title">没有动态</div>
        <div class="empty-sub">任务更新与操作将展示在这里</div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(false)
const tab = ref<'notice' | 'activity'>('notice')

const tabs = [
  { label: '通知', value: 'notice' },
  { label: '动态', value: 'activity' }
]

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 12px;
}

.drawer-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text);
}

.tab-switch {
  align-self: flex-start;
}

.empty-state {
  flex: 1;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.empty-illustration {
  font-size: 32px;
}

.empty-title {
  font-size: 14px;
  color: var(--app-text);
}

.empty-sub {
  font-size: 12px;
  color: var(--app-muted);
}
</style>
