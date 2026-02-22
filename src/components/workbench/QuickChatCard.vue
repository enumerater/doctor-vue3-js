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
  <div class="quick-chat-card">
    <div class="card-icon-area">
      <div class="icon-circle">
        <el-icon :size="24"><ChatLineSquare /></el-icon>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">chat小农</h3>
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
          class="send-btn"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-chat-card {
  background: #fff;
  border: 1px solid $border;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: 24px;
  display: flex;
  gap: 18px;
  transition: box-shadow 0.3s, transform 0.2s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, $primary, $secondary);
    border-radius: $radius-lg $radius-lg 0 0;
  }

  &:hover {
    box-shadow: 0 4px 20px rgba(74, 155, 94, 0.12);
  }

  @include mobile {
    padding: 18px 16px;
    gap: 14px;
  }
}

.card-icon-area {
  flex-shrink: 0;

  .icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.08));
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;

    @include mobile {
      width: 42px;
      height: 42px;
      border-radius: 12px;
    }
  }
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 4px;
}

.card-desc {
  font-size: 13px;
  color: $text-tertiary;
  margin: 0 0 14px;
}

.input-row {
  display: flex;
  gap: 8px;

  .el-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: 10px;
    }
  }

  .send-btn {
    background: $primary;
    border-color: $primary;
    border-radius: 10px;
    width: 40px;
    padding: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      color: #fff;
    }

    &:hover,
    &:focus {
      background-color: $primary-hover;
      border-color: $primary-hover;
    }
  }
}
</style>
