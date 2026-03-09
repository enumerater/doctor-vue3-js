<template>
  <div class="accumulated-temp-page">
    <ContentHeader title="积温分析与预测" :showBack="true" />

    <div class="content-container" v-if="!loading && currentPlot">
      <!-- 1. Summary Header -->
      <div class="summary-section">
        <div class="plot-info">
          <h2 class="plot-name">{{ currentPlot.name }}</h2>
          <div class="meta-row">
            <el-tag size="small" type="primary" effect="light">{{ currentPlot.cropType }}</el-tag>
            <span class="sowing-date">播种日期: {{ currentPlot.sowingDate || '未设置' }}</span>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <span class="label">累计有效积温</span>
            <div class="value">
              <span class="num">{{ accumulatedTemp?.currentTemp || 0 }}</span>
              <span class="unit">°C·d</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="label">当前生长阶段</span>
            <div class="value">
              <span class="text">{{ currentPlot.growthStage || '生长期' }}</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="label">预计成熟日期</span>
            <div class="value">
              <span class="date">{{ prediction?.predictedMatureDate || '--' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Chart Section -->
      <div class="chart-section">
        <div class="section-header">
          <h3 class="section-title">积温趋势</h3>
          <div class="chart-legend">
            <span class="legend-item"><i class="dot history"></i> 历史数据</span>
            <span class="legend-item"><i class="dot forecast"></i> 预测趋势</span>
          </div>
        </div>
        <div class="chart-container" ref="chartRef"></div>
      </div>

      <!-- 3. Details & Suggestions -->
      <div class="analysis-grid">
        <div class="analysis-card">
          <h4 class="card-title">阶段分析</h4>
          <div class="stage-progress">
            <div class="progress-info">
              <span>距离下一阶段还需</span>
              <span class="remaining">{{ Math.max(0, (accumulatedTemp?.targetTemp || 1000) - (accumulatedTemp?.currentTemp || 0)) }}°C·d</span>
            </div>
            <el-progress 
              :percentage="progressPercentage" 
              :stroke-width="12" 
              :color="customColors"
              striped 
              striped-flow 
            />
          </div>
          <p class="analysis-text">
            根据当前积温累积速度，预计在 <strong>{{ prediction?.predictedNextStageDate || '--' }}</strong> 进入 {{ prediction?.nextStageName || '下一阶段' }}。
          </p>
        </div>

        <div class="analysis-card">
          <h4 class="card-title">农事建议</h4>
          <ul class="suggestion-list">
            <li v-for="(item, index) in suggestions" :key="index">
              <el-icon><Check /></el-icon>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state" v-loading="true"></div>
    <el-empty v-else description="暂无积温数据" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Check } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmStore } from '@/stores/farm'
import { usePredictionStore } from '@/stores/prediction'
import { useChart } from '@/composables/useChart'

const route = useRoute()
const farmStore = useFarmStore()
const predictionStore = usePredictionStore()

const chartRef = ref(null)
const { setOption, resize } = useChart(chartRef)

const farmId = route.params.farmId
const plotId = route.params.plotId

const currentPlot = computed(() => farmStore.currentPlot)
const accumulatedTemp = computed(() => predictionStore.accumulatedTemp)
const prediction = computed(() => predictionStore.prediction)
const loading = computed(() => predictionStore.loading || farmStore.loading)

const progressPercentage = computed(() => {
  if (!accumulatedTemp.value?.targetTemp) return 0
  const p = Math.round((accumulatedTemp.value.currentTemp / accumulatedTemp.value.targetTemp) * 100)
  return Math.min(p, 100)
})

const suggestions = computed(() => {
  if (progressPercentage.value > 80) {
    return [
      '当前积温接近阶段末期，请准备下一阶段的农事活动',
      '加强田间巡查，观察物候期变化',
      '注意预防近期可能出现的突发天气'
    ]
  }
  return [
    '目前生长情况稳定，建议按常规计划进行灌溉',
    '注意监测病虫害，利用晴好天气进行除草',
    '保持土壤湿度在 60%-70% 之间'
  ]
})

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#42b983', percentage: 100 },
]

