/**
 * Skill: 病害图片识别
 * 上传作物照片，AI识别病害类型并给出诊断建议
 */

export default {
  id: 'disease-recognition',
  name: '病害图片识别',
  description: '上传作物照片，AI识别病害类型',
  icon: '🔍',
  category: 'diagnosis',

  // @命令触发关键词
  triggers: ['@病害识别', '@诊断', '@看病'],

  // Skill参数定义
  params: [
    {
      name: 'image',
      type: 'file',
      required: true,
      accept: 'image/*',
      description: '作物照片'
    },
    {
      name: 'cropType',
      type: 'select',
      required: false,
      options: ['玉米', '小麦', '水稻', '番茄', '黄瓜', '辣椒', '苹果', '葡萄'],
      description: '作物类型（可选，AI会自动识别）'
    }
  ],

  // Skill执行逻辑
  async execute(params, context) {
    const { image, cropType } = params
    const { agentConfig, conversation } = context

    try {
      // 1. 上传图片到服务器
      const formData = new FormData()
      formData.append('image', image)
      if (cropType) {
        formData.append('cropType', cropType)
      }

      // 2. 调用AI识别API
      const response = await fetch('/api/skills/disease-recognition/analyze', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      // 3. 返回结构化结果
      return {
        success: true,
        data: {
          // 识别的病害信息
          disease: {
            name: result.disease?.name || '未知病害',
            confidence: result.disease?.confidence || 0,
            severity: result.disease?.severity || 'unknown', // mild, moderate, severe
            description: result.disease?.description || ''
          },

          // 诊断建议
          diagnosis: {
            symptoms: result.diagnosis?.symptoms || [],
            causes: result.diagnosis?.causes || [],
            affectedParts: result.diagnosis?.affectedParts || []
          },

          // 治疗方案
          treatment: {
            immediate: result.treatment?.immediate || [],
            preventive: result.treatment?.preventive || [],
            pesticides: result.treatment?.pesticides || []
          },

          // 图片分析结果
          imageAnalysis: {
            cropType: result.imageAnalysis?.cropType || '未识别',
            growthStage: result.imageAnalysis?.growthStage || '未识别',
            affectedArea: result.imageAnalysis?.affectedArea || 0 // 受影响面积百分比
          }
        },

        // 用于聊天显示的格式化消息
        message: this.formatMessage(result),

        // 执行时间
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '病害识别失败，请重试或联系技术支持'
      }
    }
  },

  // 格式化输出消息
  formatMessage(result) {
    const { disease, diagnosis, treatment, imageAnalysis } = result

    let message = `## 🔍 病害诊断结果\n\n`

    // 基本信息
    message += `**作物类型**: ${imageAnalysis?.cropType || '未识别'}\n`
    message += `**生长阶段**: ${imageAnalysis?.growthStage || '未识别'}\n\n`

    // 病害信息
    message += `### 病害识别\n`
    message += `**病害名称**: ${disease?.name || '未知'}\n`
    message += `**置信度**: ${((disease?.confidence || 0) * 100).toFixed(1)}%\n`
    message += `**严重程度**: ${this.getSeverityLabel(disease?.severity)}\n`
    if (disease?.description) {
      message += `**说明**: ${disease.description}\n`
    }
    message += `\n`

    // 症状描述
    if (diagnosis?.symptoms?.length > 0) {
      message += `### 主要症状\n`
      diagnosis.symptoms.forEach((symptom, i) => {
        message += `${i + 1}. ${symptom}\n`
      })
      message += `\n`
    }

    // 治疗建议
    if (treatment?.immediate?.length > 0) {
      message += `### 🚨 紧急措施\n`
      treatment.immediate.forEach((step, i) => {
        message += `${i + 1}. ${step}\n`
      })
      message += `\n`
    }

    if (treatment?.pesticides?.length > 0) {
      message += `### 💊 推荐用药\n`
      treatment.pesticides.forEach((pesticide, i) => {
        message += `${i + 1}. **${pesticide.name}**\n`
        if (pesticide.dosage) {
          message += `   - 用量: ${pesticide.dosage}\n`
        }
        if (pesticide.method) {
          message += `   - 用法: ${pesticide.method}\n`
        }
      })
      message += `\n`
    }

    if (treatment?.preventive?.length > 0) {
      message += `### 🛡️ 预防措施\n`
      treatment.preventive.forEach((measure, i) => {
        message += `${i + 1}. ${measure}\n`
      })
    }

    return message
  },

  // 获取严重程度标签
  getSeverityLabel(severity) {
    const labels = {
      mild: '轻度 🟢',
      moderate: '中度 🟡',
      severe: '严重 🔴',
      unknown: '未知'
    }
    return labels[severity] || '未知'
  },

  // 验证参数
  validate(params) {
    if (!params.image) {
      return { valid: false, error: '请上传作物照片' }
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(params.image.type)) {
      return { valid: false, error: '只支持 JPG、PNG、WEBP 格式的图片' }
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024
    if (params.image.size > maxSize) {
      return { valid: false, error: '图片大小不能超过10MB' }
    }

    return { valid: true }
  }
}
