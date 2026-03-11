<template>
  <div class="admin-logs">
    <div class="header-section">
      <h2 class="page-title">定时任务日志</h2>
      <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
    </div>

    <!-- 图表展示区 -->
    <div class="charts-grid">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>处理趋势统计</span>
            <el-radio-group v-model="trendDays" size="small" @change="fetchTrend">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="14">14天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>任务执行状态分布</span>
          </div>
        </template>
        <div ref="statusChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 日志列表 -->
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>详细运行日志</span>
          <div class="filter-group">
            <el-select v-model="filters.status" placeholder="状态过滤" clearable @change="handleFilter">
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
            </el-select>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleFilter"
            />
          </div>
        </div>
      </template>

      <el-table :data="store.logs" v-loading="store.loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="sessionId" label="会话ID" width="120" show-overflow-tooltip />
        <el-table-column prop="processedAt" label="处理时间" width="180" align="center" />
        <el-table-column prop="memoryCount" label="记忆数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.memoryCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'">
              {{ row.status === 'SUCCESS' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" show-overflow-tooltip />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="store.logsTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()

const trendChartRef = ref(null)
const statusChartRef = ref(null)
let trendChart = null
let statusChart = null

const page = ref(1)
const size = ref(10)
const trendDays = ref(7)
const filters = reactive({
  status: '',
  dateRange: [],
})

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
  }
}

const updateTrendChart = () => {
  if (!trendChart) return
  const data = store.logTrendStats
  const dates = data.map(i => i.date)
  const logCounts = data.map(i => i.logCount)
  const memoryCounts = data.map(i => i.totalMemoryCount)

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['任务次数', '提取记忆数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: '任务次数',
        type: 'line',
        smooth: true,
        data: logCounts,
        itemStyle: { color: '#409EFF' },
        areaStyle: { opacity: 0.1 }
      },
      {
        name: '提取记忆数',
        type: 'line',
        smooth: true,
        data: memoryCounts,
        itemStyle: { color: '#67C23A' },
        areaStyle: { opacity: 0.1 }
      }
    ]
  })
}

const updateStatusChart = () => {
  if (!statusChart) return
  const data = store.logStatusStats
  const chartData = [
    { value: data.SUCCESS || 0, name: '成功' },
    { value: data.FAILED || 0, name: '失败' }
  ]

  statusChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '执行状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: chartData,
        color: ['#67C23A', '#F56C6C']
      }
    ]
  })
}

const fetchLogs = async () => {
  const params = {
    page: page.value,
    size: size.value,
    status: filters.status || undefined,
    startTime: filters.dateRange?.[0] || undefined,
    endTime: filters.dateRange?.[1] || undefined
  }
  await store.fetchLogPage(params)
}

const fetchTrend = async () => {
  await store.fetchLogTrendStats({ days: trendDays.value })
  updateTrendChart()
}

const fetchStatus = async () => {
  await store.fetchLogStatusStats()
  updateStatusChart()
}

const refreshData = async () => {
  await Promise.all([fetchLogs(), fetchTrend(), fetchStatus()])
}

const handleFilter = () => {
  page.value = 1
  fetchLogs()
}

const handlePageChange = (val) => {
  page.value = val
  fetchLogs()
}

const handleSizeChange = (val) => {
  size.value = val
  page.value = 1
  fetchLogs()
}

const handleResize = () => {
  trendChart?.resize()
  statusChart?.resize()
}

onMounted(async () => {
  initCharts()
  window.addEventListener('resize', handleResize)
  await refreshData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  statusChart?.dispose()
})

watch(() => store.logTrendStats, updateTrendChart)
watch(() => store.logStatusStats, updateStatusChart)
</script>

<style lang="scss" scoped>
.admin-logs {
  padding-bottom: 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.chart-container {
  height: 320px;
}

.list-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .filter-group {
      display: flex;
      gap: 12px;
      
      @include mobile {
        flex-direction: column;
        width: 100%;
      }
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
