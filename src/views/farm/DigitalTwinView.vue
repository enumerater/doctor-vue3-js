<script setup>
import { ref, onMounted } from 'vue';
import Farm3DScene from '@/components/farm/Farm3DScene.vue';
import { Pointer, Close, InfoFilled, Histogram, Management } from '@element-plus/icons-vue';

// 模拟数据 (在实际项目中可以从 store 或 API 获取)
const plotsData = ref([
  { id: 1, name: '1号-水稻区', status: 'healthy', crop: '水稻', temp: '24.5℃', humidity: '65%', npk: '12-8-10', lastCheck: '2024-03-12' },
  { id: 2, name: '2号-试验田', status: 'warning', crop: '小麦', temp: '26.2℃', humidity: '42%', npk: '10-6-8', lastCheck: '2024-03-11' },
  { id: 3, name: '3号-果园', status: 'danger', crop: '苹果', temp: '31.0℃', humidity: '18%', npk: '15-10-12', lastCheck: '2024-03-13' },
  { id: 4, name: '4号-大棚A', status: 'healthy', crop: '番茄', temp: '22.8℃', humidity: '72%', npk: '8-8-8', lastCheck: '2024-03-12' },
  { id: 5, name: '5号-大棚B', status: 'normal', crop: '草莓', temp: '21.5℃', humidity: '68%', npk: '9-9-9', lastCheck: '2024-03-10' },
  { id: 6, name: '6号-新品种', status: 'healthy', crop: '玉米', temp: '25.0℃', humidity: '60%', npk: '11-7-9', lastCheck: '2024-03-12' },
]);

const selectedPlot = ref(null);
const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

const handlePlotSelect = (plot) => {
  selectedPlot.value = plot;
};

const getStatusType = (status) => {
  switch (status) {
    case 'healthy': return 'success';
    case 'warning': return 'warning';
    case 'danger': return 'danger';
    default: return 'info';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'healthy': return '生长旺盛';
    case 'warning': return '水分不足';
    case 'danger': return '高温预警';
    default: return '待分析';
  }
};

const getStatusColor = (status) => {
  const colors = { healthy: '#2ecc71', warning: '#f1c40f', danger: '#e74c3c', normal: '#3498db' };
  return colors[status] || '#95a5a6';
};
</script>

