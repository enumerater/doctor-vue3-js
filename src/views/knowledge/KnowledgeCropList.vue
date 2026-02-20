<template>
  <div class="crop-list-page">
    <ContentHeader :title="cropName + ' - 病害列表'" show-back />

    <div class="page-body">
      <div class="list-header">
        <span class="total-count">共 {{ store.currentCropTotal }} 种病害</span>
      </div>

      <div class="disease-list" v-if="store.currentCropDiseases.length > 0">
        <DiseaseCard v-for="disease in store.currentCropDiseases" :key="disease.id" :disease="disease"
          @click="goDetail(disease)" />
      </div>

      <div v-else-if="store.loading" v-loading="true" class="loading-center" />

      <el-empty v-else description="暂无病害数据" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentHeader from '@/components/layout/ContentHeader.vue'
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

.page-body {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
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
  min-height: 200px;
}
</style>
