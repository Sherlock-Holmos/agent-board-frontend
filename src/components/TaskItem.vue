<template>
  <div class="task-item" @click="$emit('view')" @dblclick="$emit('edit')">
    <el-checkbox
      :model-value="task.completed"
      @change="$emit('toggle')"
      class="task-checkbox"
    />
    <span 
      class="task-title"
      :class="{ completed: task.completed }"
    >
      {{ task.title }}
    </span>
    <div class="task-meta">
      <span v-if="task.date" class="task-date">
        {{ task.checklist }} {{ formattedDate }}
      </span>
      <span v-else class="task-checklist">{{ task.checklist }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  toggle: []
  edit: []
  view: []
}>()

const taskStore = useTaskStore()

const formattedDate = computed(() => {
  return taskStore.formatTaskDate(props.task)
})
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
  cursor: pointer;
}

.task-item:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding-left: 4px;
  padding-right: 4px;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  transition: color 0.2s;
}

.task-title.completed {
  color: #999;
  text-decoration: line-through;
}

.task-meta {
  flex-shrink: 0;
}

.task-checklist {
  font-size: 12px;
  color: #999;
  padding: 2px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.task-date {
  font-size: 12px;
  color: #999;
}
</style>