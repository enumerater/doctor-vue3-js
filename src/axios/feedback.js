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
let mockFeedbacks = [
  {
    id: 'fb001',
    diagnosisId: 'diag001',
    accuracy: 'correct',
    correctDisease: '',
    rating: 5,
    comment: 'AI诊断很准确，确实是锈病',
    createdAt: '2026-02-19T08:00:00.000Z',
    username: '王国强',
    cropType: '小麦',
    diagnosedDisease: '锈病',
    status: 'approved',
  },
  {
    id: 'fb002',
    diagnosisId: 'diag002',
    accuracy: 'partial',
    correctDisease: '小斑病',
    rating: 3,
    comment: '病害类型对了，但严重程度判断有偏差',
    createdAt: '2026-02-16T10:30:00.000Z',
    username: '陈伟',
    cropType: '玉米',
    diagnosedDisease: '大斑病',
    status: 'pending',
  },
  {
    id: 'fb003',
    diagnosisId: 'diag004',
    accuracy: 'incorrect',
    correctDisease: '轮纹病',
    rating: 2,
    comment: '不是褐斑病，实际是轮纹病',
    createdAt: '2026-01-30T14:00:00.000Z',
    username: '李小梅',
    cropType: '苹果',
    diagnosedDisease: '褐斑病',
    status: 'approved',
  },
]

let mockIdCounter = 100

// ====== API 接口 ======

export const submitFeedback = (data) =>
  safeRequest({ url: '/feedback', method: 'post', data }, () => {
    const record = {
      id: `fb${++mockIdCounter}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...data,
    }
    mockFeedbacks.unshift(record)
    return record
  })

export const getFeedbackByDiagnosis = (diagnosisId) =>
  safeRequest(
    { url: `/feedback/diagnosis/${diagnosisId}`, method: 'get' },
    () => mockFeedbacks.find((f) => f.diagnosisId === diagnosisId) || null,
  )

export const getFeedbacks = (params = {}) =>
  safeRequest({ url: '/feedback/list', method: 'get', params }, () => {
    let list = [...mockFeedbacks]
    if (params.status) list = list.filter((f) => f.status === params.status)
    if (params.accuracy) list = list.filter((f) => f.accuracy === params.accuracy)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return list
  })

export const updateFeedbackStatus = (id, status) =>
  safeRequest({ url: `/feedback/${id}/status`, method: 'put', data: { status } }, () => {
    const fb = mockFeedbacks.find((f) => f.id === id)
    if (fb) fb.status = status
    return fb
  })

export const getFeedbackStats = () =>
  safeRequest({ url: '/feedback/stats', method: 'get' }, () => {
    const total = mockFeedbacks.length
    const correct = mockFeedbacks.filter((f) => f.accuracy === 'correct').length
    const partial = mockFeedbacks.filter((f) => f.accuracy === 'partial').length
    const incorrect = mockFeedbacks.filter((f) => f.accuracy === 'incorrect').length
    const accuracyRate = total > 0 ? Math.round(((correct + partial * 0.5) / total) * 100) : 0
    const avgRating =
      total > 0
        ? (mockFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1)
        : '0.0'
    return { total, correct, partial, incorrect, accuracyRate, avgRating }
  })
