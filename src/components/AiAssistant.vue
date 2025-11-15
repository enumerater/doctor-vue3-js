<template>
    <!-- 可拖动的AI助手图标 -->
    <div class="ai-assistant-icon" :style="{ left: iconLeft + 'px', top: iconTop + 'px' }"
        @mousedown="startDrag('icon')" @touchstart="startDrag('icon', $event)" @click.stop="toggleDialog">
        <van-icon name="arrow-left" size="24" />
    </div>

    <!-- 可拖动的对话框 -->
    <div v-if="showDialog" class="ai-dialog" :style="{ left: dialogLeft + 'px', top: dialogTop + 'px' }"
        @mousedown="startDrag('dialog')" @touchstart="startDrag('dialog', $event)">
        <div class="dialog-header" @mousedown.stop="startDrag('dialog')">
            <h3>AI助手</h3>
            <van-icon name="cross" @click.stop="toggleDialog" />
        </div>
        <div class="dialog-content">
            <p>您好！有什么农业问题可以帮您解决吗？</p>
            <!-- 可以添加更多对话内容 -->
        </div>
        <div class="dialog-input">
            <van-field v-model="message" placeholder="输入您的问题..." clearable />
            <van-button @click="sendMessage">发送</van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 图标位置
const iconLeft = ref(300)
const iconTop = ref(500)

// 对话框位置和状态
const showDialog = ref(false)
const dialogLeft = ref(100)
const dialogTop = ref(200)
const message = ref('')

// 拖动相关变量
const dragging = ref({
    type: null,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
})

// 初始化位置
onMounted(() => {
    // 确保元素在可视范围内
    const resetPosition = () => {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        // 图标位置限制
        if (iconLeft.value > windowWidth - 60) iconLeft.value = windowWidth - 60
        if (iconTop.value > windowHeight - 60) iconTop.value = windowHeight - 60

        // 对话框位置限制
        if (dialogLeft.value > windowWidth - 300) dialogLeft.value = windowWidth - 300
        if (dialogTop.value > windowHeight - 400) dialogTop.value = windowHeight - 400
    }

    resetPosition()
    window.addEventListener('resize', resetPosition)

    // 清理函数
    onUnmounted(() => {
        window.removeEventListener('resize', resetPosition)
    })
})

// 开始拖动
const startDrag = (type, event) => {
    // 区分鼠标和触摸事件
    const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
    const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY

    dragging.value = {
        type,
        startX: clientX,
        startY: clientY,
        x: type === 'icon' ? iconLeft.value : dialogLeft.value,
        y: type === 'icon' ? iconTop.value : dialogTop.value
    }

    // 添加移动和结束事件监听
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchmove', handleDrag)
    document.addEventListener('touchend', stopDrag)
}

// 处理拖动
const handleDrag = (event) => {
    if (!dragging.value.type) return

    // 防止触摸事件滚动
    event.preventDefault()

    const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX
    const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY

    const dx = clientX - dragging.value.startX
    const dy = clientY - dragging.value.startY

    // 计算新位置并限制在窗口内
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (dragging.value.type === 'icon') {
        let newLeft = dragging.value.x + dx
        let newTop = dragging.value.y + dy

        // 限制在窗口内
        newLeft = Math.max(10, Math.min(newLeft, windowWidth - 60))
        newTop = Math.max(10, Math.min(newTop, windowHeight - 60))

        iconLeft.value = newLeft
        iconTop.value = newTop
    } else {
        let newLeft = dragging.value.x + dx
        let newTop = dragging.value.y + dy

        // 限制在窗口内
        newLeft = Math.max(10, Math.min(newLeft, windowWidth - 300))
        newTop = Math.max(10, Math.min(newTop, windowHeight - 400))

        dialogLeft.value = newLeft
        dialogTop.value = newTop
    }
}

// 停止拖动
const stopDrag = () => {
    dragging.value = { type: null, x: 0, y: 0, startX: 0, startY: 0 }

    // 移除事件监听
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('touchend', stopDrag)
}

// 切换对话框显示状态
const toggleDialog = () => {
    showDialog.value = !showDialog.value
}

// 发送消息
const sendMessage = () => {
    if (message.value.trim()) {
        // 这里可以添加发送消息的逻辑
        console.log('发送消息:', message.value)
        // 模拟回复
        // ...
        message.value = ''
    }
}
</script>

<style scoped>
.ai-assistant-icon {
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #1677ff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: move;
    z-index: 1000;
    transition: transform 0.2s;
}

.ai-assistant-icon:active {
    transform: scale(0.95);
}

.ai-dialog {
    position: fixed;
    width: 280px;
    height: 360px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.dialog-header {
    padding: 12px 16px;
    background-color: #1677ff;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
}

.dialog-header h3 {
    margin: 0;
    font-size: 16px;
}

.dialog-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #f9f9f9;
}

.dialog-input {
    padding: 12px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 8px;
}

.dialog-input .van-button {
    white-space: nowrap;
}
</style>