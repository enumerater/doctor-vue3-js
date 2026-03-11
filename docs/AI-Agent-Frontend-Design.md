# 小农 AI Agent 前端设计文档

> 版本：v1.0 | 日期：2026-03-10 | 项目：doctor-vue3-js（小农智农平台）

---

## 一、概述

### 1.1 背景

当前系统已具备 AI 对话（Chat）和农业 Agent 工作流（Agent WebSocket）的基础能力。本方案在此基础上，构建一套**通用 Web AI Agent 协议**，使大模型能够：

- 自主跳转页面、操纵 UI
- 调用后端 API 完成数据库 CRUD
- 通过自然语言指令驱动多步骤任务
- 以可扩展协议支撑未来新增功能

### 1.2 目标

| 目标     | 说明                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 通用协议 | 定义 `AgentAction Protocol`，所有能力以 Action 形式注册，支持第三方扩展 |
| 页面自治 | Agent 可导航路由、填充表单、触发按钮，用户可观看全过程                  |
| 后端操作 | Agent 可直接调用 API 层完成数据增删改查                                 |
| 安全可控 | 敏感操作需用户确认，操作全程可回滚                                      |
| 渐进增强 | 不影响现有聊天/Agent 功能，新能力以插件方式叠加                         |

### 1.3 参考

- OpenClaw / Open Interpreter：自然语言驱动计算机操作
- Anthropic Computer Use：模型控制 UI
- LangChain Tools / Function Calling：工具协议设计

---

## 二、整体架构

```
┌─────────────────────────────────────────────────────┐
│                    用户界面层                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Chat UI  │  │ Agent Panel  │  │  Task Monitor  │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       │               │                  │           │
│  ┌────▼───────────────▼──────────────────▼───────┐   │
│  │            Agent Orchestrator                  │   │
│  │         (stores/webAgent.js)                   │   │
│  └────┬───────────┬──────────────┬───────────────┘   │
│       │           │              │                    │
│  ┌────▼────┐ ┌────▼─────┐ ┌─────▼──────┐            │
│  │ Action  │ │ Action   │ │  Action    │  ...更多    │
│  │Registry │ │Executor  │ │ Sandbox    │             │
│  └────┬────┘ └────┬─────┘ └─────┬──────┘            │
│       │           │              │                    │
│  ┌────▼───────────▼──────────────▼───────────────┐   │
│  │          AgentAction Protocol (协议层)          │   │
│  │  ┌─────────┐┌──────────┐┌────────┐┌─────────┐ │   │
│  │  │Navigate ││ ApiCall  ││FormFill││ Confirm │ │   │
│  │  └─────────┘└──────────┘└────────┘└─────────┘ │   │
│  │  ┌─────────┐┌──────────┐┌────────┐┌─────────┐ │   │
│  │  │  Toast  ││  Wait    ││Compose ││ Custom  │ │   │
│  │  └─────────┘└──────────┘└────────┘└─────────┘ │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │           基础设施层                            │   │
│  │  Vue Router │ Axios │ Pinia │ WebSocket        │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

           │ WebSocket / SSE │
           ▼                 ▼
┌─────────────────────────────────┐
│          后端 (Java)             │
│  LLM 决策引擎 → Action Plan     │
│  ┌───────────┐  ┌────────────┐  │
│  │ 大模型推理  │  │ 业务API    │  │
│  └───────────┘  └────────────┘  │
└─────────────────────────────────┘
```

---

## 三、AgentAction Protocol（核心协议）

### 3.1 协议总览

每个 Agent 能力被抽象为一个 **Action**，遵循统一接口规范：

```typescript
// 协议核心类型定义
interface AgentAction {
  /** 全局唯一标识，格式：domain:action_name */
  type: string

  /** Action 元信息 */
  meta: {
    name: string // 显示名称
    description: string // 功能描述（供 LLM 理解）
    icon?: string // 图标
    category: string // 分类：navigation | data | ui | system
    requireConfirm: boolean // 是否需要用户确认
    dangerLevel: 'safe' | 'moderate' | 'dangerous'
    reversible: boolean // 是否支持撤销
  }

  /** 输入参数 JSON Schema */
  inputSchema: JSONSchema

  /** 执行函数 */
  execute: (params: any, context: ActionContext) => Promise<ActionResult>

  /** 撤销函数（可选） */
  undo?: (result: ActionResult, context: ActionContext) => Promise<void>

  /** 参数校验（可选，默认用 inputSchema 校验） */
  validate?: (params: any) => ValidationResult
}

interface ActionContext {
  router: Router // Vue Router 实例
  stores: StoreMap // 所有 Pinia Store
  api: ApiMap // 所有 API 模块
  agent: AgentController // Agent 控制器
  user: UserInfo // 当前用户信息
}

interface ActionResult {
  success: boolean
  data?: any
  message?: string
  undoData?: any // 撤销所需数据
  nextSuggestion?: string // 建议的下一步操作
}
```

### 3.2 内置 Action 类型

#### 3.2.1 `navigate` — 页面导航

```json
{
  "type": "system:navigate",
  "params": {
    "path": "/farm",
    "query": { "tab": "active" },
    "description": "跳转到农场管理页面"
  }
}
```

