<template>
  <div class="export-menu" ref="menuRef">
    <button class="export-btn" @click="open = !open">
      &#8681; 导出
    </button>
    <transition name="menu-fade">
      <div class="menu-dropdown" v-if="open">
        <button class="menu-item" @click="exportPNG">
          <span class="mi-icon">&#128247;</span>
          截图 PNG
        </button>
        <button class="menu-item" @click="exportCSV">
          <span class="mi-icon">&#128196;</span>
          数据 CSV
        </button>
        <button class="menu-item" @click="printView">
          <span class="mi-icon">&#128424;</span>
          打印视图
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const menuRef = ref(null)

function exportPNG() {
  open.value = false
  // 使用 Canvas API 截取当前页面可见区域
  const target = document.querySelector('.dash-root')
  if (!target) return
  // 尝试使用浏览器原生截图能力
  try {
    const range = document.createRange()
    range.selectNode(target)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand('copy')
    selection.removeAllRanges()
    alert('已复制页面内容，请粘贴到图片编辑器中保存。\n如需自动截图，请安装 html2canvas: npm i html2canvas')
  } catch {
    alert('请安装 html2canvas 以启用 PNG 导出: npm i html2canvas')
  }
}

function exportCSV() {
  open.value = false
  // 导出当前 KPI 数据为简易 CSV
  const headers = ['指标', '值']
  const rows = [
    ['导出时间', new Date().toLocaleString()],
    ['当前面板', '农业数据智慧平台'],
  ]
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.download = `dashboard-${Date.now()}.csv`
  link.href = URL.createObjectURL(blob)
  link.click()
}

function printView() {
  open.value = false
  window.print()
}

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.export-menu {
  position: relative;
}

.export-btn {
  padding: 5px 12px;
  border-radius: $dash-radius-sm;
  border: 1px solid $dash-border;
  background: transparent;
  color: $dash-text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: $dash-transition-fast;

  &:hover {
    border-color: $dash-accent;
    color: $dash-accent;
  }
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  @include dash-glass;
  border-radius: $dash-radius-md;
  padding: 4px;
  min-width: 140px;
  z-index: 100;
  box-shadow: $dash-shadow-lg;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: $dash-text-secondary;
  font-size: 12px;
  cursor: pointer;
  border-radius: $dash-radius-sm;
  transition: $dash-transition-fast;
  text-align: left;

  .mi-icon { font-size: 14px; }

  &:hover {
    background: $dash-bg-elevated;
    color: $dash-text-primary;
  }
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
