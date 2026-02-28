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
let mockDiagnoses = [
  {
    id: 'diag001',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '小麦',
    result: '## 小麦锈病诊断\n\n经过图像分析，该小麦样本存在**锈病**症状。\n\n### 病害症状\n- 叶片出现黄褐色锈斑\n- 叶鞘表面有粉状物\n- 严重时叶片枯黄\n\n### 防治建议\n\n**农业防治：**\n1. 选用抗锈品种\n2. 合理密植，改善通风透光\n\n**化学防治：**\n1. 使用三唑酮可湿性粉剂喷雾\n2. 发病初期用粉锈宁防治\n\n> 注意在发病初期及时用药，避免偏施氮肥。',
    status: 'completed',
    createdAt: '2026-02-18T10:30:00.000Z',
    elapsedTime: 35,
    plotId: null,
    farmId: null,
    notes: '东地小麦田发现，需要持续关注',
    feedback: null,
  },
  {
    id: 'diag002',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '玉米',
    result: '## 玉米大斑病诊断\n\n该玉米样本检测到**大斑病**特征。\n\n### 病害症状\n- 叶片出现灰绿色水浸状斑点\n- 病斑逐渐扩大呈长梭形\n- 严重时病斑连片\n\n### 防治建议\n\n**农业防治：**\n1. 合理轮作\n2. 及时清除病残体\n\n**化学防治：**\n1. 使用多菌灵可湿性粉剂\n2. 代森锰锌喷雾防治\n\n> 发现后应立即处理。',
    status: 'completed',
    createdAt: '2026-02-15T14:20:00.000Z',
    elapsedTime: 42,
    plotId: null,
    farmId: null,
    notes: '',
    feedback: null,
  },
  {
    id: 'diag003',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '水稻',
    result: '## 健康状态\n\n水稻生长状态良好，叶片翠绿，未发现病害症状。\n\n建议继续保持当前田间管理方式，定期巡检以确保作物健康。',
    status: 'completed',
    createdAt: '2026-02-10T09:15:00.000Z',
    elapsedTime: 28,
    plotId: null,
    farmId: null,
    notes: '',
    feedback: null,
  },
  {
    id: 'diag004',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '苹果',
    result: '## 苹果褐斑病诊断\n\n该苹果样本存在**褐斑病**，情况较为严重。\n\n### 病害症状\n- 叶片出现褐色不规则病斑\n- 病斑边缘不清晰\n- 后期叶片大量脱落\n\n### 防治建议\n\n**农业防治：**\n1. 加强果园管理\n2. 及时清除落叶\n\n**化学防治：**\n1. 波尔多液防治\n2. 使用代森锰锌喷雾\n\n**生物防治：**\n1. 利用生物农药木霉菌\n\n> 重度感染需立即处理，建议咨询当地农技专家。',
    status: 'completed',
    createdAt: '2026-01-28T16:45:00.000Z',
    elapsedTime: 38,
    plotId: null,
    farmId: null,
    notes: '果园东侧严重，已购药准备喷施',
    feedback: null,
  },
  {
    id: 'diag005',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '葡萄',
    result: '## 葡萄霜霉病诊断\n\n该葡萄样本检测到**霜霉病**症状。\n\n### 病害症状\n- 叶片正面出现淡黄色油浸状斑\n- 叶背产生白色霜霉层\n- 果穗受害后变褐干枯\n\n### 防治建议\n\n**农业防治：**\n1. 改善果园通风条件\n2. 合理修剪\n\n**化学防治：**\n1. 使用甲霜灵锰锌喷雾\n2. 波尔多液预防\n\n**生物防治：**\n1. 使用枯草芽孢杆菌制剂\n\n> 雨季注意加强防治。',
    status: 'completed',
    createdAt: '2026-01-20T11:00:00.000Z',
    elapsedTime: 31,
    plotId: null,
    farmId: null,
    notes: '',
    feedback: null,
  },
  {
    id: 'diag006',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '小麦',
    result: '## 健康状态\n\n小麦长势良好，分蘖正常，叶色浓绿，无病虫害迹象。\n\n建议保持现有管理措施，适时追肥，注意水分管理。',
    status: 'completed',
    createdAt: '2026-01-10T08:30:00.000Z',
    elapsedTime: 25,
    plotId: null,
    farmId: null,
    notes: '定期巡检记录',
    feedback: null,
  },
  {
    id: 'diag007',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '花生',
    result: '## 花生叶斑病诊断\n\n该花生样本检测到**叶斑病**特征，程度较轻。\n\n### 病害症状\n- 叶片出现圆形褐色小斑点\n- 病斑周围有黄色晕圈\n- 下部叶片先发病\n\n### 防治建议\n\n**农业防治：**\n1. 合理轮作倒茬\n2. 收获后深翻土地\n\n**化学防治：**\n1. 使用百菌清喷雾\n2. 多菌灵拌种预防\n\n> 早期发现及时防治效果好。',
    status: 'completed',
    createdAt: '2025-12-25T15:20:00.000Z',
    elapsedTime: 33,
    plotId: null,
    farmId: null,
    notes: '',
    feedback: null,
  },
  {
    id: 'diag008',
    imageUrl: 'https://img.zcool.cn/community/01a9a65d3b1a20a801213f261c67b6.jpg',
    cropType: '玉米',
    result: '## 健康状态\n\n玉米植株健壮，叶片展开正常，未见病害和虫害症状。\n\n建议继续做好田间管理，注意通风透光。',
    status: 'completed',
    createdAt: '2025-12-15T10:00:00.000Z',
    elapsedTime: 27,
    plotId: null,
    farmId: null,
    notes: '',
    feedback: null,
  },
]

