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
            <router-view @question-click="handleQuestionSelect" :messages="messages"
                :key="$route.fullPath"></router-view>
        </div>

        <div class="input-area">
            <van-field v-model="inputValue" placeholder="请提问和农业相关的内容" class="input-field" @keyup.enter="sendMessage" />
            <van-button
                icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                type="default" class="action-btn" @click="sendMessage" />
            <van-button icon="photo-o" type="default" class="action-btn" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const router = useRouter()

const inputValue = ref('')
const messages = ref([])
const TOKEN = localStorage.getItem('token')

// 发送消息逻辑（保留原有核心）
const sendMessage = async () => {
    const content = inputValue.value.trim()
    if (!content) return

    const userId = localStorage.getItem('id')
    const currentSessionId = localStorage.getItem('sessionId') || ''

    await chatStore.sendMessage(content, userId, currentSessionId, TOKEN)

    inputValue.value = ''
    router.push({
        name: 'chatDetail',
        params: { sessionId: `${userId}${currentSessionId}` },
    })
}

// 处理热门问题点击
const handleQuestionSelect = (question) => {
    inputValue.value = question
}
</script>
<style lang="scss" scoped>
// 1. 父容器 .chat-page（核心布局基础）
.chat-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
    overflow: hidden; // 防止页面整体滚动（关键）
    position: relative; // 新增：为固定定位的子元素提供参考
}

// 2. 导航栏 - 固定在顶部
.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f5f7fa;
    height: 50px;
    flex-shrink: 0;
    border-bottom: 1px solid #eee;
    // 核心修改：固定定位 + 层级
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100; // 确保在最上层
}

// 3. 中间内容区 - 避开固定的头部和底部
.main-content {
    flex: 1; // 占满剩余高度
    overflow-y: auto; // 内容过多时内部滚动（关键）
    // 核心修改：留出头部和底部的间距
    margin-top: 63px; // 对应导航栏高度
    margin-bottom: 63px; // 对应输入栏高度
    height: calc(100vh - 110px); // 50+60=110，确保高度适配
}

// 4. 输入栏 - 固定在底部
.input-area {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fff;
    border-top: 1px solid #eee;
    height: 60px;
    flex-shrink: 0;
    // 核心修改：固定定位 + 层级
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100; // 确保在最上层
}

.content-container {
    flex: 1;
    overflow: auto;
}

// 导航栏内部样式（原有保留）
.nav-header .menu-btn {
    font-size: 20px;
    color: #333;
}

.nav-header .capsule-btn {
    width: 60px;
}

// 输入栏内部样式（原有保留）
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
