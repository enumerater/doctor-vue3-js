<template>
  <div class="agent-begin-container">
    <!-- 配置按钮 -->
    <div class="config-btn-wrapper">
      <el-button type="primary" plain round @click="openConfigPanel">
        <el-icon><Setting /></el-icon>
        Agent设置
      </el-button>
    </div>

    <LogoSection class="logo-section" title="Agent小农" subtitle="专业农业智能助手" altText="Agent小农" />
    <AgentHotQuestionCard class="hot-question-card" />

    <!-- 配置面板抽屉 -->
    <el-drawer
      v-model="showConfigPanel"
      direction="rtl"
      size="400px"
      :show-close="true"
      title="Agent 配置"
    >
      <AgentConfigPanel />
    </el-drawer>

    <!-- 输入区域 -->
    <div class="agent-input-area">
      <div class="input-row">
        <el-input
          v-model="chatStore.inputValue"
          placeholder="描述您遇到的作物问题..."
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
        <input type="file" ref="imageInput" style="display:none" accept="image/jpeg,image/png" @change="handleImageUpload" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoSection from '@/components/LogoSection.vue'
import AgentHotQuestionCard from '@/components/AgentHotQuestionCard.vue'
import AgentConfigPanel from '@/components/AgentConfigPanel.vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useChatStore } from '@/stores/chat'
import { useSidebarStore } from '@/stores/sidebar'
import { upload } from '@/axios/oss'
import { Setting, Upload, Promotion } from '@element-plus/icons-vue'

const agentConfigStore = useAgentConfigStore()
const chatStore = useChatStore()
const sidebarStore = useSidebarStore()
const router = useRouter()

// Ensure agent mode is on
sidebarStore.isAgricultureAgent = true

const imageInput = ref(null)
const uploadedImages = ref([])

const showConfigPanel = computed({
  get: () => agentConfigStore.showConfigPanel,
  set: (value) => value ? agentConfigStore.openConfigPanel() : agentConfigStore.closeConfigPanel(),
})

const openConfigPanel = () => agentConfigStore.openConfigPanel()

const triggerImageUpload = () => imageInput.value?.click()

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (!['image/jpeg', 'image/png'].includes(file.type)) { ElMessage.warning('仅支持 JPG/PNG'); return }
    if (file.size > 10 * 1024 * 1024) { ElMessage.warning('图片不能超过10MB'); return }
    const res = await upload(file)
    uploadedImages.value.push(res.data.url)
    if (imageInput.value) imageInput.value.value = ''
  } catch { ElMessage.error('图片上传失败') }
}

const sendMessage = async () => {
  const content = (chatStore.inputValue || '').trim()
  if (!content && uploadedImages.value.length === 0) return

  const userId = localStorage.getItem('id')
  let stored = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')
  let partial = stored.startsWith(userId) ? stored.substring(userId.length) : stored
  const full = `${userId}${partial}`
  chatStore.setCurrentSessionId(full)

  await chatStore.prepareMessage(content, userId, partial)
  router.push({ name: 'agentDetail', params: { sessionId: full } })

  chatStore.startStreaming(content, uploadedImages.value, userId, partial, localStorage.getItem('token')).catch(console.error)
  uploadedImages.value = []
}
</script>

<style lang="scss" scoped>
.agent-begin-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
  background: linear-gradient(180deg, $bg-main 0%, #f5faf7 100%);
  overflow: hidden;
  position: relative;
}

.config-btn-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
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
  margin-bottom: 2rem;

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

.agent-input-area {
  width: 100%;
  max-width: 500px;
  padding: 0 1rem;

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-input {
      flex: 1;
    }
  }
}
</style>
