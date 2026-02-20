<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'workbench', path: '/workbench', icon: '🏠', label: '首页' },
  { name: 'chat', path: '/chat', icon: '💬', label: '对话' },
  { name: 'vision', path: '/vision', icon: '📷', label: '诊断' },
  { name: 'knowledge', path: '/knowledge', icon: '📚', label: '知识' },
  { name: 'farm', path: '/farm', icon: '🌾', label: '农场' },
]

const activeTab = computed(() => {
  const path = route.path
  const match = tabs.find(
    (t) => path === t.path || (t.path !== '/' && path.startsWith(t.path))
  )
  return match?.name || 'workbench'
})

const handleChange = (name) => {
  const tab = tabs.find((t) => t.name === name)
  if (tab) {
    router.push(tab.path)
  }
}
</script>

<template>
  <div class="mobile-tabbar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="tab-item"
      :class="{ active: activeTab === tab.name }"
      @click="handleChange(tab.name)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $mobile-tabbar-height;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  min-width: 52px;

  .tab-icon {
    font-size: 20px;
    line-height: 1;
    transition: transform 0.2s;
  }

  .tab-label {
    font-size: 10px;
    color: $text-tertiary;
    transition: color 0.2s;
  }

  &.active {
    .tab-icon {
      transform: scale(1.1);
    }

    .tab-label {
      color: $primary;
      font-weight: 600;
    }
  }

  &:active {
    transform: scale(0.92);
  }
}
</style>
