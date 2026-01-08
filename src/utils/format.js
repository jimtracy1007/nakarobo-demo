/**
 * 格式化地址 - 前7后4
 * @param {string} address - 以太坊地址
 * @returns {string} 格式化后的地址
 */
export function formatAddress(address) {
  if (!address) return ''
  if (address.length < 11) return address
  return `${address.slice(0, 7)}...${address.slice(-4)}`
}

/**
 * 格式化 Token 金额
 * @param {string|number} amount - 金额
 * @param {number} decimals - 精度
 * @param {number} displayDecimals - 显示精度
 * @returns {string} 格式化后的金额
 */
export function formatTokenAmount(amount, decimals = 18, displayDecimals = 2) {
  if (!amount) return '0'
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  })
}

/**
 * 格式化积分数量
 * @param {string|number} points - 积分
 * @param {number} decimals - 显示小数位数
 * @returns {string} 格式化后的积分
 */
export function formatPoints(points, decimals = 2) {
  if (!points) return '0'
  const value = Number(points)
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化 USD 金额
 * @param {string|number} amount - 金额
 * @returns {string} 格式化后的 USD 金额
 */
export function formatUSD(amount) {
  if (!amount) return '$0.00'
  const value = Number(amount)
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * 格式化百分比
 * @param {string|number} value - 数值
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比
 */
export function formatPercent(value, decimals = 2) {
  if (!value) return '0%'
  const num = Number(value)
  return `${num.toFixed(decimals)}%`
}

/**
 * 格式化大数字 (k, M, B)
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatLargeNumber(num) {
  if (num === undefined || num === null || num === '') return '0'
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
