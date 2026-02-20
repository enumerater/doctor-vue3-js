<template>
  <div class="drugs-section">
    <div class="drugs-header">
      <h3 class="section-title">推荐用药</h3>
      <el-tag type="warning" size="small" effect="light" round>
        请在专业人员指导下使用
      </el-tag>
    </div>
    <div class="drugs-list">
      <div v-for="(drug, index) in drugs" :key="index" class="drug-item">
        <div class="drug-name">
          <span class="drug-index">{{ index + 1 }}</span>
          {{ drug.name }}
        </div>
        <div class="drug-details">
          <div class="detail-row">
            <span class="detail-label">浓度</span>
            <span class="detail-value">{{ drug.concentration }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">用法</span>
            <span class="detail-value">{{ drug.method }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">安全间隔期</span>
            <span class="detail-value interval">{{ drug.interval }}</span>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-if="!drugs || drugs.length === 0" description="暂无推荐用药信息" :image-size="80" />
  </div>
</template>

<script setup>
defineProps({
  drugs: { type: Array, default: () => [] },
})
</script>

<style lang="scss" scoped>
.drugs-section {
  padding: 4px 0;
}

.drugs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.drugs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drug-item {
  background: $bg-main;
  border-radius: $radius-sm;
  padding: 12px 14px;
  border: 1px solid $border;
}

.drug-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.drug-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: $primary;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

.drug-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 28px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  flex-shrink: 0;
  color: $text-tertiary;
  min-width: 70px;
}

.detail-value {
  color: $text-secondary;

  &.interval {
    color: $severity-moderate;
    font-weight: 500;
  }
}
</style>
