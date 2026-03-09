<template>
  <div class="note-create-page">
    <ContentHeader :title="isEdit ? '编辑田间随笔' : '记录田间时光'" :showBack="true" />
    
    <div class="create-container">
      <div class="v2-editor card-box" v-loading="loading">
        <div class="editor-wrapper">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="12" 
            placeholder="今天在地里观察到了什么..." 
            class="v2-textarea" 
          />
          
          <Transition name="fade-slide">
            <div class="ai-tool-pill" v-if="form.content.length > 5 && !aiLoading" @click="handleAiPolish">
              <el-icon><MagicStick /></el-icon>
              <span>AI 润色</span>
            </div>
          </Transition>
          
          <div class="ai-loading-mini" v-if="aiLoading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在美化内容...</span>
          </div>
        </div>

        <div class="media-section">
          <label>添加田间实拍</label>
          <el-upload 
            action="#" 
            list-type="picture-card" 
            multiple 
            :auto-upload="false" 
            :file-list="fileList"
            class="v2-upload"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>

        <div class="date-section">
          <label>记录日期</label>
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="v2-date-picker"
          />
        </div>

        <div class="submit-bar">
          <el-button type="success" size="large" @click="submit" :loading="submitLoading" round class="submit-btn">
            {{ isEdit ? '保存修改' : '发布田间随笔' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MagicStick, Plus, Loading } from '@element-plus/icons-vue'
import ContentHeader from '@/components/layout/ContentHeader.vue'
import { useFarmRecordsStore } from '@/stores/farm_records'
import { generateAiNote } from '@/axios/farm_records'

const route = useRoute()
const router = useRouter()
const recordsStore = useFarmRecordsStore()
const plotId = route.params.plotId
const noteId = route.params.id
const isEdit = computed(() => !!noteId)
const loading = ref(false)
const submitLoading = ref(false)
const aiLoading = ref(false)
const fileList = ref([])

const form = reactive({
  content: '',
  images: [],
  date: route.query.date || new Date().toISOString().slice(0, 10),
  isAiGenerated: false
})

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const note = recordsStore.fieldNotes.find(n => String(n.id) === String(noteId))
      if (note) {
        Object.assign(form, note)
        if (note.images) {
          try {
            const imgs = typeof note.images === 'string' ? JSON.parse(note.images) : note.images
            fileList.value = imgs.map(url => ({ url }))
          } catch (e) {
            console.error('图片解析失败', e)
          }
        }
      }
    } finally {
      loading.value = false
    }
  }
})

const handleAiPolish = async () => {
  if (!form.content) return
  aiLoading.value = true
  try {
    const res = await generateAiNote({
      plotId,
      theme: '农事记录润色',
      keywords: [form.content]
    })
    if (res.code === 200) {
      form.content = res.data.suggestedContent
      form.isAiGenerated = true
      ElMessage.success('内容已优化')
    }
  } catch (err) {
    ElMessage.error('AI 生成失败')
  } finally {
    aiLoading.value = false
  }
}

const submit = async () => {
  if (!form.content) return ElMessage.warning('请输入随笔内容')
  submitLoading.value = true
  try {
    const payload = {
      plotId: parseInt(plotId),
      content: form.content,
      images: JSON.stringify(form.images),
      date: form.date,
      isAiGenerated: form.isAiGenerated,
      weatherInfo: form.weatherInfo || ""
    }
    
    if (isEdit.value) {
      await recordsStore.updateFieldNote(plotId, noteId, payload)
      ElMessage.success('更新成功')
    } else {
      await recordsStore.addFieldNote(plotId, payload)
      ElMessage.success('发布成功')
    }
    router.back()
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.note-create-page {
  min-height: 100vh;
  background: #f8faf9;
  padding-bottom: 40px;
}

.create-container {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.card-box {
  background: white;
  border-radius: 32px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
}

.editor-wrapper {
  position: relative;
  
  .ai-tool-pill {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: white;
    padding: 6px 14px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: $primary;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    cursor: pointer;
    border: 1px solid rgba($primary, 0.1);
    transition: all 0.3s;
    z-index: 10;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba($primary, 0.15);
      background: $primary;
      color: white;
    }
  }

  .ai-loading-mini {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: $text-tertiary;
    background: rgba(255,255,255,0.9);
    padding: 6px 14px;
    border-radius: 20px;
  }
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.media-section, .date-section {
  margin-top: 24px;
  label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: $text-secondary;
    margin-bottom: 12px;
  }
}

:deep(.v2-upload) {
  .el-upload--picture-card {
    border-radius: 20px;
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    &:hover { border-color: $primary; }
  }
  .el-upload-list__item { border-radius: 20px; }
}

.v2-date-picker {
  width: 100% !important;
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    background: #f9fafb;
    box-shadow: none;
    border: 1px solid #f3f4f6;
    height: 52px;
  }
}

.submit-bar {
  margin-top: 40px;
  .submit-btn {
    width: 100%;
    height: 56px;
    font-size: 17px;
    font-weight: 800;
    box-shadow: 0 10px 20px rgba(#10b981, 0.2);
  }
}
</style>
