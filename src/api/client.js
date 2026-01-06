import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data
    // 兼容旧格式（无 code）
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
      if (payload.code === 0) {
        return payload.data
      }
      // 非 0 统一抛错，保持 message/code 形态
      if (payload.code === 401) {
        localStorage.removeItem('jwt_token')
      }
      const err = new Error(payload.error || 'Request failed')
      err.code = payload.code
      throw err
    }
    return payload
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response
      
      if (status === 401) {
        // Token 过期,清除本地存储
        localStorage.removeItem('jwt_token')
      }
      
      // Reject with the entire error object so components can access err.response.data
      return Promise.reject(error)
    } else if (error.request) {
      // 请求发送但没有响应
      return Promise.reject('Network error, please try again')
    } else {
      // 请求配置错误
      return Promise.reject(error.message)
    }
  }
)

export default apiClient