#### 3.2.2 `api_call` — 后端 API 调用

```json
{
  "type": "data:api_call",
  "params": {
    "module": "farm",
    "method": "createFarm",
    "args": {
      "name": "王大爷的果园",
      "location": "山东烟台",
      "area": 50
    }
  }
}
```

#### 3.2.3 `form_fill` — 表单自动填充

```json
{
  "type": "ui:form_fill",
  "params": {
    "route": "/farm/create",
    "fields": {
      "farmName": "王大爷的果园",
      "location": "山东烟台",
      "area": 50
    },
    "autoSubmit": false
  }
}
```

#### 3.2.4 `confirm` — 用户确认

```json
{
  "type": "system:confirm",
  "params": {
    "title": "确认创建农场",
    "message": "即将创建农场「王大爷的果园」，确认继续？",
    "details": {
      "名称": "王大爷的果园",
      "位置": "山东烟台",
      "面积": "50亩"
    },
    "confirmText": "确认创建",
    "cancelText": "取消"
  }
}
```

#### 3.2.5 `toast` — 消息通知

```json
{
  "type": "ui:toast",
  "params": {
    "message": "农场创建成功！",
    "type": "success",
    "duration": 3000
  }
}
```

#### 3.2.6 `compose` — 组合动作（多步骤）

```json
{
  "type": "system:compose",
  "params": {
    "description": "创建农场并添加地块",
    "steps": [
      { "type": "system:navigate", "params": { "path": "/farm/create" } },
      { "type": "system:confirm", "params": { "title": "确认", "message": "即将创建农场" } },
      {
        "type": "data:api_call",
        "params": { "module": "farm", "method": "createFarm", "args": {} }
      },
      { "type": "ui:toast", "params": { "message": "创建成功", "type": "success" } },
      { "type": "system:navigate", "params": { "path": "/farm/{result.data.id}" } }
    ]
  }
}
```

### 3.3 协议通信格式（WebSocket）

前后端通过 WebSocket 传递 Action 指令，格式如下：

**后端 → 前端（Action 指令）**

```json
{
  "type": "agent_action",
  "requestId": "req_abc123",
  "action": {
    "type": "data:api_call",
    "params": { ... }
  },
  "thought": "用户想创建一个农场，我需要调用农场创建API...",
  "planOverview": {
    "totalSteps": 3,
    "currentStep": 1,
    "description": "创建农场流程"
  }
}
```

**前端 → 后端（执行结果）**

```json
{
  "type": "action_result",
  "requestId": "req_abc123",
  "result": {
    "success": true,
    "data": { "id": 42, "name": "王大爷的果园" },
    "message": "农场创建成功"
  }
}
```

**前端 → 后端（用户确认结果）**

```json
{
  "type": "confirm_result",
  "requestId": "req_abc123",
  "confirmed": true
}
```

---

## 四、前端模块设计

### 4.1 目录结构（新增部分）

```
src/
├── agent/                          # Agent 核心模块
│   ├── protocol/                   # 协议层
│   │   ├── types.js                # 类型定义与常量
│   │   └── schema.js               # Action Schema 校验
│   │
│   ├── registry/                   # Action 注册中心
│   │   └── actionRegistry.js       # Action 注册/发现/管理
│   │
│   ├── executor/                   # 执行引擎
│   │   ├── actionExecutor.js       # Action 执行器（调度核心）
│   │   └── actionSandbox.js        # 安全沙箱（权限控制）
│   │
│   ├── actions/                    # 内置 Action 实现
│   │   ├── navigate.action.js      # 页面导航
│   │   ├── apiCall.action.js       # API 调用
│   │   ├── formFill.action.js      # 表单填充
│   │   ├── confirm.action.js       # 用户确认
│   │   ├── toast.action.js         # 消息通知
│   │   ├── compose.action.js       # 组合动作
│   │   └── wait.action.js          # 等待/延时
│   │
│   ├── actions-farm/               # 农场业务 Action（扩展示例）
│   │   ├── createFarm.action.js    # 创建农场
│   │   ├── createPlot.action.js    # 创建地块
│   │   ├── addPesticide.action.js  # 添加施药记录
│   │   └── index.js                # 批量注册
│   │
│   └── index.js                    # 统一导出 & 初始化
│
├── stores/
│   └── webAgent.js                 # Agent 状态管理（新增）
│
├── components/
│   └── agent/                      # Agent UI 组件（新增）
│       ├── AgentOverlay.vue        # Agent 操作浮层（全局覆盖）
│       ├── AgentTaskPanel.vue      # 任务进度面板
│       ├── AgentStepCard.vue       # 单步骤卡片
│       ├── AgentConfirmDialog.vue  # 确认对话框
│       ├── AgentActionPreview.vue  # Action 预览（执行前展示）
│       └── AgentFloatingButton.vue # 悬浮入口按钮
│
└── views/
    └── chat/
        └── ChatDetail.vue          # 改造：集成 Agent Action 触发
```

### 4.2 核心模块详细设计

#### 4.2.1 Action Registry（Action 注册中心）

