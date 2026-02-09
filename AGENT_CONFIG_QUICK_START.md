# Agent 自定义设置功能 - 快速开始指南

## 概述

本指南帮助开发者理解和使用 Agent 自定义设置功能的前端实现。

---

## 🎯 功能概述

Agent 自定义设置功能允许用户创建和管理多套 Agent 配置，每个会话可以独立选择使用哪个配置。配置包括：

- 系统提示词（支持预设模板）
- 响应参数（温度、长度、采样等）
- Agent 业务参数（作物类型、诊断模式等）
- 高级配置（缓存、重试、超时等）

---

## 📦 前端实现完成的工作

### 1. 已创建的文件

#### 存储层
```
src/stores/agentConfig.js          # Pinia 配置状态管理
src/axios/agentConfig.js           # API 端点定义
```

#### UI 组件（8 个）
```
src/components/AgentConfigPanel.vue              # 主面板
src/components/ConfigSelector.vue                # 配置选择器
src/components/ConfigEditor.vue                  # 配置编辑器
src/components/ConfigCreator.vue                 # 配置创建器
src/components/SystemPromptSection.vue           # 提示词编辑
src/components/ResponseParamSection.vue          # 响应参数
src/components/AgentParamSection.vue             # 业务参数
src/components/AdvancedConfigSection.vue         # 高级配置
```

#### 已修改的文件
```
src/views/AgentHomeView.vue        # 添加配置按钮和弹窗
src/stores/chat.js                 # 集成配置到会话和 SSE
src/main.js                        # 初始化配置 Store
```

### 2. 核心功能

✅ **配置管理**
- 创建、编辑、删除、复制配置
- 设置默认配置
- 快速切换配置
- 配置列表展示

✅ **数据持久化**
- 前端 localStorage 缓存
- 后端 API 同步

✅ **参数编辑**
- 系统提示词（5 个预设模板）
- 响应参数（温度、长度等）
- 业务参数（作物、模式等）
- 高级配置（缓存、重试等）

✅ **会话集成**
- 创建会话时关联配置
- SSE 调用时传递配置 ID
- 配置历史保存

---

## 🚀 快速开始

### 1. 打开 Agent 设置面板

在 `AgentHomeView` 中点击右上角的 "Agent设置" 按钮，右侧弹出配置面板。

```vue
<!-- AgentHomeView.vue -->
<van-button
  round
  plain
  type="primary"
  icon="setting-o"
  size="small"
  @click="openConfigPanel"
>
  Agent设置
</van-button>
```

### 2. 访问 Store 中的配置

```javascript
import { useAgentConfigStore } from '@/stores/agentConfig'

const agentConfigStore = useAgentConfigStore()

// 获取当前配置
const currentConfig = agentConfigStore.currentConfig

// 获取所有配置
const configs = agentConfigStore.configs

// 获取配置列表（UI 展示用）
const configList = agentConfigStore.configList

// 切换配置
agentConfigStore.switchConfig(configId)

// 创建新配置
const newConfig = await agentConfigStore.createConfig(configData)

// 更新配置
await agentConfigStore.updateConfig(configId, configData)

// 删除配置
await agentConfigStore.deleteConfig(configId)
```

### 3. 在 Chat 中使用配置

配置已自动集成到 chat.js，创建会话时会自动关联当前配置：

```javascript
// src/stores/chat.js
async prepareMessage(content, userId, sessionId) {
  // ...
  if (sidebarStore.isAgricultureAgent && agentConfigStore.currentConfig) {
    await setSessionAgentConfig(fullSessionId, agentConfigStore.currentConfig.id)
  }
  // ...
}
```

---

## 🔧 后端对接指南

### 1. 需要实现的 API 端点

#### 获取所有配置
```
GET /agentConfig/list
响应: { code: 0, data: AgentConfig[] }
```

#### 创建配置
```
POST /agentConfig
请求体: { name, description, systemPrompt, responseParams, ... }
响应: { code: 0, data: AgentConfig }
```

#### 更新配置
```
PUT /agentConfig/{id}
请求体: { name, description, systemPrompt, responseParams, ... }
响应: { code: 0, data: AgentConfig }
```

#### 删除配置
```
DELETE /agentConfig/{id}
响应: { code: 0 }
```

#### 设置为默认
```
PUT /agentConfig/{id}/setDefault
响应: { code: 0 }
```

#### 复制配置
```
POST /agentConfig/{id}/duplicate
响应: { code: 0, data: AgentConfig }
```

#### 为会话设置配置
```
PUT /session/{sessionId}/agentConfig
请求体: { configId }
响应: { code: 0 }
```

### 2. AgentConfig 数据模型

```typescript
interface AgentConfig {
  id: string                          // UUID
  name: string                        // 配置名称（必填）
  description?: string                // 配置描述
  isDefault: boolean                  // 是否为默认

  systemPrompt: {
    template: string                  // 基础提示词
    customInstructions?: string       // 补充指令
    language: 'zh' | 'en'             // 语言
  }

  responseParams: {
    temperature: number               // 0.0-1.0
    maxTokens: number                 // 100-4000
    topP: number                      // 0.0-1.0
    topK: number                      // 1-100
    frequencyPenalty: number          // -2.0-2.0
    presencePenalty: number           // -2.0-2.0
  }

  agentConfig: {
    cropTypes: string[]               // 农作物类型
    diseaseDetectionMode: string      // fast|balanced|precise
    enableImageAnalysis: boolean
    enableFieldManagement: boolean
    enablePesticideAdvice: boolean
    maxSteps: number                  // 3-10
    outputFormat: string              // brief|detailed|technical
  }

  advancedConfig: {
    enableCaching: boolean
    cacheExpireMins: number
    enableRetry: boolean
    maxRetries: number
    retryDelayMs: number
    timeoutSeconds: number
    keepAlive?: boolean
    enableCompression?: boolean
  }

  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3. 后端实现建议

#### 用户隔离
```sql
-- 查询条件中添加 userId
SELECT * FROM agent_configs
WHERE userId = ? AND id = ?
```

#### 默认配置处理
```sql
-- 每个用户有一个默认配置
UPDATE agent_configs SET isDefault = false
WHERE userId = ? AND isDefault = true

