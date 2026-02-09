# Agent 自定义设置功能 - 部署检查清单

## 📋 前端实现完成确认

### ✅ 文件创建（15 个）

#### 核心代码文件

- [x] `src/stores/agentConfig.js` (4.5 KB) - Pinia Store
- [x] `src/axios/agentConfig.js` (1.4 KB) - API 模块

#### UI 组件（8 个）

- [x] `src/components/AgentConfigPanel.vue` (2.1 KB)
- [x] `src/components/ConfigSelector.vue` (5.8 KB)
- [x] `src/components/ConfigEditor.vue` (6.8 KB)
- [x] `src/components/ConfigCreator.vue` (4.3 KB)
- [x] `src/components/SystemPromptSection.vue` (10 KB)
- [x] `src/components/ResponseParamSection.vue` (8.6 KB)
- [x] `src/components/AgentParamSection.vue` (8.3 KB)
- [x] `src/components/AdvancedConfigSection.vue` (8.0 KB)

#### 集成修改（3 个）

- [x] `src/views/AgentHomeView.vue` (已修改)
- [x] `src/stores/chat.js` (已修改)
- [x] `src/main.js` (已修改)

#### 文档（3 个）

- [x] `AGENT_CONFIG_IMPLEMENTATION.md` (13 KB) - 完整实现报告
- [x] `AGENT_CONFIG_QUICK_START.md` (11 KB) - 快速开始指南
- [x] `IMPLEMENTATION_SUMMARY.md` (13 KB) - 实现总结

**文件总大小**：~90 KB 代码 + 37 KB 文档

---

## 🎯 功能实现确认

### 配置管理

- [x] 创建新配置
- [x] 编辑现有配置
- [x] 删除配置
- [x] 复制配置
- [x] 设置默认配置
- [x] 切换配置
- [x] 配置列表展示

### 参数编辑

- [x] 系统提示词（5 个预设模板）
- [x] 响应参数（6 个参数 + 4 个预设）
- [x] 业务参数（作物类型、模式、功能等）
- [x] 高级配置（缓存、重试、超时等）

### 数据持久化

- [x] localStorage 缓存
- [x] 后端 API 同步机制
- [x] Pinia persist 插件配置

### 集成功能

- [x] Agent 设置按钮（AgentHomeView）
- [x] 配置面板弹窗
- [x] 会话配置关联（chat.js）
- [x] SSE 调用传递 configId
- [x] 应用启动时初始化（main.js）

---

## 🔌 后端待实现检查清单

### 1. 数据表创建

```sql
-- Agent 配置表
CREATE TABLE agent_configs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,

    -- JSON 字段存储配置
    system_prompt JSONB NOT NULL,
    response_params JSONB NOT NULL,
    agent_config JSONB NOT NULL,
    advanced_config JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    UNIQUE(user_id, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_agent_configs_user_id ON agent_configs(user_id);
CREATE INDEX idx_agent_configs_is_default ON agent_configs(user_id, is_default);

-- 会话表添加字段
ALTER TABLE sessions ADD COLUMN agent_config_id UUID;
ALTER TABLE sessions ADD FOREIGN KEY (agent_config_id)
    REFERENCES agent_configs(id) ON DELETE SET NULL;
```

检查项：

- [ ] 数据表已创建
- [ ] 索引已添加
- [ ] 外键约束已配置
- [ ] sessions 表已更新

### 2. API 端点实现

#### GET /agentConfig/list

```
功能：获取当前用户的所有配置
查询参数：无（从 token 获取 userId）
返回：{ code: 0, data: AgentConfig[] }
```

- [ ] 端点已实现
- [ ] 用户隔离已实现
- [ ] 分页支持（可选）
- [ ] 排序支持（可选）

#### GET /agentConfig/{id}

```
功能：获取单个配置详情
路径参数：configId
返回：{ code: 0, data: AgentConfig }
```

- [ ] 端点已实现
- [ ] 权限验证（配置属于当前用户）
- [ ] 错误处理（配置不存在）

#### POST /agentConfig

```
功能：创建新配置
请求体：AgentConfig 对象
返回：{ code: 0, data: AgentConfig }
```

- [ ] 端点已实现
- [ ] 参数验证（必填字段、范围检查）
- [ ] 重名检查（用户内唯一）
- [ ] 自动添加 createdAt/updatedAt
- [ ] 返回完整配置对象（包含 id）

#### PUT /agentConfig/{id}

```
功能：更新配置
路径参数：configId
请求体：AgentConfig 对象（部分或全部字段）
返回：{ code: 0, data: AgentConfig }
```

- [ ] 端点已实现
- [ ] 权限验证
- [ ] 参数验证
- [ ] 更新 updatedAt
- [ ] 返回更新后的完整对象

#### DELETE /agentConfig/{id}

```
功能：删除配置
路径参数：configId
返回：{ code: 0 }
```

- [ ] 端点已实现
- [ ] 权限验证
- [ ] 软删除或硬删除（建议软删除）
- [ ] 不影响历史会话（sessions 表不删除引用）
- [ ] 不允许删除最后一个配置（可选）

