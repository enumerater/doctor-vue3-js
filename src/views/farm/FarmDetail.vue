<template>
  <PageLayout :title="store.currentFarm?.name || '农场详情'" :showBack="true">
    <template #actions>
      <button class="action-btn danger" @click="handleDeleteFarm">
        <van-icon name="delete-o" />
      </button>
    </template>

    <div class="farm-detail" v-if="store.currentFarm">
      <!-- 农场概况 -->
      <div class="overview-card">
        <div class="overview-stats">
          <div class="stat-item">
            <span class="stat-value">{{ store.currentFarm.area || 0 }}</span>
            <span class="stat-label">总面积(亩)</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ store.currentFarm.plots?.length || 0 }}</span>
            <span class="stat-label">地块数</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ cropCount }}</span>
            <span class="stat-label">作物种类</span>
          </div>
        </div>
        <div class="overview-location" v-if="store.currentFarm.location">
          <van-icon name="location-o" /> {{ store.currentFarm.location }}
        </div>
      </div>

      <!-- 地块列表 -->
      <div class="plot-section">
        <div class="section-header">
          <h3 class="section-title">地块管理</h3>
          <button class="add-plot-btn" @click="goAddPlot">
            <van-icon name="plus" /> 添加地块
          </button>
        </div>

        <div class="plot-list" v-if="store.currentFarm.plots?.length > 0">
          <PlotCard
            v-for="plot in store.currentFarm.plots"
            :key="plot.id"
            :plot="plot"
            @click="goPlotDetail(plot)"
          />
        </div>

        <van-empty v-else description="还没有添加地块" />
      </div>
    </div>

    <van-loading v-else-if="store.loading" class="loading-center" />
    <van-empty v-else description="未找到农场信息" />
  </PageLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import PageLayout from '@/components/shared/PageLayout.vue'
import PlotCard from '@/components/farm/PlotCard.vue'
import { useFarmStore } from '@/stores/farm'

const route = useRoute()
const router = useRouter()
const store = useFarmStore()

const farmId = route.params.farmId

onMounted(() => {
  store.fetchFarmDetail(farmId)
})

const cropCount = computed(() => {
  const plots = store.currentFarm?.plots || []
  return new Set(plots.map((p) => p.cropType).filter(Boolean)).size
})

const goAddPlot = () => {
  router.push({ name: 'plotCreate', params: { farmId } })
}

const goPlotDetail = (plot) => {
  router.push({ name: 'plotDetail', params: { farmId, plotId: plot.id } })
}

const handleDeleteFarm = async () => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '删除农场将同时删除所有关联地块，此操作不可恢复' })
    await store.deleteFarm(farmId)
    showSuccessToast('已删除')
    router.replace({ name: 'farm' })
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.farm-detail {
  padding-bottom: 20px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: $transition-fast;

  &.danger {
    background: #fee2e2;
    color: $danger;
  }

  &:active { transform: scale(0.9); }
}

// 概览卡片
.overview-card {
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px;
  margin-bottom: 20px;
}

.overview-stats {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: $primary;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: $text-tertiary;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: $border;
}

.overview-location {
  font-size: 13px;
  color: $text-tertiary;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba($border, 0.5);
}

// 地块区域
.plot-section {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }
}

.add-plot-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px dashed $primary;
  background: transparent;
  color: $primary;
  border-radius: $radius-sm;
  font-size: 13px;
  cursor: pointer;
  transition: $transition-fast;

  &:active { transform: scale(0.95); }
}

.plot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
</style>
