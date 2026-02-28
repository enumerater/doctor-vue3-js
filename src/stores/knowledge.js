import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/knowledge'

// 安全解析 pics JSON 字符串为数组
function parsePics(pics) {
  if (!pics) return []
  if (Array.isArray(pics)) return pics
  try {
    const parsed = JSON.parse(pics)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const useKnowledgeStore = defineStore('knowledge', () => {
  // ====== 导航状态 ======
  const currentLevel = ref(1)
  const selectedCategory = ref('')
  const selectedCropName = ref('')

  // ====== 数据状态 ======
  const categories = ref([])
  const cropNames = ref([])
  const allCrops = ref([]) // 所有作物名列表
  const diseases = ref([])
  const diseasesTotal = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ====== 展开状态 ======
  const expandedDiseaseId = ref(null)

  // ====== 加载状态 ======
  const loading = ref(false)

  // ====== 搜索状态 ======
  const searchResults = ref([])
  const searchKeyword = ref('')
  const searchTotal = ref(0)
  const searchPage = ref(1)
  const searchPageSize = ref(20)

  // ====== computed ======
  const breadcrumbs = computed(() => {
    const crumbs = [{ label: '知识库', level: 1 }]
    if (currentLevel.value >= 2) {
      crumbs.push({ label: selectedCategory.value, level: 2 })
    }
    if (currentLevel.value >= 3) {
      crumbs.push({ label: selectedCropName.value, level: 3 })
    }
    return crumbs
  })

  // ====== actions ======

  // 获取所有分类
  async function fetchCategories() {
    loading.value = true
    try {
      categories.value = await api.getCategories()
    } catch {
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  // 获取所有去重作物名
  async function fetchAllCrops() {
    loading.value = true
    try {
      allCrops.value = await api.getAllCrops()
    } catch {
      allCrops.value = []
    } finally {
      loading.value = false
    }
  }

  // 选择分类 → 进入 Level 2
  async function selectCategory(cat) {
    selectedCategory.value = cat
    currentLevel.value = 2
    expandedDiseaseId.value = null
    loading.value = true
    try {
      cropNames.value = await api.getCropNames(cat)
    } catch {
      cropNames.value = []
    } finally {
      loading.value = false
    }
  }

  // 选择作物 → 进入 Level 3
  async function selectCropName(name, page = 1) {
    selectedCropName.value = name
    currentLevel.value = 3
    currentPage.value = page
    expandedDiseaseId.value = null
    loading.value = true
    try {
      const res = await api.getDiseases({
        category: selectedCategory.value,
        cropName: selectedCropName.value,
        page,
        pageSize: pageSize.value,
      })
      diseases.value = (res.list || []).map((d) => ({
        ...d,
        parsedPics: parsePics(d.pics),
      }))
      diseasesTotal.value = res.total || 0
    } catch {
      diseases.value = []
      diseasesTotal.value = 0
    } finally {
      loading.value = false
    }
  }

  // 面包屑回退
  function navigateToLevel(level) {
    if (level >= currentLevel.value) return
    currentLevel.value = level
    expandedDiseaseId.value = null
    if (level <= 1) {
      selectedCategory.value = ''
      selectedCropName.value = ''
      cropNames.value = []
      diseases.value = []
    } else if (level <= 2) {
      selectedCropName.value = ''
      diseases.value = []
    }
  }

  // 切换内联展开
  function toggleDiseaseExpand(id) {
    expandedDiseaseId.value = expandedDiseaseId.value === id ? null : id
  }

  // 分页切换
  function changePage(page) {
    selectCropName(selectedCropName.value, page)
  }

  // 搜索病害
  async function searchDiseasesAction(keyword, page = 1) {
    if (!keyword.trim()) {
      searchResults.value = []
      searchTotal.value = 0
      return
    }
    loading.value = true
    searchKeyword.value = keyword
    searchPage.value = page
    try {
      const res = await api.searchDiseases(keyword, page, searchPageSize.value)
      const list = res.list || res
      searchResults.value = (Array.isArray(list) ? list : []).map((d) => ({
        ...d,
        parsedPics: parsePics(d.pics),
      }))
      searchTotal.value = res.total || 0
    } catch {
      searchResults.value = []
      searchTotal.value = 0
    } finally {
      loading.value = false
    }
  }

  // 搜索分页切换
  function changeSearchPage(page) {
    searchDiseasesAction(searchKeyword.value, page)
  }

  return {
    // state
    currentLevel,
    selectedCategory,
    selectedCropName,
    categories,
    cropNames,
    allCrops,
    diseases,
    diseasesTotal,
    currentPage,
    pageSize,
    expandedDiseaseId,
    loading,
    searchResults,
    searchKeyword,
    searchTotal,
    searchPage,
    searchPageSize,
    // computed
    breadcrumbs,
    // actions
    fetchCategories,
    fetchAllCrops,
    selectCategory,
    selectCropName,
    navigateToLevel,
    toggleDiseaseExpand,
    changePage,
    searchDiseases: searchDiseasesAction,
    changeSearchPage,
  }
})

export { parsePics }
