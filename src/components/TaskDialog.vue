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
        <el-form-item label="时间">
          <el-time-picker
            v-model="form.time"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            :disabled="!form.date"
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
        <el-form-item label="预估时长">
          <el-input v-model.number="form.estimatedMinutes" placeholder="分钟" type="number" />
        </el-form-item>
        <el-form-item label="工作强度">
          <el-select v-model="form.effortLevel" placeholder="请选择强度">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="场景">
          <el-input v-model="form.context" placeholder="如：需要电脑/电话" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="可选" />
        </el-form-item>
        <el-form-item label="能量需求">
          <el-select v-model="form.energyRequired" placeholder="请选择能量">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="硬截止">
          <el-switch v-model="form.deadlineStrict" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="重要权重">
          <el-input v-model.number="form.importanceWeight" placeholder="0~100" type="number" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="用逗号分隔标签" />
        </el-form-item>
        <el-form-item label="子任务">
          <div class="subtask-list">
            <div v-for="(item, index) in subtasks" :key="item.id ?? index" class="subtask-item">
              <el-checkbox v-model="item.completed" />
              <el-input v-model="item.title" placeholder="子任务" size="small" />
              <el-button size="small" type="danger" text @click="removeSubtask(index)">删除</el-button>
            </div>
            <div class="subtask-add">
              <el-input v-model="newSubtaskTitle" placeholder="新增子任务" size="small" @keyup.enter="addSubtask" />
              <el-button size="small" @click="addSubtask">添加</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="提醒">
          <div class="reminder-list">
            <div v-for="(item, index) in reminders" :key="item.id ?? index" class="reminder-item">
              <el-date-picker
                v-model="item.remindAt"
                type="datetime"
                placeholder="选择提醒时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="small"
              />
              <el-select v-model="item.channel" size="small" placeholder="渠道">
                <el-option label="应用内" value="app" />
                <el-option label="邮件" value="email" />
                <el-option label="短信" value="sms" />
              </el-select>
              <el-button size="small" type="danger" text @click="removeReminder(index)">删除</el-button>
            </div>
            <div class="reminder-add">
              <el-date-picker
                v-model="newReminderAt"
                type="datetime"
                placeholder="新增提醒"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="small"
              />
              <el-select v-model="newReminderChannel" size="small" placeholder="渠道">
                <el-option label="应用内" value="app" />
                <el-option label="邮件" value="email" />
                <el-option label="短信" value="sms" />
              </el-select>
              <el-button size="small" @click="addReminder">添加</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="重复规则">
          <div class="rule-list">
            <div v-for="(item, index) in recurrenceRules" :key="item.id ?? index" class="rule-item">
              <el-input v-model="item.rrule" placeholder="RRULE" size="small" />
              <el-input v-model="item.timezone" placeholder="时区" size="small" />
              <el-date-picker
                v-model="item.nextRunAt"
                type="datetime"
                placeholder="下次触发"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="small"
              />
              <el-switch v-model="item.active" active-text="启用" inactive-text="停用" />
              <el-button size="small" type="danger" text @click="removeRecurrenceRule(index)">删除</el-button>
            </div>
            <div class="rule-add">
              <el-input v-model="newRuleText" placeholder="RRULE" size="small" />
              <el-input v-model="newRuleTimezone" placeholder="时区" size="small" />
              <el-date-picker
                v-model="newRuleNextRunAt"
                type="datetime"
                placeholder="下次触发"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="small"
              />
              <el-switch v-model="newRuleActive" active-text="启用" inactive-text="停用" />
              <el-button size="small" @click="addRecurrenceRule">添加</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="附件">
          <div class="attachment-list">
            <div v-for="(item, index) in attachments" :key="item.id ?? index" class="attachment-item">
              <el-input v-model="item.filename" placeholder="文件名" size="small" />
              <el-input v-model="item.url" placeholder="URL" size="small" />
              <el-input v-model="item.mimeType" placeholder="类型" size="small" />
              <el-input v-model.number="item.sizeBytes" placeholder="大小(字节)" size="small" />
              <el-button size="small" type="danger" text @click="removeAttachment(index)">删除</el-button>
            </div>
            <div class="attachment-add">
              <el-input v-model="newAttachmentName" placeholder="文件名" size="small" />
              <el-input v-model="newAttachmentUrl" placeholder="URL" size="small" />
              <el-input v-model="newAttachmentMime" placeholder="类型" size="small" />
              <el-input v-model.number="newAttachmentSize" placeholder="大小(字节)" size="small" />
              <el-button size="small" @click="addAttachment">添加</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button v-if="props.task" type="danger" plain @click="handleDelete">删除</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { apiGetReminders, apiGetSubtasks, apiGetRecurrenceRules, apiGetAttachments } from '@/api/todos'
