<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import TopHeader from '@/components/layout/TopHeader.vue'
import SideNav from '@/components/layout/SideNav.vue'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const contentClass = computed(() => ({
  'main-content': true,
  'sidebar-collapsed': sidebarCollapsed.value,
  'is-mobile': isMobile.value,
}))
</script>

<template>
  <div class="app-shell">
    <TopHeader
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="app-body">
      <SideNav
        v-if="!isMobile"
        :collapsed="sidebarCollapsed"
      />

      <main :class="contentClass">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <MobileTabBar v-if="isMobile" />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: $bg-main;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: $header-height;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-left: $sidebar-width;
  transition: margin-left 0.3s ease;
  background: $bg-main;

  &.sidebar-collapsed {
    margin-left: $sidebar-collapsed-width;
  }

  &.is-mobile {
    margin-left: 0;
    padding-bottom: $mobile-tabbar-height;
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
