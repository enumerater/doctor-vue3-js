<template>
  <div class="plot-edit-page">
    <ContentHeader title="编辑地块" :showBack="true" />

    <div class="plot-edit" v-if="store.currentPlot">
      <div class="form-wrapper">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="onSubmit"
        >
          <div class="form-section">
            <h3 class="section-title">地块信息</h3>

            <el-form-item label="地块名称" prop="name">
              <el-input v-model="form.name" placeholder="如：东地1号" />
            </el-form-item>

            <el-form-item label="作物类型" prop="cropType">
              <el-select v-model="form.cropType" placeholder="选择作物" style="width: 100%">
                <el-option
                  v-for="item in cropOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="面积(亩)" prop="area">
              <el-input v-model="form.area" type="number" placeholder="请输入面积" />
            </el-form-item>
          </div>

          <div class="form-section">
            <h3 class="section-title">种植信息</h3>

            <el-form-item label="播种日期">
              <el-date-picker
                v-model="form.sowingDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="土壤类型">
              <el-select v-model="form.soilType" placeholder="选择土壤类型（选填）" clearable style="width: 100%">
                <el-option
                  v-for="item in soilOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
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
          </div>
        </el-form>
      </div>
    </div>

    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmStore } from '@/stores/farm'

const route = useRoute()
const router = useRouter()
const store = useFarmStore()
const farmId = route.params.farmId
const plotId = route.params.plotId
const formRef = ref(null)

const form = reactive({
  name: '',
  cropType: '',
  area: '',
  sowingDate: '',
  soilType: '',
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  cropType: [{ required: true, message: '请选择作物', trigger: 'change' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
}

const cropOptions = ['小麦', '水稻', '玉米', '番茄', '黄瓜', '辣椒', '草莓', '苹果', '葡萄', '白菜']

const soilOptions = ['壤土', '砂壤土', '砂土', '粘土', '粘壤土']

onMounted(() => {
  store.fetchPlotDetail(farmId, plotId)
})

watch(() => store.currentPlot, (plot) => {
  if (plot) {
    form.name = plot.name || ''
    form.cropType = plot.cropType || ''
    form.area = String(plot.area || '')
    form.sowingDate = plot.sowingDate || ''
    form.soilType = plot.soilType || ''
  }
}, { immediate: true })

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    await store.updatePlot(farmId, plotId, {
      name: form.name,
      cropType: form.cropType,
      area: Number(form.area),
      sowingDate: form.sowingDate || undefined,
      soilType: form.soilType || undefined,
    })
    ElMessage.success('保存成功')
    router.back()
  })
}
</script>

<style lang="scss" scoped>
.plot-edit-page {
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

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}
</style>