<template>
  <div class="digital-twin-container" v-loading="loading" element-loading-background="rgba(10, 25, 47, 0.9)">
    <!-- 顶部标题与统计 -->
    <header class="twin-header">
      <div class="title-section">
        <el-icon class="title-icon"><Management /></el-icon>
        <h1>数字孪生农场指挥中心</h1>
        <el-tag effect="plain" type="info" round class="ml-2">Live 实时监视</el-tag>
      </div>
      
      <div class="stats-overview">
        <div class="stat-item">
          <span class="label">监控地块</span>
          <span class="value">06</span>
        </div>
        <div class="stat-item">
          <span class="label">平均健康度</span>
          <span class="value success">94.2%</span>
        </div>
        <div class="stat-item">
          <span class="label">预警提醒</span>
          <span class="value warning">02</span>
        </div>
      </div>
    </header>

    <div class="main-content">
      <!-- 3D 场景区域 -->
      <div class="scene-wrapper">
        <Farm3DScene :plots="plotsData" @select-plot="handlePlotSelect" />
      </div>

      <!-- 右侧详细面板 -->
      <transition name="panel-slide">
        <div v-if="selectedPlot" class="detail-panel">
          <div class="panel-header">
            <div class="title">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ selectedPlot.name }} 详情</span>
            </div>
            <el-button link icon="Close" @click="selectedPlot = null" />
          </div>

          <div class="panel-body">
            <div class="status-card">
              <div class="crop-info">
                <span class="crop-name">{{ selectedPlot.crop }}</span>
                <el-tag :type="getStatusType(selectedPlot.status)" size="small">
                  {{ getStatusText(selectedPlot.status) }}
                </el-tag>
              </div>
              <p class="last-check">最后巡检: {{ selectedPlot.lastCheck }}</p>
            </div>

            <div class="data-grid">
              <div class="data-item">
                <span class="label">温度</span>
                <span class="val">{{ selectedPlot.temp }}</span>
              </div>
              <div class="data-item">
                <span class="label">湿度</span>
                <span class="val">{{ selectedPlot.humidity }}</span>
              </div>
              <div class="data-item">
                <span class="label">氮磷钾</span>
                <span class="val">{{ selectedPlot.npk }}</span>
              </div>
            </div>

            <div class="chart-section">
              <div class="section-title">
                <el-icon><Histogram /></el-icon>
                <span>最近24小时环境趋势</span>
              </div>
              <div class="mock-chart">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 85%"></div>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="primary" plain class="w-full">历史记录</el-button>
              <el-button type="success" class="w-full">远程补水</el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 左侧悬浮层 (地块列表快速选择) -->
    <div class="plots-overlay">
      <div class="overlay-title">地块列表</div>
      <div 
        v-for="plot in plotsData" 
        :key="plot.id" 
        class="plot-card"
        :class="{ active: selectedPlot?.id === plot.id }"
        @click="handlePlotSelect(plot)"
      >
        <span class="dot" :style="{ background: getStatusColor(plot.status) }"></span>
        <span class="name">{{ plot.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.digital-twin-container {
  width: 100%;
  height: calc(100vh - 120px);
  background: #050a14;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.twin-header {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  background: linear-gradient(to bottom, rgba(10, 25, 47, 0.9), transparent);
  border-bottom: 1px solid rgba(0, 255, 204, 0.1);
  z-index: 100;

  .title-section {
    display: flex;
    align-items: center;
    gap: 15px;
    h1 {
      font-size: 22px;
      color: #00ffcc;
      margin: 0;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
    }
    .title-icon {
      font-size: 24px;
      color: #00ffcc;
    }
  }

  .stats-overview {
    display: flex;
    gap: 40px;
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      .label { font-size: 12px; color: #8892b0; margin-bottom: 4px; }
      .value { 
        font-size: 20px; 
        color: #fff; 
        font-weight: bold; 
        &.success { color: #2ecc71; }
        &.warning { color: #f1c40f; }
      }
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.scene-wrapper {
  flex: 1;
  height: 100%;
  padding: 10px;
}

.detail-panel {
  width: 380px;
  background: rgba(10, 25, 47, 0.9);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(0, 255, 204, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.6);

  .panel-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #00ffcc;
      font-weight: bold;
    }
  }

  .panel-body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;

    .status-card {
      background: rgba(255, 255, 255, 0.03);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      .crop-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .crop-name { font-size: 18px; font-weight: bold; color: #fff; }
      }
      .last-check { font-size: 12px; color: #8892b0; margin: 0; }
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 25px;
      .data-item {
        background: rgba(0, 255, 204, 0.05);
        padding: 12px 8px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid rgba(0, 255, 204, 0.1);
        .label { display: block; font-size: 11px; color: #8892b0; margin-bottom: 5px; }
        .val { display: block; font-size: 16px; color: #00ffcc; font-weight: bold; }
      }
    }

    .chart-section {
      margin-bottom: 25px;
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #ccd6f6;
        margin-bottom: 15px;
      }
      .mock-chart {
        height: 100px;
        display: flex;
        align-items: flex-end;
        gap: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        .bar {
          flex: 1;
          background: linear-gradient(to top, #3498db, #00ffcc);
          border-radius: 4px 4px 0 0;
          opacity: 0.6;
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}

.plots-overlay {
  position: absolute;
  top: 100px;
  left: 30px;
  width: 180px;
  background: rgba(10, 25, 47, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px;
  z-index: 5;

  .overlay-title {
    font-size: 13px;
    color: #8892b0;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .plot-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
    &:hover { background: rgba(0, 255, 204, 0.1); }
    &.active { background: rgba(0, 255, 204, 0.2); border: 1px solid rgba(0, 255, 204, 0.3); }
    
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .name { font-size: 13px; color: #ccd6f6; }
  }
}

.panel-slide-enter-active, .panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.panel-slide-enter-from, .panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.w-full { width: 100%; margin-left: 0 !important; }
.ml-2 { margin-left: 8px; }
</style>
