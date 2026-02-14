<template>
  <div class="region-selector">
    <div class="panel-title">
      <span class="icon">&#9673;</span>
      地区选择
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索地区..."
        class="search-input"
      />
    </div>

    <!-- 面包屑 -->
    <div class="breadcrumb" v-if="store.regionPath.length > 1">
      <span
        v-for="(item, idx) in store.regionPath"
        :key="item.code"
        class="crumb"
        :class="{ active: idx === store.regionPath.length - 1 }"
        @click="navigateTo(item, idx)"
      >
        {{ item.name }}
        <span v-if="idx < store.regionPath.length - 1" class="sep">/</span>
      </span>
    </div>

    <!-- 地区树列表 -->
    <div class="region-list">
      <div
        v-for="node in filteredNodes"
        :key="node.code"
        class="region-item"
        :class="{ selected: node.code === store.regionCode }"
        @click="selectRegion(node)"
      >
        <span class="region-name">{{ node.name }}</span>
        <span v-if="node.children && node.children.length" class="arrow">&#8250;</span>
      </div>
      <div v-if="filteredNodes.length === 0" class="empty">暂无匹配地区</div>
    </div>

    <!-- 重置 -->
    <button class="btn-reset" @click="resetAll">
      &#8634; 重置为全国
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { getRegionTree } from '@/axios/dashboard'

const store = useDashboardStore()
const searchText = ref('')
const regionTree = ref([])
const currentChildren = ref([])

onMounted(async () => {
  regionTree.value = await getRegionTree()
  currentChildren.value = regionTree.value
})

const filteredNodes = computed(() => {
  if (!searchText.value.trim()) return currentChildren.value
  const q = searchText.value.trim().toLowerCase()
  return flatSearch(regionTree.value, q)
})

function flatSearch(nodes, query) {
  const result = []
  for (const node of nodes) {
    if (node.name.toLowerCase().includes(query)) result.push(node)
    if (node.children) result.push(...flatSearch(node.children, query))
  }
  return result
}

function selectRegion(node) {
  store.setRegion(node.code, node.name)
  if (node.children && node.children.length) {
    currentChildren.value = node.children
  }
}

function navigateTo(item, idx) {
  store.setRegion(item.code, item.name)
  // 回溯到对应层级
  let nodes = regionTree.value
  for (let i = 0; i < idx; i++) {
    const found = nodes.find((n) => n.code === store.regionPath[i + 1]?.code)
    if (found?.children) nodes = found.children
  }
  if (idx === 0) currentChildren.value = regionTree.value
  else {
    const found = findNode(regionTree.value, item.code)
    currentChildren.value = found?.children || regionTree.value
  }
}

function findNode(nodes, code) {
  for (const n of nodes) {
    if (n.code === code) return n
    if (n.children) {
      const r = findNode(n.children, code)
      if (r) return r
    }
  }
  return null
}

function resetAll() {
  store.resetRegion()
  currentChildren.value = regionTree.value
  searchText.value = ''
}
</script>

<style lang="scss" scoped>
@use '@/styles/dashboard' as *;

.region-selector {
  @include dash-card;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: $dash-accent;
  display: flex;
  align-items: center;
  gap: 6px;

  .icon { font-size: 10px; }
}

.search-box {
  .search-input {
    width: 100%;
    padding: 7px 10px;
    background: $dash-bg-base;
    border: 1px solid $dash-border;
    border-radius: $dash-radius-sm;
    color: $dash-text-primary;
    font-size: 12px;
    outline: none;
    transition: $dash-transition;

    &::placeholder { color: $dash-text-muted; }
    &:focus { border-color: $dash-accent; box-shadow: 0 0 0 2px rgba($dash-accent, 0.15); }
  }
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 11px;
  color: $dash-text-muted;

  .crumb {
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    transition: $dash-transition-fast;

    &:hover { color: $dash-accent; background: rgba($dash-accent, 0.08); }
    &.active { color: $dash-accent; font-weight: 600; }
  }

  .sep { margin: 0 2px; color: $dash-text-muted; }
}

.region-list {
  flex: 1;
  overflow-y: auto;
  @include dash-scrollbar;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: $dash-radius-sm;
  cursor: pointer;
  font-size: 13px;
  color: $dash-text-secondary;
  transition: $dash-transition-fast;

  &:hover {
    background: $dash-bg-elevated;
    color: $dash-text-primary;
  }

  &.selected {
    background: rgba($dash-accent, 0.12);
    color: $dash-accent;
    font-weight: 500;
  }

  .arrow {
    font-size: 16px;
    color: $dash-text-muted;
  }
}

.empty {
  text-align: center;
  color: $dash-text-muted;
  font-size: 12px;
  padding: 20px 0;
}

.btn-reset {
  padding: 6px 0;
  background: transparent;
  border: 1px solid $dash-border;
  border-radius: $dash-radius-sm;
  color: $dash-text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: $dash-transition;

  &:hover {
    border-color: $dash-accent;
    color: $dash-accent;
  }
}
</style>
