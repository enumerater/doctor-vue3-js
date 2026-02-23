<template>
  <div class="register-form">
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
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" prefix-icon="User" size="large" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码（至少6位）" prefix-icon="Lock"
          size="large" show-password clearable />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" prefix-icon="Lock"
          size="large" show-password clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="onSubmit">
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { sendCode, register } from '@/axios/user'

const emit = defineEmits(['register-success'])

const formRef = ref(null)
const loading = ref(false)
const codeCooldown = ref(0)
let cooldownTimer = null

const formData = reactive({
  email: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailPattern, message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
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
    await sendCode({ email: formData.email, type: 'register' })
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
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await register({
        email: formData.email,
        code: formData.code,
        username: formData.username,
        password: formData.password,
      })
      ElMessage.success('注册成功，请登录')
      emit('register-success')
    } catch (err) {
      ElMessage.error(err?.message || '注册失败，请重试')
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
.register-form {
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