let mockIdCounter = 200

function generateId() {
  mockIdCounter++
  return `diag${mockIdCounter}`
}

// ====== API 接口 ======

export const getDiagnoses = async (params = {}) => {
  const query = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    cropType: params.cropType || undefined,
    resultType: params.resultType || undefined
  }
  
  return request({ 
    url: '/diagnosis/list', 
    method: 'get', 
    params: query 
  }).then(res => {
    if (res && res.code === 200) return res.data
    return { list: [], total: 0 }
  })
}

export const getDiagnosisDetail = async (id) => {
  return safeRequest(
    { url: `/diagnosis/${id}`, method: 'get' },
    () => mockDiagnoses.find((d) => d.id === id) || null,
  )
}

export const createDiagnosis = (data) =>
  safeRequest({ url: '/diagnosis', method: 'post', data }, () => {
    const record = {
      id: generateId(),
      imageUrl: '',
      cropType: '',
      result: '',
      status: 'completed',
      createdAt: new Date().toISOString(),
      elapsedTime: 0,
      plotId: null,
      farmId: null,
      notes: '',
      feedback: null,
      ...data,
    }
    mockDiagnoses.unshift(record)
    return record
  })

export const updateDiagnosis = (id, data) =>
  safeRequest({ url: `/diagnosis/${id}`, method: 'put', data }, () => {
    const record = mockDiagnoses.find((d) => d.id === id)
    if (record) Object.assign(record, data)
    return record
  })

export const deleteDiagnosis = (id) =>
  safeRequest({ url: `/diagnosis/${id}`, method: 'delete' }, () => {
    mockDiagnoses = mockDiagnoses.filter((d) => d.id !== id)
    return true
  })

export const getDiagnosisStats = async () => {
  return safeRequest({ url: '/diagnosis/stats', method: 'get' }, () => {
    const total = mockDiagnoses.length

    // 作物分布
    const cropMap = {}
    mockDiagnoses.forEach((d) => {
      cropMap[d.cropType] = (cropMap[d.cropType] || 0) + 1
    })
    const cropDistribution = Object.entries(cropMap).map(([name, count]) => ({ name, count }))

    return { total, cropDistribution }
  })
}
