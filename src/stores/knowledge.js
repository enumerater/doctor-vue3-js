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

  // ====== 图谱状态 ======
  const graphData = ref({ nodes: [], links: [] })

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

  // 获取知识图谱
  async function fetchGraphData() {
    loading.value = true
    try {
      const res = await api.getGraphData()
      if (res && res.nodes) {
        graphData.value = res
      } else {
        throw new Error('Empty data')
      }
    } catch {
      // 降级使用 Mock 数据展示效果
      graphData.value = {
        nodes: [
          { id: 'c1', name: '柑橘', type: 'crop', value: 30, details: '柑橘是芸香科、柑橘属植物。性喜温暖湿润气候，耐寒性较差。' },
          { id: 'c2', name: '水稻', type: 'crop', value: 28, details: '水稻是草本稻属的一种，也是稻属中作为粮食的最主要最悠久的一种。' },
          { id: 'p1', name: '溃疡病', type: 'pest', value: 20, details: '柑橘溃疡病是国内外植物检疫对象。主要为害叶片、枝梢和果实。' },
          { id: 'p2', name: '稻飞虱', type: 'pest', value: 18, details: '稻飞虱是水稻的主要害虫之一。' },
          { id: 'm1', name: '波尔多液', type: 'pesticide', value: 15, details: '一种无机铜素杀菌剂，对多种真菌和细菌病害有防治作用。' },
          { id: 'm2', name: '吡虫啉', type: 'pesticide', value: 14, details: '属内吸性杀虫剂，具有广谱、高效、低残留等特点。' },
          { id: 's1', name: '惊蛰', type: 'solar_term', value: 22, details: '反映的是自然生物受节律变化影响而出现萌发生长的现象。' },
          { id: 's2', name: '谷雨', type: 'solar_term', value: 22, details: '谷雨是二十四节气之第6个节气，也是春季最后一个节气。' }
        ],
        links: [
          { source: 'c1', target: 'p1', relation: '常见病害' },
          { source: 'p1', target: 'm1', relation: '防治药剂' },
          { source: 'c1', target: 's1', relation: '物候期' },
          { source: 'c2', target: 'p2', relation: '常见害虫' },
          { source: 'p2', target: 'm2', relation: '防治药剂' },
          { source: 'c2', target: 's2', relation: '物候期' },
          { source: 'p1', target: 's1', relation: '高发期' }
        ]
      }
    } finally {
      loading.value = false
    }
  }

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
    graphData,
    searchResults,
    searchKeyword,
    searchTotal,
    searchPage,
    searchPageSize,
    // computed
    breadcrumbs,
    // actions
    fetchGraphData,
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
