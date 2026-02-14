<template>
  <div class="dash-root">
    <DashHeader />
    <div class="dash-body">
      <!-- 左侧栏 -->
      <aside class="dash-left" :class="{ collapsed: leftCollapsed }">
        <DashRegionSelector />
        <DashCropFilter />
      </aside>

      <!-- 中间主区域 -->
      <main class="dash-center">
        <DashMapView />
      </main>

      <!-- 右侧栏 -->
      <aside class="dash-right">
        <DashRightSidebar />
      </aside>
    </div>

    <!-- 底部图表区 -->
    <div class="dash-bottom">
      <DashChartTabs />
    </div>

    <!-- 全屏图表弹窗 -->
    <DashChartFullscreen />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import DashHeader from '@/components/dashboard/DashHeader.vue'
import DashRegionSelector from '@/components/dashboard/DashRegionSelector.vue'
import DashCropFilter from '@/components/dashboard/DashCropFilter.vue'
import DashMapView from '@/components/dashboard/DashMapView.vue'
import DashRightSidebar from '@/components/dashboard/DashRightSidebar.vue'
import DashChartTabs from '@/components/dashboard/DashChartTabs.vue'
import DashChartFullscreen from '@/components/dashboard/DashChartFullscreen.vue'

const leftCollapsed = ref(false)
provide('leftCollapsed', leftCollapsed)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.dash-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: $dash-bg-base;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.03) 0%, transparent 60%);
  color: $dash-text-primary;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.dash-body {
  flex: 1;
  display: grid;
  grid-template-columns: $dash-left-width 1fr $dash-right-width;
  gap: $dash-gap;
  padding: 0 $dash-gap;
  min-height: 0;
  overflow: hidden;
}

.dash-left {
  display: flex;
  flex-direction: column;
  gap: $dash-gap;
  overflow-y: auto;
  @include dash-scrollbar;
  transition: $dash-transition;

  &.collapsed {
    width: 0;
    overflow: hidden;
    padding: 0;
    gap: 0;
  }
}

.dash-center {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.dash-right {
  overflow-y: auto;
  @include dash-scrollbar;
}

.dash-bottom {
  height: $dash-bottom-height;
  padding: $dash-gap;
  padding-top: 0;
  flex-shrink: 0;
}

// ====== 手机端 ======
@media screen and (max-width: $dash-bp-mobile) {
  .dash-root {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .dash-body {
    grid-template-columns: 1fr;
    padding: 0 8px;
    overflow: visible;
  }

  .dash-left {
    order: 1;
    overflow: visible;
  }

  .dash-center {
    order: 2;
    min-height: 300px;
  }

  .dash-right {
    order: 3;
    overflow: visible;
  }

  .dash-bottom {
    height: auto;
    padding: 8px;
  }
}
</style>
