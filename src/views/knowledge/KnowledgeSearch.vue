<template>
  <div class="search-page">
    <ContentHeader title="搜索病害" show-back />

    <div class="page-body">
      <el-input
        v-model="keyword"
        placeholder="输入病害名称、作物或类型..."
        clearable
        :prefix-icon="Search"
        size="large"
        autofocus
        @keyup.enter="doSearch"
        @input="onInput"
        class="search-bar"
      />

      <!-- 搜索结果 -->
      <div class="result-section" v-if="store.searchResults.length > 0">
        <div class="result-header">
          <span class="result-count">找到 {{ store.searchTotal }} 个结果</span>
        </div>
        <div class="result-list">
          <template v-for="disease in store.searchResults" :key="disease.id">
            <DiseaseCard
              :disease="disease"
              :expanded="expandedId === disease.id"
              @click="toggleExpand(disease.id)"
            />
            <Transition name="detail-slide">
              <DiseaseDetail
                v-if="expandedId === disease.id"
                :disease="disease"
              />
            </Transition>
          </template>
        </div>
        <div class="pagination-wrap" v-if="store.searchTotal > store.searchPageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="store.searchTotal"
            :page-size="store.searchPageSize"
            :current-page="store.searchPage"
            @current-change="onPageChange"
          />
        </div>
      </div>

      <!-- 加载中 -->
      <div v-else-if="store.loading" v-loading="true" class="loading-center" />

      <!-- 空状态 -->
      <el-empty
        v-else-if="searched && keyword"
        description="未找到相关病害"
      />

      <!-- 初始提示 -->
      <div v-else class="search-hint">
        <div class="hint-icon">🔍</div>
        <p class="hint-text">输入关键词搜索病害</p>
        <div class="hint-tags">
          <el-tag
            v-for="tag in hotTags"
            :key="tag"
            class="hint-tag"
            effect="light"
            round
            @click="quickSearch(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import DiseaseCard from '@/components/knowledge/DiseaseCard.vue'
import DiseaseDetail from '@/components/knowledge/DiseaseDetail.vue'
import { useKnowledgeStore } from '@/stores/knowledge'

const route = useRoute()
const store = useKnowledgeStore()

const keyword = ref('')
const searched = ref(false)
const expandedId = ref(null)
let searchTimer = null

const hotTags = ['白粉病', '锈病', '霜霉病', '晚疫病', '蚜虫', '灰霉病']

onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q
    doSearch()
  }
})

const doSearch = () => {
  if (!keyword.value.trim()) return
  searched.value = true
  expandedId.value = null
  store.searchDiseases(keyword.value.trim())
}

const onInput = (val) => {
  clearTimeout(searchTimer)
  if (!val.trim()) {
    store.searchResults = []
    searched.value = false
    expandedId.value = null
    return
  }
  searchTimer = setTimeout(() => {
    doSearch()
  }, 400)
}

const quickSearch = (tag) => {
  keyword.value = tag
  doSearch()
}

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const onPageChange = (page) => {
  expandedId.value = null
  store.changeSearchPage(page)
}
</script>

<style lang="scss" scoped>
.search-page {
  padding-bottom: 20px;
}

.page-body {
  padding: 0 24px;

  @include mobile {
    padding: 0 16px;
  }
}

.search-bar {
  margin-bottom: 16px;

  :deep(.el-input__wrapper) {
    border-radius: $radius-xl;
    background: $bg-card;
    border: 1px solid $border;
    box-shadow: none;
  }
}

.result-header {
  margin-bottom: 12px;
}

.result-count {
  font-size: 13px;
  color: $text-tertiary;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 10px;
}

// DiseaseDetail 展开动画
.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.detail-slide-enter-from,
.detail-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.detail-slide-enter-to,
.detail-slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}

// 搜索提示
.search-hint {
  text-align: center;
  padding: 60px 20px;
}

.hint-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.hint-text {
  font-size: 14px;
  color: $text-tertiary;
  margin: 0 0 20px;
}

.hint-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.hint-tag {
  cursor: pointer;
  transition: $transition-fast;
  font-size: 13px;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.95);
  }
}

.loading-center {
  min-height: 200px;
}
</style>
