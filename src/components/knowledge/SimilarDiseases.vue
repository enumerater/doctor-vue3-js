<template>
  <div class="similar-section" v-if="diseases && diseases.length > 0">
    <h3 class="section-title">易混淆病害</h3>
    <div class="similar-list">
      <div v-for="item in diseases" :key="item.id" class="similar-item" @click="$emit('select', item)">
        <div class="similar-header">
          <span class="similar-name">{{ item.name }}</span>
          <van-icon name="arrow" class="similar-arrow" />
        </div>
        <div class="similar-diff">
          <span class="diff-label">区别</span>
          <span class="diff-text">{{ item.difference }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

.diff-label {
  flex-shrink: 0;
  color: $severity-moderate;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 500;
}

.diff-text {
  color: $text-secondary;
  line-height: 1.5;
}
</style>
