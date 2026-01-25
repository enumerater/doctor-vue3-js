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
            <router-view :key="$route.fullPath"></router-view>
        </div>

        <div class="input-area">
            <!-- 输入框+发送按钮+折叠按钮 同一行 -->
            <div class="input-row">
                <van-field v-model="chatStore.inputValue" placeholder="请输入您的问题" class="input-field"
                    @keyup.enter="sendMessage" />
                <van-button
                    icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                    type="default" class="action-btn send-btn" @click="sendMessage" />
                <!-- 折叠按钮：发送按钮右侧 -->
                <van-button class="fold-btn" icon="ellipsis" type="default" @click="isFunctionShow = !isFunctionShow" />
            </div>

            <!-- 功能区：大屏左对齐，小屏点击展开 -->
            <div class="function-area" :class="{ show: isFunctionShow }">
                <van-button icon="photo-o" type="default" class="function-btn" @click="photo">
                    图像识别
                </van-button>
                <van-button icon="lightbulb-o" type="default" class="function-btn" @click="deepThinking">
                    深度思考
                </van-button>
                <van-button icon="switch-o" type="default" class="function-btn" @click="switchModel">
                    模型切换
                </van-button>
                <van-button icon="setting-o" type="default" class="function-btn" @click="moreSettings">
                    更多设置
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

// 控制功能区显示/隐藏
const isFunctionShow = ref(false)

const photo = () => {
    console.log('图像识别')
    router.push({ name: 'vision' })
}

const deepThinking = () => {
    console.log('深度思考模式开启')
}

const switchModel = () => {
    console.log('切换AI模型')
}

const moreSettings = () => {
    console.log('打开更多设置')
}

const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const router = useRouter()

const { inputValue } = storeToRefs(chatStore)
const TOKEN = localStorage.getItem('token')

const sendMessage = async () => {
    const content = inputValue.value.trim()
    if (!content) return

    const userId = localStorage.getItem('id')
    const currentSessionId = localStorage.getItem('sessionId') || ''

    await chatStore.sendMessage(content, userId, currentSessionId, TOKEN)

    router.push({
        name: 'chatDetail',
        params: { sessionId: `${userId}${currentSessionId}` },
    })
}
</script>

<style lang="scss" scoped>
// 主题变量不变
$primary: #388e3c;
$primary-light: #e8f5e9;
$primary-hover: #2e7d32;
$secondary: #66bb6a;
$text-primary: #2d3748;
$text-secondary: #718096;
$bg-main: #f8f9fa;
$bg-card: #ffffff;
$border: #e2e8f0;
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$float-shadow: 0 4px 12px rgba(56, 142, 60, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
$float-shadow-active: 0 8px 20px rgba(56, 142, 60, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 20px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 全局页面样式
.chat-page {
    min-height: 100vh;
    width: 100vw;
    max-width: 100%;
    background-color: $bg-main;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    overflow-x: hidden;
}

// 导航栏
.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.75rem;
    background-color: $bg-card;
    box-shadow: $shadow-sm;
    height: 50px;
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: none;

    .menu-btn {
        font-size: 18px;
        color: $primary;
        background-color: transparent;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: $transition;

        &:hover {
            background-color: $primary-light;
            color: $primary-hover;
        }
    }

    .capsule-btn {
        width: 40px;
    }
}

// 主内容区
.main-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 50px;
    padding-bottom: 120px;
    background-color: $bg-main;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

// 输入区核心布局
.input-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: $bg-card;
    border-top: 1px solid rgba(56, 142, 60, 0.08);
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding-bottom: calc(0.5rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}

// 输入行：包含输入框、发送按钮、折叠按钮
.input-row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem; // 三个元素之间的间距
}

// 输入框
.input-field {
    flex: 1; // 输入框占满剩余宽度
    border-radius: $radius-lg;
    background-color: rgba(224, 230, 224, 0.95);
    border: 1px solid rgba(56, 142, 60, 0.1);
    padding: 0 0.75rem;
    height: 42px;
    transform: translateY(0);
    box-shadow: $float-shadow;
    transition: $transition;
    display: flex;
    align-items: center;

    ::v-deep(.van-field) {
        height: 100%;
        display: flex;
        align-items: center;
    }

    ::v-deep(.van-field__control) {
        color: $text-primary;
        padding: 0 !important;
        margin: 0 !important;
        height: 100%;
        line-height: 1 !important;
        font-size: 14px;
        background-color: transparent;
        display: flex;
        align-items: center;
    }

    ::v-deep(.van-field__placeholder) {
        color: $text-secondary;
        opacity: 0.8;
        line-height: 1;
        font-size: 13px;
    }

    &:hover,
    &:focus-within {
        border-color: rgba(56, 142, 60, 0.2);
        box-shadow: $float-shadow-active;
        transform: translateY(-2px);
    }
}

// ========== 统一发送按钮和功能按钮样式 ==========
// 基础按钮样式（发送+折叠+功能按钮通用）
.action-btn,
.fold-btn,
.function-btn {
    border-radius: 50%;
    border: none !important;
    flex-shrink: 0;
    transition: $transition;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $primary-light !important;
    color: $primary !important;
}

// 发送按钮
.action-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;

    &:hover {
        background-color: white !important;
        color: $primary-hover !important;
        border-color: rgba(56, 142, 60, 0.2) !important;
        box-shadow: $shadow-sm;
    }
}

// 折叠按钮：发送按钮右侧
.fold-btn {
    width: 40px !important;
    height: 40px !important;
    padding: 0 !important;

    &:hover {
        background-color: white !important;
        color: $primary-hover !important;
        box-shadow: $shadow-sm;
    }
}

// 功能区：大屏左对齐，小屏点击展开
.function-area {
    display: flex;
    align-items: center;
    justify-content: flex-start; // 左对齐核心设置
    gap: 0.75rem; // 按钮间距
    flex-wrap: wrap; // 超出换行
    // 小屏默认隐藏
    display: none !important;

    &.show {
        display: flex !important;
    }

    .function-btn {
        width: auto;
        height: auto;
        border-radius: $radius-md !important; // 功能按钮用胶囊圆角
        padding: 0.35rem 0.8rem;
        gap: 0.25rem;
        font-size: 13px;
        white-space: nowrap;
        border-radius: $radius-md;

        ::v-deep(.van-icon) {
            font-size: 14px;
        }

        &:hover {
            background-color: white !important;
            border-color: rgba(56, 142, 60, 0.2) !important;
            color: $primary-hover !important;
            transform: translateY(-2px);
            box-shadow: $shadow-sm;
        }
    }
}

// ========== 媒体查询 ==========
// 大屏手机（>375px）：隐藏折叠按钮，显示功能区左对齐
@media (min-width: 376px) {
    .fold-btn {
        display: none !important;
    }

    .function-area {
        display: flex !important;
        justify-content: flex-start !important;
    }
}

// 小屏手机（≤375px）：显示折叠按钮，隐藏功能区
@media (max-width: 375px) {
    .fold-btn {
        display: flex !important;
    }
}

// Vant弹窗样式
::v-deep(.van-popup) {
    border-radius: 0 $radius-lg $radius-lg 0;
    background-color: $bg-card;
    box-shadow: $shadow-md;
}

::v-deep(.van-popup__close-icon) {
    color: $primary;
    font-size: 18px;

    &:hover {
        color: $primary-hover;
    }
}
</style>