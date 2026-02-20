<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const displayName = computed(() => {
  return userStore.user.username || '用户'
})
</script>

<template>
  <div class="welcome-banner">
    <div class="welcome-content">
      <h1 class="welcome-greeting">
        {{ greeting }}，{{ displayName }}
      </h1>
      <p class="welcome-subtitle">智慧农业诊断平台 - 您的智能种植助手</p>
    </div>
    <!-- Decorative leaves -->
    <div class="leaf-decoration leaf-1"></div>
    <div class="leaf-decoration leaf-2"></div>
    <div class="leaf-decoration leaf-3"></div>
  </div>
</template>

<style lang="scss" scoped>
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, $primary 0%, #6db87e 50%, #8fcea0 100%);
  border-radius: $radius-lg;
  padding: 36px 32px;
  overflow: hidden;
  color: #fff;

  @include mobile {
    padding: 28px 20px;
    border-radius: $radius-md;
  }
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.welcome-greeting {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;

  @include mobile {
    font-size: 22px;
  }
}

.welcome-subtitle {
  font-size: 15px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;

  @include mobile {
    font-size: 13px;
  }
}

/* Decorative leaf shapes */
.leaf-decoration {
  position: absolute;
  border-radius: 50% 0 50% 0;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
  z-index: 1;
}

.leaf-1 {
  width: 120px;
  height: 120px;
  top: -30px;
  right: 40px;
  transform: rotate(25deg);

  @include mobile {
    width: 80px;
    height: 80px;
    right: 20px;
  }
}

.leaf-2 {
  width: 80px;
  height: 80px;
  bottom: -20px;
  right: 140px;
  transform: rotate(-15deg);
  background: rgba(255, 255, 255, 0.06);

  @include mobile {
    width: 60px;
    height: 60px;
    right: 80px;
  }
}

.leaf-3 {
  width: 60px;
  height: 60px;
  top: 10px;
  right: 180px;
  transform: rotate(45deg);
  background: rgba(255, 255, 255, 0.05);

  @include mobile {
    display: none;
  }
}
</style>
