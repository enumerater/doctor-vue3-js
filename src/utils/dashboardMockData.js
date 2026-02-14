/**
 * 数据面板 Mock 数据生成器
 * 提供所有模块所需的模拟数据
 */

// ====== 辅助 ======
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[rand(0, arr.length - 1)]
const randFloat = (min, max, dec = 1) => +(Math.random() * (max - min) + min).toFixed(dec)

// ====== 地区树 ======
export function generateRegionTree() {
  return [
    {
      code: '110000', name: '北京市', center: [116.40, 39.90],
      children: [
        { code: '110100', name: '北京市区', center: [116.40, 39.90], children: [
          { code: '110101', name: '东城区', center: [116.42, 39.93] },
          { code: '110102', name: '西城区', center: [116.37, 39.91] },
          { code: '110105', name: '朝阳区', center: [116.49, 39.92] },
          { code: '110108', name: '海淀区', center: [116.30, 39.96] },
        ] },
      ],
    },
    {
      code: '310000', name: '上海市', center: [121.47, 31.23],
      children: [
        { code: '310100', name: '上海市区', center: [121.47, 31.23], children: [
          { code: '310101', name: '黄浦区', center: [121.49, 31.23] },
          { code: '310104', name: '徐汇区', center: [121.44, 31.19] },
          { code: '310115', name: '浦东新区', center: [121.54, 31.22] },
        ] },
      ],
    },
    {
      code: '330000', name: '浙江省', center: [120.15, 30.26],
      children: [
        { code: '330100', name: '杭州市', center: [120.15, 30.26], children: [
          { code: '330102', name: '上城区', center: [120.17, 30.25] },
          { code: '330106', name: '西湖区', center: [120.13, 30.26] },
        ] },
        { code: '330200', name: '宁波市', center: [121.55, 29.87], children: [
          { code: '330203', name: '海曙区', center: [121.55, 29.87] },
        ] },
      ],
    },
    {
      code: '440000', name: '广东省', center: [113.26, 23.13],
      children: [
        { code: '440100', name: '广州市', center: [113.26, 23.13], children: [
          { code: '440103', name: '荔湾区', center: [113.24, 23.13] },
          { code: '440106', name: '天河区', center: [113.36, 23.12] },
        ] },
        { code: '440300', name: '深圳市', center: [114.06, 22.55], children: [
          { code: '440303', name: '罗湖区', center: [114.13, 22.55] },
          { code: '440305', name: '南山区', center: [113.93, 22.53] },
        ] },
      ],
    },
    {
      code: '510000', name: '四川省', center: [104.06, 30.57],
      children: [
        { code: '510100', name: '成都市', center: [104.06, 30.57], children: [
          { code: '510104', name: '锦江区', center: [104.08, 30.65] },
          { code: '510107', name: '武侯区', center: [104.04, 30.64] },
        ] },
      ],
    },
    {
      code: '370000', name: '山东省', center: [117.00, 36.67],
      children: [
        { code: '370100', name: '济南市', center: [117.00, 36.67], children: [
          { code: '370102', name: '历下区', center: [117.08, 36.67] },
        ] },
        { code: '370200', name: '青岛市', center: [120.38, 36.07], children: [
          { code: '370202', name: '市南区', center: [120.41, 36.08] },
        ] },
      ],
    },
    {
      code: '420000', name: '湖北省', center: [114.34, 30.55],
      children: [
        { code: '420100', name: '武汉市', center: [114.34, 30.55], children: [
          { code: '420102', name: '江岸区', center: [114.31, 30.60] },
        ] },
      ],
    },
    {
      code: '430000', name: '湖南省', center: [112.98, 28.19],
      children: [
        { code: '430100', name: '长沙市', center: [112.98, 28.19], children: [
          { code: '430102', name: '芙蓉区', center: [113.03, 28.18] },
        ] },
      ],
    },
  ]
}

// ====== KPI 汇总 ======
export function generateKpiData() {
  return {
    totalDiagnosis: rand(8000, 25000),
    todayDiagnosis: rand(50, 300),
    diseaseTypes: rand(20, 80),
    monitorStations: rand(100, 500),
    aiAccuracy: randFloat(92, 99),
    alertCount: rand(5, 40),
  }
}

// ====== 地图标记点 ======
export function generateMapMarkers(count = 60) {
  const diseases = ['番茄早疫病', '黄瓜霜霉病', '辣椒炭疽病', '草莓灰霉病', '白菜软腐病', '水稻稻瘟病', '小麦锈病', '玉米大斑病', '苹果褐斑病', '葡萄白粉病']
  const crops = ['番茄', '黄瓜', '辣椒', '草莓', '白菜', '水稻', '小麦', '玉米', '苹果', '葡萄']
  const types = ['disease', 'crop', 'weather']
  const markers = []

  for (let i = 0; i < count; i++) {
    const type = pick(types)
    markers.push({
      id: i,
      type,
      lng: randFloat(100, 122, 2),
      lat: randFloat(22, 42, 2),
      name: type === 'disease' ? pick(diseases) : type === 'crop' ? pick(crops) + '种植基地' : '气象监测站 #' + rand(1, 200),
      description: type === 'disease'
        ? `严重程度: ${pick(['轻微', '中等', '严重'])} | 面积: ${rand(5, 200)}亩`
        : type === 'crop'
        ? `种植面积: ${rand(100, 5000)}亩 | 产量: ${rand(500, 8000)}吨`
        : `温度: ${randFloat(5, 35)}°C | 湿度: ${rand(30, 90)}%`,
      severity: type === 'disease' ? rand(1, 3) : 0,
      crop: type !== 'weather' ? pick(crops) : null,
    })
  }
  return markers
}

