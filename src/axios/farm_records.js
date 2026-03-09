import requests from '@/utils/requests'

// ====== 施药管理 ======
export function getPesticideRecords(plotId) {
  return requests({
    url: `/api/plots/${plotId}/pesticide-records`,
    method: 'get'
  })
}

export function createPesticideRecord(plotId, data) {
  return requests({
    url: `/api/plots/${plotId}/pesticide-records`,
    method: 'post',
    data
  })
}

export function updatePesticideRecord(plotId, recordId, data) {
  return requests({
    url: `/api/plots/${plotId}/pesticide-records/${recordId}`,
    method: 'put',
    data
  })
}

export function updatePesticideEffect(plotId, recordId, data) {
  return requests({
    url: `/api/plots/${plotId}/pesticide-records/${recordId}/effect`,
    method: 'put',
    data
  })
}

// ====== 田间随笔 ======
export function getFieldNotes(plotId, params) {
  return requests({
    url: `/api/plots/${plotId}/notes`,
    method: 'get',
    params
  })
}

export function createFieldNote(plotId, data) {
  return requests({
    url: `/api/plots/${plotId}/notes`,
    method: 'post',
    data
  })
}

export function updateFieldNote(plotId, noteId, data) {
  return requests({
    url: `/api/plots/${plotId}/notes/${noteId}`,
    method: 'put',
    data
  })
}

export function deleteFieldNote(plotId, noteId) {
  return requests({
    url: `/api/plots/${plotId}/notes/${noteId}`,
    method: 'delete'
  })
}

// AI 生成随笔内容
export function generateAiNote(data) {
  return requests({
    url: `/api/ai/generate-field-note`,
    method: 'post',
    data
  })
}
