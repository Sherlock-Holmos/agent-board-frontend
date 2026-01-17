<template>
  <el-dialog
    v-model="visible"
    title="任务详情"
    width="520px"
    @close="handleClose"
  >
    <div v-if="!isEditing" class="detail-view">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ task?.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="清单">{{ task?.checklist || '-' }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ formattedDate }}</el-descriptions-item>
        <el-descriptions-item label="重要性">{{ task?.important ? '重要' : '不重要' }}</el-descriptions-item>
        <el-descriptions-item label="紧急度">{{ task?.urgent ? '紧急' : '不紧急' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ task?.completed ? '已完成' : '待办' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-else class="detail-edit">
      <el-form :model="form" label-width="80px">
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
.detail-view :deep(.el-descriptions__body) {
  background-color: #fafafa;
}
</style>
