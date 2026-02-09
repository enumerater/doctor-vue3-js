# Skills 功能使用指南

## 📚 概述

Skills是一个可扩展的能力系统,让Agent可以执行特定的任务,例如病害识别、施肥计算、天气查询等。

## 🎯 核心概念

### 1. Skill定义
每个Skill是一个独立的功能模块,包含:
- **基本信息**: ID、名称、描述、图标、分类
- **触发关键词**: @命令触发词(如`@病害识别`)
- **参数定义**: Skill需要的输入参数
- **执行逻辑**: Skill的业务处理代码
- **结果格式化**: 将执行结果格式化为易读的消息

### 2. Skill分类
- **诊断识别** 🔍: 病害诊断、图片识别等
- **田间管理** 🌾: 施肥、浇水、除草等管理建议
- **信息查询** 📊: 天气、价格、市场信息等
- **其他** 🔧: 其他功能

## 🚀 快速开始

### 1. 启用Skills

在Agent设置中,找到"启用的Skills"区域,选择需要的Skills:

```
┌─────────────────────────────────────┐
│ 启用的Skills                         │
├─────────────────────────────────────┤
│ 诊断识别                             │
│ ☑ 🔍 病害图片识别                    │
│      上传作物照片,AI识别病害类型      │
├─────────────────────────────────────┤
│ 田间管理                             │
│ ☑ 🧮 施肥计算器                      │
│      计算精准的施肥方案               │
├─────────────────────────────────────┤
│ 信息查询                             │
│ ☑ 🌤️ 天气预报                       │
│      查看未来7天天气和农事建议        │
│ ☑ 💰 价格查询                        │
│      查询农产品市场价格               │
└─────────────────────────────────────┘
```

### 2. 在聊天中使用Skills

#### 方式1: 快捷按钮(推荐)
在聊天输入框上方会显示已启用的Skills快捷按钮:

```
┌─────────────────────────────────────┐
│ [🔍 病害识别] [🧮 施肥计算] [🌤️ 天气] │
└─────────────────────────────────────┘
```

点击按钮 → 填写参数 → 执行

#### 方式2: @命令触发
在聊天中输入@命令:

```
@病害识别 玉米叶子发黄
@施肥 10亩玉米地
@天气 未来7天
@价格 玉米批发价
```

## 📝 已实现的Skills

### 1. 病害图片识别 🔍

**功能**: 上传作物照片,AI识别病害类型并给出诊断建议

**参数**:
- `image` (必填): 作物照片
- `cropType` (可选): 作物类型

**使用示例**:
1. 点击"病害图片识别"按钮
2. 上传照片
3. 选择作物类型(可选)
4. 点击执行

**返回结果**:
- 病害名称和置信度
- 症状描述
- 紧急措施
- 推荐用药
- 预防措施

**触发词**: `@病害识别` `@诊断` `@看病`

---

### 2. 施肥计算器 🧮

**功能**: 根据作物类型、生长阶段、土壤情况计算施肥方案

**参数**:
- `cropType` (必填): 作物类型
- `growthStage` (必填): 生长阶段
- `area` (必填): 种植面积(亩)
- `soilType` (可选): 土壤类型
- `lastFertilization` (可选): 上次施肥时间(天前)

**使用示例**:
```
点击"施肥计算器" → 选择玉米 → 选择生长期 → 输入10亩 → 执行
```

**返回结果**:
- 推荐用量(氮磷钾有机肥)
- 基肥方案
- 追肥方案
- 注意事项
- 下次施肥建议时间

**触发词**: `@施肥` `@施肥计算` `@肥料`

---

### 3. 天气预报 🌤️

**功能**: 查询未来7天的天气预报,提供农事建议

**参数**:
- `location` (可选): 地理位置(默认使用配置中的位置)
- `days` (可选): 预报天数(3/7/15天,默认7天)

**使用示例**:
```
点击"天气预报" → 执行
或
@天气 未来3天
```

**返回结果**:
- 当前天气状况
- 天气预警
- 未来N天预报(表格)
- 农事建议

**触发词**: `@天气` `@天气预报` `@未来天气`

---

### 4. 价格查询 💰

**功能**: 查询农产品市场价格和价格趋势

**参数**:
- `product` (必填): 农产品名称
- `location` (可选): 地理位置
- `priceType` (可选): 价格类型(收购价/批发价/零售价)

**使用示例**:
```
点击"价格查询" → 输入"玉米" → 选择"批发价" → 执行
或
@价格 玉米
```

**返回结果**:
- 当前价格和涨跌幅
- 价格趋势(最高/最低/平均)
- 各地价格对比
- 市场分析和建议

**触发词**: `@价格` `@价格查询` `@市场价`

---

## 🔧 开发新Skill

### 1. 创建Skill文件

在 `src/skills/` 目录下创建新的skill文件,例如 `mySkill.js`:

