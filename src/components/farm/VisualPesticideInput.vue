<template>
  <div class="visual-pesticide-input">
    <div class="visual-container">
      <div class="instrument tube-section">
        <div class="label">药剂 ({{ dosage }}{{ unit }})</div>
        <div class="tube-wrapper">
          <div class="tube">
            <div class="liquid medicine" :style="{ height: medicineHeight + '%' }">
              <div class="bubbles"></div>
            </div>
            <div class="markings">
              <span v-for="i in 5" :key="i"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="mixer-arrow">
        <div class="ratio-text">1 : {{ ratio }}</div>
        <div class="arrow-icon">➔</div>
      </div>

      <div class="instrument bucket-section">
        <div class="label">稀释液 ({{ totalVolume }}L)</div>
        <div class="bucket-wrapper">
          <div class="bucket">
            <div class="liquid water" :style="{ height: waterHeight + '%' }">
              <div class="waves"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <div class="control-item">
        <div class="control-header">
          <span>药剂添加量 ({{ unit }})</span>
          <el-input-number 
            v-model="dosage" 
            :min="1" 
            :max="1000" 
            size="small" 
            controls-position="right"
            class="v2-number-input"
          />
        </div>
        <el-slider v-model="dosage" :min="1" :max="1000" :show-tooltip="false" />
      </div>

      <div class="control-item">
        <div class="control-header">
          <span>稀释倍数 (倍)</span>
          <el-input-number 
            v-model="ratio" 
            :min="100" 
            :max="10000" 
            :step="100"
            size="small" 
            controls-position="right"
            class="v2-number-input"
          />
        </div>
        <el-slider v-model="ratio" :min="100" :max="10000" :step="100" :show-tooltip="false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

// 本地状态
const dosage = ref(Number(props.modelValue.dosage) || 50)
const ratio = ref(Number(props.modelValue.ratio) || 1000)
const unit = ref(props.modelValue.unit || 'ml')

const medicineHeight = computed(() => Math.min((dosage.value / 500) * 100, 95))
const waterHeight = computed(() => {
  const d = Number(dosage.value) || 0
  const r = Number(ratio.value) || 0
  const total = (d * r) / 1000
  return Math.min((total / 100) * 100, 95)
})

const totalVolume = computed(() => {
  const d = Number(dosage.value) || 0
  const r = Number(ratio.value) || 0
  const vol = (d * r) / 1000
  return parseFloat(vol.toFixed(2))
})

// 核心：监听本地任何变化，立即安全地同步给父组件
watch([dosage, ratio, unit, totalVolume], () => {
  const newValue = {
    ...props.modelValue,
    dosage: Number(dosage.value),
    ratio: Number(ratio.value),
    unit: unit.value,
    totalVolume: totalVolume.value
  }
  emit('update:modelValue', newValue)
})

// 监听父组件传来的初始值（回显用）
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (Number(newVal.dosage) !== dosage.value) dosage.value = Number(newVal.dosage) || 50
    if (Number(newVal.ratio) !== ratio.value) ratio.value = Number(newVal.ratio) || 1000
    if (newVal.unit !== unit.value) unit.value = newVal.unit || 'ml'
  }
}, { deep: true })

onMounted(() => {
  // 确保挂载时父组件能拿到初始计算值
  emit('update:modelValue', {
    ...props.modelValue,
    dosage: dosage.value,
    ratio: ratio.value,
    totalVolume: totalVolume.value
  })
})
</script>

<style lang="scss" scoped>
.visual-pesticide-input {
  background: #fdfdfd;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.visual-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 200px;
  margin-bottom: 30px;
  background: white;
  border-radius: 20px;
  padding: 10px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
}

.instrument {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  .label { font-size: 12px; font-weight: 700; color: $text-secondary; }
}

.tube-wrapper {
  .tube {
    width: 30px;
    height: 120px;
    border: 3px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 15px 15px;
    position: relative;
    background: rgba(255,255,255,0.5);
    overflow: hidden;

    .liquid.medicine {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: linear-gradient(to top, #4ade80, #22c55e);
      transition: height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255,255,255,0.3);
      }
    }

    .markings {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 10px 0;
      span { width: 6px; height: 1px; background: #d1d5db; }
    }
  }
}

.mixer-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $primary;
  .ratio-text { font-family: 'Courier New', Courier, monospace; font-weight: 900; font-size: 14px; }
  .arrow-icon { font-size: 24px; margin-top: -5px; }
}

.bucket-wrapper {
  .bucket {
    width: 70px;
    height: 100px;
    border: 4px solid #e5e7eb;
    border-radius: 4px 4px 20px 20px;
    position: relative;
    background: rgba(255,255,255,0.5);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 30px;
      border: 3px solid #d1d5db;
      border-bottom: none;
      border-radius: 30px 30px 0 0;
    }

    .liquid.water {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: linear-gradient(to top, #3b82f6, #60a5fa);
      transition: height 0.6s ease-out;
    }
  }
}

.controls-section {
  .control-item {
    margin-bottom: 20px;
    .control-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      span { font-size: 13px; color: $text-secondary; font-weight: 600; }
      .value { color: $primary; font-weight: 800; small { font-weight: 400; margin-left: 2px; } }
    }
  }
}

.bubbles {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  &::before {
    content: '';
    position: absolute;
    width: 4px; height: 4px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    animation: bubble 2s infinite;
  }
}

@keyframes bubble {
  0% { transform: translateY(100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(0); opacity: 0; }
}
</style>
