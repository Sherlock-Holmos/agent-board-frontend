<template>
  <el-dialog
    v-model="visible"
    title="编辑任务"
    width="520px"
    @close="handleClose"
  >
    <div class="edit-card">
      <el-form :model="form" label-width="80px" class="edit-form">
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
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
const form = ref({
  title: '',
  date: null as string | null,
  important: false,
  urgent: false,
  checklist: '收集箱'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.task) {
    form.value = {
      title: props.task.title,
      date: props.task.date ? new Date(props.task.date).toISOString().split('T')[0] : null,
      important: props.task.important ?? false,
      urgent: props.task.urgent ?? false,
      checklist: props.task.checklist
    }
  }
  if (val && !props.task) {
    form.value = {
      title: '',
      date: null,
      important: false,
      urgent: false,
      checklist: '收集箱'
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
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
.edit-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.edit-form :deep(.el-input__wrapper),
.edit-form :deep(.el-date-editor) {
  border-radius: 10px;
}

.edit-form :deep(.el-date-editor) {
  width: 100%;
}
</style>