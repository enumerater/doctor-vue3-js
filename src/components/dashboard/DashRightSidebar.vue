<template>
  <div class="right-sidebar">
    <!-- KPI 卡片区 -->
    <div class="kpi-grid">
      <DashKpiCard
        v-for="kpi in kpiList"
        :key="kpi.key"
        :label="kpi.label"
        :value="kpi.value"
        :suffix="kpi.suffix"
        :icon="kpi.icon"
        :color="kpi.color"
        :trend="kpi.trend"
        :sparkline="kpi.sparkline"
      />
    </div>

    <!-- 病害预警 -->
    <DashDiseaseAlerts />

    <!-- 天气小组件 -->
    <DashWeatherWidget />

    <!-- AI 模型状态 -->
    <div class="ai-status panel">
      <div class="panel-title">
        <span class="icon">&#9881;</span>
        AI 模型状态
      </div>
      <div class="ai-info">
        <div class="ai-row">
          <span class="ai-label">模型版本</span>
          <span class="ai-val">{{ aiData.modelVersion }}</span>
        </div>
        <div class="ai-row">
          <span class="ai-label">识别准确率</span>
          <span class="ai-val accent">{{ aiData.accuracy }}%</span>
        </div>
        <div class="ai-row">
          <span class="ai-label">平均响应</span>
          <span class="ai-val">{{ aiData.avgResponseTime }}ms</span>
        </div>
        <div class="ai-row">
          <span class="ai-label">总推理数</span>
          <span class="ai-val">{{ formatNum(aiData.totalInferences) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { getRegionSummary, getAiPerformance } from '@/axios/dashboard'
import DashKpiCard from './DashKpiCard.vue'
import DashDiseaseAlerts from './DashDiseaseAlerts.vue'
import DashWeatherWidget from './DashWeatherWidget.vue'

const store = useDashboardStore()

const kpiList = ref([])
const aiData = ref({ modelVersion: '-', accuracy: 0, avgResponseTime: 0, totalInferences: 0 })

function formatNum(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function buildKpiList(data) {
  kpiList.value = [
    { key: 'total', label: '总诊断数', value: data.totalDiagnosis, suffix: '次', icon: '&#9733;', color: '#10B981', trend: 12.5, sparkline: randomSparkline() },
    { key: 'today', label: '今日诊断', value: data.todayDiagnosis, suffix: '次', icon: '&#9752;', color: '#06B6D4', trend: 8.2, sparkline: randomSparkline() },
    { key: 'types', label: '病害种类', value: data.diseaseTypes, suffix: '种', icon: '&#9888;', color: '#F59E0B', trend: -2.1, sparkline: randomSparkline() },
    { key: 'stations', label: '监测站点', value: data.monitorStations, suffix: '个', icon: '&#9678;', color: '#8B5CF6', trend: 5.0, sparkline: randomSparkline() },
    { key: 'accuracy', label: 'AI准确率', value: data.aiAccuracy, suffix: '%', icon: '&#10004;', color: '#3B82F6', trend: 1.3, sparkline: randomSparkline() },
    { key: 'alerts', label: '活跃预警', value: data.alertCount, suffix: '条', icon: '&#9889;', color: '#F43F5E', trend: -5.4, sparkline: randomSparkline() },
  ]
}

function randomSparkline() {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 60 + 20))
}

async function loadData() {
  const [summary, ai] = await Promise.all([
    getRegionSummary(store.regionCode, store.timeRange),
    getAiPerformance(),
  ])
  buildKpiList(summary)
  aiData.value = ai
}

onMounted(loadData)
watch(() => [store.regionCode, store.timeRange, store.dataVersion], loadData)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: $dash-gap;
  height: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.panel {
  @include dash-card;
  padding: 12px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: $dash-accent;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;

  .icon { font-size: 12px; }
}

.ai-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;

  .ai-label { color: $dash-text-secondary; }
  .ai-val { color: $dash-text-primary; font-weight: 500; }
  .ai-val.accent { color: $dash-accent; }
}

@media screen and (max-width: $dash-bp-mobile) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
    overflow-x: auto;
  }
}
</style>
