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
let mockNotifications = [
  {
    id: 'ntf001',
    type: 'disease_alert',
    title: '病害预警：小麦锈病高发',
    content: '您所在区域近期小麦锈病高发，请注意检查田间作物并提前预防。建议使用三唑酮进行预防性喷施。',
    read: false,
    createdAt: '2026-02-22T08:00:00.000Z',
    link: '/knowledge/disease/wheat_rust',
  },
  {
    id: 'ntf002',
    type: 'treatment_remind',
    title: '施药提醒：番茄白粉病第二次喷药',
    content: '您的1号大棚番茄白粉病治疗方案，今日需执行第二次喷药操作。',
    read: false,
    createdAt: '2026-02-21T07:30:00.000Z',
    link: '/diagnosis',
  },
  {
    id: 'ntf003',
    type: 'safety_interval',
    title: '安全间隔期已过',
    content: '您在东地小麦田使用的三唑酮安全间隔期已过（21天），现在可以安全采收。',
    read: false,
    createdAt: '2026-02-20T09:00:00.000Z',
    link: '/farm',
  },
  {
    id: 'ntf004',
    type: 'weather_alert',
    title: '天气预警：高温高湿天气',
    content: '未来3天持续高温高湿，注意防范水稻稻瘟病和番茄晚疫病。建议提前做好预防措施。',
    read: true,
    createdAt: '2026-02-19T06:00:00.000Z',
    link: '/knowledge',
  },
  {
    id: 'ntf005',
    type: 'system',
    title: '系统更新通知',
    content: '系统已新增诊断反馈功能，您现在可以对AI诊断结果进行准确性反馈，帮助我们持续改进。',
    read: true,
    createdAt: '2026-02-18T10:00:00.000Z',
    link: '',
  },
  {
    id: 'ntf006',
    type: 'disease_alert',
    title: '病害预警：玉米大斑病风险',
    content: '根据近期气象数据和历史发病规律，未来一周玉米大斑病发生风险较高，请加强田间巡查。',
    read: true,
    createdAt: '2026-02-17T08:00:00.000Z',
    link: '/knowledge/disease/corn_leaf_blight',
  },
]

// ====== API 接口 ======

export const getNotifications = (params = {}) =>
  safeRequest({ url: '/notification/list', method: 'get', params }, () => {
    let list = [...mockNotifications]
    if (params.type) list = list.filter((n) => n.type === params.type)
    if (params.read !== undefined) list = list.filter((n) => n.read === params.read)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return list
  })

export const getUnreadCount = () =>
  safeRequest({ url: '/notification/unread-count', method: 'get' }, () => {
    return mockNotifications.filter((n) => !n.read).length
  })

export const markAsRead = (id) =>
  safeRequest({ url: `/notification/${id}/read`, method: 'put' }, () => {
    const ntf = mockNotifications.find((n) => n.id === id)
    if (ntf) ntf.read = true
    return true
  })

export const markAllAsRead = () =>
  safeRequest({ url: '/notification/read-all', method: 'put' }, () => {
    mockNotifications.forEach((n) => (n.read = true))
    return true
  })

export const deleteNotification = (id) =>
  safeRequest({ url: `/notification/${id}`, method: 'delete' }, () => {
    mockNotifications = mockNotifications.filter((n) => n.id !== id)
    return true
  })
