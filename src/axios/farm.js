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

// ====== Mock 数据 ======
let mockFarms = [
  {
    id: 'farm001',
    name: '国强家庭农场',
    location: '山东省寿光市',
    area: 8,
    plotCount: 2,
    plots: [
      {
        id: 'plot001',
        name: '东地小麦田',
        cropType: '小麦',
        area: 5,
        sowingDate: '2025-10-15',
        soilType: '壤土',
        growthStage: '拔节期',
        stageHistory: [
          { stage: '播种', date: '2025-10-15' },
          { stage: '出苗期', date: '2025-10-28' },
          { stage: '分蘖期', date: '2025-11-20' },
          { stage: '拔节期', date: '2026-02-10' },
        ],
      },
      {
        id: 'plot002',
        name: '西地玉米田',
        cropType: '玉米',
        area: 3,
        sowingDate: '2025-06-10',
        soilType: '砂壤土',
        growthStage: '休耕',
        stageHistory: [],
      },
    ],
  },
]

let mockIdCounter = 100

function generateId(prefix) {
  mockIdCounter++
  return `${prefix}${mockIdCounter}`
}

// ====== API 接口 ======

export const getFarms = () =>
  safeRequest({ url: '/farm/list', method: 'get' }, () => mockFarms)

export const createFarm = (data) =>
  safeRequest(
    { url: '/farm', method: 'post', data },
    () => {
      const farm = {
        id: generateId('farm'),
        ...data,
        plotCount: 0,
        plots: [],
      }
      mockFarms.push(farm)
      return farm
    },
  )

export const getFarmDetail = (farmId) =>
  safeRequest(
    { url: `/farm/${farmId}`, method: 'get' },
    () => mockFarms.find((f) => f.id === farmId) || null,
  )

export const updateFarm = (farmId, data) =>
  safeRequest(
    { url: `/farm/${farmId}`, method: 'put', data },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (farm) Object.assign(farm, data)
      return farm
    },
  )

export const deleteFarm = (farmId) =>
  safeRequest(
    { url: `/farm/${farmId}`, method: 'delete' },
    () => {
      mockFarms = mockFarms.filter((f) => f.id !== farmId)
      return true
    },
  )

export const createPlot = (farmId, data) =>
  safeRequest(
    { url: `/farm/${farmId}/plot`, method: 'post', data },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (!farm) return null
      const plot = {
        id: generateId('plot'),
        ...data,
        growthStage: '播种',
        stageHistory: [{ stage: '播种', date: data.sowingDate || new Date().toISOString().slice(0, 10) }],
      }
      farm.plots.push(plot)
      farm.plotCount = farm.plots.length
      return plot
    },
  )

export const getPlotDetail = (farmId, plotId) =>
  safeRequest(
    { url: `/farm/${farmId}/plot/${plotId}`, method: 'get' },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (!farm) return null
      return farm.plots.find((p) => p.id === plotId) || null
    },
  )

export const updatePlot = (farmId, plotId, data) =>
  safeRequest(
    { url: `/farm/${farmId}/plot/${plotId}`, method: 'put', data },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (!farm) return null
      const plot = farm.plots.find((p) => p.id === plotId)
      if (plot) Object.assign(plot, data)
      return plot
    },
  )

export const deletePlot = (farmId, plotId) =>
  safeRequest(
    { url: `/farm/${farmId}/plot/${plotId}`, method: 'delete' },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (!farm) return false
      farm.plots = farm.plots.filter((p) => p.id !== plotId)
      farm.plotCount = farm.plots.length
      return true
    },
  )

export const updateGrowthStage = (farmId, plotId, data) =>
  safeRequest(
    { url: `/farm/${farmId}/plot/${plotId}/stage`, method: 'put', data },
    () => {
      const farm = mockFarms.find((f) => f.id === farmId)
      if (!farm) return null
      const plot = farm.plots.find((p) => p.id === plotId)
      if (plot) {
        plot.growthStage = data.stage
        plot.stageHistory.push({ stage: data.stage, date: data.date || new Date().toISOString().slice(0, 10) })
      }
      return plot
    },
  )
