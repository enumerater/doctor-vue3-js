<template>
    <van-form @submit="onSubmit">
        <van-cell-group inset>
            <van-field v-model="username" name="用户名" label="用户名" placeholder="请输入手机号"
                :rules="[{ required: true, message: '请输入手机号' }]" />

            <div class="key-field">
                <van-field v-model="key" type="key" name="验证码" label="验证码" placeholder="请输入验证码"
                    :rules="[{ required: true, message: '请输入验证码' }]" />
                <span class="get-key">获取验证码</span>
            </div>
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
import { ref } from 'vue'

const username = ref('')
const key = ref('')
const checked = ref(false)



function onSubmit() {

    // 提交表单数据
    console.log('plone:', username.value)
    console.log('key:', key.value)
}
</script>

<style lang="scss" scoped>
.van-form {
    margin-top: 40px;
}

.key-field {
    position: relative;
}

.get-key {
    color: #20c6b2;
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
}


:deep .van-field__control {
    width: 120px;
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
