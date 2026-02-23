/**
 * Skill: 施肥计算器
 * 根据作物类型、生长阶段、土壤情况计算施肥方案
 */

export default {
  id: 'fertilizer-calculator',
  name: '施肥计算器',
  description: '计算精准的施肥方案',
  icon: '🧮',
  category: 'management',

  triggers: ['@施肥', '@施肥计算', '@肥料'],

  params: [
    {
      name: 'cropType',
      type: 'select',
      required: true,
      options: ['玉米', '小麦', '水稻', '番茄', '黄瓜', '辣椒', '苹果', '葡萄'],
      description: '作物类型'
    },
    {
      name: 'growthStage',
      type: 'select',
      required: true,
      options: ['播种期', '生长期', '开花期', '结果期', '成熟期'],
      description: '生长阶段'
    },
    {
      name: 'area',
      type: 'number',
      required: true,
      min: 0,
      unit: '亩',
      description: '种植面积'
    },
    {
      name: 'soilType',
      type: 'select',
      required: false,
      options: ['黏土', '壤土', '沙土', '砂质壤土'],
      description: '土壤类型（可选）'
    },
    {
      name: 'lastFertilization',
      type: 'number',
      required: false,
      min: 0,
      unit: '天前',
      description: '上次施肥时间（可选）'
    }
  ],

  async execute(params, context) {
    const { cropType, growthStage, area, soilType, lastFertilization } = params

    try {
      // 调用施肥计算API
      const response = await fetch('/api/skills/fertilizer-calculator/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cropType,
          growthStage,
          area,
          soilType,
          lastFertilization,
        })
      })

      const result = await response.json()

      return {
        success: true,
        data: {
          // 推荐的施肥方案
          recommendation: {
            nitrogen: result.recommendation?.nitrogen || 0,    // 氮肥 (kg/亩)
            phosphorus: result.recommendation?.phosphorus || 0, // 磷肥 (kg/亩)
            potassium: result.recommendation?.potassium || 0,   // 钾肥 (kg/亩)
            organic: result.recommendation?.organic || 0,       // 有机肥 (kg/亩)
            totalCost: result.recommendation?.totalCost || 0    // 预估成本 (元)
          },

          // 具体施肥方案
          plan: {
            baseFertilizer: result.plan?.baseFertilizer || [],    // 基肥
            topdressing: result.plan?.topdressing || [],          // 追肥
            foliarSpray: result.plan?.foliarSpray || []           // 叶面肥
          },

          // 注意事项
          notes: result.notes || [],

          // 下次施肥建议时间
          nextFertilization: result.nextFertilization || null
        },
        message: this.formatMessage(result, area),
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '施肥计算失败，请重试'
      }
    }
  },

  formatMessage(result, area) {
    const { recommendation, plan, notes, nextFertilization } = result

    let message = `## 🧮 施肥方案计算结果\n\n`

    message += `**种植面积**: ${area} 亩\n\n`

    // 推荐用量
    message += `### 推荐用量（每亩）\n`
    message += `- **氮肥(N)**: ${recommendation?.nitrogen || 0} kg\n`
    message += `- **磷肥(P₂O₅)**: ${recommendation?.phosphorus || 0} kg\n`
    message += `- **钾肥(K₂O)**: ${recommendation?.potassium || 0} kg\n`
    message += `- **有机肥**: ${recommendation?.organic || 0} kg\n\n`

    message += `**总用量**: \n`
    message += `- 氮肥: ${(recommendation?.nitrogen * area).toFixed(1)} kg\n`
    message += `- 磷肥: ${(recommendation?.phosphorus * area).toFixed(1)} kg\n`
    message += `- 钾肥: ${(recommendation?.potassium * area).toFixed(1)} kg\n`
    message += `- 有机肥: ${(recommendation?.organic * area).toFixed(1)} kg\n\n`

    if (recommendation?.totalCost) {
      message += `**预估成本**: ¥${recommendation.totalCost.toFixed(2)} 元\n\n`
    }

    // 施肥计划
    if (plan?.baseFertilizer?.length > 0) {
      message += `### 基肥方案\n`
      plan.baseFertilizer.forEach((item, i) => {
        message += `${i + 1}. **${item.name}**: ${item.amount}\n`
        if (item.timing) {
          message += `   - 时间: ${item.timing}\n`
        }
        if (item.method) {
          message += `   - 方法: ${item.method}\n`
        }
      })
      message += `\n`
    }

    if (plan?.topdressing?.length > 0) {
      message += `### 追肥方案\n`
      plan.topdressing.forEach((item, i) => {
        message += `${i + 1}. **${item.name}**: ${item.amount}\n`
        if (item.timing) {
          message += `   - 时间: ${item.timing}\n`
        }
        if (item.method) {
          message += `   - 方法: ${item.method}\n`
        }
      })
      message += `\n`
    }

    // 注意事项
    if (notes?.length > 0) {
      message += `### ⚠️ 注意事项\n`
      notes.forEach((note, i) => {
        message += `${i + 1}. ${note}\n`
      })
      message += `\n`
    }

    // 下次施肥时间
    if (nextFertilization) {
      message += `### 📅 下次施肥建议\n`
      message += `建议在 **${nextFertilization}** 进行下次施肥\n`
    }

    return message
  },

  validate(params) {
    if (!params.cropType) {
      return { valid: false, error: '请选择作物类型' }
    }
    if (!params.growthStage) {
      return { valid: false, error: '请选择生长阶段' }
    }
    if (!params.area || params.area <= 0) {
      return { valid: false, error: '请输入有效的种植面积' }
    }
    if (params.area > 10000) {
      return { valid: false, error: '种植面积不能超过10000亩' }
    }
    return { valid: true }
  }
}
