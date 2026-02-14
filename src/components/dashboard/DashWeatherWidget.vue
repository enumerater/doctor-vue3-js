<template>
  <div class="weather-widget panel">
    <div class="panel-title">
      <span class="icon">&#9788;</span>
      天气概况
    </div>

    <div class="weather-current" v-if="weather.current">
      <div class="current-main">
        <span class="weather-icon">{{ weatherEmoji(weather.current.icon) }}</span>
        <span class="temp">{{ weather.current.temp }}°C</span>
      </div>
      <div class="current-detail">
        <span>{{ weather.current.weather }}</span>
        <span>湿度 {{ weather.current.humidity }}%</span>
        <span>{{ weather.current.wind }}</span>
        <span :class="'aqi-' + aqiLevel(weather.current.aqi)">
          AQI {{ weather.current.aqi }}
        </span>
      </div>
    </div>

    <div class="forecast-row" v-if="weather.forecast">
      <div
        v-for="day in weather.forecast"
        :key="day.date"
        class="forecast-day"
      >
        <span class="fc-date">{{ day.date }}</span>
        <span class="fc-icon">{{ weatherEmoji(day.icon) }}</span>
        <span class="fc-temp">{{ day.low }}~{{ day.high }}°</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { getWeatherData } from '@/axios/dashboard'

const store = useDashboardStore()
const weather = ref({ current: null, forecast: [] })

const iconMap = {
  sunny: '&#9728;&#65039;',
  cloudy: '&#9925;',
  overcast: '&#9729;&#65039;',
  rain: '&#127783;&#65039;',
  snow: '&#10052;&#65039;',
  fog: '&#127787;&#65039;',
}

function weatherEmoji(icon) {
  return iconMap[icon] || '&#9728;&#65039;'
}

function aqiLevel(aqi) {
  if (aqi <= 50) return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 150) return 'unhealthy'
  return 'bad'
}

async function loadWeather() {
  weather.value = await getWeatherData(store.regionCode, store.timeRange)
}

onMounted(loadWeather)
watch(() => store.regionCode, loadWeather)
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.panel {
  @include dash-card;
  padding: 12px;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: $dash-accent;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;

  .icon { font-size: 14px; }
}

.weather-current {
  margin-bottom: 10px;
}

.current-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;

  .weather-icon { font-size: 28px; }
  .temp {
    font-size: 26px;
    font-weight: 700;
    color: $dash-text-primary;
  }
}

.current-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: $dash-text-secondary;
}

.aqi-good { color: $dash-accent; }
.aqi-moderate { color: $dash-warn; }
.aqi-unhealthy { color: #EF4444; }
.aqi-bad { color: $dash-danger; }

.forecast-row {
  display: flex;
  gap: 4px;
}

.forecast-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 2px;
  border-radius: $dash-radius-sm;
  background: rgba(255, 255, 255, 0.02);

  .fc-date {
    font-size: 10px;
    color: $dash-text-muted;
  }
  .fc-icon { font-size: 16px; }
  .fc-temp {
    font-size: 10px;
    color: $dash-text-secondary;
  }
}
</style>