```javascript
// src/agent/registry/actionRegistry.js

class ActionRegistry {
  #actions = new Map()
  #categories = new Map()

  /**
   * 注册一个 Action
   * @param {AgentAction} action
   */
  register(action) {
    this.validateAction(action)
    this.#actions.set(action.type, action)

    const cat = action.meta.category
    if (!this.#categories.has(cat)) {
      this.#categories.set(cat, [])
    }
    this.#categories.get(cat).push(action.type)
  }

  /**
   * 批量注册
   * @param {AgentAction[]} actions
   */
  registerAll(actions) {
    actions.forEach((a) => this.register(a))
  }

  /**
   * 获取 Action
   */
  get(type) {
    return this.#actions.get(type)
  }

  /**
   * 获取所有 Action 的 Schema 描述（供后端 LLM 使用）
   * 后端可通过 API 拉取此列表来构建 Function Calling Schema
   */
  getManifest() {
    const manifest = []
    for (const [type, action] of this.#actions) {
      manifest.push({
        type,
        meta: action.meta,
        inputSchema: action.inputSchema,
      })
    }
    return manifest
  }

  /**
   * 按分类获取
   */
  getByCategory(category) {
    const types = this.#categories.get(category) || []
    return types.map((t) => this.#actions.get(t))
  }
}

export const actionRegistry = new ActionRegistry()
```

#### 4.2.2 Action Executor（执行引擎）

```javascript
// src/agent/executor/actionExecutor.js

import { actionRegistry } from '../registry/actionRegistry'
import { useWebAgentStore } from '@/stores/webAgent'

class ActionExecutor {
  #context = null

  /**
   * 初始化执行上下文（在 app 启动时调用）
   */
  init({ router, stores, api }) {
    this.#context = { router, stores, api }
  }

  /**
   * 执行单个 Action
   */
  async execute(actionPayload) {
    const { type, params } = actionPayload
    const store = useWebAgentStore()
    const action = actionRegistry.get(type)

    if (!action) {
      throw new Error(`Unknown action type: ${type}`)
    }

    // 1. 参数校验
    if (action.validate) {
      const validation = action.validate(params)
      if (!validation.valid) {
        return { success: false, message: validation.message }
      }
    }

    // 2. 权限检查 — 危险操作需用户确认
    if (action.meta.requireConfirm) {
      const confirmed = await store.requestConfirm({
        title: action.meta.name,
        message: `即将执行: ${action.meta.description}`,
        dangerLevel: action.meta.dangerLevel,
        params,
      })
      if (!confirmed) {
        return { success: false, message: '用户取消操作' }
      }
    }

    // 3. 记录开始
    store.stepStart(type, params)

    try {
      // 4. 执行
      const result = await action.execute(params, {
        ...this.#context,
        agent: this,
        user: this.#context.stores.user,
      })

      // 5. 记录结果（包含撤销数据）
      store.stepComplete(type, result)

      // 6. 保存撤销信息
      if (action.undo && result.undoData) {
        store.pushUndoStack({ type, result, action })
      }

      return result
    } catch (err) {
      store.stepError(type, err.message)
      return { success: false, message: err.message }
    }
  }

  /**
   * 执行组合动作（按顺序依次执行多步）
   */
  async executeCompose(steps, context = {}) {
    const results = []
    for (const step of steps) {
      // 支持模板变量替换，如 {result.data.id}
      const resolvedParams = this.resolveParams(step.params, results)
      const result = await this.execute({ type: step.type, params: resolvedParams })
      results.push(result)

      if (!result.success) {
        return { success: false, message: `步骤 ${step.type} 失败: ${result.message}`, results }
      }
    }
    return { success: true, results }
  }

  /**
   * 解析模板变量
   * 例如 "/farm/{0.data.id}" → "/farm/42"
   */
  resolveParams(params, previousResults) {
    const json = JSON.stringify(params)
    const resolved = json.replace(/\{(\d+)\.([^}]+)\}/g, (_, idx, path) => {
      const result = previousResults[parseInt(idx)]
      return path.split('.').reduce((obj, key) => obj?.[key], result) ?? ''
    })
    return JSON.parse(resolved)
  }
}

export const actionExecutor = new ActionExecutor()
```

#### 4.2.3 Action 实现示例

```javascript
// src/agent/actions/navigate.action.js

export const navigateAction = {
  type: 'system:navigate',

  meta: {
    name: '页面导航',
    description: '跳转到系统中的指定页面',
    icon: 'Compass',
    category: 'navigation',
    requireConfirm: false,
    dangerLevel: 'safe',
    reversible: true,
  },

  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: '目标路由路径，如 /farm' },
      query: { type: 'object', description: '路由查询参数' },
    },
    required: ['path'],
  },

  async execute(params, context) {
    const { router } = context
    const from = router.currentRoute.value.fullPath

    await router.push({
      path: params.path,
      query: params.query || {},
    })

    return {
      success: true,
      message: `已跳转到 ${params.path}`,
      undoData: { previousPath: from },
    }
  },

  async undo(result, context) {
    await context.router.push(result.undoData.previousPath)
  },
}
```

