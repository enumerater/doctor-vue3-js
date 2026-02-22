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
        <h3 class="card-title">{{ record.hasDisease ? record.diseaseName : '健康' }}</h3>
        <span class="card-crop">{{ record.cropType }}</span>
        <span class="card-time">{{ formatTime(record.createdAt) }}</span>
      </div>
      <el-icon class="card-arrow"><ArrowRight /></el-icon>
    </div>
    <div class="card-tags">
      <el-tag size="small" type="info" effect="plain">{{ record.cropType }}</el-tag>
      <el-tag
        v-if="record.hasDisease"
        size="small"
        :type="severityType"
        effect="dark"
      >
        {{ record.severity }}
      </el-tag>
      <el-tag v-else size="small" type="success" effect="dark">健康</el-tag>
      <span class="card-confidence">{{ record.confidence }}%</span>
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

const severityType = computed(() => {
  switch (props.record.severity) {
    case '轻微':
      return 'success'
    case '中度':
      return 'warning'
    case '重度':
      return 'danger'
    default:
      return 'info'
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

.card-crop {
  font-size: 12px;
  color: $text-secondary;
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

.card-confidence {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  color: $primary;
}
</style>
