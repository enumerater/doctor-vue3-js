<template>
  <div class="chat-page" :class="{
    'sidebar-open': sidebarStore.showLeft && !isPC,
    'agriculture-agent-active': sidebarStore.isAgricultureAgent
  }">
    <!-- 移动端遮罩层 -->
    <div v-if="!isPC && sidebarStore.showLeft" class="sidebar-overlay" @click="sidebarStore.closeLeft()"></div>

    <!-- 侧边栏 -->
    <div class="sidebar-wrapper" :class="{ 'sidebar-visible': sidebarStore.showLeft || isPC }">
      <div class="sidebar-close-btn" v-if="!isPC" @click="sidebarStore.closeLeft()">
        <van-icon name="cross" />
      </div>
      <Sidebar />
    </div>

    <div class="nav-header">
      <van-button icon="bars" type="default" size="small" class="menu-btn" @click="handleToggleSidebar" />
      <div class="header-right">
        <!-- 图像识别任务状态图标 -->
        <div v-if="visionStore.currentTask" class="vision-task-badge" :class="{
          'task-detecting': visionStore.hasActiveTask,
          'task-completed': visionStore.hasCompletedTask,
          'task-failed': visionStore.currentTask.status === 'failed',
        }" @click="goToVision">
          <van-icon name="photo-o" class="badge-icon" />
          <span class="badge-text">{{ visionStore.taskStatusText }}</span>
          <span v-if="visionStore.hasActiveTask" class="badge-dot"></span>
        </div>
      </div>
    </div>

    <div class="main-content" :class="{ 'with-sidebar': isPC }">
      <router-view :key="$route.fullPath"></router-view>
    </div>

    <div class="input-area" :class="{ 'with-sidebar': isPC }">
      <!-- 图片预览区域 -->
      <div v-if="sidebarStore.isAgricultureAgent && uploadedImages.length > 0" class="image-preview-section">
        <div class="preview-header">
          <span class="preview-title">已上传图片 ({{ uploadedImages.length }})</span>
          <span class="toggle-preview" @click="showImagePreview = !showImagePreview">
            {{ showImagePreview ? '收起' : '展开' }} <van-icon :name="showImagePreview ? 'arrow-up' : 'arrow-down'" />
          </span>
        </div>
        <div v-if="showImagePreview" class="preview-list">
          <div v-for="(imageUrl, index) in uploadedImages" :key="index" class="preview-item">
            <img :src="imageUrl" :alt="`上传的图片 ${index + 1}`" class="preview-img" />
            <span class="remove-img" @click="removeImage(index)">×</span>
          </div>
        </div>
      </div>
      <div class="input-row">
        <van-field v-model="chatStore.inputValue" placeholder="请输入您的问题" class="input-field"
          @keyup.enter="sendMessage" />
        <!-- 农业Agent模式下显示图片上传按钮 -->
        <div v-if="sidebarStore.isAgricultureAgent" class="upload-btn-container" @click="triggerImageUpload">
          <van-icon name="photo-o" class="upload-icon" />
        </div>
        <div class="send-btn-container" @click="sendMessage">✓</div>
        <van-button class="fold-btn" icon="ellipsis" type="default" @click="isFunctionShow = !isFunctionShow" />
        <!-- 隐藏的文件输入框 -->
        <input type="file" ref="imageInput" class="hidden-file-input" accept="image/jpeg,image/png"
          @change="handleImageUpload" />
      </div>

      <div class="function-area" :class="{ show: isFunctionShow }">
        <!-- 仅绑定 active 类控制两种状态 -->
        <van-button icon="lightbulb-o" type="default" class="function-btn" :class="{ active: functionStatus.netSearch }"
          @click="netSearch">
          联网搜索
        </van-button>
        <van-button icon="switch-o" type="default" class="function-btn" :class="{ active: functionStatus.switchModel }"
          @click="switchModel">
          模型切换
        </van-button>
        <van-button icon="setting-o" type="default" class="function-btn"
          :class="{ active: functionStatus.moreSettings }" @click="moreSettings">
          更多设置
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref, onBeforeUnmount } from 'vue'
import Sidebar from '@/views/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useChatStore } from '@/stores/chat'
import { useVisionStore } from '@/stores/vision'
import { useRouter } from 'vue-router'
import { upload } from '@/axios/oss'

const isFunctionShow = ref(false)
// 核心：仅用布尔值控制 未选中(false)/选中(true) 两种状态
const functionStatus = ref({
  netSearch: false,
  switchModel: false,
  moreSettings: false,
})

// 检测是否为PC端
const isPC = ref(window.innerWidth >= 768)

