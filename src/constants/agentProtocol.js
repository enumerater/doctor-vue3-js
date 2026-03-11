/**
 * Agent WebSocket Protocol v2
 * 统一通信协议常量与工具配置
 */

// ========================
// 消息类型常量
// ========================
export const MSG_TYPE = {
  // 前端 → 后端
  USER_INPUT: 'user_input',
  USER_CONFIRM: 'user_confirm',
  USER_ANSWER: 'user_answer',
  HEARTBEAT: 'heartbeat',

  // 后端 → 前端
  THOUGHT: 'thought',
  THOUGHT_RESULT: 'thought_result',
  TOOL_CALL: 'tool_call',
  TOOL_RESULT: 'tool_result',
  CONFIRM: 'confirm',
  ASK: 'ask',
  ANSWER: 'answer',
  ERROR: 'error',
  HEARTBEAT_PONG: 'heartbeat_pong',
}

// ========================
// 工具配置映射
// ========================
export const TOOL_CONFIG = {
  knowledge_base:    { name: '知识库检索', icon: '', color: '#3B82F6' },
  knowledge_graph:   { name: '知识图谱',   icon: '', color: '#8B5CF6' },
  memory_retrieval:  { name: '记忆检索',   icon: '', color: '#EC4899' },
  web_search:        { name: '联网搜索',   icon: '', color: '#06B6D4' },
  weather:           { name: '天气查询',   icon: '', color: '#F59E0B' },
  image_recognition: { name: '图像识别',   icon: '', color: '#10B981' },
  field_management:  { name: '田间管理',   icon: '', color: '#84CC16' },
  medication:        { name: '施药方案',   icon: '', color: '#EF4444' },
  accumulated_temp:  { name: '积温预测',   icon: '', color: '#F97316' },
}

const DEFAULT_TOOL = { name: '工具调用', icon: '', color: '#6B7280' }

/**
 * 获取工具配置，未识别的工具回退为默认配置
 */
export const getToolConfig = (toolName) => TOOL_CONFIG[toolName] || DEFAULT_TOOL

// ========================
// 步骤类型配置（非工具类）
// ========================
export const STEP_CONFIG = {
  thought_result: { name: '思考结论', icon: '', color: '#8B5CF6' },
  tool:           { name: '工具调用', icon: '', color: '#3B82F6' },
}

/**
 * 获取步骤显示配置
 */
export const getStepDisplayConfig = (step) => {
  if (step.type === 'tool') {
    const toolCfg = getToolConfig(step.tool)
    return {
      name: toolCfg.name,
      icon: toolCfg.icon,
      color: toolCfg.color,
    }
  }
  const cfg = STEP_CONFIG[step.type]
  return cfg || STEP_CONFIG.tool
}

// ========================
// 角色判断
// ========================
export const isUserType = (type) =>
  [MSG_TYPE.USER_INPUT, MSG_TYPE.USER_CONFIRM, MSG_TYPE.USER_ANSWER].includes(type)
