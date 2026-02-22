<template>
  <div class="diagnosis-index">
    <ContentHeader title="诊断历史">
      <template #actions>
        <el-button type="primary" size="small" @click="$router.push('/vision')">
          <el-icon><Camera /></el-icon> 新诊断
        </el-button>
      </template>
    </ContentHeader>

    <!-- 统计摘要 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ store.totalCount }}</span>
        <span class="stat-label">总诊断</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select
        v-model="store.filters.cropType"
        placeholder="全部作物"
        clearable
        size="small"
        class="filter-select"
      >
        <el-option
          v-for="crop in store.cropTypes"
          :key="crop"
          :label="crop"
          :value="crop"
        />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        class="filter-date"
        value-format="YYYY-MM-DD"
        @change="onDateChange"
      />
    </div>

    <!-- 列表 -->
    <div class="diagnosis-list" v-if="store.filteredRecords.length > 0">
      <DiagnosisCard
        v-for="record in store.filteredRecords"
        :key="record.id"
        :record="record"
        @click="goDetail(record)"
      />
    </div>

    <!-- 加载中 -->
    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无诊断记录">
        <el-button type="primary" @click="$router.push('/vision')">
          开始第一次诊断
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Camera } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import DiagnosisCard from '@/components/diagnosis/DiagnosisCard.vue'
import { useDiagnosisStore } from '@/stores/diagnosis'

const store = useDiagnosisStore()
const router = useRouter()

const dateRange = ref(null)

onMounted(async () => {
  await Promise.all([store.fetchRecords(), store.fetchStats()])
})

const onDateChange = (val) => {
  if (val && val.length === 2) {
    store.setFilter('dateFrom', val[0])
    store.setFilter('dateTo', val[1])
  } else {
    store.setFilter('dateFrom', '')
    store.setFilter('dateTo', '')
  }
}

const goDetail = (record) => {
  router.push({ name: 'diagnosisDetail', params: { diagnosisId: record.id } })
}
</script>

<style lang="scss" scoped>
.diagnosis-index {
  padding-bottom: 20px;
}

.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1px solid $border;
  padding: 16px 0;
  margin: 0 24px 16px;

  @include mobile {
    margin: 0 16px 12px;
  }
}

.stat-item {
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
  font-size: 12px;
  color: $text-tertiary;
  margin-top: 2px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  @include mobile {
    padding: 0 16px;
    gap: 8px;
  }
}

.filter-select {
  width: 120px;

  @include mobile {
    width: 100px;
  }
}

.filter-date {
  @include mobile {
    width: 100% !important;
  }
}

.diagnosis-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
  min-height: 120px;
}

.empty-state {
  padding: 40px 0;
}
</style>
