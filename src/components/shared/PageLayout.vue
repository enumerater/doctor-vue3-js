<template>
  <div class="page-container">
    <nav class="nav-header">
      <div class="nav-container">
        <button v-if="showBack" class="back-btn" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <span class="back-text">{{ backText }}</span>
        </button>
        <h1 v-if="title" class="page-title">{{ title }}</h1>
        <div class="nav-actions">
          <slot name="actions" />
        </div>
      </div>
    </nav>
    <main class="page-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  backText: { type: String, default: '返回' },
  showBack: { type: Boolean, default: true },
})

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home/begin')
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";


.page-container {
  min-height: 100vh;
  background: $bg-main;
  font-family: $font-family;
}

.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $border;
}

.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: $primary-light;
  border-radius: $radius-sm;
  cursor: pointer;
  color: $primary;
  font-size: 14px;
  transition: $transition-fast;
  flex-shrink: 0;

  &:hover {
    background: color.adjust(#edf7f0, $lightness: -5%);
  }

  .back-icon {
    width: 18px;
    height: 18px;
  }
}

.page-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}
</style>
