/**
 * 获取业务日 (UTC+8 08:00 日切)
 * @returns {string} YYYY-MM-DD 格式的日期
 */
export function getBusinessDay() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  
  // 如果当前时间小于 08:00,则为前一天
  const hours = utc8.getUTCHours()
  if (hours < 8) {
    utc8.setDate(utc8.getDate() - 1)
  }
  
  return utc8.toISOString().split('T')[0]
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {boolean} includeTime - 是否包含时间
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, includeTime = false) {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  if (!includeTime) {
    return `${year}-${month}-${day}`
  }
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 获取倒计时
 * @param {Date|string|number} targetDate - 目标日期
 * @returns {Object} { days, hours, minutes, seconds, isExpired }
 */
export function getCountdown(targetDate) {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = target - now
  
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  }
}

/**
 * 格式化相对时间 (几天前、几小时前等)
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date().getTime()
  const past = new Date(date).getTime()
  const diff = now - past
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}
