<template>
  <div class="growth-stage-select">
    <div class="stage-header">
      <el-icon><TrendCharts /></el-icon>
      <span class="header-text">当前生长阶段 ({{ cropType || '通用' }})</span>
    </div>
    
    <div class="stage-grid">
      <div
        v-for="(stage, index) in stages"
        :key="stage"
        class="stage-chip"
        :class="{ active: modelValue === stage }"
        @click="$emit('update:modelValue', stage)"
      >
        <div class="chip-number">{{ index + 1 }}</div>
        <span class="chip-text">{{ stage }}</span>
        <div class="chip-indicator" v-if="modelValue === stage">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendCharts, Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  cropType: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const stageMap = {
  小麦: ['播种', '出苗期', '分蘖期', '越冬期', '返青期', '拔节期', '抽穗期', '灌浆期', '成熟期', '收获'],
  水稻: ['播种', '秧苗期', '移栽', '分蘖期', '拔节期', '抽穗期', '灌浆期', '成熟期', '收获'],
  玉米: ['播种', '出苗期', '拔节期', '大喇叭口期', '抽雄期', '吐丝期', '灌浆期', '成熟期', '收获'],
  番茄: ['育苗', '定植', '缓苗期', '开花期', '结果期', '膨大期', '转色期', '采收期'],
  黄瓜: ['育苗', '定植', '缓苗期', '抽蔓期', '开花期', '结瓜期', '盛果期', '采收期'],
  辣椒: ['育苗', '定植', '缓苗期', '开花期', '结果期', '膨大期', '采收期'],
  草莓: ['定植', '缓苗期', '花芽分化期', '开花期', '结果期', '膨大期', '采收期'],
  苹果: ['休眠期', '萌芽期', '花期', '坐果期', '膨大期', '着色期', '成熟期', '采收'],
  葡萄: ['休眠期', '萌芽期', '展叶期', '花期', '坐果期', '膨大期', '转色期', '成熟期', '采收'],
  白菜: ['播种', '出苗期', '莲座期', '包心期', '收获'],
}

const defaultStages = ['播种', '苗期', '生长期', '花期', '结果期', '成熟期', '收获']

const stages = computed(() => stageMap[props.cropType] || defaultStages)
</script>

<style lang="scss" scoped>
.growth-stage-select {
  padding: 8px 0;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: $text-secondary;
  
  .header-text {
    font-size: 13px;
    font-weight: 600;
  }
  
  .el-icon {
    color: $primary;
    font-size: 16px;
  }
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stage-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: $bg-main;
  border: 1px solid $border;
  border-radius: 12px;
  cursor: pointer;
  transition: $transition-smooth;

  &:hover {
    border-color: rgba($primary, 0.4);
    background: $bg-card;
    transform: translateY(-2px);
  }

  &.active {
    background: linear-gradient(135deg, $primary, $primary-hover);
    border-color: $primary;
    box-shadow: 0 4px 12px rgba($primary, 0.2);
    
    .chip-number { background: rgba(255, 255, 255, 0.2); color: white; }
    .chip-text { color: white; font-weight: 700; }
  }

  &:active { transform: scale(0.96); }
}

.chip-number {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: $border;
  color: $text-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  transition: $transition-fast;
}

.chip-text {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

.chip-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  color: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
