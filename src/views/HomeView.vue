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
            <div class="input-row">
                <van-field v-model="chatStore.inputValue" placeholder="请输入您的问题" class="input-field"
                    @keyup.enter="sendMessage" />
                <van-button
                    icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                    type="default" class="action-btn send-btn" @click="sendMessage" />
                <van-button class="fold-btn" icon="ellipsis" type="default" @click="isFunctionShow = !isFunctionShow" />
            </div>

            <div class="function-area" :class="{ show: isFunctionShow }">
                <!-- 仅绑定 active 类控制两种状态 -->
                <van-button icon="photo-o" type="default" class="function-btn " @click="photo">
                    图像识别
                </van-button>
                <van-button icon="lightbulb-o" type="default" class="function-btn"
                    :class="{ active: functionStatus.netSearch }" @click="netSearch">
                    联网搜索
                </van-button>
                <van-button icon="switch-o" type="default" class="function-btn"
                    :class="{ active: functionStatus.switchModel }" @click="switchModel">
                    模型切换
                </van-button>
                <van-button icon="setting-o" type="default" class="function-btn"
                    :class="{ active: functionStatus.moreSettings }" @click="moreSettings">
                    更多设置
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const isFunctionShow = ref(false)
// 核心：仅用布尔值控制 未选中(false)/选中(true) 两种状态
const functionStatus = ref({
    photo: false,
    netSearch: false,
    switchModel: false,
    moreSettings: false
})

const photo = () => {
    router.push({ name: 'vision' })
}

const netSearch = () => {
    functionStatus.value.netSearch = !functionStatus.value.netSearch
}

const switchModel = () => {
    functionStatus.value.switchModel = !functionStatus.value.switchModel
}

const moreSettings = () => {
    functionStatus.value.moreSettings = !functionStatus.value.moreSettings
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

onMounted(() => {
    sidebarStore.resetConversation()
})
</script>

<style lang="scss" scoped>
// 只保留核心颜色变量：默认色 + 选中色
$primary: #388e3c;
$default-bg: #e8f5e9;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

.chat-page {
    min-height: 100vh;
    width: 100vw;
    max-width: 100%;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    overflow-x: hidden;
}

.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.75rem;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
            background-color: $default-bg;
        }
    }

    .capsule-btn {
        width: 40px;
    }
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 50px;
    padding-bottom: 120px;
    background-color: #f8f9fa;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.input-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: #ffffff;
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

.input-row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
}

.input-field {
    flex: 1;
    border-radius: 20px;
    background-color: rgba(224, 230, 224, 0.95);
    border: 1px solid rgba(56, 142, 60, 0.1);
    padding: 0 0.75rem;
    height: 42px;
    transition: $transition;
    display: flex;
    align-items: center;

    ::v-deep(.van-field) {
        height: 100%;
        display: flex;
        align-items: center;
    }

    ::v-deep(.van-field__control) {
        color: #2d3748;
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
        color: #718096;
        opacity: 0.8;
        line-height: 1;
        font-size: 13px;
    }

    &:focus-within {
        border-color: rgba(56, 142, 60, 0.2);
    }
}

.action-btn,
.fold-btn {
    border-radius: 50%;
    border: none !important;
    flex-shrink: 0;
    transition: $transition;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $default-bg !important;
    color: $primary !important;
}

.action-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
}

.fold-btn {
    width: 40px !important;
    height: 40px !important;
    padding: 0 !important;
}

.function-area {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    flex-wrap: wrap;
    display: none !important;

    &.show {
        display: flex !important;
    }

    // 功能按钮 仅两种状态：默认 + active选中
    .function-btn {
        width: auto;
        height: auto;
        border-radius: 12px !important;
        padding: 0.35rem 0.8rem;
        gap: 0.25rem;
        font-size: 13px;
        white-space: nowrap;
        border: none !important;
        transition: $transition;
        // 1. 默认状态样式
        background-color: $default-bg !important;
        color: $primary !important;

        ::v-deep(.van-icon) {
            font-size: 14px;
        }

        // 2. 选中状态样式（仅改背景和文字色）
        &.active {
            background-color: $primary !important;
            color: #ffffff !important;
        }
    }
}

@media (min-width: 376px) {
    .fold-btn {
        display: none !important;
    }

    .function-area {
        display: flex !important;
    }
}

@media (max-width: 375px) {
    .fold-btn {
        display: flex !important;
    }
}

::v-deep(.van-popup) {
    border-radius: 0 20px 20px 0;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

::v-deep(.van-popup__close-icon) {
    color: $primary;
    font-size: 18px;
}
</style>