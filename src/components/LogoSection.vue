<script setup>
// Accept title and subtitle props for reusability
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
    <div class="logo-container">
      <img src="@/assets/home/S-农业.png" :alt="altText" class="logo-img" />
      <div class="logo-glow"></div>
    </div>
    <h2 class="logo-title">
      <span v-for="(char, index) in title" :key="index"
            class="title-char"
            :style="{ animationDelay: `${index * 0.05}s` }">
        {{ char }}
      </span>
    </h2>
    <p class="logo-subtitle">{{ subtitle }}</p>
  </div>
</template>

<style lang="scss" scoped>
@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes charFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtitleSlide {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-wrapper {
  text-align: center;
  transition: $transition;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.logo-img {
  width: 5.5rem;
  height: 5.5rem;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(74, 155, 94, 0.25));
  animation: logoFloat 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
  transition: $transition-smooth;

  &:hover {
    transform: scale(1.1) rotate(5deg);
  }
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba($primary, 0.3), transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
  z-index: 0;
}

.logo-title {
  font-size: 1.75rem;
  color: $primary;
  margin: 1rem 0 0.75rem 0;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: $font-family;
  display: flex;
  justify-content: center;
  gap: 0.125rem;

  .title-char {
    display: inline-block;
    animation: charFadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    transition: $transition-fast;

    &:hover {
      color: $secondary;
      transform: translateY(-3px) scale(1.1);
    }
  }
}

.logo-subtitle {
  font-size: 0.9375rem;
  color: $text-secondary;
  margin: 0;
  line-height: 1.6;
  animation: subtitleSlide 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
  font-weight: 400;
}
</style>
