<template>
  <div class="hot-question-card">
    <h3 class="card-title">热门农业问题</h3>
    <div class="question-list">
      <div
        class="question-item"
        v-for="question in hotQuestions"
        :key="question.id"
        @click="handleQuestionClick(question.content)"
      >
        {{ question.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const hotQuestions = [
  { id: 1, content: '小麦常见病虫害有哪些？' },
  { id: 2, content: '大棚蔬菜如何控温？' },
  { id: 3, content: '水稻施肥的最佳时期？' },
]

function handleQuestionClick(content) {
  chatStore.handleHotQuestionClick(content)
}
</script>

<style lang="scss" scoped>
.hot-question-card {
  width: 100%;
  max-width: 31.25rem;
  margin-top: 0;
}

.card-title {
  font-size: 1.125rem;
  color: $text-primary;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid $primary-light;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.question-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.question-item {
  padding: 1rem;
  background-color: $primary-light;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: $transition;
  font-size: 0.9375rem;
  color: $text-primary;
  line-height: 1.6;
  border: 1px solid transparent;

  &:hover {
    background-color: #dcedc8;
    color: $primary-hover;
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
    border-color: rgba(56, 142, 60, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
}
</style>
