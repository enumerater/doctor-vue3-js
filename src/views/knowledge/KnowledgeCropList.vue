<template>
  <PageLayout :title="cropName + ' - 病害列表'" :showBack="true">
    <div class="crop-list-page">
      <div class="list-header">
        <span class="total-count">共 {{ store.currentCropTotal }} 种病害</span>
      </div>

      <div class="disease-list" v-if="store.currentCropDiseases.length > 0">
        <DiseaseCard
          v-for="disease in store.currentCropDiseases"
          :key="disease.id"
          :disease="disease"
          @click="goDetail(disease)"
        />
      </div>

      <van-loading v-else-if="store.loading" class="loading-center" />

      <van-empty v-else description="暂无病害数据" />
    </div>
  </PageLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/shared/PageLayout.vue'
import DiseaseCard from '@/components/knowledge/DiseaseCard.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const route = useRoute()
const router = useRouter()
const store = useKnowledgeStore()

const cropName = route.params.cropName

onMounted(() => {
  store.fetchDiseasesByCrop(cropName)
})

const goDetail = (disease) => {
  router.push({ name: 'knowledgeDetail', params: { diseaseId: disease.id } })
}
</script>

<style lang="scss" scoped>
.crop-list-page {
  padding-bottom: 20px;
}

.list-header {
  margin-bottom: 14px;
}

.total-count {
  font-size: 13px;
  color: $text-tertiary;
}

.disease-list {
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
