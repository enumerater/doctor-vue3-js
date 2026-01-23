// stores/sidebar.js（Pinia示例）
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    showLeft: false,
  }),
  actions: {
    toggleLeft(visible) {
      this.showLeft = visible
    },
    closeLeft() {
      this.showLeft = false
    },
  },
})
