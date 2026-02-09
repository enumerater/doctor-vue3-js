/**
 * Skill: 价格查询
 * 查询农产品市场价格和价格趋势
 */

export default {
  id: 'price-query',
  name: '价格查询',
  description: '查询农产品市场价格',
  icon: '💰',
  category: 'information',

  triggers: ['@价格', '@价格查询', '@市场价'],

  params: [
    {
      name: 'product',
      type: 'text',
      required: true,
      placeholder: '例如：玉米、小麦、番茄',
      description: '农产品名称'
    },
    {
      name: 'location',
      type: 'text',
      required: false,
      placeholder: '省份 城市',
      description: '地理位置（可选）'
    },
    {
      name: 'priceType',
      type: 'select',
      required: false,
      options: ['收购价', '批发价', '零售价'],
      default: '批发价',
      description: '价格类型'
    }
  ],

  async execute(params, context) {
    const { product, location, priceType = '批发价' } = params

    // 如果没有提供位置，使用配置中的位置
    let queryLocation = location
    if (!queryLocation) {
      const province = context.agentConfig?.province
      const city = context.agentConfig?.city
      if (province && city) {
        queryLocation = `${province} ${city}`
      }
    }

    try {
      // 调用价格查询API
      const response = await fetch('/api/skills/price-query/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product,
          location: queryLocation,
          priceType
        })
      })

      const result = await response.json()

      return {
        success: true,
        data: {
          product: result.product || product,
          location: result.location || queryLocation || '全国',
          priceType: result.priceType || priceType,
          updateTime: result.updateTime || new Date().toISOString(),

          // 当前价格
          currentPrice: {
            price: result.currentPrice?.price || 0,
            unit: result.currentPrice?.unit || '元/kg',
            change: result.currentPrice?.change || 0,        // 价格变化
            changePercent: result.currentPrice?.changePercent || 0  // 变化百分比
          },

          // 价格趋势（最近30天）
          priceTrend: result.priceTrend || [],

          // 各地价格对比
          priceComparison: result.priceComparison || [],

          // 市场分析
          marketAnalysis: result.marketAnalysis || {
            trend: 'stable',  // rising, falling, stable
            suggestion: '',
            factors: []
          }
        },
        message: this.formatMessage(result),
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '价格查询失败，请重试'
      }
    }
  },

  formatMessage(result) {
    const { product, location, priceType, currentPrice, priceTrend, priceComparison, marketAnalysis } = result

    let message = `## 💰 农产品价格查询\n\n`

    message += `**产品**: ${product}\n`
    message += `**地区**: ${location || '全国'}\n`
    message += `**价格类型**: ${priceType}\n\n`

    // 当前价格
    if (currentPrice) {
      const changeIcon = currentPrice.change > 0 ? '📈' : currentPrice.change < 0 ? '📉' : '➡️'
      const changeText = currentPrice.change > 0 ? `+${currentPrice.change}` : currentPrice.change

      message += `### 当前价格 ${changeIcon}\n`
      message += `**${currentPrice.price} ${currentPrice.unit}**\n`
      if (currentPrice.change !== 0) {
        message += `较昨日: ${changeText} ${currentPrice.unit} (${currentPrice.changePercent > 0 ? '+' : ''}${currentPrice.changePercent.toFixed(2)}%)\n`
      }
      message += `\n`
    }

    // 价格趋势
    if (priceTrend?.length > 0) {
      message += `### 📊 价格趋势（最近${priceTrend.length}天）\n`

      // 计算最高、最低、平均价
      const prices = priceTrend.map(item => item.price)
      const maxPrice = Math.max(...prices)
      const minPrice = Math.min(...prices)
      const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)

      message += `- **最高价**: ${maxPrice} ${currentPrice?.unit || '元/kg'}\n`
      message += `- **最低价**: ${minPrice} ${currentPrice?.unit || '元/kg'}\n`
      message += `- **平均价**: ${avgPrice} ${currentPrice?.unit || '元/kg'}\n\n`
    }

    // 地区价格对比
    if (priceComparison?.length > 0) {
      message += `### 🗺️ 各地价格对比\n\n`
      message += `| 地区 | 价格 | 涨跌 |\n`
      message += `|------|------|------|\n`

      priceComparison.forEach(item => {
        const changeIcon = item.change > 0 ? '↑' : item.change < 0 ? '↓' : '-'
        const change = item.change !== 0 ? `${changeIcon} ${Math.abs(item.change).toFixed(2)}` : '-'
        message += `| ${item.location} | ${item.price} ${item.unit} | ${change} |\n`
      })
      message += `\n`
    }

    // 市场分析
    if (marketAnalysis) {
      message += `### 📈 市场分析\n`

      const trendLabel = {
        rising: '上涨趋势 📈',
        falling: '下跌趋势 📉',
        stable: '稳定 ➡️'
      }

      message += `**趋势**: ${trendLabel[marketAnalysis.trend] || '未知'}\n\n`

      if (marketAnalysis.suggestion) {
        message += `**建议**: ${marketAnalysis.suggestion}\n\n`
      }

      if (marketAnalysis.factors?.length > 0) {
        message += `**影响因素**:\n`
        marketAnalysis.factors.forEach((factor, i) => {
          message += `${i + 1}. ${factor}\n`
        })
      }
    }

    return message
  },

  validate(params) {
    if (!params.product || params.product.trim() === '') {
      return { valid: false, error: '请输入要查询的农产品名称' }
    }
    return { valid: true }
  }
}
