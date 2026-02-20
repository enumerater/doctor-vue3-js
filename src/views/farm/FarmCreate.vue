<template>
  <PageLayout title="创建农场" :showBack="true">
    <div class="farm-create">
      <van-form @submit="onSubmit" class="create-form">
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>

          <van-cell-group inset>
            <van-field v-model="form.name" name="name" label="农场名称" placeholder="请输入农场名称"
              :rules="[{ required: true, message: '请输入农场名称' }]" />
            <van-field v-model="form.location" name="location" label="所在位置" placeholder="省/市/区（选填）" />
            <van-field v-model="form.area" name="area" label="总面积(亩)" type="number" placeholder="请输入面积"
              :rules="[{ required: true, message: '请输入面积' }]" />
          </van-cell-group>
        </div>

        <div class="form-actions">
          <van-button block type="primary" native-type="submit" :loading="store.loading" class="submit-btn">
            创建农场
          </van-button>
        </div>
      </van-form>
    </div>
  </PageLayout>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import PageLayout from '@/components/shared/PageLayout.vue'
import { useFarmStore } from '@/stores/farm'

const store = useFarmStore()
const router = useRouter()

const form = reactive({
  name: '',
  location: '',
  area: '',
})

const onSubmit = async () => {
  const farm = await store.createFarm({
    name: form.name,
    location: form.location || undefined,
    area: Number(form.area),
  })
  if (farm) {
    showSuccessToast('创建成功')
    router.replace({ name: 'farmDetail', params: { farmId: farm.id } })
  }
}
</script>

<style lang="scss" scoped>
.farm-create {
  padding-bottom: 20px;
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

:deep(.van-cell-group--inset) {
  border-radius: $radius-sm;
  border: 1px solid $border;
  overflow: hidden;
}

.form-actions {
  padding-top: 12px;
}

.submit-btn {
  background: $primary;
  border-color: $primary;
  border-radius: $radius-sm;
  height: 44px;
  font-size: 15px;
}
</style>
