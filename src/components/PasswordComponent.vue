<template>
    <van-form @submit="onSubmit">
        <van-cell-group inset>
            <van-field v-model="username" name="用户名" label="用户名" placeholder="用户名"
                :rules="[{ required: true, message: '请填写用户名' }]" />
            <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
                :rules="[{ required: true, message: '请填写密码' }]" />

            <van-checkbox v-model="checked" class="agree">我已同意<a href="#" style="color: #20c6b2;">用户协议</a>及<a href="#"
                    style="color: #20c6b2;">隐私协议</a></van-checkbox>
        </van-cell-group>

        <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit" color="#20c6b2">
                登录
            </van-button>
        </div>
    </van-form>

    <van-divider>其他方式登录</van-divider>
    <div class="other">
        <div style="margin: 16px;">
            <img src="../assets/icon/微信.svg" alt="" style="width: 40px; height: 40px;">
        </div>
        <div style="margin: 16px;">
            <img src="../assets/icon/QQ.svg" alt="" style="width: 40px; height: 40px;">
        </div>

        <div style="margin: 16px;">
            <img src="../assets/icon/微博.svg" alt="" style="width: 40px; height: 40px;">
        </div>
    </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import { login } from '@/axios/user'
// 1. 导入路由钩子
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant';
import { useUserStore } from '@/stores/user'

const router = useRouter(); // 获取路由实例
const store = useUserStore()
const route = useRoute()

const username = ref('')
const password = ref('')
const checked = ref(false)


async function onSubmit() {
    // // 提交表单数据
    // console.log('用户名:', username.value)
    // console.log('密码:', password.value)

    if (!checked.value) return showToast('请勾选我已同意')
    // 验证完毕，进行登录
    const res = await login({
        username: username.value,
        password: password.value,
    })


    store.setUser(res.data)
    console.log(res.data)
    // 如果有回跳地址就进行回跳，没有跳转到个人中心
    router.push((route.query.returnUrl) || '/home')
    showToast('登录成功')

}

onMounted(() => {
    // 组件挂载完成后执行的操作
    // 例如：初始化数据、发送请求等
})
</script>

<style lang="scss" scoped>
.van-form {
    margin-top: 40px;
}

.agree {
    margin-top: 16px;
    font-size: 14px;
}

.other {
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
}
</style>
