<template>
  <div class="farm-card" @click="$emit('click', farm)">
    <div class="card-header">
      <div class="farm-icon">🏡</div>
      <div class="farm-info">
        <h3 class="farm-name">{{ farm.name }}</h3>
        <span class="farm-location" v-if="farm.location">{{ farm.location }}</span>
      </div>
      <van-icon name="arrow" class="card-arrow" />
    </div>
    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-value">{{ farm.area || 0 }}</span>
        <span class="stat-label">亩</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ farm.plotCount || 0 }}</span>
        <span class="stat-label">地块</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value crop-count">{{ cropTypes.length }}</span>
        <span class="stat-label">作物</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
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
  margin-bottom: 14px;
}

.farm-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: $primary-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.farm-info {
  flex: 1;
  min-width: 0;
}

.farm-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.farm-location {
  font-size: 12px;
  color: $text-tertiary;
}

.card-arrow {
  color: $text-tertiary;
  font-size: 14px;
  flex-shrink: 0;
}

.card-stats {
  display: flex;
  align-items: center;
  background: $bg-main;
  border-radius: 10px;
  padding: 10px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: $primary;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: $text-tertiary;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: $border;
}
</style>
