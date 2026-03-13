<template>
  <Transition :name="isMobile ? 'slide-up' : 'slide-right'">
    <div v-if="plot" class="twin-panel" :class="{ mobile: isMobile }">
      <div class="panel-header">
        <div class="header-left">
          <span class="crop-emoji">{{ emoji }}</span>
          <div class="header-info">
            <h3 class="plot-name">{{ plot.plotName }}</h3>
            <span class="health-badge" :style="{ background: plot.color }">
              {{ plot.healthScore }}分
            </span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="panel-body">
        <!-- 基本信息 -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">面积</span>
            <span class="info-value">{{ plot.area }} 亩</span>
          </div>
          <div class="info-row">
            <span class="info-label">土壤类型</span>
            <span class="info-value">{{ plot.soilType || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">播种日期</span>
            <span class="info-value">{{ plot.sowingDate || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">生长阶段</span>
            <span class="info-value stage">{{ plot.growthStage }}</span>
          </div>
        </div>

        <!-- 环境仪表盘 -->
        <div class="section-title">环境监测</div>
        <TwinEnvGauges :sensors="plot.iot?.sensors || {}" />

        <!-- 生长阶段图 -->
        <div class="section-title">生长阶段</div>
        <TwinGrowthChart :crop-type="plot.cropType" :current-stage="plot.growthStage" />

        <!-- 底部操作 -->
        <div class="panel-actions">
          <el-button size="small" @click="goPlotDetail">地块详情</el-button>
          <el-button size="small" @click="goAccTemp">积温分析</el-button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import TwinEnvGauges from './TwinEnvGauges.vue'
import TwinGrowthChart from './TwinGrowthChart.vue'
import { CROP_EMOJI } from '@/axios/farm_twin'

const props = defineProps({
  plot: { type: Object, default: null },
})

defineEmits(['close'])

const router = useRouter()

const isMobile = computed(() => window.innerWidth <= 768)

const emoji = computed(() => {
  if (!props.plot) return '🌱'
  return CROP_EMOJI[props.plot.cropType] || '🌱'
})

function goPlotDetail() {
  if (!props.plot) return
  // 默认 farmId 为 farm001
  router.push({
    name: 'plotDetail',
    params: { farmId: 'farm001', plotId: props.plot.plotId },
  })
}

function goAccTemp() {
  if (!props.plot) return
  router.push({
    name: 'accumulatedTemp',
    params: { farmId: 'farm001', plotId: props.plot.plotId },
  })
}
</script>

<style lang="scss" scoped>
.twin-panel {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  width: 380px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-left: 1px solid $border;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @include tablet {
    width: 320px;
  }

  &.mobile {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 70vh;
    border-left: none;
    border-top: 1px solid $border;
    border-radius: $radius-lg $radius-lg 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crop-emoji {
  font-size: 32px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plot-name {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.health-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid $border;
  background: $bg-main;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary;
  transition: $transition-fast;

  &:hover {
    background: $border;
    color: $text-primary;
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 13px;
  color: $text-tertiary;
}

.info-value {
  font-size: 13px;
  color: $text-primary;
  font-weight: 600;

  &.stage {
    color: $primary;
    background: $primary-light;
    padding: 2px 10px;
    border-radius: 8px;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border;
}

.panel-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid $border;
}

// ====== 过渡动画 ======
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
