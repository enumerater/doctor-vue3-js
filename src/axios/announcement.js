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
let mockAnnouncements = [
  {
    id: 'ann001',
    title: '春季病虫害防治指南发布',
    content:
      '各位农户朋友，春季是病虫害高发期。平台已更新春季常见病虫害防治指南，涵盖小麦锈病、油菜菌核病、水稻纹枯病等常见病害的识别与防治方案。请前往知识库查阅，做好春耕防护准备。',
    type: 'guide',
    priority: 'normal',
    targetUsers: 'all',
    status: 'published',
    createdAt: '2026-02-24T10:00:00.000Z',
    publishedAt: '2026-02-24T10:05:00.000Z',
  },
  {
    id: 'ann002',
    title: '系统维护通知',
    content:
      '为提升服务质量，平台将于2026年2月28日凌晨2:00-4:00进行系统维护升级。维护期间部分功能可能暂时无法使用，请提前做好安排。给您带来不便，敬请谅解。',
    type: 'system',
    priority: 'high',
    targetUsers: 'all',
    status: 'published',
    createdAt: '2026-02-23T14:00:00.000Z',
    publishedAt: '2026-02-23T14:30:00.000Z',
  },
]

// ====== API 接口 ======

/**
 * AI 生成公告
 * POST /announcement/generate
 * Request:  { prompt: string }
 * Response: { title, content, type, priority }
 */
export const generateAnnouncement = (data) =>
  safeRequest({ url: '/announcement/generate', method: 'post', data }, () => {
    const prompt = data.prompt || ''
    return {
      title: `【公告】${prompt.slice(0, 15)}${prompt.length > 15 ? '...' : ''}`,
      content: `尊敬的用户：\n\n根据管理员指示，现发布以下公告：\n\n${prompt}\n\n请各位用户知悉，如有疑问请联系客服。\n\n小农平台团队`,
      type: 'system',
      priority: 'normal',
    }
  })

/**
 * 发布公告
 * POST /announcement/publish
 * Request:  { title, content, type, priority, targetUsers }
 * Response: AnnouncementPO 完整公告对象
 */
export const publishAnnouncement = (data) =>
  safeRequest({ url: '/announcement/publish', method: 'post', data }, () => {
    const newAnn = {
      id: 'ann' + String(Date.now()).slice(-6),
      title: data.title,
      content: data.content,
      type: data.type || 'system',
      priority: data.priority || 'normal',
      targetUsers: data.targetUsers || 'all',
      status: 'published',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }
    mockAnnouncements.unshift(newAnn)
    return newAnn
  })

/**
 * 获取公告列表
 * GET /announcement/list?page=1&pageSize=10&type=system
 * Response: { list, total }
 */
export const getAnnouncements = (params = {}) =>
  safeRequest({ url: '/announcement/list', method: 'get', params }, () => {
    let list = [...mockAnnouncements]
    if (params.type) list = list.filter((a) => a.type === params.type)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    return {
      list: list.slice((page - 1) * pageSize, page * pageSize),
      total: list.length,
    }
  })

/**
 * 删除公告
 * DELETE /announcement/{id}
 * Response: "删除成功"
 */
export const deleteAnnouncement = (id) =>
  safeRequest({ url: `/announcement/${id}`, method: 'delete' }, () => {
    mockAnnouncements = mockAnnouncements.filter((a) => a.id !== id)
    return true
  })
