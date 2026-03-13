import request from '@/utils/requests'

// ====== safeRequest 封装 ======
async function safeRequest(config, fallbackFn) {
  try {
    const res = await request(config)
    if (res && res.code === 200) return res.data
    return fallbackFn()
  } catch {
    return fallbackFn()
  }
}

// ====== healthScore → 颜色映射 ======
export function healthToColor(score) {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#a3e635'
  if (score >= 40) return '#fbbf24'
  if (score >= 20) return '#fb923c'
  return '#ef4444'
}

export const HEALTH_LEVELS = [
  { label: '优秀', range: '80-100', color: '#4ade80' },
  { label: '良好', range: '60-79', color: '#a3e635' },
  { label: '一般', range: '40-59', color: '#fbbf24' },
  { label: '较差', range: '20-39', color: '#fb923c' },
  { label: '警告', range: '0-19', color: '#ef4444' },
]

// ====== 作物 Emoji 映射 ======
export const CROP_EMOJI = {
  小麦: '🌾',
  水稻: '🌾',
  玉米: '🌽',
  番茄: '🍅',
  黄瓜: '🥒',
  辣椒: '🌶️',
  草莓: '🍓',
  苹果: '🍎',
  葡萄: '🍇',
  白菜: '🥬',
}

// ====== Mock 布局数据 ======
const mockLayoutData = {
  farmId: 'farm001',
  farmName: '国强家庭农场',
  groundSize: { width: 160, depth: 120 },
  plots: [
    {
      plotId: 'plot001',
      plotName: '东地小麦田',
      cropType: '小麦',
      growthStage: '拔节期',
      healthScore: 82,
      position: { x: 30, z: 0 },
      size: { width: 50, depth: 40 },
      area: 5,
      soilType: '壤土',
      sowingDate: '2025-10-15',
    },
    {
      plotId: 'plot002',
      plotName: '西地玉米田',
      cropType: '玉米',
      growthStage: '休耕',
      healthScore: 45,
      position: { x: -30, z: 0 },
      size: { width: 35, depth: 30 },
      area: 3,
      soilType: '砂壤土',
      sowingDate: '2025-06-10',
    },
  ],
}

// ====== Mock IoT 数据 ======
function createMockIoTData() {
  return {
    plot001: {
      plotId: 'plot001',
      sensors: {
        temperature: { value: 22.5, unit: '°C', min: -10, max: 45, label: '气温' },
        humidity: { value: 68, unit: '%', min: 0, max: 100, label: '湿度' },
        light: { value: 32000, unit: 'lux', min: 0, max: 80000, label: '光照' },
        soilMoisture: { value: 42, unit: '%', min: 0, max: 100, label: '土壤水分' },
        soilFertility: { value: 76, unit: '', min: 0, max: 100, label: '土壤肥力' },
      },
    },
    plot002: {
      plotId: 'plot002',
      sensors: {
        temperature: { value: 21.8, unit: '°C', min: -10, max: 45, label: '气温' },
        humidity: { value: 55, unit: '%', min: 0, max: 100, label: '湿度' },
        light: { value: 28000, unit: 'lux', min: 0, max: 80000, label: '光照' },
        soilMoisture: { value: 30, unit: '%', min: 0, max: 100, label: '土壤水分' },
        soilFertility: { value: 52, unit: '', min: 0, max: 100, label: '土壤肥力' },
      },
    },
  }
}

// ====== API 接口 ======

export const getTwinLayoutData = (farmId) =>
  safeRequest(
    { url: `/farm/${farmId}/twin/layout`, method: 'get' },
    () => ({ ...mockLayoutData }),
  )

export const getTwinIoTData = (farmId) =>
  safeRequest(
    { url: `/farm/${farmId}/twin/iot`, method: 'get' },
    () => createMockIoTData(),
  )
