<template>
  <div class="chat-home">
    <!-- Content area -->
    <div class="chat-content" ref="chatContentRef">
      <!-- Empty state -->
      <div v-if="chatStore.chatMessages.length === 0" class="empty-state">
        <template v-if="sidebarStore.isAgricultureAgent">
          <LogoSection class="logo-section" title="Agent小农" subtitle="会思考、会调工具的农业智能体" altText="Agent小农" />
          <AgentHotQuestionCard class="hot-question-card" />
        </template>
        <template v-else>
          <LogoSection class="logo-section" title="chat小农" subtitle="您的智能农业助手" altText="chat小农" />
          <HotQuestionCard class="hot-question-card" />
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
            <div class="bubble-content markdown-body" v-html="parseMarkdown(msg.messageContent)"></div>
            <div class="message-time" v-if="msg.messageTime">{{ formatTime(msg.messageTime) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-wrapper">
      <div class="input-inner">
      <ChatInputCard
        ref="chatInputCardRef"
        @send="sendMessage"
      />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'
import ChatInputCard from '@/components/ChatInputCard.vue'
import LogoSection from '@/components/LogoSection.vue'
import AgentHotQuestionCard from '@/components/AgentHotQuestionCard.vue'
import HotQuestionCard from '@/components/HotQuestionCard.vue'

marked.setOptions({ breaks: true, gfm: true })

const router = useRouter()
const route = useRoute()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()

const chatContentRef = ref(null)
const chatInputCardRef = ref(null)

onMounted(async () => {
  if (!chatStore.autoSendPending) {
    await sidebarStore.prepareConversation()
  }
  
  // 处理来自知识图谱或其他页面的提问
  const prompt = route.query.prompt
  if (prompt) {
    setTimeout(async () => {
      await sendMessage(prompt)
      // 清除 query 以防刷新重复发送
      router.replace({ query: {} })
    }, 500)
  }
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

const parseMarkdown = (content) => {
  if (!content) return ''
  try {
    const strContent = String(content)
    // 确保同步解析并返回字符串
    const html = marked.parse(strContent)
    return typeof html === 'string' ? html : String(html)
  } catch (err) {
    console.error('Markdown parsing failed:', err)
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
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;

  @include mobile {
    padding: 12px 16px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  gap: 12px;

  @include mobile {
    justify-content: flex-start;
    padding-top: 1rem;
    gap: 8px;
  }

  .logo-section {
    margin-bottom: 2rem;
    text-align: center;

    @include mobile {
      margin-bottom: 0.5rem;
    }
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

    @include mobile {
      max-width: none;
      padding: 0.85rem;
      border-radius: $radius-md;
      box-shadow: $shadow-sm;
    }

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
  max-width: 800px;
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

  @include mobile {
    max-width: 95%;
  }

  .bubble-content {
    padding: 12px 16px;
    border-radius: $radius-md;
    line-height: 1.7;
    font-size: 14px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    box-shadow: $shadow-sm;

    @include mobile {
      padding: 10px 14px;
    }

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
  flex-shrink: 0;

  @include mobile {
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  }
}

.input-inner {
  max-width: 800px;
  margin: 0 auto;
}
</style>
