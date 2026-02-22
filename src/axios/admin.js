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
const mockUsers = [
  { id: 'u001', username: '王国强', role: 'user', status: 'active', createdAt: '2025-10-15T08:00:00.000Z', diagnosisCount: 23, lastLogin: '2026-02-22T07:30:00.000Z' },
  { id: 'u002', username: '陈伟', role: 'user', status: 'active', createdAt: '2025-11-02T10:00:00.000Z', diagnosisCount: 56, lastLogin: '2026-02-21T14:20:00.000Z' },
  { id: 'u003', username: '李小梅', role: 'user', status: 'active', createdAt: '2025-11-20T09:00:00.000Z', diagnosisCount: 41, lastLogin: '2026-02-20T16:00:00.000Z' },
  { id: 'u004', username: '张大力', role: 'user', status: 'disabled', createdAt: '2025-12-01T11:00:00.000Z', diagnosisCount: 5, lastLogin: '2026-01-10T09:00:00.000Z' },
  { id: 'u005', username: '赵小芳', role: 'user', status: 'active', createdAt: '2026-01-05T08:30:00.000Z', diagnosisCount: 18, lastLogin: '2026-02-22T08:00:00.000Z' },
  { id: 'u006', username: 'admin', role: 'admin', status: 'active', createdAt: '2025-09-01T08:00:00.000Z', diagnosisCount: 0, lastLogin: '2026-02-22T09:00:00.000Z' },
]

// ====== API 接口 ======

export const getSystemStats = () =>
  safeRequest({ url: '/admin/stats', method: 'get' }, () => ({
    totalUsers: mockUsers.length,
    activeToday: 4,
    totalDiagnoses: 143,
    diagnosesToday: 12,
    avgAccuracy: 83,
    knowledgeEntries: 47,
    feedbackCount: 28,
    feedbackPending: 8,
  }))

export const getUsers = (params = {}) =>
  safeRequest({ url: '/admin/users', method: 'get', params }, () => {
    let list = [...mockUsers]
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter((u) => u.username.toLowerCase().includes(kw))
    }
    if (params.status) list = list.filter((u) => u.status === params.status)
    if (params.role) list = list.filter((u) => u.role === params.role)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { list, total: list.length }
  })

export const toggleUserStatus = (id) =>
  safeRequest({ url: `/admin/users/${id}/toggle-status`, method: 'put' }, () => {
    const user = mockUsers.find((u) => u.id === id)
    if (user) user.status = user.status === 'active' ? 'disabled' : 'active'
    return user
  })

