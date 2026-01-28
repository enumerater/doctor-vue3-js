<script setup></script>

<template>
  <div class="app-root">
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@use '@/styles/variables.scss' as *;

.app-root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $text-primary;
}
</style>
