<template>
    <div class="chat-page">
        <div class="nav-header">
            <van-button icon="bars" type="default" size="small" class="menu-btn" @click="sidebarStore.toggleLeft()" />
            <div class="capsule-btn"></div>
            <van-popup v-model:show="sidebarStore.showLeft" position="left" :style="{ width: '80%', height: '100%' }"
                closeable round>
                <template #default>
                    <Sidebar />
                </template>
            </van-popup>
        </div>

        <div class="main-content">
            <!-- 不再传递messages和question-click，子组件直接用Store -->
            <router-view :key="$route.fullPath"></router-view>
        </div>

        <div class="input-area">
            <!-- 绑定Store的inputValue，而非本地状态 -->
            <van-field v-model="chatStore.inputValue" placeholder="请提问和农业相关的内容" class="input-field"
                @keyup.enter="sendMessage" />
            <van-button
                icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                type="default" class="action-btn" @click="sendMessage" />
            <van-button icon="photo-o" type="default" class="action-btn" />
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia' // 新增：用于解构Store的响应式状态
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const router = useRouter()

// 解构Store的响应式状态（必须用storeToRefs）
const { inputValue } = storeToRefs(chatStore)
const TOKEN = localStorage.getItem('token')

// 简化发送消息逻辑
const sendMessage = async () => {
    const content = inputValue.value.trim()
    if (!content) return

    const userId = localStorage.getItem('id')
    const currentSessionId = localStorage.getItem('sessionId') || ''

    await chatStore.sendMessage(content, userId, currentSessionId, TOKEN)

    // 跳转逻辑保留，也可以抽离到Store（可选）
    router.push({
        name: 'chatDetail',
        params: { sessionId: `${userId}${currentSessionId}` },
    })
}

// 移除handleQuestionSelect（逻辑已移到Store）
</script>

<style lang="scss" scoped>
// 原有样式保留，无需修改
.chat-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f5f7fa;
    height: 50px;
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: 1px solid #eee;
}

.main-content {
    flex: 1;
    overflow-y: auto;
    margin-top: 63px;
    margin-bottom: 63px;
    height: calc(100vh - 126px); // 微调：63+63=126，精准适配
    padding: 0; // 移除默认padding，避免子组件偏移
    background-color: #f8f9fa; // 与初始界面背景统一
}

.input-area {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fff;
    border-top: 1px solid #eee;
    height: 60px;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
}

.content-container {
    flex: 1;
    overflow: auto;
}

.nav-header .menu-btn {
    font-size: 20px;
    color: #333;
}

.nav-header .capsule-btn {
    width: 60px;
}

.input-area .input-field {
    flex: 1;
    margin-right: 8px;
    border-radius: 20px;
    background-color: #f5f7fa;
}

.input-area .action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 4px;
    font-size: 20px;
    color: #666;
}
</style>