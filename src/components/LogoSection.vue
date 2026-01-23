<template>
    <div class="logo-section">
        <img src="../assets/home/S-农业.png" alt="Chat小农" class="avatar" />
        <h1 class="title">Chat小农</h1>
    </div>
</template>

<script setup>
// 该组件仅负责Logo和标题展示，无业务逻辑，便于后续替换样式/内容
</script>

<style lang="scss" scoped>
.logo-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 16px 8px;
    background-color: #f5f7fa;

    .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 12px;
    }

    .title {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
    }
}
</style>
