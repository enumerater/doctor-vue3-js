<template>
  <div class="disease-card" :class="{ 'is-expanded': expanded }" @click="$emit('click', disease)">
    <div class="card-left">
      <div class="disease-icon" :class="categoryClass">
        {{ disease.category[0] }}
      </div>
    </div>
    <div class="card-body">
      <div class="card-header">
        <span class="disease-name">{{ disease.diseaseName }}</span>
      </div>
      <div class="card-meta">
        <span class="meta-item">{{ disease.cropName }}</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">{{ disease.category }}</span>
      </div>
    </div>
    <el-icon class="card-arrow" :class="{ 'arrow-rotated': expanded }"><ArrowRight /></el-icon>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  disease: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
})

defineEmits(['click'])

const categoryClass = computed(() => {
  const map = { '真菌': 'cat-fungal', '细菌': 'cat-bacterial', '病毒': 'cat-viral', '虫害': 'cat-pest', '生理性': 'cat-physio' }
  return map[props.disease.category] || 'cat-default'
})
</script>

<style lang="scss" scoped>
.disease-card {
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

  &:active {
    transform: scale(0.98);
  }

  &.is-expanded {
    border-color: $primary;
    box-shadow: 0 0 0 1px rgba($primary, 0.2);
  }
}

.card-left {
  flex-shrink: 0;
  margin-right: 12px;
}

.disease-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;

  &.cat-fungal { background: linear-gradient(135deg, #22c55e, #16a34a); }
  &.cat-bacterial { background: linear-gradient(135deg, #f59e0b, #d97706); }
  &.cat-viral { background: linear-gradient(135deg, #ec4899, #db2777); }
  &.cat-pest { background: linear-gradient(135deg, #eab308, #ca8a04); }
  &.cat-physio { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
  &.cat-default { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.disease-name {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $text-tertiary;
}

.meta-divider {
  color: $border;
}

.card-arrow {
  flex-shrink: 0;
  color: $text-tertiary;
  font-size: 14px;
  margin-left: 8px;
  transition: transform 0.3s ease;

  &.arrow-rotated {
    transform: rotate(90deg);
    color: $primary;
  }
}
</style>
