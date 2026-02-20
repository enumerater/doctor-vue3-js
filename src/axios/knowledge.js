import request from '@/utils/requests'

// ====== safeRequest 封装：后端优先，失败 fallback 到 Mock ======
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

const cropList = [
  { name: '小麦', icon: '🌾', diseaseCount: 12 },
  { name: '水稻', icon: '🌾', diseaseCount: 15 },
  { name: '玉米', icon: '🌽', diseaseCount: 10 },
  { name: '番茄', icon: '🍅', diseaseCount: 18 },
  { name: '黄瓜', icon: '🥒', diseaseCount: 14 },
  { name: '辣椒', icon: '🌶️', diseaseCount: 11 },
  { name: '草莓', icon: '🍓', diseaseCount: 9 },
  { name: '苹果', icon: '🍎', diseaseCount: 13 },
  { name: '葡萄', icon: '🍇', diseaseCount: 16 },
  { name: '白菜', icon: '🥬', diseaseCount: 8 },
]

const diseaseDatabase = {
  小麦: [
    {
      id: '114',
      name: '小麦白粉病',
      cropName: '小麦',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: '115',
      name: '小麦锈病',
      cropName: '小麦',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: '116',
      name: '小麦赤霉病',
      cropName: '小麦',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: '117',
      name: '小麦纹枯病',
      cropName: '小麦',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: '118',
      name: '小麦蚜虫',
      cropName: '小麦',
      category: '虫害',
      thumbnail: '',
      severity: '中',
    },
  ],
  水稻: [
    {
      id: 'r001',
      name: '稻瘟病',
      cropName: '水稻',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'r002',
      name: '稻纹枯病',
      cropName: '水稻',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 'r003',
      name: '水稻白叶枯病',
      cropName: '水稻',
      category: '细菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'r004',
      name: '稻飞虱',
      cropName: '水稻',
      category: '虫害',
      thumbnail: '',
      severity: '重',
    },
  ],
  玉米: [
    {
      id: 'c001',
      name: '玉米大斑病',
      cropName: '玉米',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 'c002',
      name: '玉米小斑病',
      cropName: '玉米',
      category: '真菌',
      thumbnail: '',
      severity: '轻',
    },
    {
      id: 'c003',
      name: '玉米螟',
      cropName: '玉米',
      category: '虫害',
      thumbnail: '',
      severity: '重',
    },
  ],
  番茄: [
    {
      id: 't001',
      name: '番茄晚疫病',
      cropName: '番茄',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 't002',
      name: '番茄早疫病',
      cropName: '番茄',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 't003',
      name: '番茄灰霉病',
      cropName: '番茄',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 't004',
      name: '番茄白粉病',
      cropName: '番茄',
      category: '真菌',
      thumbnail: '',
      severity: '轻',
    },
    {
      id: 't005',
      name: '番茄病毒病',
      cropName: '番茄',
      category: '病毒',
      thumbnail: '',
      severity: '重',
    },
  ],
  黄瓜: [
    {
      id: 'h001',
      name: '黄瓜霜霉病',
      cropName: '黄瓜',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'h002',
      name: '黄瓜白粉病',
      cropName: '黄瓜',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 'h003',
      name: '黄瓜枯萎病',
      cropName: '黄瓜',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
  ],
  辣椒: [
    {
      id: 'l001',
      name: '辣椒疫病',
      cropName: '辣椒',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'l002',
      name: '辣椒炭疽病',
      cropName: '辣椒',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
  ],
  草莓: [
    {
      id: 's001',
      name: '草莓灰霉病',
      cropName: '草莓',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 's002',
      name: '草莓白粉病',
      cropName: '草莓',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
  ],
  苹果: [
    {
      id: 'a001',
      name: '苹果腐烂病',
      cropName: '苹果',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'a002',
      name: '苹果褐斑病',
      cropName: '苹果',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 'a003',
      name: '苹果斑点落叶病',
      cropName: '苹果',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
  ],
  葡萄: [
    {
      id: 'g001',
      name: '葡萄霜霉病',
      cropName: '葡萄',
      category: '真菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'g002',
      name: '葡萄白腐病',
      cropName: '葡萄',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
    {
      id: 'g003',
      name: '葡萄炭疽病',
      cropName: '葡萄',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
  ],
  白菜: [
    {
      id: 'b001',
      name: '白菜软腐病',
      cropName: '白菜',
      category: '细菌',
      thumbnail: '',
      severity: '重',
    },
    {
      id: 'b002',
      name: '白菜霜霉病',
      cropName: '白菜',
      category: '真菌',
      thumbnail: '',
      severity: '中',
    },
  ],
}

function mockDiseaseDetail(diseaseId) {
  // 找到对应的病害
  let disease = null
  for (const diseases of Object.values(diseaseDatabase)) {
    disease = diseases.find((d) => d.id === diseaseId)
    if (disease) break
  }
  if (!disease) return null

  return {
    ...disease,
    symptoms: {
      text: `${disease.name}的典型症状：叶片出现不规则斑点，初期为水浸状，后扩大变为褐色至黑色，严重时病斑连片导致叶片枯死。茎秆和果实也可能受到侵染，出现凹陷的深色病斑。`,
      images: [],
    },
    conditions: {
      temperature: '15-25°C',
      humidity: '相对湿度 > 85%',
      season: '春末夏初、秋季',
      stage: '生长旺盛期至结果期',
    },
    transmission:
      '主要通过气流传播分生孢子，也可通过雨水飞溅、灌溉水及农事操作传播。病菌在病残体和土壤中越冬。',
    prevention: {
      agricultural:
        '选用抗病品种；合理密植，保证通风透光；及时清除病残体；合理施肥，避免偏施氮肥；轮作换茬。',
      chemical:
        '发病初期喷施杀菌剂，每隔7-10天喷一次，连续2-3次。注意交替使用不同机理的药剂以延缓抗性产生。',
      biological: '使用木霉菌、枯草芽孢杆菌等生物制剂进行叶面喷施或灌根处理，增强植株抗病能力。',
    },
    drugs: [
      {
        name: '多菌灵',
        concentration: '50%可湿性粉剂 500倍液',
        method: '叶面喷施',
        interval: '14天',
      },
      {
        name: '甲基硫菌灵',
        concentration: '70%可湿性粉剂 800倍液',
        method: '叶面喷施',
        interval: '14天',
      },
      {
        name: '百菌清',
        concentration: '75%可湿性粉剂 600倍液',
        method: '叶面喷施',
        interval: '7天',
      },
    ],
    similarDiseases: [
      {
        id: disease.id === 'w001' ? 'w002' : 'w001',
        name: disease.id === 'w001' ? '小麦锈病' : '小麦白粉病',
        difference: '白粉病叶面有白色粉状物，锈病则为铁锈色疱疹状突起',
      },
    ],
  }
}

function mockSeasonalRisks() {
  return [
    {
      diseaseId: 't001',
      diseaseName: '番茄晚疫病',
      cropName: '番茄',
      riskLevel: 'high',
      description: '当前高温高湿天气有利于晚疫病发生，请注意预防',
    },
    {
      diseaseId: 'h001',
      diseaseName: '黄瓜霜霉病',
      cropName: '黄瓜',
      riskLevel: 'medium',
      description: '近期气温回升，霜霉病进入高发期',
    },
    {
      diseaseId: 'g001',
      diseaseName: '葡萄霜霉病',
      cropName: '葡萄',
      riskLevel: 'medium',
      description: '雨季来临，葡萄霜霉病风险上升',
    },
  ]
}

// ====== API 接口 ======

export const getCrops = () =>
  safeRequest({ url: '/knowledge/crops', method: 'get' }, () => cropList)

export const getDiseasesByCrop = (cropName, page = 1, pageSize = 20) =>
  safeRequest(
    { url: '/knowledge/diseases', method: 'get', params: { cropName, page, pageSize } },
    () => {
      const list = diseaseDatabase[cropName] || []
      return { list, total: list.length }
    },
  )

export const getDiseaseDetail = (diseaseId) => {
  return safeRequest({ url: `/knowledge/disease/${diseaseId}`, method: 'get' }, () =>
    mockDiseaseDetail(diseaseId),
  )
}

export const searchDiseases = (keyword) =>
  safeRequest({ url: '/knowledge/search', method: 'get', params: { keyword } }, () => {
    const results = []
    for (const diseases of Object.values(diseaseDatabase)) {
      for (const d of diseases) {
        if (
          d.name.includes(keyword) ||
          d.cropName.includes(keyword) ||
          d.category.includes(keyword)
        ) {
          results.push(d)
        }
      }
    }
    return results
  })

export const getSeasonalRisks = (month) =>
  safeRequest(
    { url: '/knowledge/seasonal-risks', method: 'get', params: { month } },
    mockSeasonalRisks,
  )
