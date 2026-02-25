<template>
  <div class="farm-detail-page">
    <ContentHeader :title="store.currentFarm?.name || '农场详情'" :showBack="true">
      <template #actions>
        <el-button
          type="danger"
          text
          class="action-btn danger"
          @click="handleDeleteFarm"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </template>
    </ContentHeader>

    <div class="farm-detail" v-if="store.currentFarm">
      <!-- 农场概况 -->
      <div class="overview-card">
        <div class="overview-stats">
          <div class="stat-item">
            <span class="stat-value">{{ farmArea }}</span>
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
          <el-icon><Location /></el-icon> {{ store.currentFarm.location }}
        </div>
      </div>

      <!-- 地块列表 -->
      <div class="plot-section">
        <div class="section-header">
          <h3 class="section-title">地块管理</h3>
          <el-button type="primary" text @click="goAddPlot">
            <el-icon><Plus /></el-icon> 添加地块
          </el-button>
        </div>

        <div class="plot-list" v-if="store.currentFarm.plots?.length > 0">
          <PlotCard
            v-for="plot in store.currentFarm.plots"
            :key="plot.id"
            :plot="plot"
            @click="goPlotDetail(plot)"
          />
        </div>

        <el-empty v-else description="还没有添加地块" />
      </div>
    </div>

    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>
    <el-empty v-else description="未找到农场信息" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Location, Plus } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
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

const farmArea = computed(() => {
  const plots = store.currentFarm?.plots || []
  const sum = plots.reduce((s, p) => s + (Number(p.area) || 0), 0)
  return parseFloat(sum.toFixed(1))
})

const goAddPlot = () => {
  router.push({ name: 'plotCreate', params: { farmId } })
}

const goPlotDetail = (plot) => {
  router.push({ name: 'plotDetail', params: { farmId, plotId: plot.id } })
}

const handleDeleteFarm = async () => {
  try {
    await ElMessageBox.confirm(
      '删除农场将同时删除所有关联地块，此操作不可恢复',
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await store.deleteFarm(farmId)
    ElMessage.success('已删除')
    router.replace({ name: 'farm' })
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.farm-detail-page {
  padding-bottom: 20px;
}

.farm-detail {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.plot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}
</style>
