<template>
  <div class="chart-tabs">
    <!-- Tab 头部 -->
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: store.chartTab === tab.key }"
        @click="store.chartTab = tab.key"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 内容 -->
    <div class="tabs-body">
      <transition name="tab-fade" mode="out-in">
        <div class="chart-grid" :key="store.chartTab">
          <!-- 病害分析 -->
          <template v-if="store.chartTab === 'disease'">
            <ChartDiseaseTop />
            <ChartDiagnosisTrend />
            <ChartDiseaseHeatmap />
            <ChartSeasonalPattern />
          </template>

          <!-- 气候天气 -->
          <template v-else-if="store.chartTab === 'climate'">
            <ChartTemperature />
            <ChartHumidity />
            <ChartWindRose />
            <ChartPriceIndex />
          </template>

          <!-- 作物生产 -->
          <template v-else-if="store.chartTab === 'crop'">
            <ChartCropDistribution />
            <ChartCropYield />
            <ChartRegionComparison />
            <ChartPriceIndex />
          </template>

          <!-- AI 性能 -->
          <template v-else-if="store.chartTab === 'ai'">
            <ChartAiPerformance />
            <ChartDiagnosisTrend />
            <ChartDiseaseTop />
            <ChartRegionComparison />
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'
import ChartDiseaseTop from './charts/ChartDiseaseTop.vue'
import ChartDiagnosisTrend from './charts/ChartDiagnosisTrend.vue'
import ChartDiseaseHeatmap from './charts/ChartDiseaseHeatmap.vue'
import ChartSeasonalPattern from './charts/ChartSeasonalPattern.vue'
import ChartTemperature from './charts/ChartTemperature.vue'
import ChartHumidity from './charts/ChartHumidity.vue'
import ChartWindRose from './charts/ChartWindRose.vue'
import ChartPriceIndex from './charts/ChartPriceIndex.vue'
import ChartCropDistribution from './charts/ChartCropDistribution.vue'
import ChartCropYield from './charts/ChartCropYield.vue'
import ChartRegionComparison from './charts/ChartRegionComparison.vue'
import ChartAiPerformance from './charts/ChartAiPerformance.vue'

const store = useDashboardStore()

const tabs = [
  { key: 'disease', label: '病害分析', icon: '&#9888;' },
  { key: 'climate', label: '气候天气', icon: '&#9729;&#65039;' },
  { key: 'crop', label: '作物生产', icon: '&#9752;' },
  { key: 'ai', label: 'AI 性能', icon: '&#9881;' },
]
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.chart-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  @include dash-card;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid $dash-border;
  flex-shrink: 0;
  padding: 0 12px;
}

.tab-btn {
  padding: 10px 18px;
  font-size: 13px;
  color: $dash-text-secondary;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: $dash-transition-fast;

  .tab-icon { font-size: 14px; }

  &:hover {
    color: $dash-text-primary;
    background: rgba(255, 255, 255, 0.02);
  }

  &.active {
    color: $dash-accent;
    border-bottom-color: $dash-accent;
    font-weight: 600;
  }
}

.tabs-body {
  flex: 1;
  padding: 12px;
  min-height: 0;
  overflow: auto;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: 100%;
  min-height: 240px;
}

// Tab 切换动画
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: $dash-bp-mobile) {
  .chart-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 200px);
  }
  .tab-btn {
    padding: 8px 10px;
    font-size: 12px;
    .tab-icon { display: none; }
  }
}
</style>
