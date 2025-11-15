<template>
    <div class="disease-detection-page">
        <!-- 顶部导航栏 -->
        <van-nav-bar title="诊断" left-arrow @click-left="$router.back()" />

        <!-- 对话区域 -->
        <div class="chat-container" ref="chatContainer">
            <!-- 系统欢迎消息 -->
            <div class="message-item system-message">
                <van-image class="avatar" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
                <div class="message-content">
                    您好！请描述您的症状或健康问题，我会为您提供初步的诊断建议。
                </div>
            </div>

            <!-- 动态消息列表 -->
            <div class="message-item"
                :class="{ 'user-message': msg.role === 'user', 'system-message': msg.role === 'system' }"
                v-for="(msg, index) in messages" :key="index">
                <van-image class="avatar" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
                <div class="message-content">{{ msg.content }}</div>
            </div>


        </div>

        <!-- 输入框区域 -->
        <div class="input-container">
            <van-field v-model="inputContent" class="input-field" placeholder="请输入您的症状..." rows="1" type="textarea"
                @keydown.enter.prevent="handleSend" />
            <van-button class="send-btn" type="primary" round @click="handleSend" :disabled="!inputContent.trim()">
                发送
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// 响应式数据（保持不变）
const messages = ref([])
const inputContent = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)

// 监听消息列表变化，自动滚动到底部（保持不变）
watch(messages, () => {
    scrollToBottom()
})

// 发送消息（核心修改）
const handleSend = async () => {
    const content = inputContent.value.trim()
    if (!content) return

    // 添加用户消息
    messages.value.push({
        role: 'user',
        content: content
    })
    inputContent.value = ''
    isLoading.value = true

    // 添加系统消息占位符（用于实时更新）
    const systemMsgIndex = messages.value.push({
        role: 'system',
        content: ''
    }) - 1; // 记录索引，用于后续更新

    try {
        // 发送POST请求，处理流式响应
        const response = await fetch('http://localhost:8080/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token') || '',
                // 如需跨域携带cookie，添加以下配置
                // 'Credentials': 'include'
            },
            body: JSON.stringify({
                message: content,
                username: 'user123',
                key: '123456',
                id: '123456'
            })
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        // 获取可读流并解码
        const reader = response.body.getReader();
        const decoder = new TextDecoder(); // 用于将二进制流转为文本

        // 循环读取流数据
        while (true) {
            const { done, value } = await reader.read();
            if (done) break; // 流结束

            // 解码当前块并追加到消息中
            const chunk = decoder.decode(value, { stream: true }); // stream: true保持流式解码
            messages.value[systemMsgIndex].content += chunk.replace('data', '').replace(' ', '').replace(':', ''); // 替换换行符为HTML换行

            // 实时滚动到底部
            scrollToBottom();
        }
    } catch (error) {
        console.error('流式请求错误:', error);
        messages.value[systemMsgIndex].content += '（加载失败，请重试）';
    } finally {
        isLoading.value = false; // 无论成功失败，关闭加载状态
    }
}

// 滚动到最底部（保持不变）
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    })
}

defineExpose({ handleSend, scrollToBottom })
</script>


<style scoped>
.disease-detection-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
}

/* 对话区域样式 */
.chat-container {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    box-sizing: border-box;
}

/* 消息项样式 */
.message-item {
    display: flex;
    margin-bottom: 16px;
    max-width: 100%;
}

/* 系统消息（左侧） */
.system-message {
    align-items: flex-start;
}

/* 用户消息（右侧） */
.user-message {
    flex-direction: row-reverse;
    align-items: flex-start;
}

/* 头像样式 */
.avatar {
    width: 40px;
    height: 40px;
    margin-right: 8px;
    flex-shrink: 0;
}

.user-message .avatar {
    margin-right: 0;
    margin-left: 8px;
}

/* 消息内容样式 */
.message-content {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 8px;
    line-height: 1.5;
}

.system-message .message-content {
    background-color: #ffffff;
    border: 1px solid #eee;
}

.user-message .message-content {
    background-color: #07c160;
    color: #ffffff;
    text-align: right;
}

/* 加载状态样式 */
.loading-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.loading-item .van-loading {
    margin-left: 8px;
}

/* 输入框区域样式 */
.input-container {
    display: flex;
    padding: 12px;
    background-color: #ffffff;
    border-top: 1px solid #eee;
}

.input-field {
    flex: 1;
    margin-right: 12px;
    background-color: #f5f5f5;
    border-radius: 20px;
}

.send-btn {
    width: 60px;
    height: 40px;
    padding: 0;
}
</style>