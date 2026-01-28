<template>
  <div class="user-login">
    <div class="login-header">
      <van-nav-bar title="用户登录" :left-arrow="false" class="login-nav" />
      <div class="type-tabs" @click="onSubTitleClick">
        <div class="tab-item" :class="{ active: tabIndex === 0 }">
          <span class="tab-text">{{ tabMetas[0].title }}</span>
        </div>
        <div class="tab-item" :class="{ active: tabIndex === 1 }">
          <span class="tab-text">{{ tabMetas[1].title }}</span>
          <van-icon name="arrow" class="tab-arrow" />
        </div>
      </div>
    </div>

    <div class="login-body">
      <div v-if="tabIndex === 0" class="password-login">
        <PasswordComponent />
      </div>
      <div v-else class="mobile-login">
        <MobileComponent />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MobileComponent from '@/components/MobileComponent.vue'
import PasswordComponent from '@/components/PasswordComponent.vue'

const tabMetas = [
  { title: '密码登录', subTitle: '验证码登录' },
  { title: '验证码登录', subTitle: '密码登录' },
]

const tabIndex = ref(0)
const tabMeta = computed(() => tabMetas[tabIndex.value])

function onSubTitleClick() {
  tabIndex.value = Math.abs(tabIndex.value - 1)
}
</script>

<style lang="scss" scoped>
.user-login {
  min-height: 100vh;
  background: linear-gradient(180deg, $primary-light 0%, $bg-main 35%);
  font-family: $font-family;
}

.login-header {
  background-color: $bg-card;
  box-shadow: $shadow-sm;
  padding-bottom: 0.5rem;
}

.login-nav {
  :deep(.van-nav-bar__title) {
    font-size: 1.125rem;
    font-weight: 600;
    color: $text-primary;
  }
}

.type-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1.5rem 1rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: $radius-lg;
  font-size: 0.9375rem;
  color: $text-secondary;
  transition: $transition;
  cursor: pointer;

  .tab-text {
    font-weight: 500;
  }

  .tab-arrow {
    font-size: 14px;
    opacity: 0.8;
  }

  &.active {
    background-color: $primary-light;
    color: $primary;
    font-weight: 600;
  }

  &:hover:not(.active) {
    background-color: rgba(56, 142, 60, 0.06);
    color: $primary-hover;
  }
}

.login-body {
  padding: 1.5rem 1rem 2rem;
  max-width: 28rem;
  margin: 0 auto;
}
</style>
