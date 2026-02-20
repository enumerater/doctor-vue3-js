<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { ChatLineSquare } from '@element-plus/icons-vue'

const router = useRouter()
const sidebarStore = useSidebarStore()
const chatStore = useChatStore()

const inputValue = ref('')
const loading = ref(false)

async function handleSend() {
  const text = inputValue.value.trim()
  if (!text) return

  loading.value = true
  try {
    // Prepare a new conversation, then navigate to chat
    await sidebarStore.prepareConversation()
    chatStore.setInputValue(text)
    chatStore.autoSendPending = true
    router.push({ name: 'chatHome' })
  } catch (err) {
    console.error('快捷对话失败：', err)
    chatStore.clearAutoSend()
  } finally {
    loading.value = false
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <el-card class="quick-chat-card" shadow="never">
    <template #header>
      <div class="card-header">
        <el-icon class="header-icon" :size="20">
          <ChatLineSquare />
        </el-icon>
        <span class="header-title">AI 智能问答</span>
      </div>
    </template>

    <p class="card-desc">输入您的农业问题，AI 为您智能解答</p>

    <div class="input-row">
      <el-input
        v-model="inputValue"
        placeholder="例如：番茄叶片发黄是什么原因？"
        clearable
        @keydown="handleKeydown"
      />
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!inputValue.trim()"
        @click="handleSend"
      >
        发送
      </el-button>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.quick-chat-card {
  border: 1px solid $border;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  :deep(.el-card__header) {
    padding: 16px 20px 12px;
    border-bottom: 1px solid $border;
  }

  :deep(.el-card__body) {
    padding: 16px 20px 20px;
  }
}

.card-header {
  @include flex-between;

  .header-icon {
    color: $primary;
    margin-right: 8px;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    flex: 1;
  }
}

.card-desc {
  font-size: 13px;
  color: $text-tertiary;
  margin: 0 0 14px;
}

.input-row {
  display: flex;
  gap: 10px;

  .el-input {
    flex: 1;
  }

  .el-button {
    background-color: $primary;
    border-color: $primary;
    flex-shrink: 0;

    &:hover,
    &:focus {
      background-color: $primary-hover;
      border-color: $primary-hover;
    }
  }
}
</style>
