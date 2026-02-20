<template>
  <header class="dash-header">
    <div class="header-left">
      <button class="btn-back" @click="goBack" title="返回首页">
        <span class="icon-arrow">&larr;</span>
        <span class="btn-text">返回</span>
      </button>
      <h1 class="header-title">
        <span class="title-icon">&#9670;</span>
        农业数据智慧平台
      </h1>
    </div>

    <div class="header-center">
      <DashTimeRange />
      <DashLiveToggle />
    </div>

    <div class="header-right">
      <DashExportMenu />
      <div class="header-clock">{{ clock }}</div>
      <div class="header-status">
        <span class="status-dot"></span>
        <span>系统运行中</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DashTimeRange from './DashTimeRange.vue'
import DashLiveToggle from './DashLiveToggle.vue'
import DashExportMenu from './DashExportMenu.vue'

const router = useRouter()
const clock = ref('')
let timer = null

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

function goBack() {
  router.push({ name: 'workbench' })
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.dash-header {
  height: $dash-header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  @include dash-glass;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid $dash-border;
  flex-shrink: 0;
  gap: 12px;
  position: relative;
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba($dash-accent, 0.12);
  border: 1px solid rgba($dash-accent, 0.25);
  border-radius: $dash-radius-sm;
  color: $dash-accent;
  font-size: 13px;
  cursor: pointer;
  transition: $dash-transition;

  .icon-arrow {
    font-size: 15px;
    font-weight: bold;
  }

  &:hover {
    background: rgba($dash-accent, 0.2);
    transform: translateX(-2px);
  }
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
  white-space: nowrap;
  background: linear-gradient(135deg, $dash-accent, $dash-accent-secondary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  .title-icon {
    margin-right: 6px;
  }
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.header-clock {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: $dash-text-secondary;
  white-space: nowrap;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $dash-accent;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $dash-accent;
  box-shadow: 0 0 8px $dash-accent;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media screen and (max-width: $dash-bp-mobile) {
  .dash-header {
    height: auto;
    padding: 8px 10px;
    flex-wrap: wrap;
    gap: 6px;
  }
  .header-title {
    font-size: 14px;
    .title-icon { display: none; }
  }
  .header-center { order: 3; width: 100%; justify-content: flex-start; }
  .btn-text { display: none; }
  .header-clock { display: none; }
}
</style>