import type { Task, Subtask, Reminder, RecurrenceRule, Attachment } from '@/types/task'

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
const form = ref({
  title: '',
  date: null as string | null,
  time: null as string | null,
  important: false,
  urgent: false,
  checklist: '收集箱',
  tags: '',
  estimatedMinutes: null as number | null,
  effortLevel: '',
  context: '',
  location: '',
  energyRequired: '',
  deadlineStrict: false,
  importanceWeight: null as number | null
})

const subtasks = ref<Subtask[]>([])
const reminders = ref<Reminder[]>([])
const recurrenceRules = ref<RecurrenceRule[]>([])
const attachments = ref<Attachment[]>([])
const newSubtaskTitle = ref('')
const newReminderAt = ref<string | null>(null)
const newReminderChannel = ref('app')
const newRuleText = ref('')
const newRuleTimezone = ref('Asia/Shanghai')
const newRuleNextRunAt = ref<string | null>(null)
const newRuleActive = ref(true)
const newAttachmentName = ref('')
const newAttachmentUrl = ref('')
const newAttachmentMime = ref('')
const newAttachmentSize = ref<number | null>(null)
const extrasLoading = ref(false)
const extrasTaskId = ref<number | null>(null)

function parseTags(raw: string) {
  return raw
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

function toLocalDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatTime(value?: Date | string | null) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function loadExtras(taskId: number) {
  extrasLoading.value = true
  extrasTaskId.value = taskId
  try {
    const [subtaskDtos, reminderDtos, ruleDtos, attachmentDtos] = await Promise.all([
      apiGetSubtasks(taskId),
      apiGetReminders(taskId),
      apiGetRecurrenceRules(taskId),
      apiGetAttachments(taskId)
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
      remindAt: item.remindAt ? toLocalDateTime(item.remindAt) : item.remindAt,
      channel: item.channel ?? 'app',
      status: item.status
    }))
    recurrenceRules.value = ruleDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      rrule: item.rrule ?? '',
      timezone: item.timezone ?? 'Asia/Shanghai',
      nextRunAt: item.nextRunAt ? toLocalDateTime(item.nextRunAt) : null,
      active: item.active ?? true
    }))
    attachments.value = attachmentDtos.map(item => ({
      id: item.id != null ? String(item.id) : undefined,
      filename: item.filename ?? '',
      url: item.url ?? '',
      mimeType: item.mimeType ?? '',
      sizeBytes: item.sizeBytes ?? undefined
    }))
  } catch {
    if (extrasTaskId.value !== taskId) return
    subtasks.value = []
    reminders.value = []
    recurrenceRules.value = []
    attachments.value = []
  } finally {
    if (extrasTaskId.value === taskId) {
      extrasLoading.value = false
    }
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.task) {
    form.value = {
      title: props.task.title,
      date: props.task.date ? new Date(props.task.date).toISOString().split('T')[0] : null,
      time: formatTime(props.task.dueAt),
      important: props.task.important ?? false,
      urgent: props.task.urgent ?? false,
      checklist: props.task.checklist,
      tags: props.task.tags?.join(', ') ?? '',
      estimatedMinutes: props.task.estimatedMinutes ?? null,
      effortLevel: props.task.effortLevel ?? '',
      context: props.task.context ?? '',
      location: props.task.location ?? '',
      energyRequired: props.task.energyRequired ?? '',
      deadlineStrict: props.task.deadlineStrict ?? false,
      importanceWeight: props.task.importanceWeight ?? null
    }
    subtasks.value = []
    reminders.value = []
    recurrenceRules.value = []
    attachments.value = []
    newSubtaskTitle.value = ''
    newReminderAt.value = null
    newReminderChannel.value = 'app'
    newRuleText.value = ''
    newRuleTimezone.value = 'Asia/Shanghai'
    newRuleNextRunAt.value = null
    newRuleActive.value = true
    newAttachmentName.value = ''
    newAttachmentUrl.value = ''
    newAttachmentMime.value = ''
    newAttachmentSize.value = null
    const numericId = Number(props.task.id)
    if (!Number.isNaN(numericId)) {
      void loadExtras(numericId)
    }
  }
  if (val && !props.task) {
    form.value = {
      title: '',
      date: null,
      time: null,
      important: false,
      urgent: false,
      checklist: '收集箱',
      tags: '',
      estimatedMinutes: null,
      effortLevel: '',
      context: '',
      location: '',
      energyRequired: '',
      deadlineStrict: false,
      importanceWeight: null
    }
    subtasks.value = []
    reminders.value = []
    recurrenceRules.value = []
    attachments.value = []
    newSubtaskTitle.value = ''
    newReminderAt.value = null
    newReminderChannel.value = 'app'
    newRuleText.value = ''
    newRuleTimezone.value = 'Asia/Shanghai'
    newRuleNextRunAt.value = null
    newRuleActive.value = true
    newAttachmentName.value = ''
    newAttachmentUrl.value = ''
    newAttachmentMime.value = ''
    newAttachmentSize.value = null
    extrasTaskId.value = null
    extrasLoading.value = false
  }
})

