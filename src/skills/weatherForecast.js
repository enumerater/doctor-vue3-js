/**
 * Skill: 天气预报
 * 查询未来7天的天气预报，提供农事建议
 */

export default {
  id: 'weather-forecast',
  name: '天气预报',
  description: '查看未来7天天气和农事建议',
  icon: '🌤️',
  category: 'information',

  triggers: ['@天气', '@天气预报', '@未来天气'],

  params: [
    {
      name: 'location',
      type: 'text',
      required: false,
      placeholder: '省份 城市（如：山东省 潍坊市）',
      description: '地理位置（可选，默认使用配置中的位置）'
    },
    {
      name: 'days',
      type: 'select',
      required: false,
      options: [3, 7, 15],
      default: 7,
      description: '预报天数'
    }
  ],

  async execute(params, context) {
    // 获取位置信息
    let location = params.location

    if (!location) {
      return {
        success: false,
        error: '请提供位置信息',
        message: '无法获取天气预报：位置信息缺失'
      }
    }

    const days = params.days || 7

    try {
      // 调用天气API
      const response = await fetch('/api/skills/weather-forecast/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location, days })
      })

      const result = await response.json()

      return {
        success: true,
        data: {
          location: result.location || location,
          updateTime: result.updateTime || new Date().toISOString(),

          // 当前天气
          current: {
            temperature: result.current?.temperature || 0,
            weather: result.current?.weather || '未知',
            humidity: result.current?.humidity || 0,
            windSpeed: result.current?.windSpeed || 0,
            windDirection: result.current?.windDirection || '未知'
          },

          // 未来天气预报
          forecast: result.forecast || [],

          // 农事建议
          farmingAdvice: result.farmingAdvice || [],

          // 预警信息
          warnings: result.warnings || []
        },
        message: this.formatMessage(result),
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '天气查询失败，请重试'
      }
    }
  },

  formatMessage(result) {
    const { location, current, forecast, farmingAdvice, warnings } = result

    let message = `## 🌤️ 天气预报\n\n`

    message += `**位置**: ${location}\n\n`

    // 当前天气
    if (current) {
      message += `### 当前天气\n`
      message += `- **温度**: ${current.temperature}°C\n`
      message += `- **天气**: ${current.weather} ${this.getWeatherEmoji(current.weather)}\n`
      message += `- **湿度**: ${current.humidity}%\n`
      message += `- **风速**: ${current.windSpeed} m/s ${current.windDirection}\n\n`
    }

    // 天气预警
    if (warnings?.length > 0) {
      message += `### ⚠️ 天气预警\n`
      warnings.forEach(warning => {
        message += `**${warning.level}**: ${warning.type} - ${warning.description}\n`
      })
      message += `\n`
    }

    // 未来天气
    if (forecast?.length > 0) {
      message += `### 未来${forecast.length}天预报\n\n`
      message += `| 日期 | 天气 | 温度 | 降水 | 风力 |\n`
      message += `|------|------|------|------|------|\n`

      forecast.forEach(day => {
        const date = new Date(day.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
        const weather = `${day.weather} ${this.getWeatherEmoji(day.weather)}`
        const temp = `${day.tempLow}~${day.tempHigh}°C`
        const rain = day.rainfall ? `${day.rainfall}mm` : '-'
        const wind = `${day.windSpeed}级`

        message += `| ${date} | ${weather} | ${temp} | ${rain} | ${wind} |\n`
      })
      message += `\n`
    }

    // 农事建议
    if (farmingAdvice?.length > 0) {
      message += `### 🌾 农事建议\n`
      farmingAdvice.forEach((advice, i) => {
        message += `${i + 1}. **${advice.title}**: ${advice.content}\n`
      })
    }

    return message
  },

  getWeatherEmoji(weather) {
    const emojiMap = {
      '晴': '☀️',
      '多云': '⛅',
      '阴': '☁️',
      '小雨': '🌦️',
      '中雨': '🌧️',
      '大雨': '⛈️',
      '暴雨': '🌩️',
      '雪': '❄️',
      '雾': '🌫️',
      '霾': '😷'
    }

    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (weather.includes(key)) {
        return emoji
      }
    }
    return ''
  },

  validate(params) {
    if (params.days && (params.days < 1 || params.days > 15)) {
      return { valid: false, error: '预报天数必须在1-15天之间' }
    }
    return { valid: true }
  }
}
