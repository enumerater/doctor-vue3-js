// 格式化时间：把 2026-04-08T15:10:55 转成 2026-04-08 15:10:55
export function formatTime(time) {
  if (!time) return ''
  // 替换 T 为空格，最简单的方式
  return time.replace('T', ' ')
}

// 进阶：支持更多格式（可选）
export function formatDateTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