```javascript
// src/agent/actions/apiCall.action.js

import * as apiModules from '@/axios'

export const apiCallAction = {
  type: 'data:api_call',

  meta: {
    name: 'API 调用',
    description: '调用后端接口执行数据操作',
    icon: 'Connection',
    category: 'data',
    requireConfirm: true, // API 操作默认需要确认
    dangerLevel: 'moderate',
    reversible: false,
  },

  inputSchema: {
    type: 'object',
    properties: {
      module: { type: 'string', description: 'API 模块名，如 farm, chat, diagnosis' },
      method: { type: 'string', description: '方法名，如 createFarm, deleteFarm' },
      args: { type: 'object', description: '调用参数' },
    },
    required: ['module', 'method'],
  },

  validate(params) {
    const mod = apiModules[params.module]
    if (!mod) return { valid: false, message: `API 模块 ${params.module} 不存在` }
    if (typeof mod[params.method] !== 'function') {
      return { valid: false, message: `方法 ${params.module}.${params.method} 不存在` }
    }
    return { valid: true }
  },

  async execute(params, context) {
    const mod = apiModules[params.module]
    const fn = mod[params.method]
    const response = await fn(params.args)
    return {
      success: true,
      data: response.data ?? response,
      message: `${params.module}.${params.method} 调用成功`,
    }
  },
}
```

```javascript
// src/agent/actions-farm/createFarm.action.js
// 农场业务 Action 示例：高层封装，底层调用通用 API Action

export const createFarmAction = {
  type: 'farm:create',

  meta: {
    name: '创建农场',
    description: '为当前用户创建一个新的农场，需要提供农场名称、位置、面积等信息',
    icon: 'HomeFilled',
    category: 'data',
    requireConfirm: true,
    dangerLevel: 'moderate',
    reversible: true,
  },

  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '农场名称' },
      location: { type: 'string', description: '农场位置' },
      area: { type: 'number', description: '面积（亩）' },
    },
    required: ['name', 'location'],
  },

  async execute(params, context) {
    const { api } = context
    const res = await api.farm.createFarm(params)
    const farmId = res.data?.id || res.id

    // 创建后自动跳转到农场详情
    await context.router.push(`/farm/${farmId}`)

    return {
      success: true,
      data: { id: farmId, ...params },
      message: `农场「${params.name}」创建成功`,
      undoData: { farmId },
      nextSuggestion: '是否需要为这个农场添加地块？',
    }
  },

  async undo(result, context) {
    await context.api.farm.deleteFarm(result.undoData.farmId)
    await context.router.push('/farm')
  },
}
```

### 4.3 Store 设计 — webAgent.js

```javascript
// src/stores/webAgent.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWebAgentStore = defineStore('webAgent', () => {
  // ========== 状态 ==========

  /** Agent 是否激活 */
  const active = ref(false)

  /** 当前任务 */
  const currentTask = ref(null)
  // { id, description, status: 'running'|'paused'|'done'|'error', startTime }

  /** 执行步骤列表 */
  const steps = ref([])
  // [{ type, params, status: 'pending'|'running'|'done'|'error', result, startTime, endTime }]

  /** 当前正在执行的步骤索引 */
  const currentStepIndex = ref(-1)

  /** 确认请求队列 */
  const pendingConfirm = ref(null)
  // { title, message, dangerLevel, params, resolve, reject }

  /** 撤销栈 */
  const undoStack = ref([])

  /** Agent 思考过程 */
  const thoughts = ref([])

  /** WebSocket 连接状态 */
  const wsConnected = ref(false)

  // ========== 计算属性 ==========

  const isRunning = computed(() => currentTask.value?.status === 'running')
  const progress = computed(() => {
    if (steps.value.length === 0) return 0
    const done = steps.value.filter((s) => s.status === 'done').length
    return Math.round((done / steps.value.length) * 100)
  })
  const canUndo = computed(() => undoStack.value.length > 0)

  // ========== 方法 ==========

  function startTask(description) {
    currentTask.value = {
      id: Date.now().toString(),
      description,
      status: 'running',
      startTime: new Date(),
    }
    steps.value = []
    currentStepIndex.value = -1
    thoughts.value = []
    active.value = true
  }

  function stepStart(type, params) {
    const step = {
      type,
      params,
      status: 'running',
      result: null,
      startTime: new Date(),
      endTime: null,
    }
    steps.value.push(step)
    currentStepIndex.value = steps.value.length - 1
  }

  function stepComplete(type, result) {
    const step = steps.value[currentStepIndex.value]
    if (step) {
      step.status = 'done'
      step.result = result
      step.endTime = new Date()
    }
  }

  function stepError(type, message) {
    const step = steps.value[currentStepIndex.value]
    if (step) {
      step.status = 'error'
      step.result = { success: false, message }
      step.endTime = new Date()
    }
  }

  function completeTask() {
    if (currentTask.value) {
      currentTask.value.status = 'done'
    }
  }

  function addThought(thought) {
    thoughts.value.push({ text: thought, time: new Date() })
  }

  /** 请求用户确认（返回 Promise） */
  function requestConfirm({ title, message, dangerLevel, params }) {
    return new Promise((resolve) => {
      pendingConfirm.value = { title, message, dangerLevel, params, resolve }
    })
  }

  function resolveConfirm(confirmed) {
    if (pendingConfirm.value) {
      pendingConfirm.value.resolve(confirmed)
      pendingConfirm.value = null
    }
  }

  function pushUndoStack(entry) {
    undoStack.value.push(entry)
  }

  function reset() {
    active.value = false
    currentTask.value = null
    steps.value = []
    currentStepIndex.value = -1
    pendingConfirm.value = null
    thoughts.value = []
  }

  return {
    active,
    currentTask,
    steps,
    currentStepIndex,
    pendingConfirm,
    undoStack,
    thoughts,
    wsConnected,
    isRunning,
    progress,
    canUndo,
    startTask,
    stepStart,
    stepComplete,
    stepError,
    completeTask,
    addThought,
    requestConfirm,
    resolveConfirm,
    pushUndoStack,
    reset,
  }
})
```

