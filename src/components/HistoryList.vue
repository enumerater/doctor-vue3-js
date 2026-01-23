<template>
    <div class="history-list-container">
        <!-- 历史记录列表 -->
        <div class="history-content">
            <!-- 空状态 -->
            <div class="empty-history" v-if="filteredHistory.length === 0">
                <van-empty description="暂无对话历史记录" icon="clock-o" />
            </div>

            <!-- 历史记录项 -->
            <div class="history-item" :class="{ active: item.id === activeItemId }" v-for="item in filteredHistory"
                :key="item.id" @click="handleItemClick(item.sessionId)">
                <!-- 未读标记 -->
                <van-badge dot v-if="item.unread" class="unread-dot" />

                <!-- 记录内容 -->
                <div class="item-main">
                    <h3 class="item-title">{{ item.sessionTitle }}</h3>
                    <div class="item-footer">
                        <span class="item-time">{{ item.lastChatTime }}</span>
                        <van-button size="mini" type="text" icon="delete" class="delete-btn"
                            @click.stop="handleDelete(item.id)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { deleteSession } from '@/axios/session'
import { watch } from 'vue'
import { defineProps } from 'vue'
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'

const router = useRouter()
const sidebarStore = useSidebarStore()

// 搜索关键词
const searchKeyword = ref('')
// 当前选中的记录ID
const activeItemId = ref(1)

// 模拟农业对话历史数据（贴合Chat小农的业务场景）
const historyList = ref([])

// 根据搜索关键词过滤历史记录
const filteredHistory = computed(() => {
    if (!searchKeyword.value.trim()) return historyList.value
    return historyList.value.filter(
        (item) => item.sessionTitle?.includes(searchKeyword.value) // 加?.避免字段不存在报错
    )
})

// 核心修改1：修正emit事件名（和父组件一致：refreshDone）
const emit = defineEmits(['refreshDone', 'get-message'])
// 点击历史记录项（可跳转到对应对话）
// const handleItemClick = (id) => {
//     activeItemId.value = id
//     // 这里可以添加跳转到对应对话的逻辑，比如向父组件传递选中的记录
//     console.log('选中对话ID：', id)
//     router.push({
//         name: 'chatDetail',
//         params: {
//             sessionId: id,
//         },
//     })
//     // 核心修改2：触发get-message，通知父组件获取选中对话的消息
//     emit('get-message', id)
//     sidebarStore.closeLeft()
// }

// 引入chatStore
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// 点击历史记录项的逻辑修改
const handleItemClick = (sessionId) => {
    // 1. 更新全局状态中的当前会话ID
    chatStore.setCurrentSessionId(sessionId)
    // 2. 立即请求该会话的历史消息（提前加载，避免页面空白）
    chatStore.fetchMessages(sessionId)

    // 3. 路由跳转（保持原有逻辑）
    router.push({
        name: 'chatDetail',
        params: {
            sessionId: sessionId, // 路由参数也传递sessionId，做双重保障
        },
    })

    sidebarStore.closeLeft()
}


// 删除单条历史记录
const handleDelete = (id) => {
    historyList.value = historyList.value.filter((item) => item.id !== id)
    // 如果删除的是当前选中项，重置选中状态
    if (activeItemId.value === id) {
        activeItemId.value = historyList.value[0]?.id || ''
    }

    deleteSession(id).then((res) => {
        console.log('删除对话历史记录', res.data)
    })
}

// 获取所有对话历史记录
import { getAllSession } from '@/axios/session'
import { onMounted } from 'vue'

// 封装刷新逻辑（复用）
const updateSession = () => {
    console.log('开始刷新历史记录')
    getAllSession()
        .then((res) => {
            console.log('刷新到的历史记录：', res.data)
            historyList.value = res.data || []
        })
        .catch((err) => {
            console.error('刷新历史记录失败：', err)
        })
}

// 组件初始化时加载数据
onMounted(() => {
    updateSession()
})

// 接收父组件的刷新信号
const props = defineProps({
    refreshTrigger: {
        type: Boolean,
        default: false,
    },
})

// 监听刷新信号，触发刷新
watch(
    () => props.refreshTrigger,
    (newVal) => {
        if (newVal) {
            // 只有信号为true时才刷新
            updateSession()
            // 核心修改3：触发refreshDone，通知父组件重置信号
            emit('refreshDone')
        }
    },
    { immediate: true },
)
</script>

<style lang="scss" scoped>
.history-list-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

// 头部样式
.history-header {
    padding: 16px 15px;
    border-bottom: 1px solid #f0f0f0;

    .history-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }
}

// 搜索框样式
.history-search {
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
}

// 列表内容区
.history-content {
    flex: 1;
    overflow-y: auto;
    padding: 5px 0;

    // 空状态样式
    .empty-history {
        padding: 40px 0;
    }

    // 历史记录项
    .history-item {
        padding: 12px 15px;
        margin: 0 5px;
        border-radius: 8px;
        position: relative;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #f8f9fa;
        }

        &.active {
            background-color: #e6f7ff;
        }

        // 未读红点
        .unread-dot {
            position: absolute;
            top: 15px;
            right: 15px;
        }

        // 记录主体内容
        .item-main {
            .item-title {
                margin: 0 0 4px 0;
                font-size: 15px;
                color: #333;
                font-weight: 500;
            }

            .item-desc {
                margin: 0 0 8px 0;
                font-size: 13px;
                color: #666;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .item-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .item-time {
                    font-size: 12px;
                    color: #999;
                }

                .delete-btn {
                    color: #999;

                    &:hover {
                        color: #f5222d;
                    }
                }
            }
        }
    }
}

// 优化滚动条样式
.history-content::-webkit-scrollbar {
    width: 4px;
}

.history-content::-webkit-scrollbar-track {
    background: transparent;
}

.history-content::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 2px;
}
</style>
