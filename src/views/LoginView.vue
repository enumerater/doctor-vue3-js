<template>
    <div class="user-login">
        <div class="login-type">
            <van-nav-bar title="用户登录" :left-arrow="false" />
            <div class="type" @click="onSubTitleClick">
                <div class="main">{{ tabMeta.title }}</div>
                <div class="sub">
                    {{ tabMeta.subTitle }}
                    <van-icon name="arrow" />
                </div>
            </div>
        </div>

        <div v-if="tabIndex === 0" class="password-login">
            <PasswordComponent></PasswordComponent>
        </div>
        <div v-else class="mobile-login">
            <MobileComponent></MobileComponent>
        </div>
    </div>

</template>

<script setup>
import { computed, ref } from 'vue'
import MobileComponent from '@/components/MobileComponent.vue'
import PasswordComponent from '@/components/PasswordComponent.vue'

// 标签页要展示的内容
const tabMetas = [
    { title: '密码登录', subTitle: '验证码登录' },
    { title: '验证码登录', subTitle: '密码登录' },
]

// 记录索引值
const tabIndex = ref(1)
// 计算属性获取文字内容
const tabMeta = computed(() => {
    return tabMetas[tabIndex.value]
})

// 事件回调
function onSubTitleClick() {
    // 切换 0 和 1
    tabIndex.value = Math.abs(tabIndex.value - 1)
}

</script>

<style lang="scss" scoped>
.main {
    font-size: 23px;
}

.sub {
    font-size: 16px;
    color: #999;
}

.type {
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: space-around;
}
</style>