onMounted(async () => {
  if (!farmStore.currentPlot || farmStore.currentPlot.id !== plotId) {
    await farmStore.fetchPlotDetail(farmId, plotId)
  }
  await Promise.all([
    predictionStore.fetchAccumulatedTemp(plotId),
    predictionStore.fetchAccumulatedTempPrediction(plotId)
  ])
  initChart()
})

const initChart = () => {
  if (!accumulatedTemp.value || !prediction.value) return

  const historyData = accumulatedTemp.value?.records || []
  const forecastData = prediction.value?.predictionRecords || []

  if (historyData.length === 0 && forecastData.length === 0) return

  const dates = [...historyData.map(d => d.date), ...forecastData.map(d => d.date)]
  const historyValues = historyData.map(d => d.accumulated)
  const forecastValues = dates.map((d, i) => {
    if (i < historyData.length - 1) return null
    if (i === historyData.length - 1) return historyValues[i]
    const fIdx = i - historyData.length + 1
    return forecastData[fIdx]?.accumulated || null
  })

  setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 0,
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      textStyle: { color: '#2d3748' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#718096', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '°C·d',
      splitLine: { lineStyle: { type: 'dashed', color: '#edf2f7' } },
      axisLabel: { color: '#718096' }
    },
    series: [
      {
        name: '累计积温(历史)',
        type: 'line',
        data: historyValues,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#42b983' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(66, 185, 131, 0.3)' },
              { offset: 1, color: 'rgba(66, 185, 131, 0)' }
            ]
          }
        }
      },
      {
        name: '累计积温(预测)',
        type: 'line',
        data: forecastValues,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, type: 'dashed', color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ]
          }
        }
      }
    ]
  })
}

watch([accumulatedTemp, prediction], () => {
  initChart()
})
</script>

<style lang="scss" scoped>
.accumulated-temp-page {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  
  @include mobile { padding: 0 16px; }
}

.summary-section {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: $shadow-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;

  @include mobile { flex-direction: column; align-items: flex-start; }
}

.plot-info {
  .plot-name { font-size: 24px; font-weight: 800; color: $text-primary; margin: 0 0 8px 0; }
  .meta-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: $text-tertiary;
  }
}

.stats-grid {
  display: flex;
  gap: 32px;
  
  @include mobile { width: 100%; justify-content: space-between; gap: 12px; }
}

.stat-box {
  .label { font-size: 11px; color: $text-tertiary; display: block; margin-bottom: 4px; }
  .value {
    .num { font-size: 24px; font-weight: 800; color: $primary; }
    .unit { font-size: 12px; color: $text-tertiary; margin-left: 4px; }
    .text, .date { font-size: 18px; font-weight: 700; color: $text-primary; }
  }
}

.chart-section {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 20px;
  margin-bottom: 24px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .section-title { font-size: 16px; font-weight: 700; margin: 0; color: $text-primary; }
  
  .chart-legend {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: $text-secondary;
    
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.history { background: #42b983; }
    .dot.forecast { background: #6366f1; border: 1px dashed #6366f1; background: transparent; }
  }
}

.chart-container {
  height: 350px;
  width: 100%;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @include mobile { grid-template-columns: 1fr; }
}

.analysis-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 20px;
  
  .card-title { font-size: 15px; font-weight: 700; margin: 0 0 16px 0; color: $text-primary; }
}

.stage-progress {
  margin-bottom: 16px;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 10px;
    
    .remaining { color: $primary; font-weight: 700; }
  }
}

.analysis-text {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
  
  strong { color: $text-primary; }
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 12px;
    
    .el-icon { color: $primary; font-weight: 800; }
    &:last-child { margin-bottom: 0; }
  }
}

.loading-state {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
