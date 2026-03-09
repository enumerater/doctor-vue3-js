<template>
  <div class="farm-calendar-container">
    <el-calendar v-model="selectedDate">
      <template #date-cell="{ data }">
        <div class="calendar-cell" :class="{ 'is-selected': data.isSelected }">
          <div class="day-num">{{ data.day.split('-').slice(2).join('') }}</div>
          <div class="event-dots">
            <span v-if="hasEvent(data.day, 'pesticide')" class="dot pesticide"></span>
            <span v-if="hasEvent(data.day, 'note')" class="dot note"></span>
          </div>
        </div>
      </template>
    </el-calendar>

    <div class="day-details" v-if="selectedDayEvents.length > 0">
      <div class="details-header">
        <el-icon><Calendar /></el-icon>
        <span>{{ selectedDateStr }} 农事记录</span>
      </div>
      <div class="events-timeline">
        <div 
          v-for="event in selectedDayEvents" 
          :key="event.id" 
          class="event-item" 
          :class="event.type"
          @click="handleEventClick(event)"
        >
          <div class="event-icon">
            <el-icon v-if="event.type === 'pesticide'"><Aim /></el-icon>
            <el-icon v-else><EditPen /></el-icon>
          </div>
          <div class="event-info">
            <div class="time">{{ event.time || '全天' }}</div>
            <div class="title">{{ event.title }}</div>
            <div class="desc">{{ event.content }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-details">
      <div class="empty-icon">📅</div>
      <p>{{ selectedDateStr }} 暂无记录</p>
      <el-button type="primary" link @click="$emit('add-record', selectedDateStr)">去记录一项</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar, Aim, EditPen } from '@element-plus/icons-vue'

const props = defineProps({
  pesticideRecords: { type: Array, default: () => [] },
  fieldNotes: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-record', 'view-detail'])

const selectedDate = ref(new Date())
const selectedDateStr = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const allEvents = computed(() => {
  const events = []
  props.pesticideRecords.forEach(r => {
    events.push({
      id: `p-${r.id}`,
      date: r.applicationDate,
      type: 'pesticide',
      title: `施用: ${r.medicineName}`,
      content: `${r.purpose || '常规作业'} - ${r.dosage}${r.unit}`,
      raw: r
    })
  })
  props.fieldNotes.forEach(n => {
    events.push({
      id: `n-${n.id}`,
      date: n.date,
      type: 'note',
      title: '田间随笔',
      content: n.content,
      raw: n
    })
  })
  return events
})

const hasEvent = (dayStr, type) => {
  return allEvents.value.some(e => e.date === dayStr && e.type === type)
}

const selectedDayEvents = computed(() => {
  return allEvents.value.filter(e => e.date === selectedDateStr.value)
})

const handleEventClick = (event) => {
  emit('view-detail', event)
}
</script>

<style lang="scss" scoped>
.farm-calendar-container {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

:deep(.el-calendar) {
  --el-calendar-border: none;
  --el-calendar-selected-bg-color: transparent;
  
  .el-calendar-table .el-calendar-day {
    height: 70px;
    padding: 4px;
    &:hover { background: #f0fdf4; }
  }

  .el-calendar__header {
    padding: 20px 24px;
    border-bottom: 1px solid #f3f4f6;
  }
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  transition: all 0.2s;

  &.is-selected {
    background: rgba($primary, 0.1);
    border: 1px solid rgba($primary, 0.2);
    .day-num { color: $primary; font-weight: 800; }
  }

  .day-num { font-size: 16px; color: $text-primary; }
  
  .event-dots {
    display: flex;
    gap: 3px;
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      &.pesticide { background: #fbbf24; }
      &.note { background: $primary; }
    }
  }
}

.day-details {
  padding: 24px;
  border-top: 1px solid #f3f4f6;
  background: #fafcfb;

  .details-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 20px;
    .el-icon { color: $primary; }
  }
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: white;
  border-radius: 16px;
  border-left: 4px solid #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  &.pesticide { border-left-color: #fbbf24; .event-icon { color: #fbbf24; background: rgba(#fbbf24, 0.1); } }
  &.note { border-left-color: $primary; .event-icon { color: $primary; background: rgba($primary, 0.1); } }

  .event-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    @include flex-center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .event-info {
    .time { font-size: 11px; color: $text-tertiary; margin-bottom: 2px; }
    .title { font-size: 14px; font-weight: 700; color: $text-primary; }
    .desc { font-size: 13px; color: $text-secondary; margin-top: 4px; line-height: 1.5; }
  }
}

.empty-details {
  text-align: center;
  padding: 40px 20px;
  background: #fafcfb;
  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
  p { font-size: 14px; color: $text-tertiary; margin-bottom: 12px; }
}
</style>
