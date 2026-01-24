<template>
    <div class="history-list-container">
        <!-- 历史记录列表 -->
        <div class="history-content">
            <!-- 空状态 -->
            <div class="empty-history" v-if="sidebarStore.filteredHistory.length === 0">
                <van-empty description="暂无对话历史记录" icon="clock-o" />
            </div>

            <!-- 历史记录项 -->
            <div class="history-item" :class="{ active: item.id === sidebarStore.activeItemId }"
                v-for="item in sidebarStore.filteredHistory" :key="item.id"
                @click="sidebarStore.selectHistoryItem(item.sessionId)">
                <!-- 未读标记 -->
                <van-badge dot v-if="item.unread" class="unread-dot" />

                <!-- 记录内容 -->
                <div class="item-main">
                    <h3 class="item-title">{{ item.sessionTitle }}</h3>
                    <div class="item-footer">
                        <span class="item-time">{{ item.lastChatTime }}</span>
                        <van-button size="mini" type="text" icon="delete" class="delete-btn"
                            @click.stop="sidebarStore.deleteHistoryItem(item.id)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { onMounted } from 'vue'

const sidebarStore = useSidebarStore()

// 组件初始化时加载历史记录
onMounted(() => {
    sidebarStore.fetchHistoryList()
})
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
