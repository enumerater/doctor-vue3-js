<template>
  <div class="chat-home">
    <!-- PC: sidebar -->
    <div class="chat-sidebar" v-if="!isMobile">
      <div class="sidebar-header">
        <el-button type="primary" @click="handleNewChat" class="new-chat-btn" round>
          新建对话
        </el-button>
      </div>
      <div class="sidebar-search">
        <el-input
          v-model="sidebarStore.searchKeyword"
          placeholder="搜索对话..."
          prefix-icon="Search"
          clearable
          size="default"
        />
      </div>
      <div class="history-list">
        <HistoryList />
      </div>
    </div>

    <!-- Mobile: history drawer -->
    <el-drawer
      v-if="isMobile"
      v-model="showHistory"
      direction="ltr"
      size="75%"
      :show-close="false"
    >
      <template #header>
        <el-button type="primary" @click="handleNewChat" round size="small">新建对话</el-button>
      </template>
      <HistoryList />
    </el-drawer>

    <!-- Main content -->
    <div class="chat-main">
      <!-- Mobile: toolbar -->
      <div class="mobile-toolbar" v-if="isMobile">
        <el-button text @click="showHistory = true">
          <el-icon><List /></el-icon>
          历史记录
        </el-button>
      </div>

      <!-- Content area -->
      <div class="chat-content" ref="chatContentRef">
        <!-- Empty state -->
        <div v-if="chatStore.chatMessages.length === 0" class="empty-state">
          <template v-if="sidebarStore.isAgricultureAgent">
            <LogoSection class="logo-section" title="Agent小农" subtitle="专业农业智能助手" altText="Agent小农" />
            <AgentHotQuestionCard class="hot-question-card" />
          </template>
          <template v-else>
            <div class="empty-icon">💬</div>
            <div class="empty-title">开始一段新对话</div>
            <div class="empty-desc">向AI助手提问关于农业种植、病害诊断的问题</div>
          </template>
        </div>

        <!-- Message list -->
        <div v-else class="message-list">
          <div
            v-for="(msg, index) in chatStore.chatMessages"
            :key="msg.id || index"
            class="message-item"
            :class="{
              'user-message': msg.messageRole === '0',
              'robot-message': msg.messageRole === '1',
            }"
          >
            <div class="message-bubble">
              <div class="bubble-content" v-html="parseMarkdown(msg.messageContent)"></div>
              <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-wrapper">
        <AgentSettingsInline
          :visible="showAgentSettings"
          @close="showAgentSettings = false"
        />
        <ChatInputCard
          ref="chatInputCardRef"
          @send="sendMessage"
          @toggle-settings="showAgentSettings = !showAgentSettings"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'
import HistoryList from '@/components/HistoryList.vue'
import ChatInputCard from '@/components/ChatInputCard.vue'
import AgentSettingsInline from '@/components/AgentSettingsInline.vue'
import LogoSection from '@/components/LogoSection.vue'
import AgentHotQuestionCard from '@/components/AgentHotQuestionCard.vue'
import { List } from '@element-plus/icons-vue'

marked.setOptions({ breaks: true, gfm: true })

const router = useRouter()
const route = useRoute()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()

const isMobile = ref(window.innerWidth <= 768)
const showHistory = ref(false)
const showAgentSettings = ref(false)
const chatContentRef = ref(null)
const chatInputCardRef = ref(null)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  if (!chatStore.autoSendPending) {
    await sidebarStore.prepareConversation()
  }
  await sidebarStore.fetchHistoryList()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// Auto-send (transferred from other pages)
watch(
  () => chatStore.autoSendPending,
  async (pending) => {
    if (pending && sidebarStore.isAgricultureAgent) {
      await nextTick()
      if (chatStore.pendingTransferImageUrl && chatInputCardRef.value) {
        chatInputCardRef.value.setImages([chatStore.pendingTransferImageUrl])
      }
      setTimeout(async () => {
        await sendMessage(
          chatStore.inputValue || '',
          chatStore.pendingTransferImageUrl ? [chatStore.pendingTransferImageUrl] : []
        )
        chatStore.clearAutoSend()
      }, 300)
    }
  },
  { immediate: true },
)

const handleNewChat = async () => {
  sidebarStore.isAgricultureAgent = false
  sidebarStore.agentImageUploadEnabled = false
  await sidebarStore.prepareConversation()
  chatStore.clearMessages()
  showHistory.value = false
}

const parseMarkdown = (content) => {
  if (!content) return ''
  try {
    return marked.parse(content)
  } catch {
    return content
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const sendMessage = async (content, images = []) => {
  const trimmedContent = (content || '').trim()
  if (!trimmedContent && images.length === 0) return

  const userId = localStorage.getItem('id')
  let storedSessionId = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partialSessionId = storedSessionId.startsWith(userId)
    ? storedSessionId.substring(userId.length)
    : storedSessionId
  const fullSessionId = `${userId}${partialSessionId}`
  chatStore.setCurrentSessionId(fullSessionId)

  await chatStore.prepareMessage(trimmedContent, userId, partialSessionId)

  router.push({ name: 'chatDetail', params: { sessionId: fullSessionId } })

  const TOKEN = localStorage.getItem('token')
  chatStore.startStreaming(trimmedContent, images, userId, partialSessionId, TOKEN).catch((err) => {
    console.error('流式请求失败：', err)
  })
}
</script>

<style lang="scss" scoped>
.chat-home {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.chat-sidebar {
  width: 280px;
  border-right: 1px solid $border;
  background: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;

  .sidebar-header {
    padding: 16px;
    display: flex;
    gap: 8px;

    .new-chat-btn {
      flex: 1;
    }
  }

  .sidebar-search {
    padding: 0 16px 12px;
  }

  .history-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.mobile-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid $border;
  background: #fff;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  @include mobile {
    padding: 12px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;

  .empty-icon {
    font-size: 48px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
  }

  .empty-desc {
    font-size: 14px;
    color: $text-secondary;
  }

  .logo-section {
    margin-bottom: 2rem;
    text-align: center;
  }

  .hot-question-card {
    width: 100%;
    max-width: 500px;
    background: white;
    border-radius: $radius-lg;
    box-shadow: $float-shadow;
    padding: 1.5rem;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, $primary, $secondary);
      border-radius: $radius-lg $radius-lg 0 0;
    }
  }
}

.message-list {
  max-width: 700px;
  margin: 0 auto;
}

.message-item {
  display: flex;
  margin-bottom: 20px;

  &.user-message {
    justify-content: flex-end;
  }

  &.robot-message {
    justify-content: flex-start;
  }
}

.message-bubble {
  max-width: 75%;

  .bubble-content {
    padding: 12px 16px;
    border-radius: $radius-md;
    line-height: 1.7;
    font-size: 14px;
    word-wrap: break-word;
    box-shadow: $shadow-sm;

    .user-message & {
      background: linear-gradient(135deg, $primary, $secondary);
      color: white;
    }

    .robot-message & {
      background: #fff;
      color: $text-primary;
      border: 1px solid $border;
    }
  }

  .message-time {
    font-size: 12px;
    color: $text-tertiary;
    margin-top: 4px;
    text-align: right;
  }
}

.input-wrapper {
  padding: 12px 20px;
  background: $bg-main;

  @include mobile {
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
