<template>
  <div class="live-toggle">
    <button
      class="live-btn"
      :class="{ active: store.liveMode }"
      @click="store.toggleLive"
    >
      <span class="live-dot" v-if="store.liveMode"></span>
      LIVE
    </button>
  </div>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
let timer = null

watch(
  () => store.liveMode,
  (on) => {
    clearInterval(timer)
    if (on) {
      timer = setInterval(() => store.refreshData(), 5000)
    }
  },
  { immediate: true },
)

onUnmounted(() => clearInterval(timer))
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.live-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: $dash-radius-sm;
  border: 1px solid $dash-border;
  background: transparent;
  color: $dash-text-secondary;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: $dash-transition;

  &.active {
    background: rgba($dash-danger, 0.15);
    border-color: $dash-danger;
    color: $dash-danger;
  }

  &:hover {
    border-color: $dash-danger;
  }
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $dash-danger;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
</style>
