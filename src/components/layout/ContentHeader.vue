<script setup>
import { ElIcon } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
})

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="content-header">
    <div class="header-left">
      <el-button
        v-if="showBack"
        text
        @click="goBack"
        class="back-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 v-if="title" class="header-title">{{ title }}</h2>
      <slot name="title" />
    </div>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: transparent;

  @include mobile {
    padding: 12px 16px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  color: $text-secondary;
  font-size: 14px;
  padding: 6px 8px;

  &:hover {
    color: $primary;
  }
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;

  @include mobile {
    font-size: 18px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
