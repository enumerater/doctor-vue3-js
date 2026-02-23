<template>
  <div class="login-page">
    <!-- Decorative background elements -->
    <div class="bg-decoration">
      <div class="leaf leaf-1">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 10C60 10 20 40 20 75C20 95 38 110 60 110C82 110 100 95 100 75C100 40 60 10 60 10Z"
            fill="rgba(255,255,255,0.12)" />
          <path d="M60 10C60 10 60 60 60 110" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <path d="M60 45C45 55 35 65 30 75" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
          <path d="M60 45C75 55 85 65 90 75" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
          <path d="M60 65C50 72 42 78 38 85" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
          <path d="M60 65C70 72 78 78 82 85" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="leaf leaf-2">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5C50 5 15 30 15 60C15 80 30 95 50 95C70 95 85 80 85 60C85 30 50 5 50 5Z"
            fill="rgba(255,255,255,0.08)" />
          <path d="M50 5C50 5 50 50 50 95" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
        </svg>
      </div>
      <div class="leaf leaf-3">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 5C40 5 10 25 10 50C10 65 23 75 40 75C57 75 70 65 70 50C70 25 40 5 40 5Z"
            fill="rgba(255,255,255,0.06)" />
        </svg>
      </div>
      <!-- Floating circles -->
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- Login card -->
    <div class="login-card-wrapper">
      <el-card class="login-card" shadow="always">
        <!-- Logo section -->
        <div class="card-header">
          <LogoSection title="Chat小农" subtitle="智慧农业助手 - 登录您的账户" />
        </div>

        <!-- Login tabs -->
        <el-tabs v-model="activeTab" class="login-tabs" stretch>
          <el-tab-pane label="密码登录" name="password">
            <PasswordComponent />
          </el-tab-pane>
          <el-tab-pane label="验证码登录" name="mobile">
            <MobileComponent />
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- Footer text -->
      <p class="login-footer">
        Chat小农 - 您的智慧农业管家
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MobileComponent from '@/components/MobileComponent.vue'
import PasswordComponent from '@/components/PasswordComponent.vue'
import LogoSection from '@/components/LogoSection.vue'

const activeTab = ref('password')
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d7a3a 0%, #4a9b5e 30%, #3d8550 60%, #2b6e38 100%);
  @include flex-center;
  position: relative;
  overflow: hidden;
  font-family: $font-family;
  padding: 2rem 1rem;
}

// ========== Background decorative elements ==========
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.leaf {
  position: absolute;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  svg {
    width: 100%;
    height: 100%;
  }
}

.leaf-1 {
  top: -20px;
  right: 5%;
  width: 180px;
  height: 180px;
  animation: leafFloat1 8s infinite;
  opacity: 0.7;

  @include mobile {
    width: 120px;
    height: 120px;
    right: -10px;
  }
}

.leaf-2 {
  bottom: 5%;
  left: 3%;
  width: 140px;
  height: 140px;
  animation: leafFloat2 10s infinite;
  opacity: 0.6;
  transform: rotate(-30deg);

  @include mobile {
    width: 100px;
    height: 100px;
    left: -15px;
  }
}

.leaf-3 {
  top: 40%;
  left: 8%;
  width: 100px;
  height: 100px;
  animation: leafFloat3 12s infinite;
  opacity: 0.4;
  transform: rotate(15deg);

  @include mobile {
    display: none;
  }
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -80px;
  animation: circlePulse 6s ease-in-out infinite;

  @include mobile {
    width: 200px;
    height: 200px;
  }
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -60px;
  right: -40px;
  animation: circlePulse 8s ease-in-out infinite reverse;

  @include mobile {
    width: 150px;
    height: 150px;
  }
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 30%;
  right: 15%;
  animation: circlePulse 10s ease-in-out infinite;

  @include mobile {
    display: none;
  }
}

// ========== Login card ==========
.login-card-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-card {
  border-radius: $radius-xl;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: visible;

  :deep(.el-card__body) {
    padding: 2.5rem 2rem 2rem;

    @include mobile {
      padding: 2rem 1.5rem 1.5rem;
    }
  }

  // Subtle top gradient bar
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, $secondary, $primary, $secondary);
    border-radius: $radius-xl $radius-xl 0 0;
    z-index: 1;
  }
}

.card-header {
  margin-bottom: 1.5rem;
}

// ========== Login tabs ==========
.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 1.5rem;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: $border;
    height: 1px;
  }

  :deep(.el-tabs__item) {
    font-size: 1rem;
    font-weight: 500;
    color: $text-secondary;
    transition: $transition-fast;

    &.is-active {
      color: $primary;
      font-weight: 600;
    }

    &:hover {
      color: $primary;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: $primary;
    height: 3px;
    border-radius: 2px;
  }
}

// ========== Footer ==========
.login-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8125rem;
  margin-top: 1.5rem;
  letter-spacing: 0.5px;
}

// ========== Animations ==========
@keyframes leafFloat1 {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes leafFloat2 {
  0%, 100% {
    transform: translateY(0) rotate(-30deg);
  }
  50% {
    transform: translateY(-20px) rotate(-20deg);
  }
}

@keyframes leafFloat3 {
  0%, 100% {
    transform: translateY(0) rotate(15deg);
  }
  50% {
    transform: translateY(-12px) rotate(25deg);
  }
}

@keyframes circlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.05;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
