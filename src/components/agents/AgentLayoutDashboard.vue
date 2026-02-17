<template>
  <div class="dashboard">
    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">用户偏好</div>
        <el-button size="small" type="primary" :loading="preferenceSaving" @click="savePreference">保存偏好</el-button>
      </div>
      <div class="panel-body grid">
        <el-form label-width="90px" class="form">
          <el-form-item label="时区">
            <el-input v-model="preference.timezone" placeholder="Asia/Shanghai" />
          </el-form-item>
          <el-form-item label="生物钟">
            <el-select v-model="preference.chronotype" placeholder="请选择">
              <el-option label="早起型" value="morning" />
              <el-option label="均衡型" value="balanced" />
              <el-option label="夜猫型" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认时长">
            <el-input v-model.number="preference.defaultTaskDuration" type="number" placeholder="分钟" />
          </el-form-item>
          <el-form-item label="专注块">
            <el-input v-model.number="preference.focusBlockMinutes" type="number" placeholder="分钟" />
          </el-form-item>
          <el-form-item label="工作时段">
            <el-input v-model="preference.workHours" placeholder="JSON" />
          </el-form-item>
          <el-form-item label="能量曲线">
            <el-input v-model="preference.energyCurve" placeholder="JSON" />
          </el-form-item>
          <el-form-item label="偏好场景">
            <el-input v-model="preference.preferredContexts" placeholder="JSON" />
          </el-form-item>
        </el-form>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">基础画像（Base）</div>
        <el-tag type="info" effect="light">系统生成</el-tag>
      </div>
      <div class="panel-body grid">
        <el-form label-width="90px" class="form">
          <el-form-item label="时区">
            <el-input v-model="baseProfile.timezone" placeholder="Asia/Shanghai" disabled />
          </el-form-item>
          <el-form-item label="生物钟">
            <el-select v-model="baseProfile.chronotype" placeholder="请选择" disabled>
              <el-option label="早起型" value="morning" />
              <el-option label="均衡型" value="balanced" />
              <el-option label="夜猫型" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认时长">
            <el-input v-model.number="baseProfile.defaultTaskDuration" type="number" placeholder="分钟" disabled />
          </el-form-item>
          <el-form-item label="专注块">
            <el-input v-model.number="baseProfile.focusBlockMinutes" type="number" placeholder="分钟" disabled />
          </el-form-item>
          <el-form-item label="工作时段">
            <el-input v-model="baseProfile.workHours" placeholder="JSON" disabled />
          </el-form-item>
          <el-form-item label="能量曲线">
            <el-input v-model="baseProfile.energyCurve" placeholder="JSON" disabled />
          </el-form-item>
        </el-form>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">短期画像（Recent）</div>
        <el-tag type="info" effect="light">系统生成</el-tag>
      </div>
      <div class="panel-body grid">
        <el-form label-width="90px" class="form">
          <el-form-item label="时区">
            <el-input v-model="recentProfile.timezone" placeholder="可选" disabled />
          </el-form-item>
          <el-form-item label="生物钟">
            <el-select v-model="recentProfile.chronotype" placeholder="请选择" disabled>
              <el-option label="早起型" value="morning" />
              <el-option label="均衡型" value="balanced" />
              <el-option label="夜猫型" value="night" />
            </el-select>
          </el-form-item>
          <el-form-item label="默认时长">
            <el-input v-model.number="recentProfile.defaultTaskDuration" type="number" placeholder="分钟" disabled />
          </el-form-item>
          <el-form-item label="专注块">
            <el-input v-model.number="recentProfile.focusBlockMinutes" type="number" placeholder="分钟" disabled />
          </el-form-item>
          <el-form-item label="工作时段">
            <el-input v-model="recentProfile.workHours" placeholder="JSON" disabled />
          </el-form-item>
          <el-form-item label="能量曲线">
            <el-input v-model="recentProfile.energyCurve" placeholder="JSON" disabled />
          </el-form-item>
        </el-form>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">融合策略</div>
        <el-tag type="info" effect="light">管理员策略</el-tag>
      </div>
      <div class="panel-body grid">
        <el-form label-width="110px" class="form">
          <el-form-item label="长期权重">
            <el-input v-model.number="policy.baseWeight" type="number" placeholder="0~1" disabled />
          </el-form-item>
          <el-form-item label="短期权重">
            <el-input v-model.number="policy.recentWeight" type="number" placeholder="0~1" disabled />
          </el-form-item>
        </el-form>
        <div class="policy-hint">
          当前合并预览：默认时长 {{ mergedProfile.defaultTaskDuration ?? '-' }} 分钟，专注块 {{ mergedProfile.focusBlockMinutes ?? '-' }} 分钟。
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">可用时间</div>
        <el-button size="small" type="primary" :loading="availabilitySaving" @click="saveAvailability">保存可用时间</el-button>
      </div>
      <div class="panel-body">
        <div class="availability-list">
          <div v-for="(slot, index) in availability" :key="index" class="availability-row">
            <el-select v-model="slot.dayOfWeek" placeholder="周几">
              <el-option v-for="day in weekOptions" :key="day.value" :label="day.label" :value="day.value" />
            </el-select>
            <el-time-picker v-model="slot.startTime" placeholder="开始" format="HH:mm" value-format="HH:mm" />
            <el-time-picker v-model="slot.endTime" placeholder="结束" format="HH:mm" value-format="HH:mm" />
            <el-input v-model="slot.source" placeholder="来源" />
            <el-button size="small" type="danger" text @click="removeAvailability(index)">删除</el-button>
          </div>
        </div>
        <div class="availability-add">
          <el-select v-model="newAvailability.dayOfWeek" placeholder="周几">
            <el-option v-for="day in weekOptions" :key="day.value" :label="day.label" :value="day.value" />
          </el-select>
          <el-time-picker v-model="newAvailability.startTime" placeholder="开始" format="HH:mm" value-format="HH:mm" />
          <el-time-picker v-model="newAvailability.endTime" placeholder="结束" format="HH:mm" value-format="HH:mm" />
          <el-input v-model="newAvailability.source" placeholder="来源" />
          <el-button size="small" @click="addAvailability">添加</el-button>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div class="panel-title">今日计划</div>
        <div class="panel-actions">
          <el-date-picker v-model="planDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
          <el-button size="small" type="primary" :loading="planLoading" @click="generatePlan">生成计划</el-button>
        </div>
      </div>
      <div class="panel-body">
        <div v-if="!plan?.plan" class="empty">暂无计划</div>
        <div v-else class="plan-meta">
          <span>版本：{{ plan.plan.version }}</span>
          <span>得分：{{ plan.plan.score ?? '-' }}</span>
        </div>
        <div class="plan-list">
          <div v-for="rec in plan.recommendations" :key="rec.id ?? rec.todoId" class="plan-row">
            <div class="plan-time">{{ formatTime(rec.startAt) }} - {{ formatTime(rec.endAt) }}</div>
            <div class="plan-title">任务 #{{ rec.todoId }}</div>
            <div class="plan-reason">{{ rec.reason }}</div>
            <div class="plan-actions">
              <el-button size="small" type="success" text @click="submitFeedback(rec, 'accept')">接受</el-button>
              <el-button size="small" type="danger" text @click="submitFeedback(rec, 'reject')">拒绝</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiCreateFeedback, apiGeneratePlan, apiGetAvailability, apiGetPlan, apiGetBaseProfile, apiGetRecentProfile, apiGetProfile, apiGetProfilePolicy, apiGetPreference, apiUpdateAvailability, apiUpdatePreference } from '@/api/agent'
