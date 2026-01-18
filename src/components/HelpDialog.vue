<template>
  <el-dialog
    v-model="visible"
    title="使用指南"
    width="860px"
    @close="handleClose"
  >
    <div class="help-layout">
      <div class="help-nav">
        <div class="nav-title">使用指南</div>
        <div class="nav-group">
          <button
            v-for="section in helpSections"
            :key="section.key"
            class="nav-item"
            :class="{ active: activeKey === section.key }"
            @click="activeKey = section.key"
          >
            {{ section.title }}
          </button>
        </div>
      </div>

      <div class="help-content">
        <div class="help-header">
          <div class="help-title">{{ currentSection?.title }}</div>
          <div class="help-intro">{{ currentSection?.intro }}</div>
        </div>

        <div v-for="block in currentSection?.blocks" :key="block.title" class="help-block">
          <div class="help-block-title">{{ block.title }}</div>
          <ul class="help-list">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="currentSection?.note" class="help-note">
          {{ currentSection.note }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { helpSections } from '@/help/guideContent'

const props = defineProps<{
  modelValue: boolean
  activeKey?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(false)
const activeKey = ref(helpSections[0]?.key ?? 'quickstart')

const currentSection = computed(() => {
  return helpSections.find(section => section.key === activeKey.value) ?? helpSections[0]
})

function syncActiveKey() {
  if (props.activeKey) {
    activeKey.value = props.activeKey
    return
  }
  activeKey.value = helpSections[0]?.key ?? 'quickstart'
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      syncActiveKey()
    }
  }
)

watch(
  () => props.activeKey,
  (val) => {
    if (val) {
      activeKey.value = val
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
}
</script>

<style scoped>
.help-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  min-height: 520px;
}

.help-nav {
  border-right: 1px solid var(--app-border);
  padding-right: 12px;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 12px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--app-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--el-fill-color-light);
}

.nav-item.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.12);
  color: #409eff;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 6px;
  max-height: 520px;
  overflow-y: auto;
}

.help-header {
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02));
  border: 1px solid rgba(59, 130, 246, 0.16);
}

.help-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 6px;
}

.help-intro {
  font-size: 13px;
  color: var(--app-muted);
}

.help-block {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--app-surface);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.help-block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 6px;
}

.help-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--app-muted);
  font-size: 13px;
}

.help-note {
  font-size: 12px;
  color: var(--app-muted);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed var(--app-border);
}
</style>
