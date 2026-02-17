<template>
  <div class="task-item" @click="$emit('view')" @dblclick="$emit('edit')">
    <el-checkbox
      :model-value="task.completed"
      :disabled="trashMode"
      @click.stop
      @change="(val: boolean) => $emit('toggle', val)"
      class="task-checkbox"
    />
    <span 
      class="task-title"
      :class="{ completed: task.completed }"
    >
      {{ task.title }}
    </span>
    <div class="task-meta">
      <div v-if="visibleTags.length" class="task-tags">
        <span v-for="tag in visibleTags" :key="tag" class="task-tag">{{ tag }}</span>
        <span v-if="extraTagCount" class="task-tag">+{{ extraTagCount }}</span>
      </div>
      <span class="task-checklist">{{ task.checklist }}</span>
      <span v-if="task.date" class="task-date" :class="dateStatus">
        {{ formattedDate }}
      </span>
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

const visibleTags = computed(() => {
  return props.task.tags ? props.task.tags.slice(0, 2) : []
})

const extraTagCount = computed(() => {
  const count = props.task.tags ? props.task.tags.length : 0
  return count > 2 ? count - 2 : 0
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.task-tags {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.task-tag {
  font-size: 11px;
  color: #64748b;
  padding: 2px 6px;
  border-radius: 999px;
  background: #eef2ff;
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
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.12);
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