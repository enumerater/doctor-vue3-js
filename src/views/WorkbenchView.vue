<script setup>
import WelcomeBanner from '@/components/workbench/WelcomeBanner.vue'
import QuickChatCard from '@/components/workbench/QuickChatCard.vue'
import QuickVisionCard from '@/components/workbench/QuickVisionCard.vue'
import FeatureGrid from '@/components/workbench/FeatureGrid.vue'
import RecentActivity from '@/components/workbench/RecentActivity.vue'
</script>

<template>
  <div class="workbench-page">
    <div class="page-container">
      <!-- Welcome Banner -->
      <WelcomeBanner class="section-banner" />

      <!-- Quick Action Cards Row -->
      <div class="quick-actions">
        <QuickChatCard class="quick-card" />
        <QuickVisionCard class="quick-card" />
      </div>

      <!-- Feature Grid -->
      <div class="section">
        <h2 class="section-title">功能导航</h2>
        <FeatureGrid />
      </div>

      <!-- Recent Activity -->
      <div class="section">
        <RecentActivity />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.workbench-page {
  min-height: 100%;
  background: linear-gradient(180deg, $bg-main 0%, #f0f7f2 100%);
}

.page-container {
  padding: 24px 24px 40px;
  max-width: 960px;
  margin: 0 auto;

  @include mobile {
    padding: 16px 16px 32px;
  }
}

.section-banner {
  margin-bottom: 24px;

  @include mobile {
    margin-bottom: 16px;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 28px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }
}

.section {
  margin-bottom: 28px;

  @include mobile {
    margin-bottom: 20px;
  }
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 16px;

  @include mobile {
    font-size: 15px;
    margin: 0 0 12px;
  }
}
</style>
