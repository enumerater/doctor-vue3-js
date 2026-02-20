<template>
  <div class="knowledge-index">
    <ContentHeader title="病害知识库" show-back />

    <!-- 搜索栏 -->
    <div class="search-area">
      <el-input
        v-model="searchVal"
        placeholder="搜索病害名称、作物、类型..."
        clearable
        :prefix-icon="Search"
        size="large"
        @keyup.enter="handleSearch(searchVal)"
        @focus="goSearch"
        class="search-bar"
      />
    </div>

    <!-- 季节风险提示 -->
    <div v-if="store.seasonalRisks.length > 0" class="risk-banner">
      <div class="risk-header">
        <span class="risk-icon">⚠️</span>
        <span class="risk-title">当季病害预警</span>
      </div>
      <div class="risk-list">
        <div v-for="risk in store.seasonalRisks" :key="risk.diseaseId" class="risk-item"
          @click="goDetail(risk.diseaseId)">
          <div class="risk-name">
            <span class="risk-crop">{{ risk.cropName }}</span>
            {{ risk.diseaseName }}
          </div>
          <div class="risk-desc">{{ risk.description }}</div>
        </div>
      </div>
    </div>

    <!-- 作物分类网格 -->
    <div class="crop-section">
      <h3 class="section-title">按作物浏览</h3>
      <div class="crop-grid" v-if="store.crops.length > 0" v-loading="false">
        <div v-for="crop in store.crops" :key="crop.name" class="crop-card" @click="goCropList(crop.name)">
          <span class="crop-icon">{{ crop.icon }}</span>
          <span class="crop-name">{{ crop.name }}</span>
          <span class="crop-count">{{ crop.diseaseCount }}种病害</span>
        </div>
      </div>
      <div v-else-if="store.loading" v-loading="true" class="loading-center" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const store = useKnowledgeStore()
const router = useRouter()
const searchVal = ref('')

onMounted(() => {
  store.fetchCrops()
  store.fetchSeasonalRisks()
})

const goSearch = () => {
  router.push({ name: 'knowledgeSearch' })
}

const handleSearch = (val) => {
  router.push({ name: 'knowledgeSearch', query: { q: val } })
}

const goCropList = (cropName) => {
  router.push({ name: 'knowledgeCrop', params: { cropName } })
}

const goDetail = (diseaseId) => {
  router.push({ name: 'knowledgeDetail', params: { diseaseId } })
}
</script>

<style lang="scss" scoped>
.knowledge-index {
  padding-bottom: 20px;
}

.search-area {
  padding: 0 24px 16px;

  @include mobile {
    padding: 0 16px 16px;
  }
}

.search-bar {
  :deep(.el-input__wrapper) {
    border-radius: $radius-xl;
    background: $bg-card;
    border: 1px solid $border;
    box-shadow: none;
  }
}

// 风险预警
.risk-banner {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: $radius-md;
  padding: 14px 16px;
  margin: 0 24px 20px;
  border: 1px solid #fcd34d;

  @include mobile {
    margin: 0 16px 20px;
  }
}

.risk-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.risk-icon {
  font-size: 16px;
}

.risk-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  &:active {
    transform: scale(0.98);
  }
}

.risk-name {
  font-size: 13px;
  font-weight: 600;
  color: #78350f;
  margin-bottom: 3px;
}

.risk-crop {
  background: #92400e;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 6px;
  margin-right: 6px;
  font-weight: 500;
}

.risk-desc {
  font-size: 12px;
  color: #a16207;
  line-height: 1.4;
}

// 作物分类
.crop-section {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 14px 0;
  }
}

.crop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.crop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: rgba($primary, 0.3);
    box-shadow: $shadow-sm;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }
}

.crop-icon {
  font-size: 32px;
}

.crop-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.crop-count {
  font-size: 11px;
  color: $text-tertiary;
}

.loading-center {
  min-height: 200px;
}
</style>
