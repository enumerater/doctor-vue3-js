<template>
  <div class="kpi-card" :style="{ '--kpi-color': color }">
    <div class="kpi-header">
      <span class="kpi-icon" v-html="icon"></span>
      <span class="kpi-label">{{ label }}</span>
    </div>
    <div class="kpi-value">
      <span class="num" ref="numEl">{{ displayValue }}</span>
      <span class="suffix">{{ suffix }}</span>
    </div>
    <div class="kpi-footer">
      <span class="trend" :class="trendDir">
        {{ trendDir === 'up' ? '&#9650;' : '&#9660;' }}
        {{ Math.abs(trend).toFixed(1) }}%
      </span>
      <svg class="sparkline" viewBox="0 0 70 24" v-if="sparkline?.length">
        <polyline
          :points="sparkPoints"
          fill="none"
          :stroke="color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  label: String,
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  icon: { type: String, default: '' },
  color: { type: String, default: '#10B981' },
  trend: { type: Number, default: 0 },
  sparkline: { type: Array, default: () => [] },
})

const displayValue = ref(0)
const numEl = ref(null)

const trendDir = computed(() => (props.trend >= 0 ? 'up' : 'down'))

const sparkPoints = computed(() => {
  if (!props.sparkline?.length) return ''
  const max = Math.max(...props.sparkline)
  const min = Math.min(...props.sparkline)
  const range = max - min || 1
  return props.sparkline
    .map((v, i) => {
      const x = (i / (props.sparkline.length - 1)) * 70
      const y = 22 - ((v - min) / range) * 20
      return `${x},${y}`
    })
    .join(' ')
})

function animateValue(target) {
  const start = displayValue.value
  const diff = target - start
  const duration = 800
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    displayValue.value = Math.round(start + diff * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => animateValue(props.value))
watch(() => props.value, (v) => animateValue(v))
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.kpi-card {
  @include dash-card;
  @include dash-card-hover;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: var(--kpi-color);
    border-radius: 0 2px 2px 0;
  }
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 5px;

  .kpi-icon {
    font-size: 12px;
    color: var(--kpi-color);
  }

  .kpi-label {
    font-size: 11px;
    color: $dash-text-secondary;
  }
}

.kpi-value {
  .num {
    font-size: 22px;
    font-weight: 700;
    color: $dash-text-primary;
    font-variant-numeric: tabular-nums;
  }
  .suffix {
    font-size: 11px;
    color: $dash-text-muted;
    margin-left: 3px;
  }
}

.kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trend {
  font-size: 11px;
  font-weight: 500;

  &.up { color: $dash-accent; }
  &.down { color: $dash-danger; }
}

.sparkline {
  width: 50px;
  height: 18px;
}
</style>