// ====== 病害预警 ======
export function generateDiseaseAlerts(count = 20) {
  const diseases = ['番茄早疫病', '黄瓜霜霉病', '辣椒炭疽病', '草莓灰霉病', '白菜软腐病', '水稻稻瘟病', '小麦锈病', '玉米大斑病', '苹果褐斑病', '葡萄白粉病']
  const locations = ['北京朝阳区', '上海浦东新区', '杭州西湖区', '广州天河区', '成都锦江区', '济南历下区', '武汉江岸区', '长沙芙蓉区', '深圳南山区', '青岛市南区']
  const levels = ['low', 'medium', 'high', 'critical']

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    disease: pick(diseases),
    location: pick(locations),
    level: pick(levels),
    area: rand(10, 500),
    time: `${rand(0, 23)}:${String(rand(0, 59)).padStart(2, '0')}`,
    lng: randFloat(104, 121, 2),
    lat: randFloat(23, 40, 2),
    trend: pick(['up', 'down', 'stable']),
  }))
}

// ====== 诊断趋势 ======
export function generateDiagnosisTrend(days = 30) {
  const result = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: rand(30, 200),
      aiCount: rand(20, 150),
    })
  }
  return result
}

// ====== 作物分布 ======
export function generateCropDistribution() {
  const crops = ['番茄', '黄瓜', '辣椒', '草莓', '白菜', '水稻', '小麦', '玉米', '苹果', '葡萄']
  return crops.map((name) => ({ name, value: rand(500, 5000) }))
}

// ====== 病害 TOP10 ======
export function generateDiseaseTop() {
  const items = [
    '番茄早疫病', '黄瓜霜霉病', '辣椒炭疽病', '草莓灰霉病', '白菜软腐病',
    '水稻稻瘟病', '小麦锈病', '玉米大斑病', '苹果褐斑病', '葡萄白粉病',
  ]
  return items.map((name) => ({ name, value: rand(50, 600) })).sort((a, b) => a.value - b.value)
}

// ====== 温度数据 ======
export function generateTemperatureData(days = 14) {
  const result = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      high: randFloat(15, 35),
      low: randFloat(2, 18),
      avg: randFloat(10, 26),
    })
  }
  return result
}

// ====== 湿度数据 ======
export function generateHumidityData(days = 14) {
  const result = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      value: rand(30, 90),
    })
  }
  return result
}

// ====== 天气预报 ======
export function generateWeatherForecast() {
  const icons = ['sunny', 'cloudy', 'overcast', 'rain', 'snow', 'fog']
  const labels = ['晴', '多云', '阴', '雨', '雪', '雾']
  return {
    current: {
      temp: randFloat(5, 35),
      humidity: rand(30, 90),
      wind: `${pick(['东', '南', '西', '北', '东南', '西北'])}风 ${rand(1, 6)}级`,
      weather: pick(labels),
      icon: pick(icons),
      aqi: rand(20, 200),
    },
    forecast: Array.from({ length: 5 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i + 1)
      const idx = rand(0, icons.length - 1)
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        weather: labels[idx],
        icon: icons[idx],
        high: randFloat(15, 35),
        low: randFloat(2, 18),
      }
    }),
  }
}

// ====== 病害日历热力图 ======
export function generateDiseaseHeatmap() {
  const data = []
  const now = new Date()
  const year = now.getFullYear()
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      data.push([dateStr, rand(0, 50)])
    }
  }
  return data
}

// ====== 农产品价格 ======
export function generatePriceIndex(weeks = 12) {
  const crops = ['番茄', '黄瓜', '辣椒', '草莓', '白菜']
  return crops.map((name) => ({
    name,
    data: Array.from({ length: weeks }, () => randFloat(1.5, 15, 2)),
  }))
}

// ====== AI 性能 ======
export function generateAiPerformance() {
  return {
    accuracy: randFloat(93, 99),
    avgResponseTime: rand(800, 3000),
    totalInferences: rand(50000, 200000),
    modelVersion: 'v3.2.1',
    dailyTrend: Array.from({ length: 7 }, () => ({
      accuracy: randFloat(92, 99),
      latency: rand(800, 2500),
      count: rand(500, 3000),
    })),
  }
}

// ====== 地区对比 ======
export function generateRegionComparison() {
  const dimensions = ['病害数量', '诊断次数', '种植面积', '产量指数', 'AI覆盖率', '预警响应']
  return {
    dimensions,
    regionA: dimensions.map(() => rand(40, 100)),
    regionB: dimensions.map(() => rand(40, 100)),
  }
}

// ====== 作物产量 ======
export function generateCropYield() {
  const crops = ['番茄', '黄瓜', '辣椒', '草莓', '白菜', '水稻']
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
  return { crops, quarters, data: crops.map(() => quarters.map(() => rand(500, 5000))) }
}

// ====== 季节病害 ======
export function generateSeasonalPattern() {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const diseases = ['早疫病', '霜霉病', '炭疽病', '灰霉病']
  return {
    months,
    series: diseases.map((name) => ({
      name,
      data: months.map(() => rand(5, 80)),
    })),
  }
}

// ====== 风向 ======
export function generateWindRose() {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const labels = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  return dirs.map((dir, i) => ({
    dir,
    label: labels[i],
    gentle: rand(5, 25),
    moderate: rand(3, 15),
    strong: rand(1, 8),
  }))
}

// ====== 热力图数据 ======
export function generateHeatmapData(count = 200) {
  return Array.from({ length: count }, () => ({
    lng: randFloat(100, 122, 3),
    lat: randFloat(22, 42, 3),
    count: rand(10, 100),
  }))
}
