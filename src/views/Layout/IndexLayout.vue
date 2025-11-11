<script setup>
</script>

<template>
    <div class="layout-page">
        <router-view></router-view>
        <van-tabbar route>
            <van-tabbar-item to="/home">
                首页
                <template #icon="{ active }">
                    <img v-if="active" src="@/assets/icon/home-fill.svg" alt="">
                    <img v-else src="@/assets/icon/home.svg" alt="">
                </template>
            </van-tabbar-item>
            <van-tabbar-item to="/article">
                健康百科
                <template #icon="{ active }">
                    <img v-if="active" src="@/assets/icon/address-book-fill.svg" alt="">
                    <img v-else src="@/assets/icon/address-book.svg" alt="">
                </template>
            </van-tabbar-item>
            <van-tabbar-item to="/notify">
                消息中心
                <template #icon="{ active }">
                    <img v-if="active" src="@/assets/icon/message-comments-fill.svg" alt="">
                    <img v-else src="@/assets/icon/message-comments.svg" alt="">
                </template>
            </van-tabbar-item>
            <van-tabbar-item to="/user">
                我的
                <template #icon="{ active }">
                    <img v-if="active" src="@/assets/icon/customer-fill.svg" alt="">
                    <img v-else src="@/assets/icon/customer.svg" alt="">
                </template>
            </van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<style lang="scss" scoped>
.layout-page {
    ::v-deep() {
        .van-tabbar-item {
            &__icon {
                font-size: 21px;
            }

            &__text {
                font-size: 11px;
            }
        }
    }
}
</style>
