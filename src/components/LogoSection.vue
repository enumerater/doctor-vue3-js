<script setup>
// 接受标题和副标题属性，增强组件复用性
const props = defineProps({
  title: {
    type: String,
    default: 'Chat小农'
  },
  subtitle: {
    type: String,
    default: '专业解答农业种植问题'
  },
  altText: {
    type: String,
    default: 'Chat小农'
  }
})
</script>

<template>
  <div class="logo-wrapper">
    <img src="@/assets/home/S-农业.png" :alt="altText" class="logo-img" />
    <h2 class="logo-title">{{ title }}</h2>
    <p class="logo-subtitle">{{ subtitle }}</p>
  </div>
</template>

<style lang="scss" scoped>
.logo-wrapper {
  text-align: center;
  transition: $transition;
}

.logo-img {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(56, 142, 60, 0.12));
}

.logo-title {
  font-size: 1.5rem;
  color: $primary;
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-family: $font-family;
}

.logo-subtitle {
  font-size: 0.875rem;
  color: $text-secondary;
  margin: 0;
  line-height: 1.5;
}
</style>