import type { AgentPlanResponse, UserAvailabilityDTO, UserProfileDTO, UserProfilePolicyDTO, UserPreferenceDTO } from '@/api/types'

const preference = ref<UserPreferenceDTO>({
  timezone: 'Asia/Shanghai',
  chronotype: '',
  defaultTaskDuration: 30,
  focusBlockMinutes: 60,
  workHours: '',
  energyCurve: '',
  preferredContexts: ''
})
const preferenceSaving = ref(false)
const baseProfile = ref<UserProfileDTO>({})
const recentProfile = ref<UserProfileDTO>({
  timezone: '',
  chronotype: '',
  defaultTaskDuration: null,
  focusBlockMinutes: null,
  workHours: '',
  energyCurve: ''
})
const policy = ref<UserProfilePolicyDTO>({
  baseWeight: 0.7,
  recentWeight: 0.3
})

const availability = ref<UserAvailabilityDTO[]>([])
const availabilitySaving = ref(false)
const newAvailability = ref<UserAvailabilityDTO>({
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '18:00',
  source: 'manual'
})

const plan = ref<AgentPlanResponse>({ plan: null, recommendations: [] })
const planLoading = ref(false)
const planDate = ref<string>('')

const weekOptions = [
  { label: '周日', value: 0 },
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 }
]

