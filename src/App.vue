<script setup></script>

<template>
  <div class="app-root">
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@use '@/styles/variables.scss' as *;

// 全局关键帧动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.app-root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $text-primary;
  background: linear-gradient(180deg, $bg-main 0%, #f5faf7 100%);
}

// 全局按钮样式增强
:deep(.van-button) {
  transition: $transition-fast !important;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }
}
</style>