watch(() => form.value.date, (date) => {
  if (!date && form.value.time) {
    form.value.time = null
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  visible.value = false
}

function handleSave() {
  const tags = parseTags(form.value.tags || '')
  const dateOnly = form.value.date ? new Date(`${form.value.date}T00:00:00`) : null
  const dueAt = form.value.date && form.value.time
    ? new Date(`${form.value.date}T${form.value.time}:00`)
    : null
  const { time, ...rest } = form.value
  emit('save', {
    ...rest,
    date: dateOnly,
    dueAt,
    tags: tags.length ? tags : undefined,
    estimatedMinutes: form.value.estimatedMinutes ?? null,
    effortLevel: form.value.effortLevel || undefined,
    context: form.value.context || undefined,
    location: form.value.location || undefined,
    energyRequired: form.value.energyRequired || undefined,
    deadlineStrict: form.value.deadlineStrict ?? false,
    importanceWeight: form.value.importanceWeight ?? null,
    subtasks: subtasks.value,
    reminders: reminders.value,
    recurrenceRules: recurrenceRules.value,
    attachments: attachments.value
  })
  handleClose()
}

function handleDelete() {
  if (!props.task) return
  emit('delete', props.task)
  handleClose()
}

function addSubtask() {
  const title = newSubtaskTitle.value.trim()
  if (!title) return
  subtasks.value.push({
    title,
    completed: false,
    sortOrder: subtasks.value.length
  })
  newSubtaskTitle.value = ''
}

function removeSubtask(index: number) {
  subtasks.value.splice(index, 1)
}

function addReminder() {
  if (!newReminderAt.value) return
  reminders.value.push({
    remindAt: newReminderAt.value,
    channel: newReminderChannel.value || 'app'
  })
  newReminderAt.value = null
  newReminderChannel.value = 'app'
}

function removeReminder(index: number) {
  reminders.value.splice(index, 1)
}

function addRecurrenceRule() {
  const rrule = newRuleText.value.trim()
  if (!rrule) return
  recurrenceRules.value.push({
    rrule,
    timezone: newRuleTimezone.value || 'Asia/Shanghai',
    nextRunAt: newRuleNextRunAt.value,
    active: newRuleActive.value
  })
  newRuleText.value = ''
  newRuleNextRunAt.value = null
  newRuleActive.value = true
}

function removeRecurrenceRule(index: number) {
  recurrenceRules.value.splice(index, 1)
}

function addAttachment() {
  const filename = newAttachmentName.value.trim()
  const url = newAttachmentUrl.value.trim()
  if (!filename || !url) return
  attachments.value.push({
    filename,
    url,
    mimeType: newAttachmentMime.value.trim() || undefined,
    sizeBytes: newAttachmentSize.value ?? undefined
  })
  newAttachmentName.value = ''
  newAttachmentUrl.value = ''
  newAttachmentMime.value = ''
  newAttachmentSize.value = null
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}
</script>

<style scoped>
.edit-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  animation: none;
  transform: none;
}

.edit-card:hover {
  transform: none;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.edit-form :deep(.el-input__wrapper),
.edit-form :deep(.el-date-editor) {
  border-radius: 10px;
}

.edit-form :deep(.el-date-editor) {
  width: 100%;
}

.subtask-list,
.reminder-list,
.rule-list,
.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.subtask-item,
.reminder-item,
.rule-item,
.attachment-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
}

.reminder-item {
  grid-template-columns: 1fr 110px auto;
}

.rule-item {
  grid-template-columns: 1fr 140px 1fr auto auto;
}

.attachment-item {
  grid-template-columns: 1fr 1fr 120px 120px auto;
}

.subtask-add,
.reminder-add,
.rule-add,
.attachment-add {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.reminder-add {
  grid-template-columns: 1fr 110px auto;
}

.rule-add {
  grid-template-columns: 1fr 140px 1fr auto auto;
}

.attachment-add {
  grid-template-columns: 1fr 1fr 120px 120px auto;
}
</style>