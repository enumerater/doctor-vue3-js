import { ref, onUnmounted } from 'vue'

/**
 * IoT 传感器数据模拟器
 * 每 5 秒随机微调传感器数值，驱动仪表盘动画
 */
export function useTwinSimulation(iotDataRef, onUpdate) {
  const isRunning = ref(false)
  let timer = null

  function jitter(value, delta, min, max) {
    const next = value + (Math.random() - 0.5) * 2 * delta
    return Math.round(Math.min(max, Math.max(min, next)) * 10) / 10
  }

  function tick() {
    const data = iotDataRef.value
    if (!data) return

    const updated = {}
    for (const [plotId, plotIot] of Object.entries(data)) {
      const sensors = { ...plotIot.sensors }
      const s = sensors
      if (s.temperature) s.temperature = { ...s.temperature, value: jitter(s.temperature.value, 1.5, s.temperature.min, s.temperature.max) }
      if (s.humidity) s.humidity = { ...s.humidity, value: jitter(s.humidity.value, 3, s.humidity.min, s.humidity.max) }
      if (s.light) s.light = { ...s.light, value: Math.round(jitter(s.light.value, 2000, s.light.min, s.light.max)) }
      if (s.soilMoisture) s.soilMoisture = { ...s.soilMoisture, value: jitter(s.soilMoisture.value, 2, s.soilMoisture.min, s.soilMoisture.max) }
      if (s.soilFertility) s.soilFertility = { ...s.soilFertility, value: jitter(s.soilFertility.value, 1, s.soilFertility.min, s.soilFertility.max) }
      updated[plotId] = { ...plotIot, sensors }
    }

    if (onUpdate) onUpdate(updated)
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    timer = setInterval(tick, 5000)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  onUnmounted(stop)

  return { start, stop, isRunning }
}