---

## 五、UI 组件设计

### 5.1 总体布局

```
┌─────────────────────────────────────────────────┐
│  TopHeader                                       │
├──────┬──────────────────────────────────────────┤
│      │                                           │
│ Side │          当前页面内容                       │
│ Nav  │                                           │
│      │   ┌─────────────────────────────────┐     │
│      │   │     AgentOverlay (浮层)          │     │
│      │   │  ┌────────────────────────┐     │     │
│      │   │  │ 高亮当前操作区域        │     │     │
│      │   │  │ (半透明遮罩+聚光灯)     │     │     │
│      │   │  └────────────────────────┘     │     │
│      │   └─────────────────────────────────┘     │
│      │                                           │
├──────┴──────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐    │
│  │        AgentTaskPanel (底部面板)           │    │
│  │  思考: "正在创建农场..."                    │    │
│  │  ● 跳转农场创建页 ✓                        │    │
│  │  ● 填充表单数据    ✓                       │    │
│  │  ◎ 调用创建API    ⟳ (执行中)              │    │
│  │  ○ 跳转农场详情   (待执行)                  │    │
│  │  [暂停] [终止] [撤销上一步]                  │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  ◉ AgentFloatingButton (入口)                     │
└───────────────────────────────────────────────────┘
```

### 5.2 组件说明

#### AgentFloatingButton.vue — 悬浮入口

```
位置：页面右下角固定定位
状态：
  - 空闲态：显示 AI 图标，点击展开输入框
  - 执行态：显示进度环，点击展开 TaskPanel
  - 完成态：显示勾号，3秒后恢复空闲

交互：
  - 点击 → 展开命令输入框（支持语音/文字）
  - 长按 → 展开历史任务列表
  - 拖拽 → 可移动位置
```

#### AgentTaskPanel.vue — 任务进度面板

```
位置：页面底部弹出（可拖拽调整高度）
结构：
  ┌──────────────────────────────────┐
  │ 拖拽手柄                          │
  ├──────────────────────────────────┤
  │ 💭 Agent 思考过程                 │
  │ "用户想创建一个位于山东的果园，     │
  │  我需要先跳转到创建页面..."        │
  ├──────────────────────────────────┤
  │ 步骤列表：                        │
  │ ✅ 1. 跳转到 /farm/create         │
  │ ✅ 2. 填充表单（名称、位置、面积）  │
  │ ⏳ 3. 等待用户确认                 │
  │ ⬚ 4. 提交创建请求                 │
  │ ⬚ 5. 跳转到农场详情               │
  ├──────────────────────────────────┤
  │ [⏸ 暂停] [⏹ 终止] [↩ 撤销]       │
  └──────────────────────────────────┘
```

#### AgentConfirmDialog.vue — 确认弹窗

```
场景：执行敏感操作前弹出
结构：
  ┌──────────────────────────────────┐
  │ ⚠️ Agent 请求确认                 │
  ├──────────────────────────────────┤
  │                                  │
  │ 即将执行：创建农场                │
  │                                  │
  │ ┌──────────────────────────┐     │
  │ │ 农场名称：王大爷的果园     │     │
  │ │ 位置：山东烟台            │     │
  │ │ 面积：50亩               │     │
  │ └──────────────────────────┘     │
  │                                  │
  │ 风险等级：🟡 中等                 │
  │                                  │
  │    [取消]         [确认执行]       │
  └──────────────────────────────────┘

颜色编码：
  🟢 safe     — 绿色边框
  🟡 moderate — 黄色边框
  🔴 dangerous — 红色边框 + 二次确认
```

#### AgentOverlay.vue — 操作浮层

```
场景：Agent 操作 UI 时覆盖在页面上
功能：
  - 半透明遮罩覆盖全页面
  - 聚光灯效果高亮当前操作区域
  - 操作指示器显示 "Agent 正在填充表单..."
  - 用户可点击遮罩暂停 Agent
```

### 5.3 组件层级

```
App.vue
├── AppShell.vue
│   ├── TopHeader.vue
│   ├── SideNav.vue
│   ├── <router-view />          ← 业务页面
│   │
│   ├── AgentOverlay.vue          ← 全局浮层（z-index: 1000）
│   ├── AgentTaskPanel.vue        ← 底部面板（z-index: 1001）
│   ├── AgentConfirmDialog.vue    ← 确认弹窗（z-index: 1002）
│   └── AgentFloatingButton.vue   ← 悬浮按钮（z-index: 999）
```

---

## 六、通信流程

### 6.1 完整流程时序图

