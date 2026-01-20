<template>
    <div class="chat-detail-page">
        <!-- 顶部导航 -->
        <div class="chat-nav">
            <van-button icon="arrow-left" type="default" @click="goBack" />
            <div class="nav-title">Chat小农</div>
        </div>

        <!-- 对话内容区域 -->
        <div class="chat-container" ref="chatContainer">
            <!-- 对话列表 -->
            <div class="message-item" v-for="(msg, index) in messageList" :key="index" :class="['message-' + msg.role]">
                <!-- 头像 -->
                <img :src="msg.role === 'ai'
                        ? require('@/assets/home/S-农业.png')
                        : require('@/assets/user-avatar.png')
                    " alt="avatar" class="avatar" />
                <!-- 消息内容 -->
                <div class="message-content">
                    {{ msg.content }}
                </div>
            </div>
        </div>

        <!-- 底部输入区域 -->
        <div class="input-area">
            <van-field v-model="inputValue" placeholder="请继续提问和农业相关的内容" class="input-field"
                @keyup.enter="sendMessage" />
            <van-button type="primary" class="send-btn" @click="sendMessage">发送</van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 获取路由参数和路由实例
const route = useRoute()
const router = useRouter()

// 对话列表（核心数据）
const messageList = ref([])
// 输入框内容
const inputValue = ref('')
// 聊天容器ref（用于滚动到底部）
const chatContainer = ref(null)

// 模拟的AI回复池（农业相关）
const aiReplyPool = {
    '如何预防农药抗药性的产生？':
        '预防农药抗药性的核心是科学轮换用药：1. 避免长期单一使用某种农药；2. 按照推荐剂量和次数使用；3. 结合农业防治、生物防治等综合措施；4. 交替使用不同作用机制的农药品种。',
    '如何识别假劣农药？':
        '识别假劣农药可从这几点入手：1. 查看包装标签是否完整（包含登记证号、生产许可证号、执行标准号）；2. 检查生产日期、保质期和批号是否清晰；3. 观察药剂外观（有无分层、沉淀、变色）；4. 通过农业农村部官网查询登记信息真伪。',
    '农药使用后的包装如何处理？':
        '农药包装废弃物处理规范：1. 空包装要先冲洗3次以上（冲洗液倒入施药器械）；2. 硬质包装（瓶、桶）压扁后集中回收；3. 软包装剪开后冲洗干净再回收；4. 严禁随意丢弃，可交给农资店统一回收处理。',
    '如何防治番茄晚疫病？':
        '番茄晚疫病防治方法：1. 选用抗病品种；2. 合理密植，及时整枝打杈，保证通风透光；3. 发病初期及时喷施霜霉威盐酸盐、烯酰吗啉等药剂；4. 避免大水漫灌，采用滴灌或膜下灌溉。',
    // 默认回复（匹配不到具体问题时）
    default:
        '您的问题很有价值！根据农业生产规范，建议您：1. 结合当地气候和土壤条件调整管理措施；2. 咨询当地农业技术推广站；3. 严格按照相关技术规程操作，确保生产安全。',
}

// 页面挂载时初始化对话（把跳转过来的问题作为第一条用户消息）
onMounted(() => {
    const initQuestion = route.params.question
    if (initQuestion) {
        // 添加用户初始问题
        messageList.value.push({
            role: 'user', // user表示用户，ai表示智能助手
            content: initQuestion,
            time: new Date().toLocaleTimeString(),
        })
        // 模拟AI回复（延迟500ms，更贴近真实交互）
        setTimeout(() => {
            generateAiReply(initQuestion)
        }, 500)
    }
})

// 监听对话列表变化，自动滚动到底部
watch(
    messageList,
    () => {
        scrollToBottom()
    },
    { deep: true },
)

// 滚动到底部的方法
const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

// 生成AI回复
const generateAiReply = (question) => {
    // 从回复池匹配对应回复，没有则用默认回复
    const replyContent = aiReplyPool[question] || aiReplyPool.default
    messageList.value.push({
        role: 'ai',
        content: replyContent,
        time: new Date().toLocaleTimeString(),
    })
}

// 发送消息
const sendMessage = () => {
    const content = inputValue.value.trim()
    if (!content) return

    // 添加用户消息
    messageList.value.push({
        role: 'user',
        content,
        time: new Date().toLocaleTimeString(),
    })
    // 清空输入框
    inputValue.value = ''
    // 模拟AI回复
    setTimeout(() => {
        generateAiReply(content)
    }, 500)
}

// 返回上一页
const goBack = () => {
    router.go(-1)
}
</script>

<style lang="scss" scoped>
.chat-detail-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
}

/* 顶部导航 */
.chat-nav {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: #fff;
    border-bottom: 1px solid #eee;

    .nav-title {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }
}

/* 对话容器 */
.chat-container {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    // 统一的消息项样式
    .message-item {
        display: flex;
        margin-bottom: 16px;
        max-width: 85%;

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .message-content {
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
            margin: 0 8px;
        }
    }

    // 用户消息（右对齐）
    .message-user {
        flex-direction: row-reverse;
        margin-left: auto;

        .message-content {
            background-color: #34c759;
            color: #fff;
            border-bottom-right-radius: 4px;
        }
    }

    // AI消息（左对齐）
    .message-ai {
        .message-content {
            background-color: #fff;
            color: #333;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
    }
}

/* 底部输入区 */
.input-area {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: #fff;
    border-top: 1px solid #eee;

    .input-field {
        flex: 1;
        border-radius: 20px;
        background-color: #f5f7fa;
    }

    .send-btn {
        margin-left: 8px;
        border-radius: 20px;
        padding: 8px 16px;
    }
}
</style>
