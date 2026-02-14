<template>
  <div class="map-view">
    <div ref="mapContainer" class="map-container"></div>

    <!-- 地图工具栏 -->
    <div class="map-toolbar">
      <button
        class="tool-btn"
        :class="{ active: showHeatmap }"
        @click="toggleHeatmap"
        title="热力图"
      >
        &#9632;
      </button>
      <button
        class="tool-btn"
        :class="{ active: store.weatherLayer }"
        @click="store.weatherLayer = !store.weatherLayer"
        title="天气图层"
      >
        &#9788;
      </button>
      <button class="tool-btn" @click="resetView" title="重置视角">
        &#8962;
      </button>
    </div>

    <!-- 地图图例 -->
    <div class="map-legend">
      <span class="legend-item"><i class="dot" style="background:#F43F5E"></i>病害</span>
      <span class="legend-item"><i class="dot" style="background:#10B981"></i>作物</span>
      <span class="legend-item"><i class="dot" style="background:#06B6D4"></i>气象</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAMap } from '@/composables/useAMap'
import { getMapMarkers, getHeatmapData } from '@/axios/dashboard'
import { generateRegionTree } from '@/utils/dashboardMockData'

const store = useDashboardStore()
const mapContainer = ref(null)
const showHeatmap = ref(false)

const { map, load, flyTo, addMarkers, addHeatmap, removeHeatmap } = useAMap()

onMounted(async () => {
  await load(mapContainer.value, { zoom: 5, center: [104.06, 34.75] })
  await loadMarkers()
})

async function loadMarkers() {
  const markers = await getMapMarkers(store.regionCode, null, store.selectedCrops)
  addMarkers(markers)
}

async function toggleHeatmap() {
  showHeatmap.value = !showHeatmap.value
  if (showHeatmap.value) {
    const data = await getHeatmapData()
    addHeatmap(data)
  } else {
    removeHeatmap()
  }
}

function resetView() {
  flyTo([104.06, 34.75], 5)
  store.resetRegion()
}

// 监听地区变化 → 飞入 + 重新加载标记
watch(
  () => store.regionCode,
  async (code) => {
    const regionTree = generateRegionTree()
    const node = findNodeInTree(regionTree, code)
    if (node?.center) {
      const zoom = code === '100000' ? 5 : code.endsWith('0000') ? 7 : code.endsWith('00') ? 10 : 13
      flyTo(node.center, zoom)
    }
    await loadMarkers()
  },
)

// 监听作物筛选
watch(
  () => store.selectedCrops,
  () => loadMarkers(),
  { deep: true },
)

function findNodeInTree(nodes, code) {
  for (const n of nodes) {
    if (n.code === code) return n
    if (n.children) {
      const r = findNodeInTree(n.children, code)
      if (r) return r
    }
  }
  return null
}
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.map-view {
  flex: 1;
  position: relative;
  @include dash-card;
  overflow: hidden;
  min-height: 0;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10;
}

.tool-btn {
  width: 34px;
  height: 34px;
  border-radius: $dash-radius-sm;
  @include dash-glass;
  color: $dash-text-secondary;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $dash-transition;

  &:hover {
    color: $dash-accent;
    border-color: $dash-accent;
  }

  &.active {
    background: rgba($dash-accent, 0.2);
    color: $dash-accent;
    border-color: $dash-accent;
  }
}

.map-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 12px;
  padding: 6px 12px;
  @include dash-glass;
  border-radius: $dash-radius-sm;
  font-size: 11px;
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: $dash-text-secondary;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
</style>
