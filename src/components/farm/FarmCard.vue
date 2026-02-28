<template>
  <div class="farm-card" @click="$emit('click', farm)">
    <div class="card-inner">
      <div class="card-header">
        <div class="farm-icon-wrapper">
          <div class="farm-icon">🏡</div>
          <div class="icon-pulse"></div>
        </div>
        <div class="farm-info">
          <h3 class="farm-name">{{ farm.name }}</h3>
          <div class="farm-location" v-if="farm.location">
            <el-icon><Location /></el-icon>
            <span>{{ farm.location }}</span>
          </div>
        </div>
        <div class="card-arrow-wrapper">
          <el-icon class="card-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-icon area"><el-icon><Compass /></el-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ farm.area || 0 }}</span>
            <span class="stat-label">总面积(亩)</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon plot"><el-icon><Grid /></el-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ farm.plotCount || 0 }}</span>
            <span class="stat-label">地块数量</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon crop"><el-icon><Collection /></el-icon></div>
          <div class="stat-content">
            <span class="stat-value">{{ cropTypes.length }}</span>
            <span class="stat-label">作物种类</span>
          </div>
        </div>
      </div>

      <div class="card-footer" v-if="cropTypes.length > 0">
        <div class="crop-tags">
          <span v-for="type in cropTypes.slice(0, 3)" :key="type" class="crop-tag">
            {{ type }}
          </span>
          <span v-if="cropTypes.length > 3" class="crop-tag more">
            +{{ cropTypes.length - 3 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Location, Compass, Grid, Collection } from '@element-plus/icons-vue'

const props = defineProps({
  farm: { type: Object, required: true },
})

defineEmits(['click'])

const cropTypes = computed(() => {
  const plots = props.farm.plots || []
  return [...new Set(plots.map((p) => p.cropType).filter(Boolean))]
})
</script>

<style lang="scss" scoped>
.farm-card {
  position: relative;
  border-radius: $radius-lg;
  background: $bg-card;
  border: 1px solid $border;
  padding: 2px;
  cursor: pointer;
  transition: $transition-smooth;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba($primary, 0.1), transparent);
    opacity: 0;
    transition: $transition-smooth;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba($primary, 0.4);
    box-shadow: $shadow-md;

    &::before { opacity: 1; }

    .card-arrow-wrapper {
      transform: translateX(4px);
      background: $primary;
      color: white;
    }

    .icon-pulse {
      animation: pulse 2s infinite;
    }
  }

  &:active { transform: scale(0.98); }
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: 18px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.farm-icon-wrapper {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.farm-icon {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, $primary-light, #ffffff);
  border: 1px solid rgba($primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  position: relative;
  z-index: 2;
}

.icon-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: rgba($primary, 0.1);
  z-index: 1;
  opacity: 0;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.farm-info {
  flex: 1;
  min-width: 0;
}

.farm-name {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.farm-location {
  font-size: 13px;
  color: $text-tertiary;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon { font-size: 14px; color: $primary; }
}

.card-arrow-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $bg-main;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary;
  transition: $transition-smooth;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: linear-gradient(to right, $bg-main, #ffffff);
  border-radius: $radius-md;
  padding: 14px;
  border: 1px solid rgba($border, 0.5);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  &.area { background: #fef3c7; color: #d97706; }
  &.plot { background: #dcfce7; color: #16a34a; }
  &.crop { background: #e0f2fe; color: #0284c7; }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.2;
}

.stat-label {
  font-size: 10px;
  color: $text-tertiary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.card-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed $border;
}

.crop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.crop-tag {
  font-size: 11px;
  padding: 2px 10px;
  background: $primary-light;
  color: $primary;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid rgba($primary, 0.1);

  &.more {
    background: $bg-main;
    color: $text-tertiary;
    border-color: $border;
  }
}
</style>
