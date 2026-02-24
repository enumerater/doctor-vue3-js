<template>
  <div class="disease-card" :class="{ 'is-expanded': expanded }" @click="$emit('click', disease)">
    <div class="card-left">
      <div class="disease-icon" :class="categoryClass">
        {{ categoryIcon }}
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
  return map[props.disease.category] || 'cat-fungal'
})

const categoryIcon = computed(() => {
  const map = { '真菌': '🍄', '细菌': '🦠', '病毒': '🧬', '虫害': '🐛', '生理性': '🌡️' }
  return map[props.disease.category] || '🔬'
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
  font-size: 20px;

  &.cat-fungal {
    background: #f0fdf4;
  }

  &.cat-bacterial {
    background: #fef3c7;
  }

  &.cat-viral {
    background: #fce7f3;
  }

  &.cat-pest {
    background: #fef9c3;
  }

  &.cat-physio {
    background: #e0f2fe;
  }
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
