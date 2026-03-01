<template>
  <div class="farm-edit-page">
    <ContentHeader title="修改农场信息" :showBack="true" />

    <div class="form-container">
      <div class="edit-card">
        <div class="card-side-decoration">
          <div class="decoration-icon">🏡</div>
          <div class="decoration-bg"></div>
        </div>
        
        <div class="card-main-content">
          <div class="header-section">
            <h2 class="form-title">基本信息</h2>
            <p class="form-subtitle">修改您的农场名称和位置</p>
          </div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="custom-form"
            @submit.prevent="onSubmit"
          >
            <el-form-item label="农场名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="例如：春风有机农场、后院菜园" 
                :prefix-icon="Edit"
              />
            </el-form-item>

            <el-form-item label="所在位置" prop="location">
              <el-input 
                v-model="form.location" 
                placeholder="省/市/区（选填）" 
                :prefix-icon="Location"
              />
            </el-form-item>

            <div class="form-tips">
              <el-icon><InfoFilled /></el-icon>
              <span>修改后将更新所有关联地块的显示信息。</span>
            </div>

            <div class="form-actions">
              <el-button
                type="primary"
                :loading="store.loading"
                class="submit-btn"
                @click="onSubmit"
              >
                保存修改
              </el-button>
              <el-button class="cancel-btn" @click="router.back()">
                取消
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit, Location, InfoFilled } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmStore } from '@/stores/farm'

const store = useFarmStore()
const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const farmId = route.params.farmId

const form = reactive({
  name: '',
  location: '',
})

const rules = {
  name: [{ required: true, message: '请输入农场名称', trigger: 'blur' }],
}

onMounted(async () => {
  if (!store.currentFarm || store.currentFarm.id !== farmId) {
    await store.fetchFarmDetail(farmId)
  }
  if (store.currentFarm) {
    form.name = store.currentFarm.name
    form.location = store.currentFarm.location
  }
})

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await store.updateFarm(farmId, {
      name: form.name,
      location: form.location || undefined,
    })
    if (res) {
      ElMessage.success('修改成功')
      router.back()
    }
  })
}
</script>

<style lang="scss" scoped>
.farm-edit-page {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.edit-card {
  display: grid;
  grid-template-columns: 240px 1fr;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  box-shadow: $shadow-md;
  overflow: hidden;
  margin-top: 20px;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.card-side-decoration {
  background: linear-gradient(135deg, $primary, $primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .decoration-icon {
    font-size: 80px;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  }

  .decoration-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);
    z-index: 1;
  }

  @include mobile {
    height: 120px;
    .decoration-icon { font-size: 60px; }
  }
}

.card-main-content {
  padding: 40px;

  @include mobile {
    padding: 24px 20px;
  }
}

.header-section {
  margin-bottom: 30px;
}

.form-title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 8px;
}

.form-subtitle {
  font-size: 14px;
  color: $text-tertiary;
  margin: 0;
}

.form-tips {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  background: $primary-light;
  border-radius: $radius-md;
  margin: 24px 0 32px;
  
  .el-icon {
    color: $primary;
    font-size: 18px;
    margin-top: 2px;
  }

  span {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn {
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: $radius-md;
  background-color: $primary !important;
  border-color: $primary !important;
  box-shadow: $shadow-sm;

  &:hover {
    background-color: $primary-hover !important;
    border-color: $primary-hover !important;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.cancel-btn {
  height: 48px;
  border-radius: $radius-md;
  color: $text-tertiary;
  border: 1px solid $border;

  &:hover {
    color: $text-primary;
    background: $bg-main;
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: $text-primary;
  padding-bottom: 8px;
}

:deep(.el-input__wrapper) {
  background-color: $bg-main;
  box-shadow: none;
  border: 1px solid $border;
  border-radius: $radius-md;
  height: 48px;
  transition: $transition-fast;

  &.is-focus {
    border-color: $primary;
    box-shadow: 0 0 0 1px $primary inset;
  }
}
</style>
