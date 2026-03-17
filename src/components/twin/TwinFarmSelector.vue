<template>
  <div class="twin-farm-selector" v-if="farms.length > 1">
    <div class="selector-trigger" @click="open = !open">
      <div class="current-farm">
        <span class="farm-icon">🏡</span>
        <div class="farm-info">
          <span class="farm-name">{{ currentName }}</span>
          <span class="farm-location" v-if="currentLocation">{{ currentLocation }}</span>
        </div>
      </div>
      <el-icon class="arrow" :class="{ rotated: open }"><ArrowDown /></el-icon>
    </div>

    <Transition name="dropdown">
      <div class="selector-dropdown" v-if="open">
        <div
          v-for="farm in farms"
          :key="farm.id"
          class="dropdown-item"
          :class="{ active: farm.id === modelValue }"
          @click="selectFarm(farm)"
        >
          <span class="item-name">{{ farm.name }}</span>
          <span class="item-location">{{ farm.location || '' }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  farms: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  currentName: { type: String, default: '' },
  currentLocation: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)

function selectFarm(farm) {
  open.value = false
  if (farm.id !== props.modelValue) {
    emit('update:modelValue', farm.id)
  }
}
</script>

<style lang="scss" scoped>
.twin-farm-selector {
  position: absolute;
  top: 60px;
  left: 16px;
  z-index: 10;
  min-width: 200px;
}

.selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;

  &:hover {
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.current-farm {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.farm-icon {
  font-size: 20px;
}

.farm-info {
  display: flex;
  flex-direction: column;
}

.farm-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.farm-location {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.arrow {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;

  &.rotated {
    transform: rotate(180deg);
  }
}

.selector-dropdown {
  margin-top: 6px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: background 0.15s;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e8f5e9;
  }

  .item-name {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .item-location {
    font-size: 11px;
    color: #999;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
