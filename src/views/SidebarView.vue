<template>
    <div class="sidebar-container">
        <!-- 组件头部 -->
        <div class="history-header">
            <h3 class="history-title">Chat小农</h3>
        </div>

        <!-- 功能按钮区域 -->
        <div class="sidebar-function">
            <van-button type="primary" block class="new-chat-btn" @click="handleNewChat">
                <van-icon name="plus" class="btn-icon" /> 新对话
            </van-button>
        </div>

        <!-- 分割线 -->
        <van-divider class="sidebar-divider" />

        <!-- 历史记录区域 -->
        <div class="sidebar-history">
            <div class="history-title">历史记录</div>
            <!-- 引入历史记录组件（你的<history/>） -->
            <div class="history-list">
                <history @refreshDone="refreshDone" :refresh-trigger="refreshTrigger" @get-message="handleGetMessage" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineEmits } from 'vue'
// 引入你的历史记录组件（注意路径和命名）
import history from '@/components/HistoryList.vue'
import { ref } from 'vue'

// 定义emit事件，传递“新对话”点击事件给父组件
const emit = defineEmits(['resetConversation', 'get-message'])

// 核心修改3：新增handleGetMessage，接收历史记录组件的get-message事件
const handleGetMessage = (id) => {
    emit('get-message', id) // 通知首页获取选中对话的消息
}

// 新对话按钮点击逻辑（核心修改：新增切换refreshTrigger）
const handleNewChat = () => {
    emit('resetConversation') // 通知首页重置对话
    refreshTrigger.value = true // 给历史记录发“刷新信号”
}

// 定义刷新触发信号
const refreshTrigger = ref(false)

// 接收历史记录的刷新完成信号，重置trigger
const refreshDone = () => {
    refreshTrigger.value = false
}
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
