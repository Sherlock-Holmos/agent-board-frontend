<template>
  <el-dialog
    v-model="visible"
    title="任务详情"
    width="560px"
    @close="handleClose"
  >
    <div v-if="!isEditing" class="detail-view">
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-title">{{ task?.title || '-' }}</div>
          <el-tag :type="task?.completed ? 'success' : 'info'" effect="light">
            {{ task?.completed ? '已完成' : '待办' }}
          </el-tag>
        </div>

        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">清单</span>
            <span class="meta-value">{{ task?.checklist || '-' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">日期</span>
            <span class="meta-value">{{ formattedDate }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">重要性</span>
            <span class="meta-value">{{ task?.important ? '重要' : '不重要' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">紧急度</span>
            <span class="meta-value">{{ task?.urgent ? '紧急' : '不紧急' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="detail-edit">
      <div class="edit-card">
        <el-form :model="form" label-width="80px" class="detail-form">
          <el-form-item label="任务标题">
            <el-input v-model="form.title" placeholder="请输入任务标题" />
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="重要性">
            <el-switch
              v-model="form.important"
              active-text="重要"
              inactive-text="不重要"
            />
          </el-form-item>
          <el-form-item label="紧急度">
            <el-switch
              v-model="form.urgent"
              active-text="紧急"
              inactive-text="不紧急"
            />
          </el-form-item>
          <el-form-item label="清单">
            <el-input v-model="form.checklist" placeholder="请输入清单名称" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch
              v-model="form.completed"
              active-text="已完成"
              inactive-text="待办"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <template v-if="!isEditing">
        <el-button type="primary" @click="isEditing = true">编辑</el-button>
      </template>
      <template v-else>
        <el-button @click="handleCancelEdit">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  modelValue: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [task: Partial<Task>]
}>()

const visible = ref(false)
const isEditing = ref(false)

const form = ref({
  title: '',
  date: null as string | null,
  important: false,
  urgent: false,
  checklist: '收集箱',
  completed: false
})

const formattedDate = computed(() => {
  if (!props.task?.date) return '无'
  const date = new Date(props.task.date)
  if (Number.isNaN(date.getTime())) return '无'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.task) {
      isEditing.value = false
      form.value = {
        title: props.task.title,
        date: props.task.date ? new Date(props.task.date).toISOString().split('T')[0] : null,
        important: props.task.important ?? false,
        urgent: props.task.urgent ?? false,
        checklist: props.task.checklist,
        completed: props.task.completed
      }
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
  isEditing.value = false
}

function handleCancelEdit() {
  isEditing.value = false
  if (props.task) {
    form.value = {
      title: props.task.title,
      date: props.task.date ? new Date(props.task.date).toISOString().split('T')[0] : null,
      important: props.task.important ?? false,
      urgent: props.task.urgent ?? false,
      checklist: props.task.checklist,
      completed: props.task.completed
    }
  }
}

function handleSave() {
  emit('save', {
    ...form.value,
    date: form.value.date ? new Date(form.value.date) : null
  })
  handleClose()
}
</script>

<style scoped>
.detail-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.detail-meta {
  display: grid;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.meta-label {
  font-size: 12px;
  color: #64748b;
}

.meta-value {
  font-size: 13px;
  color: #0f172a;
}

.edit-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.detail-form :deep(.el-input__wrapper),
.detail-form :deep(.el-date-editor) {
  border-radius: 10px;
}

.detail-form :deep(.el-date-editor) {
  width: 100%;
}
</style>
