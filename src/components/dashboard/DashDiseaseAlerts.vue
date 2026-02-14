<template>
  <div class="disease-alerts panel">
    <div class="panel-title">
      <span class="icon">&#9888;</span>
      病害预警
      <span class="badge" v-if="alerts.length">{{ alerts.length }}</span>
    </div>

    <div class="alert-list" ref="listEl">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        :class="'level-' + alert.level"
        @click="locateAlert(alert)"
      >
        <div class="alert-level">
          <span class="level-dot"></span>
        </div>
        <div class="alert-body">
          <div class="alert-name">{{ alert.disease }}</div>
          <div class="alert-meta">
            <span>{{ alert.location }}</span>
            <span>{{ alert.area }}亩</span>
            <span>{{ alert.time }}</span>
          </div>
        </div>
        <div class="alert-trend" :class="alert.trend">
          {{ alert.trend === 'up' ? '&#9650;' : alert.trend === 'down' ? '&#9660;' : '&#9644;' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { getDiseaseAlerts } from '@/axios/dashboard'

const store = useDashboardStore()
const alerts = ref([])
const listEl = ref(null)
let scrollTimer = null

const emit = defineEmits(['locate'])

async function loadAlerts() {
  alerts.value = await getDiseaseAlerts(store.regionCode, 20)
}

function locateAlert(alert) {
  // 通过 store 触发地图飞入
  store.setRegion(alert.id.toString(), alert.location)
  emit('locate', { lng: alert.lng, lat: alert.lat })
}

// 自动滚动
function startAutoScroll() {
  if (!listEl.value) return
  scrollTimer = setInterval(() => {
    if (!listEl.value) return
    const el = listEl.value
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      el.scrollTop = 0
    } else {
      el.scrollTop += 1
    }
  }, 50)
}

onMounted(async () => {
  await loadAlerts()
  startAutoScroll()
})

onUnmounted(() => clearInterval(scrollTimer))

watch(() => [store.regionCode, store.dataVersion], loadAlerts)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.panel {
  @include dash-card;
  padding: 12px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: $dash-accent;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;

  .icon { font-size: 12px; }
  .badge {
    margin-left: auto;
    background: $dash-danger;
    color: white;
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 10px;
    font-weight: 600;
  }
}

.alert-list {
  flex: 1;
  overflow-y: auto;
  @include dash-scrollbar;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    // 暂停自动滚动（视觉效果）
    overflow-y: auto;
  }
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: $dash-radius-sm;
  cursor: pointer;
  transition: $dash-transition-fast;

  &:hover {
    background: $dash-bg-elevated;
  }
}

.alert-level {
  flex-shrink: 0;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
}

.level-low .level-dot { background: $dash-accent; }
.level-medium .level-dot { background: $dash-warn; }
.level-high .level-dot { background: #EF4444; }
.level-critical .level-dot { background: $dash-danger; box-shadow: 0 0 8px $dash-danger; animation: pulse-dot 1s infinite; }

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-name {
  font-size: 12px;
  font-weight: 500;
  color: $dash-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: $dash-text-muted;
  margin-top: 2px;
}

.alert-trend {
  font-size: 10px;
  flex-shrink: 0;

  &.up { color: $dash-danger; }
  &.down { color: $dash-accent; }
  &.stable { color: $dash-text-muted; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