#### PUT /agentConfig/{id}/setDefault

```
功能：设置为默认配置
路径参数：configId
返回：{ code: 0 }
```

- [ ] 端点已实现
- [ ] 权限验证
- [ ] 取消其他配置的默认状态
- [ ] 设置当前配置为默认

#### POST /agentConfig/{id}/duplicate

```
功能：复制配置
路径参数：configId（源配置）
返回：{ code: 0, data: AgentConfig }（新配置）
```

- [ ] 端点已实现
- [ ] 权限验证
- [ ] 复制所有字段（除 id, createdAt, updatedAt）
- [ ] 新配置名称添加 "- 副本" 或时间戳
- [ ] 新配置不设为默认
- [ ] 返回新配置对象

#### PUT /session/{sessionId}/agentConfig

```
功能：为会话关联 Agent 配置
路径参数：sessionId
请求体：{ configId }
返回：{ code: 0 }
```

- [ ] 端点已实现
- [ ] 权限验证（会话和配置都属于当前用户）
- [ ] 更新 sessions 表的 agent_config_id

### 3. Agent 引擎集成

#### 接收配置参数

```
GET /agent/agriculture-agent-v2?agentConfigId={id}&...
```

- [ ] 接收 agentConfigId 查询参数
- [ ] 查询配置详情
- [ ] 应用系统提示词
- [ ] 应用响应参数
- [ ] 应用业务参数
- [ ] 遵守高级配置

#### 系统提示词应用

```javascript
const config = await getAgentConfig(agentConfigId)
const systemPrompt = config.systemPrompt.template + (config.systemPrompt.customInstructions || '')
```

- [ ] 完整系统提示词拼接
- [ ] 语言设置应用
- [ ] 注入到模型调用

#### 响应参数应用

```javascript
const modelParams = {
  temperature: config.responseParams.temperature,
  maxTokens: config.responseParams.maxTokens,
  topP: config.responseParams.topP,
  topK: config.responseParams.topK,
  // ...
}
```

- [ ] 所有参数应用到模型调用
- [ ] 参数范围验证

#### 业务参数应用

```javascript
const cropTypes = config.agentConfig.cropTypes
const diagnosisMode = config.agentConfig.diseaseDetectionMode
const maxSteps = config.agentConfig.maxSteps
// ...
```

- [ ] 作物类型筛选
- [ ] 诊断模式调整
- [ ] 功能开关控制
- [ ] 最大步骤限制
- [ ] 输出格式控制

#### 高级配置应用

```javascript
// 缓存
if (config.advancedConfig.enableCaching) {
  // 启用缓存，设置过期时间
}

// 重试
if (config.advancedConfig.enableRetry) {
  // 配置重试机制
}

// 超时
const timeout = config.advancedConfig.timeoutSeconds * 1000
```

- [ ] 缓存机制（Redis/Memory）
- [ ] 重试机制（指数退避）
- [ ] 超时设置
- [ ] 连接保活
- [ ] 响应压缩

### 4. 数据验证

#### 配置参数范围验证

```javascript
// 响应参数
temperature: 0.0 - 1.0
maxTokens: 100 - 4000
topP: 0.0 - 1.0
topK: 1 - 100
frequencyPenalty: -2.0 - 2.0
presencePenalty: -2.0 - 2.0

// Agent 参数
maxSteps: 3 - 10
diseaseDetectionMode: 'fast' | 'balanced' | 'precise'
outputFormat: 'brief' | 'detailed' | 'technical'

// 高级配置
cacheExpireMins: > 0
maxRetries: > 0
retryDelayMs: > 0
timeoutSeconds: > 0
```

- [ ] 所有参数范围验证
- [ ] 枚举值验证
- [ ] 必填字段检查

#### 业务逻辑验证

```javascript
// 每个用户至少保留一个配置
// 每个用户有且仅有一个默认配置
// 配置名称在用户内唯一
// 作物类型在预定义列表内
```

- [ ] 业务规则验证
- [ ] 数据一致性检查

---

## 🧪 测试检查清单

### 前端测试

- [ ] 打开配置面板
- [ ] 创建新配置（填写所有字段）
- [ ] 编辑配置（修改各类参数）
- [ ] 删除配置（确认弹窗）
- [ ] 复制配置（生成副本）
- [ ] 设置默认配置（取消其他默认）
- [ ] 切换配置（高亮当前）
- [ ] 刷新页面后配置仍存在（localStorage）
- [ ] 选择预设模板（系统提示词）
- [ ] 应用参数预设（响应参数）
- [ ] 调整滑块参数（实时更新）
- [ ] 功能开关切换
- [ ] 恢复默认配置（高级配置）

### 后端测试

- [ ] 创建配置 API（返回正确数据）
- [ ] 获取配置列表（用户隔离）
- [ ] 更新配置（更新成功）
- [ ] 删除配置（不影响会话）
- [ ] 设置默认（其他配置取消默认）
- [ ] 复制配置（生成新 ID）
- [ ] 参数验证（范围错误返回 400）
- [ ] 权限验证（跨用户访问返回 403）
- [ ] 数据一致性（默认配置唯一）

