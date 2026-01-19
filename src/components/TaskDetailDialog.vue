<template>
  <el-dialog
    v-model="visible"
    width="560px"
    :show-close="false"
    class="detail-dialog"
    @close="handleClose"
  >
    <div class="detail-card">
      <div class="detail-header">
        <div class="detail-title">{{ (isEditing ? form.title : task?.title) || '-' }}</div>
        <div class="detail-header-actions">
          <el-tag :type="(isEditing ? form.completed : task?.completed) ? 'success' : 'info'" effect="light">
            {{ (isEditing ? form.completed : task?.completed) ? '已完成' : '待办' }}
          </el-tag>
          <el-button class="detail-close" circle size="small" @click="handleClose">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <template v-if="!isEditing">
        <div class="detail-sub">
          <span class="sub-item">清单：{{ task?.checklist || '-' }}</span>
          <span class="sub-divider">•</span>
          <span class="sub-item">日期：{{ formattedDate }}</span>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <div class="item-label">重要性</div>
            <div class="item-value">
              <el-tag size="small" :type="task?.important ? 'warning' : 'info'" effect="light">
                {{ task?.important ? '重要' : '普通' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">紧急度</div>
            <div class="item-value">
              <el-tag size="small" :type="task?.urgent ? 'danger' : 'info'" effect="light">
                {{ task?.urgent ? '紧急' : '一般' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">状态</div>
            <div class="item-value">
              <el-tag size="small" :type="task?.completed ? 'success' : 'info'" effect="light">
                {{ task?.completed ? '已完成' : '待办' }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <div class="item-label">任务类型</div>
            <div class="item-value">个人任务</div>
          </div>
        </div>
      </template>

      <template v-else>
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
      </template>

      <div class="detail-actions">
        <template v-if="!isEditing">
          <el-button type="danger" plain @click="handleDelete">删除</el-button>
          <el-button type="primary" @click="isEditing = true">编辑</el-button>
        </template>
        <template v-else>
          <el-button @click="handleCancelEdit">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  modelValue: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [task: Partial<Task>]
  'delete': [task: Task]
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

function handleDelete() {
  if (!props.task) return
  emit('delete', props.task)
  handleClose()
}
</script>

<style scoped>
.detail-dialog :deep(.el-dialog__header) {
  display: none;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 18px 20px 22px;
}

.detail-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  animation: none;
  transform: none;
}

.detail-card:hover {
  transform: none;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-close {
  width: 28px;
  height: 28px;
  border-radius: 999px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.detail-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 14px;
}

.sub-divider {
  color: #cbd5e1;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  border: 1px solid #eef2f7;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-label {
  font-size: 12px;
  color: #64748b;
}

.item-value {
  font-size: 13px;
  color: #0f172a;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-form :deep(.el-input__wrapper),
.detail-form :deep(.el-date-editor) {
  border-radius: 10px;
}

.detail-form :deep(.el-date-editor) {
  width: 100%;
}
</style>
