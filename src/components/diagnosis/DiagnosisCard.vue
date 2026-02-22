<template>
  <div class="diagnosis-card" @click="$emit('click', record)">
    <div class="card-header">
      <div class="card-thumb">
        <img v-if="record.imageUrl" :src="record.imageUrl" alt="诊断图片" />
        <div v-else class="thumb-placeholder">
          <el-icon :size="24"><Picture /></el-icon>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">{{ cardTitle }}</h3>
        <span class="card-detail" v-if="cardDetail">{{ cardDetail }}</span>
        <span class="card-time">{{ formatTime(record.createdAt) }}</span>
      </div>
      <el-icon class="card-arrow"><ArrowRight /></el-icon>
    </div>
    <div class="card-tags">
      <el-tag size="small" type="success" effect="plain">{{ record.cropType }}</el-tag>
      <el-tag size="small" :type="typeTagType" effect="dark">{{ parsedType }}</el-tag>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  record: { type: Object, required: true },
})

defineEmits(['click'])

// Parse result JSON
const parsedResult = computed(() => {
  const r = props.record.result
  if (!r) return null
  try {
    const data = typeof r === 'string' ? JSON.parse(r) : r
    if (data && data.type) return data
    return null
  } catch {
    return null
  }
})

const parsedType = computed(() => parsedResult.value?.type || '未知')

const cardTitle = computed(() => {
  const r = parsedResult.value
  if (!r) return props.record.cropType || '未知'
  if (r.type === '不健康作物' && r.detail) {
    // Extract disease name before the colon
    const idx = r.detail.indexOf('：')
    if (idx !== -1) return r.detail.substring(0, idx)
    const idx2 = r.detail.indexOf(':')
    if (idx2 !== -1) return r.detail.substring(0, idx2)
    return r.detail
  }
  if (r.type === '健康作物') return '健康'
  if (r.type === '非作物') return r.detail || '非作物'
  return props.record.cropType || '未知'
})

const cardDetail = computed(() => {
  const r = parsedResult.value
  if (!r) return ''
  if (r.type === '不健康作物' && r.detail) {
    const idx = r.detail.indexOf('：')
    if (idx !== -1) return r.detail.substring(idx + 1).trim()
    const idx2 = r.detail.indexOf(':')
    if (idx2 !== -1) return r.detail.substring(idx2 + 1).trim()
    return ''
  }
  return ''
})

const typeTagType = computed(() => {
  switch (parsedResult.value?.type) {
    case '健康作物': return 'success'
    case '不健康作物': return 'warning'
    case '非作物': return 'info'
    default: return 'info'
  }
})

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}
</script>

<style lang="scss" scoped>
.diagnosis-card {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 14px 16px;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: rgba($primary, 0.3);
    box-shadow: $shadow-sm;
  }

  &:active {
    transform: scale(0.98);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.card-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: $bg-main;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-tertiary;
  }
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-detail {
  font-size: 12px;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.card-time {
  font-size: 11px;
  color: $text-tertiary;
}

.card-arrow {
  color: $text-tertiary;
  font-size: 14px;
  flex-shrink: 0;
}

.card-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
