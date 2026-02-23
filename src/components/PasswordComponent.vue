<template>
  <div class="password-login-form">
    <el-form ref="formRef" :model="formData" :rules="rules" @submit.prevent="onSubmit" label-position="top">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" prefix-icon="User" size="large" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large"
          show-password clearable />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="checked" class="agree-checkbox">
          我已同意
          <a href="#" class="link" @click.prevent>用户协议</a>
          及
          <a href="#" class="link" @click.prevent>隐私协议</a>
        </el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="onSubmit">
          登录
        </el-button>
      </el-form-item>
    </el-form>

    <!-- <el-divider class="divider">其他方式登录</el-divider>
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
    </div> -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { login } from '@/axios/user'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const checked = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请填写密码', trigger: 'blur' }],
}

async function onSubmit() {
  if (!checked.value) {
    ElMessage.warning('请勾选我已同意')
    return
  }

  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login({
        username: formData.username,
        password: formData.password,
      })
      store.setUser({
        token: res.data.token,
        username: res.data.username,
        id: res.data.id,
        sessionId: res.data.sessionId,
      })
      router.push(route.query.returnUrl || '/workbench')
      ElMessage.success('登录成功')
    } catch (err) {
      ElMessage.error(err?.message || '登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.password-login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    border-radius: $radius-sm;
    box-shadow: 0 0 0 1px $border inset;
    transition: $transition-fast;

    &:hover {
      box-shadow: 0 0 0 1px $primary inset;
    }
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px $primary inset;
  }

  :deep(.el-form-item__label) {
    color: $text-primary;
    font-weight: 500;
  }
}

.agree-checkbox {
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

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, $primary, $primary-hover);
  border: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: $radius-sm;
  box-shadow: 0 4px 12px rgba(74, 155, 94, 0.25);
  transition: $transition;
  height: 44px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(74, 155, 94, 0.35);
  }

  &:active {
    transform: scale(0.98);
  }
}

.divider {
  :deep(.el-divider__text) {
    color: $text-tertiary;
    font-size: 0.8125rem;
    background-color: transparent;
  }
}

.other-login {
  @include flex-center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.other-item {
  width: 48px;
  height: 48px;
  @include flex-center;
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
