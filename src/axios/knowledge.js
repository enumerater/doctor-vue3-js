import request from '@/utils/requests'

// ====== safeRequest 封装：失败直接抛错 ======
async function safeRequest(config) {
  const res = await request(config)
  if (res && res.code === 200) return res.data
  throw new Error(res?.message || '请求失败')
}

// ====== 知识库接口 ======

// 获取所有去重分类
export const getCategories = () =>
  safeRequest({ url: '/knowledge/diseases/categories', method: 'get' })

// 获取某分类下去重作物名
export const getCropNames = (category) =>
  safeRequest({ url: '/knowledge/diseases/crop_names', method: 'get', params: { category } })

// 分页查询病害列表（支持 category、crop_name 筛选）
export const getDiseases = (params = {}) =>
  safeRequest({ url: '/knowledge/diseases', method: 'get', params })

// 搜索病害
export const searchDiseases = (keyword, page = 1, pageSize = 20) =>
  safeRequest({ url: '/knowledge/search', method: 'get', params: { keyword, page, pageSize } })

// 管理端用别名
export const getDiseaseList = getDiseases

// ====== 管理端接口 ======

export const createDisease = (data) =>
  safeRequest({ url: '/knowledge/disease', method: 'post', data })

export const updateDisease = (id, data) =>
  safeRequest({ url: `/knowledge/disease/${id}`, method: 'put', data })

export const deleteDisease = (id) =>
  safeRequest({ url: `/knowledge/disease/${id}`, method: 'delete' })
