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
    hasDisease: true,
    diseaseName: '小麦锈病',
    confidence: 92,
    severity: '中度',
    result: {
      hasDisease: true,
      diseaseName: '小麦锈病',
      confidence: 92,
      severity: '中度',
      symptoms: ['叶片出现黄褐色锈斑', '叶鞘表面有粉状物', '严重时叶片枯黄'],
      prevention: {
        agricultural: ['选用抗锈品种', '合理密植，改善通风透光'],
        chemical: ['使用三唑酮可湿性粉剂喷雾', '发病初期用粉锈宁防治'],
        biological: ['利用拮抗微生物制剂'],
      },
      notes: ['注意在发病初期及时用药', '避免偏施氮肥'],
    },
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
    hasDisease: true,
    diseaseName: '玉米大斑病',
    confidence: 88,
    severity: '轻微',
    result: {
      hasDisease: true,
      diseaseName: '玉米大斑病',
      confidence: 88,
      severity: '轻微',
      symptoms: ['叶片出现灰绿色水浸状斑点', '病斑逐渐扩大呈长梭形', '严重时病斑连片'],
      prevention: {
        agricultural: ['合理轮作', '及时清除病残体'],
        chemical: ['使用多菌灵可湿性粉剂', '代森锰锌喷雾防治'],
        biological: ['增施有机肥提高抗病力'],
      },
      notes: ['发现后应立即处理'],
    },
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
    hasDisease: false,
    diseaseName: '',
    confidence: 95,
    severity: '',
    result: {
      hasDisease: false,
      healthyDesc: '水稻生长状态良好，叶片翠绿，未发现病害症状。',
      confidence: 95,
    },
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
    hasDisease: true,
    diseaseName: '苹果褐斑病',
    confidence: 85,
    severity: '重度',
    result: {
      hasDisease: true,
      diseaseName: '苹果褐斑病',
      confidence: 85,
      severity: '重度',
      symptoms: ['叶片出现褐色不规则病斑', '病斑边缘不清晰', '后期叶片大量脱落'],
      prevention: {
        agricultural: ['加强果园管理', '及时清除落叶'],
        chemical: ['波尔多液防治', '使用代森锰锌喷雾'],
        biological: ['利用生物农药木霉菌'],
      },
      notes: ['重度感染需立即处理', '建议咨询当地农技专家'],
    },
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
    hasDisease: true,
    diseaseName: '葡萄霜霉病',
    confidence: 90,
    severity: '中度',
    result: {
      hasDisease: true,
      diseaseName: '葡萄霜霉病',
      confidence: 90,
      severity: '中度',
      symptoms: ['叶片正面出现淡黄色油浸状斑', '叶背产生白色霜霉层', '果穗受害后变褐干枯'],
      prevention: {
        agricultural: ['改善果园通风条件', '合理修剪'],
        chemical: ['使用甲霜灵锰锌喷雾', '波尔多液预防'],
        biological: ['使用枯草芽孢杆菌制剂'],
      },
      notes: ['雨季注意加强防治'],
    },
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
    hasDisease: false,
    diseaseName: '',
    confidence: 93,
    severity: '',
    result: {
      hasDisease: false,
      healthyDesc: '小麦长势良好，分蘖正常，叶色浓绿，无病虫害迹象。',
      confidence: 93,
    },
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
    hasDisease: true,
    diseaseName: '花生叶斑病',
    confidence: 87,
    severity: '轻微',
    result: {
      hasDisease: true,
      diseaseName: '花生叶斑病',
      confidence: 87,
      severity: '轻微',
      symptoms: ['叶片出现圆形褐色小斑点', '病斑周围有黄色晕圈', '下部叶片先发病'],
      prevention: {
        agricultural: ['合理轮作倒茬', '收获后深翻土地'],
        chemical: ['使用百菌清喷雾', '多菌灵拌种预防'],
        biological: ['增施磷钾肥增强抗性'],
      },
      notes: ['早期发现及时防治效果好'],
    },
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
    hasDisease: false,
    diseaseName: '',
    confidence: 91,
    severity: '',
    result: {
      hasDisease: false,
      healthyDesc: '玉米植株健壮，叶片展开正常，未见病害和虫害症状。',
      confidence: 91,
    },
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
  let list = await safeRequest(
    { url: '/diagnosis/list', method: 'get', params },
    () => {
      let filtered = [...mockDiagnoses]

      if (params.cropType) {
        filtered = filtered.filter((d) => d.cropType === params.cropType)
      }
      if (params.diseaseName) {
        filtered = filtered.filter(
          (d) => d.diseaseName && d.diseaseName.includes(params.diseaseName),
        )
      }
      if (params.hasDisease !== undefined && params.hasDisease !== null && params.hasDisease !== '') {
        const val = params.hasDisease === true || params.hasDisease === 'true'
        filtered = filtered.filter((d) => d.hasDisease === val)
      }
      if (params.dateFrom) {
        filtered = filtered.filter((d) => d.createdAt >= params.dateFrom)
      }
      if (params.dateTo) {
        const to = params.dateTo + (params.dateTo.length === 10 ? 'T23:59:59.999Z' : '')
        filtered = filtered.filter((d) => d.createdAt <= to)
      }

      // 按时间倒序
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return filtered
    },
  )
  return Array.isArray(list) ? list : []
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
      hasDisease: false,
      diseaseName: '',
      confidence: 0,
      severity: '',
      result: null,
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
    const diseased = mockDiagnoses.filter((d) => d.hasDisease).length
    const healthy = total - diseased

    // 作物分布
    const cropMap = {}
    mockDiagnoses.forEach((d) => {
      cropMap[d.cropType] = (cropMap[d.cropType] || 0) + 1
    })
    const cropDistribution = Object.entries(cropMap).map(([name, count]) => ({ name, count }))

    // 病害分布
    const diseaseMap = {}
    mockDiagnoses
      .filter((d) => d.hasDisease && d.diseaseName)
      .forEach((d) => {
        diseaseMap[d.diseaseName] = (diseaseMap[d.diseaseName] || 0) + 1
      })
    const diseaseDistribution = Object.entries(diseaseMap).map(([name, count]) => ({ name, count }))

    return { total, diseased, healthy, cropDistribution, diseaseDistribution }
  })
}