### 集成测试

- [ ] 创建会话时关联配置
- [ ] sessions 表 agent_config_id 正确
- [ ] SSE 调用传递 agentConfigId
- [ ] 后端读取配置成功
- [ ] 系统提示词正确应用
- [ ] 响应参数正确应用
- [ ] 业务参数影响 Agent 行为
- [ ] 高级配置生效（缓存/重试/超时）
- [ ] 前后端数据同步
- [ ] 多设备配置同步（可选）

### E2E 测试场景

```
场景 1: 创建并使用配置
1. 打开 AgentHomeView
2. 点击 Agent 设置
3. 创建新配置（设置所有参数）
4. 保存并关闭
5. 创建新会话
6. 发送消息
7. 验证 Agent 行为符合配置

场景 2: 修改配置影响会话
1. 使用配置 A 创建会话
2. 修改配置 A 的参数
3. 创建新会话
4. 验证新会话使用更新后的配置
5. 验证旧会话仍使用原配置（可选）

场景 3: 多配置切换
1. 创建配置 A（精准模式）
2. 创建配置 B（快速模式）
3. 切换到配置 A，创建会话 1
4. 切换到配置 B，创建会话 2
5. 验证两个会话行为不同

场景 4: 删除配置
1. 创建配置并使用
2. 删除配置
3. 历史会话仍可查看
4. 新会话使用默认配置
```

- [ ] 场景 1 通过
- [ ] 场景 2 通过
- [ ] 场景 3 通过
- [ ] 场景 4 通过

---

## 🚀 上线前检查清单

### 代码质量

- [ ] 前端代码 lint 通过（eslint）
- [ ] 后端代码 lint 通过
- [ ] 单元测试覆盖率 > 80%（可选）
- [ ] 集成测试全部通过
- [ ] E2E 测试全部通过

### 性能验证

- [ ] 配置列表加载时间 < 500ms
- [ ] 创建配置响应时间 < 1s
- [ ] SSE 调用延迟 < 100ms
- [ ] localStorage 大小 < 5MB（1000+ 配置）
- [ ] 数据库查询优化（索引使用）

### 安全检查

- [ ] SQL 注入防护
- [ ] XSS 防护（输入验证）
- [ ] CSRF 防护（token）
- [ ] 用户权限隔离
- [ ] 敏感数据加密（可选）
- [ ] 操作日志记录（可选）

### 兼容性测试

- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版（macOS/iOS）
- [ ] Edge 最新版
- [ ] 移动端浏览器

### 文档完善

- [x] 实现报告（AGENT_CONFIG_IMPLEMENTATION.md）
- [x] 快速开始指南（AGENT_CONFIG_QUICK_START.md）
- [x] 实现总结（IMPLEMENTATION_SUMMARY.md）
- [ ] API 文档（Swagger/OpenAPI）
- [ ] 数据库 Schema 文档
- [ ] 部署文档
- [ ] 故障排查文档

### 部署准备

- [ ] 环境变量配置
- [ ] 数据库迁移脚本
- [ ] 回滚方案
- [ ] 监控配置（错误追踪、性能监控）
- [ ] 备份策略

---

## 📊 上线验证

### 功能验证（生产环境）

1. [ ] 配置面板正常打开
2. [ ] 创建配置成功
3. [ ] 编辑配置成功
4. [ ] 删除配置成功
5. [ ] 配置切换成功
6. [ ] 会话配置关联成功
7. [ ] Agent 行为符合配置
8. [ ] 数据持久化正常

### 性能验证（生产环境）

- [ ] 响应时间符合预期
- [ ] 无明显内存泄漏
- [ ] 数据库负载正常
- [ ] 缓存命中率 > 80%（如启用）

### 监控配置

- [ ] 错误日志收集
- [ ] 性能指标监控
- [ ] 用户行为分析
- [ ] 告警配置

---

## 📝 问题追踪

### 已知问题

- 无

### 待优化项

1. 配置导入/导出功能
2. 配置版本控制
3. 配置对比功能
4. 配置使用统计
5. 多语言支持完善

---

## ✅ 签字确认

### 前端开发

- [x] 代码实现完成 - Claude Code (2026-02-09)
- [ ] 代码审查通过 -
- [ ] 测试通过 -

### 后端开发

- [ ] 代码实现完成 -
- [ ] 代码审查通过 -
- [ ] 测试通过 -

### QA 测试

- [ ] 功能测试通过 -
- [ ] 集成测试通过 -
- [ ] 性能测试通过 -
- [ ] 安全测试通过 -

### 产品验收

- [ ] 功能验收通过 -
- [ ] 用户体验验收 -

### 上线批准

- [ ] 技术负责人 -
- [ ] 产品负责人 -

---

**文档版本**：v1.0
**最后更新**：2026-02-09
**状态**：等待后端实现
