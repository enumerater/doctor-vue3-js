<template>
  <PageLayout :title="store.currentDisease?.name || '病害详情'" :showBack="true">
    <div class="disease-detail" v-if="store.currentDisease">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">所属作物</span>
          <span class="info-value">{{ store.currentDisease.cropName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">病害分类</span>
          <span class="info-value">
            <span class="category-tag" :class="'cat-' + store.currentDisease.category">
              {{ store.currentDisease.category }}
            </span>
          </span>
        </div>
        <div class="info-row" v-if="store.currentDisease.severity">
          <span class="info-label">严重程度</span>
          <span class="info-value">
            <span class="severity-tag" :class="'sev-' + store.currentDisease.severity">
              {{ store.currentDisease.severity }}
            </span>
          </span>
        </div>
      </div>

      <!-- Tab 页面 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="52" class="detail-tabs">
        <!-- 症状 -->
        <van-tab title="症状识别">
          <div class="tab-content">
            <div class="section-block">
              <p class="text-content">{{ store.currentDisease.symptoms?.text }}</p>
            </div>
            <div v-if="store.currentDisease.symptoms?.images?.length" class="images-section">
              <h4 class="sub-title">典型症状图片</h4>
              <van-swipe :autoplay="3000" class="symptom-swipe">
                <van-swipe-item v-for="(img, i) in store.currentDisease.symptoms.images" :key="i">
                  <img :src="img" class="symptom-img" />
                </van-swipe-item>
              </van-swipe>
            </div>
          </div>
        </van-tab>

        <!-- 发病条件 -->
        <van-tab title="发病条件">
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
        </van-tab>

        <!-- 防治方法 -->
        <van-tab title="防治方法">
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
        </van-tab>

        <!-- 推荐用药 -->
        <van-tab title="用药指南">
          <div class="tab-content">
            <DiseaseDrugs :drugs="store.currentDisease.drugs" />
          </div>
        </van-tab>

        <!-- 相似病害 -->
        <van-tab title="易混淆">
          <div class="tab-content">
            <SimilarDiseases
              :diseases="store.currentDisease.similarDiseases"
              @select="goSimilar"
            />
            <van-empty v-if="!store.currentDisease.similarDiseases?.length" description="暂无相似病害数据" />
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-loading v-else-if="store.loading" class="loading-center" />
    <van-empty v-else description="未找到该病害信息" />
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/shared/PageLayout.vue'
import DiseaseDrugs from '@/components/knowledge/DiseaseDrugs.vue'
import SimilarDiseases from '@/components/knowledge/SimilarDiseases.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const route = useRoute()
const router = useRouter()
const store = useKnowledgeStore()
const activeTab = ref(0)

onMounted(() => {
  store.fetchDiseaseDetail(route.params.diseaseId)
})

const goSimilar = (disease) => {
  router.push({ name: 'knowledgeDetail', params: { diseaseId: disease.id } })
}
</script>

<style lang="scss" scoped>
.disease-detail {
  padding-bottom: 20px;
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

.category-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;

  &.cat-真菌 { background: #f0fdf4; color: #166534; }
  &.cat-细菌 { background: #fef3c7; color: #92400e; }
  &.cat-病毒 { background: #fce7f3; color: #9d174d; }
  &.cat-虫害 { background: #fef9c3; color: #854d0e; }
  &.cat-生理性 { background: #e0f2fe; color: #075985; }
}

.severity-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;

  &.sev-轻 { background: #dcfce7; color: #166534; }
  &.sev-中 { background: #fef3c7; color: #92400e; }
  &.sev-重 { background: #fee2e2; color: #991b1b; }
}

// Tabs
.detail-tabs {
  margin: 0 -20px;

  :deep(.van-tabs__nav) {
    background: $bg-card;
  }

  :deep(.van-tab--active) {
    color: $primary;
  }

  :deep(.van-tabs__line) {
    background: $primary;
  }
}

.tab-content {
  padding: 16px 20px;
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
.symptom-swipe {
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
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
</style>
