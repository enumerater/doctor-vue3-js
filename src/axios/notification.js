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
    id: '2026552101613858817',
    type: 'system',
    priority: 'high',
    title: '【系统维护通知】本周六凌晨暂停服务',
    content: '尊敬的用户：\n\n为提升服务质量，系统将于本周六凌晨进行维护，期间服务将暂时中断。请提前做好相关安排，感谢您的理解与支持！',
    read: false,
    createdAt: '2026-02-28 14:57:27',
    link: '',
  },
  {
    id: 'ntf001',
    type: 'disease_alert',
    priority: 'high',
    title: '病害预警：小麦锈病高发',
    content: '您所在区域近期小麦锈病高发，请注意检查田间作物并提前预防。建议使用三唑酮进行预防性喷施。',
    read: false,
    createdAt: '2026-02-28 08:00:00',
    link: '/knowledge/disease/wheat_rust',
  },
  {
    id: 'ntf002',
    type: 'guide',
    priority: 'normal',
    title: '农事指南：春季播种注意事项',
    content: '当前正值春耕时节，播种前请务必进行种子消毒，并根据土壤墒情调整播种深度，以确保齐苗壮苗。',
    read: false,
    createdAt: '2026-02-27 17:30:00',
    link: '/knowledge',
  },
  {
    id: 'ntf003',
    type: 'guide',
    priority: 'normal',
    title: '农事指南：果树春灌要点',
    content: '果树萌芽期需水量大，应及时进行春灌。灌水量以湿透根系分布层土壤为宜，切忌大水漫灌。',
    read: true,
    createdAt: '2026-02-27 09:00:00',
    link: '/knowledge',
  },
  {
    id: 'ntf004',
    type: 'weather_alert',
    priority: 'high',
    title: '天气预警：高温高湿天气',
    content: '未来3天持续高温高湿，注意防范水稻稻瘟病和番茄晚疫病。建议提前做好预防措施。',
    read: true,
    createdAt: '2026-02-26 06:00:00',
    link: '/knowledge',
  },
  {
    id: 'ntf005',
    type: 'system',
    priority: 'low',
    title: '系统更新通知',
    content: '系统已新增诊断反馈功能，您现在可以对AI诊断结果进行准确性反馈，帮助我们持续改进。',
    read: true,
    createdAt: '2026-02-25 10:00:00',
    link: '',
  },
]

// ====== API 接口 ======

/**
 * 获取通知列表
 * @param {Object} params { page, pageSize, type, readStatus, priority, keyword }
 */
export const getNotifications = (params = {}) =>
  safeRequest({ url: '/notification/list', method: 'get', params }, () => {
    let list = [...mockNotifications]
    
    // 过滤逻辑
    if (params.type) list = list.filter((n) => n.type === params.type)
    if (params.readStatus !== undefined) {
      const isRead = params.readStatus === 1
      list = list.filter((n) => n.read === isRead)
    }
    if (params.priority) list = list.filter((n) => n.priority === params.priority)
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter(n => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw))
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const total = list.length
    const pagedList = list.slice((page - 1) * pageSize, page * pageSize)

    return {
      list: pagedList,
      total,
      unreadTotal: mockNotifications.filter(n => !n.read).length
    }
  })

/**
 * 获取未读统计
 */
export const getUnreadSummary = () =>
  safeRequest({ url: '/notification/unread-summary', method: 'get' }, () => {
    const unread = mockNotifications.filter(n => !n.read)
    const summary = {
        total: unread.length,
        types: {}
    }
    unread.forEach(n => {
        summary.types[n.type] = (summary.types[n.type] || 0) + 1
    })
    return summary
  })

/**
 * 批量已读
 * @param {Array} ids 
 */
export const markNotificationsRead = (ids) =>
  safeRequest({ url: '/notification/read', method: 'put', data: { ids } }, () => {
    if (ids === 'all') {
        mockNotifications.forEach(n => n.read = true)
    } else {
        mockNotifications.forEach(n => {
            if (ids.includes(n.id)) n.read = true
        })
    }
    return true
  })

/**
 * 批量删除
 * @param {Array} ids 
 */
export const deleteNotifications = (ids) =>
  safeRequest({ url: '/notification/delete', method: 'delete', data: { ids } }, () => {
    mockNotifications = mockNotifications.filter(n => !ids.includes(n.id))
    return true
  })

// 兼容旧接口
export const getUnreadCount = () => getUnreadSummary().then(res => res.total)
export const markAsRead = (id) => markNotificationsRead([id])
export const markAllAsRead = () => markNotificationsRead('all')
export const deleteNotification = (id) => deleteNotifications([id])
