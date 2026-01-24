<script setup>
// 该组件仅负责Logo和标题展示，无业务逻辑，便于后续替换样式/内容
</script>

<!-- LogoSection.vue 示例 -->
<template>
    <div class="logo-wrapper">
        <img src="../assets/home/S-农业.png" alt="Chat小农" class="logo-img" />
        <h2 class="logo-title">Chat小农</h2>
        <p class="logo-subtitle">专业解答农业种植问题</p>
    </div>
</template>

<style scoped>
.logo-wrapper {
    text-align: center;
}

.logo-img {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.logo-title {
    font-size: 24px;
    color: #2d3748;
    margin: 15px 0 8px 0;
}

.logo-subtitle {
    font-size: 14px;
    color: #718096;
}
</style>
