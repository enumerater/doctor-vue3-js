<template>
  <div class="mobile-login-form">
    <el-form ref="formRef" :model="formData" :rules="rules" @submit.prevent="onSubmit" label-position="top">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" prefix-icon="Message" size="large" clearable />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <div class="code-field-row">
          <el-input v-model="formData.code" placeholder="请输入验证码" prefix-icon="Key" size="large" clearable />
          <el-button type="primary" plain size="large" class="get-code-btn" :disabled="codeCooldown > 0"
            @click="getCode">
            {{ codeCooldown > 0 ? `${codeCooldown}s 后重发` : '获取验证码' }}
          </el-button>
        </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { sendCode, emailLogin } from '@/axios/user'

const router = useRouter()
const store = useUserStore()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const checked = ref(false)
const codeCooldown = ref(0)
let cooldownTimer = null

const formData = reactive({
  email: '',
  code: '',
})

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
}

async function getCode() {
  if (!formData.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  if (!emailPattern.test(formData.email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  try {
    await sendCode({ email: formData.email, type: 'login' })
    ElMessage.success('验证码已发送')
    codeCooldown.value = 60
    cooldownTimer = setInterval(() => {
      codeCooldown.value--
      if (codeCooldown.value <= 0) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  } catch (err) {
    ElMessage.error(err?.message || '验证码发送失败，请重试')
  }
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
      const res = await emailLogin({
        email: formData.email,
        code: formData.code,
      })
      if (Number(res.data.status) === 0) {
        ElMessage.error('该账号已被禁用，无法登录')
        return
      }
      store.setUser({
        token: res.data.token,
        username: res.data.username,
        id: res.data.id,
        sessionId: res.data.sessionId,
        avatar: res.data.avatar,
        email: res.data.email,
        hasPassword: res.data.hasPassword,
        role: res.data.role,
        status: res.data.status,
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

onBeforeUnmount(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style lang="scss" scoped>
.mobile-login-form {
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

.code-field-row {
  display: flex;
  gap: 12px;
  width: 100%;

  .el-input {
    flex: 1;
  }

  .get-code-btn {
    flex-shrink: 0;
    white-space: nowrap;
    border-radius: $radius-sm;
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
</style>
