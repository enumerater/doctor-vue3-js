<template>
  <div class="mobile-login-form">
    <van-form @submit="onSubmit">
      <van-cell-group inset class="form-group">
        <van-field
          v-model="username"
          name="username"
          label="手机号"
          placeholder="请输入手机号"
          :rules="[{ required: true, message: '请输入手机号' }]"
          class="form-field"
        />
        <div class="key-field-row">
          <van-field
            v-model="key"
            type="digit"
            name="code"
            label="验证码"
            placeholder="请输入验证码"
            :rules="[{ required: true, message: '请输入验证码' }]"
            class="form-field code-field"
          />
          <span class="get-key" @click="getCode">获取验证码</span>
        </div>
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

const username = ref('')
const key = ref('')
const checked = ref(false)

function getCode() {
  // 预留：调用获取验证码接口
}

function onSubmit() {
  console.log('phone:', username.value, 'code:', key.value)
}
</script>

<style lang="scss" scoped>
.mobile-login-form {
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

.key-field-row {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.van-cell) {
    flex: 1;
  }

  :deep(.van-field__control) {
    width: 100%;
  }
}

.get-key {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: $primary;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: $primary-hover;
  }
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
