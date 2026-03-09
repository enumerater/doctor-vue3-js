import requests from '@/utils/requests'

/**
 * 获取地块的积温统计
 * @param {string} plotId 地块ID
 * @param {Object} params { startDate, baseTemp }
 */
export function getAccumulatedTemp(plotId, params) {
  return requests({
    url: `/api/plots/${plotId}/accumulated-temp`,
    method: 'get',
    params
  })
}

/**
 * 获取地块的积温预测
 * @param {string} plotId 地块ID
 * @param {Object} params { baseTemp }
 */
export function getAccumulatedTempPrediction(plotId, params) {
  return requests({
    url: `/api/plots/${plotId}/accumulated-temp/prediction`,
    method: 'get',
    params
  })
}
