<template>
  <div class="plot-create-page">
    <ContentHeader title="添加地块" :showBack="true" />

    <div class="form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="custom-form"
        @submit.prevent="onSubmit"
      >
        <!-- Step 1: Basic Information -->
        <div class="form-card">
          <div class="card-header">
            <div class="header-icon"><el-icon><InfoFilled /></el-icon></div>
            <h3 class="card-title">基本信息</h3>
          </div>
          
          <div class="card-body">
            <el-form-item label="地块名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="例如：东院菜地、大棚1号" 
                :prefix-icon="Edit"
              />
            </el-form-item>

            <el-form-item label="地块面积 (亩)" prop="area">
              <el-input-number 
                v-model="form.area" 
                :min="0" 
                :precision="2" 
                :step="0.5"
                controls-position="right"
                style="width: 100%"
                placeholder="请输入面积"
              />
            </el-form-item>
          </div>
        </div>

        <!-- Step 2: Crop Selection (Visual) -->
        <div class="form-card">
          <div class="card-header">
            <div class="header-icon"><el-icon><GoodsFilled /></el-icon></div>
            <h3 class="card-title">选择作物</h3>
          </div>
          
          <div class="card-body">
            <el-form-item prop="cropType" class="no-label-item">
              <div class="crop-grid">
                <div 
                  v-for="item in cropItems" 
                  :key="item.name"
                  class="crop-item"
                  :class="{ active: form.cropType === item.name }"
                  @click="form.cropType = item.name"
                >
                  <span class="crop-icon">{{ item.icon }}</span>
                  <span class="crop-name">{{ item.name }}</span>
                  <div class="check-badge" v-if="form.cropType === item.name">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
                <!-- Custom option -->
                <div 
                  class="crop-item custom"
                  :class="{ active: isCustomCrop }"
                  @click="handleCustomCropClick"
                >
                  <span class="crop-icon">✨</span>
                  <span class="crop-name">其他</span>
                </div>
              </div>
            </el-form-item>
            
            <el-collapse-transition>
              <div v-if="isCustomCrop" class="custom-crop-input">
                <el-form-item label="自定义作物名称" prop="customCrop">
                  <el-input v-model="form.customCrop" placeholder="请输入作物名称" />
                </el-form-item>
              </div>
            </el-collapse-transition>
          </div>
        </div>

        <!-- Step 3: Planting Details -->
        <div class="form-card">
          <div class="card-header">
            <div class="header-icon"><el-icon><Calendar /></el-icon></div>
            <h3 class="card-title">种植详情 (选填)</h3>
          </div>
          
          <div class="card-body">
            <div class="form-row">
              <el-form-item label="播种日期" class="flex-1">
                <el-date-picker
                  v-model="form.sowingDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="土壤类型" class="flex-1">
                <el-select v-model="form.soilType" placeholder="选择土壤" clearable style="width: 100%">
                  <el-option v-for="s in soilOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>

        <div class="form-submit">
          <el-button
            type="primary"
            :loading="store.loading"
            class="submit-btn"
            @click="onSubmit"
          >
            确认创建地块
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, GoodsFilled, Calendar, Edit, Check } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmStore } from '@/stores/farm'

const route = useRoute()
const router = useRouter()
const store = useFarmStore()
const farmId = route.params.farmId
const formRef = ref(null)

const form = reactive({
  name: '',
  cropType: '',
  customCrop: '',
  area: 0,
  sowingDate: '',
  soilType: '',
})

const isCustomCrop = ref(false)

const rules = {
  name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
  cropType: [{ required: true, message: '请选择作物', trigger: 'change' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
}

const cropItems = [
  { name: '小麦', icon: '🌾' }, { name: '水稻', icon: '🌾' }, 
  { name: '玉米', icon: '🌽' }, { name: '番茄', icon: '🍅' },
  { name: '黄瓜', icon: '🥒' }, { name: '辣椒', icon: '🌶️' }, 
  { name: '草莓', icon: '🍓' }, { name: '苹果', icon: '🍎' },
  { name: '葡萄', icon: '🍇' }, { name: '白菜', icon: '🥬' }
]

const soilOptions = ['壤土', '砂壤土', '砂土', '粘土', '粘壤土']

const handleCustomCropClick = () => {
  isCustomCrop.value = true
  form.cropType = 'custom'
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    const finalCropType = form.cropType === 'custom' ? form.customCrop : form.cropType
    if (!finalCropType) {
      ElMessage.warning('请提供作物名称')
      return
    }

    const plot = await store.createPlot(farmId, {
      name: form.name,
      cropType: finalCropType,
      area: Number(form.area),
      sowingDate: form.sowingDate || undefined,
      soilType: form.soilType || undefined,
    })
    
    if (plot) {
      ElMessage.success('添加成功')
      router.back()
    }
  })
}
</script>

<style lang="scss" scoped>
.plot-create-page {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;

  @include mobile {
    padding: 0 16px;
  }
}

.form-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  box-shadow: $shadow-sm;
  margin-bottom: 20px;
  overflow: hidden;
  transition: $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(to right, rgba($primary, 0.05), transparent);
  border-bottom: 1px solid rgba($border, 0.5);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: $primary;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.crop-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @include mobile {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
}

.crop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  border-radius: $radius-md;
  border: 1px solid $border;
  background: $bg-main;
  cursor: pointer;
  transition: $transition-smooth;
  position: relative;

  .crop-icon { font-size: 24px; }
  .crop-name { font-size: 12px; color: $text-secondary; font-weight: 500; }

  &:hover {
    border-color: $primary;
    background: $primary-light;
    transform: translateY(-2px);
  }

  &.active {
    background: $primary;
    border-color: $primary;
    
    .crop-name { color: white; }
    .crop-icon { transform: scale(1.1); }
  }

  &.custom {
    border-style: dashed;
  }
}

.check-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.custom-crop-input {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed $border;
}

.form-row {
  display: flex;
  gap: 16px;

  @include mobile {
    flex-direction: column;
    gap: 0;
  }
}

.flex-1 { flex: 1; }

.form-submit {
  margin-top: 30px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  letter-spacing: 0.05em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

:deep(.el-input__wrapper), :deep(.el-select__wrapper) {
  background-color: $bg-main;
  border-radius: $radius-sm;
  box-shadow: none;
  border: 1px solid $border;
  transition: $transition-fast;

  &.is-focus {
    border-color: $primary;
    box-shadow: 0 0 0 1px $primary inset;
  }
}

.no-label-item {
  margin-bottom: 0;
}
</style>
