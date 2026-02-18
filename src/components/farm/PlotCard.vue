<template>
  <div class="plot-card" @click="$emit('click', plot)">
    <div class="card-left">
      <span class="crop-icon">{{ cropIcon }}</span>
    </div>
    <div class="card-body">
      <div class="plot-header">
        <span class="plot-name">{{ plot.name }}</span>
        <span class="stage-tag" v-if="plot.growthStage">{{ plot.growthStage }}</span>
      </div>
      <div class="plot-meta">
        <span class="meta-item">{{ plot.cropType }}</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">{{ plot.area }}亩</span>
        <template v-if="plot.sowingDate">
          <span class="meta-divider">|</span>
          <span class="meta-item">播种 {{ plot.sowingDate }}</span>
        </template>
      </div>
    </div>
    <van-icon name="arrow" class="card-arrow" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
</script>

<style lang="scss" scoped>
.plot-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: $radius-sm;
  border: 1px solid $border;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: rgba($primary, 0.3);
    box-shadow: $shadow-sm;
  }

  &:active { transform: scale(0.98); }
}

.card-left {
  flex-shrink: 0;
  margin-right: 12px;
}

.crop-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 22px;
  background: $primary-light;
  border-radius: 10px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.plot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.plot-name {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
}

.plot-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $text-tertiary;
  flex-wrap: wrap;
}

.meta-divider {
  color: $border;
}

.card-arrow {
  flex-shrink: 0;
  color: $text-tertiary;
  font-size: 14px;
  margin-left: 8px;
}
</style>
