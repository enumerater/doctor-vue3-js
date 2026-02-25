<template>
  <div class="admin-knowledge">
    <div class="page-header">
      <h2 class="page-title">知识库管理</h2>
      <el-button type="primary" @click="openCreate">
        <el-icon>
          <Plus />
        </el-icon>
        新增病害
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="搜索病害名称或作物..." clearable @clear="handleSearch"
        @keyup.enter="handleSearch" style="width: 240px;">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
      <!-- <el-select v-model="filters.cropName" placeholder="作物筛选" clearable @change="handleSearch" style="width: 130px;">
        <el-option v-for="c in cropOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="filters.category" placeholder="分类筛选" clearable @change="handleSearch" style="width: 130px;">
        <el-option label="真菌" value="真菌" />
        <el-option label="细菌" value="细菌" />
        <el-option label="病毒" value="病毒" />
        <el-option label="虫害" value="虫害" />
        <el-option label="生理性" value="生理性" />
      </el-select> -->
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="store.knowledgeList" v-loading="store.loading" stripe height="100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="diseaseName" label="病害名称" width="160" show-overflow-tooltip />
        <el-table-column prop="cropName" label="作物" width="90" />
        <el-table-column prop="category" label="分类" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="categoryTagType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chineseName" label="中文名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="englishName" label="英文名" min-width="120" show-overflow-tooltip />

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
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50]"
        :total="store.knowledgeTotal" layout="total, sizes, prev, pager, next" @current-change="handlePageChange"
        @size-change="handleSizeChange" />
    </div>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingItem ? '编辑病害' : '新增病害'" width="680px" @closed="resetForm"
      destroy-on-close>
      <el-form :model="form" label-position="top" class="knowledge-form">
        <!-- 基本信息 -->
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="病害名称" required>
              <el-input v-model="form.diseaseName" placeholder="如：小麦锈病" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属作物" required>
              <el-input v-model="form.cropName" placeholder="如：小麦" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="中文名">
              <el-input v-model="form.chineseName" placeholder="如：小麦条锈病" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名">
              <el-input v-model="form.englishName" placeholder="如：Wheat Stripe Rust" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <div class="form-section-title">简介</div>
        <el-form-item>
          <el-input v-model="form.introduction" type="textarea" :rows="3" placeholder="病害简介描述" />
        </el-form-item>

        <!-- 症状特征 -->
        <div class="form-section-title">症状特征</div>
        <el-form-item>
          <el-input v-model="form.symbol" type="textarea" :rows="3" placeholder="典型症状特征描述" />
        </el-form-item>

        <!-- 发病因素 -->
        <div class="form-section-title">发病因素</div>
        <el-form-item>
          <el-input v-model="form.factor" type="textarea" :rows="3" placeholder="发病因素描述" />
        </el-form-item>

        <!-- 防治方法 -->
        <div class="form-section-title">防治方法</div>
        <el-form-item>
          <el-input v-model="form.prevention" type="textarea" :rows="4" placeholder="防治方法描述" />
        </el-form-item>

        <!-- 病害图片 -->
        <div class="form-section-title">病害图片</div>
        <el-form-item>
          <el-input v-model="form.pics" type="textarea" :rows="2" placeholder="图片URL，每行一个或用逗号分隔" />
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
const pageSize = ref(20)

const cropOptions = ['小麦', '水稻', '玉米', '番茄', '黄瓜', '辣椒', '草莓', '苹果', '葡萄', '白菜']

const filters = reactive({
  keyword: '',
  cropName: '',
  category: '',
})

const defaultForm = {
  diseaseName: '',
  cropName: '',
  category: '真菌',
  chineseName: '',
  englishName: '',
  introduction: '',
  symbol: '',
  factor: '',
  prevention: '',
  pics: '',
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
  const params = { page: currentPage.value, pageSize: pageSize.value }
  if (filters.keyword) params.keyword = filters.keyword
  if (filters.cropName) params.cropName = filters.cropName
  if (filters.category) params.category = filters.category
  store.fetchKnowledge(params)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

const openCreate = () => {
  editingItem.value = null
  Object.assign(form, defaultForm)
  dialogVisible.value = true
}

const openEdit = (row) => {
  editingItem.value = row
  // parsedPics 已在 store 中解析好
  const picsArr = row.parsedPics || []
  Object.assign(form, {
    diseaseName: row.diseaseName || '',
    cropName: row.cropName || '',
    category: row.category || '真菌',
    chineseName: row.chineseName || '',
    englishName: row.englishName || '',
    introduction: row.introduction || '',
    symbol: row.symbol || '',
    factor: row.factor || '',
    prevention: row.prevention || '',
    pics: picsArr.join('\n'),
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除「${row.diseaseName}」吗？`, '删除确认', {
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
  if (!form.diseaseName || !form.cropName) {
    ElMessage.warning('请填写病害名称和所属作物')
    return
  }
  saving.value = true
  try {
    const data = { ...form }
    // pics: 将换行/逗号分隔的URL转为JSON数组字符串，匹配后端字段格式
    const picsArr = data.pics
      ? data.pics.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
      : []
    data.pics = JSON.stringify(picsArr)

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
  const map = { 真菌: 'primary', 细菌: 'warning', 病毒: 'danger', 虫害: 'success', 生理性: 'info' }
  return map[cat] || 'info'
}
</script>

<style lang="scss" scoped>
.admin-knowledge {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);

  @include mobile {
    height: calc(100vh - 82px);
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
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
  margin-bottom: 12px;
  flex-shrink: 0;
}

.table-card {
  @include card-base;
  flex: 1;
  min-height: 0;
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
  padding-top: 12px;
  flex-shrink: 0;
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
