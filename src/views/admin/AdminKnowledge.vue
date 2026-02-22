<template>
  <div class="admin-knowledge">
    <div class="page-header">
      <h2 class="page-title">知识库管理</h2>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        新增病害
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索病害名称或作物..."
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
        style="width: 240px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filters.cropName" placeholder="作物筛选" clearable @change="handleSearch" style="width: 130px;">
        <el-option v-for="c in cropOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="filters.category" placeholder="分类筛选" clearable @change="handleSearch" style="width: 130px;">
        <el-option label="真菌" value="真菌" />
        <el-option label="细菌" value="细菌" />
        <el-option label="病毒" value="病毒" />
        <el-option label="虫害" value="虫害" />
        <el-option label="生理性" value="生理性" />
      </el-select>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="store.knowledgeList" v-loading="store.loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="病害名称" min-width="140" />
        <el-table-column prop="cropName" label="作物" width="90" />
        <el-table-column prop="category" label="分类" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="categoryTagType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重度" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="severityTagType(row.severity)">{{ row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" text @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="table-footer">
      <span class="total-info">共 {{ store.knowledgeTotal }} 条记录</span>
      <el-pagination
        v-if="store.knowledgeTotal > pageSize"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="store.knowledgeTotal"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新建/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? '编辑病害' : '新增病害'"
      width="680px"
      @closed="resetForm"
      destroy-on-close
    >
      <el-form :model="form" label-position="top" class="knowledge-form">
        <!-- 基本信息 -->
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="病害名称" required>
              <el-input v-model="form.name" placeholder="如：小麦锈病" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属作物" required>
              <el-input v-model="form.cropName" placeholder="如：小麦" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分类">
              <el-select v-model="form.category" style="width: 100%;">
                <el-option label="真菌" value="真菌" />
                <el-option label="细菌" value="细菌" />
                <el-option label="病毒" value="病毒" />
                <el-option label="虫害" value="虫害" />
                <el-option label="生理性" value="生理性" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="严重度">
              <el-select v-model="form.severity" style="width: 100%;">
                <el-option label="轻" value="轻" />
                <el-option label="中" value="中" />
                <el-option label="重" value="重" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 症状描述 -->
        <div class="form-section-title">症状描述</div>
        <el-form-item>
          <el-input v-model="form.symptomsText" type="textarea" :rows="3" placeholder="典型症状描述" />
        </el-form-item>

        <!-- 发病条件 -->
        <div class="form-section-title">发病条件</div>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="适宜温度">
              <el-input v-model="form.conditionsTemperature" placeholder="如：10-20°C" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="适宜湿度">
              <el-input v-model="form.conditionsHumidity" placeholder="如：> 80%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="高发季节">
              <el-input v-model="form.conditionsSeason" placeholder="如：春季(3-5月)" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="易感生育期">
              <el-input v-model="form.conditionsStage" placeholder="如：拔节期至灌浆期" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 传播途径 -->
        <div class="form-section-title">传播途径</div>
        <el-form-item>
          <el-input v-model="form.transmission" type="textarea" :rows="2" placeholder="传播途径描述" />
        </el-form-item>

        <!-- 防治方法 -->
        <div class="form-section-title">防治方法</div>
        <el-form-item label="农业防治">
          <el-input v-model="form.preventionAgricultural" type="textarea" :rows="2" placeholder="农业防治措施" />
        </el-form-item>
        <el-form-item label="化学防治">
          <el-input v-model="form.preventionChemical" type="textarea" :rows="2" placeholder="化学防治方法及用药" />
        </el-form-item>
        <el-form-item label="生物防治">
          <el-input v-model="form.preventionBiological" type="textarea" :rows="2" placeholder="生物防治方法" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()
const dialogVisible = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const currentPage = ref(1)
const pageSize = 20

const cropOptions = ['小麦', '水稻', '玉米', '番茄', '黄瓜', '辣椒', '草莓', '苹果', '葡萄', '白菜']

const filters = reactive({
  keyword: '',
  cropName: '',
  category: '',
})

const defaultForm = {
  name: '',
  cropName: '',
  category: '真菌',
  severity: '中',
  symptomsText: '',
  conditionsTemperature: '',
  conditionsHumidity: '',
  conditionsSeason: '',
  conditionsStage: '',
  transmission: '',
  preventionAgricultural: '',
  preventionChemical: '',
  preventionBiological: '',
}

const form = reactive({ ...defaultForm })

onMounted(() => {
  handleSearch()
})

const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

const fetchList = () => {
  const params = { page: currentPage.value, pageSize }
  if (filters.keyword) params.keyword = filters.keyword
  if (filters.cropName) params.cropName = filters.cropName
  if (filters.category) params.category = filters.category
  store.fetchKnowledge(params)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

const openCreate = () => {
  editingItem.value = null
  Object.assign(form, defaultForm)
  dialogVisible.value = true
}

const openEdit = (row) => {
  editingItem.value = row
  Object.assign(form, {
    name: row.name || '',
    cropName: row.cropName || '',
    category: row.category || '真菌',
    severity: row.severity || '中',
    symptomsText: row.symptomsText || '',
    conditionsTemperature: row.conditionsTemperature || '',
    conditionsHumidity: row.conditionsHumidity || '',
    conditionsSeason: row.conditionsSeason || '',
    conditionsStage: row.conditionsStage || '',
    transmission: row.transmission || '',
    preventionAgricultural: row.preventionAgricultural || '',
    preventionChemical: row.preventionChemical || '',
    preventionBiological: row.preventionBiological || '',
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await store.deleteKnowledge(row.id)
    ElMessage.success('已删除')
  } catch {
    // cancelled
  }
}

const handleSave = async () => {
  if (!form.name || !form.cropName) {
    ElMessage.warning('请填写病害名称和所属作物')
    return
  }
  saving.value = true
  try {
    const data = { ...form }
    if (editingItem.value) {
      await store.updateKnowledge(editingItem.value.id, data)
      ElMessage.success('已更新')
    } else {
      await store.createKnowledge(data)
      ElMessage.success('已创建')
    }
    dialogVisible.value = false
    fetchList()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingItem.value = null
  Object.assign(form, defaultForm)
}

const categoryTagType = (cat) => {
  const map = { 真菌: '', 细菌: 'warning', 病毒: 'danger', 虫害: 'success', 生理性: 'info' }
  return map[cat] || ''
}

const severityTagType = (sev) => {
  const map = { 轻: 'success', 中: 'warning', 重: 'danger' }
  return map[sev] || ''
}
</script>

<style lang="scss" scoped>
.admin-knowledge {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.table-card {
  @include card-base;
  overflow: hidden;

  :deep(.el-table) {
    --el-table-border-color: #{$border};
    --el-table-header-bg-color: #{$bg-main};
  }
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.total-info {
  font-size: 13px;
  color: $text-tertiary;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin: 16px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid $border;

  &:first-child {
    margin-top: 0;
  }
}

.knowledge-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
