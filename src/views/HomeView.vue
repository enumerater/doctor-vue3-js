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
            <van-field v-model="chatStore.inputValue" placeholder="请输入您的问题" class="input-field"
                @keyup.enter="sendMessage" />
            <van-button
                icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                type="default" class="action-btn send-btn" @click="sendMessage" />
            <van-button icon="photo-o" type="default" class="action-btn photo-btn" @click="photo" />
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const photo = () => {
    console.log('photo')
    router.push({ name: 'vision' })
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
// 统一主题变量
$primary: #388e3c; // 主绿
$primary-light: #e8f5e9; // 浅绿背景
$primary-hover: #2e7d32; // 主绿hover
$secondary: #66bb6a; // 次要绿
$text-primary: #2d3748; // 主要文字
$text-secondary: #718096; // 次要文字
$bg-main: #f8f9fa; // 页面背景
$bg-card: #ffffff; // 卡片背景
$border: #e2e8f0; // 边框色
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05); // 轻阴影
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08); // 中阴影
// 新增：浮空阴影（多层更有层次感）
$float-shadow: 0 4px 12px rgba(56, 142, 60, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
$float-shadow-active: 0 8px 20px rgba(56, 142, 60, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
$radius-sm: 8px; // 小圆角
$radius-md: 12px; // 中圆角
$radius-lg: 20px; // 大圆角（适配输入框）
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); // 顺滑过渡

// 全局页面样式
.chat-page {
    min-height: 100vh;
    background-color: $bg-main;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// 导航栏
.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    background-color: $bg-card;
    box-shadow: $shadow-sm;
    height: 56px;
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: none;

    .menu-btn {
        font-size: 20px;
        color: $primary;
        background-color: transparent;
        border: none;
        width: 40px;
        height: 40px;
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
        width: 60px;
    }
}

// 主内容区
.main-content {
    flex: 1;
    overflow-y: auto;
    margin-top: 56px;
    margin-bottom: 64px;
    height: calc(100vh - 120px);
    padding: 0;
    background-color: $bg-main;
}

// 底部输入区
.input-area {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    background-color: transparent; // 关键：输入区背景透明，凸显输入框浮空
    border-top: none; // 移除边框，强化浮空感
    height: 64px;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;

    // ******** 核心修改：修复输入框内容居中 + 保留浮空效果 ********
    .input-field {
        flex: 1;
        margin-right: 0.75rem;
        border-radius: $radius-lg;
        background-color: rgba(224, 230, 224, 0.95);
        border: 1px solid rgba(56, 142, 60, 0.1);
        padding: 0 1rem;
        height: 48px;
        transform: translateY(-2px);
        box-shadow: $float-shadow;
        transition: $transition;
        // 关键：确保输入框容器本身是flex布局，对齐内部元素
        display: flex;
        align-items: center;

        // 核心修复：Vant输入框内容居中
        ::v-deep(.van-field) {
            height: 100%;
            display: flex;
            align-items: center;
        }

        ::v-deep(.van-field__control) {
            color: $text-primary;
            padding: 0 !important; // 重置Vant默认padding
            margin: 0 !important; // 重置默认margin
            height: 100%;
            line-height: 1 !important; // 取消line-height干扰，靠flex居中
            font-size: 15px;
            background-color: transparent;
            // 最终保障：flex垂直居中
            display: flex;
            align-items: center;
        }

        ::v-deep(.van-field__placeholder) {
            color: $text-secondary;
            opacity: 0.8;
            line-height: 1; // 占位符也居中
        }

        // 聚焦/hover时：强化浮空效果
        &:hover,
        &:focus-within {
            border-color: rgba(56, 142, 60, 0.2);
            box-shadow: $float-shadow-active;
            transform: translateY(-4px) scale(1.01);
        }
    }

    // 操作按钮样式（不变）
    .action-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        margin-left: 0.5rem;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: $transition;
        border: none;

        &.send-btn {
            background: linear-gradient(135deg, $primary, $primary-hover);
            color: white;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
            }
        }

        &.photo-btn {
            background-color: $primary-light;
            color: $primary;

            &:hover {
                background-color: #dcedc8;
                color: $primary-hover;
                transform: translateY(-2px);
                box-shadow: $shadow-sm;
            }
        }
    }
}

// 兼容样式
.content-container {
    flex: 1;
    overflow: auto;
}

// Vant弹窗样式
::v-deep(.van-popup) {
    border-radius: 0 $radius-lg $radius-lg 0;
    background-color: $bg-card;
    box-shadow: $shadow-md;
}

::v-deep(.van-popup__close-icon) {
    color: $primary;
    font-size: 20px;

    &:hover {
        color: $primary-hover;
    }
}
</style>