const hasRecommendations = computed(() => (plan.value?.recommendations ?? []).length > 0)
const mergedProfile = ref<UserProfileDTO>({})

const loadAll = async () => {
  preference.value = await apiGetPreference()
  baseProfile.value = await apiGetBaseProfile()
  recentProfile.value = await apiGetRecentProfile()
  policy.value = await apiGetProfilePolicy()
  mergedProfile.value = await apiGetProfile()
  availability.value = await apiGetAvailability()
  plan.value = await apiGetPlan(planDate.value || undefined)
}

const savePreference = async () => {
  preferenceSaving.value = true
  try {
    preference.value = await apiUpdatePreference(preference.value)
    mergedProfile.value = await apiGetProfile()
  } finally {
    preferenceSaving.value = false
  }
}

const saveAvailability = async () => {
  availabilitySaving.value = true
  try {
    availability.value = await apiUpdateAvailability(availability.value)
  } finally {
    availabilitySaving.value = false
  }
}

const addAvailability = () => {
  if (newAvailability.value.dayOfWeek == null) return
  availability.value.push({ ...newAvailability.value })
}

const removeAvailability = (index: number) => {
  availability.value.splice(index, 1)
}

const generatePlan = async () => {
  planLoading.value = true
  try {
    plan.value = await apiGeneratePlan(planDate.value || undefined)
  } finally {
    planLoading.value = false
  }
}

const submitFeedback = async (rec: { todoId?: number | null }, action: string) => {
  if (!rec.todoId || !plan.value?.plan?.id) return
  await apiCreateFeedback({
    todoId: rec.todoId,
    planId: plan.value.plan.id,
    action
  })
}

const formatTime = (value?: string | Date | null) => {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.panel {
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #eef2f7;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-hint {
  font-size: 12px;
  color: #64748b;
}

.form :deep(.el-input__wrapper),
.form :deep(.el-select),
.form :deep(.el-date-editor) {
  width: 100%;
}

.availability-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.availability-row,
.availability-add {
  display: grid;
  grid-template-columns: 90px 1fr 1fr 1fr auto;
  gap: 8px;
  align-items: center;
}

.plan-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-row {
  display: grid;
  grid-template-columns: 140px 120px 1fr auto;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #eef2f7;
  background: #f8fafc;
  align-items: center;
}

.plan-time {
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  font-weight: 600;
}

.plan-title {
  color: #2563eb;
  font-size: 13px;
}

.plan-reason {
  color: #64748b;
  font-size: 12px;
}

.plan-actions {
  display: inline-flex;
  gap: 6px;
}

.empty {
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 960px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .availability-row,
  .availability-add {
    grid-template-columns: 1fr 1fr;
  }
  .plan-row {
    grid-template-columns: 1fr;
  }
}
</style>