const checkIsPC = () => {
  const wasPC = isPC.value
  isPC.value = window.innerWidth >= 768

  // PC端默认打开侧边栏
  if (isPC.value && !wasPC) {
    sidebarStore.showLeft = true
  }
  // 从PC端切换到移动端时，关闭侧边栏
  if (!isPC.value && wasPC) {
    sidebarStore.showLeft = false
  }
}

// 处理侧边栏切换（PC端不切换，移动端切换）
const handleToggleSidebar = () => {
  if (!isPC.value) {
    sidebarStore.toggleLeft()
  }
  // PC端点击菜单按钮不做任何操作（或者可以添加其他功能）
}

const netSearch = () => {
  functionStatus.value.netSearch = !functionStatus.value.netSearch
}

const switchModel = () => {
  functionStatus.value.switchModel = !functionStatus.value.switchModel
}

const moreSettings = () => {
  functionStatus.value.moreSettings = !functionStatus.value.moreSettings
}

const sidebarStore = useSidebarStore()
const chatStore = useChatStore()
const visionStore = useVisionStore()
const router = useRouter()

// 图片上传相关
const imageInput = ref(null)
const uploadedImages = ref([])
const showImagePreview = ref(true) // 控制图片预览的显示/隐藏

// 跳转到图像识别页面
const goToVision = () => {
  router.push({ name: 'vision' })
}

// 定时更新任务已用时间
let visionTimer = null
onMounted(async () => {
  // 只准备会话，不创建会话记录（避免空会话出现在历史记录）
  // 真正的会话会在用户发送第一条消息时创建
  // 但是，如果当前已经在chatDetail页面，就不需要准备新会话（避免清空刚加载的消息）
  if (router.currentRoute.value.name !== 'chatDetail') {
    await sidebarStore.prepareConversation()
  }
  checkIsPC()
  window.addEventListener('resize', checkIsPC)

  // 如果有关联任务，启动定时器更新已用时间
  if (visionStore.hasActiveTask) {
    visionTimer = setInterval(() => {
      visionStore.updateTaskElapsedTime()
    }, 1000)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsPC)
  if (visionTimer) {
    clearInterval(visionTimer)
  }
})

const { inputValue } = storeToRefs(chatStore)
const TOKEN = localStorage.getItem('token')

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

// 处理图片上传到OSS
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    // 验证文件类型和大小
    const allowedTypes = ['image/jpeg', 'image/png']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      alert('仅支持上传 JPG/PNG 格式的图片！')
      return
    }

    if (file.size > maxSize) {
      alert('图片大小不能超过 5MB！')
      return
    }

    // 上传到OSS
    const response = await upload(file)
    const imageUrl = response.data.url
    console.log('图片上传成功：', imageUrl)

    // 将图片URL存储起来，自动显示预览
    uploadedImages.value.push(imageUrl)
    showImagePreview.value = true // 上传新图片后自动展开预览

    // 清空文件输入
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  } catch (error) {
    console.error('图片上传失败：', error)
    alert('图片上传失败，请重试！')
  }
}

// 移除指定索引的图片
const removeImage = (index) => {
  if (index >= 0 && index < uploadedImages.value.length) {
    uploadedImages.value.splice(index, 1)
  }
}

const sendMessage = async () => {
  const content = inputValue.value.trim()
  // 如果没有文本内容且没有上传图片，则不发送
  if (!content && uploadedImages.value.length === 0) return

  const userId = localStorage.getItem('id')
  // 优先使用 store 中的 sessionId（点击历史记录后会设置）
  // 如果 store 中没有，则使用 localStorage 中的
  let storedSessionId = String(chatStore.currentSessionId || localStorage.getItem('sessionId') || '')

  // 从存储的 sessionId 中提取部分 sessionId（去掉 userId 前缀，避免重复）
  let partialSessionId = storedSessionId.startsWith(userId)
    ? storedSessionId.substring(userId.length)
    : storedSessionId

  // 构建完整 sessionId
  const fullSessionId = `${userId}${partialSessionId}`

  // 设置当前会话ID为完整的sessionId，确保与路由参数一致
  chatStore.setCurrentSessionId(fullSessionId)

  // 先准备消息（添加用户消息和空的机器人消息），立即返回
  await chatStore.prepareMessage(content, userId, partialSessionId)
  if (sidebarStore.isAgricultureAgent) {
    //agentDetil
    router.push({
      name: 'agentDetil',
      params: { sessionId: fullSessionId },
    })
  }
  else {

    // 立即跳转到对话页面，不等待流式响应
    router.push({
      name: 'chatDetail',
      params: { sessionId: fullSessionId },
    })
  }


  // 在后台启动流式请求，实时更新消息（不阻塞页面跳转）
  chatStore.startStreaming(content, uploadedImages.value, userId, partialSessionId, TOKEN).catch((err) => {
    console.error('流式请求失败：', err)
  })

  // 清空上传的图片列表，准备下一次对话
  uploadedImages.value = []
}
</script>

