<template>
  <div class="growth-stage-select">
    <div class="stage-label">选择生长阶段</div>
    <div class="stage-list">
      <div
        v-for="stage in stages"
        :key="stage"
        class="stage-option"
        :class="{ active: modelValue === stage }"
        @click="$emit('update:modelValue', stage)"
      >
        {{ stage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  padding: 4px 0;
}

.stage-label {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 10px;
}

.stage-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stage-option {
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 16px;
  background: $bg-main;
  border: 1px solid $border;
  color: $text-secondary;
  cursor: pointer;
  transition: $transition-fast;

  &:active { transform: scale(0.95); }

  &.active {
    background: $primary;
    border-color: $primary;
    color: #fff;
    font-weight: 500;
  }
}
</style>
