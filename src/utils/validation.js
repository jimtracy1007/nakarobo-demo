/**
 * 验证节点名称
 * @param {string} name - 节点名称
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateNodeName(name) {
  if (!name) {
    return { valid: false, error: 'Name is required' }
  }
  
  if (name.length < 2 || name.length > 20) {
    return { valid: false, error: 'Name must be between 2 and 20 characters' }
  }
  
  if (name.trim() !== name) {
    return { valid: false, error: 'Name cannot have leading or trailing spaces' }
  }
  
  // 检查是否包含表情符号
  const emojiRegex = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u
  if (emojiRegex.test(name)) {
    return { valid: false, error: 'Name cannot contain emojis' }
  }
  
  return { valid: true, error: null }
}

/**
 * 验证金额
 * @param {string|number} amount - 金额
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateAmount(amount, min = 0, max = Infinity) {
  if (!amount || amount === '' || amount === '0') {
    return { valid: false, error: 'Amount is required' }
  }
  
  const num = Number(amount)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid amount' }
  }
  
  if (num < min) {
    return { valid: false, error: `Amount must be at least ${min}` }
  }
  
  if (num > max) {
    return { valid: false, error: `Amount cannot exceed ${max}` }
  }
  
  return { valid: true, error: null }
}

/**
 * 验证以太坊地址
 * @param {string} address - 地址
 * @returns {boolean}
 */
export function validateAddress(address) {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
