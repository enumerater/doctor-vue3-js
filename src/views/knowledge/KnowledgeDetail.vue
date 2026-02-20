<template>
  <div class="disease-detail-page">
    <ContentHeader :title="store.currentDisease?.name || '病害详情'" show-back />

    <div class="page-body" v-if="store.currentDisease">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">所属作物</span>
          <span class="info-value">{{ store.currentDisease.cropName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">病害分类</span>
          <span class="info-value">
            <el-tag :type="categoryTagType" size="small" round effect="light">
              {{ store.currentDisease.category }}
            </el-tag>
          </span>
        </div>
        <div class="info-row" v-if="store.currentDisease.severity">
          <span class="info-label">严重程度</span>
          <span class="info-value">
            <el-tag :type="severityTagType" size="small" round effect="light">
              {{ store.currentDisease.severity }}
            </el-tag>
          </span>
        </div>
      </div>

      <!-- Tab 页面 -->
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 症状 -->
        <el-tab-pane label="症状识别" name="symptoms">
          <div class="tab-content">
            <div class="section-block">
              <p class="text-content">{{ store.currentDisease.symptoms?.text }}</p>
            </div>
            <div v-if="store.currentDisease.symptoms?.images?.length" class="images-section">
              <h4 class="sub-title">典型症状图片</h4>
              <el-carousel :interval="3000" height="200px" class="symptom-carousel">
                <el-carousel-item v-for="(img, i) in store.currentDisease.symptoms.images" :key="i">
                  <img :src="img" class="symptom-img" />
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
        </el-tab-pane>

        <!-- 发病条件 -->
        <el-tab-pane label="发病条件" name="conditions">
          <div class="tab-content">
            <div class="conditions-grid" v-if="store.currentDisease.conditions">
              <div class="cond-item">
                <span class="cond-icon">🌡️</span>
                <span class="cond-label">适宜温度</span>
                <span class="cond-value">{{ store.currentDisease.conditions.temperature }}</span>
              </div>
              <div class="cond-item">
                <span class="cond-icon">💧</span>
                <span class="cond-label">湿度条件</span>
                <span class="cond-value">{{ store.currentDisease.conditions.humidity }}</span>
              </div>
              <div class="cond-item">
                <span class="cond-icon">📅</span>
                <span class="cond-label">高发季节</span>
                <span class="cond-value">{{ store.currentDisease.conditions.season }}</span>
              </div>
              <div class="cond-item">
                <span class="cond-icon">🌱</span>
                <span class="cond-label">易感阶段</span>
                <span class="cond-value">{{ store.currentDisease.conditions.stage }}</span>
              </div>
            </div>
            <div class="section-block" v-if="store.currentDisease.transmission">
              <h4 class="sub-title">传播途径</h4>
              <p class="text-content">{{ store.currentDisease.transmission }}</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- 防治方法 -->
        <el-tab-pane label="防治方法" name="prevention">
          <div class="tab-content" v-if="store.currentDisease.prevention">
            <div class="prev-section">
              <div class="prev-item">
                <div class="prev-header">
                  <span class="prev-icon agri">🌾</span>
                  <span class="prev-title">农业防治</span>
                </div>
                <p class="prev-text">{{ store.currentDisease.prevention.agricultural }}</p>
              </div>
              <div class="prev-item">
                <div class="prev-header">
                  <span class="prev-icon chem">🧪</span>
                  <span class="prev-title">化学防治</span>
                </div>
                <p class="prev-text">{{ store.currentDisease.prevention.chemical }}</p>
              </div>
              <div class="prev-item">
                <div class="prev-header">
                  <span class="prev-icon bio">🦠</span>
                  <span class="prev-title">生物防治</span>
                </div>
                <p class="prev-text">{{ store.currentDisease.prevention.biological }}</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 推荐用药 -->
        <el-tab-pane label="用药指南" name="drugs">
          <div class="tab-content">
            <DiseaseDrugs :drugs="store.currentDisease.drugs" />
          </div>
        </el-tab-pane>

        <!-- 相似病害 -->
        <el-tab-pane label="易混淆" name="similar">
          <div class="tab-content">
            <SimilarDiseases
              :diseases="store.currentDisease.similarDiseases"
              @select="goSimilar"
            />
            <el-empty v-if="!store.currentDisease.similarDiseases?.length" description="暂无相似病害数据" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else-if="store.loading" v-loading="true" class="loading-center" />
    <el-empty v-else description="未找到该病害信息" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import DiseaseDrugs from '@/components/knowledge/DiseaseDrugs.vue'
import SimilarDiseases from '@/components/knowledge/SimilarDiseases.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const route = useRoute()
const router = useRouter()
const store = useKnowledgeStore()
const activeTab = ref('symptoms')

onMounted(() => {
  store.fetchDiseaseDetail(route.params.diseaseId)
})

const categoryTagType = computed(() => {
  const map = { '真菌': 'success', '细菌': 'warning', '病毒': 'danger', '虫害': 'warning', '生理性': 'info' }
  return map[store.currentDisease?.category] || ''
})

const severityTagType = computed(() => {
  const map = { '轻': 'success', '中': 'warning', '重': 'danger' }
  return map[store.currentDisease?.severity] || ''
})

const goSimilar = (disease) => {
  router.push({ name: 'knowledgeDetail', params: { diseaseId: disease.id } })
}
</script>

<style lang="scss" scoped>
.disease-detail-page {
  padding-bottom: 20px;
}

.page-body {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

// 基本信息卡片
.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid $border;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba($border, 0.5);
  }
}

.info-label {
  font-size: 13px;
  color: $text-tertiary;
}

.info-value {
  font-size: 14px;
  color: $text-primary;
  font-weight: 500;
}

// Tabs
.detail-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: $border;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $primary;
  }

  :deep(.el-tabs__item) {
    color: $text-secondary;
    font-size: 14px;

    &.is-active {
      color: $primary;
    }

    &:hover {
      color: $primary;
    }
  }
}

.tab-content {
  padding: 16px 0;
}

.sub-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin: 16px 0 10px;
}

.text-content {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.7;
  margin: 0;
}

// 症状图片
.symptom-carousel {
  border-radius: $radius-sm;
  overflow: hidden;
  margin-top: 10px;

  .symptom-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
}

// 发病条件
.conditions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.cond-item {
  background: $bg-main;
  border-radius: $radius-sm;
  padding: 12px;
  border: 1px solid $border;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cond-icon { font-size: 20px; }
.cond-label { font-size: 11px; color: $text-tertiary; }
.cond-value { font-size: 13px; color: $text-primary; font-weight: 500; }

// 防治方法
.prev-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.prev-item {
  background: $bg-main;
  border-radius: $radius-sm;
  padding: 14px;
  border: 1px solid $border;
}

.prev-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.prev-icon { font-size: 18px; }
.prev-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.prev-text {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.7;
  margin: 0;
}

.loading-center {
  min-height: 200px;
}
</style>