```
用户            前端(Vue)           WebSocket          后端(Java+LLM)
 │                │                    │                    │
 │ "帮我创建一个   │                    │                    │
 │  山东的果园"    │                    │                    │
 │───────────────▶│                    │                    │
 │                │ {type:"user_msg",  │                    │
 │                │  text:"帮我创建..."}│                    │
 │                │───────────────────▶│                    │
 │                │                    │───────────────────▶│
 │                │                    │                    │ LLM 分析意图
 │                │                    │                    │ 生成 Action Plan
 │                │                    │◀───────────────────│
 │                │ {type:"thought",   │                    │
 │                │  text:"需要创建.."}│                    │
 │                │◀───────────────────│                    │
 │  显示思考过程   │                    │                    │
 │◀───────────────│                    │                    │
 │                │                    │                    │
 │                │ {type:"agent_action",                   │
 │                │  action:{type:"system:navigate",        │
 │                │   params:{path:"/farm/create"}}}        │
 │                │◀───────────────────│                    │
 │  页面跳转动画   │ router.push(...)   │                    │
 │◀───────────────│                    │                    │
 │                │ {type:"action_result",                  │
 │                │  success: true}    │                    │
 │                │───────────────────▶│                    │
 │                │                    │───────────────────▶│
 │                │                    │                    │
 │                │ {type:"agent_action",                   │
 │                │  action:{type:"system:confirm",         │
 │                │   params:{title:"确认创建农场",...}}}    │
 │                │◀───────────────────│                    │
 │  确认弹窗       │                    │                    │
 │◀───────────────│                    │                    │
 │ 点击「确认」    │                    │                    │
 │───────────────▶│                    │                    │
 │                │ {type:"confirm_result",                 │
 │                │  confirmed: true}  │                    │
 │                │───────────────────▶│                    │
 │                │                    │───────────────────▶│
 │                │                    │                    │
 │                │ {type:"agent_action",                   │
 │                │  action:{type:"data:api_call",          │
 │                │   params:{module:"farm",                │
 │                │    method:"createFarm",                 │
 │                │    args:{name:"果园",location:"山东"}}}} │
 │                │◀───────────────────│                    │
 │                │ 调用 farm.createFarm()                  │
 │                │─────────────────────────────────────────│
 │                │                    │                    │ 数据库写入
 │                │◀─────────────────────────────────────────│
 │                │ {type:"action_result",                  │
 │                │  success:true, data:{id:42}}            │
 │                │───────────────────▶│                    │
 │                │                    │───────────────────▶│
 │                │                    │                    │
 │                │ {type:"agent_action",                   │
 │                │  action:{type:"system:navigate",        │
 │                │   params:{path:"/farm/42"}}}            │
 │                │◀───────────────────│                    │
 │  跳转农场详情   │                    │                    │
 │◀───────────────│                    │                    │
 │                │                    │                    │
 │                │ {type:"task_complete",                  │
 │                │  summary:"农场创建成功"}                 │
 │                │◀───────────────────│                    │
 │  任务完成动画   │                    │                    │
 │◀───────────────│                    │                    │
```

### 6.2 WebSocket 消息类型汇总

| 方向   | type             | 说明                     |
| ------ | ---------------- | ------------------------ |
| → 后端 | `user_msg`       | 用户自然语言指令         |
| → 后端 | `action_result`  | Action 执行结果          |
| → 后端 | `confirm_result` | 用户确认/拒绝            |
| → 后端 | `task_control`   | 暂停/恢复/终止任务       |
| → 后端 | `manifest_sync`  | 同步前端 Action 能力清单 |
| ← 前端 | `thought`        | Agent 思考过程           |
| ← 前端 | `agent_action`   | 要执行的 Action 指令     |
| ← 前端 | `task_complete`  | 任务完成通知             |
| ← 前端 | `task_error`     | 任务失败通知             |
| ← 前端 | `plan_overview`  | 任务计划概览             |

---

## 七、Action 扩展指南

### 7.1 编写自定义 Action

只需三步即可扩展一个新能力：

**第一步：创建 Action 文件**

```javascript
// src/agent/actions-custom/myAction.action.js

export const myAction = {
  // 1. 唯一类型标识
  type: 'custom:my_action',

  // 2. 元信息（LLM 据此判断何时调用）
  meta: {
    name: '我的自定义操作',
    description: '当用户需要 XXX 时调用此操作',
    category: 'data',
    requireConfirm: false,
    dangerLevel: 'safe',
    reversible: false,
  },

  // 3. 参数 Schema（LLM 据此生成参数）
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '参数说明' },
    },
    required: ['param1'],
  },

  // 4. 执行逻辑
  async execute(params, context) {
    // context 中可获取 router, stores, api, user
    const result = await context.api.someModule.someMethod(params)
    return {
      success: true,
      data: result,
      message: '操作完成',
    }
  },
}
```

**第二步：注册 Action**

```javascript
// src/agent/actions-custom/index.js
import { myAction } from './myAction.action.js'
export const customActions = [myAction]

// src/agent/index.js — 在初始化时注册
import { customActions } from './actions-custom'
actionRegistry.registerAll(customActions)
```

**第三步：同步到后端**

前端启动时通过 WebSocket 发送 `manifest_sync`，后端 LLM 即可感知新能力。

### 7.2 Action 分类规范

