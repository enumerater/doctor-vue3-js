<template>
  <div class="farm-create">
    <ContentHeader title="创建农场" :showBack="true" />

    <div class="form-wrapper">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>

          <el-form-item label="农场名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入农场名称" />
          </el-form-item>

          <el-form-item label="所在位置" prop="location">
            <el-input v-model="form.location" placeholder="省/市/区（选填）" />
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button
            type="primary"
            :loading="store.loading"
            class="submit-btn"
            @click="onSubmit"
          >
            创建农场
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmStore } from '@/stores/farm'

const store = useFarmStore()
const router = useRouter()
const formRef = ref(null)

const form = reactive({
  name: '',
  location: '',
})

const rules = {
  name: [{ required: true, message: '请输入农场名称', trigger: 'blur' }],
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const farm = await store.createFarm({
      name: form.name,
      location: form.location || undefined,
      area: 0,
    })
    if (farm) {
      ElMessage.success('创建成功')
      router.replace({ name: 'farm' })
    }
  })
}
</script>

<style lang="scss" scoped>
.farm-create {
  padding-bottom: 20px;
}

.form-wrapper {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 12px 0;
}

.form-actions {
  padding-top: 12px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  border-radius: $radius-sm;
}
</style>
