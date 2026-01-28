<template>
  <div class="sidebar-container">
    <!-- 组件头部 -->
    <div class="history-header">
      <h3 class="history-title">Chat小农</h3>
    </div>

    <!-- 功能按钮区域 -->
    <div class="sidebar-function">
      <van-button type="primary" block class="new-chat-btn" @click="sidebarStore.resetConversation">
        <van-icon name="plus" class="btn-icon" /> 新对话
      </van-button>
    </div>

    <!-- 分割线 -->
    <van-divider class="sidebar-divider" />

    <!-- 功能区域 -->
    <div class="sidebar-agent">
      <div class="agent-title">更多功能</div>
      <div class="agent-list">
        <div class="agent-item" @click="handleAgentFunction('report')">
          <van-icon name="description" class="agent-icon" />
          <span class="agent-text">自动生成报表</span>
        </div>
        <div class="agent-item" @click="handleAgentFunction('vision')">
          <van-icon name="photo-o" class="agent-icon" />
          <span class="agent-text">图像识别</span>
        </div>
        <div class="agent-item" @click="handleAgentFunction('agriculture')"
          :class="{ 'agriculture-active': sidebarStore.isAgricultureAgent }">
          <van-icon name="leaf" class="agent-icon" />
          <span class="agent-text">农业Agent</span>
        </div>
        <!-- 后续可以继续添加更多agent功能 -->
      </div>
    </div>

    <!-- 分割线 -->
    <van-divider class="sidebar-divider" />

    <!-- 历史记录区域 -->
    <div class="sidebar-history">
      <div class="history-title">历史记录</div>
      <div class="history-list">
        <!-- 不再传递任何props/emit，直接用store -->
        <history />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { useVisionStore } from '@/stores/vision'
import { useRouter } from 'vue-router'
import history from '@/components/HistoryList.vue'

// 直接获取侧边栏store
const sidebarStore = useSidebarStore()
const visionStore = useVisionStore()
const router = useRouter()

// Agent功能处理函数
const handleAgentFunction = (type) => {
  console.log('Agent功能:', type)
  // 后续可以在这里添加具体的功能逻辑
  // 例如：跳转到报表生成页面、打开弹窗等
  switch (type) {
    case 'report':
      // TODO: 实现自动生成报表功能
      console.log('打开自动生成报表功能')
      break
    case 'vision':
      // 跳转到图像识别页面
      router.push({ name: 'vision' })
      break
    case 'agriculture':
      // 切换农业Agent模式
      sidebarStore.toggleAgricultureAgent()
      // 重置会话
      sidebarStore.resetConversation()
      break
    default:
      break
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // 组件头部
  .history-header {
    flex-shrink: 0;
  }

  // 功能按钮区域
  .sidebar-function {
    margin-bottom: 12px;
    flex-shrink: 0;

    .new-chat-btn {
      border-radius: 8px;
      background-color: #34c759; // 延续农业绿色主题
      border: none;

      .btn-icon {
        margin-right: 4px;
      }
    }
  }

  // 分割线样式
  .sidebar-divider {
    margin: 12px 0;
    background-color: #f5f7fa;
    flex-shrink: 0;
  }

  // 历史记录区域 - 可滚动
  .sidebar-history {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0; // 重要：允许flex子元素缩小

    .history-title {
      font-size: 15px;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .history-list {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
  }

  // Agent功能区域 - 固定在历史记录上方
  .sidebar-agent {
    flex-shrink: 0;

    .agent-title {
      font-size: 15px;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .agent-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .agent-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background-color: #f5f7fa;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background-color: #e8f5e9;
        border-color: rgba(52, 199, 89, 0.3);
      }

      &:active {
        background-color: #d4edda;
      }

      .agent-icon {
        font-size: 18px;
        color: #34c759;
        margin: 0 10px 0 0;
      }

      .agent-text {
        font-size: 14px;
        color: #333;
      }

      // 农业Agent选中状态样式
      &.agriculture-active {
        background-color: #e8f5e9;
        border-color: rgba(52, 199, 89, 0.6);
        box-shadow: 0 0 10px rgba(52, 199, 89, 0.2);

        .agent-icon {
          color: #34c759;
          filter: drop-shadow(0 0 5px rgba(52, 199, 89, 0.5));
        }

        .agent-text {
          color: #34c759;
          font-weight: 500;
        }
      }
    }
  }
}
</style>