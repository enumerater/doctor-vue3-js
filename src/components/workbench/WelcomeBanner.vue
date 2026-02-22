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
      <div class="welcome-top">
        <span class="welcome-badge">Hi</span>
        <h1 class="welcome-greeting">
          {{ greeting }}，{{ displayName }}
        </h1>
      </div>
      <p class="welcome-subtitle">小农 - 您的智能种植助手</p>
    </div>
    <!-- Decorative leaves -->
    <div class="leaf-decoration leaf-1"></div>
    <div class="leaf-decoration leaf-2"></div>
    <div class="leaf-decoration leaf-3"></div>
    <!-- Wave decoration -->
    <div class="wave-decoration"></div>
  </div>
</template>

<style lang="scss" scoped>
.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #2d7a3a 0%, #4a9b5e 40%, #6db87e 70%, #8fcea0 100%);
  border-radius: $radius-lg;
  padding: 36px 32px 32px;
  overflow: hidden;
  color: #fff;

  @include mobile {
    padding: 28px 20px 24px;
    border-radius: $radius-md;
  }
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.welcome-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  flex-shrink: 0;

  @include mobile {
    width: 30px;
    height: 30px;
    font-size: 12px;
    border-radius: 8px;
  }
}

.welcome-greeting {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;

  @include mobile {
    font-size: 20px;
  }
}

.welcome-subtitle {
  font-size: 14px;
  margin: 6px 0 0;
  opacity: 0.85;
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

.wave-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.04) 100%);
  z-index: 1;
}
</style>
