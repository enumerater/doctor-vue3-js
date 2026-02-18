<template>
  <PageLayout title="我的农场" :showBack="true">
    <template #actions>
      <button class="add-btn" @click="goCreate">
        <van-icon name="plus" /> 新建农场
      </button>
    </template>

    <div class="farm-index">
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
      <van-loading v-else-if="store.loading" class="loading-center" />

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="还没有创建农场">
          <van-button type="primary" class="empty-btn" @click="goCreate">
            创建第一个农场
          </van-button>
        </van-empty>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageLayout from '@/components/shared/PageLayout.vue'
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: none;
  background: $primary;
  color: #fff;
  border-radius: $radius-sm;
  font-size: 13px;
  cursor: pointer;
  transition: $transition-fast;

  &:active { transform: scale(0.95); }
}

.farm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-state {
  padding: 40px 0;
}

.empty-btn {
  background: $primary;
  border-color: $primary;
  border-radius: $radius-sm;
}
</style>
