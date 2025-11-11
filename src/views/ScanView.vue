<template>
    <van-nav-bar fixed title="识别" left-arrow @click-left="$router.back()" />
    <div class="chat-container">
        <!-- 对话列表 -->
        <div class="message-list" ref="messageList">
            <div v-for="item in messages" :key="item.id" :class="['message-item', item.type]">
                <img :src="item.avatar" class="avatar" v-if="item.showAvatar" />
                <div class="bubble" :class="item.type">
                    <van-image v-if="item.isImage" :src="item.content" fit="cover" class="message-image"
                        :lazy-load="true" />
                    <span v-else>{{ item.content }}</span>
                    <!-- 加载状态指示器 -->
                    <van-loading v-if="item.loading" size="16" class="loading-indicator" />
                </div>
            </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="bottom-bar">
            <van-uploader class="upload-btn" :after-read="handleImageUpload" accept="image/*" :show-file-list="false"
                :before-read="beforeImageUpload">
                <van-icon name="photo" size="20" />
            </van-uploader>
            <van-field ref="messageInput" v-model="inputValue" placeholder="请输入消息..." class="input-field"
                @keyup.enter="sendMessage" />
            <van-button @click="sendMessage" type="primary" size="small" class="send-btn"
                :disabled="!inputValue.trim()">
                发送
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';
import { showToast } from 'vant';

// 生成唯一ID
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// 存储图片对象URL用于清理
const imageObjectUrls = ref([]);

// 消息列表
const messages = ref([
    {
        id: generateId(),
        type: 'ai',
        content: '你好！我是你的智能助手，请问有什么可以帮助你的吗？',
        avatar: 'https://img.yzcdn.cn/vant/logo.png',
        showAvatar: true,
        isImage: false,
        loading: false,
    },
]);

const inputValue = ref('');
const messageList = ref(null);
const messageInput = ref(null);

// 自动滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (messageList.value) {
            messageList.value.scrollTop = messageList.value.scrollHeight;
        }
    });
};

// 发送文本消息
const sendMessage = () => {
    const content = inputValue.value.trim();
    if (!content) {
        showToast('请输入消息内容');
        return;
    }

    // 新增用户消息
    messages.value.push({
        id: generateId(),
        type: 'user',
        content,
        avatar: 'https://img.yzcdn.cn/user-upload/12345.png',
        showAvatar: true,
        isImage: false,
        loading: false,
    });

    // 清空输入框并聚焦
    inputValue.value = '';
    messageInput.value?.focus();

    // 滚动到底部
    scrollToBottom();

    // 模拟AI回复
    simulateAiReply();
};

// 图片上传前检查
const beforeImageUpload = (file) => {
    // 简单的大小检查
    if (file.size > 10 * 1024 * 1024) {
        showToast('图片大小不能超过10MB');
        return false;
    }
    return true;
};

// 处理图片上传
const handleImageUpload = (file) => {
    // 显示上传中状态
    const loadingMsgId = generateId();
    messages.value.push({
        id: loadingMsgId,
        type: 'user',
        content: '上传中...',
        avatar: 'https://img.yzcdn.cn/user-upload/12345.png',
        showAvatar: true,
        isImage: false,
        loading: true,
    });
    scrollToBottom();

    // 模拟上传过程
    setTimeout(() => {
        // 移除加载消息
        messages.value = messages.value.filter(item => item.id !== loadingMsgId);

        // 创建图片URL
        const imageUrl = URL.createObjectURL(file.file);
        imageObjectUrls.value.push(imageUrl);

        // 添加图片消息
        messages.value.push({
            id: generateId(),
            type: 'user',
            content: imageUrl,
            avatar: 'https://img.yzcdn.cn/user-upload/12345.png',
            showAvatar: true,
            isImage: true,
            loading: false,
        });

        scrollToBottom();
        // 模拟AI对图片的回复
        simulateImageAiReply();
    }, 800);
};

// 模拟AI文本回复
const simulateAiReply = () => {
    // 添加AI加载状态
    const aiLoadingId = generateId();
    messages.value.push({
        id: aiLoadingId,
        type: 'ai',
        content: '思考中...',
        avatar: 'https://img.yzcdn.cn/vant/logo.png',
        showAvatar: true,
        isImage: false,
        loading: true,
    });
    scrollToBottom();

    setTimeout(() => {
        // 移除加载状态消息
        messages.value = messages.value.filter(item => item.id !== aiLoadingId);

        // 添加实际回复
        messages.value.push({
            id: generateId(),
            type: 'ai',
            content: '你的问题很有价值，我来为你解答...',
            avatar: 'https://img.yzcdn.cn/vant/logo.png',
            showAvatar: true,
            isImage: false,
            loading: false,
        });
        scrollToBottom();
    }, 1500);
};

// 模拟AI图片回复
const simulateImageAiReply = () => {
    // 添加AI加载状态
    const aiLoadingId = generateId();
    messages.value.push({
        id: aiLoadingId,
        type: 'ai',
        content: '正在识别图片...',
        avatar: 'https://img.yzcdn.cn/vant/logo.png',
        showAvatar: true,
        isImage: false,
        loading: true,
    });
    scrollToBottom();

    setTimeout(() => {
        // 移除加载状态消息
        messages.value = messages.value.filter(item => item.id !== aiLoadingId);

        // 添加实际回复
        messages.value.push({
            id: generateId(),
            type: 'ai',
            content: '我已识别图片内容，这是分析结果...',
            avatar: 'https://img.yzcdn.cn/vant/logo.png',
            showAvatar: true,
            isImage: false,
            loading: false,
        });
        scrollToBottom();
    }, 2000);
};

// 组件卸载前清理图片URL，防止内存泄漏
onBeforeUnmount(() => {
    imageObjectUrls.value.forEach(url => {
        URL.revokeObjectURL(url);
    });
});

// 初始滚动到底部
scrollToBottom();
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
    min-height: 100vh;
    padding-top: 46px;
    /* 适配导航栏高度 */
    padding-bottom: 60px;
    /* 适配底部栏高度 */
    box-sizing: border-box;
}

.message-list {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    height: calc(100vh - 106px);
    /* 减去导航栏和底部栏高度 */
}

.message-item {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;
    max-width: 100%;
}

.message-item.ai {
    flex-direction: row;
}

.message-item.user {
    flex-direction: row-reverse;
    text-align: right;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 10px;
    flex-shrink: 0;
    /* 防止头像被压缩 */
}

.bubble {
    max-width: 80%;
    /* 增加最大宽度，提升显示效果 */
    padding: 10px 12px;
    border-radius: 12px;
    word-break: break-all;
    position: relative;
}

.bubble.ai {
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.bubble.user {
    background-color: #4285f4;
    color: #fff;
}

.message-image {
    width: 100%;
    border-radius: 8px;
    display: block;
}

.loading-indicator {
    margin-left: 8px;
    vertical-align: middle;
}

.bottom-bar {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    background-color: #fff;
    border-top: 1px solid #eee;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
}

.upload-btn {
    margin-right: 8px;
    padding: 5px;
}

.input-field {
    flex: 1;
    margin: 0 8px;
    --van-field-input-height: 40px;
}

.send-btn {
    width: 80px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>