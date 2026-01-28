<template>
  <div class="password-login-form">
    <van-form @submit="onSubmit">
      <van-cell-group inset class="form-group">
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
          class="form-field"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
          class="form-field"
        />
        <van-checkbox v-model="checked" class="agree">
          我已同意
          <a href="#" class="link">用户协议</a>
          及
          <a href="#" class="link">隐私协议</a>
        </van-checkbox>
      </van-cell-group>

      <div class="submit-wrap">
        <van-button round block type="primary" native-type="submit" class="submit-btn">
          登录
        </van-button>
      </div>
    </van-form>

    <van-divider class="divider">其他方式登录</van-divider>
    <div class="other-login">
      <div class="other-item">
        <img src="@/assets/icon/微信.svg" alt="微信" class="other-icon" />
      </div>
      <div class="other-item">
        <img src="@/assets/icon/QQ.svg" alt="QQ" class="other-icon" />
      </div>
      <div class="other-item">
        <img src="@/assets/icon/微博.svg" alt="微博" class="other-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/axios/user'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()
const route = useRoute()

const username = ref('')
const password = ref('')
const checked = ref(false)

async function onSubmit() {
  if (!checked.value) return showToast('请勾选我已同意')
  const res = await login({
    username: username.value,
    password: password.value,
  })
  store.setUser({
    token: res.data.token,
    username: res.data.username,
    id: res.data.id,
    sessionId: res.data.sessionId,
  })
  router.push(route.query.returnUrl || '/home/begin')
  showToast('登录成功')
}
</script>

<style lang="scss" scoped>
.password-login-form {
  :deep(.van-cell-group) {
    margin: 0;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-sm;
  }

  :deep(.van-field__label) {
    color: $text-primary;
  }

  :deep(.van-field__control) {
    color: $text-primary;
  }

  :deep(.van-cell) {
    background-color: $bg-card;
  }
}

.form-group {
  border-radius: $radius-lg;
}

.submit-wrap {
  padding: 1.25rem 1rem 0;
}

.submit-btn {
  background: linear-gradient(135deg, $primary, $primary-hover) !important;
  border: none !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(56, 142, 60, 0.25);
  transition: $transition;

  &:active {
    transform: scale(0.98);
  }
}

.agree {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: $text-secondary;

  .link {
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.divider {
  color: $text-tertiary;
  font-size: 0.8125rem;
  border-color: $border;
}

.other-login {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.other-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-card;
  border-radius: 50%;
  box-shadow: $shadow-sm;
  transition: $transition;
  cursor: pointer;

  &:hover {
    background-color: $primary-light;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.other-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
</style>
