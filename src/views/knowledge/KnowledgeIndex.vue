<template>
  <div class="knowledge-index">
    <ContentHeader title="病害知识库" show-back />

    <!-- 面包屑 -->
    <div class="breadcrumb-bar">
      <template v-for="(crumb, idx) in store.breadcrumbs" :key="crumb.level">
        <span v-if="idx > 0" class="crumb-sep">/</span>
        <span
          v-if="idx < store.breadcrumbs.length - 1"
          class="crumb-link"
          @click="store.navigateToLevel(crumb.level)"
        >{{ crumb.label }}</span>
        <span v-else class="crumb-current">{{ crumb.label }}</span>
      </template>
      <span class="crumb-spacer" />
      <el-button text size="small" :icon="Search" @click="goSearch">搜索</el-button>
    </div>

    <!-- Level 1: category 卡片 -->
    <div v-if="store.currentLevel === 1" class="card-section">
      <div v-if="store.loading" v-loading="true" class="loading-center" />
      <div v-else-if="store.categories.length > 0" class="card-grid">
        <div
          v-for="cat in store.categories"
          :key="cat"
          class="nav-card"
          @click="store.selectCategory(cat)"
        >
          <span class="nav-icon">{{ categoryIcon(cat) }}</span>
          <span class="nav-label">{{ cat }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无分类数据" />
    </div>

    <!-- Level 2: crop_name 卡片 -->
    <div v-else-if="store.currentLevel === 2" class="card-section">
      <div v-if="store.loading" v-loading="true" class="loading-center" />
      <div v-else-if="store.cropNames.length > 0" class="card-grid">
        <div
          v-for="name in store.cropNames"
          :key="name"
          class="nav-card"
          @click="store.selectCropName(name)"
        >
          <span class="nav-icon">{{ cropIcon(name) }}</span>
          <span class="nav-label">{{ name }}</span>
        </div>
      </div>
      <el-empty v-else description="该分类下暂无作物" />
    </div>

    <!-- Level 3: disease 列表 -->
    <div v-else class="disease-section">
      <div v-if="store.loading" v-loading="true" class="loading-center" />
      <template v-else>
        <div v-if="store.diseases.length > 0" class="disease-list">
          <template v-for="disease in store.diseases" :key="disease.id">
            <DiseaseCard
              :disease="disease"
              :expanded="store.expandedDiseaseId === disease.id"
              @click="store.toggleDiseaseExpand(disease.id)"
            />
            <Transition name="detail-slide">
              <DiseaseDetail
                v-if="store.expandedDiseaseId === disease.id"
                :disease="disease"
              />
            </Transition>
          </template>
        </div>
        <el-empty v-else description="该作物下暂无病害数据" />
        <div v-if="store.diseasesTotal > store.pageSize" class="pagination-wrap">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="store.diseasesTotal"
            :page-size="store.pageSize"
            :current-page="store.currentPage"
            @current-change="store.changePage"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import DiseaseCard from '@/components/knowledge/DiseaseCard.vue'
import DiseaseDetail from '@/components/knowledge/DiseaseDetail.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const store = useKnowledgeStore()
const router = useRouter()

onMounted(() => {
  if (store.currentLevel === 1) {
    store.fetchCategories()
  }
})

const goSearch = () => {
  router.push({ name: 'knowledgeSearch' })
}

const categoryIcon = (cat) => {
  const map = { '真菌': '🍄', '细菌': '🦠', '病毒': '🧬', '虫害': '🐛', '生理性': '🌡️' }
  return map[cat] || '🔬'
}

const cropIcon = (name) => {
  const map = {
    '小麦': '🌾', '水稻': '🌾', '玉米': '🌽', '番茄': '🍅', '黄瓜': '🥒',
    '辣椒': '🌶️', '草莓': '🍓', '苹果': '🍎', '葡萄': '🍇', '白菜': '🥬',
  }
  return map[name] || '🌱'
}
</script>

<style lang="scss" scoped>
.knowledge-index {
  padding-bottom: 20px;
}

// 面包屑
.breadcrumb-bar {
  display: flex;
  align-items: center;
  padding: 8px 24px 16px;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 4px;

  @include mobile {
    padding: 8px 16px 16px;
  }
}

.crumb-sep {
  color: $text-tertiary;
  margin: 0 2px;
}

.crumb-link {
  color: $primary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    opacity: 0.8;
  }
}

.crumb-current {
  color: $text-primary;
  font-weight: 600;
}

.crumb-spacer {
  flex: 1;
}

// 卡片区域
.card-section {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 10px;
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

.nav-icon {
  font-size: 32px;
}

.nav-label {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

// 病害列表
.disease-section {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.disease-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// DiseaseDetail 展开动画
.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.detail-slide-enter-from,
.detail-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.detail-slide-enter-to,
.detail-slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}

.loading-center {
  min-height: 200px;
}
</style>
