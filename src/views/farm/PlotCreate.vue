<template>
  <PageLayout title="添加地块" :showBack="true">
    <div class="plot-create">
      <van-form @submit="onSubmit" class="create-form">
        <div class="form-section">
          <h3 class="section-title">地块信息</h3>
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              label="地块名称"
              placeholder="如：东地1号"
              :rules="[{ required: true, message: '请输入名称' }]"
            />
            <van-field
              v-model="form.cropType"
              is-link
              readonly
              label="作物类型"
              placeholder="选择作物"
              @click="showCropPicker = true"
              :rules="[{ required: true, message: '请选择作物' }]"
            />
            <van-field
              v-model="form.area"
              label="面积(亩)"
              type="number"
              placeholder="请输入面积"
              :rules="[{ required: true, message: '请输入面积' }]"
            />
          </van-cell-group>
        </div>

        <div class="form-section">
          <h3 class="section-title">种植信息</h3>
          <van-cell-group inset>
            <van-field
              v-model="form.sowingDate"
              is-link
              readonly
              label="播种日期"
              placeholder="选择日期"
              @click="showDatePicker = true"
            />
            <van-field
              v-model="form.soilType"
              is-link
              readonly
              label="土壤类型"
              placeholder="选择土壤类型（选填）"
              @click="showSoilPicker = true"
            />
          </van-cell-group>
        </div>

        <div class="form-actions">
          <van-button block type="primary" native-type="submit" :loading="store.loading" class="submit-btn">
            添加地块
          </van-button>
        </div>
      </van-form>

      <!-- 作物类型选择 -->
      <van-popup v-model:show="showCropPicker" round position="bottom">
        <van-picker
          :columns="cropColumns"
          @confirm="onCropConfirm"
          @cancel="showCropPicker = false"
          title="选择作物类型"
        />
      </van-popup>

      <!-- 日期选择 -->
      <van-popup v-model:show="showDatePicker" round position="bottom">
        <van-date-picker
          v-model="datePickerValue"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
          title="选择播种日期"
          :min-date="new Date(2020, 0, 1)"
          :max-date="new Date()"
        />
      </van-popup>

      <!-- 土壤类型选择 -->
      <van-popup v-model:show="showSoilPicker" round position="bottom">
        <van-picker
          :columns="soilColumns"
          @confirm="onSoilConfirm"
          @cancel="showSoilPicker = false"
          title="选择土壤类型"
        />
      </van-popup>
    </div>
  </PageLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import PageLayout from '@/components/shared/PageLayout.vue'
import { useFarmStore } from '@/stores/farm'

const route = useRoute()
const router = useRouter()
const store = useFarmStore()
const farmId = route.params.farmId

const form = reactive({
  name: '',
  cropType: '',
  area: '',
  sowingDate: '',
  soilType: '',
})

const showCropPicker = ref(false)
const showDatePicker = ref(false)
const showSoilPicker = ref(false)

const now = new Date()
const datePickerValue = ref([
  String(now.getFullYear()),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
])

const cropColumns = [
  { text: '小麦', value: '小麦' },
  { text: '水稻', value: '水稻' },
  { text: '玉米', value: '玉米' },
  { text: '番茄', value: '番茄' },
  { text: '黄瓜', value: '黄瓜' },
  { text: '辣椒', value: '辣椒' },
  { text: '草莓', value: '草莓' },
  { text: '苹果', value: '苹果' },
  { text: '葡萄', value: '葡萄' },
  { text: '白菜', value: '白菜' },
]

const soilColumns = [
  { text: '壤土', value: '壤土' },
  { text: '砂壤土', value: '砂壤土' },
  { text: '砂土', value: '砂土' },
  { text: '粘土', value: '粘土' },
  { text: '粘壤土', value: '粘壤土' },
]

const onCropConfirm = ({ selectedOptions }) => {
  form.cropType = selectedOptions[0]?.text || ''
  showCropPicker.value = false
}

const onDateConfirm = ({ selectedValues }) => {
  form.sowingDate = selectedValues.join('-')
  showDatePicker.value = false
}

const onSoilConfirm = ({ selectedOptions }) => {
  form.soilType = selectedOptions[0]?.text || ''
  showSoilPicker.value = false
}

const onSubmit = async () => {
  const plot = await store.createPlot(farmId, {
    name: form.name,
    cropType: form.cropType,
    area: Number(form.area),
    sowingDate: form.sowingDate || undefined,
    soilType: form.soilType || undefined,
  })
  if (plot) {
    showSuccessToast('添加成功')
    router.back()
  }
}
</script>

<style lang="scss" scoped>
.plot-create {
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
