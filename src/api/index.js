import { axios } from 'xc-share'

// 测试环境需要在请求url前加前缀
const prefix = '/api-personalized'
// const prefix = ''

// 选人接口
export function getChooseUserDataByParams (params) {
  return axios.get('/api-base/rangeScopes', { params })
}
// 选人输入
export function getSearchListByValue (params) {
  return axios.get('/api-base/rangeScopes?type=search', { params })
}

// 获取阿里云密钥
export function getOSSKey (params) {
  return axios.get('/api-base/attachments/settings', { params })
}
// 上传附件
export function uploadResource (data) {
  return axios.post('/api-base/attachments/save', data)
}
// 附件信息
export function loadDetailBatchByIds (params) {
  return axios.get('/api-base/attachments/infoList', { params })
}

export function getUserInfo () {
  return axios.get('/api-base/users/userInfo')
}
