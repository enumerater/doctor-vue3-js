import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/axios/farm_records'

export const useFarmRecordsStore = defineStore('farm_records', () => {
  const pesticideRecords = ref([])
  const fieldNotes = ref([])
  const loading = ref(false)

  // 施药管理
  async function fetchPesticideRecords(plotId) {
    loading.value = true
    try {
      const res = await api.getPesticideRecords(plotId)
      pesticideRecords.value = res.data || []
    } finally {
      loading.value = false
    }
  }

  async function addPesticideRecord(plotId, data) {
    const res = await api.createPesticideRecord(plotId, data)
    if (res.code === 200) await fetchPesticideRecords(plotId)
    return res
  }

  async function updatePesticideRecord(plotId, recordId, data) {
    const res = await api.updatePesticideRecord(plotId, recordId, data)
    if (res.code === 200) await fetchPesticideRecords(plotId)
    return res
  }

  async function updateEffect(plotId, recordId, data) {
    const res = await api.updatePesticideEffect(plotId, recordId, data)
    if (res.code === 200) await fetchPesticideRecords(plotId)
    return res
  }

  // 田间随笔
  async function fetchFieldNotes(plotId, params) {
    loading.value = true
    try {
      const res = await api.getFieldNotes(plotId, params)
      fieldNotes.value = res.data?.list || res.data || []
    } finally {
      loading.value = false
    }
  }

  async function addFieldNote(plotId, data) {
    const res = await api.createFieldNote(plotId, data)
    if (res.code === 200) await fetchFieldNotes(plotId)
    return res
  }

  async function updateFieldNote(plotId, noteId, data) {
    const res = await api.updateFieldNote(plotId, noteId, data)
    if (res.code === 200) await fetchFieldNotes(plotId)
    return res
  }

  async function deleteNote(plotId, noteId) {
    await api.deleteFieldNote(plotId, noteId)
    fieldNotes.value = fieldNotes.value.filter(n => n.id !== noteId)
  }

  return {
    pesticideRecords,
    fieldNotes,
    loading,
    fetchPesticideRecords,
    addPesticideRecord,
    updatePesticideRecord,
    updateEffect,
    fetchFieldNotes,
    addFieldNote,
    updateFieldNote,
    deleteNote
  }
})
