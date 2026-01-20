<template>
  <div class="task-item" @click="$emit('view')" @dblclick="$emit('edit')">
    <el-checkbox
      :model-value="task.completed"
      @click.stop
      @change="(val) => $emit('toggle', val)"
      class="task-checkbox"
    />
    <span 
      class="task-title"
      :class="{ completed: task.completed }"
    >
      {{ task.title }}
    </span>
    <div class="task-meta">
      <span v-if="task.date" class="task-date" :class="dateStatus">
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
  toggle: [value: boolean]
  edit: []
  view: []
}>()

const taskStore = useTaskStore()

const formattedDate = computed(() => {
  return taskStore.formatTaskDate(props.task)
})

const dateStatus = computed(() => {
  if (!props.task.date) return 'date-none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(props.task.date)
  taskDate.setHours(0, 0, 0, 0)

  if (!props.task.completed && taskDate.getTime() < today.getTime()) {
    return 'date-overdue'
  }
  if (taskDate.getTime() === today.getTime()) {
    return 'date-today'
  }
  return 'date-future'
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

.task-date.date-today {
  color: #2563eb;
  font-weight: 600;
}

.task-date.date-future {
  color: #16a34a;
  font-weight: 600;
}

.task-date.date-overdue {
  color: #dc2626;
  font-weight: 600;
}
</style>