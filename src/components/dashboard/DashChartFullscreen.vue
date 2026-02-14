<template>
  <teleport to="body">
    <transition name="fs-fade">
      <div class="fullscreen-overlay" v-if="store.fullscreenChart" @click.self="close">
        <div class="fullscreen-panel">
          <div class="fs-header">
            <h3 class="fs-title">{{ store.fullscreenChart.title }}</h3>
            <button class="fs-close" @click="close">&times;</button>
          </div>
          <div ref="fsChartEl" class="fs-chart"></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useChart } from '@/composables/useChart'

const store = useDashboardStore()
const fsChartEl = ref(null)
const { setOption, resize } = useChart(fsChartEl)

function close() {
  store.fullscreenChart = null
}

watch(
  () => store.fullscreenChart,
  async (fc) => {
    if (!fc) return
    await nextTick()
    // 使用存储的 renderFn 重新渲染到大画布
    if (fc.renderFn) {
      // renderFn 内部会调自己的 setOption，
      // 但全屏需要用全屏的 chart，所以我们直接触发 resize
      await nextTick()
      resize()
    }
  },
)

// ESC 关闭
function onKey(e) {
  if (e.key === 'Escape' && store.fullscreenChart) close()
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey)
}
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}

.fullscreen-panel {
  width: 90vw;
  height: 80vh;
  max-width: 1200px;
  @include dash-card;
  display: flex;
  flex-direction: column;
  box-shadow: $dash-shadow-lg;
}

.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid $dash-border;
  flex-shrink: 0;
}

.fs-title {
  font-size: 16px;
  font-weight: 600;
  color: $dash-text-primary;
  margin: 0;
}

.fs-close {
  width: 32px;
  height: 32px;
  border-radius: $dash-radius-sm;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $dash-border;
  color: $dash-text-secondary;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $dash-transition-fast;

  &:hover {
    background: rgba($dash-danger, 0.15);
    border-color: $dash-danger;
    color: $dash-danger;
  }
}

.fs-chart {
  flex: 1;
  min-height: 0;
  padding: 12px;
}

.fs-fade-enter-active,
.fs-fade-leave-active {
  transition: opacity 0.25s ease;
}
.fs-fade-enter-from,
.fs-fade-leave-to {
  opacity: 0;
}
</style>
