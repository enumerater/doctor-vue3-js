<template>
  <div class="chat-home">
    <!-- PC: 左侧历史列表 -->
    <div class="chat-sidebar" v-if="!isMobile">
      <div class="sidebar-header">
        <el-button type="primary" @click="handleNewChat" class="new-chat-btn" round>
          新建对话
        </el-button>
        <el-button @click="handleAgentMode" :type="sidebarStore.isAgricultureAgent ? 'success' : ''" round plain>
          {{ sidebarStore.isAgricultureAgent ? 'Agent模式' : '普通模式' }}
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

    <!-- 移动端: 历史抽屉 -->
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

    <!-- 右侧内容区 -->
    <div class="chat-main">
      <!-- 移动端: 顶部操作栏 -->
      <div class="mobile-toolbar" v-if="isMobile">
        <el-button text @click="showHistory = true">
          <el-icon><List /></el-icon>
          历史记录
        </el-button>
        <el-button text @click="handleAgentMode">
          {{ sidebarStore.isAgricultureAgent ? '🌿 Agent模式' : '💬 普通模式' }}
        </el-button>
      </div>

      <!-- 对话内容区 -->
      <div class="chat-content" ref="chatContentRef">
        <!-- 空状态 -->
        <div v-if="chatStore.chatMessages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">开始一段新对话</div>
          <div class="empty-desc">向AI助手提问关于农业种植、病害诊断的问题</div>
        </div>

        <!-- 消息列表 - 复用 ChatDetail 内容 -->
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

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div v-if="sidebarStore.agentImageUploadEnabled && uploadedImages.length > 0" class="image-preview-section">
          <div class="preview-list">
            <div v-for="(imageUrl, index) in uploadedImages" :key="index" class="preview-item">
              <img :src="imageUrl" alt="上传的图片" class="preview-img" />
              <span class="remove-img" @click="removeImage(index)">×</span>
            </div>
          </div>
        </div>
        <div class="input-row">
          <el-input
            v-model="chatStore.inputValue"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            clearable
            size="large"
          />
          <el-button
            v-if="sidebarStore.agentImageUploadEnabled"
            @click="triggerImageUpload"
            circle
            size="large"
          >
            <el-icon><Upload /></el-icon>
          </el-button>
          <el-button
            type="primary"
            @click="sendMessage"
            :disabled="!chatStore.inputValue?.trim() && uploadedImages.length === 0"
            circle
            size="large"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
          <input
            type="file"
            ref="imageInput"
            style="display: none"
            accept="image/jpeg,image/png"
            @change="handleImageUpload"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useSkillsStore } from '@/stores/skills'
import { upload } from '@/axios/oss'
import { marked } from 'marked'
import HistoryList from '@/components/HistoryList.vue'
import { List, Upload, Promotion } from '@element-plus/icons-vue'

marked.setOptions({ breaks: true, gfm: true })

const router = useRouter()
const route = useRoute()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()

const isMobile = ref(window.innerWidth <= 768)
const showHistory = ref(false)
const imageInput = ref(null)
const uploadedImages = ref([])
const chatContentRef = ref(null)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 准备新会话
  if (!chatStore.autoSendPending) {
    await sidebarStore.prepareConversation()
  }
  await sidebarStore.fetchHistoryList()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// 自动发送（从其他页面转入时）
watch(
  () => chatStore.autoSendPending,
  async (pending) => {
    if (pending && sidebarStore.isAgricultureAgent) {
      await nextTick()
      if (chatStore.pendingTransferImageUrl) {
        uploadedImages.value = [chatStore.pendingTransferImageUrl]
      }
      setTimeout(async () => {
        await sendMessage()
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

const handleAgentMode = () => {
  sidebarStore.toggleAgricultureAgent()
  if (sidebarStore.isAgricultureAgent) {
    router.push({ name: 'agentHome' })
  }
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

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      ElMessage.warning('仅支持上传 JPG/PNG 格式的图片')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 10MB')
      return
    }
    const response = await upload(file)
    uploadedImages.value.push(response.data.url)
    if (imageInput.value) imageInput.value.value = ''
  } catch {
    ElMessage.error('图片上传失败，请重试')
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const sendMessage = async () => {
  const content = (chatStore.inputValue || '').trim()
  if (!content && uploadedImages.value.length === 0) return

  const userId = localStorage.getItem('id')
  let storedSessionId = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partialSessionId = storedSessionId.startsWith(userId)
    ? storedSessionId.substring(userId.length)
    : storedSessionId
  const fullSessionId = `${userId}${partialSessionId}`
  chatStore.setCurrentSessionId(fullSessionId)

  await chatStore.prepareMessage(content, userId, partialSessionId)

  if (sidebarStore.isAgricultureAgent) {
    router.push({ name: 'agentDetail', params: { sessionId: fullSessionId } })
  } else {
    router.push({ name: 'chatDetail', params: { sessionId: fullSessionId } })
  }

  const TOKEN = localStorage.getItem('token')
  chatStore.startStreaming(content, uploadedImages.value, userId, partialSessionId, TOKEN).catch((err) => {
    console.error('流式请求失败：', err)
  })

  uploadedImages.value = []
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

.chat-input-area {
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid $border;

  @include mobile {
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}

.image-preview-section {
  margin-bottom: 8px;

  .preview-list {
    display: flex;
    gap: 8px;
  }

  .preview-item {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-img {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: $danger;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    flex: 1;
  }
}
</style>
