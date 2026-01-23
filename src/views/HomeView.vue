<template>
    <div class="chat-page">
        <!-- 模板部分保持不变 -->
        <div class="nav-header">
            <van-button icon="bars" type="default" size="small" class="menu-btn" @click="showLeft = !showLeft" />
            <div class="capsule-btn"></div>
            <van-popup v-model:show="showLeft" position="left" :style="{ width: '80%', height: '100%' }" closeable
                round>
                <template #default>
                    <Sidebar @resetConversation="resetConversation" @get-message="handleGetMessage"></Sidebar>
                </template>
            </van-popup>
        </div>

        <div class="main-content">
            <!-- 二级路由 -->
            <router-view @question-click="handleQuestionSelect" :messages="messages" :key="$route.fullPath"
                @refreshDone="handleRefreshDone" @get-message="handleGetMessage"></router-view>
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
import { ref, onUnmounted, onMounted } from 'vue'
import Sidebar from '@/views/SidebarView.vue'

import { updateSesssionId } from '@/axios/user'
import { createSession } from '@/axios/session'

import { useRouter } from 'vue-router'
const router = useRouter()

import { useSidebarStore } from '@/stores/sidebar' // 引入侧边栏Store

const sidebarStore = useSidebarStore() // 获取Store实例

const sessionId = ref('')
sessionId.value = localStorage.getItem('sessionId') || ''
// 左侧弹出菜单状态
import { storeToRefs } from 'pinia'
const { showLeft } = storeToRefs(sidebarStore)

const handleRefreshDone = () => {
    showLeft.value = false
}

const handleGetMessage = (id) => {
    getMessage({
        sessionId: '' + id,
    }).then((res) => {
        console.log(res.data)
        messages.value.push(...res.data)
    })
}

const inputValue = ref('')
const messages = ref([])
// 定义Authorization令牌（建议从本地存储/状态管理中读取，这里先硬编码）
const TOKEN = localStorage.getItem('token') // 带Authorization的流式请求（fetch + ReadableStream方案）
const sendMessage = async () => {
    const content = inputValue.value.trim()
    if (!content) return

    // 1. 添加用户消息
    const userMsg = { type: 'user', content: content }
    messages.value.push(userMsg)
    console.log('添加用户消息：', userMsg)

    // 2. 初始化机器人消息
    const robotMsg = { type: 'robot', content: '' }
    messages.value.push(robotMsg)
    const robotMsgIndex = messages.value.length - 1
    console.log('初始化机器人消息，索引：', robotMsgIndex)

    inputValue.value = ''

    router.push({
        name: 'chatDetail',
        params: { sessionId: '' + localStorage.getItem('id') + sessionId.value },
    })

    try {
        const url = new URL('http://localhost:8080/chat/memory')
        url.searchParams.append('prompt', content)
        url.searchParams.append('userId', localStorage.getItem('id'))
        url.searchParams.append('sessionId', localStorage.getItem('sessionId'))

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                Authorization: TOKEN,
            },
        })

        if (!response.ok) {
            throw new Error(`请求失败：${response.status} ${response.statusText}`)
        }
        console.log('请求成功，开始读取流式数据')

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) {
                console.log('流式数据读取完成')
                break
            }

            // 解码原始二进制数据
            buffer += decoder.decode(value, { stream: true })

            // ========== 核心修改：适配后端的多行SSE格式 ==========
            // 1. 按换行符分割所有行（不管是\n还是\r\n）
            const allLines = buffer.split(/\r?\n/)
            // 2. 最后一行可能不完整，放回buffer
            buffer = allLines.pop() || ''

            // 3. 遍历每一行，只处理data:开头的行
            for (const line of allLines) {
                const trimedLine = line.trim()
                if (!trimedLine) continue

                // 跳过id:和event:行，只处理data:行
                if (trimedLine.startsWith('data:')) {
                    // 提取data:后面的内容（去掉data:前缀）
                    const chunk = trimedLine.substring(5).trim()
                    // 跳过空的data行
                    if (chunk === '' || chunk === '[DONE]') continue

                    console.log('提取到的有效内容：', chunk) // 验证提取结果
                    // 拼接内容到机器人消息（响应式更新）
                    messages.value[robotMsgIndex].content += chunk
                }
            }
        }
    } catch (error) {
        console.error('流式请求出错：', error)
        if (messages.value[robotMsgIndex]) {
            messages.value[robotMsgIndex].content = `请求失败：${error.message}`
        }
    }
}

import { getUser } from '@/axios/user'

// 重置对话
const resetConversation = () => {
    // 1 发请求让sessionid + 1
    updateSesssionId({
        userId: localStorage.getItem('id'),
    })

    // 3 从服务端获取新sessionid
    getUser({
        id: localStorage.getItem('id'),
    })
        .then((res) => {
            // 关键修改：-> 改为 =>
            console.log('用户信息请求成功：', res)
            localStorage.setItem('sessionId', res.data.sessionId)

            // 2 发请求创建新session
            createSession({
                userId: localStorage.getItem('id'),
                sessionTitle: '新会话',
                sessionId: '' + localStorage.getItem('id') + localStorage.getItem('sessionId'),
            })
        })
        .catch((err) => {
            // 新增：捕获请求失败的异常
            console.error('用户信息请求失败：', err)
        })

    localStorage.setItem('sessionId', sessionId.value)

    router.push({ name: 'chatBegin' })

    messages.value = []
    inputValue.value = ''
    showLeft.value = false
}

// 处理热门问题点击事件
const handleQuestionSelect = (question) => {
    inputValue.value = question
}

import { getMessage } from '@/axios/chat'
onMounted(() => {
    getMessage({
        sessionId: '' + localStorage.getItem('id') + localStorage.getItem('sessionId'),
    }).then((res) => {
        console.log(res.data)
        messages.value.push(...res.data)
    })
})
// 组件卸载时清理
onUnmounted(() => {
    // 无需要关闭的EventSource，fetch的reader会随请求结束自动清理
})
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
