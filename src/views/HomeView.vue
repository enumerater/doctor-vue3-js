<template>
    <div class="chat-page">
        <!-- 顶部导航（仅保留菜单按钮） -->
        <div class="nav-header">
            <van-button icon="bars" type="default" size="small" class="menu-btn" @click="showLeft = !showLeft" />
            <div class="capsule-btn"></div>
            <!-- 左侧弹出 -->
            <van-popup v-model:show="showLeft" position="left" :style="{ width: '80%', height: '100%' }" closeable
                round>
                <template #default>
                    <history-list></history-list>
                </template>
            </van-popup>
        </div>

        <!-- Chat小农 Logo 区域（移到卡片上方） -->
        <div class="logo-section">
            <img src="../assets/home/S-农业.png" alt="Chat小农" class="avatar" />
            <h1 class="title">Chat小农</h1>
        </div>

        <!-- 精选问题卡片 -->
        <div class="question-card" border="false">
            <div class="card-header">
                <span class="card-title">精选问题</span>
                <span class="card-date">01.16</span>
            </div>
            <div class="question-list">
                <div class="question-item" v-for="(item, index) in hotQuestions" :key="index"
                    @click="handleQuestionClick(item)">
                    {{ index + 1 }}. {{ item }}
                </div>
            </div>
            <van-button
                icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/f5f85af5-f362-44f3-95a1-9a6192be36ef.png"
                type="default" class="refresh-btn" @click="refreshQuestions">
                换一换
            </van-button>
        </div>

        <!-- 聊天内容区（初始为空，后续可扩展对话记录） -->
        <div class="chat-content">
            <!-- 对话记录会在这里动态渲染 -->
        </div>

        <!-- 底部输入区域 -->
        <div class="input-area">
            <van-field v-model="inputValue" placeholder="请提问和农业相关的内容" class="input-field"
                right-icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                @right-icon-click="sendMessage" />
            <van-button
                icon="https://enumerate-oss.oss-cn-qingdao.aliyuncs.com/fe62741e-d350-4c13-8cf5-a1edf8c98784.png"
                type="default" class="action-btn" @click="sendMessage" />

            <van-button icon="photo-o" type="default" class="action-btn" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import historyList from '@/components/HistoryList.vue'

// 左侧弹出菜单状态
const showLeft = ref(false)

// 精选问题列表
const hotQuestions = ref([
    '如何预防农药抗药性的产生？',
    '如何识别假劣农药？',
    '农药使用后的包装如何处理？',
])

// 备用问题池
const questionPool = [
    '如何防治番茄晚疫病？',
    '小麦倒伏后如何补救？',
    '大棚蔬菜如何提高坐果率？',
    '如何辨别果树缺素症状？',
    '玉米螟的最佳防治时期是什么时候？',
]

// 输入框内容
const inputValue = ref('')

// 点击精选问题
const handleQuestionClick = (question) => {
    inputValue.value = question
    // 可以直接触发发送
    // sendMessage();
}

// 刷新精选问题
const refreshQuestions = () => {
    // 从问题池随机选3个
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random())
    hotQuestions.value = shuffled.slice(0, 3)
}

// 发送消息
const sendMessage = () => {
    if (!inputValue.value.trim()) return
    console.log('发送的问题：', inputValue.value)
    //转到新页面

    inputValue.value = ''
}
</script>

<style lang="scss" scoped>
.chat-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
}

/* 顶部导航（简化） */
.nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f5f7fa;

    .menu-btn {
        font-size: 20px;
        color: #333;
    }

    .capsule-btn {
        width: 60px;
    }
}

/* Chat小农 Logo 样式（移到卡片上方后重新定义） */
.logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 16px 8px;
    /* 和卡片间距匹配 */
    background-color: #f5f7fa;
    /* 匹配页面背景 */

    .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 12px;
    }

    .title {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
    }
}

/* 精选问题卡片 */
.question-card {
    margin: 8px 16px 16px;
    /* 顶部间距调整，匹配logo区域 */
    border-radius: 12px;
    padding: 16px;
    background-color: #fff;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        .card-date {
            font-size: 12px;
            color: #999;
        }
    }

    .question-list {
        margin-bottom: 16px;

        .question-item {
            padding: 10px 0;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }

            &:active {
                background-color: #f5f7fa;
            }
        }
    }

    .refresh-btn {
        display: block;
        margin: 0 auto;
        font-size: 14px;
        color: #666;
        padding: 4px 16px;
    }
}

/* 聊天内容区 */
.chat-content {
    flex: 1;
    padding: 0 16px;
    overflow-y: auto;
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
        margin-right: 8px;
        border-radius: 20px;
        background-color: #f5f7fa;

        .van-field__right-icon {
            color: #34c759;
        }
    }

    .action-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-left: 4px;
        font-size: 20px;
        color: #666;
    }
}
</style>
