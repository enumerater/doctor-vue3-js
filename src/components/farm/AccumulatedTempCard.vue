<template>
  <div class="accumulated-temp-card" @click="$emit('click')">
    <div class="card-header">
      <div class="title-group">
        <el-icon class="title-icon"><Timer /></el-icon>
        <span class="title">积温预测</span>
      </div>
      <el-tag size="small" type="success" effect="plain" round>实时分析</el-tag>
    </div>
    
    <div class="card-body">
      <div class="main-stats">
        <div class="stat-item">
          <span class="stat-label">当前有效积温</span>
          <div class="stat-value">
            <span class="number">{{ currentTemp }}</span>
            <span class="unit">°C·d</span>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">阶段进度</span>
          <div class="progress-wrapper">
            <el-progress 
              type="circle" 
              :percentage="progress" 
              :width="50" 
              :stroke-width="6"
              :color="customColors"
            />
          </div>
        </div>
      </div>
      
      <div class="prediction-info" v-if="predictionDate">
        <el-icon><Calendar /></el-icon>
        预计 <span>{{ predictionDate }}</span> 进入下一阶段
      </div>
    </div>
    
    <div class="card-footer">
      <span>查看详细分析与预测报告</span>
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Timer, Calendar, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  currentTemp: { type: Number, default: 0 },
  targetTemp: { type: Number, default: 1000 },
  predictionDate: { type: String, default: '' }
})

defineEmits(['click'])

const progress = computed(() => {
  if (!props.targetTemp) return 0
  const p = Math.round((props.currentTemp / props.targetTemp) * 100)
  return Math.min(p, 100)
})

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]
</script>

<style lang="scss" scoped>
.accumulated-temp-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 18px;
  cursor: pointer;
  transition: $transition-fast;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: $primary;
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    
    .card-footer .el-icon { transform: translateX(4px); color: $primary; }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, transparent 50%, rgba($primary, 0.05) 50%);
    border-radius: 0 0 0 100%;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .title-icon { color: $primary; font-size: 18px; }
    .title { font-weight: 700; color: $text-primary; font-size: 15px; }
  }
}

.card-body {
  margin-bottom: 16px;
}

.main-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  
  .stat-label { 
    display: block; 
    font-size: 11px; 
    color: $text-tertiary; 
    margin-bottom: 4px; 
  }
  
  .stat-value {
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    .number { font-size: 24px; font-weight: 800; color: $text-primary; }
    .unit { font-size: 12px; color: $text-tertiary; }
  }
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: $border;
}

.prediction-info {
  background: rgba($primary, 0.05);
  padding: 8px 12px;
  border-radius: $radius-md;
  font-size: 12px;
  color: $text-secondary;
  display: flex;
  align-items: center;
  gap: 6px;
  
  span { color: $primary; font-weight: 700; }
  .el-icon { font-size: 14px; color: $primary; }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid $border;
  font-size: 12px;
  color: $text-tertiary;
  
  .el-icon { transition: $transition-smooth; }
}
</style>