```javascript
export default {
  // 基本信息
  id: 'my-skill',
  name: '我的技能',
  description: '这是一个示例技能',
  icon: '⚡',
  category: 'other',

  // @命令触发关键词
  triggers: ['@我的技能', '@myskill'],

  // 参数定义
  params: [
    {
      name: 'param1',
      type: 'text',        // text, number, select, file, textarea
      required: true,
      placeholder: '请输入参数1',
      description: '参数1说明'
    },
    {
      name: 'param2',
      type: 'select',
      required: false,
      options: ['选项1', '选项2', '选项3'],
      default: '选项1',
      description: '参数2说明'
    }
  ],

  // 执行逻辑
  async execute(params, context) {
    const { param1, param2 } = params
    const { agentConfig, conversation } = context

    try {
      // 1. 调用后端API
      const response = await fetch('/api/skills/my-skill/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ param1, param2 })
      })

      const result = await response.json()

      // 2. 返回结构化结果
      return {
        success: true,
        data: result.data,
        message: this.formatMessage(result),
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '执行失败,请重试'
      }
    }
  },

  // 格式化输出消息
  formatMessage(result) {
    return `## ⚡ 执行结果\n\n${JSON.stringify(result, null, 2)}`
  },

  // 参数验证
  validate(params) {
    if (!params.param1) {
      return { valid: false, error: '请输入参数1' }
    }
    return { valid: true }
  }
}
```

### 2. 注册Skill

在 `src/skills/index.js` 中注册:

```javascript
import mySkill from './mySkill'

export const registeredSkills = [
  diseaseRecognition,
  fertilizerCalculator,
  weatherForecast,
  priceQuery,
  mySkill  // 添加新skill
]
```

### 3. 后端API实现

在后端实现对应的API接口:

```
POST /api/skills/my-skill/execute
```

参数:
```json
{
  "param1": "value1",
  "param2": "value2"
}
```

返回:
```json
{
  "success": true,
  "data": {
    // skill执行结果数据
  }
}
```

## 📊 Skills架构

```
src/
├── skills/                     # Skills目录
│   ├── diseaseRecognition.js  # 病害识别skill
│   ├── fertilizerCalculator.js # 施肥计算skill
│   ├── weatherForecast.js     # 天气预报skill
│   ├── priceQuery.js          # 价格查询skill
│   └── index.js               # Skills注册中心
│
├── stores/
│   └── skills.js              # Skills状态管理
│
├── axios/
│   └── skills.js              # Skills API接口
│
└── components/
    └── SkillsBar.vue          # Skills快捷栏组件
```

## 🎨 在聊天界面集成SkillsBar

在聊天界面组件中引入SkillsBar:

```vue
<template>
  <div class="chat-view">
    <!-- 消息列表 -->
    <div class="message-list">
      <!-- ... -->
    </div>

    <!-- Skills快捷栏 -->
    <SkillsBar
      ref="skillsBarRef"
      @skill-execute="onSkillExecute"
      @skill-result="onSkillResult"
    />

    <!-- 输入框 -->
    <div class="input-area">
      <van-field
        v-model="inputText"
        placeholder="输入消息或@命令..."
        @keyup.enter="sendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SkillsBar from '@/components/SkillsBar.vue'

const inputText = ref('')
const skillsBarRef = ref(null)

// 发送消息
const sendMessage = () => {
  // 检查是否是@命令
  if (inputText.value.includes('@')) {
    skillsBarRef.value?.handleCommand(inputText.value)
  } else {
    // 正常发送消息
    // ...
  }
}

// Skill执行事件
const onSkillExecute = ({ skillId, params }) => {
  console.log('Skill开始执行:', skillId, params)
}

// Skill结果事件
const onSkillResult = (result) => {
  console.log('Skill执行结果:', result)
  // 可以将结果插入到聊天消息中
}
</script>
```

## 🔑 关键API

### Skills Store

```javascript
import { useSkillsStore } from '@/stores/skills'

const skillsStore = useSkillsStore()

// 获取所有可用的skills
await skillsStore.fetchSkills()

// 获取已启用的skills
const enabledSkills = skillsStore.enabledSkills

// 切换skill启用状态
await skillsStore.toggleSkill(skillId)

// 批量启用skills
await skillsStore.enableSkills([skillId1, skillId2])

// 执行skill
const result = await skillsStore.executeSkill(skillId, params)
```

### Skills工具函数

```javascript
import {
  getSkillById,
  parseSkillCommand,
  executeSkill
} from '@/skills'

// 根据ID获取skill
const skill = getSkillById('disease-recognition')

// 解析@命令
const command = parseSkillCommand('@病害识别 玉米')
// 返回: { skillId, skill, trigger, params, originalText }

// 执行skill
const result = await executeSkill(skillId, params, context)
```

## 🎯 最佳实践

### 1. Skill设计原则
- **单一职责**: 每个skill专注做好一件事
- **易于理解**: 名称和描述要通俗易懂
- **参数简洁**: 只要求必要的参数,其他从配置获取
- **结果友好**: 格式化结果要易读,支持markdown

### 2. 错误处理
- 始终返回 `{ success: true/false, message, data }` 结构
- 提供友好的错误提示
- 验证参数的有效性

### 3. 性能优化
- 长时间运行的skill应该显示进度
- 缓存可复用的结果
- 避免重复请求

### 4. 用户体验
- 提供清晰的参数说明
- 使用合适的输入控件(文本/数字/选择/文件)
- 结果要结构化,突出重点信息

## 📞 技术支持

如有问题或建议,请参考:
- 代码: `src/skills/` 目录
- 示例: 查看已实现的4个skills
- 文档: 本指南

---

**更新时间**: 2026-02-09
**版本**: v1.0
