<template>
  <div class="pesticide-create-page">
    <ContentHeader :title="isEdit ? '修改施药记录' : '记录施药/施肥'" :showBack="true" />
    
    <div class="create-container">
      <div class="v2-form card-box" v-loading="loading">
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-group">
            <label>作业类型</label>
            <div class="quick-pills">
              <div 
                v-for="cat in ['农药', '肥料', '除草剂', '杀菌剂']" 
                :key="cat"
                class="pill-item"
                :class="{ active: form.category === cat }"
                @click="form.category = cat"
              >
                {{ cat }}
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>药剂/肥料名称</label>
            <el-input v-model="form.medicineName" placeholder="如：阿维菌素" class="v2-input" />
          </div>
          <div class="form-group">
            <label>作业目的</label>
            <el-input v-model="form.purpose" placeholder="如：防治红蜘蛛" class="v2-input" />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">作业定量/配比</h3>
          
          <!-- 肥料模式：按亩定量 -->
          <div v-if="form.category === '肥料'" class="fertilizer-inputs">
            <div class="form-row">
              <div class="form-group flex-2">
                <label>总用量</label>
                <el-input-number v-model="form.dosage" :min="1" class="v2-number-input-full" />
              </div>
              <div class="form-group flex-1">
                <label>单位</label>
                <el-select v-model="form.unit" class="v2-select">
                  <el-option label="公斤(kg)" value="kg" />
                  <el-option label="袋" value="袋" />
                </el-select>
              </div>
            </div>
            <div class="form-group">
              <label>作业面积 (亩)</label>
              <el-input-number v-model="form.applicationArea" :precision="2" :step="0.1" :min="0.1" class="v2-number-input-full" />
              <p class="input-tip">平均每亩施加: {{ (form.dosage / form.applicationArea).toFixed(2) }} {{ form.unit }}</p>
            </div>
          </div>

          <!-- 农药/杀菌剂模式：可视化稀释配比 -->
          <VisualPesticideInput 
            v-else 
            :model-value="form" 
            @update:model-value="Object.assign(form, $event)" 
          />
        </div>

        <div class="form-section">
          <h3 class="section-title">作业日期</h3>
          <el-date-picker
            v-model="form.applicationDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="v2-date-picker"
          />
        </div>

        <div class="submit-bar">
          <el-button type="primary" size="large" @click="submit" :loading="submitLoading" round class="submit-btn">
            {{ isEdit ? '保存修改' : '保存作业记录' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import VisualPesticideInput from '@/components/farm/VisualPesticideInput.vue'
import { useFarmRecordsStore } from '@/stores/farm_records'

const route = useRoute()
const router = useRouter()
const recordsStore = useFarmRecordsStore()
const plotId = route.params.plotId
const recordId = route.params.id
const isEdit = computed(() => !!recordId)
const loading = ref(false)
const submitLoading = ref(false)

const form = reactive({
  medicineName: '',
  category: '农药',
  applicationDate: new Date().toISOString().slice(0, 10),
  dosage: 50,
  unit: 'ml',
  ratio: 1000,
  applicationArea: 1.0, // 新增：施用面积（亩）
  purpose: '',
  remarks: '',
  totalVolume: 50.0
})

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const record = recordsStore.pesticideRecords.find(r => String(r.id) === String(recordId))
      if (record) {
        Object.assign(form, {
          ...record,
          dosage: parseFloat(record.dosage) || 50,
          ratio: record.ratio || 1000,
          applicationArea: record.applicationArea || 1.0
        })
      }
    } finally {
      loading.value = false
    }
  }
})

const submit = async () => {
  if (!form.medicineName) return ElMessage.warning('请输入药剂名称')
  submitLoading.value = true
  try {
    const payload = { 
      category: form.category,
      medicineName: form.medicineName,
      dosage: parseFloat(form.dosage),
      unit: form.unit,
      ratio: form.category === '肥料' ? 0 : parseInt(form.ratio),
      applicationArea: parseFloat(form.applicationArea), // 提交面积
      totalVolume: form.category === '肥料' ? 0 : parseFloat(form.totalVolume),
      purpose: form.purpose,
      applicationDate: form.applicationDate,
      remarks: form.remarks
    }

    if (isEdit.value) {
      await recordsStore.updatePesticideRecord(plotId, recordId, payload)
      ElMessage.success('更新成功')
    } else {
      await recordsStore.addPesticideRecord(plotId, payload)
      ElMessage.success('记录成功')
    }
    router.back()
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.pesticide-create-page {
  min-height: 100vh;
  background: #f8faf9;
  padding-bottom: 40px;
}

.create-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.card-box {
  background: white;
  border-radius: 32px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
}

.form-row { display: flex; gap: 16px; .flex-2 { flex: 2; } .flex-1 { flex: 1; } }
.v2-number-input-full { width: 100% !important; :deep(.el-input__wrapper) { border-radius: 16px; height: 52px; background: #f9fafb; box-shadow: none; border: 1px solid #f3f4f6; } }
.v2-select { width: 100%; :deep(.el-input__wrapper) { border-radius: 16px; height: 52px; background: #f9fafb; box-shadow: none; border: 1px solid #f3f4f6; } }
.input-tip { font-size: 12px; color: $primary; margin-top: 8px; font-weight: 600; padding-left: 4px; }

.form-section {
  margin-bottom: 30px;
  .section-title {
    font-size: 16px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 16px;
    padding-left: 4px;
    border-left: 4px solid $primary;
    line-height: 1;
  }
}

.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: $text-secondary;
    margin-bottom: 8px;
    padding-left: 4px;
  }
}

.quick-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  .pill-item {
    padding: 10px 20px;
    background: #f3f4f6;
    border-radius: 14px;
    font-size: 14px;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s;
    &.active {
      background: $primary;
      color: white;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba($primary, 0.2);
    }
  }
}

.v2-input :deep(.el-input__wrapper) {
  border-radius: 16px;
  background: #f9fafb;
  box-shadow: none;
  border: 1px solid #f3f4f6;
  height: 52px;
}

.v2-date-picker {
  width: 100% !important;
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    background: #f9fafb;
    box-shadow: none;
    border: 1px solid #f3f4f6;
    height: 52px;
  }
}

.submit-bar {
  margin-top: 40px;
  .submit-btn {
    width: 100%;
    height: 56px;
    font-size: 17px;
    font-weight: 800;
    box-shadow: 0 10px 20px rgba($primary, 0.2);
  }
}
</style>