UPDATE agent_configs SET isDefault = true
WHERE userId = ? AND id = ?
```

#### 参数验证
```javascript
function validateAgentConfig(config) {
  // 验证必填字段
  if (!config.name?.trim()) throw new Error('配置名称必填')

  // 验证参数范围
  if (config.responseParams.temperature < 0 ||
      config.responseParams.temperature > 1) {
    throw new Error('温度值必须在 0-1 之间')
  }

  // 验证作物类型
  const validCrops = ['rice', 'wheat', 'corn', ...]
  if (!config.agentConfig.cropTypes.every(c => validCrops.includes(c))) {
    throw new Error('无效的作物类型')
  }
}
```

### 4. SSE 调用中的配置应用

后端在 `/agent/agriculture-agent-v2` 端点接收 `agentConfigId`：

```javascript
GET /agent/agriculture-agent-v2?prompt=...&agentConfigId=...

// 后端根据 agentConfigId 查询配置
const config = await getAgentConfig(agentConfigId)

// 应用配置参数
const systemPrompt = config.systemPrompt.template +
                     (config.systemPrompt.customInstructions || '')

const modelParams = {
  temperature: config.responseParams.temperature,
  maxTokens: config.responseParams.maxTokens,
  topP: config.responseParams.topP,
  topK: config.responseParams.topK,
  // ...
}

// 应用业务参数
const cropTypes = config.agentConfig.cropTypes
const diagnosisMode = config.agentConfig.diseaseDetectionMode
// ...
```

---

## 📋 测试流程

### 前端测试
1. 打开浏览器开发者工具
2. 在 AgentHomeView 点击 "Agent设置" 按钮
3. 测试各个功能：
   - [ ] 创建新配置
   - [ ] 编辑配置参数
   - [ ] 选择预设模板
   - [ ] 应用参数预设
   - [ ] 删除配置
   - [ ] 设置默认配置
   - [ ] 切换不同配置
   - [ ] 刷新页面后配置仍存在

### 集成测试
1. 配置后端 API
2. 创建会话并验证：
   - [ ] 会话成功关联配置
   - [ ] localStorage 正确保存配置
   - [ ] SSE 调用传递 agentConfigId
   - [ ] 后端根据配置调整 Agent 行为

---

## 🐛 常见问题

### Q1: 配置没有保存到后端？
A: 检查后端 API 实现是否完成，确保返回正确的 AgentConfig 对象。

### Q2: 切换配置后 SSE 没有应用新配置？
A: 创建新会话时会自动关联配置。需要新开一个会话才能应用新配置。

### Q3: localStorage 里的配置数据很多？
A: 这是正常的。Pinia 的持久化插件会自动管理 localStorage 数据。大约 50 个配置需要 ~200KB。

### Q4: 如何禁用某个功能？
A: 在 AgentParamSection 中的功能开关：
```javascript
enableImageAnalysis: false,      // 禁用图像分析
enableFieldManagement: false,    // 禁用田间管理
enablePesticideAdvice: false,    // 禁用用药方案
```

---

## 💡 进阶用法

### 1. 自定义提示词模板

在 `SystemPromptSection.vue` 中添加新模板：

```javascript
const systemPromptTemplates = [
  // ... 现有模板
  {
    id: 6,
    name: '自定义模板名称',
    description: '模板描述',
    template: `你的自定义提示词内容...`
  }
]
```

### 2. 添加新的响应参数

在 `ResponseParamSection.vue` 中添加新参数：

```javascript
<div class="param-group">
  <label>新参数名称</label>
  <van-slider
    :model-value="modelValue.newParam"
    min="0"
    max="100"
    @update:model-value="updateParam('newParam', $event)"
  />
</div>
```

### 3. 导出配置为 JSON

```javascript
const exportConfig = () => {
  const json = JSON.stringify(agentConfigStore.currentConfig, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `config-${Date.now()}.json`
  a.click()
}
```

---

## 📚 相关文档

- [完整实现报告](./AGENT_CONFIG_IMPLEMENTATION.md)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vant 4 文档](https://vant-ui.github.io/vant/)

---

## ✅ 检查清单

部署前确保：

- [ ] 后端 API 端点已全部实现
- [ ] 数据表已创建（agent_configs 等）
- [ ] 授权检查已实现（userId 隔离）
- [ ] 参数验证已实现
- [ ] 错误处理已完善
- [ ] 前端 localStorage 正常工作
- [ ] SSE 调用正确传递 agentConfigId
- [ ] 单元测试编写完成
- [ ] E2E 测试通过
- [ ] 性能基准测试通过

---

**最后更新**：2026-02-09
**维护者**：Claude Code
**版本**：1.0.0
