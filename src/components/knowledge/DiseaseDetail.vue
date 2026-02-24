<template>
  <div class="disease-detail">
    <div v-if="disease.chineseName || disease.englishName" class="detail-names">
      <span v-if="disease.chineseName" class="name-cn">{{ disease.chineseName }}</span>
      <span v-if="disease.englishName" class="name-en">{{ disease.englishName }}</span>
    </div>

    <div v-if="disease.introduction" class="detail-block">
      <h4 class="block-title">简介</h4>
      <p class="block-text">{{ disease.introduction }}</p>
    </div>

    <div v-if="disease.parsedPics && disease.parsedPics.length > 0" class="detail-block">
      <h4 class="block-title">病害图片</h4>
      <div class="pics-grid">
        <el-image
          v-for="(pic, idx) in disease.parsedPics"
          :key="idx"
          :src="pic"
          :preview-src-list="disease.parsedPics"
          :initial-index="idx"
          fit="cover"
          lazy
          class="pic-item"
        >
          <template #error>
            <div class="pic-error">
              <el-icon :size="24"><PictureFilled /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </div>

    <div v-if="disease.symbol" class="detail-block">
      <h4 class="block-title">症状特征</h4>
      <p class="block-text">{{ disease.symbol }}</p>
    </div>

    <div v-if="disease.factor" class="detail-block">
      <h4 class="block-title">发病因素</h4>
      <p class="block-text">{{ disease.factor }}</p>
    </div>

    <div v-if="disease.prevention" class="detail-block">
      <h4 class="block-title">防治方法</h4>
      <p class="block-text">{{ disease.prevention }}</p>
    </div>
  </div>
</template>

<script setup>
import { PictureFilled } from '@element-plus/icons-vue'

defineProps({
  disease: { type: Object, required: true },
})
</script>

<style lang="scss" scoped>
.disease-detail {
  background: $bg-card;
  border: 1px solid rgba($primary, 0.15);
  border-top: none;
  border-radius: 0 0 $radius-sm $radius-sm;
  padding: 16px;
}

.detail-names {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed $border;
}

.name-cn {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.name-en {
  font-size: 13px;
  color: $text-tertiary;
  font-style: italic;
}

.detail-block {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

.block-title {
  font-size: 13px;
  font-weight: 600;
  color: $primary;
  margin: 0 0 6px;
}

.block-text {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

// 图片网格
.pics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pic-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.pic-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: $text-tertiary;
}
</style>