<style lang="scss" scoped>
// 使用全局 variables.scss

.chat-page {
  min-height: 100vh;
  width: 100vw;
  max-width: 100%;
  background-color: $bg-main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  font-family: $font-family;
  overflow-x: hidden;

  // PC端布局：侧边栏固定在左侧
  @media (min-width: 768px) {
    flex-direction: row;
  }
}

// 侧边栏遮罩层（仅移动端）
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// 侧边栏容器
.sidebar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px; // PC端固定宽度
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;

  // PC端：默认显示
  @media (min-width: 768px) {
    position: relative;
    transform: translateX(0);
    flex-shrink: 0;
    box-shadow: none;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }

  // 移动端：显示时滑入
  &.sidebar-visible {
    transform: translateX(0);
  }

  // 移动端：较小宽度
  @media (max-width: 767px) {
    width: 70%;
    max-width: 320px;
  }

  .sidebar-close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
    z-index: 1000;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    // PC端隐藏关闭按钮
    @media (min-width: 768px) {
      display: none;
    }
  }
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 50px;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: none;
  transition: left 0.3s ease;

  // PC端：侧边栏打开时，导航栏在侧边栏右侧
  @media (min-width: 768px) {
    left: 280px; // PC端侧边栏宽度
  }

  // 移动端：侧边栏打开时，导航栏向右移动
  @media (max-width: 767px) {
    .chat-page.sidebar-open & {
      left: 70%;
    }
  }

  .menu-btn {
    font-size: 18px;
    color: $primary;
    background-color: transparent;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: $transition;

    &:hover {
      background-color: $default-bg;
    }
  }

  .capsule-btn {
    width: 40px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  // 图像识别任务状态徽章
  .vision-task-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
    position: relative;
    background-color: rgba(56, 142, 60, 0.1);
    color: $primary;
    border: 1px solid rgba(56, 142, 60, 0.2);

    &:hover {
      background-color: rgba(56, 142, 60, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(56, 142, 60, 0.2);
    }

    .badge-icon {
      font-size: 16px;
    }

    .badge-text {
      font-weight: 500;
      white-space: nowrap;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: $primary;
      animation: pulse 1.5s ease-in-out infinite;
    }

    // 识别中状态
    &.task-detecting {
      background-color: rgba(56, 142, 60, 0.1);
      color: $primary;
      border-color: rgba(56, 142, 60, 0.3);
    }

    // 已完成状态
    &.task-completed {
      background-color: rgba(72, 187, 120, 0.1);
      color: #48bb78;
      border-color: rgba(72, 187, 120, 0.3);
    }

    // 失败状态
    &.task-failed {
      background-color: rgba(229, 62, 62, 0.1);
      color: #e53e3e;
      border-color: rgba(229, 62, 62, 0.3);
    }
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 50px;
  padding-bottom: 120px;
  background-color: $bg-main;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  transition: margin-left 0.3s ease;
  min-width: 0; // 允许flex子元素缩小

  // PC端：侧边栏打开时，主内容区域正常显示（flex布局自动处理）
  &.with-sidebar {
    @media (min-width: 768px) {
      margin-left: 0;
    }
  }
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #ffffff;
  border-top: 1px solid rgba(56, 142, 60, 0.08);
  flex-shrink: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100; // 在遮罩层之上，但在侧边栏之下
  padding-bottom: calc(0.5rem + constant(safe-area-inset-bottom));
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  transition: left 0.3s ease;

  // PC端：侧边栏打开时，输入区域正常显示（不需要调整）
  &.with-sidebar {
    @media (min-width: 768px) {
      left: 280px; // PC端侧边栏宽度
      right: 0;
    }
  }

  // 移动端：侧边栏打开时，输入区域向右移动
  @media (max-width: 767px) {
    .chat-page.sidebar-open & {
      left: 70%; // 移动端侧边栏宽度
      max-width: calc(100% - 70%);
    }
  }
}

.input-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
}

.input-field {
  flex: 1;
  border-radius: 20px;
  background-color: rgba(224, 230, 224, 0.95);
  border: 1px solid rgba(56, 142, 60, 0.1);
  padding: 0 0.75rem;
  height: 42px;
  transition: $transition;
  display: flex;
  align-items: center;

  ::v-deep(.van-field) {
    height: 100%;
    display: flex;
    align-items: center;
  }

  ::v-deep(.van-field__control) {
    color: #2d3748;
    padding: 0 !important;
    margin: 0 !important;
    height: 100%;
    line-height: 1 !important;
    font-size: 14px;
    background-color: transparent;
    display: flex;
    align-items: center;
  }

  ::v-deep(.van-field__placeholder) {
    color: #718096;
    opacity: 0.8;
    line-height: 1;
    font-size: 13px;
  }

  &:focus-within {
    border-color: rgba(56, 142, 60, 0.2);
  }
}

