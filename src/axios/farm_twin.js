import request from '@/utils/requests'
import { getFarmDetail } from '@/axios/farm'
import { getDayTemHum } from '@/axios/data'

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

// ====== 从真实农场数据派生孪生布局 ======

/** 根据播种天数和生长阶段计算健康分 */
function calcHealthScore(plot) {
  if (!plot.sowingDate || plot.growthStage === '休耕') return 45
  const days = Math.floor((Date.now() - new Date(plot.sowingDate).getTime()) / 86400000)
  // 播种时间越合理、有阶段记录越多，健康分越高
  const stageCount = plot.stageHistory?.length || 0
  let score = 60 + stageCount * 5
  if (days > 0 && days < 300) score += 10
  return Math.min(100, Math.max(0, score))
}

/** 网格布局算法：根据地块数量自动排列位置 */
function calcPlotPositions(plots) {
  const count = plots.length
  if (count === 0) return []

  const cols = Math.ceil(Math.sqrt(count))
  const spacing = 55 // 地块间距
  const totalWidth = (cols - 1) * spacing
  const startX = -totalWidth / 2

  return plots.map((plot, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const rows = Math.ceil(count / cols)
    const totalDepth = (rows - 1) * spacing
    const startZ = -totalDepth / 2
    return {
      x: startX + col * spacing,
      z: startZ + row * spacing,
    }
  })
}

/** 根据面积推算3D尺寸 */
function calcPlotSize(area) {
  // 1亩 ≈ 667㎡，3D中按比例缩放
  const scale = Math.sqrt(Number(area) || 1) * 12
  return { width: Math.max(20, scale * 1.2), depth: Math.max(16, scale) }
}

/** 从真实 farm 数据构建孪生布局 */
export function buildLayoutFromFarm(farm) {
  if (!farm || !farm.plots) return null

  const plots = farm.plots || []
  const positions = calcPlotPositions(plots)

  // 计算场地总大小
  let maxX = 80,
    maxZ = 60
  const twinPlots = plots.map((plot, i) => {
    const size = calcPlotSize(plot.area)
    const pos = positions[i] || { x: 0, z: 0 }
    maxX = Math.max(maxX, Math.abs(pos.x) + size.width / 2 + 20)
    maxZ = Math.max(maxZ, Math.abs(pos.z) + size.depth / 2 + 20)

    return {
      plotId: plot.id,
      plotName: plot.name || `地块${i + 1}`,
      cropType: plot.cropType || '',
      growthStage: plot.growthStage || '未知',
      healthScore: calcHealthScore(plot),
      position: pos,
      size,
      area: Number(plot.area) || 0,
      soilType: plot.soilType || '',
      sowingDate: plot.sowingDate || '',
      stageHistory: plot.stageHistory || [],
    }
  })

  return {
    farmId: farm.id,
    farmName: farm.name || '我的农场',
    farmLocation: farm.location || '',
    groundSize: { width: maxX * 2, depth: maxZ * 2 },
    plots: twinPlots,
  }
}

// ====== API 接口 ======

export const getTwinLayoutData = async (farmId) => {
  // 优先尝试真实孪生接口
  try {
    const res = await request({ url: `/farm/${farmId}/twin/layout`, method: 'get' })
    if (res && res.code === 200 && res.data) return res.data
  } catch {
    // ignore
  }
  // fallback: 从真实农场数据派生
  try {
    const farm = await getFarmDetail(farmId)
    if (farm) return buildLayoutFromFarm(farm)
  } catch {
    // ignore
  }
  return null
}

export const getTwinIoTData = async (farmId) => {
  // 优先尝试真实IoT接口
  try {
    const res = await request({ url: `/farm/${farmId}/twin/iot`, method: 'get' })
    if (res && res.code === 200 && res.data) return res.data
  } catch {
    // ignore
  }
  // fallback: 生成基于真实天气的传感器数据
  try {
    const farm = await getFarmDetail(farmId)
    if (farm) {
      const weather = await getTwinWeather(farm.location)
      return buildIoTFromWeather(farm, weather)
    }
  } catch {
    // ignore
  }
  return {}
}

/** 获取农场所在地真实天气 */
export const getTwinWeather = async (location) => {
  if (!location) return null
  try {
    const res = await getDayTemHum(location)
    if (res && res.code === 200 && res.data) return res.data
    return null
  } catch {
    return null
  }
}

/** 从天气数据生成各地块的模拟IoT数据 */
function buildIoTFromWeather(farm, weather) {
  const plots = farm.plots || []
  const temp = weather?.temperature ?? 22
  const hum = weather?.humidity ?? 65
  const result = {}

  plots.forEach((plot) => {
    result[plot.id] = {
      plotId: plot.id,
      sensors: {
        temperature: {
          value: temp + (Math.random() - 0.5) * 2,
          unit: '°C',
          min: -10,
          max: 45,
          label: '气温',
        },
        humidity: {
          value: hum + (Math.random() - 0.5) * 5,
          unit: '%',
          min: 0,
          max: 100,
          label: '湿度',
        },
        light: {
          value: Math.round(25000 + Math.random() * 15000),
          unit: 'lux',
          min: 0,
          max: 80000,
          label: '光照',
        },
        soilMoisture: {
          value: Math.round(30 + Math.random() * 30),
          unit: '%',
          min: 0,
          max: 100,
          label: '土壤水分',
        },
        soilFertility: {
          value: Math.round(50 + Math.random() * 30),
          unit: '',
          min: 0,
          max: 100,
          label: '土壤肥力',
        },
      },
    }
  })

  return result
}
