<template>
  <div class="farm-index">
    <ContentHeader title="我的农场">
      <template #actions>
        <el-button type="primary" size="small" @click="goCreate">
          <el-icon><Plus /></el-icon> 新建农场
        </el-button>
      </template>
    </ContentHeader>

    <!-- 农场列表 -->
    <div class="farm-list" v-if="store.farms.length > 0">
      <FarmCard
        v-for="farm in store.farms"
        :key="farm.id"
        :farm="farm"
        @click="goDetail(farm)"
      />
    </div>

    <!-- 加载中 -->
    <div v-else-if="store.loading" v-loading="true" class="loading-center"></div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="还没有创建农场">
        <el-button type="primary" @click="goCreate">
          创建第一个农场
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import FarmCard from '@/components/farm/FarmCard.vue'
import { useFarmStore } from '@/stores/farm'

const store = useFarmStore()
const router = useRouter()

onMounted(() => {
  store.fetchFarms()
})

const goCreate = () => {
  router.push({ name: 'farmCreate' })
}

const goDetail = (farm) => {
  router.push({ name: 'farmDetail', params: { farmId: farm.id } })
}
</script>

<style lang="scss" scoped>
.farm-index {
  padding-bottom: 20px;
}

.farm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
