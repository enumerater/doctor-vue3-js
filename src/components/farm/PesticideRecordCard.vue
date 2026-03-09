<template>
  <div class="pesticide-v2-card" @click="handleCardClick">
    <!-- 顶部状态条：根据类型展示渐变色 -->
    <div class="category-banner" :class="record.category">
      <el-tag effect="dark" round size="small">{{ record.category }}</el-tag>
      <span class="apply-date">{{ record.applicationDate }}</span>
    </div>

    <div class="content-body">
      <div class="main-info">
        <div class="medicine-icon">
          <el-icon v-if="record.category === '肥料'"><Opportunity /></el-icon>
          <el-icon v-else-if="record.category === '农药'"><Aim /></el-icon>
          <el-icon v-else-if="record.category === '除草剂'"><Scissor /></el-icon>
          <el-icon v-else><Compass /></el-icon>
        </div>
        <div class="text-group">
          <h4 class="name">{{ record.medicineName }}</h4>
          <p class="purpose">{{ record.purpose }}</p>
        </div>
      </div>

      <div class="dosage-badge">
        <span class="num">{{ record.dosage }}</span>
        <span class="unit">{{ record.unit }}</span>
      </div>
    </div>

    <div class="footer-action">
      <div v-if="record.effectEvaluation" class="effect-summary">
        <span class="label">防治效果</span>
        <div class="stars">
          <el-icon v-for="i in 5" :key="i" :class="{ active: i <= record.effectEvaluation }"><StarFilled /></el-icon>
        </div>
      </div>
      <el-button v-else type="primary" plain round size="small" @click.stop="$emit('evaluate', record)">
        反馈效果
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Opportunity, Aim, Scissor, Compass, StarFilled } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  record: { type: Object, required: true }
})

const router = useRouter()
const route = useRoute()

const handleCardClick = () => {
  router.push({
    name: 'pesticideEdit',
    params: { 
      farmId: route.params.farmId, 
      plotId: route.params.plotId,
      id: props.record.id 
    }
  })
}
</script>

<style lang="scss" scoped>
.pesticide-v2-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  border: 1px solid $border;
  transition: all 0.3s ease;

  &:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 8px 25px rgba(74, 155, 94, 0.15); 
    border-color: rgba($primary, 0.2);
  }
}

.category-banner {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fbf9;
  
  &.农药 { background: linear-gradient(90deg, #fff1f0, #fff); }
  &.肥料 { background: linear-gradient(90deg, #f6ffed, #fff); }
  &.除草剂 { background: linear-gradient(90deg, #fff7e6, #fff); }
  &.杀菌剂 { background: linear-gradient(90deg, #e6f7ff, #fff); }
  
  .apply-date { font-size: 12px; color: $text-tertiary; font-weight: 500; }
}

.content-body {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-info {
  display: flex;
  gap: 12px;
  align-items: center;

  .medicine-icon {
    width: 48px;
    height: 48px;
    background: $primary-light;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: $primary;
  }

  .text-group {
    .name { margin: 0; font-size: 17px; font-weight: 800; color: $text-primary; }
    .purpose { margin: 4px 0 0; font-size: 13px; color: $text-secondary; }
  }
}

.dosage-badge {
  text-align: right;
  background: $bg-main;
  padding: 8px 12px;
  border-radius: 12px;
  .num { font-size: 20px; font-weight: 900; color: $primary; }
  .unit { font-size: 11px; color: $text-tertiary; margin-left: 2px; }
}

.footer-action {
  padding: 12px 16px;
  border-top: 1px dashed $border;
  display: flex;
  justify-content: flex-end;

  .effect-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    .label { font-size: 12px; color: $text-tertiary; }
    .stars {
      display: flex;
      color: #e6e6e6;
      .active { color: #ffc107; }
    }
  }
}
</style>
