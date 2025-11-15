import request from '@/utils/requests'

export const getNewsList = (data) => {
  return request({
    url: '/news/page',
    method: 'get',
    params: data,
  })
}

export const getNewsDetail = (id) => {
  return request({
    url: '/news/get',
    method: 'get',
    params: { id },
  })
}