.action-btn,
.fold-btn {
  border-radius: 50%;
  border: none !important;
  flex-shrink: 0;
  transition: $transition;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $default-bg !important;
  color: $primary !important;
}

.action-btn {
  width: 40px;
  height: 40px;
  font-size: 18px;
}

.fold-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
}

.function-area {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
  display: none !important;

  &.show {
    display: flex !important;
  }

  // 功能按钮 仅两种状态：默认 + active选中
  .function-btn {
    width: auto;
    height: auto;
    border-radius: 12px !important;
    padding: 0.35rem 0.8rem;
    gap: 0.25rem;
    font-size: 13px;
    white-space: nowrap;
    border: none !important;
    transition: $transition;
    // 1. 默认状态样式
    background-color: $default-bg !important;
    color: $primary !important;

    ::v-deep(.van-icon) {
      font-size: 14px;
    }

    // 2. 选中状态样式（仅改背景和文字色）
    &.active {
      background-color: $primary !important;
      color: #ffffff !important;
    }
  }
}

@media (min-width: 376px) {
  .fold-btn {
    display: none !important;
  }

  .function-area {
    display: flex !important;
  }
}

.send-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: $default-bg;
  color: $primary;
  cursor: pointer;
  font-size: 20px;
}

// 图片上传按钮样式
.upload-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: $default-bg;
  color: $primary;
  cursor: pointer;
  font-size: 18px;
  transition: $transition;

  &:hover {
    background-color: rgba(52, 199, 89, 0.1);
    box-shadow: 0 0 10px rgba(52, 199, 89, 0.2);
  }

  // 农业Agent模式下的特殊样式
  .agriculture-agent-active & {
    background-color: rgba(52, 199, 89, 0.1);
    color: #34c759;

    &:hover {
      background-color: rgba(52, 199, 89, 0.2);
    }
  }
}

.upload-icon {
  font-size: 18px;
  color: inherit;
}

// 隐藏的文件输入框
.hidden-file-input {
  display: none;
}

// 图片预览区域样式
.image-preview-section {
  margin-bottom: 12px;
  background-color: rgba(236, 249, 238, 0.95);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(52, 199, 89, 0.2);
  transition: all 0.3s ease;

  // 农业Agent模式下的特殊样式
  .agriculture-agent-active & {
    background-color: rgba(236, 249, 238, 0.95);
    border-color: rgba(52, 199, 89, 0.3);
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(52, 199, 89, 0.1);
}

.preview-title {
  font-size: 13px;
  font-weight: 500;
  color: #34c759;
}

.toggle-preview {
  font-size: 12px;
  color: #66bb6a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #34c759;
  }
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(52, 199, 89, 0.3);
    border-radius: 2px;
  }
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-img {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background-color: rgba(229, 62, 62, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background-color: #e53e3e;
    transform: scale(1.1);
  }
}

@media (max-width: 375px) {
  .fold-btn {
    display: flex !important;
  }
}

/* 农业Agent模式样式 */
.agriculture-agent-active {
  // 为整个对话界面添加发光绿色边框效果
  box-shadow: inset 0 0 20px rgba(52, 199, 89, 0.3),
    inset 0 0 40px rgba(52, 199, 89, 0.2),
    0 0 30px rgba(52, 199, 89, 0.15);
  border: 2px solid rgba(52, 199, 89, 0.8);
  border-radius: 8px;

  // 导航栏样式调整
  .nav-header {
    background-color: rgba(236, 249, 238, 0.95);
    border-bottom: 1px solid rgba(52, 199, 89, 0.2);
  }

  // 主内容区域样式调整
  .main-content {
    background-color: rgba(248, 250, 249, 0.95);
  }

  // 输入区域样式调整
  .input-area {
    background-color: rgba(236, 249, 238, 0.95);
    border-top: 1px solid rgba(52, 199, 89, 0.2);
  }

  // 输入框样式调整
  .input-field {
    background-color: rgba(255, 255, 255, 0.9);
    border-color: rgba(52, 199, 89, 0.2);

    &:focus-within {
      border-color: rgba(52, 199, 89, 0.4);
      box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.1);
    }
  }

  // 发送按钮样式调整
  .send-btn-container {
    background-color: rgba(52, 199, 89, 0.1);
    color: #34c759;

    &:hover {
      background-color: rgba(52, 199, 89, 0.2);
      box-shadow: 0 0 10px rgba(52, 199, 89, 0.3);
    }
  }
}
</style>