<script setup>
import { Monitor, Reading, Sunny } from '@element-plus/icons-vue'
import { markRaw } from 'vue'

const features = [
  {
    name: 'Agent小农',
    desc: '农业 AI 智能体，全链路种植助手',
    icon: markRaw(Sunny),
    path: '/agent',
    color: '#4a9b5e',
  },

  {
    name: '知识库',
    desc: '病虫害百科与防治方案查询',
    icon: markRaw(Reading),
    path: '/knowledge',
    color: '#d4920b',
  },
  {
    name: '我的农场',
    desc: '农田地块管理与作物记录',
    icon: markRaw(Monitor),
    path: '/farm',
    color: '#b05cc5',
  },
]
</script>

<template>
  <div class="feature-grid">
    <router-link
      v-for="item in features"
      :key="item.path"
      :to="item.path"
      class="feature-card"
    >
      <div class="feature-icon-wrap" :style="{ background: item.color + '14', color: item.color }">
        <el-icon :size="26">
          <component :is="item.icon" />
        </el-icon>
      </div>
      <div class="feature-info">
        <span class="feature-name">{{ item.name }}</span>
        <span class="feature-desc">{{ item.desc }}</span>
      </div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.feature-card {
  background: #fff;
  border: 1px solid $border;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 24px 16px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  @include mobile {
    flex-direction: row;
    text-align: left;
    padding: 16px 14px;
    gap: 12px;
  }
}

.feature-icon-wrap {
  @include flex-center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  flex-shrink: 0;

  @include mobile {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
}

.feature-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.feature-name {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4px;

  @include mobile {
    font-size: 14px;
  }
}

.feature-desc {
  font-size: 12px;
  color: $text-tertiary;
  @include text-ellipsis(1);

  @include mobile {
    font-size: 11px;
  }
}
</style>
