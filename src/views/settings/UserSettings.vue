<template>
  <div class="user-settings">
    <div class="settings-container">
      <h2 class="page-title">个人设置</h2>

      <!-- 头像区域 -->
      <div class="settings-card">
        <h3 class="section-title">头像</h3>
        <div class="avatar-section">
          <el-avatar :size="80" :src="avatarUrl || undefined" class="current-avatar">
            <el-icon :size="36">
              <User />
            </el-icon>
          </el-avatar>
          <el-upload :show-file-list="false" :before-upload="beforeAvatarUpload" :http-request="handleAvatarUpload"
            accept="image/*">
            <el-button type="primary" plain>更换头像</el-button>
          </el-upload>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="settings-card">
        <h3 class="section-title">基本信息</h3>
        <el-form :model="profileForm" label-position="top" class="settings-form">
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" disabled prefix-icon="Message" size="large" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="profileForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="profileLoading" @click="saveProfile">
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 密码区域 -->
      <div class="settings-card">
        <h3 class="section-title">{{ hasPassword ? '修改密码' : '设置密码' }}</h3>
        <p v-if="!hasPassword" class="section-hint">您通过验证码登录，尚未设置密码。设置密码后可使用密码登录。</p>
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top"
          class="settings-form">
          <el-form-item v-if="hasPassword" label="旧密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" prefix-icon="Lock"
              size="large" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" prefix-icon="Lock"
              size="large" show-password />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" prefix-icon="Lock"
              size="large" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="passwordLoading" @click="savePassword">
              {{ hasPassword ? '修改密码' : '设置密码' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { changePassword, uploadAvatar } from '@/axios/user'

const userStore = useUserStore()

// 头像
const avatarUrl = computed(() => userStore.user.avatar)
const hasPassword = computed(() => userStore.user.hasPassword)

function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

async function handleAvatarUpload({ file }) {
  try {
    const res = await uploadAvatar(file)
    await userStore.updateProfile({ avatar: res.data.url })
    ElMessage.success('头像更新成功')
  } catch (err) {
    ElMessage.error(err?.message || '头像上传失败')
  }
}

// 基本信息
const profileForm = reactive({
  email: userStore.user.email || '',
  username: userStore.user.username || '',
})
const profileLoading = ref(false)

async function saveProfile() {
  if (!profileForm.username.trim()) {
    ElMessage.warning('用户名不能为空')
    return
  }
  profileLoading.value = true
  try {
    await userStore.updateProfile({ username: profileForm.username.trim() })
    ElMessage.success('个人信息已更新')
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    profileLoading.value = false
  }
}

// 修改密码
const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = computed(() => ({
  oldPassword: hasPassword.value
    ? [{ required: true, message: '请输入旧密码', trigger: 'blur' }]
    : [],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}))

async function savePassword() {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    passwordLoading.value = true
    try {
      const payload = { newPassword: passwordForm.newPassword }
      if (hasPassword.value) {
        payload.oldPassword = passwordForm.oldPassword
      }
      await changePassword(payload)
      ElMessage.success(hasPassword.value ? '密码修改成功' : '密码设置成功')
      // 设置密码后标记为已有密码
      userStore.user.hasPassword = true
      localStorage.setItem('hasPassword', '1')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } catch (err) {
      ElMessage.error(err?.message || '操作失败')
    } finally {
      passwordLoading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.user-settings {
  padding: 24px;
  max-width: 640px;
  margin: 0 auto;

  @include mobile {
    padding: 16px;
  }
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 24px;
}

.settings-card {
  @include card-base;
  padding: 24px;
  margin-bottom: 20px;

  @include mobile {
    padding: 16px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border;
}

.section-hint {
  font-size: 13px;
  color: $text-tertiary;
  margin-bottom: 16px;
  line-height: 1.5;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;

  .current-avatar {
    background: linear-gradient(135deg, $primary, $secondary);
    color: #fff;
    flex-shrink: 0;
  }
}

.settings-form {
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

  .el-button--primary {
    background: linear-gradient(135deg, $primary, $primary-hover);
    border: none;
    font-weight: 600;
    border-radius: $radius-sm;
    box-shadow: 0 4px 12px rgba(74, 155, 94, 0.25);
    transition: $transition;
    height: 44px;
    padding: 0 32px;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(74, 155, 94, 0.35);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}
</style>
