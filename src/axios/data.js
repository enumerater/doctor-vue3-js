import request from '@/utils/requests'

export const getdiseasedata = () => {
  return request({
    url: '/data/getDiseaseRecord',
    method: 'get',
  })
}

// 获取日温度湿度数据
export const getDayTemHum = (area) => {
  return request({
    url: '/data/getDayTemHum',
    method: 'get',
    params: {
      area,
    },
  })
}
