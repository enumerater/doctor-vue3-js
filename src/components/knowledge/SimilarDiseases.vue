<template>
  <div class="similar-section" v-if="diseases && diseases.length > 0">
    <h3 class="section-title">易混淆病害</h3>
    <div class="similar-list">
      <div v-for="item in diseases" :key="item.id" class="similar-item" @click="$emit('select', item)">
        <div class="similar-header">
          <span class="similar-name">{{ item.name }}</span>
          <el-icon class="similar-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="similar-diff">
          <el-tag type="warning" size="small" effect="light">区别</el-tag>
          <span class="diff-text">{{ item.difference }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'

defineProps({
  diseases: { type: Array, default: () => [] },
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.similar-section {
  padding: 4px 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px 0;
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.similar-item {
  background: $bg-main;
  border-radius: $radius-sm;
  padding: 12px 14px;
  border: 1px solid $border;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: rgba($primary, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
}

.similar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.similar-name {
  font-size: 14px;
  font-weight: 600;
  color: $primary;
}

.similar-arrow {
  color: $text-tertiary;
  font-size: 13px;
}

.similar-diff {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
}

.diff-text {
  color: $text-secondary;
  line-height: 1.5;
}
</style>