| category     | 前缀                  | 说明                   | 示例                               |
| ------------ | --------------------- | ---------------------- | ---------------------------------- |
| `navigation` | `system:`             | 页面跳转、路由操作     | `system:navigate`                  |
| `data`       | `data:` / `{domain}:` | 数据增删改查           | `data:api_call`, `farm:create`     |
| `ui`         | `ui:`                 | 界面操作（表单、提示） | `ui:form_fill`, `ui:toast`         |
| `system`     | `system:`             | 系统级操作             | `system:confirm`, `system:compose` |

### 7.3 安全等级规范

| dangerLevel | 说明                     | 处理方式            |
| ----------- | ------------------------ | ------------------- |
| `safe`      | 无副作用（导航、查询）   | 直接执行            |
| `moderate`  | 有副作用（创建、修改）   | 弹窗确认后执行      |
| `dangerous` | 破坏性（删除、批量操作） | 二次确认 + 输入验证 |

---

## 八、安全设计

### 8.1 权限沙箱

```javascript
// src/agent/executor/actionSandbox.js

/**
 * Action 沙箱 — 限制 Agent 可执行的操作范围
 */
class ActionSandbox {
  #whitelist = new Set() // 允许的 Action 类型
  #blacklist = new Set() // 禁止的 Action 类型
  #rateLimits = new Map() // 频率限制
  #executionCounts = new Map()

  /**
   * 设置白名单模式（仅允许列表中的 Action）
   */
  setWhitelist(types) {
    this.#whitelist = new Set(types)
  }

  /**
   * 设置黑名单（禁止特定 Action）
   */
  setBlacklist(types) {
    this.#blacklist = new Set(types)
  }

  /**
   * 设置频率限制
   */
  setRateLimit(type, maxPerMinute) {
    this.#rateLimits.set(type, maxPerMinute)
  }

  /**
   * 检查是否允许执行
   */
  canExecute(type) {
    // 黑名单检查
    if (this.#blacklist.has(type)) {
      return { allowed: false, reason: `Action ${type} 已被禁止` }
    }

    // 白名单检查
    if (this.#whitelist.size > 0 && !this.#whitelist.has(type)) {
      return { allowed: false, reason: `Action ${type} 不在允许列表中` }
    }

    // 频率限制检查
    if (this.#rateLimits.has(type)) {
      const limit = this.#rateLimits.get(type)
      const count = this.#executionCounts.get(type) || 0
      if (count >= limit) {
        return { allowed: false, reason: `Action ${type} 已达到频率限制 (${limit}/min)` }
      }
    }

    return { allowed: true }
  }
}

export const actionSandbox = new ActionSandbox()
```

### 8.2 安全策略

| 风险             | 防护措施                                            |
| ---------------- | --------------------------------------------------- |
| 未授权的数据修改 | `requireConfirm: true` + 确认弹窗                   |
| 无限循环执行     | Action 频率限制 + 最大步骤数限制（默认 20 步）      |
| 敏感 API 调用    | API 白名单 + 黑名单机制                             |
| XSS / 注入       | 参数 Schema 校验 + 前端输入净化                     |
| Token 泄露       | Action 无法直接访问 localStorage，通过 context 获取 |
| 批量删除         | `dangerous` 等级 + 二次确认 + 操作限速              |

---

## 九、现有系统集成方案

### 9.1 与现有 Agent WebSocket 的关系

```
现有架构:
  ChatDetail.vue → agentStore → ws://agent (思考+工具调用+对话)

新增架构:
  ChatDetail.vue → webAgentStore → ws://agent (复用同一 WebSocket)
                                    ↓
                            新增 agent_action 消息类型
                                    ↓
                            actionExecutor 执行
```

**核心改动**：复用现有 Agent WebSocket 连接，扩展消息类型。在 `stores/agent.js` 的 `onMessage` 中增加对 `agent_action` 类型的分发。

### 9.2 改造点清单

| 文件                        | 改动 | 说明                             |
| --------------------------- | ---- | -------------------------------- |
| `stores/agent.js`           | 小改 | onMessage 增加 agent_action 分发 |
| `views/chat/ChatDetail.vue` | 小改 | 引入 AgentTaskPanel 组件         |
| `layouts/AppShell.vue`      | 小改 | 挂载全局 Agent 组件              |
| `main.js`                   | 小改 | 初始化 actionExecutor            |
| `src/agent/**`              | 新增 | Agent 协议模块（全部为新增文件） |
| `src/stores/webAgent.js`    | 新增 | Agent 状态管理                   |
| `src/components/agent/**`   | 新增 | Agent UI 组件                    |

### 9.3 与现有聊天模式的切换

```
┌─ 普通聊天模式 ──────────────────────┐
│  SSE 流式对话，纯文本交互              │
│  agentMode = false                   │
└──────────────────────────────────────┘
         ↕ 用户切换 / Agent 检测到需要操作
┌─ Agent 对话模式 ────────────────────┐
│  WebSocket 对话 + 工具调用展示        │
│  agentMode = true, actionMode = false│
└──────────────────────────────────────┘
         ↕ 后端返回 agent_action 消息
┌─ Agent 操作模式 ────────────────────┐
│  WebSocket 对话 + 实际 UI 操作       │
│  agentMode = true, actionMode = true │
│  显示 Overlay + TaskPanel            │
└──────────────────────────────────────┘
```

