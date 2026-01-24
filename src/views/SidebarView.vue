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
import history from '@/components/HistoryList.vue'

// 直接获取侧边栏store
const sidebarStore = useSidebarStore()
</script>

<style lang="scss" scoped>
.sidebar-container {
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    background-color: #fff;

    // 功能按钮区域
    .sidebar-function {
        margin-bottom: 12px;

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
    }

    // 历史记录区域
    .sidebar-history {
        .history-title {
            font-size: 15px;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
        }
    }
}

.history-list {
    padding-bottom: 60px;
}
</style>
