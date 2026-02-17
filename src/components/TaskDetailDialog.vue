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
            <div class="item-label">预估时长</div>
            <div class="item-value">{{ task?.estimatedMinutes ?? '-' }} 分钟</div>
          </div>
          <div class="detail-item">
            <div class="item-label">强度</div>
            <div class="item-value">{{ task?.effortLevel || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">场景</div>
            <div class="item-value">{{ task?.context || '-' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">能量需求</div>
            <div class="item-value">{{ task?.energyRequired || '-' }}</div>
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
          <div class="detail-item">
            <div class="item-label">硬截止</div>
            <div class="item-value">{{ task?.deadlineStrict ? '是' : '否' }}</div>
          </div>
          <div class="detail-item">
            <div class="item-label">重要权重</div>
            <div class="item-value">{{ task?.importanceWeight ?? '-' }}</div>
          </div>
        </div>

        <div v-if="task?.tags?.length" class="detail-section">
          <div class="section-title">标签</div>
          <div class="tag-list">
            <el-tag v-for="tag in task.tags" :key="tag" size="small" effect="light">{{ tag }}</el-tag>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">子任务</div>
          <div v-if="extrasLoading" class="section-muted">加载中...</div>
          <div v-else-if="subtasks.length === 0" class="section-muted">暂无子任务</div>
          <div v-else class="subtask-list">
            <div v-for="item in subtasks" :key="item.id ?? item.title" class="subtask-row">
              <el-checkbox :model-value="item.completed" disabled />
              <span :class="{ completed: item.completed }">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">提醒</div>
          <div v-if="extrasLoading" class="section-muted">加载中...</div>
          <div v-else-if="reminders.length === 0" class="section-muted">暂无提醒</div>
          <div v-else class="reminder-list">
            <div v-for="item in reminders" :key="item.id ?? String(item.remindAt)" class="reminder-row">
              <span class="reminder-time">{{ formatReminder(item.remindAt) }}</span>
              <el-tag size="small" effect="plain">{{ item.channel || 'app' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">重复规则</div>
          <div v-if="extrasLoading" class="section-muted">加载中...</div>
          <div v-else-if="recurrenceRules.length === 0" class="section-muted">暂无重复规则</div>
          <div v-else class="rule-list">
            <div v-for="item in recurrenceRules" :key="item.id ?? item.rrule" class="rule-row">
              <span class="rule-text">{{ item.rrule }}</span>
              <span class="rule-meta">{{ item.timezone || 'Asia/Shanghai' }}</span>
              <el-tag size="small" :type="item.active ? 'success' : 'info'" effect="plain">
                {{ item.active ? '启用' : '停用' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">附件</div>
          <div v-if="extrasLoading" class="section-muted">加载中...</div>
          <div v-else-if="attachments.length === 0" class="section-muted">暂无附件</div>
          <div v-else class="attachment-list">
            <div v-for="item in attachments" :key="item.id ?? item.url" class="attachment-row">
              <a :href="item.url" class="attachment-link" target="_blank" rel="noreferrer">{{ item.filename }}</a>
              <span class="attachment-meta">{{ item.mimeType || '-' }}</span>
              <span class="attachment-meta">{{ item.sizeBytes ?? '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">动态日志</div>
          <div v-if="extrasLoading" class="section-muted">加载中...</div>
          <div v-else-if="activityLogs.length === 0" class="section-muted">暂无日志</div>
          <div v-else class="log-list">
            <div v-for="item in activityLogs" :key="item.id ?? item.action" class="log-row">
              <span class="log-action">{{ item.action }}</span>
              <span class="log-payload">{{ item.payload || '-' }}</span>
              <span class="log-time">{{ item.createdAt ? formatReminder(item.createdAt) : '-' }}</span>
            </div>
          </div>
          <div class="log-add">
            <el-input v-model="newLogAction" placeholder="动作" size="small" />
            <el-input v-model="newLogPayload" placeholder="内容" size="small" />
            <el-button size="small" :loading="logSubmitting" @click="handleAddLog">添加</el-button>
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
import { apiGetReminders, apiGetSubtasks, apiGetRecurrenceRules, apiGetAttachments, apiGetActivityLogs, apiCreateActivityLog } from '@/api/todos'
import type { Task, Subtask, Reminder, RecurrenceRule, Attachment, ActivityLog } from '@/types/task'

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
const extrasLoading = ref(false)
const subtasks = ref<Subtask[]>([])
const reminders = ref<Reminder[]>([])
const recurrenceRules = ref<RecurrenceRule[]>([])
const attachments = ref<Attachment[]>([])
const activityLogs = ref<ActivityLog[]>([])
const extrasTaskId = ref<number | null>(null)
const newLogAction = ref('')
const newLogPayload = ref('')
const logSubmitting = ref(false)

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

function formatReminder(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadExtras(taskId: number) {
  extrasLoading.value = true
  extrasTaskId.value = taskId
  try {
    const [subtaskDtos, reminderDtos, ruleDtos, attachmentDtos, logDtos] = await Promise.all([
      apiGetSubtasks(taskId),
      apiGetReminders(taskId),
      apiGetRecurrenceRules(taskId),
      apiGetAttachments(taskId),
      apiGetActivityLogs(taskId)
    ])
    if (extrasTaskId.value !== taskId) return
    subtasks.value = subtaskDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      title: item.title,
      completed: item.completed ?? false,
      sortOrder: item.sortOrder ?? 0
    }))
    reminders.value = reminderDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      remindAt: item.remindAt,
      channel: item.channel,
      status: item.status
    }))
    recurrenceRules.value = ruleDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      rrule: item.rrule ?? '',
      timezone: item.timezone ?? 'Asia/Shanghai',
      nextRunAt: item.nextRunAt ?? null,
      active: item.active ?? true
    }))
    attachments.value = attachmentDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      filename: item.filename ?? '',
      url: item.url ?? '',
      mimeType: item.mimeType ?? '',
      sizeBytes: item.sizeBytes ?? undefined
    }))
    activityLogs.value = logDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      action: item.action ?? '',
      payload: item.payload ?? '',
      createdAt: item.createdAt ?? null
    }))
  } catch {
    if (extrasTaskId.value !== taskId) return
    subtasks.value = []
    reminders.value = []
    recurrenceRules.value = []
    attachments.value = []
    activityLogs.value = []
  } finally {
    if (extrasTaskId.value === taskId) {
      extrasLoading.value = false
    }
  }
}

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
      const numericId = Number(props.task.id)
      if (!Number.isNaN(numericId)) {
        void loadExtras(numericId)
      } else {
        subtasks.value = []
        reminders.value = []
        recurrenceRules.value = []
        attachments.value = []
        activityLogs.value = []
      }
    }
    if (!val) {
      extrasTaskId.value = null
      extrasLoading.value = false
      subtasks.value = []
      reminders.value = []
      recurrenceRules.value = []
      attachments.value = []
      activityLogs.value = []
      newLogAction.value = ''
      newLogPayload.value = ''
    }
  }
)