---

## 十、实现路线图

### Phase 1：基础协议 + 核心框架（第1-2周）

- [ ] 实现 AgentAction Protocol 类型定义
- [ ] 实现 ActionRegistry 注册中心
- [ ] 实现 ActionExecutor 执行引擎
- [ ] 实现 3 个基础 Action：`navigate`、`api_call`、`toast`
- [ ] 实现 webAgent Store
- [ ] WebSocket 消息扩展（agent.js 改造）

### Phase 2：UI 组件 + 用户交互（第2-3周）

- [ ] 实现 AgentFloatingButton
- [ ] 实现 AgentTaskPanel
- [ ] 实现 AgentConfirmDialog
- [ ] 实现 AgentOverlay
- [ ] 集成到 AppShell

### Phase 3：业务 Action 扩展（第3-4周）

- [ ] 农场管理 Actions（创建农场、创建地块、添加记录）
- [ ] 病害诊断 Actions（上传图片、查看结果）
- [ ] 知识查询 Actions（搜索病害、查看图谱）
- [ ] 组合 Action（compose）实现

### Phase 4：安全 + 优化（第4-5周）

- [ ] ActionSandbox 安全沙箱
- [ ] 操作撤销（Undo）功能
- [ ] 操作日志记录
- [ ] 性能优化 + 动画打磨
- [ ] 错误恢复机制

---

## 十一、后端协作要求

前端协议已定义完毕，后端需配合以下工作：

### 11.1 LLM 提示词工程

后端需在 LLM System Prompt 中注入前端 Action Manifest：

```
你是小农智农平台的 AI 助手。你可以通过以下 Actions 操控前端界面：

可用 Actions:
1. system:navigate - 跳转页面
   参数: { path: string, query?: object }

2. data:api_call - 调用后端API
   参数: { module: string, method: string, args?: object }

3. farm:create - 创建农场
   参数: { name: string, location: string, area?: number }

...（动态从 manifest_sync 获取）

当用户发出操作指令时，你应该：
1. 分析用户意图
2. 选择合适的 Action（可组合多个）
3. 按 agent_action 格式返回指令
4. 等待前端执行结果后继续下一步
```

### 11.2 WebSocket 协议扩展

在现有 `/ws/agent` 端点中新增消息处理：

```java
// 新增消息类型
case "action_result":   // 处理前端 Action 执行结果
case "confirm_result":  // 处理用户确认结果
case "manifest_sync":   // 接收前端能力清单
case "task_control":    // 处理暂停/恢复/终止
```

### 11.3 提供的 API

后端需要提供一个新接口：

```
GET /api/agent/manifest
```

返回当前用户可用的 Action 列表（可根据角色权限过滤），用于 LLM 上下文注入。

---

## 附录 A：农场管理完整 Action 清单

| Action Type         | 名称         | 说明                 | 危险等级  |
| ------------------- | ------------ | -------------------- | --------- |
| `farm:create`       | 创建农场     | 新增农场记录         | moderate  |
| `farm:update`       | 修改农场     | 更新农场信息         | moderate  |
| `farm:delete`       | 删除农场     | 删除农场及关联数据   | dangerous |
| `farm:list`         | 查看农场列表 | 跳转到农场列表页     | safe      |
| `farm:detail`       | 查看农场详情 | 跳转到指定农场       | safe      |
| `plot:create`       | 创建地块     | 在农场下新增地块     | moderate  |
| `plot:update`       | 修改地块     | 更新地块信息         | moderate  |
| `plot:delete`       | 删除地块     | 删除地块             | dangerous |
| `plot:update_stage` | 更新生长期   | 更新地块作物生长阶段 | moderate  |
| `pesticide:create`  | 记录施药     | 添加施药记录         | moderate  |
| `pesticide:update`  | 修改施药记录 | 更新施药信息         | moderate  |
| `note:create`       | 写田间随笔   | 添加田间观察记录     | safe      |
| `note:update`       | 修改随笔     | 更新田间记录         | safe      |
| `diagnosis:analyze` | 病害识别     | 上传图片进行识别     | safe      |
| `knowledge:search`  | 知识搜索     | 搜索病害知识库       | safe      |
| `knowledge:graph`   | 知识图谱     | 查看知识图谱         | safe      |

## 附录 B：用户指令 → Action 映射示例

| 用户指令                         | 触发的 Actions                                                     |
| -------------------------------- | ------------------------------------------------------------------ |
| "帮我创建一个山东的果园"         | `system:navigate → system:confirm → farm:create → system:navigate` |
| "看看我的农场"                   | `farm:list` (→ `system:navigate` to /farm)                         |
| "在苹果园里加一块地"             | `farm:detail → plot:create`                                        |
| "帮这块地记录一下今天喷了多菌灵" | `pesticide:create`                                                 |
| "这个叶子是什么病？"             | `system:navigate → diagnosis:analyze`                              |
| "查一下苹果斑点落叶病怎么治"     | `knowledge:search`                                                 |
| "删除那个测试农场"               | `system:confirm(dangerous) → farm:delete`                          |

---

_文档结束 — 小农 AI Agent 前端设计 v1.0_
