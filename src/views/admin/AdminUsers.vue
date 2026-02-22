<template>
  <div class="admin-users">
    <h2 class="page-title">用户管理</h2>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名..."
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
        style="max-width: 280px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="handleSearch" style="width: 120px;">
        <el-option label="正常" value="active" />
        <el-option label="已禁用" value="disabled" />
      </el-select>
      <el-select v-model="filterRole" placeholder="角色筛选" clearable @change="handleSearch" style="width: 120px;">
        <el-option label="普通用户" value="user" />
        <el-option label="管理员" value="admin" />
      </el-select>
    </div>

    <!-- 用户表格 -->
    <div class="table-card">
      <el-table :data="store.users" v-loading="store.loading" stripe>
        <el-table-column prop="username" label="用户名" min-width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="diagnosisCount" label="诊断次数" width="100" />
        <el-table-column prop="lastLogin" label="最后登录" min-width="140">
          <template #default="{ row }">
            {{ formatDate(row.lastLogin) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" min-width="140">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'admin'"
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              text
              @click="handleToggle(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="total-info">共 {{ store.usersTotal }} 名用户</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin'

const store = useAdminStore()
const keyword = ref('')
const filterStatus = ref('')
const filterRole = ref('')

onMounted(() => {
  handleSearch()
})

const handleSearch = () => {
  const params = {}
  if (keyword.value) params.keyword = keyword.value
  if (filterStatus.value) params.status = filterStatus.value
  if (filterRole.value) params.role = filterRole.value
  store.fetchUsers(params)
}

const handleToggle = async (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, `${action}用户`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await store.toggleUserStatus(row.id)
    ElMessage.success(`已${action}`)
  } catch {
    // cancelled
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.admin-users {
  max-width: 1200px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-card {
  @include card-base;
  overflow: hidden;

  :deep(.el-table) {
    --el-table-border-color: #{$border};
    --el-table-header-bg-color: #{$bg-main};
  }
}

.total-info {
  margin-top: 12px;
  font-size: 13px;
  color: $text-tertiary;
  text-align: right;
}

.text-muted {
  color: $text-tertiary;
  font-size: 13px;
}
</style>
