<template>
  <div class="field-moment-card" @click="handleCardClick">
    <div class="moment-header">
      <div class="user-meta">
        <div class="avatar-box">
          <el-icon><User /></el-icon>
        </div>
        <div class="meta-info">
          <span class="user-name">我</span>
          <span class="time-stamp">{{ note.date }}</span>
        </div>
      </div>
      <div class="weather-pill" v-if="note.weatherInfo">
        <el-icon><PartlyCloudy /></el-icon>
        <span>{{ note.weatherInfo }}</span>
      </div>
    </div>

    <div class="moment-content">
      <p class="text">{{ note.content }}</p>
      
      <!-- 多图展示：根据数量自动适配布局 -->
      <div class="image-grid" :class="'count-' + Math.min(note.images?.length || 0, 9)" v-if="note.images?.length">
        <el-image 
          v-for="(img, i) in note.images" :key="i"
          :src="img" :preview-src-list="note.images"
          fit="cover" class="grid-img"
        />
      </div>
    </div>

    <div class="moment-footer">
      <div class="action-tags">
        <el-tag v-if="note.isAiGenerated" size="small" type="success" effect="plain" round>
          <el-icon><MagicStick /></el-icon> AI 润色
        </el-tag>
      </div>
      <div class="op-buttons">
        <el-button link type="danger" icon="Delete" @click="$emit('delete', note.id)">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, PartlyCloudy, MagicStick, Delete } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  note: { type: Object, required: true }
})

const router = useRouter()
const route = useRoute()

const handleCardClick = () => {
  router.push({
    name: 'fieldNoteEdit',
    params: { 
      farmId: route.params.farmId, 
      plotId: route.params.plotId,
      id: props.note.id 
    }
  })
}
</script>

<style lang="scss" scoped>
.field-moment-card {
  background: white;
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba($primary, 0.04);
  box-shadow: 0 12px 40px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 45px rgba(74, 155, 94, 0.1);
  }
}

.moment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;

  .user-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .avatar-box {
      width: 40px;
      height: 40px;
      background: $primary-light;
      border-radius: 50%;
      @include flex-center;
      color: $primary;
      font-size: 20px;
    }

    .meta-info {
      display: flex;
      flex-direction: column;
      .user-name { font-size: 15px; font-weight: 700; color: $text-primary; }
      .time-stamp { font-size: 11px; color: $text-tertiary; margin-top: 1px; }
    }
  }

  .weather-pill {
    background: #f0f7ff;
    color: #007aff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
}

.moment-content {
  .text {
    font-size: 15.5px;
    line-height: 1.75;
    color: #374151;
    margin: 0 0 16px;
    white-space: pre-wrap;
  }

  .image-grid {
    display: grid;
    gap: 8px;
    
    &.count-1 { grid-template-columns: 1fr; .grid-img { aspect-ratio: 16/9; max-height: 300px; } }
    &.count-2 { grid-template-columns: 1fr 1fr; }
    &.count-3 { grid-template-columns: 1fr 1fr 1fr; }
    &.count-4 { grid-template-columns: 1fr 1fr; }
    
    .grid-img {
      border-radius: 16px;
      aspect-ratio: 1;
      width: 100%;
      border: 1px solid #f3f4f6;
    }
  }
}

.moment-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .action-tags {
    .el-tag { font-weight: 600; padding: 0 10px; }
  }
}
</style>
