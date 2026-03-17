<template>
  <div class="twin-weather-card" v-if="weather">
    <div class="weather-icon">{{ weatherIcon }}</div>
    <div class="weather-info">
      <div class="weather-row">
        <span class="weather-label">温度</span>
        <span class="weather-value">{{ temperature }}°C</span>
      </div>
      <div class="weather-row">
        <span class="weather-label">湿度</span>
        <span class="weather-value">{{ humidity }}%</span>
      </div>
    </div>
    <div class="weather-location" v-if="location">{{ location }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: { type: Object, default: null },
  location: { type: String, default: '' },
})

const temperature = computed(() => {
  const t = props.weather?.temperature ?? props.weather?.tem
  return t != null ? Math.round(t * 10) / 10 : '--'
})

const humidity = computed(() => {
  const h = props.weather?.humidity ?? props.weather?.hum
  return h != null ? Math.round(h) : '--'
})

const weatherIcon = computed(() => {
  const t = Number(temperature.value)
  if (isNaN(t)) return '🌤️'
  if (t >= 30) return '☀️'
  if (t >= 20) return '🌤️'
  if (t >= 10) return '⛅'
  if (t >= 0) return '🌥️'
  return '❄️'
})
</script>

<style lang="scss" scoped>
.twin-weather-card {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 10;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}

.weather-icon {
  font-size: 28px;
  line-height: 1;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weather-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-label {
  font-size: 11px;
  color: #999;
  min-width: 24px;
}

.weather-value {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.weather-location {
  font-size: 10px;
  color: #bbb;
  position: absolute;
  bottom: 4px;
  right: 10px;
}
</style>
