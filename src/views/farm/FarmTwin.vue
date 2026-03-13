<template>
  <div class="farm-twin-page">
    <!-- 3D 场景 -->
    <TwinScene
      ref="sceneRef"
      :layout-data="store.layoutData"
      :iot-data="store.iotData"
      :selected-plot-id="store.selectedPlotId"
      @plot-click="onPlotClick"
    />

    <!-- 浮动 UI 层 -->
    <TwinOverviewBar :kpis="store.farmKPIs" />
    <TwinLegend />

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回</span>
    </button>

    <!-- 详情面板 -->
    <TwinPlotPanel
      :plot="store.selectedPlot"
      @close="store.selectPlot(null)"
    />

    <!-- Loading -->
    <div v-if="store.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载农场数据...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useFarmTwinStore } from '@/stores/farm_twin'
import { useTwinSimulation } from '@/composables/useTwinSimulation'
import TwinScene from '@/components/twin/TwinScene.vue'
import TwinOverviewBar from '@/components/twin/TwinOverviewBar.vue'
import TwinLegend from '@/components/twin/TwinLegend.vue'
import TwinPlotPanel from '@/components/twin/TwinPlotPanel.vue'
import { toRef } from 'vue'

const store = useFarmTwinStore()
const router = useRouter()
const sceneRef = ref(null)

// IoT 模拟器
const { start: startSim, stop: stopSim } = useTwinSimulation(
  toRef(store, 'iotData'),
  (updated) => store.updateIoTData(updated),
)

function onPlotClick(plotId) {
  store.selectPlot(plotId)
  if (plotId && sceneRef.value) {
    sceneRef.value.focusPlot(plotId)
  }
}

function goBack() {
  router.push({ name: 'farm' })
}

onMounted(async () => {
  await store.fetchTwinData('farm001')
  startSim()
})

onUnmounted(() => {
  stopSim()
})
</script>

<style lang="scss" scoped>
.farm-twin-page {
  position: relative;
  width: 100%;
  height: calc(100vh - $header-height);
  overflow: hidden;
  background: #e8f5e9;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba($border, 0.6);
  border-radius: $radius-sm;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  box-shadow: $shadow-sm;
  transition: $transition-fast;

  &:hover {
    background: white;
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
}

.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: $text-secondary;
  font-size: 14px;
  font-weight: 600;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid $border;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
