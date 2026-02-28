import request from '@/utils/requests'

async function safeRequest(config, fallbackFn) {
  try {
    const res = await request(config)
    if (res && res.code === 200) return res.data
    return fallbackFn()
  } catch {
    return fallbackFn()
  }
}

let mockDiagnosisRecords = []

export const getPlotDiagnosisList = (plotId) =>
  safeRequest({ url: '/plot_diagnosis/list', method: 'get', params: { plotId } }, () =>
    mockDiagnosisRecords.filter((r) => r.plotId === plotId),
  )

export const bindDiagnosisToPlot = (data) =>
  safeRequest({ url: '/plot_diagnosis/bind', method: 'post', data }, () => {
    const record = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    mockDiagnosisRecords.push(record)
    return record
  })

export const deletePlotDiagnosis = (id) =>
  safeRequest({ url: `/plot_diagnosis/${id}`, method: 'delete' }, () => {
    mockDiagnosisRecords = mockDiagnosisRecords.filter((r) => r.id !== id)
    return true
  })