async function handleAddLog() {
  if (!props.task) return
  const action = newLogAction.value.trim()
  const payload = newLogPayload.value.trim()
  if (!action) return
  const todoId = Number(props.task.id)
  if (Number.isNaN(todoId)) return
  try {
    logSubmitting.value = true
    await apiCreateActivityLog(todoId, { action, payload })
    newLogAction.value = ''
    newLogPayload.value = ''
    await loadExtras(todoId)
  } finally {
    logSubmitting.value = false
  }
}

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

.detail-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.section-muted {
  font-size: 12px;
  color: #94a3b8;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.subtask-list,
.reminder-list,
.rule-list,
.attachment-list,
.log-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subtask-row,
.reminder-row,
.rule-row,
.attachment-row,
.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #334155;
}

.subtask-row .completed {
  color: #94a3b8;
  text-decoration: line-through;
}

.reminder-time {
  font-variant-numeric: tabular-nums;
}

.rule-text {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  color: #0f172a;
}

.rule-meta {
  color: #94a3b8;
}

.attachment-row {
  justify-content: space-between;
}

.attachment-link {
  color: #2563eb;
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}

.attachment-meta {
  color: #94a3b8;
}

.log-row {
  display: grid;
  grid-template-columns: 120px 1fr 160px;
  gap: 8px;
  align-items: center;
}

.log-action {
  font-weight: 600;
  color: #0f172a;
}

.log-payload {
  color: #64748b;
}

.log-time {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.log-add {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 8px;
  align-items: center;
}

.detail-form :deep(.el-input__wrapper),
.detail-form :deep(.el-date-editor) {
  border-radius: 10px;
}

.detail-form :deep(.el-date-editor) {
  width: 100%;
}
</style>
