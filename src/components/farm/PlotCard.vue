<template>
  <div class="plot-card" @click="$emit('click', plot)">
    <div class="card-inner">
      <div class="card-icon-section">
        <div class="crop-icon-wrapper">
          <span class="crop-icon">{{ cropIcon }}</span>
          <div class="status-dot" :class="{ 'has-stage': !!plot.growthStage }"></div>
        </div>
      </div>
      
      <div class="card-content-section">
        <div class="plot-header">
          <h4 class="plot-name">{{ plot.name }}</h4>
          <span class="stage-badge" v-if="plot.growthStage">
            <el-icon><Monitor /></el-icon>
            {{ plot.growthStage }}
          </span>
        </div>
        
        <div class="plot-details">
          <div class="detail-item">
            <span class="label">作物:</span>
            <span class="value">{{ plot.cropType }}</span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-item">
            <span class="label">面积:</span>
            <span class="value">{{ plot.area }} 亩</span>
          </div>
          <template v-if="plot.sowingDate">
            <div class="detail-divider"></div>
            <div class="detail-item">
              <span class="label">已播种:</span>
              <span class="value">{{ formatDate(plot.sowingDate) }}</span>
            </div>
          </template>
        </div>
      </div>
      
      <div class="card-action-section">
        <div class="arrow-container">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    
    <!-- Decorative background element -->
    <div class="card-decoration"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Monitor } from '@element-plus/icons-vue'

const props = defineProps({
  plot: { type: Object, required: true },
})

defineEmits(['click'])

const cropIcon = computed(() => {
  const map = {
    '小麦': '🌾', '水稻': '🌾', '玉米': '🌽', '番茄': '🍅',
    '黄瓜': '🥒', '辣椒': '🌶️', '草莓': '🍓', '苹果': '🍎',
    '葡萄': '🍇', '白菜': '🥬',
  }
  return map[props.plot.cropType] || '🌱'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[1]}-${parts[2]}`
  return dateStr
}
</script>

<style lang="scss" scoped>
.plot-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  cursor: pointer;
  transition: $transition-smooth;
  overflow: hidden;
  padding: 1px;

  &:hover {
    transform: translateX(4px);
    border-color: rgba($primary, 0.4);
    box-shadow: $shadow-md;

    .arrow-container {
      background: $primary;
      color: white;
      transform: scale(1.1);
    }

    .crop-icon-wrapper {
      transform: scale(1.05) rotate(-5deg);
    }

    .card-decoration {
      opacity: 0.05;
      transform: scale(1.2) rotate(10deg);
    }
  }

  &:active { transform: scale(0.98); }
}

.card-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.card-icon-section {
  flex-shrink: 0;
}

.crop-icon-wrapper {
  position: relative;
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, $primary-light, #ffffff);
  border: 1px solid rgba($primary, 0.1);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-smooth;
}

.crop-icon {
  font-size: 30px;
}

.status-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $border;
  border: 2px solid $bg-card;

  &.has-stage {
    background: #48bb78;
    box-shadow: 0 0 0 2px rgba(#48bb78, 0.2);
  }
}

.card-content-section {
  flex: 1;
  min-width: 0;
}

.plot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}

.plot-name {
  font-size: 17px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  background: $primary-light;
  color: $primary;
  border-radius: 20px;
  white-space: nowrap;

  .el-icon { font-size: 12px; }
}

.plot-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 11px;
  color: $text-tertiary;
}

.value {
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
}

.detail-divider {
  width: 1px;
  height: 12px;
  background: $border;
}

.card-action-section {
  flex-shrink: 0;
}

.arrow-container {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: $bg-main;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary;
  transition: $transition-smooth;
}

.card-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, $primary 0%, transparent 70%);
  opacity: 0;
  transition: $transition-smooth;
  pointer-events: none;
  z-index: 1;
}
</style>
