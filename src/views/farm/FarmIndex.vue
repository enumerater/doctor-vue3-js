<template>
  <div class="farm-index-page">
    <div class="index-header">
      <div class="header-content">
        <h1 class="welcome-title">我的农场</h1>
        <p class="welcome-subtitle">管理您的耕种区域，开启智慧农业之旅</p>
      </div>
      <el-button type="primary" class="create-btn" @click="goCreate">
        <el-icon><Plus /></el-icon> <span>创建新农场</span>
      </el-button>
    </div>

    <!-- Quick Insights -->
    <div class="insights-row" v-if="store.farms.length > 0">
      <div class="insight-card">
        <div class="insight-icon"><el-icon><HomeFilled /></el-icon></div>
        <div class="insight-info">
          <span class="insight-value">{{ store.farms.length }}</span>
          <span class="insight-label">农场总数</span>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-icon area"><el-icon><Compass /></el-icon></div>
        <div class="insight-info">
          <span class="insight-value">{{ totalArea }}</span>
          <span class="insight-label">总面积(亩)</span>
        </div>
      </div>
      <div class="insight-card">
        <div class="insight-icon plot"><el-icon><Grid /></el-icon></div>
        <div class="insight-info">
          <span class="insight-value">{{ totalPlots }}</span>
          <span class="insight-label">总地块数</span>
        </div>
      </div>
    </div>

    <!-- Farm List -->
    <div class="farm-list-section">
      <div class="farm-list" v-if="store.farms.length > 0">
        <FarmCard
          v-for="farm in store.farms"
          :key="farm.id"
          :farm="farm"
          @click="goDetail(farm)"
        />
      </div>

      <!-- Loading State -->
      <div v-else-if="store.loading" class="loading-container">
        <div class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-card"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-container">
        <div class="empty-visual">
          <div class="empty-icon">🏠</div>
          <div class="empty-pulse"></div>
        </div>
        <h3>开启您的第一个农场</h3>
        <p>创建农场并添加地块，以便我们为您提供精准的种植建议和诊断服务</p>
        <el-button type="primary" size="large" @click="goCreate" class="empty-action-btn">
          立即创建农场
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, HomeFilled, Compass, Grid } from '@element-plus/icons-vue'
import FarmCard from '@/components/farm/FarmCard.vue'
import { useFarmStore } from '@/stores/farm'

const store = useFarmStore()
const router = useRouter()

onMounted(() => {
  store.fetchFarms()
})

const totalArea = computed(() => {
  return store.farms.reduce((sum, f) => sum + (Number(f.area) || 0), 0).toFixed(1)
})

const totalPlots = computed(() => {
  return store.farms.reduce((sum, f) => sum + (Number(f.plotCount) || 0), 0)
})

const goCreate = () => {
  router.push({ name: 'farmCreate' })
}

const goDetail = (farm) => {
  router.push({ name: 'farmDetail', params: { farmId: farm.id } })
}
</script>

<style lang="scss" scoped>
.farm-index-page {
  padding: 24px;
  max-width: $content-max-width;
  margin: 0 auto;
  min-height: calc(100vh - $header-height);

  @include mobile {
    padding: 16px;
  }
}

.index-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}

.welcome-title {
  font-size: 28px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 15px;
  color: $text-tertiary;
  margin: 0;
}

.create-btn {
  height: 48px;
  padding: 0 24px;
  border-radius: 14px;
  font-weight: 700;
  background-color: $primary !important;
  border-color: $primary !important;
  box-shadow: $shadow-sm;
  transition: $transition-smooth;

  span { margin-left: 8px; }

  &:hover {
    background-color: $primary-hover !important;
    border-color: $primary-hover !important;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  @include mobile {
    width: 100%;
  }
}

.insights-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;

  @include mobile {
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }
}

.insight-card {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1px solid $border;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-sm;
    border-color: rgba($primary, 0.2);
  }

  .insight-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $primary-light;
    color: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;

    &.area { background: #fef3c7; color: #d97706; }
    &.plot { background: #e0f2fe; color: #0284c7; }
  }

  .insight-info {
    display: flex;
    flex-direction: column;
  }

  .insight-value {
    font-size: 24px;
    font-weight: 800;
    color: $text-primary;
    line-height: 1;
  }

  .insight-label {
    font-size: 13px;
    color: $text-tertiary;
    font-weight: 500;
    margin-top: 4px;
  }
}

.farm-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-container {
  padding: 20px 0;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  height: 120px;
  background: $bg-main;
  border-radius: $radius-lg;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.empty-state-container {
  text-align: center;
  padding: 60px 20px;
  max-width: 500px;
  margin: 0 auto;

  .empty-visual {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-light;
    border-radius: 30px;
    font-size: 50px;
  }

  .empty-pulse {
    position: absolute;
    inset: -10px;
    border-radius: 40px;
    border: 2px dashed rgba($primary, 0.2);
    animation: rotate 20s linear infinite;
  }

  h3 { font-size: 22px; font-weight: 700; color: $text-primary; margin: 0 0 12px; }
  p { color: $text-tertiary; font-size: 15px; line-height: 1.6; margin: 0 0 32px; }

  .empty-action-btn {
    border-radius: 16px;
    height: 54px;
    padding: 0 40px;
    font-weight: 700;
    box-shadow: $shadow-md;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
