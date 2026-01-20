<template>
  <div class="task-item" @click="$emit('view')" @dblclick="$emit('edit')">
    <el-checkbox
      :model-value="task.completed"
      :disabled="trashMode"
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
    <div v-if="trashMode" class="task-actions" @click.stop>
      <el-button size="small" plain @click="$emit('restore')">还原</el-button>
      <el-button size="small" type="danger" plain @click="$emit('hard-delete')">彻底删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types/task'

const props = defineProps<{
  task: Task
  trashMode?: boolean
}>()

defineEmits<{
  toggle: [value: boolean]
  edit: []
  view: []
  restore: []
  'hard-delete': []
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

.task-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
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