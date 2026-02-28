<template>
  <div class="farm-detail-page">
    <ContentHeader :title="store.currentFarm?.name || '农场详情'" :showBack="true">
      <template #actions>
        <el-dropdown trigger="click">
          <el-button text class="action-btn more">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #footer>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleDeleteFarm" class="danger-item">
                <el-icon><Delete /></el-icon> 删除农场
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ContentHeader>

    <div class="farm-content" v-if="store.currentFarm">
      <!-- Dashboard Overview -->
      <div class="dashboard-grid">
        <div class="summary-card main">
          <div class="summary-content">
            <h2 class="welcome-text">农场概览</h2>
            <p class="location-text" v-if="store.currentFarm.location">
              <el-icon><Location /></el-icon> {{ store.currentFarm.location }}
            </p>
            <div class="quick-stats">
              <div class="stat-pill">
                <span class="pill-label">总地块</span>
                <span class="pill-value">{{ store.currentFarm.plots?.length || 0 }}</span>
              </div>
              <div class="stat-pill">
                <span class="pill-label">种植面积</span>
                <span class="pill-value">{{ farmArea }}<small>亩</small></span>
              </div>
            </div>
          </div>
          <div class="summary-decoration">🏡</div>
        </div>

        <div class="stats-mini-grid">
          <div class="mini-card">
            <div class="mini-icon crop"><el-icon><Collection /></el-icon></div>
            <div class="mini-info">
              <span class="mini-value">{{ cropCount }}</span>
              <span class="mini-label">作物种类</span>
            </div>
          </div>
          <div class="mini-card">
            <div class="mini-icon stage"><el-icon><TrendCharts /></el-icon></div>
            <div class="mini-info">
              <span class="mini-value">{{ activeStagesCount }}</span>
              <span class="mini-label">生长阶段</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Plot Management -->
      <div class="section-container">
        <div class="section-header">
          <div class="section-title-group">
            <h3 class="section-title">地块管理</h3>
            <span class="section-subtitle">管理您的种植区域和作物状态</span>
          </div>
          <el-button type="primary" class="add-plot-btn" @click="goAddPlot">
            <el-icon><Plus /></el-icon> <span>添加新地块</span>
          </el-button>
        </div>

        <div class="plot-list-container" v-if="store.currentFarm.plots?.length > 0">
          <div class="plot-grid">
            <PlotCard
              v-for="plot in store.currentFarm.plots"
              :key="plot.id"
              :plot="plot"
              @click="goPlotDetail(plot)"
            />
          </div>
        </div>

        <div v-else class="empty-plots">
          <div class="empty-icon">🌱</div>
          <h4>还没有添加地块</h4>
          <p>添加地块来开始记录作物的生长过程</p>
          <el-button type="primary" plain @click="goAddPlot">立即添加</el-button>
        </div>
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
import { Delete, Location, Plus, MoreFilled, Collection, TrendCharts } from '@element-plus/icons-vue'
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

const activeStagesCount = computed(() => {
  const plots = store.currentFarm?.plots || []
  return plots.filter(p => !!p.growthStage).length
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
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

.farm-content {
  padding: 0 24px;
  max-width: $content-max-width;
  margin: 0 auto;

  @include mobile { padding: 0 16px; }
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border: 1px solid $border;
  color: $text-secondary;
  transition: $transition-fast;

  &:hover { color: $primary; border-color: $primary; }
}

.danger-item { color: $danger; }

// Dashboard Grid
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.summary-card {
  position: relative;
  background: linear-gradient(135deg, $primary, $primary-hover);
  border-radius: $radius-lg;
  padding: 24px;
  color: white;
  overflow: hidden;
  box-shadow: $shadow-md;

  .summary-content {
    position: relative;
    z-index: 2;
  }

  .welcome-text {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .location-text {
    font-size: 14px;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
  }

  .quick-stats {
    display: flex;
    gap: 12px;
  }

  .stat-pill {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(4px);
    padding: 8px 16px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;

    .pill-label { font-size: 11px; opacity: 0.8; margin-bottom: 2px; }
    .pill-value { 
      font-size: 18px; 
      font-weight: 700;
      small { font-size: 12px; margin-left: 2px; }
    }
  }

  .summary-decoration {
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 100px;
    opacity: 0.15;
    z-index: 1;
    transform: rotate(-10deg);
  }
}

.stats-mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @include mobile { gap: 12px; }
}

.mini-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 16px;
  border: 1px solid $border;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  transition: $transition-fast;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-sm;
    border-color: rgba($primary, 0.2);
  }

  .mini-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;

    &.crop { background: #fef3c7; color: #d97706; }
    &.stage { background: #dcfce7; color: #16a34a; }
  }

  .mini-value {
    display: block;
    font-size: 22px;
    font-weight: 800;
    color: $text-primary;
    line-height: 1;
    margin-bottom: 4px;
  }

  .mini-label {
    font-size: 12px;
    color: $text-tertiary;
    font-weight: 500;
  }
}

// Section Header
.section-container {
  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .section-title {
    font-size: 20px;
    font-weight: 800;
    color: $text-primary;
    margin: 0 0 4px;
  }

  .section-subtitle {
    font-size: 13px;
    color: $text-tertiary;
  }

  .add-plot-btn {
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    font-weight: 600;
    background-color: $primary !important;
    border-color: $primary !important;
    box-shadow: $shadow-sm;
    
    span { margin-left: 6px; }

    &:hover {
      background-color: $primary-hover !important;
      border-color: $primary-hover !important;
    }

    @include mobile { width: 100%; }
  }
}

.plot-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.empty-plots {
  background: $bg-card;
  border-radius: $radius-lg;
  border: 2px dashed $border;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h4 { font-size: 18px; margin: 0 0 8px; color: $text-primary; }
  p { color: $text-tertiary; font-size: 14px; margin: 0 0 24px; }
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 200px;
}
</style>
