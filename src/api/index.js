import apiClient from './client'

export const authAPI = {
  // 获取 SIWE nonce
  getNonce: async (address) => {
    return apiClient.post('/auth/nonce', { address })
  },

  // 验证签名并获取 JWT
  verify: async (address, signature) => {
    return apiClient.post('/auth/verify', { 
      address, 
      signature
    })
  },
}

export const configAPI = {
  // 获取链配置
  getChainConfig: async (chainId = null, list = false) => {
    const params = {}
    if (chainId) params.chainId = chainId
    if (list) params.list = true
    return apiClient.get('/config/chain', { params })
  },
}

export const userAPI = {
  // 获取用户信息
  getProfile: async () => {
    return apiClient.get('/user/profile')
  },
}

export const nodeAPI = {
  // 获取我的节点信息 (头像/名称/ID/创建时间)
  getMyNode: async () => {
    return apiClient.get('/node/me')
  },

  // 获取资产摘要 (Minted Base Rewards/Current Bonus/Redeemable)
  getAssetSummary: async () => {
    return apiClient.get('/node/me/asset-summary')
  },

  // 获取随机头像
  getRandomAvatar: async () => {
    return apiClient.get('/node/avatar/random')
  },

  // 刷新头像
  refreshAvatar: async () => {
    return apiClient.post('/node/avatar/refresh')
  },


  // 获取资金记录 (Deposit/Redeem/Waive)
  getFundsRecords: async (page = 1, pageSize = 20) => {
    return apiClient.get('/funds/records', { 
      params: { page, pageSize } 
    })
  },
}

// Points 相关接口
export const pointsAPI = {
  // 获取积分摘要
  getSummary: async () => {
    return apiClient.get('/points/summary')
  },

  // 获取我的积分概览
  getMyPoints: async () => {
    return apiClient.get('/points/me')
  },

  // 获取积分榜单
  getLeaderboard: async (page = 1, pageSize = 20) => {
    return apiClient.get('/leaderboard/points', { 
      params: { page, pageSize } 
    })
  },
}

export const networkAPI = {
  // 获取网络统计
  getStats: async () => {
    return apiClient.get('/stats/network')
  },

  // 获取网络榜单
  getLeaderboard: async (sort = 'deposited', page = 1, pageSize = 10) => {
    return apiClient.get('/leaderboard/network', { 
      params: { sort, page, pageSize } 
    })
  },
}

export const yappersAPI = {
  // 获取 Twitter OAuth URL
  connect: async (redirectUri) => {
    return apiClient.get('/yappers/connect', { 
      params: { redirectUri } 
    })
  },

  // OAuth 回调
  callback: async (code, codeVerifier, redirectUri) => {
    return apiClient.get('/yappers/callback', { 
      params: { code, codeVerifier, redirectUri } 
    })
  },

  // 查询绑定状态
  getStatus: async () => {
    return apiClient.get('/yappers/status')
  },

  // 查询积分
  getScores: async () => {
    return apiClient.get('/yappers/scores')
  },

  // 获取待领取奖励
  getClaimables: async () => {
    return apiClient.get('/yappers/claimables')
  },

  // 获取榜单
  getLeaderboard: async (page = 1, pageSize = 10, search = null) => {
    const params = { page, pageSize }
    if (search) params.search = search
    return apiClient.get('/yappers/leaderboard', { params })
  },

  // 解绑 Twitter
  disconnect: async () => {
    return apiClient.post('/yappers/disconnect')
  },

  // AI 生成草稿
  generateDrafts: async (promptInput) => {
    return apiClient.post('/yappers/ai/drafts', { promptInput })
  },
}

export const questsAPI = {
  // 获取任务概览 (含签到状态、Streak、任务列表)
  getSummary: async () => {
    return apiClient.get('/quests')
  },

  // 执行每日签到
  checkIn: async () => {
    return apiClient.post('/quests/check-in')
  },

  // 获取领奖 Proof
  getClaimProof: async (activityId = '1') => {
    return apiClient.get('/quests/claim-proof', {
      params: { activityId }
    })
  },

  // 获取榜单
  getLeaderboard: async (page = 1, pageSize = 20, search = null) => {
    const params = { page, pageSize }
    if (search) params.search = search
    return apiClient.get('/quests/leaderboard', { params })
  },
}

export const referralAPI = {
  // 获取邀请信息
  getMyReferral: async () => {
    return apiClient.get('/referral/me')
  },

  // 获取邀请统计
  getStats: async () => {
    return apiClient.get('/referral/stats')
  },

  // 绑定邀请码
  bind: async (referralCode) => {
    return apiClient.post('/referral/bind', { referralCode })
  },

  // 跳过邀请绑定
  skip: async () => {
    return apiClient.post('/referral/skip')
  },
}
