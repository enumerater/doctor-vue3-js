import request from '@/utils/requests'
import * as mock from '@/utils/dashboardMockData'

// 统一封装：先请求后端，失败则 fallback 到 Mock
async function safeRequest(config, fallbackFn) {
  try {
    const res = await request(config)
    if (res && res.code === 200) return res.data
    return fallbackFn()
  } catch {
    return fallbackFn()
  }
}

// 1. 地区树
export const getRegionTree = () =>
  safeRequest({ url: '/data/dashboard/regions', method: 'get' }, mock.generateRegionTree)

// 2. KPI 汇总
export const getRegionSummary = (regionCode, timeRange) =>
  safeRequest(
    { url: '/data/dashboard/region-summary', method: 'get', params: { regionCode, timeRange } },
    mock.generateKpiData,
  )

// 3. 地图标记点
export const getMapMarkers = (regionCode, types, crops) =>
  safeRequest(
    { url: '/data/dashboard/map-markers', method: 'get', params: { regionCode, types, crops } },
    () => mock.generateMapMarkers(60),
  )

// 4. 病害预警
export const getDiseaseAlerts = (regionCode, limit = 20) =>
  safeRequest(
    { url: '/data/dashboard/disease-alerts', method: 'get', params: { regionCode, limit } },
    () => mock.generateDiseaseAlerts(limit),
  )

// 5. 诊断趋势
export const getDiagnosisTrend = (regionCode, timeRange, crops) =>
  safeRequest(
    {
      url: '/data/dashboard/diagnosis-trend',
      method: 'get',
      params: { regionCode, timeRange, crops },
    },
    () => mock.generateDiagnosisTrend(30),
  )

// 6. 作物分布
export const getCropDistribution = (regionCode) =>
  safeRequest(
    { url: '/data/dashboard/crop-distribution', method: 'get', params: { regionCode } },
    mock.generateCropDistribution,
  )

// 7. 天气
export const getWeatherData = (regionCode, timeRange) =>
  safeRequest(
    { url: '/data/dashboard/weather', method: 'get', params: { regionCode, timeRange } },
    mock.generateWeatherForecast,
  )

// 8. 农产品价格
export const getPriceIndex = (crop, timeRange) =>
  safeRequest(
    { url: '/data/dashboard/price-index', method: 'get', params: { crop, timeRange } },
    () => mock.generatePriceIndex(12),
  )

// 9. 地区对比
export const getRegionCompare = (regionA, regionB, timeRange) =>
  safeRequest(
    {
      url: '/data/dashboard/region-compare',
      method: 'get',
      params: { regionA, regionB, timeRange },
    },
    mock.generateRegionComparison,
  )

// ====== 纯 Mock 接口（不对应后端） ======
export const getDiseaseTop = () => Promise.resolve(mock.generateDiseaseTop())
export const getTemperatureData = () => Promise.resolve(mock.generateTemperatureData())
export const getHumidityData = () => Promise.resolve(mock.generateHumidityData())
export const getDiseaseHeatmap = () => Promise.resolve(mock.generateDiseaseHeatmap())
export const getAiPerformance = () => Promise.resolve(mock.generateAiPerformance())
export const getCropYield = () => Promise.resolve(mock.generateCropYield())
export const getSeasonalPattern = () => Promise.resolve(mock.generateSeasonalPattern())
export const getWindRose = () => Promise.resolve(mock.generateWindRose())
export const getHeatmapData = () => Promise.resolve(mock.generateHeatmapData())
